import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, supabaseKey);

async function testLogins() {
  const emails = [
    'hrd@hrdconnect.edu',
    'trainer@hrdconnect.edu',
    'student@hrdconnect.edu',
    'admin@example.com',
    'test@example.com',
    'hrd@example.com',
    'trainer@example.com',
    'student@example.com'
  ];
  
  for (const email of emails) {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: 'password123' // Common test password
    });
    
    if (data.session) {
      console.log(`SUCCESS: Logged into ${email}`);
    } else {
      console.log(`Failed for ${email}: ${error?.message}`);
    }
  }
}
testLogins();
