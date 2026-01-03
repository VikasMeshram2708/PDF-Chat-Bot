import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function checkDatabase() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Check if chat_messages table exists
    const result = await sql.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'chat_messages';
    `);

    console.log("Tables in database:");
    const allTables = await sql.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(allTables);

    if (result.length > 0) {
      console.log("\n✅ chat_messages table exists!");

      // Check table structure
      const columns = await sql.unsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'chat_messages'
        ORDER BY ordinal_position;
      `);

      console.log("\nTable structure:");
      console.log(columns);
    } else {
      console.log("\n❌ chat_messages table does NOT exist!");
      console.log(
        "\nAvailable tables:",
        allTables.map((t: any) => t.table_name)
      );
    }
  } catch (error: any) {
    console.error("Error checking database:", error.message);
  }
}

checkDatabase();
