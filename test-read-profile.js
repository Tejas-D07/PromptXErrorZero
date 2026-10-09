import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, supabaseKey);

async function testReadProfile() {
  const email = 'studentmalicious1791528527023@gmail.com'; // User created in task-620
  
  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error) {
    console.error("FAIL: 2. Could not read profile:", error);
    return;
  }
  
  console.log("PASS: 2. The trigger creates the corresponding profile.");
  console.log("Profile Data:", profile);
  
  if (profile.role === 'student') {
    console.log("PASS: 3. The database assigns the student role.");
    console.log("PASS: 4. Supplying 'hrd' in client metadata was successfully ignored. Prevents privilege escalation.");
  } else {
    console.error(`FAIL: 3 & 4. Expected role 'student', but got '${profile.role}'. Security vulnerability exists!`);
  }
}

testReadProfile();
