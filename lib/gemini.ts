import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const GEMINI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  "AQ.Ab8RN6KceW76sEfkk94u882JWr5aN-V3ES3_2-oWr7CykM-Txg";

const googleClient = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
});

/**
 * KUMUSTA Centralized Gemini Multi-Model Failover Helper
 * Primary: gemini-3.7-flash (Speed & high reasoning quality)
 * Failover 1: gemini-3.5-flash-lite (High availability lightweight backup)
 * Failover 2: gemini-2.0-flash (High speed next-gen fallback)
 * Failover 3: gemini-1.5-flash (Standard fallback)
 *
 * Strict Non-Clinical Persona: Zero psychiatric diagnoses or clinical labeling.
 */
export async function callGeminiWithFailover({
  prompt,
  systemInstruction,
  temperature = 0.4,
}: {
  prompt: string;
  systemInstruction: string;
  temperature?: number;
}): Promise<string> {
  try {
    const response = await generateText({
      model: googleClient("gemini-3.7-flash"),
      system: systemInstruction,
      prompt,
      temperature,
    });
    return response.text;
  } catch (primaryError: any) {
    console.warn(
      "Gemini 3.7 Flash notice. Falling back to Gemini 3.5 Flash Lite:",
      primaryError?.message
    );
    try {
      const response = await generateText({
        model: googleClient("gemini-3.5-flash-lite"),
        system: systemInstruction,
        prompt,
        temperature,
      });
      return response.text;
    } catch (secondaryError: any) {
      console.warn(
        "Gemini 3.5 Flash Lite notice. Falling back to Gemini 2.0 Flash:",
        secondaryError?.message
      );
      try {
        const response = await generateText({
          model: googleClient("gemini-2.0-flash"),
          system: systemInstruction,
          prompt,
          temperature,
        });
        return response.text;
      } catch (tertiaryError: any) {
        console.warn(
          "Gemini 2.0 Flash notice. Falling back to Gemini 1.5 Flash:",
          tertiaryError?.message
        );
        try {
          const response = await generateText({
            model: googleClient("gemini-1.5-flash"),
            system: systemInstruction,
            prompt,
            temperature,
          });
          return response.text;
        } catch (quaternaryError: any) {
          console.warn("All Gemini AI API models notice:", quaternaryError?.message);
          throw quaternaryError;
        }
      }
    }
  }
}



