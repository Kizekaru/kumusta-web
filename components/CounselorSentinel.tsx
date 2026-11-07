"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateAlertStatus } from "@/app/actions/alerts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  School as SchoolIcon,
  MessageSquare,
  Check,
  Inbox,
  GraduationCap,
  FileText,
  Info,
  Calendar,
  AlertCircle,
  Building2,
  Search,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";

export interface AlertData {
  id: string;
  schoolId: string;
  sessionId: string;
  severity: string;
  classification: string;
  flaggedText: string;
  counselorSummary: string | null;
  doSay: string[];
  dontSay: string[];
  isAnonymous: boolean;
  status: string;
  createdAt: string | Date;
  school?: {
    id: string;
    name: string;
    division: string;
  } | null;
}

interface CounselorSentinelProps {
  initialAlerts: AlertData[];
  initialRole?: string;
}

export default function CounselorSentinel({
  initialAlerts,
  initialRole = "SCHOOL_ADMIN",
}: CounselorSentinelProps) {
  const [alerts, setAlerts] = useState<AlertData[]>(initialAlerts);
  const [currentRole, setCurrentRole] = useState<string>(initialRole);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(
    initialAlerts[0]?.id || ""
  );
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSchool, setFilterSchool] = useState("ALL");
  const [newAlertBadge, setNewAlertBadge] = useState<boolean>(false);
  const [isSyncingClassroom, setIsSyncingClassroom] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusError, setStatusError] = useState("");
  const [syncError, setSyncError] = useState("");

  // Sync role from localStorage and listen to mock role switch events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kumusta_mock_role");
      if (saved) {
        setCurrentRole(saved);
      }

      const handleRoleChange = (e: Event) => {
        const customEv = e as CustomEvent<string>;
        const newRole = customEv.detail || localStorage.getItem("kumusta_mock_role") || "SCHOOL_ADMIN";
        setCurrentRole(newRole);
      };

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "kumusta_mock_role" && e.newValue) {
          setCurrentRole(e.newValue);
        }
      };

      window.addEventListener("kumusta_role_change", handleRoleChange);
      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("kumusta_role_change", handleRoleChange);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    setAlerts(initialAlerts);
    if (!selectedAlertId && initialAlerts.length > 0) {
      setSelectedAlertId(initialAlerts[0].id);
    }
  }, [initialAlerts]);

  // Helper to determine if an alert belongs to University of the Assumption
  const isAssumptionAlert = (alert: AlertData): boolean => {
    const schoolName = (alert.school?.name || "").toLowerCase();
    if (schoolName.includes("assumption")) return true;
    // Fallback: If school relation is missing but alert was created for UA
    if (!alert.school && (alert.schoolId?.includes("ua") || !alert.schoolId)) return true;
    return false;
  };

  const isSchoolAdmin = currentRole === "SCHOOL_ADMIN";

  // Role-based scoping:
  // School Admin shows ONLY University of the Assumption logs.
  // LGU Officer retains the existing city-wide multi-school logic.
  const roleScopedAlerts = alerts.filter((alert) => {
    if (isSchoolAdmin) {
      return isAssumptionAlert(alert);
    }
    return true;
  });

  const getSchoolName = (alert: AlertData) =>
    alert.school?.name || "University of the Assumption";

  const filteredAlerts = roleScopedAlerts
    .filter((alert) => {
      if (filterCategory === "CRITICAL" && alert.severity !== "CRITICAL") return false;
      if (filterCategory === "ACADEMIC" && alert.classification !== "ACADEMIC_DISTRESS") return false;
      if (filterCategory === "OPEN" && alert.status === "RESOLVED") return false;
      if (filterSeverity !== "ALL" && alert.severity !== filterSeverity) return false;
      if (filterStatus === "OPEN" && alert.status === "RESOLVED") return false;
      if (filterStatus === "RESOLVED" && alert.status !== "RESOLVED") return false;
      if (filterSchool !== "ALL" && getSchoolName(alert) !== filterSchool) return false;

      const query = searchQuery.trim().toLowerCase();
      if (
        query &&
        ![
          alert.counselorSummary,
          alert.classification.replace(/_/g, " "),
          alert.severity,
          getSchoolName(alert),
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const severityRank: Record<string, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      const statusRank = (alert: AlertData) => alert.status === "RESOLVED" ? 0 : 1;
      return (
        statusRank(b) - statusRank(a) ||
        (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  const schoolOptions = Array.from(new Set(roleScopedAlerts.map(getSchoolName))).sort();
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterCategory !== "ALL" ||
    filterSeverity !== "ALL" ||
    filterStatus !== "ALL" ||
    filterSchool !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("ALL");
    setFilterSeverity("ALL");
    setFilterStatus("ALL");
    setFilterSchool("ALL");
  };

  const selectedAlert =
    filteredAlerts.find((a) => a.id === selectedAlertId) || filteredAlerts[0] || null;

  // Auto-sync selectedAlertId whenever filtered list changes or role switches
  useEffect(() => {
    if (filteredAlerts.length > 0) {
      const exists = filteredAlerts.some((a) => a.id === selectedAlertId);
      if (!exists) {
        setSelectedAlertId(filteredAlerts[0].id);
      }
    } else {
      setSelectedAlertId("");
    }
  }, [currentRole, filterCategory, filterSeverity, filterStatus, filterSchool, searchQuery, alerts]);

  // Establish Real-time Channel Listener
  useEffect(() => {
    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Alert" },
        async (payload) => {
          const newAlert = payload.new as AlertData;
          setAlerts((prev) => {
            const exists = prev.some((a) => a.id === newAlert.id);
            if (exists) return prev;
            return [newAlert, ...prev];
          });
          const isRelevant = !isSchoolAdmin || isAssumptionAlert(newAlert);
          if (isRelevant) {
            setSelectedAlertId(newAlert.id);
            setNewAlertBadge(true);
            setTimeout(() => setNewAlertBadge(false), 6000);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Alert" },
        (payload) => {
          const updatedAlert = payload.new as AlertData;
          setAlerts((prev) =>
            prev.map((a) => (a.id === updatedAlert.id ? { ...a, ...updatedAlert } : a))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSchoolAdmin]);

  const handleToggleStatus = async (alertId: string, currentStatus: string) => {
    setIsUpdatingStatus(true);
    setStatusError("");
    const newStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    try {
      await updateAlertStatus(alertId, newStatus);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error("Failed to update alert status:", err);
      setStatusError("Could not update this alert. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const triggerClassroomSync = async () => {
    setIsSyncingClassroom(true);
    setSyncError("");
    try {
      const res = await fetch("/api/classroom/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "demo-student-juan",
          courseName: "General Mathematics",
        }),
      });
      if (!res.ok) {
        throw new Error(`Classroom sync failed with status ${res.status}`);
      }
      const data = await res.json();
      if (data.alert) {
        setAlerts((prev) => [data.alert, ...prev]);
        setSelectedAlertId(data.alert.id);
        setNewAlertBadge(true);
        setTimeout(() => setNewAlertBadge(false), 5000);
      }
    } catch (e) {
      console.error("Classroom sync trigger failed:", e);
      setSyncError("Classroom sync failed. Check the connection and try again.");
    } finally {
      setIsSyncingClassroom(false);
    }
  };

  const getClassificationBadge = (classification: string, severity: string) => {
    if (classification === "ACADEMIC_DISTRESS") {
      return null;
    }
    if (severity === "CRITICAL") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <ShieldAlert size={13} className="text-rose-700" />
        Critical
        </span>
      );
    }
    if (severity === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-200 text-purple-950 border border-purple-300">
          <AlertTriangle size={13} className="text-purple-800" />
          Elevated Priority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
        <Info size={13} className="text-purple-700" />
        General Check-in
      </span>
    );
  };

  // Helper to extract sensitive/prohibited keyword topics safely without exposing raw chat
  const getFlaggedKeywords = (alert: AlertData): string[] => {
    const keywords: string[] = [];
    const text = (alert.flaggedText || "").toLowerCase();

    if (alert.classification === "ACADEMIC_DISTRESS" || text.includes("exam") || text.includes("scores")) {
      keywords.push("Severe Academic Distress", "Sudden Performance Decline", "Attendance Drop Alert");
    }
    if (text.includes("hopeless") || text.includes("alone") || text.includes("worthless")) {
      keywords.push("Hopelessness Indicators", "Emotional Isolation", "Acute Distress Trigger");
    }
    if (text.includes("exhaust") || text.includes("tired") || text.includes("sleep")) {
      keywords.push("Chronic Exhaustion", "Burnout Symptoms");
    }
    if (text.includes("pain") || text.includes("hurt") || alert.severity === "CRITICAL") {
      keywords.push("High Emotional Vulnerability", "Crisis Keywords Detected");
    }
    if (keywords.length === 0) {
      keywords.push("Behavioral Sentiment Flag", "Needs Guidance Review");
    }
    return keywords;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ── INCIDENT QUEUE (Left column) ────────────────────────── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-4">
        {/* Queue Header & Filters */}
        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm">
          {/* Active Role Scoping Pill */}
          {isSchoolAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-mono font-bold mb-3 shadow-2xs">
              <SchoolIcon size={14} className="text-purple-700 shrink-0" />
              <span className="truncate">University of the Assumption Queue</span>
              <span className="ml-auto text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-900 text-white shrink-0">
                School Admin
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-mono font-bold mb-3 shadow-2xs">
              <Building2 size={14} className="text-purple-700 shrink-0" />
              <span className="truncate">Citywide Multi-School Queue</span>
              <span className="ml-auto text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-900 text-white shrink-0">
                LGU Command
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center border border-purple-800 shadow-2xs">
                <Inbox size={18} className="text-purple-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-purple-950 tracking-tight">
                  Live Incident Queue
                </h3>
                <p className="text-[11px] font-mono text-purple-700">
                  {isSchoolAdmin ? "UA Campus Inquiries" : "Citywide Student Inquiries"}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-200">
              {roleScopedAlerts.filter((a) => a.status !== "RESOLVED").length} Open
            </span>
          </div>

          {/* Classroom Records Sync Button */}
          <button
            onClick={triggerClassroomSync}
            disabled={isSyncingClassroom}
            className="w-full mb-3 py-2 px-3 bg-purple-800 hover:bg-purple-900 disabled:opacity-60 text-white border border-purple-900 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            {isSyncingClassroom ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <GraduationCap size={16} className="text-purple-200" />
            )}
            {isSyncingClassroom ? "Syncing Records..." : "Sync Classroom Records"}
          </button>
          {syncError && (
            <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
              {syncError}
            </p>
          )}

          <label className="relative mb-3 block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
            <span className="sr-only">Search alerts</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search school, summary, category..."
              className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-9 pr-3 text-sm text-purple-950 outline-none placeholder:text-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </label>

          <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="text-[11px] font-semibold text-purple-800">
              <span className="sr-only">Filter by school</span>
              <select
                value={filterSchool}
                onChange={(event) => setFilterSchool(event.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-2.5 py-2 text-xs text-purple-950 focus:border-purple-500 focus:outline-none"
              >
                <option value="ALL">All schools</option>
                {schoolOptions.map((school) => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-purple-800">
              <span className="sr-only">Filter by priority</span>
              <select
                value={filterSeverity}
                onChange={(event) => setFilterSeverity(event.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-2.5 py-2 text-xs text-purple-950 focus:border-purple-500 focus:outline-none"
              >
                <option value="ALL">All priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
            <label className="text-[11px] font-semibold text-purple-800">
              <span className="sr-only">Filter by case status</span>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-2.5 py-2 text-xs text-purple-950 focus:border-purple-500 focus:outline-none"
              >
                <option value="ALL">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </label>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-purple-50/80 p-1 rounded-xl border border-purple-100">
            {[
              { id: "ALL", label: "All" },
              { id: "CRITICAL", label: "Critical" },
              { id: "ACADEMIC", label: "Academic" },
              { id: "OPEN", label: "Open" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  filterCategory === tab.id
                    ? "bg-purple-900 text-white shadow-sm border border-purple-950"
                    : "text-purple-900 hover:text-purple-950 hover:bg-purple-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-purple-700">
            <span>
              Showing <strong>{filteredAlerts.length}</strong> of {roleScopedAlerts.length} alerts
              <span className="ml-1">· Open high-priority cases appear first</span>
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-purple-800 hover:text-purple-950"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Live Incoming Alert Banner */}
        <AnimatePresence>
          {newAlertBadge && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-3 bg-purple-900 text-white rounded-xl shadow-lg border border-purple-800 flex items-center justify-between text-xs font-bold font-sans"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-purple-300" />
                <span>New Incident Received</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-purple-800 px-2 py-0.5 rounded text-purple-200 border border-purple-700">
                Live
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Alerts List */}
        <div className="flex flex-col gap-2.5 max-h-[680px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center bg-white border border-purple-200 rounded-2xl">
              <Inbox size={28} className="mx-auto mb-3 text-purple-400" />
              <h4 className="text-sm font-bold text-purple-950">
                {roleScopedAlerts.length === 0
                  ? "No alerts yet"
                  : hasActiveFilters
                    ? "No matching alerts"
                    : "Nothing needs attention"}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-purple-700">
                {roleScopedAlerts.length === 0
                  ? "New alerts will appear here when the system receives them."
                  : hasActiveFilters
                    ? "Try changing your search or filters to see more results."
                    : "There are no open alerts in this queue right now."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-900 hover:bg-purple-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlert?.id;
              return (
                <motion.button
                  type="button"
                  key={alert.id}
                  layout
                  onClick={() => setSelectedAlertId(alert.id)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-50/70 border-2 border-purple-700 shadow-md ring-1 ring-purple-600/20"
                      : "bg-white hover:bg-purple-50/40 border-purple-200 hover:border-purple-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getClassificationBadge(alert.classification, alert.severity)}
                    <span className="text-[10px] font-mono text-purple-600 flex items-center gap-1 font-medium">
                      <Clock size={11} />
                      {new Date(alert.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-purple-950 line-clamp-2 italic mb-2">
                    {alert.counselorSummary || "Student engaged with support platform regarding academic pressures and emotional strain."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-purple-700 pt-2 border-t border-purple-100">
                    <span className="flex items-center gap-1 truncate max-w-[190px]">
                      <SchoolIcon size={13} className="text-purple-600 shrink-0" />
                      <span className="truncate font-semibold">
                        {alert.school?.name || "University of the Assumption"}
                      </span>
                    </span>
                    <span
                      className={`font-bold ${
                        alert.status === "RESOLVED"
                          ? "text-purple-600"
                          : "text-purple-950"
                      }`}
                    >
                      {alert.status === "RESOLVED" ? "Resolved" : "Open"}
                    </span>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* ── INCIDENT SUMMARY OVERHAUL (Right column) ───────────────────── */}
      <div className="flex-1">
        {selectedAlert ? (
          <motion.div
            key={selectedAlert.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-purple-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6"
          >
            {/* Header Meta Bar (No email/ID numbers) */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-purple-100">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  {getClassificationBadge(selectedAlert.classification, selectedAlert.severity)}
                  <span className="text-xs font-mono text-purple-700 flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(selectedAlert.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#1e0842] tracking-tight mt-0.5 flex items-center gap-2">
                  <SchoolIcon size={24} className="text-[#5003C0]" />
                  {selectedAlert.school?.name || "University of the Assumption"}
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    ({selectedAlert.school?.division || "City of San Fernando"})
                  </span>
                </h2>
              </div>

              {/* Status Action Button */}
              <button
                onClick={() => handleToggleStatus(selectedAlert.id, selectedAlert.status)}
                disabled={isUpdatingStatus}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                  selectedAlert.status === "RESOLVED"
                    ? "bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300"
                    : "bg-purple-800 hover:bg-purple-900 text-white border border-purple-900"
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    <span>Updating case...</span>
                  </>
                ) : selectedAlert.status === "RESOLVED" ? (
                  <>
                    <CheckCircle2 size={16} className="text-purple-700" />
                    <span>Case Resolved (Click to Reopen)</span>
                  </>
                ) : (
                  <>
                    <Check size={16} className="text-purple-200" />
                    <span>Mark as Handled</span>
                  </>
                )}
              </button>
            </div>
            {statusError && (
              <p role="alert" className="-mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                {statusError}
              </p>
            )}

            {/* ── REPLACED SECTION: INCIDENT SUMMARY ─────────────────────── */}
            <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-purple-200/80">
                <div className="flex items-center gap-2 text-purple-950">
                  <FileText size={18} className="text-purple-800" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-950">
                    Incident Summary
                  </span>
                </div>
              </div>

              {/* 1. Privacy-Safe Session Synthesis */}
              <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-2xs flex flex-col gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700">
                  Conversation Overview
                </span>
                <p className="text-sm font-medium text-purple-950 leading-relaxed">
                  {selectedAlert.counselorSummary ||
                    "No counselor summary is available for this alert yet."}
                </p>
              </div>

              {/* 2. Prohibited Words & Flagged Trigger Topics */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-purple-900">
                  <AlertTriangle size={15} className="text-purple-700" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                    Flagged Indicators & Sensitive Terms Detected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getFlaggedKeywords(selectedAlert).map((keyword, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-700" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {(selectedAlert.doSay.length > 0 || selectedAlert.dontSay.length > 0) && (
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedAlert.doSay.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                        Suggested supportive language
                      </h3>
                      <ul className="space-y-2 text-sm leading-relaxed text-emerald-950">
                        {selectedAlert.doSay.map((phrase, index) => (
                          <li key={`${index}-${phrase}`}>&ldquo;{phrase}&rdquo;</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedAlert.dontSay.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        Language to avoid
                      </h3>
                      <ul className="space-y-2 text-sm leading-relaxed text-amber-950">
                        {selectedAlert.dontSay.map((phrase, index) => (
                          <li key={`${index}-${phrase}`}>&ldquo;{phrase}&rdquo;</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white border border-purple-200 rounded-3xl p-12 text-center text-purple-400 font-mono text-sm">
            Select an active incident from the queue to view the incident summary.
          </div>
        )}
      </div>
    </div>
  );
}
