import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const schoolId = searchParams.get("schoolId");

    const alerts = await prisma.alert.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(schoolId ? { schoolId } : {}),
      },
      include: {
        school: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    console.error("Fetch alerts error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      schoolId = body.school_id,
      sessionId = body.session_id || `session-${Date.now()}`,
      flaggedText = body.flagged_text,
      classification = body.classification || "CRISIS",
      severity = body.severity || "HIGH",
      isAnonymous = body.is_anonymous ?? true,
      counselorSummary = body.counselor_summary || body.summary,
      doSay = body.do_say,
      dontSay = body.dont_say,
    } = body;

    if (!flaggedText) {
      return NextResponse.json({ error: "Missing required flaggedText field" }, { status: 400 });
    }

    // Safely resolve valid school ID to satisfy foreign key constraint
    let resolvedSchoolId: string | null = null;
    try {
      if (schoolId) {
        const matched = await prisma.school.findUnique({ where: { id: schoolId } }).catch(() => null);
        if (matched) resolvedSchoolId = matched.id;
      }
      if (!resolvedSchoolId) {
        const matchedByName = await prisma.school.findFirst({
          where: {
            OR: [
              { name: { contains: "Pampanga High", mode: "insensitive" } },
              { name: { contains: "Pampanga", mode: "insensitive" } },
            ]
          }
        }).catch(() => null);
        if (matchedByName) resolvedSchoolId = matchedByName.id;
      }
      if (!resolvedSchoolId) {
        const defaultSchool = await prisma.school.findFirst().catch(() => null);
        resolvedSchoolId = defaultSchool?.id || null;
      }
    } catch (sErr) {
      console.warn("School ID resolution notice:", sErr);
    }

    if (!resolvedSchoolId) {
      return NextResponse.json({ error: "No registered schools available" }, { status: 400 });
    }

    // Fallback intervention guidelines based on classification/severity
    const defaultDoSay = doSay && doSay.length > 0 ? doSay : [
      "Nandito ako para pakinggan ka nang walang panghuhusga.",
      "Salamat sa lakas ng loob na sabihin ito. Sama-sama nating haharapin ito nang ligtas."
    ];

    const defaultDontSay = dontSay && dontSay.length > 0 ? dontSay : [
      "Huwag ka kasing mag-isip ng ganyan.",
      "Wala lang yan, lilipas din yan bukas."
    ];

    const defaultSummary = counselorSummary || `Student flagged with ${severity} severity (${classification}) requiring immediate counseling review.`;

    const alert = await prisma.alert.create({
      data: {
        schoolId: resolvedSchoolId,
        sessionId: sessionId,
        severity: severity.toUpperCase(),
        classification: classification.toUpperCase(),
        flaggedText: flaggedText,
        counselorSummary: defaultSummary,
        doSay: defaultDoSay,
        dontSay: defaultDontSay,
        isAnonymous: isAnonymous,
        status: "OPEN",
      },
      include: {
        school: true,
      },
    });

    return NextResponse.json({
      success: true,
      alertId: alert.id,
      alert: alert,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Alert ingestion error:", error);
    return NextResponse.json({ error: error.message || "Failed to ingest alert" }, { status: 500, headers: corsHeaders });
  }
}
