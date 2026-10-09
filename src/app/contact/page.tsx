"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import gsap from "gsap";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".animate-left", {
        opacity: 0,
        x: -40,
        duration: 0.8,
        ease: "power3.out"
      });
      gsap.from(".animate-right", {
        opacity: 0,
        x: 40,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", role: "student", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] pt-32 pb-24 font-sans" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          
          {/* Contact Info */}
          <div className="animate-left space-y-10">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#0B1F33] mb-6 tracking-tight">Get in Touch</h1>
              <p className="text-[#5C6670] text-lg font-medium leading-relaxed max-w-lg">
                Whether you&apos;re a student seeking guidance, a recruiter looking to hire, or a trainer wanting to join our ranks — we&apos;re here to help.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: MapPin, text: "123 University Avenue, Innovation Block, 4th Floor" },
                { icon: Mail, text: "support@hrdconnect.edu" },
                { icon: Phone, text: "+1 (555) 123-4567" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B1F33] flex items-center justify-center text-[#C6A15B] shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[#0B1F33] font-bold text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="animate-right bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE3D5]">
            <h2 className="text-3xl font-bold text-[#0B1F33] mb-8 tracking-tight">Send a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#5C6670] uppercase tracking-wider mb-2">I am a...</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-5 py-4 bg-[#F5F0E6]/30 border border-[#D1C7B5] rounded-2xl focus:border-[#0B1F33] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10 transition-all outline-none font-bold text-[#0B1F33] appearance-none cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="recruiter">Recruiter / HR</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#5C6670] uppercase tracking-wider mb-2">Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-[#F5F0E6]/30 border border-[#D1C7B5] rounded-2xl focus:border-[#0B1F33] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10 transition-all outline-none font-medium text-[#0B1F33]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5C6670] uppercase tracking-wider mb-2">Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-4 bg-[#F5F0E6]/30 border border-[#D1C7B5] rounded-2xl focus:border-[#0B1F33] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10 transition-all outline-none font-medium text-[#0B1F33]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5C6670] uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-5 py-4 bg-[#F5F0E6]/30 border border-[#D1C7B5] rounded-2xl focus:border-[#0B1F33] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10 transition-all outline-none font-medium text-[#0B1F33] resize-none" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#0B1F33] text-[#F5F0E6] py-5 rounded-2xl font-bold uppercase tracking-wide hover:bg-[#102A43] hover:text-[#C6A15B] transition-all duration-300 flex items-center justify-center gap-3 group shadow-[0_8px_20px_rgba(11,31,51,0.1)] active:scale-95 mt-4"
              >
                {submitted ? "Message Sent Successfully!" : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
