"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitRequest(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Ensure they are a student
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'student') {
    return { error: "Only students can submit requests here." };
  }

  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const document_url = formData.get("document_url") as string; // in a real app, this would be a file upload to Supabase Storage

  if (!type || !description) {
    return { error: "Type and Description are required." };
  }

  const { error } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      type,
      description,
      document_url,
      status: 'pending'
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/student");
  return { success: true };
}
