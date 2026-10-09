import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.test' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testExportData() {
  const { data: { user }, error: loginErr } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_HRD_EMAIL,
    password: process.env.TEST_HRD_PASSWORD
  });
  
  const { data: requests } = await supabase.from('requests').select('*');
  console.log(`HRD Dashboard loads with ${requests.length} requests available for export.`);
}
testExportData();
