import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:%40Supabasepass10@db.xrfxbrloococyyjevkkh.supabase.co:5432/postgres";

async function secure() {
  console.log("Connecting to Supabase to enable RLS...");
  const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
  
  try {
    // Enable Row Level Security (RLS) on the table
    await sql`ALTER TABLE creato_db ENABLE ROW LEVEL SECURITY;`;
    console.log("Row Level Security (RLS) has been successfully ENABLED on creato_db.");
    console.log("This blocks all unauthorized access to this table via the public REST API.");
  } catch (e) {
    console.error("Failed to enable RLS:", e);
  } finally {
    await sql.end();
  }
}

secure();
