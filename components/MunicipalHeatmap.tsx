"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  Flame,
  Layers,
  School as SchoolIcon,
  ShieldAlert,
  X,
  Compass,
  AlertCircle,
  RefreshCw,
  Search,
  LocateFixed,
  LoaderCircle,
} from "lucide-react";
import {
  SAN_FERNANDO_BOUNDS,
  SAN_FERNANDO_CENTER,
  SAN_FERNANDO_BOUNDARY_GEOJSON
} from "@/lib/sanFernandoBoundary";

interface SchoolFeatureProperties {
  id: string;
  name: string;
  division: string;
  alertCount: number;
  totalHistoricalAlerts: number;
  highestSeverity: string;
  severityScore: number;
  primaryConcern: string;
  latestSummary: string;
  latitude: number;
  longitude: number;
}

interface SchoolFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: SchoolFeatureProperties;
}

export default function MunicipalHeatmap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLayerMode, setActiveLayerMode] = useState<"HEATMAP" | "CIRCLES" | "BOTH">("BOTH");
  const [totalAnomalies, setTotalAnomalies] = useState<number>(0);
  const [schoolFeatures, setSchoolFeatures] = useState<SchoolFeature[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [mapError, setMapError] = useState("");
  const [dataError, setDataError] = useState("");

  const loadSchoolList = async () => {
    setDataError("");
    try {
      const response = await fetch("/api/schools/anomalies");
      if (!response.ok) {
        throw new Error(`School data request failed (${response.status})`);
      }
      const geoJson = await response.json();
      const features = (geoJson.features || []) as SchoolFeature[];
      const sfFeatures = features.filter((feature) => {
        const division = (feature.properties?.division || "").toLowerCase();
        const name = (feature.properties?.name || "").toLowerCase();
        const [longitude, latitude] = feature.geometry.coordinates;
        const inBounds =
          longitude >= SAN_FERNANDO_BOUNDS[0][0] - 0.015 &&
          longitude <= SAN_FERNANDO_BOUNDS[1][0] + 0.015 &&
          latitude >= SAN_FERNANDO_BOUNDS[0][1] - 0.015 &&
          latitude <= SAN_FERNANDO_BOUNDS[1][1] + 0.015;
        return division.includes("san fernando") || name.includes("san fernando") || inBounds;
      });
      setSchoolFeatures(sfFeatures.length > 0 ? sfFeatures : features);
    } catch (error) {
      console.error("Failed to load school list:", error);
      setDataError("School locations could not be loaded. Check the database connection and try again.");
    }
  };

  useEffect(() => {
    void loadSchoolList();
  }, []);

  const visibleSchools = schoolFeatures
    .filter(({ properties }) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        properties.name.toLowerCase().includes(query) ||
        properties.division.toLowerCase().includes(query);
      const matchesSeverity =
        severityFilter === "ALL" ||
        (severityFilter === "ACTIVE"
          ? properties.alertCount > 0
          : properties.highestSeverity === severityFilter);
      return matchesQuery && matchesSeverity;
    })
    .sort((a, b) => {
      const severityRank: Record<string, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
        NONE: 0,
      };
      return (
        (severityRank[b.properties.highestSeverity] || 0) -
          (severityRank[a.properties.highestSeverity] || 0) ||
        b.properties.alertCount - a.properties.alertCount ||
        a.properties.name.localeCompare(b.properties.name)
      );
    });

  const schoolCountWithAlerts = schoolFeatures.filter(
    ({ properties }) => properties.alertCount > 0
  ).length;
  const criticalSchoolCount = schoolFeatures.filter(
    ({ properties }) => properties.highestSeverity === "CRITICAL"
  ).length;

  const focusSchool = (feature: SchoolFeature) => {
    setSelectedFeature(feature.properties);
    const map = mapRef.current;
    if (isMapAlive(map)) {
      map.easeTo({
        center: feature.geometry.coordinates,
        zoom: 14,
        duration: 900,
      });
    }
  };

  const isMapAlive = (m: mapboxgl.Map | null | undefined): m is mapboxgl.Map => {
    if (!m) return false;
    if ((m as any)._removed) return false;
    if (!(m as any).style) return false;
    return true;
  };

  const fetchAndLoadData = async (map: mapboxgl.Map) => {
    if (!isMapAlive(map)) return;
    setIsLoading(true);
    try {
      // ── 0. SAN FERNANDO MUNICIPAL BORDER BOUNDARY LAYERS ──
      if (isMapAlive(map) && !map.getSource("sanfernando-boundary")) {
        map.addSource("sanfernando-boundary", {
          type: "geojson",
          data: SAN_FERNANDO_BOUNDARY_GEOJSON,
        });

        // Keep the municipal area distinct without creating a saturated glow.
        map.addLayer({
          id: "sanfernando-boundary-fill",
          type: "fill",
          source: "sanfernando-boundary",
          paint: {
            "fill-color": "#9b8ca8",
            "fill-opacity": 0.035,
          },
        });

        // Subtle halo keeps the boundary visible without dominating the map.
        map.addLayer({
          id: "sanfernando-boundary-glow",
          type: "line",
          source: "sanfernando-boundary",
          paint: {
            "line-color": "#8f7a9f",
            "line-width": 3,
            "line-opacity": 0.16,
            "line-blur": 2,
          },
        });

        // Crisp municipal boundary border line
        map.addLayer({
          id: "sanfernando-boundary-line",
          type: "line",
          source: "sanfernando-boundary",
          paint: {
            "line-color": "#756280",
            "line-width": 1.5,
            "line-opacity": 0.78,
          },
        });
      }

      const res = await fetch("/api/schools/anomalies");
      if (!res.ok) {
        throw new Error(`School map request failed (${res.status})`);
      }
      const geoJson = await res.json();

      // Guard: Check if map was destroyed while waiting for network response
      if (!isMapAlive(map)) return;

      // Filter anomaly points to the City of San Fernando, Pampanga jurisdiction
      const sfFeatures = (geoJson.features || []).filter((f: any) => {
        const division = (f.properties?.division || "").toLowerCase();
        const name = (f.properties?.name || "").toLowerCase();
        const coords = f.geometry?.coordinates;
        const inBounds =
          coords &&
          coords[0] >= SAN_FERNANDO_BOUNDS[0][0] - 0.015 &&
          coords[0] <= SAN_FERNANDO_BOUNDS[1][0] + 0.015 &&
          coords[1] >= SAN_FERNANDO_BOUNDS[0][1] - 0.015 &&
          coords[1] <= SAN_FERNANDO_BOUNDS[1][1] + 0.015;
        return division.includes("san fernando") || name.includes("san fernando") || inBounds;
      });

      const scopedGeoJson = {
        ...geoJson,
        features: sfFeatures.length > 0 ? sfFeatures : geoJson.features,
      };
      setSchoolFeatures(scopedGeoJson.features as SchoolFeature[]);

      let total = 0;
      scopedGeoJson.features?.forEach((f: any) => {
        total += f.properties?.alertCount || 0;
      });
      setTotalAnomalies(total);

      // Guard: Ensure map and style are still intact before accessing sources or adding layers
      if (!isMapAlive(map)) return;

      const source = map.getSource("schools-anomalies") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(scopedGeoJson);
      } else {
        if (!isMapAlive(map)) return;
        map.addSource("schools-anomalies", {
          type: "geojson",
          data: scopedGeoJson,
        });

        // ── 1. HEATMAP LAYER ──────────────────────────────────
        map.addLayer({
          id: "schools-heat",
          type: "heatmap",
          source: "schools-anomalies",
          maxzoom: 15,
          paint: {
            // Increase heatmap weight based on severity score
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "severityScore"],
              0, 0,
              5, 0.5,
              15, 1,
              30, 2
            ],
            // Increase heatmap intensity based on zoom level
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 1,
              10, 2,
              14, 3.5
            ],
            // Muted neutral-to-warm ramp keeps dense areas visible without neon contrast.
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(248, 250, 252, 0)",
              0.2, "rgba(148, 163, 184, 0.22)",
              0.4, "rgba(125, 160, 143, 0.42)",
              0.7, "rgba(215, 170, 91, 0.62)",
              1, "rgba(190, 105, 91, 0.76)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 15,
              10, 30,
              13, 55
            ],
            "heatmap-opacity": 0.72,
          },
        });

        // ── 2. CIRCLE CLUSTER / POINT LAYER ──────────────────
        map.addLayer({
          id: "schools-point",
          type: "circle",
          source: "schools-anomalies",
          minzoom: 8,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "alertCount"],
              1, 10,
              5, 16,
              10, 24,
              20, 32
            ],
            "circle-color": [
              "match",
              ["get", "highestSeverity"],
              "CRITICAL", "#bd625d",
              "HIGH", "#ce8951",
              "MEDIUM", "#c5a14f",
              "LOW", "#789889",
              /* default */ "#a8b0ba"
            ],
            "circle-stroke-color": "#f8fafc",
            "circle-stroke-width": 2,
            "circle-opacity": 0.88,
          },
        });

        // ── 3. SYMBOL COUNT LABELS ────────────────────────────
        map.addLayer({
          id: "schools-label",
          type: "symbol",
          source: "schools-anomalies",
          minzoom: 8,
          layout: {
            "text-field": ["to-string", ["get", "alertCount"]],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 11,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Interactivity: Cursor change
        map.on("mouseenter", "schools-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "schools-point", () => {
          map.getCanvas().style.cursor = "";
        });

        // Interactivity: Click on School Point
        map.on("click", "schools-point", (e) => {
          if (!e.features || !e.features[0]) return;
          const feature = e.features[0] as any;
          setSelectedFeature(feature.properties);

          const coords = feature.geometry?.coordinates?.slice();
          if (coords) {
            map.easeTo({
              center: coords,
              zoom: 14,
              duration: 900,
            });
          }
        });
      }
    } catch (err) {
      console.error("Failed to load map data:", err);
      setDataError("School locations could not be loaded. Check the database connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken =
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      "pk.eyJ1Ijoib25lb2V4eSIsImEiOiJjbXN3eHg1OG4xajE0MnpxdTljMmZxOXBtIn0.TFvyr9va-tp1At5oWIpNmw";

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: SAN_FERNANDO_CENTER, // Center of City of San Fernando, Pampanga
      zoom: 12.5,
      pitch: 20,
      maxBounds: [
        [120.52, 14.94], // Southwest boundary limit
        [120.80, 15.19], // Northeast boundary limit
      ],
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("error", () => {
      setIsLoading(false);
      setMapError("The map tiles could not load. Check that your Mapbox access token is valid.");
    });

    let isCancelled = false;

    map.on("load", () => {
      if (isCancelled || !isMapAlive(map)) return;
      map.resize();
      map.fitBounds(SAN_FERNANDO_BOUNDS, {
        padding: { top: 65, bottom: 45, left: 45, right: 45 },
        maxZoom: 13.5,
      });
      fetchAndLoadData(map);
    });

    const handleResize = () => {
      if (isMapAlive(map)) {
        map.resize();
      }
    };
    window.addEventListener("resize", handleResize);

    const resizeTimer = setTimeout(() => {
      if (isMapAlive(map)) {
        map.resize();
      }
    }, 250);

    mapRef.current = map;

    return () => {
      isCancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      mapRef.current = null;
      if (isMapAlive(map)) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapAlive(map)) return;
    const mapFilter =
      severityFilter === "ALL"
        ? null
        : severityFilter === "ACTIVE"
          ? ["!=", ["get", "highestSeverity"], "NONE"]
          : ["==", ["get", "highestSeverity"], severityFilter];
    for (const layerId of ["schools-heat", "schools-point", "schools-label"]) {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, mapFilter as mapboxgl.FilterSpecification | null);
      }
    }
  }, [severityFilter]);

  // Handle Layer Display Switching
  const handleToggleLayer = (mode: "HEATMAP" | "CIRCLES" | "BOTH") => {
    setActiveLayerMode(mode);
    const map = mapRef.current;
    if (!isMapAlive(map)) return;

    if (map.getLayer("schools-heat")) {
      map.setLayoutProperty(
        "schools-heat",
        "visibility",
        mode === "CIRCLES" ? "none" : "visible"
      );
    }
    if (map.getLayer("schools-point")) {
      map.setLayoutProperty(
        "schools-point",
        "visibility",
        mode === "HEATMAP" ? "none" : "visible"
      );
    }
    if (map.getLayer("schools-label")) {
      map.setLayoutProperty(
        "schools-label",
        "visibility",
        mode === "HEATMAP" ? "none" : "visible"
      );
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm sm:h-[620px] xl:h-full xl:min-h-[420px]">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-white/95 border border-slate-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-xs font-bold text-purple-950 font-sans">
              City of San Fernando Municipal Map
            </span>
          </div>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-mono font-semibold text-slate-700">
            {totalAnomalies} Open Alerts
          </span>
        </div>

        {/* Layer Switcher */}
        <div className="bg-white/95 border border-slate-200 p-1 rounded-2xl shadow-sm flex items-center gap-1">
          {(["BOTH", "HEATMAP", "CIRCLES"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleToggleLayer(mode)}
              aria-pressed={activeLayerMode === mode}
              className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
                activeLayerMode === mode
                  ? "bg-slate-800 text-white shadow-xs border border-slate-900"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              {mode}
            </button>
          ))}
          <button
            onClick={() => {
              void loadSchoolList();
              if (isMapAlive(mapRef.current)) {
                fetchAndLoadData(mapRef.current);
              }
            }}
            title="Refresh map data"
            aria-label="Refresh map data"
            className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-purple-700" : ""} />
          </button>
        </div>
      </div>

      {/* Mapbox Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {isLoading && (
        <div className="absolute left-4 top-20 z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          <LoaderCircle size={14} className="animate-spin text-slate-500" />
          Loading map data
        </div>
      )}
      {mapError && (
        <div role="alert" className="absolute inset-x-4 bottom-4 z-20 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-medium text-amber-950 shadow-md sm:bottom-20 sm:left-4 sm:right-auto sm:max-w-sm">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p>{mapError}</p>
              <span className="mt-1 block">The school list is still available. Configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to restore the map.</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected School Telemetry Card */}
      {selectedFeature && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-[380px] z-10 bg-white/98 border border-purple-200 p-5 rounded-2xl shadow-xl flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-purple-950">
              <SchoolIcon size={18} className="text-purple-800 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-purple-950 leading-tight">
                  {selectedFeature.name}
                </h4>
                <span className="text-[11px] font-mono text-purple-700">
                  {selectedFeature.division}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              aria-label="Close selected school details"
              className="text-purple-400 hover:text-purple-700 p-1 rounded-lg hover:bg-purple-50"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-xs font-mono">
            <div>
              <span className="text-purple-600 block text-[10px]">ACTIVE ALERTS</span>
              <span className="text-purple-950 font-bold text-sm">
                {selectedFeature.alertCount} Open
              </span>
            </div>
            <div>
              <span className="text-purple-600 block text-[10px]">PRIMARY CONCERN</span>
              <span className="text-purple-900 font-bold uppercase text-[11px] truncate block">
                {selectedFeature.primaryConcern}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-purple-600 block mb-1">
              LATEST INCIDENT SUMMARY
            </span>
            <p className="text-xs text-purple-950 italic bg-purple-50/70 p-2.5 rounded-lg border border-purple-200">
              "{selectedFeature.latestSummary}"
            </p>
          </div>
        </div>
      )}

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 border border-slate-200 px-3 py-2 rounded-2xl shadow-sm hidden sm:flex flex-wrap items-center gap-3 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
          <span className="w-3.5 h-1 bg-[#756280] rounded-full inline-block" />
          <span className="text-slate-800 font-bold">San Fernando Border</span>
        </div>
        <span className="font-bold text-slate-600 uppercase">Priority:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#789889]" />
          <span className="text-slate-700">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c5a14f]" />
          <span className="text-slate-700">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ce8951]" />
          <span className="text-slate-700">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#bd625d]" />
          <span className="text-slate-800 font-bold">Critical</span>
        </div>
      </div>
      </div>

      <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm xl:h-full xl:min-h-0">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-purple-950">School overview</h2>
              <p className="mt-1 text-xs text-purple-700">Select a school to focus the map.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {schoolFeatures.length} schools
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Schools</span>
              <span className="mt-1 block text-lg font-black text-slate-900">{schoolFeatures.length}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-600">With alerts</span>
              <span className="mt-1 block text-lg font-black text-slate-900">{schoolCountWithAlerts}</span>
            </div>
            <div className="rounded-xl bg-[#fbf0ee] p-2.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#9a514d]">Critical</span>
              <span className="mt-1 block text-lg font-black text-[#783d3a]">{criticalSchoolCount}</span>
            </div>
          </div>

          <label className="relative mt-3 block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
            <span className="sr-only">Search schools</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search schools..."
              className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-9 pr-3 text-sm text-purple-950 outline-none placeholder:text-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </label>

          <label className="sr-only" htmlFor="map-severity-filter">Filter schools by alert priority</label>
          <select
            id="map-severity-filter"
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
            className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-xs font-semibold text-purple-950 focus:border-purple-500 focus:outline-none"
          >
            <option value="ALL">All schools</option>
            <option value="ACTIVE">Schools with open alerts</option>
            <option value="CRITICAL">Critical priority</option>
            <option value="HIGH">High priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="LOW">Low priority</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {dataError ? (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p>{dataError}</p>
              <button
                type="button"
                onClick={() => void loadSchoolList()}
                className="mt-3 inline-flex items-center gap-1.5 font-bold"
              >
                <RefreshCw size={13} />
                Retry school list
              </button>
            </div>
          ) : isLoading && schoolFeatures.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-purple-700">
              <LoaderCircle size={16} className="animate-spin" />
              Loading schools...
            </div>
          ) : visibleSchools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-purple-200 px-4 py-8 text-center">
              <SchoolIcon size={24} className="mx-auto mb-2 text-purple-400" />
              <p className="text-sm font-bold text-purple-950">
                {schoolFeatures.length === 0 ? "No schools to display" : "No matching schools"}
              </p>
              <p className="mt-1 text-xs text-purple-700">
                {schoolFeatures.length === 0
                  ? "Schools with mapped locations will appear here."
                  : "Try another search or priority filter."}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {visibleSchools.map((feature) => {
                const properties = feature.properties;
                const selected = selectedFeature?.id === properties.id;
                const priorityClass =
                  properties.highestSeverity === "CRITICAL"
                    ? "bg-[#f7e4e2] text-[#843f3b]"
                    : properties.highestSeverity === "HIGH"
                      ? "bg-[#f7eadb] text-[#855528]"
                      : properties.highestSeverity === "MEDIUM"
                        ? "bg-[#f5f0df] text-[#78652f]"
                        : properties.highestSeverity === "LOW"
                          ? "bg-[#e7efeb] text-[#496b5b]"
                          : "bg-slate-100 text-slate-600";
                return (
                  <li key={properties.id}>
                    <button
                      type="button"
                      onClick={() => focusSchool(feature)}
                      aria-pressed={selected}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        selected
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100"
                          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-900">{properties.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-600">{properties.division}</span>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${priorityClass}`}>
                          {properties.highestSeverity === "NONE" ? "No open alerts" : properties.highestSeverity}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                        <span className="font-semibold text-slate-700">
                          {properties.alertCount} open {properties.alertCount === 1 ? "alert" : "alerts"}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-800">
                          <LocateFixed size={12} />
                          View on map
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-200 px-4 py-3 text-[11px] leading-relaxed text-slate-600">
          Map summaries show open alert counts by school. They are operational indicators, not diagnoses.
        </div>
      </aside>
    </div>
  );
}
