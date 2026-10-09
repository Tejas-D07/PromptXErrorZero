"use client";

import { useEffect, useRef } from "react";
import { FileText, Download, PlayCircle, BookMarked, ArrowRight } from "lucide-react";
import gsap from "gsap";

const RESOURCES = [
  { category: "Handbooks", title: "Student Code of Conduct 2026", type: "PDF", size: "2.4 MB", icon: BookMarked },
  { category: "Templates", title: "Project Proposal Template", type: "DOCX", size: "1.1 MB", icon: FileText },
  { category: "Training", title: "Communication Skills Workshop", type: "VIDEO", size: "45 Mins", icon: PlayCircle },
  { category: "Handbooks", title: "Trainer Guidelines", type: "PDF", size: "3.8 MB", icon: BookMarked },
  { category: "Templates", title: "Weekly Progress Report", type: "XLSX", size: "850 KB", icon: FileText },
];

export default function ResourcesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".animate-in", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E6] pt-32 pb-24 font-sans" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16 text-center animate-in opacity-0">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0B1F33] mb-6 tracking-tight">Resource Center</h1>
          <div className="w-24 h-1.5 bg-[#C6A15B] mx-auto rounded-full mb-8 shadow-sm" />
          <p className="text-[#5C6670] text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Access important documents, templates, and training materials curated for our HRD community.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(11,31,51,0.03)] border border-[#EAE3D5] overflow-hidden animate-in opacity-0">
          <div className="divide-y divide-[#EAE3D5]">
            {RESOURCES.map((res, i) => (
              <div 
                key={i}
                className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:bg-[#F5F0E6]/30 transition-colors duration-300 group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B1F33] flex items-center justify-center text-[#C6A15B] shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                    <res.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-widest mb-1.5 block">
                      {res.category}
                    </span>
                    <h3 className="text-2xl font-bold text-[#0B1F33] tracking-tight">{res.title}</h3>
                    <p className="text-sm font-medium text-[#5C6670] mt-2">
                      <span className="text-[#0B1F33] font-bold">{res.type}</span> <span className="mx-2 text-[#D1C7B5]">|</span> {res.size}
                    </p>
                  </div>
                </div>
                
                <button className="w-full md:w-auto px-8 py-4 bg-[#F5F0E6] border border-[#D1C7B5] text-[#0B1F33] rounded-xl font-bold uppercase tracking-wide hover:bg-[#0B1F33] hover:text-[#C6A15B] hover:border-[#0B1F33] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm active:scale-95">
                  {res.type === 'VIDEO' ? 'Watch Now' : 'Download'}
                  {res.type === 'VIDEO' ? <PlayCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
