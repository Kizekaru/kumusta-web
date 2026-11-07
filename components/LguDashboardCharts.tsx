"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LguProps {
  municipalityMatrix: {
    region: string;
    schools: number;
    sessions: number;
    tickets: number;
  }[];
  concernDistribution: {
    category: string;
    count: number;
  }[];
}

export default function LguDashboardCharts({ municipalityMatrix, concernDistribution }: LguProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card">
          <h3 className="text-lg font-bold font-sans text-slate-800 mb-4">Regional Distribution Overview</h3>
          <div className="h-[250px] w-full font-mono text-xs text-slate-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={municipalityMatrix}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="region" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", color: "#0f172a" }} />
                <Bar dataKey="sessions" fill="#14b8a6" name="Sessions" />
                <Bar dataKey="tickets" fill="#f59e0b" name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-sans text-slate-800">Provincial Concern Breakdown</h3>
            <span className="px-2 py-0.5 bg-accent-teal/10 border border-accent-teal/30 text-[10px] font-mono text-accent-teal rounded font-bold">
              Privacy Guardrail Active (N ≥ 10)
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {concernDistribution.map((item, idx) => {
              const displayVal = item.count >= 10 ? `${item.count} Cases` : "Suppressed (< 10)";
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="capitalize text-slate-700 font-medium">{item.category}</span>
                    <span className="text-slate-500">{displayVal}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-accent-teal h-2 rounded-full"
                      style={{
                        width: `${item.count >= 10 ? (item.count / 100) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {concernDistribution.length === 0 && (
              <div className="text-slate-400 font-mono text-center py-12">No concern metric records logged</div>
            )}
          </div>
        </div>
      </div>

      <div className="bento-card">
        <h3 className="text-lg font-bold font-sans text-slate-800 mb-4">Municipality Comparative Matrix</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 font-sans">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Municipality (Region)</th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Schools Connected</th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Total Chat Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Active Support Tickets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-sm text-slate-700">
              {municipalityMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-bold">{row.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.schools}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.sessions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-accent-amber font-bold">{row.tickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
