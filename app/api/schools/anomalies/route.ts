import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      include: {
        alerts: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const severityWeights: Record<string, number> = {
      CRITICAL: 10,
      HIGH: 6,
      MEDIUM: 3,
      LOW: 1,
    };

    const features = schools.map((school) => {
      const openAlerts = school.alerts.filter((a) => a.status === "OPEN");
      const alertCount = openAlerts.length;

      let highestSeverity = "NONE";
      let severityScore = 0;
      const classificationCounts: Record<string, number> = {};

      if (openAlerts.length > 0) {
        if (openAlerts.some((a) => a.severity === "CRITICAL")) highestSeverity = "CRITICAL";
        else if (openAlerts.some((a) => a.severity === "HIGH")) highestSeverity = "HIGH";
        else if (openAlerts.some((a) => a.severity === "MEDIUM")) highestSeverity = "MEDIUM";
        else highestSeverity = "LOW";

        openAlerts.forEach((a) => {
          severityScore += severityWeights[a.severity] || 1;
          classificationCounts[a.classification] = (classificationCounts[a.classification] || 0) + 1;
        });
      }

      // Determine top primary concern
      let primaryConcern = "General Check-in";
      let maxClassCount = 0;
      for (const [concern, count] of Object.entries(classificationCounts)) {
        if (count > maxClassCount) {
          maxClassCount = count;
          primaryConcern = concern.replace(/_/g, " ");
        }
      }

      const latestAlert = openAlerts[0];

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [school.longitude, school.latitude], // GeoJSON standard: [lng, lat]
        },
        properties: {
          id: school.id,
          name: school.name,
          division: school.division,
          alertCount,
          totalHistoricalAlerts: school.alerts.length,
          highestSeverity,
          severityScore,
          primaryConcern,
          latestSummary: latestAlert?.counselorSummary || "No active critical anomalies reported.",
          latitude: school.latitude,
          longitude: school.longitude,
        },
      };
    });

    const geoJson = {
      type: "FeatureCollection",
      features,
    };

    return NextResponse.json(geoJson);
  } catch (error: any) {
    console.error("GeoJSON anomaly generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate anomaly GeoJSON" }, { status: 500 });
  }
}
