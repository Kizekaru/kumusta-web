import { NextRequest, NextResponse } from "next/server";

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
  return NextResponse.json(
    {
      school_id: "pampanga-core",
      grade_level: "Grade 11",
      class_section: "Section A",
      academic_program: "STEM",
    },
    { headers: corsHeaders }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(
      {
        success: true,
        profile: body,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid profile payload" },
      { status: 400, headers: corsHeaders }
    );
  }
}
