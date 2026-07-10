import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "BRAND") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await readDb();
    const profile = db.brandProfiles[session.uid] || null;

    return NextResponse.json({ profile });
  } catch (e) {
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

    const data = await req.json();
    const db = await readDb();

    const now = new Date().toISOString();
    const profile = {
      uid: session.uid,
      companyName: data.companyName,
      industry: data.industry,
      logoUrl: data.logoUrl || "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=100&h=100&fit=crop",
      city: data.city,
      description: data.description || "",
      createdAt: now
    };

    db.brandProfiles[session.uid] = profile;
    await writeDb(db);

    return NextResponse.json({ success: true, profile });
  } catch (e) {
    console.error("Brand profile update error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
