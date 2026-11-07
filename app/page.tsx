import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Radio,
  Activity,
  Building2
} from "lucide-react";
import DemoEntryButtons from "@/components/DemoEntryButtons";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      {/* ── HEADER / NAVBAR ────────────────────────────────────────── */}
      <header className="border-b border-purple-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex justify-between items-center">
          {/* KUMUSTA Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shadow-2xs group-hover:border-purple-300 transition-colors p-1 overflow-hidden">
              <Image
                src="/logo.png"
                alt="KUMUSTA Logo"
                width={36}
                height={36}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-purple-950">
                KUMUSTA
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-200">
                PAMPANGA
              </span>
            </div>
          </Link>

          {/* Launch Sentinel Button */}
          <Link
            href="/dashboard"
            className="bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm border border-purple-900 flex items-center gap-2"
          >
            <span className="font-bold">Launch Sentinel</span>
            <ArrowRight size={14} className="text-purple-200" />
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-14 lg:py-20 text-center gap-7">
        {/* High-Impact Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold font-mono tracking-wide shadow-2xs">
          <Radio size={14} className="text-purple-700" />
          <span className="font-bold">PAMPANGA PROVINCIAL EARLY INTERVENTION SENTINEL MESH</span>
        </div>

        {/* Main Title (Inter Font: Deep Purple Contrast) */}
        <div className="flex flex-col gap-4 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-purple-950 leading-[1.12]">
            Predictive Mental Health Sentinel for Public Schools & LGUs.
          </h1>
          <p className="text-base sm:text-lg lg:text-xl font-medium text-purple-900/80 max-w-3xl mx-auto leading-relaxed">
            <span className="italic font-semibold text-purple-950">Bridging DepEd campus counseling offices with municipal early-intervention telemetry.</span>{" "}
            Sub-second crisis triage, culturally safe de-escalation protocols, and real-time civic anomaly heatmaps.
          </p>
        </div>

        {/* Demonstration Mock Account Fast Selectors */}
        <DemoEntryButtons />

        {/* Primary Action Group */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-sm border border-purple-900 flex items-center gap-2.5 text-sm"
          >
            <span className="font-bold">Launch Sentinel Console</span>
            <ArrowRight size={16} className="text-purple-200" />
          </Link>
          <Link
            href="/dashboard/incidents"
            className="bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold px-6 py-3.5 rounded-xl transition-all border border-purple-200 text-sm flex items-center gap-2"
          >
            <Activity size={16} className="text-purple-700" />
            <span className="font-bold">Live Triage Feed</span>
          </Link>
          <Link
            href="/dashboard/map"
            className="bg-white hover:bg-purple-50 text-purple-900 font-bold px-6 py-3.5 rounded-xl transition-all border border-purple-200 text-sm flex items-center gap-2"
          >
            <Building2 size={16} className="text-purple-700" />
            <span className="font-bold">Municipal Map</span>
          </Link>
        </div>

        {/* Key Metrics Strip (Pure Shades of Purple) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-4 text-left">
          <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition-all">
            <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
              INTERVENTION SPEED
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1 font-mono tracking-tight">
              &lt; 180s
            </div>
            <p className="text-xs font-medium text-purple-900/70 mt-1">
              Median time to guidance counselor triage dispatch
            </p>
          </div>

          <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition-all">
            <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
              CAMPUS COVERAGE
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1 font-mono tracking-tight">
              38+
            </div>
            <p className="text-xs font-medium text-purple-900/70 mt-1">
              Public high schools integrated across Pampanga
            </p>
          </div>

          <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition-all">
            <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
              PRIVACY STANDARD
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1 font-mono tracking-tight">
              100%
            </div>
            <p className="text-xs font-medium text-purple-900/70 mt-1">
              Zero-PII isolation (RA 10173 & DepEd compliant)
            </p>
          </div>

          <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition-all">
            <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
              INGESTION LATENCY
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1 font-mono tracking-tight">
              450ms
            </div>
            <p className="text-xs font-medium text-purple-900/70 mt-1">
              Real-time WebSocket replication pipeline
            </p>
          </div>
        </div>
      </main>

      {/* ── MINIMAL FOOTER ─────────────────────────────────────────── */}
      <footer className="py-6 px-6 text-center text-xs text-purple-700/80 font-mono border-t border-purple-100">
        &copy; {new Date().getFullYear()} KUMUSTA: Civic & School Predictive Well-being Sentinel.
      </footer>
    </div>
  );
}
