import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
    GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
    GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
    QDRANT_DB_API_KEY: z.string().min(1, "QDRANT_DB_API_KEY is required"),
    QDRANT_URL: z.string().min(1, "QDRANT_URL is required"),
    INNGEST_SIGNING_KEY: z.string().min(1, "INNGEST_SIGNING_KEY is required"),
    BLOB_READ_WRITE_TOKEN: z
      .string()
      .min(1, "BLOB_READ_WRITE_TOKEN is required"),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    QDRANT_DB_API_KEY: process.env.QDRANT_DB_API_KEY,
    QDRANT_URL: process.env.QDRANT_URL,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
  onValidationError: (issues) => {
    console.error("❌ Invalid environment variables:", issues);
    throw new Error("Invalid environment variables");
  },
});
