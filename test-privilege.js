import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.test' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPrivilege() {
  const { data: { user }, error: loginErr } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_STUDENT_EMAIL,
    password: process.env.TEST_STUDENT_PASSWORD
  });
  if (loginErr) return console.error('Login failed:', loginErr);
  
  console.log('Logged in as student:', user.id);
  const { data: profile1 } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  console.log('Current role before exploit:', profile1.role);

  console.log('Attempting self-promotion to HRD via RLS...');
  const { error: updateErr } = await supabase.from('profiles').update({ role: 'hrd' }).eq('id', user.id);
  
  if (updateErr) {
    console.log('Exploit failed (secure):', updateErr.message);
  } else {
    console.log('Exploit SUCCEEDED! (VULNERABLE)');
    const { data: profile2 } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    console.log('New role after exploit:', profile2.role);
    
    // Revert it
    console.log('Reverting back to student...');
    await supabase.from('profiles').update({ role: 'student' }).eq('id', user.id);
  }
}
testPrivilege();
