"use client";

import React from "react";
import dynamic from "next/dynamic";

interface SchoolMapPoint {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  sessionsCount: number;
  requestsCount: number;
  alertsCount: number;
}

// Dynamically import the real Mapbox component with SSR disabled in this client context
const PampangaMap = dynamic(() => import("./PampangaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center font-mono text-sm text-slate-500 animate-pulse shadow-sm">
      Loading Pampanga Map Canvas...
    </div>
  ),
});

export default function PampangaMapWrapper({ schools }: { schools: SchoolMapPoint[] }) {
  return <PampangaMap schools={schools} />;
}
