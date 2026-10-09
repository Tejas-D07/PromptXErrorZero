import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking DB...");
  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Success: Profiles table exists.");
  }
}
check();
