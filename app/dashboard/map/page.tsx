import React from "react";
import MunicipalHeatmapWrapper from "@/components/MunicipalHeatmapWrapper";
import DashboardNavbar from "@/components/DashboardNavbar";
import { MapPin, ShieldAlert, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MunicipalMapPage() {
  const [totalSchools, criticalAlerts] = await Promise.all([
    prisma.school.count(),
    prisma.alert.count({ where: { severity: "CRITICAL", status: "OPEN" } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900 xl:h-dvh xl:min-h-0 xl:overflow-hidden">
      {/* ── TOP NAVIGATION BAR ── */}
      <DashboardNavbar current="map" />

      {/* ── MAIN CONTENT ── */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 p-3 sm:p-4 lg:gap-4 lg:p-5 xl:min-h-0 xl:overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-purple-100 pb-3 sm:flex-row sm:items-center xl:shrink-0">
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
                Live Monitoring Map
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight flex items-center gap-2.5">
              <MapPin className="text-purple-700" size={28} />
              <span>City of San Fernando Municipal Anomaly Heatmap</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-900/80 font-medium">
              Geospatial distribution of student well-being density and school risk indicators across San Fernando, Pampanga.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2">
              <Building2 size={15} className="text-purple-700" />
              <span className="text-xs font-mono font-bold text-purple-950">
                {totalSchools} Schools on network
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
              <ShieldAlert size={15} className="text-rose-700" />
              <span className="text-xs font-mono font-bold text-purple-950">
                {criticalAlerts} Open Critical Alerts
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Heatmap Canvas */}
        <section className="w-full xl:min-h-0 xl:flex-1">
          <MunicipalHeatmapWrapper />
        </section>
      </main>
    </div>
  );
}
