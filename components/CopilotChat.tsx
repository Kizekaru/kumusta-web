"use client";

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";

export default function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/copilot",
    initialMessages: [
      {
        id: "init",
        role: "assistant",
        content: "Kumusta! I am your Civic & School Copilot. How can I assist you with support trends or resource allocation?",
      },
    ],
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-accent-teal hover:bg-teal-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 text-white"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-24 w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800">Kumusta Copilot</h4>
              <span className="text-[9px] font-mono text-accent-teal uppercase font-bold">Vercel AI SDK Streaming</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-xl p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-accent-teal text-white self-end font-medium shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 self-start shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 self-start max-w-[85%] rounded-xl p-3 text-sm font-mono shadow-sm">
                <Loader2 size={14} className="animate-spin text-accent-teal" />
                <span>Streaming response...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about trends or resources..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-teal"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-accent-teal hover:bg-teal-600 disabled:opacity-50 text-white p-2.5 rounded-lg transition"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
