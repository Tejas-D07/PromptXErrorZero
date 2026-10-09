"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Users, Calendar, ArrowUpRight, BarChart3, Clock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import gsap from "gsap";

export default function TrainerDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadClasses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('classes')
        .select('*, enrollments(count)')
        .eq('trainer_id', user.id);
        
      if (data && data.length > 0) {
        setClasses(data);
      }
      setLoading(false);
    }
    loadClasses();
  }, [supabase]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".animate-up");
      gsap.fromTo(elements, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading]);

  return (
    <div className="space-y-8 font-sans" ref={containerRef}>
      <div className="animate-up opacity-0 bg-[#0B1F33] rounded-3xl p-8 relative overflow-hidden shadow-xl border border-[#102A43]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A15B] rounded-full mix-blend-screen filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Trainer Overview</h2>
          <p className="text-[#F5F0E6]/80 font-medium mb-2">
            Manage your assigned classes, track attendance, and monitor cohort performance.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Assigned Classes", value: classes.length.toString(), icon: BookOpen, color: "#0B1F33" },
          { label: "Active Cohorts", value: classes.length.toString(), icon: Users, color: "#C6A15B" },
          { label: "Live Tracking", value: "Active", icon: BarChart3, color: "#B84A4A" },
        ].map((stat, i) => (
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

      {/* Assigned Classes */}
      <div className="animate-up opacity-0 bg-white rounded-3xl border border-[#EAE3D5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-8 border-b border-[#EAE3D5] bg-[#F5F0E6]/30">
          <h3 className="text-xl font-bold text-[#0B1F33] tracking-tight">My Active Classes</h3>
        </div>
        
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#C6A15B]" />
          </div>
        ) : classes.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-[#F5F0E6]/10">
            <AlertCircle className="w-12 h-12 text-[#D1C7B5] mb-4" />
            <h4 className="text-lg font-bold text-[#0B1F33] mb-2">No Assigned Classes</h4>
            <p className="text-[#5C6670] font-medium">You haven't been assigned to any cohorts yet. Please contact the HRD Head.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE3D5]">
            {classes.map((c, i) => (
              <div 
                key={c.id} 
                className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#F5F0E6]/30 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B1F33] flex items-center justify-center text-[#C6A15B] shadow-inner">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0B1F33] text-xl tracking-tight">{c.name}</h4>
                    <div className="flex items-center gap-4 text-sm font-medium text-[#5C6670] mt-1.5">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#C6A15B]" /> {c.enrollments[0]?.count || 0} Enrolled Students</span>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/dashboard/trainer/classes/${c.id}`}
                  className="px-6 py-3 bg-white text-[#0B1F33] border border-[#D1C7B5] rounded-xl font-bold tracking-wide uppercase hover:bg-[#C6A15B] hover:text-[#0B1F33] hover:border-[#C6A15B] transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-95"
                >
                  Manage Class
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
