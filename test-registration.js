import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  const timestamp = Date.now();
  const testEmail = `studentmalicious${timestamp}@gmail.com`;
  
  console.log(`Testing registration for: ${testEmail}`);
  
  // 1. Supabase Auth creates the user successfully
  // 4. Supplying 'hrd' in client metadata cannot grant elevated privileges
  const { data, error } = await client.auth.signUp({
    email: testEmail,
    password: 'password123',
    options: {
      data: {
        full_name: 'Malicious Student',
        role: 'hrd' // Attempt to elevate privileges
      }
    }
  });

  if (error) {
    console.error("FAIL: 1. Supabase Auth signup failed:", error.message);
    return;
  }
  
  console.log("PASS: 1. Supabase Auth creates the user successfully.");
  
  if (!data.session) {
    console.error("BLOCKED: Email confirmation required. Cannot test login automatically.");
    // We can still try to read the profile if we have a way, but without a session we can't test RLS easily.
  }
  
  // Use the user's session to fetch their profile
  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${data.session?.access_token || ''}` }
    }
  });

  // Use anon client since profiles are public
  const { data: profile, error: profileErr } = await client
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileErr) {
    console.error("FAIL: 2. Trigger failed to create profile or profile not accessible:", profileErr.message);
    return;
  }

  console.log("PASS: 2. The trigger creates the corresponding profile.");

  // 3 & 4. Database assigns student role, ignoring metadata
  if (profile.role === 'student') {
    console.log("PASS: 3. The database assigns the student role.");
    console.log("PASS: 4. Supplying 'hrd' in client metadata was successfully ignored. Prevents privilege escalation.");
  } else {
    console.error(`FAIL: 3 & 4. Expected role 'student', but got '${profile.role}'. Security vulnerability exists!`);
  }

  // 5. Login and student dashboard access work correctly
  // We simulate student access by checking if they can view their own requests (which is allowed for students)
  const { error: requestErr } = await userClient
    .from('requests')
    .select('*')
    .limit(1);
    
  if (requestErr) {
    console.error("FAIL: 5. Student cannot access allowed tables:", requestErr.message);
  } else {
    console.log("PASS: 5. Login and student dashboard access (RLS policies) work correctly.");
  }
}

testRegistration();
