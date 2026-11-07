"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { updateRequestStatus } from "@/app/actions/requests";
import { X } from "lucide-react";

interface RequestData {
  id: string;
  status: string;
  studentContact: string | null;
  counselorNotes: string | null;
  createdAt: string;
  session: {
    studentGrade: string | null;
    studentSection: string | null;
    concernCategory: string | null;
    urgencyLevel: string | null;
    summary: string | null;
  };
}

export default function RequestsTable({ initialRequests, schoolId }: { initialRequests: RequestData[]; schoolId: string }) {
  const [requests, setRequests] = useState<RequestData[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [notes, setNotes] = useState("");
  const [statusVal, setStatusVal] = useState("new");
  const router = useRouter();

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  // Handle live status / insert updates from Supabase Realtime channel (guarded against empty schoolId)
  useEffect(() => {
    if (!schoolId) return;
    const channel = supabase
      .channel("public:support_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_requests", filter: `school_id=eq.${schoolId}` },
        async () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, router]);

  const handleSave = async () => {
    if (!selectedRequest) return;
    await updateRequestStatus(selectedRequest.id, statusVal, notes);
    setSelectedRequest(null);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 font-sans">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Grade/Sec</th>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Concern</th>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase text-slate-500 font-semibold">Date</th>
              <th className="px-6 py-3 text-right text-xs font-mono uppercase text-slate-500 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-sm text-slate-700">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-accent-teal font-bold">{req.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {req.session.studentGrade || "N/A"}-{req.session.studentSection || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{req.session.concernCategory || "General"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      req.session.urgencyLevel === "CRISIS"
                        ? "bg-accent-rose/10 text-accent-rose"
                        : req.session.urgencyLevel === "HIGH"
                        ? "bg-orange-500/10 text-orange-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {req.session.urgencyLevel || "LOW"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      req.status === "resolved"
                        ? "bg-accent-emerald/10 text-accent-emerald"
                        : req.status === "in_progress"
                        ? "bg-accent-amber/10 text-accent-amber"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setNotes(req.counselorNotes || "");
                      setStatusVal(req.status);
                    }}
                    className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-sans shadow-sm"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-sans">Manage Ticket: {selectedRequest.id}</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-mono">Student Summary (AI)</span>
              <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
                {selectedRequest.session.summary || "No automated session summary available."}
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase font-mono mb-1">Status</label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-accent-teal"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase font-mono mb-1">Counselor Progress Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Enter counseling progress logs, intervention milestones..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-accent-teal placeholder-slate-400 font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-accent-teal text-white font-semibold rounded-lg font-sans shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
