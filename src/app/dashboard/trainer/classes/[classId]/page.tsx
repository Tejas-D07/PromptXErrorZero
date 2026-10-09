"use client";

import { useState, useTransition, use, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Save, Users, CalendarDays, ArrowLeft, Loader2, AlertCircle, Download } from "lucide-react";
import Link from "next/link";
import { saveAttendance } from "../../actions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params);
  const supabase = createClient();
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  
  const [roster, setRoster] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: cls } = await supabase.from('classes').select('*').eq('id', classId).single();
      setClassInfo(cls);

      const { data: enr } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          profile:profiles(id, full_name, email)
        `)
        .eq('class_id', classId);

      if (enr) {
        setRoster(enr.map((e: any) => e.profile));
      }
      setLoading(false);
    }
    loadData();
  }, [classId, supabase]);

  const markAll = (status: 'present' | 'absent') => {
    const newAtt: Record<string, 'present' | 'absent' | 'late'> = {};
    roster.forEach(s => newAtt[s.id] = status);
    setAttendance(newAtt);
  };

  const toggleStudent = (id: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const exportToCSV = () => {
    if (roster.length === 0) return;
    
    const headers = ["Student Name", "Email", "Status"];
    const csvContent = [
      headers.join(","),
      ...roster.map(student => {
        const name = `"${student.full_name}"`;
        const email = `"${student.email}"`;
        const status = `"${attendance[student.id] || 'absent'}"`;
        return [name, email, status].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `class_${classId}_attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    setMessage(null);
    const dataToSave = roster.map(s => ({
      studentId: s.id,
      status: attendance[s.id] || 'absent'
    }));

    startTransition(async () => {
      const res = await saveAttendance(classId, date, dataToSave);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Attendance saved successfully." });
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-[#C6A15B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/trainer" className="p-2 bg-white rounded-full border border-[#EAE3D5] text-[#5C6670] hover:text-[#0B1F33] hover:bg-[#F5F0E6] transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[#0B1F33]">Manage Class</h2>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-[#EAE3D5]">
          <div>
            <h3 className="text-3xl font-bold text-[#0B1F33] mb-2">{classInfo?.name || "Class"}</h3>
            <p className="text-[#5C6670] flex items-center gap-2">
              <Users className="w-4 h-4" /> {roster.length} Students Enrolled
            </p>
          </div>
          <div className="bg-[#F5F0E6] p-4 rounded-xl border border-[#D1C7B5] flex items-center gap-4">
            <CalendarDays className="w-5 h-5 text-[#C6A15B]" />
            <div>
              <p className="text-xs font-bold text-[#5C6670] uppercase">Session Date</p>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-[#0B1F33] font-semibold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h4 className="text-lg font-bold text-[#0B1F33]">Attendance Roster</h4>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <button 
              onClick={() => markAll('present')}
              className="px-4 py-2 bg-[#F5F0E6] text-[#0B1F33] text-sm font-semibold rounded-lg hover:bg-[#EAE3D5] transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Mark All Present
            </button>
            <button 
              onClick={() => markAll('absent')}
              className="px-4 py-2 bg-[#F5F0E6] text-[#0B1F33] text-sm font-semibold rounded-lg hover:bg-[#EAE3D5] transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4 text-[#B84A4A]" />
              Mark All Absent
            </button>
            <button 
              onClick={exportToCSV}
              disabled={roster.length === 0}
              className="px-4 py-2 bg-[#0B1F33] text-[#F5F0E6] text-sm font-semibold rounded-lg hover:bg-[#102A43] hover:text-[#C6A15B] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {message && (
          <div className={cn(
            "mb-6 p-4 rounded-xl flex items-center gap-3",
            message.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          )}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAE3D5] text-left">
                <th className="pb-4 font-semibold text-[#5C6670]">Student Name</th>
                <th className="pb-4 font-semibold text-[#5C6670] text-center w-48">Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-[#5C6670]">No students enrolled in this class yet.</td>
                </tr>
              ) : roster.map((student, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={student.id} 
                    className="border-b border-[#EAE3D5]/50 hover:bg-[#F5F0E6]/30 transition-colors"
                  >
                    <td className="py-4">
                      <p className="font-bold text-[#0B1F33]">{student.full_name}</p>
                      <p className="text-sm text-[#5C6670]">{student.email}</p>
                    </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2 bg-[#F5F0E6] p-1 rounded-lg w-max mx-auto">
                      <button
                        onClick={() => toggleStudent(student.id, 'present')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-1",
                          attendance[student.id] === 'present' 
                            ? "bg-green-100 text-green-700 shadow-sm" 
                            : "text-[#5C6670] hover:bg-white"
                        )}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => toggleStudent(student.id, 'late')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-1",
                          attendance[student.id] === 'late' 
                            ? "bg-yellow-100 text-yellow-700 shadow-sm" 
                            : "text-[#5C6670] hover:bg-white"
                        )}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => toggleStudent(student.id, 'absent')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-1",
                          attendance[student.id] === 'absent' 
                            ? "bg-red-100 text-red-700 shadow-sm" 
                            : "text-[#5C6670] hover:bg-white"
                        )}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="px-8 py-3 bg-[#0B1F33] text-[#F5F0E6] rounded-xl font-medium hover:bg-[#102A43] transition-all flex items-center gap-2 shadow-lg shadow-[#0B1F33]/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Attendance
          </button>
        </div>
      </div>

      {/* Session History & Reports */}
      <div className="bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-sm mt-8">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#C6A15B]" />
          Recent Session History
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { date: "Oct 07, 2026", present: 22, absent: 2, late: 0, status: "Completed" },
            { date: "Oct 05, 2026", present: 24, absent: 0, late: 0, status: "Completed" },
            { date: "Oct 01, 2026", present: 20, absent: 1, late: 3, status: "Completed" },
          ].map((session, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#F5F0E6]/50 border border-[#D1C7B5] rounded-2xl p-5 hover:bg-[#F5F0E6] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-[#0B1F33]">{session.date}</span>
                <span className="text-xs font-bold bg-[#102A43] text-[#C6A15B] px-2 py-1 rounded-md">{session.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-green-100 text-green-800 rounded-lg p-2">
                  <span className="block font-bold text-lg">{session.present}</span> Present
                </div>
                <div className="bg-yellow-100 text-yellow-800 rounded-lg p-2">
                  <span className="block font-bold text-lg">{session.late}</span> Late
                </div>
                <div className="bg-red-100 text-red-800 rounded-lg p-2">
                  <span className="block font-bold text-lg">{session.absent}</span> Absent
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
