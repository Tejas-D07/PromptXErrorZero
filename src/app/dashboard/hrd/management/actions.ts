"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileRole(userId: string, newRole: string) {
  const supabase = await createClient();
  
  // Verify HRD role on the server side
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'hrd') return { error: "Forbidden: Only HRD can manage roles." };

  if (!['student', 'trainer', 'hrd'].includes(newRole)) {
    return { error: "Invalid role specified." };
  }

  // Update role using RLS-enabled client. The RLS policy we added allows HRD to update profiles.
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/hrd/management');
  return { success: true };
}
