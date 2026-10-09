"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { login } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      const res = await login(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        if (cardRef.current) {
          gsap.fromTo(cardRef.current, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E6] relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#EAE3D5] mix-blend-multiply opacity-50 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#D1C7B5] mix-blend-multiply opacity-50 blur-[120px]" />
      </div>

      <div ref={cardRef} className="w-full max-w-md relative z-10 opacity-0">
        <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(11,31,51,0.08)] overflow-hidden border border-[#EAE3D5]">
          <div className="p-10 sm:p-12">
            <div className="w-14 h-14 bg-[#0B1F33] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#0B1F33]/20">
              <Lock className="w-6 h-6 text-[#C6A15B]" />
            </div>
            
            <h1 className="text-3xl font-bold text-[#0B1F33] mb-1 tracking-tight">HRD Connect</h1>
            <h2 className="text-sm font-bold text-[#C6A15B] uppercase tracking-wider mb-8">Sapthagiri NPS University</h2>
            
            <p className="text-[#0B1F33] font-medium mb-8 leading-relaxed text-sm bg-[#F5F0E6]/50 p-4 rounded-xl border border-[#D1C7B5]">
              Please enter your credentials to securely access the HRD portal.
            </p>

            {errorMsg && (
              <div className="mb-8 p-4 bg-[#B84A4A]/10 border border-[#B84A4A]/20 rounded-xl flex items-center gap-3 text-[#B84A4A]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0B1F33]">Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#D1C7B5] bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B] transition-all text-[#0B1F33] placeholder:text-[#5C6670] font-medium shadow-sm"
                  placeholder="name@college.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#0B1F33]">Password</label>
                  <Link href="#" className="text-xs text-[#0B1F33] font-bold hover:text-[#C6A15B] transition-colors bg-[#F5F0E6] px-2 py-1 rounded-md">
                    Forgot password?
                  </Link>
                </div>
                <input 
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#D1C7B5] bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A15B] transition-all text-[#0B1F33] placeholder:text-[#5C6670] font-medium shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#0B1F33] text-[#F5F0E6] py-4 rounded-xl font-bold mt-2 hover:bg-[#102A43] transition-all hover:shadow-[0_12px_30px_rgba(11,31,51,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-[#F5F0E6]/20 border-t-[#F5F0E6] rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Footer Area */}
          <div className="bg-[#102A43] px-10 py-6 text-center border-t border-[#0B1F33]">
            <p className="text-[#F5F0E6] text-sm font-medium">
              Don&apos;t have an account? <Link href="/contact" className="text-[#C6A15B] font-bold hover:text-white transition-colors ml-1 underline decoration-2 underline-offset-4">Request access</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
