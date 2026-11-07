import "dotenv/config";
import { defineConfig } from "prisma/config";

// Route Prisma CLI metadata commands through DIRECT_URL to bypass PgBouncer.
const dbUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(dbUrl ? { datasource: { url: dbUrl } } : {}),
});
