"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ShieldAlert, Scale, CheckCircle } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const POLICIES = [
  {
    title: "Anti-Harassment & Discrimination",
    icon: ShieldAlert,
    content: "HRD Connect maintains a zero-tolerance policy for harassment and discrimination. All participants are expected to maintain a professional and respectful environment regardless of race, gender, religion, or background."
  },
  {
    title: "Academic Integrity & Fair Play",
    icon: Scale,
    content: "All submitted assignments, modules, and assessments must be original work. Plagiarism or unauthorized assistance will result in immediate disciplinary action and potential removal from the placement program."
  },
  {
    title: "Attendance & Participation",
    icon: CheckCircle,
    content: "A minimum of 85% attendance in all enrolled HRD modules is mandatory to qualify for the final placement drives. Exceptions are only made for documented medical emergencies."
  }
];

export default function PoliciesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-16 text-center animate-in opacity-0">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0B1F33] mb-6 tracking-tight">Official Policies</h1>
          <div className="w-24 h-1.5 bg-[#C6A15B] mx-auto rounded-full mb-8 shadow-sm" />
          <p className="text-[#5C6670] text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Guidelines and regulations ensuring a safe, fair, and productive environment for everyone.
          </p>
        </div>

        <div className="space-y-6">
          {POLICIES.map((policy, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="animate-in opacity-0 bg-white border border-[#EAE3D5] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(11,31,51,0.06)] hover:border-[#D1C7B5] transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-[#F5F0E6]/30 transition-colors focus:outline-none group"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner",
                      isOpen ? "bg-[#0B1F33] text-[#C6A15B]" : "bg-[#F5F0E6] text-[#1C242B] group-hover:bg-[#EAE3D5]"
                    )}>
                      <policy.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-[#0B1F33] tracking-tight">{policy.title}</span>
                  </div>
                  <ChevronDown className={cn("w-6 h-6 text-[#5C6670] transition-transform duration-500", isOpen && "rotate-180 text-[#C6A15B]")} />
                </button>
                
                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-500 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 md:p-8 pt-0 text-[#5C6670] font-medium leading-relaxed border-t border-[#EAE3D5] mt-2 bg-[#F5F0E6]/10">
                      <div className="pt-6 text-lg">{policy.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
