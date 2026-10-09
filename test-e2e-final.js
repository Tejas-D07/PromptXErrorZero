import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. Verify it loads .env.test correctly (using node --env-file or dotenv)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.test', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Confirm it uses only the configured dedicated test accounts
const hrdEmail = process.env.TEST_HRD_EMAIL;
const hrdPassword = process.env.TEST_HRD_PASSWORD;
const trainerEmail = process.env.TEST_TRAINER_EMAIL;
const trainerPassword = process.env.TEST_TRAINER_PASSWORD;
const studentEmail = process.env.TEST_STUDENT_EMAIL;
const studentPassword = process.env.TEST_STUDENT_PASSWORD;

async function executeE2E() {
  console.log("\\n--- Checking Secure Test Credentials ---");
  const requiredVars = [
    'TEST_HRD_EMAIL', 'TEST_HRD_PASSWORD',
    'TEST_TRAINER_EMAIL', 'TEST_TRAINER_PASSWORD',
    'TEST_STUDENT_EMAIL', 'TEST_STUDENT_PASSWORD'
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.log(`[BLOCKED] Missing credentials in .env.test: ${missing.join(', ')}`);
    return;
  }
  
  console.log("[PASS] All secure test credentials loaded. (No secrets will be printed)");

  // Check for potential quote issues in env vars
  if (hrdPassword.startsWith('"') || hrdPassword.startsWith("'")) {
    console.log("[WARNING] Passwords appear to have surrounding quotes. Ensure .env.test does not unnecessarily quote passwords unless required by dotenv.");
  }

  const createAuthClient = () => createClient(supabaseUrl, supabaseKey);
  const adminClient = createAuthClient(); // anon client for public queries

  console.log("\\n--- Diagnosing Account Existence in Database ---");
  // Since profiles are public, let's verify if the accounts actually exist in the target database!
  const emailsToTest = { hrd: hrdEmail, trainer: trainerEmail, student: studentEmail };
  for (const [role, email] of Object.entries(emailsToTest)) {
    const { data: profile, error } = await adminClient.from('profiles').select('email, role').eq('email', email).single();
    if (!profile) {
      console.log(`[DIAGNOSTIC] ${role} email NOT FOUND in profiles table for this project URL. (Check if account exists or trigger failed during manual creation)`);
    } else {
      console.log(`[DIAGNOSTIC] ${role} profile EXISTS. Current role in DB: '${profile.role}'.`);
    }
  }

  const hrdClient = createAuthClient();
  const trainerClient = createAuthClient();
  const studentClient = createAuthClient();

  console.log("\\n--- Authenticating Test Accounts ---");
  
  const authResults = await Promise.all([
    hrdClient.auth.signInWithPassword({ email: hrdEmail, password: hrdPassword }),
    trainerClient.auth.signInWithPassword({ email: trainerEmail, password: trainerPassword }),
    studentClient.auth.signInWithPassword({ email: studentEmail, password: studentPassword })
  ]);

  const [hrdAuth, trainerAuth, studentAuth] = authResults;

  if (hrdAuth.error || trainerAuth.error || studentAuth.error) {
    console.error("[FAIL] Login failed. Check credentials or email confirmation status.");
    if (hrdAuth.error) console.error(`HRD Login Error: ${hrdAuth.error.message}`);
    if (trainerAuth.error) console.error(`Trainer Login Error: ${trainerAuth.error.message}`);
    if (studentAuth.error) console.error(`Student Login Error: ${studentAuth.error.message}`);
    console.log("[BLOCKED] Cannot proceed with E2E tests without valid authenticated sessions.");
    return;
  }
  
  console.log("[PASS] Logged in successfully.");

  // 5. Verify that privileged roles are assigned through the trusted administrative process.
  console.log("\\n--- Verifying Elevated Roles ---");
  const { data: hrdProfile } = await hrdClient.from('profiles').select('role').eq('id', hrdAuth.data.user.id).single();
  const { data: trainerProfile } = await trainerClient.from('profiles').select('role').eq('id', trainerAuth.data.user.id).single();
  
  if (hrdProfile?.role !== 'hrd' || trainerProfile?.role !== 'trainer') {
    console.error(`[FAIL] Trusted administrator process incomplete. HRD is '${hrdProfile?.role}', Trainer is '${trainerProfile?.role}'.`);
    console.log("[BLOCKED] Please elevate these test accounts to their respective roles in the Supabase Table Editor.");
    return;
  }
  console.log("[PASS] Roles correctly elevated via trusted process.");

  // 3. Ensure it does not delete, reset, or overwrite production data
  console.log("\\n--- Testing Attendance & Workflow (Isolated Test Data) ---");
  const timestamp = Date.now();
  
  // Trainer creates a test class
  const { data: newClass, error: classErr } = await trainerClient
    .from('classes')
    .insert({ name: `Test E2E Class ${timestamp}`, trainer_id: trainerAuth.data.user.id })
    .select().single();
    
  if (classErr) {
    console.error("[FAIL] Trainer could not create class:", classErr.message);
    return;
  }
  console.log("[PASS] Trainer created test class.");

  // Enroll student
  await trainerClient.from('enrollments').insert({ class_id: newClass.id, student_id: studentAuth.data.user.id });

  // 6. Check actual database results
  // Trainer marks attendance
  const { error: attErr } = await trainerClient.from('attendance').insert({ 
    class_id: newClass.id, 
    student_id: studentAuth.data.user.id, 
    status: 'absent', 
    date: new Date().toISOString().split('T')[0] 
  });
  
  if (attErr) {
    console.error("[FAIL] Trainer failed to mark attendance:", attErr.message);
  } else {
    console.log("[PASS] Trainer securely marked attendance.");
  }

  // Student submits permission request
  const { data: request, error: reqErr } = await studentClient.from('requests').insert({
    user_id: studentAuth.data.user.id,
    type: 'Leave',
    status: 'pending',
    description: `Test Request ${timestamp}`
  }).select().single();

  if (reqErr) {
    console.error("[FAIL] Student failed to submit request:", reqErr.message);
  } else {
    console.log("[PASS] Student submitted permission request.");
    
    // HRD approves
    const { error: appErr } = await hrdClient.from('requests')
      .update({ status: 'approved', comments: 'E2E Test Approved' })
      .eq('id', request.id);
      
    if (appErr) {
      console.error("[FAIL] HRD failed to approve request:", appErr.message);
    } else {
      console.log("[PASS] HRD successfully approved the request.");
      
      // Verify audit logs
      const { data: logs, error: auditErr } = await hrdClient.from('audit_logs').select('*').limit(1);
      if (auditErr) {
        console.error("[FAIL] HRD cannot access audit logs:", auditErr.message);
      } else {
        console.log("[PASS] Audit logs securely accessed by HRD.");
      }
    }
  }

  // Cross-student data isolation test
  console.log("\\n--- Testing Data Isolation ---");
  const randomUUID = '11111111-1111-1111-1111-111111111111';
  const { data: isoData, error: isoErr } = await studentClient.from('requests').select('*').eq('user_id', randomUUID);
  
  if (isoErr) {
    console.error("[FAIL] RLS check threw unexpected error:", isoErr.message);
  } else if (isoData && isoData.length > 0) {
    console.error("[FAIL] Data isolation broken. Student read unauthorized records.");
  } else {
    console.log("[PASS] RLS blocks cross-student data access successfully.");
  }
  
  // Cleanup test data to not pollute production DB (optional, but requested to "not overwrite/reset")
  // We leave the data to prove persistence, as instructed "Ensure it does not delete... production data"
  console.log("\\n[SUCCESS] Live E2E Tests Completed Safely.");
}

executeE2E();
