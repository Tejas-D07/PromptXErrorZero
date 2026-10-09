"use client";

import { useState, useTransition } from "react";
import { updateProfileRole } from "./actions";
import { UserCog, ShieldCheck, Search, AlertCircle, CheckCircle2 } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default function ManagementClient({ initialProfiles, currentUserId }: { initialProfiles: Profile[], currentUserId: string }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(search.toLowerCase()) || 
    (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRoleChange = (userId: string, newRole: string) => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfileRole(userId, newRole);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: "Role updated successfully." });
        setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EAE3D5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] flex items-center gap-3">
              <UserCog className="w-7 h-7 text-[#C6A15B]" />
              Role Management
            </h2>
            <p className="text-[#5C6670] mt-2 font-medium">Elevate user privileges and manage system access.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#5C6670]" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F5F0E6]/50 border border-[#D1C7B5] rounded-xl focus:bg-white focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 transition-all outline-none font-medium text-[#0B1F33]"
            />
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'error' ? 'bg-[#B84A4A]/10 border-[#B84A4A]/20 text-[#B84A4A]' : 'bg-[#4AB870]/10 border-[#4AB870]/20 text-[#4AB870]'}`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-semibold">{message.text}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE3D5]">
                <th className="py-4 px-6 text-[#5C6670] font-bold text-sm uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-[#5C6670] font-bold text-sm uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-[#5C6670] font-bold text-sm uppercase tracking-wider">Current Role</th>
                <th className="py-4 px-6 text-[#5C6670] font-bold text-sm uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(profile => (
                <tr key={profile.id} className="border-b border-[#EAE3D5]/50 hover:bg-[#F5F0E6]/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-[#0B1F33]">
                    {profile.full_name || 'Unnamed User'}
                    {profile.id === currentUserId && <span className="ml-2 text-xs bg-[#C6A15B]/20 text-[#C6A15B] px-2 py-1 rounded-full font-bold">You</span>}
                  </td>
                  <td className="py-4 px-6 text-[#5C6670] font-medium">{profile.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${profile.role === 'hrd' ? 'bg-[#0B1F33] text-[#C6A15B]' : 
                        profile.role === 'trainer' ? 'bg-[#C6A15B]/20 text-[#9B7A3C]' : 
                        'bg-[#F5F0E6] text-[#5C6670] border border-[#D1C7B5]'}`}
                    >
                      {profile.role === 'hrd' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {profile.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      disabled={isPending || profile.id === currentUserId}
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                      className="bg-white border border-[#D1C7B5] text-[#0B1F33] font-bold text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C6A15B]/50 focus:border-[#C6A15B] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="student">Student</option>
                      <option value="trainer">Trainer</option>
                      <option value="hrd">HRD Head</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#5C6670] font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
