import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        division: true,
        latitude: true,
        longitude: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(schools);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Database error" }, { status: 500 });
  }
}
