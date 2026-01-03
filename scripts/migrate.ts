import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL!);

  // Migration files to run in order
  const migrationFiles = ["db/out/0001_productive_night_thrasher.sql"];

  // First, ensure the table exists (create if it doesn't)
  console.log("\n🔍 Checking if chat_messages table exists...");
  try {
    const checkTable = await sql.unsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_messages'
      );
    `);

    if (!checkTable[0]?.exists) {
      console.log("⚠️  Table doesn't exist. Creating it now...");
      await sql.unsafe(`
        CREATE TABLE "chat_messages" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "userId" text NOT NULL,
          "role" varchar(20) NOT NULL,
          "content" text NOT NULL,
          "documentId" uuid,
          "created_at" timestamp with time zone DEFAULT now(),
          "updated_at" timestamp with time zone DEFAULT now()
        );
      `);

      await sql.unsafe(
        `CREATE INDEX "chat_user_idx" ON "chat_messages" USING btree ("userId");`
      );
      await sql.unsafe(
        `CREATE INDEX "chat_document_idx" ON "chat_messages" USING btree ("documentId");`
      );
      await sql.unsafe(
        `CREATE INDEX "chat_created_idx" ON "chat_messages" USING btree ("created_at");`
      );

      console.log("✅ Table created successfully!");
    } else {
      console.log("✅ Table already exists!");
    }
  } catch (error: any) {
    console.error("Error checking/creating table:", error.message);
  }

  for (const migrationFile of migrationFiles) {
    const filePath = join(process.cwd(), migrationFile);

    if (!existsSync(filePath)) {
      console.log(`⏭️  Skipping ${migrationFile} (file not found)`);
      continue;
    }

    try {
      console.log(`\n📄 Running migration: ${migrationFile}`);
      const migrationSQL = readFileSync(filePath, "utf-8");

      // Split by statement breakpoint and execute each statement
      const statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      console.log(`   Executing ${statements.length} statement(s)...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            // Use tagged template literal syntax for Neon serverless
            await sql.unsafe(statement);
            console.log(
              `   ✅ Statement ${i + 1}/${statements.length} executed`
            );
          } catch (error: any) {
            // Check if it's a "already exists" error (table/index already created)
            if (
              error?.message?.includes("already exists") ||
              error?.code === "42P07" ||
              error?.code === "42710"
            ) {
              console.log(
                `   ⚠️  Statement ${i + 1}/${
                  statements.length
                } skipped (already exists)`
              );
            } else {
              throw error;
            }
          }
        }
      }

      console.log(`✅ Migration ${migrationFile} completed!`);
    } catch (error: any) {
      console.error(`❌ Migration ${migrationFile} failed:`, error.message);
      // Continue with other migrations even if one fails
    }
  }

  console.log("\n🎉 All migrations completed!");
}

runMigrations();
