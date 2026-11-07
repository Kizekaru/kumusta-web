"use client";

import React, { useState } from "react";
import { useSession } from "@clerk/nextjs";
import { completeOnboarding } from "@/app/actions/onboarding";

interface SchoolItem {
  id: string;
  name: string;
  region: string;
}

export default function OnboardingForm({ schools }: { schools: SchoolItem[] }) {
  const { session } = useSession();
  const [role, setRole] = useState("SCHOOL_ADMIN");
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedSchool = role === "SCHOOL_ADMIN" ? schoolId : null;
      const res = await completeOnboarding(role, selectedSchool);
      if (res?.success && res.redirectUrl) {
        // Force Clerk to refresh session metadata claims immediately
        await session?.reload();
        // Force redirect to updated portal route
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete onboarding. Please verify selection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bento-card max-w-md w-full bg-white border border-slate-200 p-8 flex flex-col gap-6 shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-800">Complete Profile Setup</h2>
        <p className="text-sm text-slate-500 mt-1 font-sans">Select your portal access level to continue to KUMUSTA</p>
      </div>

      <div>
        <label className="block text-xs uppercase font-bold text-slate-400 mb-2 font-mono">Access Portal Role</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("SCHOOL_ADMIN")}
            className={`p-3 rounded-lg border text-sm font-bold transition font-sans ${
              role === "SCHOOL_ADMIN"
                ? "bg-accent-teal text-white border-accent-teal shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            School Admin
          </button>
          <button
            type="button"
            onClick={() => setRole("LGU_OFFICER")}
            className={`p-3 rounded-lg border text-sm font-bold transition font-sans ${
              role === "LGU_OFFICER"
                ? "bg-accent-teal text-white border-accent-teal shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            LGU Officer
          </button>
        </div>
      </div>

      {role === "SCHOOL_ADMIN" && (
        <div>
          <label className="block text-xs uppercase font-bold text-slate-400 mb-2 font-mono">Assign to School</label>
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            required
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-accent-teal font-sans"
          >
            <option value="">Select your assigned school...</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name} ({school.region})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (role === "SCHOOL_ADMIN" && !schoolId)}
        className="w-full py-3 bg-accent-teal hover:bg-teal-600 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-sm font-sans"
      >
        {loading ? "Completing Profile..." : "Complete Setup"}
      </button>
    </form>
  );
}
