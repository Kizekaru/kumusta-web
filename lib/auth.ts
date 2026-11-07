import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export interface UserMetadata {
  role: "SCHOOL_ADMIN" | "GUIDANCE_COUNSELOR" | "LGU_OFFICER";
  school_id?: string;
}

export async function getUserSession() {
  const session = await auth();
  if (!session || !session.userId) return null;
  
  const userId = session.userId;
  const claims = (session.sessionClaims || {}) as any;
  const metadata = claims.metadata || claims.public_metadata || {};
  
  // Read and parse user-bound session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("kumusta_session")?.value;
  let role = null;
  let schoolId = null;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      // Only trust the cookie if it belongs to the currently logged in user
      if (parsed.userId === userId) {
        role = parsed.role;
        schoolId = parsed.schoolId;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Fallback to Clerk claims if no valid user-bound cookie exists
  if (!role) {
    role = metadata.role || null;
  }
  if (!schoolId) {
    schoolId = metadata.school_id || metadata.schoolId || null;
  }

  const email = claims.email || "";

  // DEVELOPMENT TESTING BYPASS (Sub-address compatible):
  if (!role && email) {
    const baseUsername = email.toLowerCase().split("@")[0].split("+")[0] || "";
    if (baseUsername === "admin") {
      role = "SCHOOL_ADMIN";
      schoolId = "ff580a37-f3d9-4377-9912-e4dc9dbec297"; // Mapped to your school UUID
    } else if (baseUsername === "lgu") {
      role = "LGU_OFFICER";
    }
  }

  return {
    userId,
    role,
    schoolId,
    email,
  };
}
