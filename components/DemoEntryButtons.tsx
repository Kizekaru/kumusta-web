"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  School,
  Sparkles,
  X,
} from "lucide-react";
import {
  MOCK_ACCOUNTS,
  MockAccountRole,
} from "@/lib/mockAccounts";
import { OPEN_DEMO_CHOOSER_EVENT } from "@/lib/demoEvents";

export default function DemoEntryButtons() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openChooser = () => setIsOpen(true);
    window.addEventListener(OPEN_DEMO_CHOOSER_EVENT, openChooser);
    return () => window.removeEventListener(OPEN_DEMO_CHOOSER_EVENT, openChooser);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const handleEnterAs = (role: MockAccountRole) => {
    localStorage.setItem("kumusta_mock_role", role);
    document.cookie = `kumusta_demo_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("kumusta_role_change", { detail: role }));
    setIsOpen(false);
    router.push("/dashboard");
  };

  const accounts = [
    {
      role: "SCHOOL_ADMIN" as const,
      icon: School,
      name: "Mr. Anton Lulu",
      label: "School Admin",
      organization: "University of the Assumption",
      location: "UA Campus",
      description:
        "Campus incident queue, student welfare desk, and school-level alerts.",
    },
    {
      role: "LGU_OFFICER" as const,
      icon: Building2,
      name: "Dr. Katrina Gomez, MD",
      label: "LGU Officer",
      organization: "City of San Fernando",
      location: "San Fernando",
      description:
        "Municipal overview, multi-school alerts, and city monitoring map.",
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full max-w-3xl items-center justify-between gap-4 rounded-2xl border border-purple-200 bg-purple-50/80 p-5 text-left shadow-sm transition hover:border-purple-400 hover:bg-purple-50 sm:p-6"
        aria-haspopup="dialog"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-900 text-purple-100">
            <Sparkles size={17} />
          </span>
          <span>
            <span className="block font-extrabold text-purple-950">
              Try a demonstration account
            </span>
            <span className="mt-1 block text-xs text-purple-700">
              Choose a School Admin or LGU Officer preview
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-900 px-4 py-2.5 text-xs font-bold text-white transition group-hover:bg-purple-950">
          Choose account
          <ArrowRight size={14} />
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-account-title"
            className="w-full max-w-2xl rounded-3xl border border-purple-100 bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-purple-100 pb-4">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-800">
                  <Sparkles size={12} />
                  Demonstration mode
                </span>
                <h2
                  id="demo-account-title"
                  className="text-xl font-black tracking-tight text-purple-950 sm:text-2xl"
                >
                  Choose an account
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Preview the dashboard from either admin perspective. No password required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close account chooser"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {accounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleEnterAs(account.role)}
                    className="group flex min-h-52 flex-col rounded-2xl border border-purple-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-50/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <span className="mb-4 flex w-full items-start justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-900 text-sm font-black text-white">
                          {MOCK_ACCOUNTS[account.role].initials}
                        </span>
                        <span>
                          <span className="block font-bold text-purple-950">
                            {account.name}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-purple-700">
                            {account.label}
                          </span>
                        </span>
                      </span>
                      <span className="rounded-lg bg-purple-100 p-2 text-purple-800">
                        <Icon size={15} />
                      </span>
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {account.organization}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-slate-600">
                      {account.description}
                    </span>
                    <span className="mt-auto flex items-center justify-between border-t border-purple-100 pt-3 text-xs font-bold text-purple-900">
                      <span>Enter as {account.label}</span>
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-1"
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
              These are demo personas for previewing the interface, not real user accounts.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
