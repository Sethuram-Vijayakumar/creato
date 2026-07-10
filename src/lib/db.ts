import fs from "fs";
import path from "path";
import postgres from "postgres";

const DB_PATH = path.join(process.cwd(), "db.json");

export interface DatabaseSchema {
  users: Record<string, {
    uid: string;
    email: string;
    passwordHash: string;
    role: "CREATOR" | "BRAND" | "ADMIN";
    createdAt: string;
  }>;
  creatorProfiles: Record<string, {
    uid: string;
    displayName: string;
    handle: string;
    city: string;
    state: string;
    primaryLanguage: string;
    secondaryLanguages: string[];
    niche: string;
    followerCount: number;
    profileImageUrl: string;
    bio: string;
    createdAt: string;
  }>;
  brandProfiles: Record<string, {
    uid: string;
    companyName: string;
    industry: string;
    logoUrl: string;
    city: string;
    description: string;
    createdAt: string;
  }>;
  atiScores: Record<string, {
    creatorUid: string;
    overallScore: number;
    engagementAuthenticity: number;
    vernacularDepth: number;
    communityDepth: number;
    localRelevance: number;
    lastUpdated: string;
  }>;
  deals: Record<string, {
    id: string;
    creatorUid: string;
    brandUid: string;
    deliverableType: string;
    amount: number;
    brief: string;
    status: "OFFER_SENT" | "COUNTERED" | "ACCEPTED" | "IN_PRODUCTION" | "DELIVERED" | "DECLINED";
    createdAt: string;
    updatedAt: string;
  }>;
  dealMessages: Record<string, Array<{
    id: string;
    senderUid: string;
    message: string;
    proposedAmount: number | null;
    createdAt: string;
  }>>;
  pastCollaborations: Record<string, {
    id: string;
    creatorUid: string;
    brandName: string;
    outcome: string;
    date: string;
  }>;
  mockEngagementData: Record<string, {
    creatorUid: string;
    engagementRate: number;
    growthAnomaly: boolean;
    commentLanguageMatchRatio: number;
    repeatCommenterRatio: number;
    stateAudienceRatio: number;
    followerGrowthHistory: Array<{ month: string; followers: number }>;
  }>;
}

// Create Supabase Postgres client if connection string is configured
const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, { ssl: { rejectUnauthorized: false } })
  : null;

let isInitialized = false;

async function ensureTable() {
  if (!sql || isInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS creato_db (
        id INT PRIMARY KEY,
        data JSONB
      )
    `;
    const rows = await sql`SELECT id FROM creato_db WHERE id = 1`;
    if (rows.length === 0) {
      const initialSchema = {
        users: {},
        creatorProfiles: {},
        brandProfiles: {},
        atiScores: {},
        deals: {},
        dealMessages: {},
        pastCollaborations: {},
        mockEngagementData: {}
      };
      await sql`
        INSERT INTO creato_db (id, data)
        VALUES (1, ${JSON.stringify(initialSchema)})
      `;
    }
    isInitialized = true;
    console.log("Supabase table verified and active.");
  } catch (e) {
    console.error("Supabase table initialization failed:", e);
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  if (sql) {
    await ensureTable();
    try {
      const rows = await sql`SELECT data FROM creato_db WHERE id = 1`;
      if (rows.length > 0) {
        const data = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
        return {
          users: data.users || {},
          creatorProfiles: data.creatorProfiles || {},
          brandProfiles: data.brandProfiles || {},
          atiScores: data.atiScores || {},
          deals: data.deals || {},
          dealMessages: data.dealMessages || {},
          pastCollaborations: data.pastCollaborations || {},
          mockEngagementData: data.mockEngagementData || {}
        };
      }
    } catch (e) {
      console.error("Failed to query data from Supabase:", e);
    }
  }

  // Fallback to local db.json
  if (!fs.existsSync(DB_PATH)) {
    const emptyDb: DatabaseSchema = {
      users: {},
      creatorProfiles: {},
      brandProfiles: {},
      atiScores: {},
      deals: {},
      dealMessages: {},
      pastCollaborations: {},
      mockEngagementData: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyDb, null, 2), "utf8");
    return emptyDb;
  }
  try {
    const content = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading local db.json, resetting...", e);
    const emptyDb: DatabaseSchema = {
      users: {},
      creatorProfiles: {},
      brandProfiles: {},
      atiScores: {},
      deals: {},
      dealMessages: {},
      pastCollaborations: {},
      mockEngagementData: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyDb, null, 2), "utf8");
    return emptyDb;
  }
}

export async function writeDb(db: DatabaseSchema): Promise<void> {
  if (sql) {
    await ensureTable();
    try {
      await sql`
        UPDATE creato_db
        SET data = ${JSON.stringify(db)}
        WHERE id = 1
      `;
      return;
    } catch (e) {
      console.error("Failed to update data in Supabase:", e);
    }
  }

  // Fallback to local db.json
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
