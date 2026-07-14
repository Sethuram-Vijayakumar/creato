import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const db = await readDb();
    const briefs = Object.values(db.brandBriefs || {}).filter(
      (b) => b.status === "OPEN"
    );

    // Enrich briefs with brand profile info
    const enrichedBriefs = briefs.map((b) => {
      const brandProfile = db.brandProfiles[b.brandUid] || null;
      return {
        ...b,
        brand: brandProfile
      };
    });

    // Sort by createdAt descending
    enrichedBriefs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ briefs: enrichedBriefs });
  } catch (e) {
    console.error("Fetch briefs error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "BRAND") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      title,
      description,
      niche,
      targetLanguages,
      targetStates,
      budgetMin,
      budgetMax,
      deliverableType
    } = await req.json();

    if (!title || !description || !niche || !budgetMin || !budgetMax || !deliverableType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await readDb();
    const briefId = "brief_" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const newBrief = {
      id: briefId,
      brandUid: session.uid,
      title,
      description,
      niche,
      targetLanguages: Array.isArray(targetLanguages) ? targetLanguages : [],
      targetStates: Array.isArray(targetStates) ? targetStates : [],
      budgetMin: parseFloat(budgetMin),
      budgetMax: parseFloat(budgetMax),
      deliverableType,
      status: "OPEN" as const,
      createdAt: now
    };

    if (!db.brandBriefs) {
      db.brandBriefs = {};
    }
    db.brandBriefs[briefId] = newBrief;

    await writeDb(db);

    return NextResponse.json({ success: true, brief: newBrief });
  } catch (e) {
    console.error("Create brief error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
