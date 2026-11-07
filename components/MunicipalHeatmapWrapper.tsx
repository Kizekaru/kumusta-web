"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./MunicipalHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-purple-200 bg-white font-mono text-sm text-purple-700 shadow-sm sm:h-[620px] xl:h-full xl:min-h-[420px]">
      <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-800 rounded-full animate-spin" />
      <span>Loading KUMUSTA Municipal Anomaly Heatmap...</span>
    </div>
  ),
});

export default function MunicipalHeatmapWrapper() {
  return <DynamicMap />;
}
