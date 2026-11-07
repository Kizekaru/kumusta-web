# Clerk Database User & Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a database `User` table and onboarding route `/onboarding` for newly registered Clerk users to select their role and school, saving metadata to Clerk and records to PostgreSQL.

**Architecture:** 
1. Add a `User` table to the Prisma schema matching the Clerk user identity.
2. Intercept authenticated requests in the middleware and redirect un-onboarded users (those without `role` metadata) to `/onboarding`.
3. Build `/onboarding` with a light-mode form to choose role and school, submitting to a Server Action that inserts the database row and updates Clerk metadata.

**Tech Stack:** Next.js 16 (App Router), Prisma, Clerk Backend SDK, Tailwind CSS, PostgreSQL.

## Global Constraints
- Do not run git commands; the user will manage git operations themselves.
- Maintain light mode UI styling using Tailwind CSS slate/zinc classes.
- Target Node.js 20+ and Next.js 16 environment.

---

### Task 1: Database User Schema Update
**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: Database schema structures.
- Produces: Updated database tables mapping `User` model.

- [ ] **Step 1: Add User model to Prisma schema**
  Add the `User` model at the bottom of the file and reference it inside the `School` model.
  ```prisma
  // In School model:
  // users User[]
  
  model User {
    id        String   @id
    email     String   @unique
    role      String   
    schoolId  String?  @map("school_id") @db.Uuid
    school    School?  @relation(fields: [schoolId], references: [id], onDelete: SetNull)
    createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
    updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

    @@map("users")
    @@schema("public")
  }
  ```
- [ ] **Step 2: Generate the client offline**
  Run: `npx prisma generate`
  Expected: Successful client generation output message.

---

### Task 2: Middleware Role-less Onboarding Redirection
**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Update middleware to protect and redirect**
  Modify `middleware.ts` to inspect metadata and redirect authenticated users with missing `role` tags to `/onboarding`:
  ```typescript
  import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
  import { NextResponse } from "next/server";

  const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/unauthorized", "/"]);
  const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

  export default clerkMiddleware(async (auth, req) => {
    const session = await auth();
    const { userId } = session;

    // 1. If user is authenticated
    if (userId) {
      const claims = (session.sessionClaims || {}) as any;
      const metadata = claims.metadata || claims.public_metadata || {};
      const userRole = metadata.role;

      // Redirect role-less users to onboarding
      if (!userRole && !isOnboardingRoute(req) && !isPublicRoute(req)) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      // Prevent onboarded users from returning to onboarding
      if (userRole && isOnboardingRoute(req)) {
        if (userRole === "LGU_OFFICER") {
          return NextResponse.redirect(new URL("/lgu/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/school/dashboard", req.url));
      }
    } else {
      // 2. Unauthenticated users trying to access protected dashboards
      if (!isPublicRoute(req) && !isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    }

    return NextResponse.next();
  });

  export const config = {
    matcher: [
      "/((?!_next|[^?]*\\.(?:html|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      "/(api|trpc)(.*)",
      "/__clerk/:path*",
    ],
  };
  ```

---

### Task 3: Onboarding Server Action
**Files:**
- Create: `app/actions/onboarding.ts`

**Interfaces:**
- Produces: `completeOnboarding(role: string, schoolId: string | null) => Promise<void>`

- [ ] **Step 1: Create server action using Clerk Backend SDK**
  Instantiate the Clerk backend client and update both PostgreSQL and Clerk token metadata:
  ```typescript
  "use server";

  import { prisma } from "@/lib/db";
  import { getUserSession } from "@/lib/auth";
  import { clerkClient } from "@clerk/nextjs/server";
  import { redirect } from "next/navigation";

  export async function completeOnboarding(role: string, schoolId: string | null) {
    const session = await getUserSession();
    if (!session) throw new Error("Unauthorized");

    const userId = session.userId;
    const email = session.email;

    // 1. Write to PostgreSQL User table
    await prisma.user.create({
      data: {
        id: userId,
        email: email,
        role: role,
        schoolId: schoolId,
      },
    });

    // 2. Update Clerk public metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
        school_id: schoolId,
      },
    });

    // 3. Redirect to the appropriate portal dashboard
    if (role === "LGU_OFFICER") {
      redirect("/lgu/dashboard");
    } else {
      redirect("/school/dashboard");
    }
  }
  ```

---

### Task 4: Onboarding Form Interface Route
**Files:**
- Create: `app/onboarding/page.tsx`

- [ ] **Step 1: Create the onboarding interactive UI**
  Query active schools dynamically and render a clean light-mode form layout:
  ```typescript
  import React from "react";
  import { prisma } from "@/lib/db";
  import { getUserSession } from "@/lib/auth";
  import { redirect } from "next/navigation";
  import OnboardingForm from "@/components/OnboardingForm";

  export const dynamic = "force-dynamic";

  export default async function OnboardingPage() {
    const session = await getUserSession();
    if (!session) redirect("/sign-in");

    // Redirect already onboarded users
    if (session.role) {
      if (session.role === "LGU_OFFICER") redirect("/lgu/dashboard");
      redirect("/school/dashboard");
    }

    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        region: true,
      },
    });

    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <OnboardingForm schools={schools} />
      </div>
    );
  }
  ```

- [ ] **Step 2: Create OnboardingForm client component**
  Create `components/OnboardingForm.tsx` to handle role toggles and submission:
  ```typescript
  "use client";

  import React, { useState } from "react";
  import { completeOnboarding } from "@/app/actions/onboarding";

  interface SchoolItem {
    id: string;
    name: string;
    region: string;
  }

  export default function OnboardingForm({ schools }: { schools: SchoolItem[] }) {
    const [role, setRole] = useState("SCHOOL_ADMIN");
    const [schoolId, setSchoolId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const selectedSchool = role === "SCHOOL_ADMIN" ? schoolId : null;
        await completeOnboarding(role, selectedSchool);
      } catch (err) {
        console.error(err);
        alert("Failed to complete onboarding. Please verify selection and try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="bento-card max-w-md w-full bg-white border border-slate-200 p-8 flex flex-col gap-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800">Complete Profile Setup</h2>
          <p className="text-sm text-slate-500 mt-1">Select your portal access level to continue to KUMUSTA</p>
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-slate-400 mb-2">Access Portal Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("SCHOOL_ADMIN")}
              className={`p-3 rounded-lg border text-sm font-bold transition ${
                role === "SCHOOL_ADMIN"
                  ? "bg-accent-teal text-white border-accent-teal shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              School Admin
            </button>
            <button
              type="button"
              onClick={() => setRole("LGU_OFFICER")}
              className={`p-3 rounded-lg border text-sm font-bold transition ${
                role === "LGU_OFFICER"
                  ? "bg-accent-teal text-white border-accent-teal shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              LGU Officer
            </button>
          </div>
        </div>

        {role === "SCHOOL_ADMIN" && (
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">Assign to School</label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-accent-teal"
            >
              <option value="">Select your assigned school...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.region})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (role === "SCHOOL_ADMIN" && !schoolId)}
          className="w-full py-3 bg-accent-teal text-white font-bold rounded-lg hover:bg-teal-600 transition disabled:opacity-50 shadow-sm"
        >
          {loading ? "Completing Profile..." : "Complete Setup"}
        </button>
      </form>
    );
  }
  ```
