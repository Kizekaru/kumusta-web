"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ChartProps {
  trendData: { date: string; low: number; medium: number; high: number; crisis: number }[];
  concernData: { name: string; value: number }[];
  schoolName: string;
  stats: {
    students: number;
    requests: number;
    chats: number;
    alerts: number;
  };
}

export default function SchoolDashboardCharts({ trendData, concernData, schoolName, stats }: ChartProps) {
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166); // Teal accent
    doc.text("KUMUSTA CIVIC & SCHOOL REPORT", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`School: ${schoolName}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

    const headers = [["Metric", "Value"]];
    const data = [
      ["Registered Students", stats.students.toString()],
      ["Active Support Requests", stats.requests.toString()],
      ["Active Chat Sessions", stats.chats.toString()],
      ["Critical Alerts Flagged", stats.alerts.toString()],
    ];

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: data,
      theme: "striped",
      headStyles: { fillColor: [20, 184, 166] },
    });

    const categoryHeaders = [["Concern Category", "Active Count"]];
    const categoryData = concernData.map(c => [c.name, c.value.toString()]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : 90,
      head: categoryHeaders,
      body: categoryData,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11] }, // Amber accent
    });

    doc.save(`${schoolName.toLowerCase().replace(/\s+/g, "_")}_kumusta_report.pdf`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold font-mono text-slate-800">{schoolName} Admin Controls</h2>
        <button
          onClick={exportPDF}
          className="bg-accent-teal hover:bg-teal-600 text-white font-semibold font-sans px-4 py-2 rounded-lg transition shadow-sm"
        >
          Export Report (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card">
          <h3 className="text-lg font-bold mb-4 font-sans text-slate-800">Well-being Check-in Trends (Last 30 Days)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: "Inter" }} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", color: "#0f172a" }} />
                <Line type="monotone" dataKey="low" stroke="#94a3b8" name="Low" strokeWidth={2} />
                <Line type="monotone" dataKey="medium" stroke="#f59e0b" name="Medium" strokeWidth={2} />
                <Line type="monotone" dataKey="high" stroke="#f97316" name="High" strokeWidth={2} />
                <Line type="monotone" dataKey="crisis" stroke="#f43f5e" name="Crisis" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card">
          <h3 className="text-lg font-bold mb-4 font-sans text-slate-800">Concern Factors Distribution</h3>
          <div className="flex flex-col gap-4">
            {concernData.map((concern, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-slate-700 font-medium">{concern.name}</span>
                  <span className="text-accent-teal font-bold">{concern.value} Sessions</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-accent-teal h-2 rounded-full"
                    style={{
                      width: `${
                        concernData.reduce((acc, c) => acc + c.value, 0) > 0
                          ? (concern.value / concernData.reduce((acc, c) => acc + c.value, 0)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {concernData.length === 0 && (
              <div className="text-slate-400 font-mono text-center py-10">No active concern records</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
