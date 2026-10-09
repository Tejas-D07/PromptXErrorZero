"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveAttendance(classId: string, date: string, attendanceData: { studentId: string; status: 'present' | 'absent' | 'late' }[]) {
  const supabase = await createClient();

  // 1. Verify Trainer owns this class
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('trainer_id')
    .eq('id', classId)
    .single();

  if (classError || !classData || classData.trainer_id !== user.id) {
    return { error: "Forbidden: You don't own this class" };
  }

  // 2. Fetch all enrolled students for this class (in a real app, from a class_enrollments table)
  // For demo logic, we'll assume the provided attendanceData contains all students.
  // Any student marked 'absent' will explicitly get an absence record.
  
  // Format the data for Supabase
  const upsertData = attendanceData.map(record => ({
    class_id: classId,
    student_id: record.studentId,
    status: record.status,
    date: date
  }));

  // Note: To prevent duplicates, the 'attendance' table should ideally have a unique constraint on (class_id, student_id, date).
  // Without the constraint created in SQL, we delete existing records for that date first, then insert.
  
  const { error: delError } = await supabase
    .from('attendance')
    .delete()
    .eq('class_id', classId)
    .eq('date', date);

  if (delError) {
    return { error: "Failed to clear previous records for this date." };
  }

  const { error: insertError } = await supabase
    .from('attendance')
    .insert(upsertData);

  if (insertError) {
    return { error: insertError.message };
  }

  return { success: true };
}
