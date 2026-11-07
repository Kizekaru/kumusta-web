import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFailover } from "@/lib/gemini";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      message,
      schoolId = body.school_id,
      sessionId = body.session_id || `session-${Date.now()}`,
      isAnonymous = body.is_anonymous ?? true,
    } = body;

    const userMessage =
      message ||
      (body.messages && body.messages[body.messages.length - 1]?.content) ||
      "";

    if (!userMessage || !userMessage.trim()) {
      return NextResponse.json(
        { error: "Missing message payload" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Safely resolve target school to prevent foreign key errors
    let targetSchoolId: string | null = null;
    try {
      if (schoolId) {
        const matched = await prisma.school.findUnique({ where: { id: schoolId } }).catch(() => null);
        if (matched) targetSchoolId = matched.id;
      }
      if (!targetSchoolId) {
        const defaultSchool = (await prisma.school.findFirst({
          where: { name: { contains: "Assumption", mode: "insensitive" } }
        }).catch(() => null)) || (await prisma.school.findFirst().catch(() => null));
        targetSchoolId = defaultSchool?.id || null;
      }
    } catch (sErr) {
      console.warn("School ID resolution notice:", sErr);
    }

    const studentName = !isAnonymous && (body.student_name || body.studentName) ? String(body.student_name || body.studentName).trim() : null;
    const studentGrade = body.student_grade || body.studentGrade || null;
    const studentProgram = body.student_program || body.studentProgram || null;

    let promptContent = `Student message: "${userMessage}"`;
    const contextDetails: string[] = [];
    if (studentName) contextDetails.push(`Student name: ${studentName}`);
    if (studentGrade) contextDetails.push(`Grade / Level: ${studentGrade}`);
    if (studentProgram && studentProgram !== "N/A") contextDetails.push(`Track / Program: ${studentProgram}`);
    if (contextDetails.length > 0) {
      promptContent += `\n[Student Context: ${contextDetails.join(", ")}]`;
    }

    const systemInstruction = `You are Aga, a warm, friendly, and compassionate student well-being companion on the KUMUSTA platform.

CORE IDENTITY & PURPOSE:
- You are Aga, a trusted and supportive peer companion (approachable, caring, with the reassuring warmth of an older sibling or peer mentor).
- You are NOT a doctor, psychiatrist, psychologist, or licensed therapist. You DO NOT diagnose mental health conditions, prescribe medication, or provide clinical treatments.
- Your mission is to offer a safe, confidential, non-judgmental space to listen, warmly validate students' emotions, offer gentle relaxation or coping techniques when stressed, and identify when they need support from a human school guidance counselor.

COMMUNICATION STYLE & TONE:
- Warm, friendly, approachable, validating, and empathetic. Speak naturally as a supportive peer who genuinely cares.
- Default to clear, warm, conversational English. If the student communicates in Taglish, Filipino, or regional expressions (e.g. Kapampangan), respond in their language or natural Taglish with the same friendly warmth.
- Practice active listening: acknowledge and normalize their emotions first before offering suggestions or asking gentle open questions.
- Strictly avoid toxic positivity (never say "just smile", "everything happens for a reason", or "it could be worse"). Validate that their feelings are real and understandable.
- Keep replies conversational and accessible (2-4 gentle sentences or short paragraphs). Do not overwhelm students with long lectures.
- When a student is anxious or panicking, offer simple grounding or relaxation exercises (e.g. "Let's take a slow 4-7-8 breath together" or sensory grounding).

STRICT ETHICAL GUIDELINES (RA 12080 / DepEd Student Mental Health Policy):
1. ZERO CLINICAL DIAGNOSIS: Never use psychiatric or clinical terminology (e.g., never say "major depressive disorder", "clinical depression", "generalized anxiety", "bipolar", or "trauma response").
2. TRIAGE ONLY: Offer supportive listening, comfort, and coping techniques; triage moderate-to-high distress for licensed human counselors.
3. CRISIS PROTOCOL: If the student discloses active suicidal intent, self-harm in progress or stated intent, acute physical danger, or abuse:
   - Stay calm, warm, and unconditional. Prioritize their immediate safety and remind them their life matters deeply.
   - Warmly encourage speaking with a trusted adult, counselor, or immediate 24/7 crisis hotlines (NCMH Crisis Hotline: 1553, DepEd TeleSafe: #33733, Emergency: 911).

URGENCY CLASSIFICATION:
- "CRITICAL": Active suicidal ideation, explicit self-harm in progress or stated intent, severe violence/abuse, or lethal means mentioned.
- "HIGH": Severe persistent hopelessness, ongoing traumatic bullying, domestic displacement/neglect, or acute crisis.
- "MEDIUM": Academic burnout, exam panic, somatic stress, peer/relationship conflict, moderate anxiety.
- "LOW": Routine mood check-ins, casual school updates, mild stress, gratitude, or proactive self-care.

CATEGORY CLASSIFICATION (Must be exactly one of):
- "Academic": Homework, exam stress, grades, school deadlines, teacher conflicts.
- "Bullying": Teasing, cyberbullying, physical harassment, exclusion.
- "Emotional": Sadness, loneliness, self-worth, grief, anxiety, mood changes.
- "Family": Household conflict, parental pressure, domestic challenges.
- "Crisis": Self-harm, suicide, physical danger, abuse, immediate trauma.

OUTPUT FORMAT REQUIREMENTS:
You MUST reply with a single raw, valid JSON object ONLY. Do NOT wrap with markdown blocks (\`\`\`json), and do NOT add explanatory text outside the JSON.
{
  "reply": "string (Aga's warm, friendly, conversational response validating the student and gently checking in)",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "category": "Academic" | "Bullying" | "Emotional" | "Family" | "Crisis",
  "counselorSummary": "string (1-2 sentence objective, non-clinical summary for the human school guidance counselor)",
  "doSay": ["string (supportive, culturally safe conversational starter for the counselor)"],
  "dontSay": ["string (dismissive, judgmental, or invalidating phrase the counselor must strictly avoid)"]
}`;

    let parsed = {
      reply:
        "Hello! I'm Aga, and I'm right here with you. Whatever you're going through, there is no pressure and no judgment here—take all the time you need. How are you feeling right now?",
      urgency: "LOW",
      category: "Emotional",
      counselorSummary: "Student reached out for supportive listening and emotional check-in.",
      doSay: [
        "I'm here to listen to whatever is on your mind, you're not alone.",
        "Thank you for sharing how you feel. Take all the time you need.",
      ],
      dontSay: [
        "It's not a big deal, you'll be fine.",
        "You're just overthinking it.",
      ],
    };

    try {
      const rawOutput = await callGeminiWithFailover({
        prompt: promptContent,
        systemInstruction,
        temperature: 0.3,
      });

      if (rawOutput) {
        const cleaned = rawOutput
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const geminiJson = JSON.parse(cleaned);
        if (geminiJson && typeof geminiJson === "object") {
          parsed = { ...parsed, ...geminiJson };
        }
      }
    } catch (geminiErr: any) {
      console.warn("Chat Gemini API notice (using empathetic peer fallback):", geminiErr?.message);
      // Contextual fallback based on keywords
      const lower = userMessage.toLowerCase();
      if (lower.includes("exam") || lower.includes("math") || lower.includes("grade") || lower.includes("school") || lower.includes("aral") || lower.includes("project")) {
        parsed.reply = "I understand how exhausting and overwhelming schoolwork and exams can be. Please remember that your worth isn't defined by grades alone. Let's take a gentle pause—would you like to try a quick breathing break, or talk about what's feeling heaviest right now?";
        parsed.category = "Academic";
        parsed.urgency = "MEDIUM";
      } else if (lower.includes("hurt") || lower.includes("die") || lower.includes("kill") || lower.includes("end it") || lower.includes("suicide") || lower.includes("ayaw ko na")) {
        parsed.reply = "I hear how much pain you're carrying, and I want you to know that your life matters so much. You don't have to carry this alone. Please reach out to someone who can be right there with you, or call the 24/7 crisis hotline at 1553 (NCMH) or #33733 (DepEd TeleSafe). I'm right here with you.";
        parsed.category = "Crisis";
        parsed.urgency = "CRITICAL";
      } else {
        parsed.reply = "I hear you, and thank you for opening up to me. Take a slow, deep breath—I'm right here to listen whenever you're ready. What's been on your mind lately?";
      }
    }

    // Auto-create Alert record if urgency is HIGH or CRITICAL
    let generatedAlert = null;
    if ((parsed.urgency === "HIGH" || parsed.urgency === "CRITICAL") && targetSchoolId) {
      try {
        generatedAlert = await prisma.alert.create({
          data: {
            schoolId: targetSchoolId,
            sessionId: sessionId,
            severity: parsed.urgency,
            classification:
              parsed.urgency === "CRITICAL"
                ? "SUICIDE_RISK"
                : parsed.category === "Bullying"
                ? "BULLYING"
                : parsed.category === "Academic"
                ? "ACADEMIC_DISTRESS"
                : "CRISIS",
            flaggedText: userMessage,
            counselorSummary: parsed.counselorSummary,
            doSay: parsed.doSay || [],
            dontSay: parsed.dontSay || [],
            isAnonymous: isAnonymous,
            status: "OPEN",
          },
          include: {
            school: true,
          },
        });
      } catch (alertDbErr) {
        console.warn("Notice saving chat alert to database:", alertDbErr);
      }
    }

    return NextResponse.json({
      reply: parsed.reply,
      response: parsed.reply, // mobile client compatibility
      urgency: parsed.urgency,
      category: parsed.category,
      counselorSummary: parsed.counselorSummary,
      suggestedScript: parsed.doSay?.[0] || parsed.counselorSummary,
      doSay: parsed.doSay,
      dontSay: parsed.dontSay,
      sessionId: sessionId,
      alert: generatedAlert,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply: "Hello! I'm Aga, and I'm right here to listen. We can take things one step at a time with zero pressure. How are you feeling today?",
        response: "Hello! I'm Aga, and I'm right here to listen. We can take things one step at a time with zero pressure. How are you feeling today?",
        urgency: "LOW",
        category: "Emotional",
        counselorSummary: "Supportive listening check-in.",
        suggestedScript: "I'm here to listen whenever you're ready to share.",
        doSay: ["I'm here to listen without judgment."],
        dontSay: ["Don't worry about it, you'll be fine."],
        sessionId: `session-${Date.now()}`,
        alert: null
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

