"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { acknowledgeAlert } from "@/app/actions/alerts";
import { Check } from "lucide-react";

interface AlertData {
  id: string;
  studentName: string | null;
  studentGrade: string | null;
  studentSection: string | null;
  flaggedText: string;
  classification: string;
  severity: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
}

export default function CrisisQueue({ initialAlerts, schoolId }: { initialAlerts: AlertData[]; schoolId: string }) {
  const [alerts, setAlerts] = useState<AlertData[]>(initialAlerts);
  const router = useRouter();

  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  // Subscribe to live crisis updates for this school (guarded against empty schoolId)
  useEffect(() => {
    if (!schoolId) return;
    const channel = supabase
      .channel("public:crisis_alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crisis_alerts", filter: `school_id=eq.${schoolId}` },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, router]);

  const handleAction = async (id: string, newStatus: string) => {
    await acknowledgeAlert(id, newStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`bento-card border-t-4 flex flex-col justify-between gap-4 ${
            alert.severity === "CRITICAL"
              ? "border-t-accent-rose"
              : alert.severity === "HIGH"
              ? "border-t-accent-amber"
              : "border-t-slate-300"
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-bold font-mono text-slate-600">
                {alert.classification}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                  alert.severity === "CRITICAL"
                    ? "bg-accent-rose/10 text-accent-rose"
                    : alert.severity === "HIGH"
                    ? "bg-accent-amber/10 text-accent-amber"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono block">FLAGGED CONTENT</span>
              <p className="text-slate-700 font-sans italic text-sm mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                "{alert.flaggedText}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100 pt-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">STUDENT</span>
                <span className="text-slate-700 font-bold">
                  {alert.isAnonymous ? "Anonymous User" : alert.studentName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">GRADE/SEC</span>
                <span className="text-slate-700 font-bold">
                  {alert.studentGrade || "N/A"} - {alert.studentSection || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(alert.createdAt).toLocaleString()}
            </span>
            <div className="flex gap-2">
              {alert.status === "new" ? (
                <>
                  <button
                    onClick={() => handleAction(alert.id, "acknowledged")}
                    className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-sans shadow-sm"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleAction(alert.id, "resolved")}
                    className="text-xs bg-accent-teal hover:bg-teal-600 text-white font-semibold px-3 py-1.5 rounded-lg font-sans shadow-sm"
                  >
                    Resolve
                  </button>
                </>
              ) : alert.status === "acknowledged" ? (
                <button
                  onClick={() => handleAction(alert.id, "resolved")}
                  className="text-xs bg-accent-teal hover:bg-teal-600 text-white font-semibold px-3 py-1.5 rounded-lg font-sans shadow-sm"
                >
                  Resolve Alert
                </button>
              ) : (
                <span className="text-xs font-bold text-accent-emerald font-mono flex items-center gap-1">
                  <Check size={14} /> RESOLVED
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <div className="col-span-full py-16 text-center text-slate-400 font-mono bento-card">
          No critical alerts flagged at this time.
        </div>
      )}
    </div>
  );
}
