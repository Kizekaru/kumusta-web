"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { OPEN_DEMO_CHOOSER_EVENT } from "@/lib/demoEvents";

interface DemoLaunchButtonProps {
  label: string;
  className: string;
}

export default function DemoLaunchButton({
  label,
  className,
}: DemoLaunchButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_DEMO_CHOOSER_EVENT))}
      className={className}
      aria-haspopup="dialog"
    >
      <span className="font-bold">{label}</span>
      <ArrowRight size={16} className="text-purple-200" />
    </button>
  );
}
