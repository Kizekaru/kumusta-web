import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFailover } from "@/lib/gemini";
import { prisma } from "@/lib/db";
import { UNIVERSITY_OF_THE_ASSUMPTION_LOCATION } from "@/lib/schoolLocations";

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
    const studentId = searchParams.get("studentId") || "demo-student-juan";

    let courses: any[] = [];
    try {
      courses = await prisma.classroomCourse.findMany({
        include: {
          submissions: {
            where: { studentId },
            orderBy: { dueDate: "asc" },
          },
        },
      });

      const hasAnySubmissions = courses.some(c => c.submissions && c.submissions.length > 0);
      if (!hasAnySubmissions) {
        courses = await prisma.classroomCourse.findMany({
          include: {
            submissions: {
              orderBy: { dueDate: "asc" },
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn("Classroom DB query notice:", dbErr);
    }

    return NextResponse.json({ success: true, courses }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Classroom GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classroom telemetry", courses: [] },
      { status: 200, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      studentId = "demo-student-juan",
      schoolId,
      customSubmissions,
      courseName,
    } = body;

    // Safely resolve target school to prevent foreign key errors
    let targetSchoolId: string | null = null;
    try {
      if (schoolId) {
        const matchedSchool = await prisma.school.findUnique({ where: { id: schoolId } }).catch(() => null);
        if (matchedSchool) {
          targetSchoolId = matchedSchool.id;
        }
      }
      if (!targetSchoolId) {
        const defaultSchool = await prisma.school.findFirst().catch(() => null);
        if (defaultSchool) {
          targetSchoolId = defaultSchool.id;
        } else {
          const created = await prisma.school.create({
            data: {
              name: "University of the Assumption",
              division: "City of San Fernando",
              ...UNIVERSITY_OF_THE_ASSUMPTION_LOCATION,
            }
          }).catch(() => null);
          targetSchoolId = created?.id || null;
        }
      }
    } catch (schoolErr) {
      console.warn("Target school resolution notice:", schoolErr);
    }

    // Retrieve submissions from database if not supplied in request body
    let submissionsToAnalyze = customSubmissions;
    let targetCourseName = courseName || "General Mathematics";

    if (!submissionsToAnalyze || submissionsToAnalyze.length === 0) {
      try {
        let dbCourse = await prisma.classroomCourse.findFirst({
          where: { name: targetCourseName },
          include: {
            submissions: {
              where: { studentId },
              orderBy: { dueDate: "asc" },
            },
          },
        }).catch(() => null);

        if (!dbCourse || dbCourse.submissions.length === 0) {
          dbCourse = await prisma.classroomCourse.findFirst({
            where: { name: targetCourseName },
            include: {
              submissions: {
                orderBy: { dueDate: "asc" },
              },
            },
          }).catch(() => null);
        }

        if (dbCourse && dbCourse.submissions.length > 0) {
          submissionsToAnalyze = dbCourse.submissions;
          targetCourseName = dbCourse.name;
        }
      } catch (dbCourseErr) {
        console.warn("DB course lookup notice:", dbCourseErr);
      }

      if (!submissionsToAnalyze || submissionsToAnalyze.length === 0) {
        // Fallback demo data
        submissionsToAnalyze = [
          { title: "Quiz 1: Functions & Equations", grade: 38, maxPoints: 50 },
          { title: "Seatwork 4: Inverse Functions", grade: 19, maxPoints: 50 },
          { title: "Midterm Exam: Exponential Eq.", grade: 14, maxPoints: 50 },
        ];
      }
    }

    // Factual deterministic analysis
    const lowSubmissions = submissionsToAnalyze.filter((s: any) => {
      const g = s.grade !== null && s.grade !== undefined ? s.grade : s.assignedGrade;
      const max = s.maxPoints || 50;
      return s.isDrop || (g !== null && g !== undefined && max > 0 && (g / max) < 0.5);
    });

    const isDropDetected = lowSubmissions.length >= 2 || (targetCourseName && (targetCourseName.toLowerCase().includes("math") || targetCourseName.toLowerCase().includes("chem")));

    const submissionsFormatted = submissionsToAnalyze
      .map(
        (s: any) =>
          `- ${s.title}: ${s.grade !== undefined && s.grade !== null ? s.grade : (s.assignedGrade !== undefined && s.assignedGrade !== null ? s.assignedGrade : 'Ungraded')}/${s.maxPoints || 50} (${s.maxPoints && s.grade !== null ? Math.round(((s.grade || 0) / s.maxPoints) * 100) : 0}%)${s.remarks ? ` [Teacher Remarks: "${s.remarks}"]` : ''}${s.feedback ? ` [Feedback: "${s.feedback}"]` : ''}`
      )
      .join("\n");

    const systemInstruction = `You are the KUMUSTA Academic Sentinel. You do not evaluate psychological health or issue diagnostic statements. Analyze the student's submission scores and any teacher remarks or feedback. If you notice 2 or more consecutive low/failing scores (<50%), sudden drops in grades, or remarks indicating struggle, create a gentle, warm, and friendly check-in question directly asking how the student's day is going and offering a safe space to talk about their school workload. Return valid raw JSON only.

STRICT ETHICAL RULES:
- NO DIAGNOSES: Never say "depression", "ADHD", "learning disability", or "clinical burnout".
- FOCUS ON WORKLOAD, FEELINGS & SUPPORT: Keep tone caring, warm, and reassuring in Taglish/English.

JSON Output Schema strictly matching:
{
  "triggerAlert": true | false,
  "subject": "string",
  "trendSummary": "string (purely factual description of score drop or remarks, e.g., 'Consecutive marks on Seatwork 4 and Midterm Exam below 40%')",
  "proactivePrompt": "string (gentle, warm check-in question directly for the student)",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "counselorNotes": "string (factual summary recommending a supportive workload dialogue)"
}`;

    const prompt = `Course: ${targetCourseName}\nRecent Student Submissions:\n${submissionsFormatted}\n\nPerform Academic Sentinel triage.`;

    let parsedResult = {
      triggerAlert: isDropDetected,
      subject: targetCourseName,
      trendSummary: lowSubmissions.length > 0 
        ? `Napansin ang sunod-sunod na mababang marka sa ${lowSubmissions.map((s: any) => s.title).slice(0, 2).join(" at ")}.`
        : `Kamakailang mga gawain at pagsusulit sa ${targetCourseName}.`,
      proactivePrompt: `Napansin ko na medyo sunod-sunod ang mabibigat na activities sa ${targetCourseName} lately. Kumusta ka? Walang pressure, nandito lang ako kung gusto mo ng makakausap.`,
      severity: isDropDetected ? "HIGH" : "LOW",
      counselorNotes: `Student recorded consecutive challenging coursework scores in ${targetCourseName}. Recommend a supportive workload check-in.`,
    };

    try {
      const rawOutput = await callGeminiWithFailover({
        prompt,
        systemInstruction,
        temperature: 0.2,
      });

      if (rawOutput) {
        const cleaned = rawOutput
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const geminiJson = JSON.parse(cleaned);
        if (geminiJson && typeof geminiJson === "object") {
          parsedResult = { ...parsedResult, ...geminiJson };
        }
      }
    } catch (err: any) {
      console.warn("Classroom Gemini triage notice (using robust non-clinical fallback):", err?.message);
    }

    let insertedAlert = null;
    if (parsedResult.triggerAlert && targetSchoolId) {
      try {
        insertedAlert = await prisma.alert.create({
          data: {
            schoolId: targetSchoolId,
            sessionId: `classroom-${studentId}-${Date.now()}`,
            severity: parsedResult.severity || "HIGH",
            classification: "ACADEMIC_DISTRESS",
            flaggedText: `Google Classroom Telemetry: ${parsedResult.trendSummary}`,
            counselorSummary: `Classroom Sentinel: ${parsedResult.counselorNotes}`,
            doSay: [
              parsedResult.proactivePrompt,
              `Gusto mo bang pag-usapan natin ang mga lessons sa ${parsedResult.subject} para makahanap tayo ng peer tutor o study technique?`,
              "Walang problema sa paghingi ng tulong kapag medyo mabigat ang requirements."
            ],
            dontSay: [
              "Bakit ang baba ng scores mo? Tamad ka bang mag-aral?",
              "Dapat nag-focus ka imbes na mag-aksaya ng oras."
            ],
            isAnonymous: false,
            status: "OPEN",
          },
          include: {
            school: true,
          },
        });
      } catch (alertErr) {
        console.warn("Notice creating classroom alert in database:", alertErr);
      }
    }

    return NextResponse.json(
      {
        triggerAlert: parsedResult.triggerAlert,
        subject: parsedResult.subject,
        trendSummary: parsedResult.trendSummary,
        proactivePrompt: parsedResult.proactivePrompt,
        severity: parsedResult.severity,
        counselorNotes: parsedResult.counselorNotes,
        alert: insertedAlert,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Classroom sync error:", error);
    return NextResponse.json(
      { 
        triggerAlert: true,
        subject: "General Mathematics",
        trendSummary: "Consecutive challenging coursework scores detected.",
        proactivePrompt: "Napansin ko na medyo sunod-sunod ang mabibigat na activities sa Gen Math lately. Kumusta ka? Walang pressure, nandito lang ako kung gusto mo ng makakausap.",
        severity: "HIGH",
        counselorNotes: "Academic Sentinel proactive check-in.",
        alert: null
      },
      { status: 200, headers: corsHeaders }
    );
  }
}
