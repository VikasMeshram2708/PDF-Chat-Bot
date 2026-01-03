import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { chatMessageSchema } from "../db/schema";

async function verifyTable() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  try {
    // Check if table exists
    const tables = await sql.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'chat_messages';
    `);

    if (tables.length === 0) {
      console.log("❌ chat_messages table does NOT exist!");
      console.log("\nCreating table...");

      // Create the table manually
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS "chat_messages" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "userId" text NOT NULL,
          "role" varchar(20) NOT NULL,
          "content" text NOT NULL,
          "documentId" uuid,
          "created_at" timestamp with time zone DEFAULT now(),
          "updated_at" timestamp with time zone DEFAULT now()
        );
      `);

      // Create indexes
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS "chat_user_idx" ON "chat_messages" USING btree ("userId");
      `);
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS "chat_document_idx" ON "chat_messages" USING btree ("documentId");
      `);
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS "chat_created_idx" ON "chat_messages" USING btree ("created_at");
      `);

      console.log("✅ Table created!");
    } else {
      console.log("✅ chat_messages table exists!");
    }

    // Test insert
    console.log("\nTesting insert...");
    const testResult = await db
      .insert(chatMessageSchema)
      .values({
        userId: "test_user",
        role: "user",
        content: "Test message",
      })
      .returning();

    console.log("✅ Test insert successful!", testResult[0].id);

    // Clean up test record
    await sql.unsafe(
      `DELETE FROM "chat_messages" WHERE "userId" = 'test_user'`
    );
    console.log("✅ Test record cleaned up");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }
}

verifyTable();
