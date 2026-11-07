"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  MapPin,
  User,
  X,
  LogOut,
  Building2,
  CheckCircle2,
  Loader2,
  School as SchoolIcon,
  Sparkles
} from "lucide-react";
import {
  MOCK_ACCOUNTS,
  MockAccountRole,
  DEFAULT_MOCK_ROLE
} from "@/lib/mockAccounts";

interface DashboardNavbarProps {
  current?: "dashboard" | "incidents" | "map";
}

export default function DashboardNavbar({ current }: DashboardNavbarProps) {
  const router = useRouter();
  const clerk = useClerk();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mockRole, setMockRole] = useState<MockAccountRole>(DEFAULT_MOCK_ROLE);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kumusta_mock_role") as MockAccountRole;
      if (saved && MOCK_ACCOUNTS[saved]) {
        setMockRole(saved);
      }
    }
  }, []);

  const handleSwitchRole = (newRole: MockAccountRole) => {
    setMockRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("kumusta_mock_role", newRole);
      document.cookie = `kumusta_demo_role=${newRole}; path=/; max-age=86400;`;
      window.dispatchEvent(new CustomEvent("kumusta_role_change", { detail: newRole }));
    }
  };

  const activeAccount = MOCK_ACCOUNTS[mockRole];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("kumusta_mock_role");
        document.cookie = "kumusta_session=; Path=/; Max-Age=0; SameSite=Lax";
        document.cookie = "kumusta_demo_role=; Path=/; Max-Age=0; SameSite=Lax";
      }
      if (clerk?.signOut) {
        await clerk.signOut({ redirectUrl: "/" });
      }
    } catch (err) {
      console.warn("Logout error, redirecting directly to home:", err);
    } finally {
      window.location.replace("/");
    }
  };

  return (
    <>
      {/* ── TOP NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-purple-100 px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between shadow-2xs">
        {/* Brand: KUMUSTA */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" aria-label="KUMUSTA dashboard">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shadow-2xs group-hover:border-purple-300 transition-colors p-1 overflow-hidden">
              <Image
                src="/logo.png"
                alt="KUMUSTA Logo"
                width={40}
                height={40}
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

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/dashboard/incidents"
              className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all inline-flex items-center ${
                current === "incidents"
                  ? "bg-purple-900 text-white border border-purple-950 shadow-2xs"
                  : "text-purple-900 hover:text-purple-950 hover:bg-purple-100"
              }`}
            >
              <span>Incidents</span>
            </Link>

            <Link
              href="/dashboard/map"
              className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all inline-flex items-center ${
                current === "map"
                  ? "bg-purple-900 text-white border border-purple-950 shadow-2xs"
                  : "text-purple-900 hover:text-purple-950 hover:bg-purple-100"
              }`}
            >
              <span>Live Monitoring Map</span>
            </Link>
          </nav>
        </div>

        {/* Right Action: Mobile Links + User Profile Button */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Quick Links */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/dashboard/incidents"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                current === "incidents"
                  ? "bg-purple-900 text-white"
                  : "text-purple-900 bg-purple-50"
              }`}
            >
              Incidents
            </Link>
            <Link
              href="/dashboard/map"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                current === "map"
                  ? "bg-purple-900 text-white"
                  : "text-purple-900 bg-purple-50"
              }`}
            >
              Map
            </Link>
          </div>

          {/* User Profile / Mock Persona Trigger Button */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all shadow-2xs text-xs sm:text-sm font-bold group cursor-pointer"
            id="user-profile-btn"
            title="Switch Demo Persona / Profile"
          >
            <div className="w-6 h-6 rounded-md bg-purple-900 text-purple-200 flex items-center justify-center font-bold text-[10px] shadow-xs">
              {activeAccount.initials}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-bold text-purple-950 text-xs hidden sm:inline">
                {activeAccount.name}
              </span>
              <span className="text-[10px] text-purple-700 font-mono font-bold">
                {activeAccount.roleLabel}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* ── USER PROFILE / DEMO ACCOUNT MODAL ───────────────────────── */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-purple-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900 text-purple-200 flex items-center justify-center font-bold border border-purple-800 shadow-xs">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base text-purple-950 tracking-tight">
                    Demonstration Account
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 rounded-lg text-purple-400 hover:text-purple-900 hover:bg-purple-50 transition-colors cursor-pointer"
                aria-label="Close user profile"
              >
                <X size={18} />
              </button>
            </div>

            {/* Persona Switcher Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-800 flex items-center justify-between">
                <span>Select Demonstration Persona</span>
                <span className="text-[10px] font-normal text-purple-600">Click to switch</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: School Admin */}
                <button
                  type="button"
                  onClick={() => handleSwitchRole("SCHOOL_ADMIN")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    mockRole === "SCHOOL_ADMIN"
                      ? "bg-purple-900 text-white border-purple-950 shadow-sm"
                      : "bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <SchoolIcon size={14} className={mockRole === "SCHOOL_ADMIN" ? "text-purple-200" : "text-purple-800"} />
                      <span>School Admin</span>
                    </div>
                    {mockRole === "SCHOOL_ADMIN" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-700 text-purple-100">
                        Active
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium leading-tight ${mockRole === "SCHOOL_ADMIN" ? "text-purple-200" : "text-purple-700"}`}>
                    University of the Assumption
                  </span>
                </button>

                {/* Option 2: LGU Officer */}
                <button
                  type="button"
                  onClick={() => handleSwitchRole("LGU_OFFICER")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    mockRole === "LGU_OFFICER"
                      ? "bg-purple-900 text-white border-purple-950 shadow-sm"
                      : "bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Building2 size={14} className={mockRole === "LGU_OFFICER" ? "text-purple-200" : "text-purple-800"} />
                      <span>LGU Officer</span>
                    </div>
                    {mockRole === "LGU_OFFICER" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-700 text-purple-100">
                        Active
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium leading-tight ${mockRole === "LGU_OFFICER" ? "text-purple-200" : "text-purple-700"}`}>
                    City of San Fernando
                  </span>
                </button>
              </div>
            </div>

            {/* Profile Overview Card (Dynamic to selected persona) */}
            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-900 text-purple-200 border-2 border-purple-700 flex items-center justify-center font-black text-base shadow-sm">
                  {activeAccount.initials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-purple-950">
                      {activeAccount.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-950 border border-purple-300">
                      <CheckCircle2 size={10} className="text-purple-800" />
                      Active
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple-800">
                    {activeAccount.title}
                  </span>
                  <span className="text-xs text-purple-700 font-mono">
                    {activeAccount.email}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-200/80 grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-700">
                    Jurisdiction / Office
                  </span>
                  <span className="font-bold text-purple-950 flex items-center gap-1 mt-0.5">
                    <Building2 size={13} className="text-purple-700" />
                    {activeAccount.division}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-700">
                    Station / Command
                  </span>
                  <span className="font-bold text-purple-950 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-purple-700" />
                    {activeAccount.station}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-900 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white border border-purple-950 text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                id="modal-logout-btn"
              >
                {isLoggingOut ? (
                  <Loader2 size={14} className="animate-spin text-purple-200" />
                ) : (
                  <LogOut size={14} className="text-purple-200" />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
