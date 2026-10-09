"use client";

import { BarChart3, BookOpen, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Active Modules", value: "4", icon: BookOpen, color: "#0B1F33" },
  { label: "Completed Tasks", value: "12", icon: CheckCircle2, color: "#C6A15B" },
  { label: "Overall Progress", value: "68%", icon: BarChart3, color: "#B84A4A" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0B1F33] rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-[#0B1F33]/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A15B] rounded-full mix-blend-screen filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, John!</h2>
          <p className="text-[#F5F0E6]/70 mb-6">
            You have 2 assignments due this week and 1 new module available in the Leadership track.
          </p>
          <button className="bg-[#C6A15B] text-[#0B1F33] px-6 py-2.5 rounded-full font-medium hover:bg-[#9B7A3C] transition-colors shadow-lg shadow-[#C6A15B]/20">
            Continue Learning
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="bg-white p-6 rounded-2xl border border-[#EAE3D5] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-[#5C6670] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[#0B1F33]">{stat.value}</h3>
            </div>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-opacity-10"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-[#EAE3D5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EAE3D5] flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#0B1F33]">Recent Activity</h3>
          <button className="text-sm font-medium text-[#C6A15B] hover:text-[#0B1F33] transition-colors flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-[#EAE3D5]">
          {[
            { title: "Submitted Assignment: Advanced Communication", date: "2 hours ago", status: "Reviewing" },
            { title: "Completed Module: Conflict Resolution", date: "Yesterday", status: "Done" },
            { title: "Joined Cohort: Fall 2026 Leadership", date: "3 days ago", status: "Active" },
          ].map((item, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-[#F5F0E6]/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#102A43] flex items-center justify-center text-white">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F33]">{item.title}</p>
                  <p className="text-sm text-[#5C6670]">{item.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#EAE3D5] text-[#1C242B] text-xs font-medium rounded-full">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
