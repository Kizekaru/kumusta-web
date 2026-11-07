import React from "react";
import { prisma } from "@/lib/db";
import CounselorSentinel from "@/components/CounselorSentinel";
import DashboardNavbar from "@/components/DashboardNavbar";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function IncidentsPage() {
  const cookieStore = await cookies();
  const initialRole = cookieStore.get("kumusta_demo_role")?.value || "SCHOOL_ADMIN";

  const alerts = await prisma.alert.findMany({
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
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* ── TOP NAVIGATION BAR ── */}
      <DashboardNavbar current="incidents" />

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-xs font-mono font-bold text-purple-700 hover:text-purple-950 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Dashboard</span>
              </Link>
              <span className="text-purple-300">/</span>
              <span className="text-xs font-mono font-bold text-purple-900">
                Live Triage Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="text-purple-700" size={28} />
              <span>Live Triage Feed</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-900/80 font-medium">
              Real-time student incident triage, sensitivity detection, and priority queues for San Fernando, Pampanga.
            </p>
          </div>
        </div>

        {/* Live Counselor Triage Feed Component */}
        <section className="w-full">
          <CounselorSentinel initialAlerts={alerts} initialRole={initialRole} />
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-purple-100 bg-white px-8 py-6 mt-12 text-center text-xs text-purple-800/70 font-mono">
        &copy; {new Date().getFullYear()} KUMUSTA: Civic & School Predictive Well-being Sentinel. All rights reserved.
      </footer>
    </div>
  );
}
