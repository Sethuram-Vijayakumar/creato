import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, provider, displayName, handle } = await req.json();

    if (!email || !provider) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await readDb();

    // Check if user already exists
    let user = Object.values(db.users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    let isNew = false;
    let uid = "";

    if (!user) {
      // Create new user via SSO
      isNew = true;
      uid = "creator_" + Math.random().toString(36).substring(2, 9);
      const dummyPasswordHash = await bcrypt.hash(Math.random().toString(), 10);
      const now = new Date().toISOString();

      user = {
        uid,
        email: email.toLowerCase(),
        passwordHash: dummyPasswordHash,
        role: "CREATOR",
        createdAt: now
      };

      db.users[uid] = user;

      // Auto-create creator profile skeleton
      const display = displayName || email.split("@")[0];
      const hnd = handle || display.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(Math.random() * 1000);
      
      db.creatorProfiles[uid] = {
        uid,
        displayName: display,
        handle: hnd,
        city: "Mumbai",
        state: "Maharashtra",
        primaryLanguage: "Hindi",
        secondaryLanguages: ["English"],
        niche: "Entertainment",
        followerCount: 5000,
        profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        bio: `SSO Registered creator via ${provider}.`,
        createdAt: now
      };

      // Set default mock ATI score
      db.atiScores[uid] = {
        creatorUid: uid,
        overallScore: 50,
        engagementAuthenticity: 50,
        vernacularDepth: 50,
        communityDepth: 50,
        localRelevance: 50,
        lastUpdated: now
      };

      db.mockEngagementData[uid] = {
        creatorUid: uid,
        engagementRate: 0.05,
        growthAnomaly: false,
        commentLanguageMatchRatio: 0.50,
        repeatCommenterRatio: 0.50,
        stateAudienceRatio: 0.50,
        followerGrowthHistory: [
          { month: "Jan", followers: 4000 },
          { month: "Feb", followers: 4500 },
          { month: "Mar", followers: 5000 }
        ]
      };

      await writeDb(db);
    } else {
      uid = user.uid;
    }

    const token = signToken({ uid, email: user.email, role: user.role });

    const response = NextResponse.json({ 
      success: true, 
      user: { uid, email: user.email, role: user.role },
      isNew
    });
    
    response.cookies.set("creato_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (e) {
    console.error("SSO Login Error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
