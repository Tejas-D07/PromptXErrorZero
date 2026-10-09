"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isHiddenRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login");

  if (isHiddenRoute) return null;

  return (
    <footer className="bg-[#0B1F33] border-t border-[#102A43] py-12 px-6 md:px-8 font-sans">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex items-center gap-3 group mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#C6A15B] flex items-center justify-center text-[#0B1F33] font-bold text-lg group-hover:bg-[#9B7A3C] transition-colors shadow-md shrink-0">
              H
            </div>
            <div className="flex flex-col">
              <span className="text-[#F5F0E6] text-xl font-bold tracking-tight leading-none">
                HRD <span className="text-[#C6A15B]">Connect</span>
              </span>
              <span className="text-[#F5F0E6]/70 text-[9px] font-semibold tracking-wider uppercase mt-1">
                Sapthagiri NPS University
              </span>
            </div>
          </Link>
          <p className="text-[#5C6670] text-sm font-medium mt-4 max-w-sm">
            Empowering students and trainers with seamless HRD management, attendance tracking, and comprehensive placement resources.
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-[#F5F0E6] font-bold text-sm uppercase tracking-wider mb-1">Platform</h4>
            <Link href="/team" className="text-[#5C6670] hover:text-[#C6A15B] text-sm font-medium transition-colors">Team Directory</Link>
            <Link href="/resources" className="text-[#5C6670] hover:text-[#C6A15B] text-sm font-medium transition-colors">Resources</Link>
            <Link href="/contact" className="text-[#5C6670] hover:text-[#C6A15B] text-sm font-medium transition-colors">Contact</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[#F5F0E6] font-bold text-sm uppercase tracking-wider mb-1">Legal</h4>
            <Link href="/policies" className="text-[#5C6670] hover:text-[#C6A15B] text-sm font-medium transition-colors">Policies</Link>
            <span className="text-[#5C6670] text-sm font-medium transition-colors cursor-not-allowed">Privacy</span>
            <span className="text-[#5C6670] text-sm font-medium transition-colors cursor-not-allowed">Terms</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-[#1C242B] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[#5C6670] text-xs font-bold uppercase tracking-widest">
          &copy; 2026 Sapthagiri NPS University. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
