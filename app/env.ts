import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
    QUADRANT_API_KEY: z.string().min(1, "QUADRANT_API_KEY is required"),
    QUADRANT_URL: z.string().min(1, "QUADRANT_API_KEY is required"),
    GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    QUADRANT_API_KEY: process.env.QUADRANT_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    QUADRANT_URL: process.env.QUADRANT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  onValidationError: (issues) => {
    console.error("❌ Invalid environment variables:", issues);
    throw new Error("Invalid environment variables");
  },
});
