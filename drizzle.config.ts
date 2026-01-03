import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./app/env";

export default defineConfig({
  out: "./db/out",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
