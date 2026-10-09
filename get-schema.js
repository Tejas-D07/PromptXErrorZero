
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getOpenAPI() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.definitions) {
    console.log("Tables found:", Object.keys(data.definitions));
    if (data.definitions.profiles) {
      console.log("Profiles schema:", data.definitions.profiles);
    }
  } else {
    console.log("No definitions found.", data);
  }
}

getOpenAPI();
