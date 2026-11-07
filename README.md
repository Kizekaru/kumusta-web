# KUMUSTA: Civic & School Predictive Well-being Sentinel
> **"Bridging public school counseling offices with municipal early-intervention telemetry."**
> RA 12080 Student Mental Health Act Compliant · Multi-Lingual (Tagalog, Kapampangan, English) · Non-Clinical Early Intervention · Powered by Google Gemini 3.7 Flash & 3.5 Flash Lite

KUMUSTA is an operational sentinel ecosystem connecting public schools across Pampanga, Philippines with real-time mental health triage, proactive academic drop detection, culturally safe counselor de-escalation protocols, municipal anomaly heatmaps, and native mobile student companions.

---

## 🛠️ System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          KUMUSTA Ecosystem                             │
├───────────────────────────────────┬────────────────────────────────────┤
│     Web Platform (mztah-web)      │    Mobile Platform (mztah-mobile)  │
│  - Next.js 16 (App Router)        │  - React Native / Expo (SDK 57)    │
│  - Tailwind CSS + Framer Motion   │  - Client-Side Regex Interceptor   │
│  - Prisma ORM 7.8 (Supabase PG)   │  - Discreet Panic Mask (Calc/STEM) │
│  - Supabase Realtime Channels     │  - Animated 4-7-8 Breathing Box    │
│  - Gemini 3.7 Flash & 3.5 Lite    │  - Classroom Sentinel Trigger      │
│  - Mapbox GL Anomaly Heatmap      │  - Google OAuth & Juan D. Demo Mode│
└───────────────────────────────────┴────────────────────────────────────┘
```

*   **Frontend Framework:** [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with high-contrast light-mode Bento Grid architecture, [Framer Motion](https://www.framer.com/motion/) micro-interactions, and [Lucide React](https://lucide.dev/) icons.
*   **Database & ORM:** [Prisma ORM (v7.8)](https://www.prisma.io/) connected to [Supabase PostgreSQL](https://supabase.com/).
*   **AI Engine (Multi-Model Hierarchy):** [Google Gemini](https://deepmind.google/technologies/gemini/) using `gemini-3.7-flash` as primary reasoning model with `gemini-3.5-flash-lite` high-availability backup (via Vercel AI SDK and `@ai-sdk/google`).
*   **Realtime Communication:** [Supabase WebSockets (Realtime Channels)](https://supabase.com/docs/guides/realtime) for instant live push alerts.
*   **Geospatial Telemetry:** [Mapbox GL JS](https://www.mapbox.com/) rendering dual Heatmap and Circle cluster anomaly layers.
*   **LMS Sentinel:** Google Classroom API data structures and live OAuth 2.0 telemetry for early academic distress detection.
*   **Mobile Companion:** React Native / Expo (`mztah-mobile`) with Panic Mask, 4-7-8 Breathing Box, and Classroom Sentinel.

---

## 🌟 Key Features

### 🛡️ 1. Live Counselor Sentinel (`/dashboard`)
*   **Realtime Incident Stream:** Subscribes to Supabase replication channels (`realtime-alerts`) to push new crisis events without page reloads.
*   **The "First 5 Minutes" Counselor Card:**
    *   **Section 1: Factual Context:** Anonymized/session-bound distress transcript and clear summary of core conflicts.
    *   **Section 2: What to Say (`doSay`):** Culturally safe, de-escalating Taglish/Kapampangan opening lines with instant one-click copy.
    *   **Section 3: What to Avoid (`dontSay`):** Clear warnings against invalidating clichés and harmful conversational traps.
    *   **Incident Resolution:** One-click toggle between Open and Resolved statuses.
*   **Proactive Academic Drop Sync Trigger:** Instant one-click button in the UI to trigger `/api/classroom/sync` and preview academic distress ingestion in real time.

### 📚 2. Google Classroom Academic Monitoring Engine (`/api/classroom/sync`)
*   **Drop Detection:** Flags consecutive failing scores (< 50% / < 25 out of 50 pts) across multiple assignments.
*   **Gemini 3.7 Flash Analysis:** Evaluates submission patterns and synthesizes a non-clinical summary and gentle check-in guidance.
*   **Resilient Fallback & Safety:** Automatic `schoolId` resolution, deterministic fallback analysis, and isolated error boundaries preventing 500 errors.
*   **Auto Alert Creation:** Inserts `ACADEMIC_DISTRESS` alerts tagged with the student and course details into the Prisma database.
*   **Mobile Proactive Outreach Sync:** Powers the mobile app's spring slide-down **Proactive Notification Banner** (`src/components/ProactiveNotificationBanner.js`) with tailored check-in prompts.

### 🧠 3. Multi-Model AI Engine Architecture (`lib/gemini.ts`)
*   **Primary (`gemini-3.7-flash`):** High-speed reasoning for chat triage, non-clinical counselor suggestions, and telemetry synthesis.
*   **Failover 1 (`gemini-3.5-flash-lite`):** High-availability lightweight backup model.
*   **Failover 2 (`gemini-2.0-flash`):** High-speed next-generation fallback.
*   **Failover 3 (`gemini-1.5-flash`):** Reliable baseline fallback.

### 📱 4. Mobile Companion Synchronization (`mztah-mobile`)
*   **Shared Supabase & API Stack:** Synchronized schema and database models between web counselor dashboard and mobile companion.
*   **Zero-Latency Crisis Interceptor:** Real-time multi-lingual keyword interception on mobile dispatches non-blocking alerts to `POST /api/alerts`.
*   **Discreet Panic Mask & Grounding:** Provides mobile privacy disguised as a scientific calculator, alongside an interactive 4-7-8 de-escalation breathing circle.

### 🗺️ 5. Pampanga Municipal Anomaly Heatmap (`/map`)
*   **Geospatial Risk Layer:** Mapbox GL heatmap centered on Pampanga (`[120.68, 15.03]`, Zoom `10.5`).
*   **Dynamic Clustering:** Point circles with real-time alert counters for City of San Fernando institutions (Pampanga High School, University of the Assumption, St. Scholastica's Academy, Our Lady of Fatima University, City College of San Fernando, and other public & private schools).
*   **Layer Controls:** Switch seamlessly between Heatmap, Circle points, or unified views.

---

## ⚙️ Environment Configuration

Create a `.env` and `.env.local` file in the `mztah-web` root directory (refer to `.env.example`):

```bash
# Copy .env.example to .env.local and fill in credentials from each provider.
# Keep .env.local private; never commit or share its values.
```

---

## 🛠️ Step-by-Step Installation & Prisma Setup

### Prerequisites
* **Node.js**: `v18.0.0` or higher (`v20+` recommended)
* **npm** or **yarn**
* Accessible **Supabase PostgreSQL** project

### Step 1: Install Dependencies
```bash
cd mztah-web
npm install --legacy-peer-deps
```

### Step 2: Initialize Database Schema & Tables
AgapAI includes an automated PostgreSQL setup script that creates the `School`, `ClassroomCourse`, `ClassroomSubmission`, and `Alert` tables, and enables Supabase Realtime publication on the `Alert` table:
```bash
node scripts/init-db.js
```

### Step 3: Generate Prisma Client Types
```bash
npx prisma generate
```

### Step 4: Populate High-Density Seed Data
Seed the database with the 15 City of San Fernando academic institutions (e.g., Pampanga High School, University of the Assumption, St. Scholastica's Academy, etc.), Google Classroom courses and assignments with drop trends, and mock crisis alerts:
```bash
npx tsx prisma/seed.ts
```

### Step 5: (Optional) Inspect Database with Prisma Studio
```bash
npx prisma studio
```
Navigate to [http://localhost:5555](http://localhost:5555) to view records in `School`, `ClassroomCourse`, `ClassroomSubmission`, and `Alert`.

---

## 🚀 Running the Web Application

### Development Server (with Turbopack)
```bash
npm run dev
```
* **Counselor Live Sentinel Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Municipal Telemetry Map:** [http://localhost:3000/map](http://localhost:3000/map)
* **API Health Check:** [http://localhost:3000/api/schools](http://localhost:3000/api/schools)

### Production Build & Launch
```bash
npm run build
npm run start
```

---

## 🧪 Testing & Verification Guide

### 1. Test Counselor Dashboard & Real-time Stream
1. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.
2. Verify the high-density crisis stream loads with alerts categorized by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
3. Click any alert to inspect the **First 5 Minutes** card:
   - Verify **Section 1: Factual Context** displays non-clinical summary and student transcript.
   - Verify **Section 2: What to Say (`doSay`)** renders copyable de-escalating Taglish/Kapampangan phrases.
   - Verify **Section 3: What to Avoid (`dontSay`)** flags harmful conversational traps.
4. Click **"Resolve Incident"** to verify state toggle.

### 2. Test Google Classroom Sentinel Sync (`POST /api/classroom/sync`)
Send a test sync request via PowerShell or curl:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/classroom/sync" -Method POST -ContentType "application/json" -Body '{"studentId":"demo-student-juan","courseName":"General Mathematics"}'
```
**Expected Response (Gemini 3.7 Flash):**
```json
{
  "triggerAlert": true,
  "subject": "General Mathematics",
  "trendSummary": "Significant score decline following Quiz 1 (76%), with two consecutive failing marks: Seatwork 4 at 38% and Midterm Examination at 28%.",
  "proactivePrompt": "Hi! Kamusta ang araw mo? Napansin ko lang na medyo naging challenging ang recent topics natin sa Gen Math lately. Just wanted to check in and see how you're feeling with your overall school workload...",
  "severity": "HIGH",
  "counselorNotes": "Student experienced two consecutive scores below 50%, including a major midterm exam. Recommend initiating a warm, supportive dialogue focusing on academic workload, pacing, and coordinating tutoring or review resources.",
  "alert": { "id": "...", "status": "OPEN" }
}
```

### 3. Test Multi-Lingual Chat API (`POST /api/chat`)
Test conversational triage powered by Gemini 3.7 Flash:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method POST -ContentType "application/json" -Body '{"message":"Medyo nahihirapan po ako sa math exam namin kahapon"}'
```
**Expected Response:**
```json
{
  "reply": "Naku, valid naman maramdaman 'yan! Talagang nakaka-drain minsan ang math, lalo na kapag mahirap ang exam. Kumusta naman ang pakiramdam mo ngayon? Tapos na 'yun, kaya huminga ka muna nang malalim...",
  "urgency": "LOW",
  "category": "Academic",
  "counselorSummary": "Student shared mild stress and concern over finding their recent math exam challenging.",
  "doSay": ["Kumusta ang pakiramdam mo matapos ang exam?", "Natural lang na mahirapan minsan sa math..."],
  "dontSay": ["Madali lang naman 'yun kung nag-review ka nang maayos.", "Bakit ka nahirapan? Math lang 'yan."]
}
```

### 4. Test Mobile Crisis Alert Ingestion (`POST /api/alerts`)
Test the zero-latency endpoint called by `mztah-mobile`:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts" -Method POST -ContentType "application/json" -Body '{"flaggedText":"ayaw ko na mabuhay","classification":"SUICIDE_RISK","severity":"CRITICAL","isAnonymous":true}'
```
Verify that the incident renders with a red blinking critical badge in the Counselor Dashboard via Supabase Realtime without page refresh.

### 5. Test Geospatial Anomaly GeoJSON (`GET /api/schools/anomalies`)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/schools/anomalies" -Method GET
```
Verify the returned GeoJSON `FeatureCollection` contains school coordinates, weighted severity scores, and alert tallies.

---

## 🔑 Google Classroom API Setup Guide

To connect live production Google Classroom accounts to AgapAI's Academic Sentinel Engine:

### Step 1: Create a Google Cloud Project & Enable APIs
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `AgapAI-Sentinel` (or select an existing project).
3. Go to **APIs & Services** > **Library**.
4. Search for **Google Classroom API** and click **Enable**.

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (or **Internal** if using a Google Workspace for Education domain).
3. Fill in the App Name (`AgapAI Sentinel`) and Developer Contact emails.
4. Add the following required Classroom API scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.students.readonly`
   - `https://www.googleapis.com/auth/classroom.student-submissions.students.readonly`

### Step 3: Create OAuth 2.0 Credentials / Service Account
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID** (select *Web application*).
3. Set Authorized Redirect URIs to: `http://localhost:3000/api/auth/callback/google` (and your production domain).
4. Save your `Client ID` and `Client Secret` to your `.env` and `.env.local` files.

---

## 📜 Compliance & Ethics

* **Republic Act 12080** — Basic Education Mental Health and Well-Being Promotion Act (Philippines).
* **Data Privacy Act of 2012 (RA 10173)** — Zero PII retention on anonymous triage channels.
* **Strictly Non-Clinical Protocol** — Non-diagnostic supportive triage, de-escalation, and human counselor escalation.
