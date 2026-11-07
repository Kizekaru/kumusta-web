"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { X } from "lucide-react";

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1Ijoib25lb2V4eSIsImEiOiJjbXN3eHg1OG4xajE0MnpxdTljMmZxOXBtIn0.TFvyr9va-tp1At5oWIpNmw";

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

export default function PampangaMap({ schools }: { schools: SchoolMapPoint[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolMapPoint | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [120.6888, 15.0333],
      zoom: 10,
    });

    map.on("load", () => {
      schools.forEach((school) => {
        const pinColor = school.alertsCount > 5 ? "#f43f5e" : school.requestsCount > 10 ? "#f59e0b" : "#14b8a6";
        const el = document.createElement("div");
        el.className = "w-6 h-6 rounded-full border-2 border-white cursor-pointer transition flex items-center justify-center shadow-md";
        el.style.backgroundColor = pinColor;
        el.innerHTML = `<span class="text-[9px] text-white font-extrabold font-mono">${school.alertsCount + school.requestsCount}</span>`;

        el.addEventListener("click", () => {
          setSelectedSchool(school);
        });

        new mapboxgl.Marker(el)
          .setLngLat([school.longitude, school.latitude])
          .addTo(map);
      });
    });

    return () => map.remove();
  }, [schools]);

  return (
    <div className="relative w-full h-[550px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />

      {selectedSchool && (
        <div className="absolute bottom-6 left-6 bg-white/95 border border-slate-200 p-5 rounded-xl max-w-sm w-full backdrop-blur-md flex flex-col gap-3 shadow-lg">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800 text-base font-sans">{selectedSchool.name}</h4>
            <button onClick={() => setSelectedSchool(null)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <span className="text-[10px] text-slate-600 font-mono uppercase bg-slate-50 border border-slate-200 px-2 py-0.5 rounded w-max font-semibold">
            {selectedSchool.region}
          </span>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs font-mono text-center">
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-slate-400 block text-[9px]">SESSIONS</span>
              <span className="text-accent-teal font-bold">{selectedSchool.sessionsCount}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-slate-400 block text-[9px]">REQUESTS</span>
              <span className="text-accent-amber font-bold">{selectedSchool.requestsCount}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-slate-400 block text-[9px]">ALERTS</span>
              <span className="text-accent-rose font-bold">{selectedSchool.alertsCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
