import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ManagementClient from "./ClientTable";

export default async function HRDManagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Authorize HRD
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  
  if (profile?.role !== 'hrd') {
    redirect('/dashboard');
  }

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-[#0B1F33] p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A15B] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-[#F5F0E6] mb-2 tracking-tight">Admin Management</h1>
          <p className="text-[#F5F0E6]/70 font-medium">Manage HRD team details, trainer profiles, and system access.</p>
        </div>
      </div>

      <ManagementClient initialProfiles={profiles || []} currentUserId={user.id} />
    </div>
  );
}
