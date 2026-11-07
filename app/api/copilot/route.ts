import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing messages array" }), { status: 400 });
    }

    // Retrieve global aggregate context (non-PII) to feed system prompt
    const [totalSchools, totalCritical, totalAlerts] = await Promise.all([
      prisma.school.count(),
      prisma.alert.count({ where: { severity: "CRITICAL", status: "OPEN" } }),
      prisma.alert.count({ where: { status: "OPEN" } }),
    ]);

    const statsContext = `Live Telemetry: Monitored Schools: ${totalSchools}, Active Open Incidents: ${totalAlerts}, Critical Hotspots: ${totalCritical}`;
    const systemInstruction = `You are the KUMUSTA Civic & School Copilot in Pampanga. Use these live non-PII metrics to advise administrators and counselors: ${statsContext}`;

    let result;
    try {
      result = streamText({
        model: google("gemini-3.7-flash"),
        system: systemInstruction,
        messages,
      });
    } catch (primaryErr) {
      console.warn("Primary model gemini-3.7-flash failed, falling back to backup model.", primaryErr);
      result = streamText({
        model: google("gemini-3.5-flash-lite"),
        system: systemInstruction,
        messages,
      });
    }

    return result.toDataStreamResponse();
  } catch (error: any) {
    try {
      const { messages } = await req.json();
      const result = streamText({
        model: google("gemini-3.5-flash-lite"),
        system: "You are the KUMUSTA Civic & School Copilot in Pampanga.",
        messages,
      });
      return result.toDataStreamResponse();
    } catch (fallbackErr) {
      return new Response(JSON.stringify({ error: error.message || "Gemini execution error" }), { status: 500 });
    }
  }
}
