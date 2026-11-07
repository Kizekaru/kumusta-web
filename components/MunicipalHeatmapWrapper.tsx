"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./MunicipalHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] bg-white border border-purple-200 rounded-3xl flex flex-col items-center justify-center font-mono text-sm text-purple-700 gap-3 shadow-sm">
      <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-800 rounded-full animate-spin" />
      <span>Loading KUMUSTA Municipal Anomaly Heatmap...</span>
    </div>
  ),
});

export default function MunicipalHeatmapWrapper() {
  return <DynamicMap />;
}
