import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` only needs the schema; credentials are required
// for commands that talk to the database (migrate, push, studio).
const connectionString = process.env.DATABASE_URL;

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  ...(connectionString ? { dbCredentials: { url: connectionString } } : {}),
});
