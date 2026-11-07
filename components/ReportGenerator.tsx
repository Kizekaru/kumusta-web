"use client";

import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SchoolPriority {
  id: string;
  name: string;
  region: string;
  unresolvedSessions: number;
  crisisAlerts: number;
}

export default function ReportGenerator({ schools, regionsSummary }: { schools: SchoolPriority[]; regionsSummary: any[] }) {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166);
    doc.text("PAMPANGA CIVIC WELL-BEING REPORT", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    const headers = [["School Name", "Municipality", "Active Requests", "Crisis Incidents"]];
    const data = schools.map(s => [s.name, s.region, s.unresolvedSessions.toString(), s.crisisAlerts.toString()]);

    autoTable(doc, {
      startY: 32,
      head: headers,
      body: data,
      theme: "striped",
      headStyles: { fillColor: [20, 184, 166] },
    });

    const subHeaders = [["Municipality", "Total Active Requests"]];
    const subData = regionsSummary.map(r => [r.region, r.tickets.toString()]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : 90,
      head: subHeaders,
      body: subData,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11] },
    });

    doc.save("provincial_wellbeing_report.pdf");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold font-sans text-slate-800">Intervention Report Controls</h3>
        <button
          onClick={handleExport}
          className="bg-accent-teal hover:bg-teal-600 text-white font-semibold font-sans px-4 py-2 rounded-lg transition shadow-sm"
        >
          Generate Civic PDF Report
        </button>
      </div>

      <div className="bento-card">
        <h3 className="text-lg font-bold font-sans text-slate-800 mb-4">Priority Resource Allocation Index</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 font-sans">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">School Name</th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Municipality</th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Active Requests</th>
                <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Crisis Incidents</th>
                <th className="px-6 py-3 text-right text-xs font-mono uppercase text-slate-500 font-semibold">Allocation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-sm text-slate-700">
              {schools.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-bold">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-accent-amber font-bold">{row.unresolvedSessions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-accent-rose font-bold">{row.crisisAlerts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-accent-emerald">
                    {row.crisisAlerts > 3 ? "URGENT INTERVENTION" : "MONITORING"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
