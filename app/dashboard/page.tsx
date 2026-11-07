import React from "react";
import { prisma } from "@/lib/db";
import CounselorSentinel from "@/components/CounselorSentinel";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";
import {
  ShieldAlert,
  School as SchoolIcon,
  TrendingUp,
  ArrowRight
} from "lucide-react";

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const initialRole = cookieStore.get("kumusta_demo_role")?.value || "SCHOOL_ADMIN";

  // 1. Fetch initial alerts with school relations
  const [alerts, totalSchools, criticalCount] = await Promise.all([
    prisma.alert.findMany({
      include: {
        school: {
          select: {
            id: true,
            name: true,
            division: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.school.count(),
    prisma.alert.count({ where: { severity: "CRITICAL", status: "OPEN" } }),
  ]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* ── TOP NAVIGATION BAR ─────────────────────────────────────── */}
      <DashboardNavbar current="dashboard" />

      {/* ── MAIN DASHBOARD CONTAINER ────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex flex-col gap-8">
        {/* ── KPI METRICS (SOLID PURPLE MODERN CARDS WITH HIGH-IMPACT POPPING NUMBERS) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Monitored Schools */}
          <div className="bg-purple-900 border border-purple-800 hover:border-purple-700 rounded-3xl p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-6 group text-white">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-200">
                  Monitored Schools
                </span>
                <span className="text-xs text-purple-300/90 font-medium">
                  Active campus network
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-800/90 text-purple-200 border border-purple-700 flex items-center justify-center group-hover:bg-purple-700/80 transition-colors shadow-inner">
                <SchoolIcon size={28} />
              </div>
            </div>

            <div className="flex items-baseline gap-3.5 my-1">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono drop-shadow-sm">
                {totalSchools}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-purple-800/90 text-purple-100 border border-purple-700 shadow-2xs">
                Campuses
              </span>
            </div>

            <div className="pt-4 border-t border-purple-800/80 flex items-center gap-2 text-xs font-mono font-medium text-purple-200">
              <TrendingUp size={16} className="text-purple-300 shrink-0" />
              <span className="truncate">100% Pampanga Division Coverage</span>
            </div>
          </div>

          {/* Card 2: Critical Hotspots */}
          <div className="bg-purple-900 border border-purple-800 hover:border-purple-700 rounded-3xl p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-6 group text-white">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-200">
                  Critical Hotspots
                </span>
                <span className="text-xs text-purple-300/90 font-medium">
                  Immediate attention required
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-800/90 text-purple-200 border border-purple-700 flex items-center justify-center group-hover:bg-purple-700/80 transition-colors shadow-inner">
                <ShieldAlert size={28} />
              </div>
            </div>

            <div className="flex items-baseline gap-3.5 my-1">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono drop-shadow-sm">
                {criticalCount}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-purple-800/90 text-purple-100 border border-purple-700 shadow-2xs">
                Urgent Priority
              </span>
            </div>

            <div className="pt-4 border-t border-purple-800/80 flex items-center justify-between text-xs font-mono font-medium text-purple-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-pulse shrink-0" />
                <span className="truncate">Immediate Counselor Action</span>
              </div>
              <Link
                href="/dashboard/map"
                className="text-purple-200 hover:text-white flex items-center gap-1 hover:underline text-xs font-bold transition-colors"
              >
                <span>Map</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── PANEL 1: LIVE TRIAGE FEED ──────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-black text-purple-950 tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-purple-700" size={24} />
              <span>Admin Alert Queue</span>
            </h2>
            <Link
              href="/dashboard/incidents"
              className="self-start sm:self-auto px-4 py-2 rounded-xl border border-purple-200 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs transition-colors flex items-center gap-2"
            >
              Open full queue
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="rounded-3xl border border-purple-100/70 bg-slate-50/60 p-3 sm:p-5">
            <CounselorSentinel initialAlerts={alerts} initialRole={initialRole} />
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-purple-100 bg-white px-8 py-6 mt-12 text-center text-xs text-purple-800/70 font-mono">
        &copy; {new Date().getFullYear()} KUMUSTA: Civic & School Predictive Well-being Sentinel. All rights reserved.
      </footer>
    </div>
  );
}
