"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Mail, Clock, CalendarDays, Filter } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";

const EXPERTISE_FILTERS = ["All", "Leadership", "Technical", "Placement", "Relations"];

export default function TeamDirectory() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrainers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['trainer', 'hrd']);

      if (data) {
        // Map data to expected format, providing fallbacks for missing schema fields
        const formattedTrainers = data.map((profile, i) => ({
          id: profile.id,
          name: profile.full_name || "Unknown Name",
          role: profile.role === 'hrd' ? "Senior HRD Mentor" : "Trainer",
          expertise: ["Leadership", "Technical"], // Fallback if missing
          officeHours: "Check portal for hours",
          email: profile.email || "contact@hrdconnect.edu",
          image: ``
        }));
        setTrainers(formattedTrainers);
      }
      setLoading(false);
    }
    loadTrainers();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "All") return matchesSearch;

    const matchesFilter = trainer.expertise.some((exp: string) => {
      if (activeFilter === "Leadership" && (exp.includes("Leadership") || exp.includes("Behavior"))) return true;
      if (activeFilter === "Technical" && (exp.includes("Data") || exp.includes("Tech"))) return true;
      if (activeFilter === "Placement" && (exp.includes("Placement") || exp.includes("Soft"))) return true;
      if (activeFilter === "Relations" && (exp.includes("Industry") || exp.includes("Negotiation"))) return true;
      return false;
    });

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".trainer-card");
      gsap.fromTo(cards,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-[#F5F0E6] pt-24 pb-20 font-sans">
      <div className="bg-[#0B1F33] py-20 px-6 text-center relative overflow-hidden border-b border-[#102A43]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A15B] rounded-full mix-blend-screen filter blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />
        </div>
        <div
          ref={headerRef}
          className="relative z-10 max-w-3xl mx-auto text-[#F5F0E6] opacity-0"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Team Directory</h1>
          <p className="text-[#F5F0E6]/80 text-lg md:text-xl font-medium">Connect with our world-class trainers, mentors, and industry experts.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 max-w-6xl">
        {/* Search & Filter */}
        <div className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE3D5] flex flex-col md:flex-row gap-5 mb-16">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5C6670] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-[#F5F0E6]/30 rounded-2xl border border-transparent focus:border-[#D1C7B5] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10 transition-all text-[#0B1F33] outline-none font-medium"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0 items-center px-2">
            <Filter className="w-5 h-5 text-[#C6A15B] mr-2 ml-2 hidden md:block" />
            {EXPERTISE_FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold uppercase tracking-wide transition-all",
                  activeFilter === filter
                    ? "bg-[#0B1F33] text-[#C6A15B] shadow-md border border-[#102A43]"
                    : "bg-[#F5F0E6]/50 text-[#5C6670] hover:bg-[#EAE3D5] border border-transparent"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 gap-8 md:gap-10">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="trainer-card opacity-0 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#EAE3D5] flex flex-col sm:flex-row gap-8 hover:shadow-[0_20px_60px_rgba(11,31,51,0.08)] hover:border-[#D1C7B5] transition-all duration-300 group"
            >
              <div className="shrink-0 flex justify-center sm:block">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#F5F0E6] p-1 bg-white shadow-sm group-hover:border-[#C6A15B] transition-colors duration-300">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-1.5 tracking-tight">{trainer.name}</h3>
                <p className="text-[#C6A15B] font-bold text-sm tracking-wide uppercase mb-5">{trainer.role}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-[#5C6670] font-medium">
                    <Clock className="w-4 h-4 text-[#C6A15B]" />
                    <span>{trainer.officeHours}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-[#5C6670] font-medium">
                    <Mail className="w-4 h-4 text-[#C6A15B]" />
                    <a href={`mailto:${trainer.email}`} className="hover:text-[#0B1F33] transition-colors underline decoration-[#C6A15B]/30 hover:decoration-[#C6A15B] underline-offset-4">{trainer.email}</a>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                  {trainer.expertise.map((exp: string) => (
                    <span key={exp} className="px-3 py-1 bg-[#F5F0E6] text-[#1C242B] text-xs font-bold uppercase tracking-wider rounded-lg border border-[#EAE3D5]">
                      {exp}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <button className="w-full px-6 py-3.5 bg-[#F5F0E6] text-[#0B1F33] border border-[#D1C7B5] rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-[#0B1F33] hover:text-[#C6A15B] hover:border-[#0B1F33] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                    <CalendarDays className="w-4 h-4" />
                    Book slot
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTrainers.length === 0 && (
          <div className="text-center py-24 text-[#5C6670] bg-white rounded-3xl border border-dashed border-[#D1C7B5]">
            <Search className="w-10 h-10 mx-auto text-[#D1C7B5] mb-4" />
            <p className="font-bold text-lg text-[#0B1F33]">No trainers found</p>
            <p className="text-sm font-medium mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
