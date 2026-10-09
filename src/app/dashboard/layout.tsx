"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Adjust menu items dynamically based on role
const getMenuItems = (role: string) => {
  const base = [{ icon: LayoutDashboard, label: "Overview", href: `/dashboard/${role}` }];
  
  if (role === 'student') {
    return base;
  }
  if (role === 'trainer') {
    return [...base, { icon: Users, label: "My Classes", href: `/dashboard/${role}/classes` }];
  }
  if (role === 'hrd') {
    return [
      ...base, 
      { icon: Users, label: "Admin Management", href: `/dashboard/${role}/management` }
    ];
  }
  
  return base;
};

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; role: string | null }>({ full_name: "Loading...", role: "" });
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  // Page Transition Effect on route change
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = getMenuItems(profile.role || 'student');

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0B1F33]/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0B1F33] border-r border-[#102A43] flex flex-col z-50 transition-transform duration-400 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#C6A15B] flex items-center justify-center text-[#0B1F33] font-bold text-xl group-hover:bg-[#9B7A3C] transition-colors shadow-md shrink-0">
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
          <button 
            className="lg:hidden text-[#F5F0E6]/70 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="text-[10px] font-bold text-[#F5F0E6]/40 uppercase tracking-widest mb-4 ml-2">
            Menu
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group",
                    active 
                      ? "text-[#C6A15B] bg-[#102A43] font-bold shadow-inner" 
                      : "text-[#F5F0E6]/70 hover:text-[#F5F0E6] hover:bg-[#1C242B] font-semibold"
                  )}
                >
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 bg-[#C6A15B] transition-transform duration-300",
                    active ? "scale-y-100" : "scale-y-0"
                  )} />
                  <item.icon className={cn("w-5 h-5 transition-colors", active ? "text-[#C6A15B]" : "group-hover:text-[#F5F0E6]")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#102A43]">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-11 h-11 rounded-full bg-[#102A43] border-2 border-[#1C242B] flex items-center justify-center text-[#C6A15B] font-bold uppercase text-lg shadow-inner">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[#F5F0E6] text-sm font-bold truncate">{profile.full_name || 'Loading...'}</p>
              <p className="text-[#F5F0E6]/60 text-xs font-semibold capitalize truncate">{profile.role || 'User'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-[#B84A4A] hover:text-[#F5F0E6] hover:bg-[#B84A4A] transition-all w-full px-4 py-3 rounded-xl font-bold text-sm group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-white border-b border-[#EAE3D5] flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-5">
            <button 
              className="lg:hidden p-2.5 -ml-2 text-[#0B1F33] hover:bg-[#F5F0E6] rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#0B1F33] hidden sm:block tracking-tight">
              {menuItems.find(i => i.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-[#5C6670] hover:text-[#0B1F33] hover:bg-[#F5F0E6] rounded-xl transition-all border border-transparent hover:border-[#EAE3D5]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#B84A4A] rounded-full border-2 border-white shadow-sm"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-10">
          <div ref={contentRef} className="max-w-7xl mx-auto opacity-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F0E6]">Loading...</div>}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
