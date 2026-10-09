import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.test', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const studentEmail = process.env.TEST_STUDENT_EMAIL;
const studentPassword = process.env.TEST_STUDENT_PASSWORD;
const hrdEmail = process.env.TEST_HRD_EMAIL;
const hrdPassword = process.env.TEST_HRD_PASSWORD;

async function testRoleEscalation() {
  console.log("\\n--- Testing Role Escalation (Database RLS Enforcement) ---");
  
  if (!studentEmail || !studentPassword || !hrdEmail || !hrdPassword) {
    console.log("[BLOCKED] Missing test credentials.");
    process.exit(1);
  }

  const studentClient = createClient(supabaseUrl, supabaseKey);
  const hrdClient = createClient(supabaseUrl, supabaseKey);

  const { data: authData, error: authErr } = await studentClient.auth.signInWithPassword({
    email: studentEmail,
    password: studentPassword
  });

  if (authErr) {
    console.error("[FAIL] Student login failed:", authErr.message);
    process.exit(1);
  }
  
  const { error: hrdErr } = await hrdClient.auth.signInWithPassword({
    email: hrdEmail,
    password: hrdPassword
  });

  if (hrdErr) {
    console.error("[FAIL] HRD login failed:", hrdErr.message);
    process.exit(1);
  }

  console.log(`[INFO] Authenticated as student (${studentEmail})`);
  console.log(`[INFO] Authenticated as HRD (${hrdEmail})`);

  // Attempt 1: Promote self to HRD (as student)
  console.log("\\n[TEST 1] Attempting to promote self to 'hrd' (as student)...");
  const { error: updateSelfErr } = await studentClient
    .from('profiles')
    .update({ role: 'hrd' })
    .eq('id', authData.user.id);
  
  if (updateSelfErr) {
    console.log(`[PASS] Student could not promote themselves. DB responded: ${updateSelfErr.message}`);
  } else {
    console.log("[FAIL] Database did not return an error for self-promotion!");
  }

  // Re-fetch profile to check if role actually changed in DB
  const adminClient = createClient(supabaseUrl, supabaseKey);
  const { data: profileCheck } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profileCheck.role === 'hrd') {
    console.error("[CRITICAL VULNERABILITY] Student successfully promoted themselves to HRD!");
    await adminClient.from('profiles').update({ role: 'student' }).eq('id', authData.user.id);
    process.exit(1);
  } else {
    console.log("[PASS] Verified DB state: Student role remained unchanged.");
  }

  // Attempt 2: Promote another user (as student)
  console.log("\\n[TEST 2] Attempting to update another user's profile (as student)...");
  const { data: targetProfile } = await adminClient.from('profiles').select('id, role').eq('email', hrdEmail).single();
  
  if (targetProfile) {
    const { error: updateOtherErr } = await studentClient
      .from('profiles')
      .update({ role: 'student' })
      .eq('id', targetProfile.id);
    
    if (updateOtherErr) {
      console.log(`[PASS] RLS blocked updating another user's profile. Error: ${updateOtherErr.message}`);
    } else {
      const { data: checkTarget } = await adminClient.from('profiles').select('role').eq('id', targetProfile.id).single();
      if (checkTarget.role === 'student') {
        console.error("[CRITICAL VULNERABILITY] Student modified another user's role!");
        process.exit(1);
      } else {
        console.log("[PASS] RLS silently ignored updating another user's profile. Verified DB state.");
      }
    }
  }

  // Attempt 3: Legitimate HRD changes another user's role
  console.log("\\n[TEST 3] Attempting legitimate role update (as HRD)...");
  
  // HRD changes student's role to 'trainer' temporarily
  const { error: hrdUpdateErr } = await hrdClient
    .from('profiles')
    .update({ role: 'trainer' })
    .eq('id', authData.user.id);

  if (hrdUpdateErr) {
    console.error(`[FAIL] HRD failed to update student's role! RLS might be too strict. Error: ${hrdUpdateErr.message}`);
    process.exit(1);
  } else {
    // Verify DB state
    const { data: verifyHrdUpdate } = await adminClient.from('profiles').select('role').eq('id', authData.user.id).single();
    if (verifyHrdUpdate.role === 'trainer') {
      console.log("[PASS] HRD successfully updated user's role. Verified DB state.");
      
      // Revert back
      await hrdClient.from('profiles').update({ role: 'student' }).eq('id', authData.user.id);
      console.log("[INFO] Reverted user role back to 'student'.");
    } else {
      console.error("[FAIL] Update appeared to succeed but DB state didn't change!");
      process.exit(1);
    }
  }
  
  console.log("\\n[SUCCESS] RLS Escalation Tests Passed!");
}

testRoleEscalation();
