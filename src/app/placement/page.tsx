"use client";

import { useEffect, useRef } from "react";
import { Building2, TrendingUp, Award, Briefcase } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PlacementPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".hero-text", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });

      // Stats Animation
      gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Timeline Animation
      gsap.from(".timeline-item", {
        scrollTrigger: {
          trigger: ".timeline-container",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E6] pt-32 pb-24 font-sans" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-20">
          <h1 className="hero-text text-5xl md:text-7xl font-bold text-[#0B1F33] mb-6 tracking-tight">
            Placement <span className="text-[#C6A15B]">Excellence</span>
          </h1>
          <p className="hero-text text-[#5C6670] text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Discover our stellar track record. We connect our highly-trained students with top-tier organizations globally.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid md:grid-cols-4 gap-6 mb-24">
          {[
            { label: "Placement Rate", value: "96%", icon: TrendingUp },
            { label: "Partner Companies", value: "150+", icon: Building2 },
            { label: "Highest Package", value: "$120k", icon: Award },
            { label: "Offers Made", value: "850+", icon: Briefcase },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="stat-card bg-[#0B1F33] text-white p-8 rounded-[2rem] text-center relative overflow-hidden group shadow-[0_20px_50px_rgba(11,31,51,0.15)] border border-[#102A43]"
            >
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <stat.icon className="w-32 h-32 text-[#C6A15B]" />
              </div>
              <h3 className="text-5xl font-bold text-[#C6A15B] mb-3 relative z-10 tracking-tight">{stat.value}</h3>
              <p className="text-[#F5F0E6] font-bold text-sm uppercase tracking-wider relative z-10 opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE3D5]">
          <h2 className="text-4xl font-bold text-[#0B1F33] mb-16 text-center tracking-tight">Upcoming Drive Timeline</h2>
          <div className="timeline-container space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[3px] before:bg-gradient-to-b before:from-[#0B1F33]/0 before:via-[#C6A15B]/50 before:to-[#0B1F33]/0">
            {[
              { date: "Oct 15, 2026", title: "Pre-Placement Talks", desc: "Interactive sessions with industry leaders outlining expectations and roles." },
              { date: "Nov 01, 2026", title: "Aptitude Assessments", desc: "First round of technical and cognitive evaluations by partner firms." },
              { date: "Nov 20, 2026", title: "Technical Interviews", desc: "Intensive 1-on-1 interviews with company representatives and engineers." },
              { date: "Dec 05, 2026", title: "Final HR Rounds", desc: "Final cultural fit assessments and official offer rollouts." }
            ].map((event, idx) => (
              <div 
                key={idx} 
                className="timeline-item relative flex flex-col md:flex-row items-start md:items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-white bg-[#0B1F33] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 ml-0 mr-6 md:mx-auto absolute md:static left-0 top-0 mt-4 md:mt-0">
                  <div className="w-3 h-3 rounded-full bg-[#C6A15B] group-hover:scale-150 transition-transform duration-300"></div>
                </div>
                
                <div className="w-full pl-20 md:pl-0 md:w-[calc(50%-3rem)]">
                  <div className="bg-[#F5F0E6]/50 hover:bg-[#F5F0E6] p-8 rounded-3xl shadow-sm border border-[#EAE3D5] hover:border-[#D1C7B5] transition-all duration-300">
                    <div className="inline-block px-3 py-1 bg-[#0B1F33] text-[#C6A15B] text-xs font-bold uppercase tracking-wider rounded-lg mb-4">
                      {event.date}
                    </div>
                    <h4 className="text-2xl font-bold text-[#0B1F33] mb-3 tracking-tight">{event.title}</h4>
                    <p className="text-[#5C6670] font-medium leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
