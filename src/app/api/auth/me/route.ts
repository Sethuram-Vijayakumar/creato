import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const session = verifyToken(sessionCookie);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const db = await readDb();
    const user = db.users[session.uid];
    if (!user) {
      return NextResponse.json({ user: null });
    }

    let profile = null;
    if (user.role === "CREATOR") {
      profile = db.creatorProfiles[user.uid] || null;
    } else if (user.role === "BRAND") {
      profile = db.brandProfiles[user.uid] || null;
    }

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (e) {
    console.error("Get user session error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
