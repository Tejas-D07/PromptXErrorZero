"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  XCircle, 
  ChevronRight,
  Send,
  Loader2,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitRequest } from "./actions";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export default function StudentDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Data States
  const [attendance, setAttendance] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 100 });
  const [requests, setRequests] = useState<any[]>([]);
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success'|'error' } | null>(null);

  // Form State
  const [reqType, setReqType] = useState("leave");
  const [reqDesc, setReqDesc] = useState("");
  const [reqFile, setReqFile] = useState<File | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Fetch Attendance
    const { data: attData } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', user.id);
      
    if (attData) {
      const total = attData.length;
      let present = 0;
      let absent = 0;
      let late = 0;

      attData.forEach(r => {
        if (r.status === 'present') present++;
        else if (r.status === 'late') late++;
        else if (r.status === 'absent') absent++;
      });

      const attended = present + late;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

      setAttendance({ total, present, absent, late, percentage });
    }

    // Fetch Requests
    const { data: reqData } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (reqData) {
      setRequests(reqData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [supabase]);

  // Entrance Animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".dashboard-card");
      gsap.fromTo(cards, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading]);

  // Realtime Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('requests_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests', filter: `user_id=eq.${userId}` },
        (payload) => {
          setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
          setToast({
            title: "Request Updated",
            message: `Your ${payload.new.type} request was ${payload.new.status}.`,
            type: payload.new.status === 'approved' ? 'success' : 'error'
          });
          setTimeout(() => setToast(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    setUploading(true);

    let document_url = "";
    if (reqFile) {
      const fileExt = reqFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, reqFile);

      if (uploadError) {
        setFormMsg({ type: "error", text: "Failed to upload document: " + uploadError.message });
        setUploading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
      document_url = publicUrlData.publicUrl;
    }

    setUploading(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("type", reqType);
      formData.append("description", reqDesc);
      formData.append("document_url", document_url);
      
      const res = await submitRequest(formData);
      if (res.error) {
        setFormMsg({ type: "error", text: res.error });
      } else {
        setFormMsg({ type: "success", text: "Request submitted successfully." });
        setReqDesc("");
        setReqFile(null);
        fetchDashboardData();
        setTimeout(() => setFormMsg(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-8 pb-12 relative font-sans" ref={containerRef}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-start gap-3 border min-w-[300px] animate-in slide-in-from-top-5 duration-300",
            toast.type === 'success' ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs mt-0.5 font-medium opacity-90">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="dashboard-card opacity-0 bg-[#0B1F33] rounded-3xl p-8 relative overflow-hidden shadow-xl border border-[#102A43]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A15B] rounded-full mix-blend-screen filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">My Overview</h2>
          <p className="text-[#F5F0E6]/80 font-medium">
            Track your attendance eligibility, upcoming deadlines, and manage permission requests.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Attendance & Resources */}
        <div className="lg:col-span-1 space-y-8">
          {/* Attendance Card */}
          <div 
            className="dashboard-card opacity-0 bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
          >
            <h3 className="font-bold text-[#0B1F33] text-lg mb-8 tracking-tight">Attendance Eligibility</h3>
            
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative flex items-center justify-center drop-shadow-sm">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#F5F0E6" strokeWidth="12" fill="none" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    stroke={attendance.percentage >= 75 ? "#C6A15B" : "#B84A4A"} 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray="351.8" 
                    strokeDashoffset={351.8 - (351.8 * attendance.percentage) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-bold text-[#0B1F33] tracking-tight">{loading ? '--' : attendance.percentage}%</span>
                </div>
              </div>
              
              {attendance.percentage < 75 && !loading && (
                <div className="mt-6 flex items-center gap-2 text-[#B84A4A] bg-[#B84A4A]/10 px-4 py-2 rounded-xl text-sm font-bold border border-[#B84A4A]/20">
                  <AlertCircle className="w-4 h-4" /> Shortage Warning
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#F5F0E6]/50 rounded-2xl p-4 border border-[#EAE3D5]">
                <span className="block text-xs font-bold text-[#5C6670] uppercase tracking-wider mb-1">Present</span>
                <span className="text-2xl font-bold text-[#0B1F33]">{attendance.present + attendance.late}</span>
              </div>
              <div className="bg-[#B84A4A]/5 rounded-2xl p-4 border border-[#B84A4A]/10">
                <span className="block text-xs font-bold text-[#B84A4A] uppercase tracking-wider mb-1">Absent</span>
                <span className="text-2xl font-bold text-[#B84A4A]">{attendance.absent}</span>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-[#5C6670] text-center font-medium leading-relaxed bg-[#F5F0E6]/50 p-3 rounded-xl">
              <span className="font-bold text-[#0B1F33]">Note:</span> Permission approvals do not automatically grant attendance. Eligibility is calculated purely on physical presence records.
            </div>
          </div>

          {/* Training Deadlines */}
          <div className="dashboard-card opacity-0 bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="font-bold text-[#0B1F33] text-lg mb-6 flex items-center gap-2 tracking-tight">
              <BookOpen className="w-5 h-5 text-[#C6A15B]" /> Modules & Deadlines
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-[#F5F0E6]/50 border border-[#D1C7B5] hover:border-[#C6A15B] transition-colors">
                <div className="w-14 h-14 bg-[#0B1F33] text-[#C6A15B] rounded-xl flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <span className="text-[10px] font-bold uppercase tracking-widest">OCT</span>
                  <span className="text-xl font-bold leading-none">12</span>
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-[#0B1F33] text-sm">Resume Building Draft</h4>
                  <p className="text-xs text-[#5C6670] font-medium mt-0.5">Upload on LMS portal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Requests & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Submit Request Form */}
          <div 
            className="dashboard-card opacity-0 bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-xl font-bold text-[#0B1F33] mb-8 tracking-tight">Submit Permission Request</h3>
            
            {formMsg && (
              <div className={cn(
                "mb-8 p-4 rounded-xl flex items-center gap-3",
                formMsg.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
              )}>
                <p className="font-bold text-sm">{formMsg.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1C242B]">Request Type</label>
                  <select 
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-[#D1C7B5] bg-[#F5F0E6]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 transition-all text-[#0B1F33] font-medium"
                  >
                    <option value="leave">General Leave / Absence</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="event">College Duty / Event</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1C242B]">Supporting Document (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={(e) => setReqFile(e.target.files?.[0] || null)}
                      className="w-full px-5 py-2.5 rounded-xl border border-[#D1C7B5] bg-[#F5F0E6]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 transition-all text-[#0B1F33] text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#0B1F33] file:text-[#F5F0E6] hover:file:bg-[#102A43] file:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1C242B]">Detailed Reason</label>
                <textarea 
                  rows={4}
                  placeholder="Provide detailed reasoning for your request..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-[#D1C7B5] bg-[#F5F0E6]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 transition-all text-[#0B1F33] resize-none font-medium"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isPending || uploading}
                  className="px-8 py-3.5 bg-[#0B1F33] text-[#F5F0E6] rounded-xl font-bold tracking-wide uppercase hover:bg-[#102A43] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(11,31,51,0.15)] active:scale-95"
                >
                  {(isPending || uploading) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {uploading ? 'Uploading...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Request History */}
          <div 
            className="dashboard-card opacity-0 bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-xl font-bold text-[#0B1F33] mb-8 flex items-center gap-2 tracking-tight">
              <FileText className="w-5 h-5 text-[#C6A15B]" /> Request History
            </h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#C6A15B]" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-[#5C6670] flex flex-col items-center justify-center bg-[#F5F0E6]/30 rounded-2xl border border-dashed border-[#D1C7B5]">
                <FileText className="w-12 h-12 text-[#D1C7B5] mb-4" />
                <p className="font-bold">No requests found.</p>
                <p className="text-sm font-medium mt-1">Your permission requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 rounded-2xl border border-[#EAE3D5] hover:border-[#D1C7B5] transition-colors bg-[#F5F0E6]/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#5C6670] block mb-2">
                          {new Date(req.created_at).toLocaleDateString()} <span className="mx-2 text-[#D1C7B5]">|</span> {req.type}
                        </span>
                        <p className="text-[#0B1F33] text-sm font-semibold leading-relaxed">{req.description}</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm border",
                        req.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" :
                        req.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-[#C6A15B]/10 text-[#9B7A3C] border-[#C6A15B]/20"
                      )}>
                        {req.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {req.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status}
                      </div>
                    </div>
                    {req.comments && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-[#EAE3D5] text-sm text-[#5C6670] flex gap-3 shadow-sm">
                        <ChevronRight className="w-5 h-5 shrink-0 text-[#C6A15B]" />
                        <span className="font-medium leading-relaxed">
                          <span className="font-bold text-[#0B1F33] mr-1">HRD Comment:</span> 
                          {req.comments}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
