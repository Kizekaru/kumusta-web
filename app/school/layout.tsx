import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import CopilotChat from "@/components/CopilotChat";

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-lg text-accent-teal tracking-tight">KUMUSTA</span>
          <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-mono border border-slate-200 text-slate-500 rounded font-semibold font-mono">SCHOOL ADMIN</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex gap-6 text-sm font-sans text-slate-600 font-semibold">
            <Link href="/school/dashboard" className="hover:text-slate-900 transition">Dashboard</Link>
            <Link href="/school/requests" className="hover:text-slate-900 transition">Support Requests</Link>
            <Link href="/school/alerts" className="hover:text-slate-900 transition">Crisis Feed</Link>
          </nav>
          <div className="border-l border-slate-200 pl-4 h-6 flex items-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full">{children}</main>
      <CopilotChat />
    </div>
  );
}
