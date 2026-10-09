"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  Loader2,
  Download,
  Settings,
  Save
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { processRequest } from "./actions";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type RequestType = {
  id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  comments: string;
  document_url?: string;
  student_id: string;
  profile: { full_name: string; role: string };
};

export default function HRDDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedReq, setSelectedReq] = useState<RequestType | null>(null);
  const [comments, setComments] = useState("");
  const [actionError, setActionError] = useState("");
  const [minAttendance, setMinAttendance] = useState(85);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('requests')
        .select(`
          *,
          profile:profiles(full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        setRequests(data);
      }
      setLoading(false);
    }
    loadData();

    // Set up real-time subscription
    const channel = supabase.channel('hrd_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, async (payload) => {
        // Handle insert, update, or delete
        if (payload.eventType === 'INSERT') {
          // Fetch the profile for the new request
          const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', payload.new.student_id).single();
          const newRequest = { ...payload.new, profile } as RequestType;
          setRequests(prev => [newRequest, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(req => req.id === payload.new.id ? { ...req, ...payload.new } : req));
        } else if (payload.eventType === 'DELETE') {
          setRequests(prev => prev.filter(req => req.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".animate-up");
      gsap.fromTo(elements, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading, filter, search]); // Re-run animation if lists drastically change

  useEffect(() => {
    if (selectedReq && detailsRef.current) {
      gsap.fromTo(detailsRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [selectedReq]);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === "all" ? true : req.status === filter;
    const searchString = search.toLowerCase();
    const matchesSearch = 
      req.profile?.full_name?.toLowerCase().includes(searchString) || 
      req.type.toLowerCase().includes(searchString);
    return matchesFilter && matchesSearch;
  });

  const handleAction = (status: 'approved' | 'rejected') => {
    if (!comments.trim()) {
      setActionError("Comments are mandatory to approve or reject a request.");
      return;
    }
    if (!selectedReq) return;
    setActionError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("requestId", selectedReq.id);
      formData.append("status", status);
      formData.append("comments", comments);

      const res = await processRequest(formData);
      
      if (res.error) {
        setActionError(res.error);
      } else {
        // Update local state for immediate feedback
        setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status, comments } : r));
        setSelectedReq(null);
        setComments("");
      }
    });
  };

  const exportToCSV = () => {
    if (filteredRequests.length === 0) return;
    
    const headers = ["Student Name", "Type", "Description", "Status", "Date", "HRD Comments"];
    const csvContent = [
      headers.join(","),
      ...filteredRequests.map(req => {
        const name = `"${req.profile?.full_name || 'Unknown'}"`;
        const type = `"${req.type}"`;
        const desc = `"${(req.description || '').replace(/"/g, '""')}"`;
        const status = `"${req.status}"`;
        const date = `"${new Date(req.created_at).toLocaleDateString()}"`;
        const comment = `"${(req.comments || '').replace(/"/g, '""')}"`;
        return [name, type, desc, status, date, comment].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `hrd_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredRequests.length === 0) return;
    
    const doc = new jsPDF();
    
    // Add Branding
    doc.setFontSize(20);
    doc.setTextColor(11, 31, 51); // Deep Atlas Navy
    doc.text("HRD Connect - Official Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(198, 161, 91); // Gold
    doc.text("Sapthagiri NPS University", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(92, 102, 112); // Gray
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
    
    // Create Table
    const tableData = filteredRequests.map(req => [
      req.profile?.full_name || 'Unknown',
      req.type,
      new Date(req.created_at).toLocaleDateString(),
      req.status.toUpperCase(),
      req.comments || '-'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Student Name", "Type", "Date", "Status", "HRD Comments"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [11, 31, 51], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 240, 230] }, // Ivory
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save(`HRD_Official_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-8 pb-12 font-sans" ref={containerRef}>
      {/* Header section */}
      <div className="animate-up opacity-0 bg-[#0B1F33] rounded-3xl p-8 relative overflow-hidden shadow-xl border border-[#102A43]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A15B] rounded-full mix-blend-screen filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
            <ShieldCheck className="w-8 h-8 text-[#C6A15B]" /> HRD Management
          </h2>
          <p className="text-[#F5F0E6]/80 font-medium">
            Review pending permissions, manage student attendance policies, and audit cohort performance.
          </p>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Pending Requests", value: pendingCount, icon: Clock, color: "#C6A15B" },
          { label: "Approved This Month", value: approvedCount, icon: CheckCircle2, color: "#10B981" },
          { label: "Total Cohorts", value: "8", icon: Users, color: "#0B1F33" },
          { label: "Overall Attendance", value: "88%", icon: BarChart3, color: "#0B1F33" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="animate-up opacity-0 bg-white p-6 rounded-3xl border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between hover:shadow-[0_8px_30px_rgba(198,161,91,0.08)] transition-all duration-300"
          >
            <div>
              <p className="text-sm font-bold tracking-wide uppercase text-[#5C6670] mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[#0B1F33]">{stat.value}</h3>
            </div>
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-opacity-10 shadow-inner"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              <stat.icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Request Table */}
        <div className="lg:col-span-2 animate-up opacity-0 bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#EAE3D5] pb-6">
            <h3 className="text-xl font-bold text-[#0B1F33] flex items-center gap-2 tracking-tight">
              <FileText className="w-5 h-5 text-[#C6A15B]" /> Permission Requests
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6670]" />
                <input 
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full sm:w-48 rounded-xl border border-[#D1C7B5] bg-[#F5F0E6]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 text-sm font-medium transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6670]" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
                  className="pl-9 pr-8 py-2.5 w-full sm:w-auto rounded-xl border border-[#D1C7B5] bg-[#F5F0E6]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 text-sm font-medium appearance-none transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button
                onClick={exportToCSV}
                disabled={filteredRequests.length === 0}
                className="px-4 py-2.5 bg-white border border-[#D1C7B5] text-[#0B1F33] rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#F5F0E6] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                disabled={filteredRequests.length === 0}
                className="px-4 py-2.5 bg-[#0B1F33] text-[#F5F0E6] rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#102A43] hover:text-[#C6A15B] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D5] text-xs font-bold uppercase tracking-wider text-[#5C6670]">
                  <th className="pb-4">Student Name</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr 
                    key={req.id}
                    className="border-b border-[#EAE3D5]/50 hover:bg-[#F5F0E6]/30 transition-colors animate-up opacity-0"
                  >
                    <td className="py-4 pr-4 font-bold text-[#0B1F33]">{req.profile?.full_name || "Unknown"}</td>
                    <td className="py-4 pr-4 text-[#5C6670] capitalize font-medium">{req.type}</td>
                    <td className="py-4 pr-4 text-[#5C6670] font-medium">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="py-4 pr-4">
                      <span className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide inline-block border",
                        req.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" :
                        req.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-[#C6A15B]/10 text-[#9B7A3C] border-[#C6A15B]/20"
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <button 
                        onClick={() => { setSelectedReq(req); setComments(""); setActionError(""); }}
                        className="text-sm font-bold text-[#0B1F33] hover:text-[#C6A15B] transition-colors uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-[#F5F0E6]"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#5C6670] font-medium bg-[#F5F0E6]/20 rounded-xl">
                      No requests match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Request Details Panel */}
        <div className="lg:col-span-1">
          {selectedReq ? (
            <div
              ref={detailsRef}
              className="bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_20px_60px_rgba(11,31,51,0.08)] sticky top-28"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#0B1F33] tracking-tight">Review Request</h3>
                <button onClick={() => setSelectedReq(null)} className="text-[#5C6670] hover:text-[#B84A4A] text-sm font-bold uppercase tracking-wide transition-colors bg-[#F5F0E6]/50 px-3 py-1.5 rounded-lg">
                  Close
                </button>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-xs font-bold text-[#5C6670] uppercase tracking-wider">Student</label>
                  <p className="font-bold text-[#0B1F33] text-lg mt-1">{selectedReq.profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5C6670] uppercase tracking-wider">Type & Date</label>
                  <p className="text-[#1C242B] font-medium capitalize mt-1">{selectedReq.type} <span className="mx-2 text-[#D1C7B5]">|</span> {new Date(selectedReq.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5C6670] uppercase tracking-wider">Reasoning</label>
                  <p className="text-[#0B1F33] font-medium bg-[#F5F0E6]/50 p-4 rounded-xl border border-[#D1C7B5] text-sm mt-2 leading-relaxed">
                    {selectedReq.description}
                  </p>
                </div>
                {selectedReq.document_url && (
                  <div>
                    <label className="text-xs font-bold text-[#5C6670] uppercase tracking-wider">Evidence</label>
                    <a href={selectedReq.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#C6A15B] font-bold hover:text-[#0B1F33] transition-colors mt-2 bg-[#F5F0E6]/50 px-4 py-2 rounded-lg border border-[#D1C7B5] hover:border-[#C6A15B]">
                      <ExternalLink className="w-4 h-4" /> View Supporting Document
                    </a>
                  </div>
                )}
              </div>

              {selectedReq.status === 'pending' ? (
                <div className="pt-8 border-t border-[#EAE3D5] space-y-5">
                  {actionError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold">
                      {actionError}
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold text-[#0B1F33] block mb-3">Mandatory HRD Comment</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide reasoning for approval or rejection..."
                      className="w-full p-4 rounded-xl border border-[#D1C7B5] bg-[#F5F0E6]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 text-sm font-medium resize-none transition-all"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleAction('approved')}
                      disabled={isPending}
                      className="flex-1 bg-[#10B981] hover:bg-green-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm active:scale-95"
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction('rejected')}
                      disabled={isPending}
                      className="flex-1 bg-[#B84A4A] hover:bg-red-700 text-white py-3.5 rounded-xl font-bold uppercase tracking-wide transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm active:scale-95"
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-8 border-t border-[#EAE3D5]">
                  <span className="block text-xs font-bold text-[#5C6670] uppercase tracking-wider mb-3">Previously Processed</span>
                  <div className="p-5 bg-[#F5F0E6]/50 rounded-xl border border-[#D1C7B5]">
                    <span className={cn(
                      "inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide mb-3 border",
                      selectedReq.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {selectedReq.status}
                    </span>
                    <p className="text-sm font-medium text-[#0B1F33] leading-relaxed"><strong className="text-[#5C6670] uppercase text-xs tracking-wider block mb-1">HRD Comment</strong> {selectedReq.comments}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-[#D1C7B5] flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="w-20 h-20 bg-[#F5F0E6] rounded-2xl flex items-center justify-center shadow-inner mb-6">
                <FileText className="w-10 h-10 text-[#D1C7B5]" />
              </div>
              <h4 className="font-bold text-[#0B1F33] text-lg mb-3 tracking-tight">No Request Selected</h4>
              <p className="text-sm font-medium text-[#5C6670] leading-relaxed max-w-[250px]">Click <span className="font-bold text-[#0B1F33]">REVIEW</span> on any request from the table to view details, inspect documents, and take action.</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Settings & Policies */}
      <div className="animate-up opacity-0 bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
        <h3 className="text-xl font-bold text-[#0B1F33] flex items-center gap-2 tracking-tight mb-6">
          <Settings className="w-5 h-5 text-[#C6A15B]" /> Platform Policies
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#F5F0E6]/30 border border-[#D1C7B5] rounded-2xl p-6">
            <h4 className="font-bold text-[#0B1F33] mb-2">Minimum Attendance Policy</h4>
            <p className="text-sm text-[#5C6670] font-medium mb-6">Set the minimum attendance percentage required for students to be eligible for placements. This will reflect on their dashboard warning systems.</p>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-24 pl-4 pr-8 py-3 rounded-xl border border-[#D1C7B5] bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/50 text-lg font-bold text-[#0B1F33] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C6670] font-bold">%</span>
              </div>
              <button
                onClick={() => {
                  startTransition(async () => {
                    const { updateAttendancePolicy } = await import('./actions');
                    const res = await updateAttendancePolicy(minAttendance);
                    if (res.error) {
                      setActionError(res.error);
                    } else {
                      alert("Attendance policy updated successfully!");
                    }
                  });
                }}
                disabled={isPending}
                className="px-6 py-3 bg-[#0B1F33] text-white rounded-xl font-bold uppercase tracking-wide hover:bg-[#102A43] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
