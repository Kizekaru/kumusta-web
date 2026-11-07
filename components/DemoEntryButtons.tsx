"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { School, Building2, ArrowRight, Sparkles } from "lucide-react";
import { MockAccountRole } from "@/lib/mockAccounts";

export default function DemoEntryButtons() {
  const router = useRouter();

  const handleEnterAs = (role: MockAccountRole) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kumusta_mock_role", role);
      document.cookie = `kumusta_demo_role=${role}; path=/; max-age=86400;`;
      window.dispatchEvent(new CustomEvent("kumusta_role_change", { detail: role }));
    }
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-3xl bg-purple-50/80 border border-purple-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-purple-200/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-900 text-purple-200 flex items-center justify-center font-bold">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-purple-950 tracking-tight">
              Instant Demonstration Access
            </h3>
            <p className="text-[11px] font-mono font-medium text-purple-700">
              One-click entry • No authentication or password required
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-950 border border-purple-300">
          MOCK ACCOUNTS READY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Mock Account 1: School Admin */}
        <button
          type="button"
          onClick={() => handleEnterAs("SCHOOL_ADMIN")}
          className="p-4 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all shadow-2xs flex flex-col justify-between gap-3 text-left group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-900 text-purple-200 flex items-center justify-center font-black text-sm border border-purple-800 shadow-xs">
                AL
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-purple-950 group-hover:text-purple-900 transition-colors">
                  Mr. Anton Lulu
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-700">
                  School Admin
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
              UA Campus
            </span>
          </div>

          <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
            Campus counselor triage, high-risk flag monitoring & student welfare desk for University of the Assumption.
          </p>

          <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-900 group-hover:text-purple-950">
            <span className="flex items-center gap-1.5">
              <School size={14} className="text-purple-700" />
              <span>Enter as School Admin</span>
            </span>
            <ArrowRight size={14} className="text-purple-700 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Mock Account 2: LGU Officer */}
        <button
          type="button"
          onClick={() => handleEnterAs("LGU_OFFICER")}
          className="p-4 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all shadow-2xs flex flex-col justify-between gap-3 text-left group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-900 text-purple-200 flex items-center justify-center font-black text-sm border border-purple-800 shadow-xs">
                KG
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-purple-950 group-hover:text-purple-900 transition-colors">
                  Dr. Katrina Gomez, MD
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-700">
                  LGU Officer
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
              San Fernando
            </span>
          </div>

          <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
            Multi-school municipal cluster telemetry, anomaly heatmap analysis & multi-agency intervention dispatch.
          </p>

          <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-900 group-hover:text-purple-950">
            <span className="flex items-center gap-1.5">
              <Building2 size={14} className="text-purple-700" />
              <span>Enter as LGU Officer</span>
            </span>
            <ArrowRight size={14} className="text-purple-700 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
