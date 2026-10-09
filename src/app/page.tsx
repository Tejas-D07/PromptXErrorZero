"use client";

import { ArrowRight, BookOpen, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!heroRef.current || !titleRef.current) return;
    
    gsap.fromTo(
      titleRef.current.children,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
    );

    // Subtle parallax effect with GSAP
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to(".parallax-bg", {
        x,
        y,
        duration: 1,
        ease: "power2.out",
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll(".feature-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          }
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E6] selection:bg-[#C6A15B] selection:text-[#0B1F33] font-sans">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0B1F33] text-[#F5F0E6] pt-20"
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="parallax-bg absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C6A15B] rounded-full mix-blend-screen filter blur-[120px] opacity-30" />
          <div className="parallax-bg absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#102A43] rounded-full mix-blend-screen filter blur-[150px] opacity-50" />
        </div>

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div ref={titleRef} className="max-w-4xl mx-auto text-center">
            <div>
              <span className="inline-block py-1.5 px-4 rounded-full bg-[#1C242B] border border-[#102A43] text-[#C6A15B] text-sm font-bold tracking-wide uppercase mb-8 shadow-sm">
                Next-Generation HRD Platform
              </span>
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                Empowering the Future of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6A15B] to-[#9B7A3C]">
                  Human Resources
                </span>
              </h1>
            </div>
            <div>
              <p className="text-lg md:text-xl text-[#F5F0E6]/70 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                A secure, elegant, and unified dashboard for Students, Trainers, and HRD Heads. 
                Experience seamless collaboration and actionable insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-10 py-4 bg-[#C6A15B] text-[#0B1F33] rounded-full font-bold text-lg tracking-wide uppercase hover:bg-[#9B7A3C] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group shadow-[0_0_40px_rgba(198,161,91,0.3)]"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/team" 
                className="w-full sm:w-auto px-10 py-4 bg-[#102A43] text-[#F5F0E6] rounded-full font-bold text-lg tracking-wide uppercase hover:bg-[#1C242B] transition-all border border-[#1C242B] hover:border-[#C6A15B]/50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Curve Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#F5F0E6"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-[#F5F0E6]">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-6 tracking-tight">Unified Ecosystem</h2>
            <div className="w-24 h-1.5 bg-[#C6A15B] mx-auto rounded-full" />
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
            {[
              {
                icon: <BookOpen className="w-8 h-8 text-[#C6A15B]" />,
                title: "For Students",
                desc: "Track your progress, access training materials, and communicate directly with mentors in a distraction-free environment."
              },
              {
                icon: <Users className="w-8 h-8 text-[#C6A15B]" />,
                title: "For Trainers",
                desc: "Manage cohorts, assign modules, and monitor performance with intuitive tools designed to save time."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-[#C6A15B]" />,
                title: "For HRD Heads",
                desc: "Get a bird's-eye view of all operations. Powerful analytics to ensure ROI on all training initiatives."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="feature-card bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE3D5] hover:shadow-[0_20px_60px_rgba(11,31,51,0.08)] hover:border-[#D1C7B5] transition-all duration-500 group opacity-0"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#F5F0E6] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#0B1F33] transition-all duration-500">
                  <div className="group-hover:brightness-200 transition-all duration-500">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4">{feature.title}</h3>
                <p className="text-[#5C6670] leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
