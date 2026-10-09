import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to create a client for a specific user
const getClient = (token) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });
};

async function runTests() {
  console.log("Starting End-to-End Tests...");
  const adminClient = createClient(supabaseUrl, supabaseKey);

  // 1. Verify schema (profiles table)
  console.log("\\n--- 1. Verification ---");
  const { error: schemaErr } = await adminClient.from('profiles').select('id').limit(1);
  if (schemaErr) {
    console.error("FAIL: Schema check failed.", schemaErr);
    return;
  }
  console.log("PASS: Schema exists.");

  // Create test users
  const timestamp = Date.now();
  const users = {
    hrd: { email: `hrd_${timestamp}@example.com`, password: 'password123', role: 'hrd' },
    trainer: { email: `trainer_${timestamp}@example.com`, password: 'password123', role: 'trainer' },
    student1: { email: `student1_${timestamp}@example.com`, password: 'password123', role: 'student' },
    student2: { email: `student2_${timestamp}@example.com`, password: 'password123', role: 'student' }
  };

  const sessions = {};
  console.log("\\n--- 2. Auth & Roles ---");
  for (const [key, user] of Object.entries(users)) {
    const { data, error } = await adminClient.auth.signUp({
      email: user.email,
      password: user.password
    });
    if (error) {
      console.error(`FAIL: SignUp failed for ${key}`, error.message);
      return;
    }
    if (!data.session) {
      console.error(`BLOCKED: SignUp succeeded but no session returned for ${key}. Email confirmation might be enabled.`);
      return;
    }
    sessions[key] = { client: getClient(data.session.access_token), id: data.user.id };
    
    // Verify role in profiles table
    const { data: profile } = await sessions[key].client.from('profiles').select('role').eq('id', data.user.id).single();
    if (!profile || profile.role !== user.role) {
      console.error(`FAIL: Role assignment failed for ${key}. Expected ${user.role}, got ${profile?.role}`);
      return;
    }
  }
  console.log("PASS: Users created and roles assigned successfully.");

  // 3. Trainer creates class and attendance
  console.log("\\n--- 3. Attendance & Absence Detection ---");
  const trainer = sessions['trainer'];
  const { data: newClass, error: classErr } = await trainer.client
    .from('classes')
    .insert({ name: 'Test Class', trainer_id: trainer.id })
    .select().single();
  
  if (classErr) {
    console.error("FAIL: Trainer could not create class", classErr);
  } else {
    // Enroll students
    await trainer.client.from('enrollments').insert([
      { class_id: newClass.id, student_id: sessions['student1'].id },
      { class_id: newClass.id, student_id: sessions['student2'].id }
    ]);

    // Mark attendance
    const { error: attErr } = await trainer.client.from('attendance').insert([
      { class_id: newClass.id, student_id: sessions['student1'].id, status: 'present', date: new Date().toISOString().split('T')[0] },
      { class_id: newClass.id, student_id: sessions['student2'].id, status: 'absent', date: new Date().toISOString().split('T')[0] }
    ]);
    if (attErr) console.error("FAIL: Trainer attendance insert failed", attErr);
    else console.log("PASS: Trainer successfully marked attendance.");
  }

  // 4. Student Permission Submission
  console.log("\\n--- 4. Permission Submission & HRD Approval ---");
  const student = sessions['student1'];
  const { data: request, error: reqErr } = await student.client
    .from('requests')
    .insert({ user_id: student.id, type: 'Leave', status: 'pending', description: 'Test Request' })
    .select().single();
  
  if (reqErr) {
    console.error("FAIL: Student request submission failed", reqErr);
  } else {
    console.log("PASS: Student successfully submitted a request.");
    
    // HRD Approves
    const hrd = sessions['hrd'];
    const { error: updateErr } = await hrd.client
      .from('requests')
      .update({ status: 'approved', comments: 'Approved by HRD' })
      .eq('id', request.id);
    
    if (updateErr) console.error("FAIL: HRD approval failed", updateErr);
    else console.log("PASS: HRD successfully approved the request.");

    // Check audit log
    const { data: logs, error: auditErr } = await hrd.client.from('audit_logs').select('*').limit(1);
    if (auditErr) console.error("FAIL: Audit log access failed", auditErr);
    else if (logs) console.log("PASS: HRD can access audit logs.");
  }

  // 5. Data Isolation
  console.log("\\n--- 5. Cross-Student Data Isolation ---");
  const student2 = sessions['student2'];
  const { data: st1Requests, error: isoErr } = await student2.client
    .from('requests')
    .select('*')
    .eq('user_id', student.id);
  
  if (isoErr) {
    console.error("FAIL: Data isolation check threw an error.", isoErr);
  } else if (st1Requests && st1Requests.length > 0) {
    console.error("FAIL: Student 2 was able to view Student 1's request! RLS is broken.");
  } else {
    console.log("PASS: Cross-student data isolation verified. Student 2 cannot see Student 1's requests.");
  }
}

runTests();
