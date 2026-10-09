"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isHiddenRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login");

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100 },
        { y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [mobileMenuOpen]);

  if (isHiddenRoute) return null;

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-out font-sans",
        scrolled
          ? "bg-[#0B1F33]/95 backdrop-blur-xl shadow-lg shadow-[#0B1F33]/10 py-4 border-b border-[#1C242B]/50"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#C6A15B] flex items-center justify-center text-[#0B1F33] font-bold text-xl group-hover:bg-[#9B7A3C] transition-colors shadow-md shrink-0">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-[#F5F0E6] text-2xl font-bold tracking-tight leading-none">
              HRD <span className="text-[#C6A15B]">Connect</span>
            </span>
            <span className="text-[#F5F0E6]/70 text-[10px] font-semibold tracking-wider uppercase mt-1">
              Sapthagiri NPS University
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {[
            ["Home", "/"],
            ["Team", "/team"],
            ["Resources", "/resources"],
            ["Policies", "/policies"],
            ["Placement", "/placement"],
            ["Contact", "/contact"],
          ].map(([title, url]) => (
            <Link
              key={title}
              href={url}
              className="relative text-[#F5F0E6]/80 hover:text-[#C6A15B] text-sm font-bold tracking-wide uppercase transition-colors group"
            >
              {title}
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C6A15B] scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-300" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="text-[#F5F0E6] text-sm font-bold tracking-wide hover:text-[#C6A15B] transition-colors uppercase"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-[#C6A15B] text-[#0B1F33] px-6 py-2.5 rounded-full text-sm font-bold tracking-wide uppercase hover:bg-[#9B7A3C] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(198,161,91,0.2)]"
          >
            Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden text-[#F5F0E6] hover:text-[#C6A15B] transition-colors p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-full left-0 w-full bg-[#102A43]/95 backdrop-blur-xl shadow-2xl md:hidden py-6 border-t border-[#1C242B]"
        >
          <div className="flex flex-col gap-6 px-8">
            {[
              ["Home", "/"],
              ["Team Directory", "/team"],
              ["Resources", "/resources"],
              ["Policies", "/policies"],
              ["Placement Info", "/placement"],
              ["Contact", "/contact"],
              ["Sign In", "/login"],
            ].map(([title, url]) => (
              <Link
                key={title}
                href={url}
                className="text-[#F5F0E6] text-lg font-bold tracking-wide hover:text-[#C6A15B] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
