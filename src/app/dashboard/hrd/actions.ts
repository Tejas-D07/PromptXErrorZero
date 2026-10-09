"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processRequest(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify role securely on the backend
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'hrd') {
    return { error: "Forbidden. Only HRD Heads can process requests." };
  }

  const requestId = formData.get("requestId") as string;
  const status = formData.get("status") as 'approved' | 'rejected';
  const comments = formData.get("comments") as string;

  if (!requestId || !status || !comments) {
    return { error: "All fields including comments are mandatory." };
  }

  // Update the request
  const { error: updateError } = await supabase
    .from('requests')
    .update({ status, comments })
    .eq('id', requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Create an audit log entry
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      action: status.toUpperCase(),
      entity_type: 'request',
      entity_id: requestId,
      performed_by: user.id,
      details: {
        previous_status: 'pending',
        new_status: status,
        comments: comments
      }
    });

  if (auditError) {
    console.error("Failed to write audit log:", auditError);
  }

  revalidatePath("/dashboard/hrd");
  return { success: true };
}

export async function updateAttendancePolicy(minPercentage: number) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'hrd') {
    return { error: "Forbidden. Only HRD Heads can update policies." };
  }

  // Since we don't have a settings table, we persist this as an audit log configuration event
  // In a full production system, this would write to a 'settings' or 'policies' table
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      action: 'POLICY_UPDATE',
      entity_type: 'system_policy',
      entity_id: '00000000-0000-0000-0000-000000000000',
      performed_by: user.id,
      details: {
        minimum_attendance_percentage: minPercentage
      }
    });

  if (auditError) {
    return { error: auditError.message };
  }

  revalidatePath("/dashboard/hrd");
  return { success: true };
}
