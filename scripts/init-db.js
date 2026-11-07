const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function init() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL in .env.local");
  }

  console.log("Connecting to database...");
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Creating School, ClassroomCourse, ClassroomSubmission, and Alert tables...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS "School" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "division" TEXT NOT NULL DEFAULT 'Pampanga',
      "latitude" DOUBLE PRECISION NOT NULL,
      "longitude" DOUBLE PRECISION NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ClassroomCourse" (
      "id" TEXT PRIMARY KEY,
      "courseId" TEXT UNIQUE NOT NULL,
      "name" TEXT NOT NULL,
      "section" TEXT NOT NULL DEFAULT 'Grade 11 - STEM A',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ClassroomSubmission" (
      "id" TEXT PRIMARY KEY,
      "courseId" TEXT NOT NULL REFERENCES "ClassroomCourse"("id") ON DELETE CASCADE,
      "studentId" TEXT NOT NULL DEFAULT 'demo-student-juan',
      "title" TEXT NOT NULL,
      "assignedDate" TIMESTAMP(3) NOT NULL,
      "dueDate" TIMESTAMP(3) NOT NULL,
      "grade" DOUBLE PRECISION NOT NULL,
      "maxPoints" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Alert" (
      "id" TEXT PRIMARY KEY,
      "schoolId" TEXT NOT NULL REFERENCES "School"("id") ON DELETE CASCADE,
      "sessionId" TEXT NOT NULL,
      "severity" TEXT NOT NULL,
      "classification" TEXT NOT NULL,
      "flaggedText" TEXT NOT NULL,
      "counselorSummary" TEXT,
      "doSay" TEXT[] NOT NULL DEFAULT '{}',
      "dontSay" TEXT[] NOT NULL DEFAULT '{}',
      "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
      "status" TEXT NOT NULL DEFAULT 'OPEN',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await client.query(`ALTER TABLE "Alert" REPLICA IDENTITY FULL;`);
    await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE "Alert";`);
  } catch (e) {
    console.log("Realtime publication notice:", e.message);
  }

  console.log("All tables created successfully!");
  await client.end();
}

init().catch(err => {
  console.error("Init failed:", err);
  process.exit(1);
});
