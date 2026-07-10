import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { calculateATI } from "@/lib/ati";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await readDb();
    const profile = db.creatorProfiles[session.uid] || null;
    const atiScore = db.atiScores[session.uid] || null;

    return NextResponse.json({ profile, atiScore });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const db = await readDb();

    // Check if handle is taken by another creator
    const handleExists = Object.values(db.creatorProfiles).some(
      (p) => p.handle.toLowerCase() === data.handle.toLowerCase() && p.uid !== session.uid
    );
    if (handleExists) {
      return NextResponse.json({ error: "Handle is already taken" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const profile = {
      uid: session.uid,
      displayName: data.displayName,
      handle: data.handle.toLowerCase(),
      city: data.city,
      state: data.state,
      primaryLanguage: data.primaryLanguage,
      secondaryLanguages: data.secondaryLanguages || [],
      niche: data.niche,
      followerCount: parseInt(data.followerCount) || 5000,
      profileImageUrl: data.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      bio: data.bio || "",
      createdAt: now
    };

    db.creatorProfiles[session.uid] = profile;

    // Auto-generate mock engagement data for onboarding (if not exists)
    let mockData = db.mockEngagementData[session.uid];
    if (!mockData) {
      const randRate = 0.04 + Math.random() * 0.07; // 4% to 11%
      const hasAnomaly = Math.random() > 0.85; // 15% chance of anomaly
      const langMatch = 0.65 + Math.random() * 0.3; // 65% to 95%
      const repeatRatio = 0.25 + Math.random() * 0.3; // 25% to 55%
      const stateRatio = 0.5 + Math.random() * 0.45; // 50% to 95%

      mockData = {
        creatorUid: session.uid,
        engagementRate: randRate,
        growthAnomaly: hasAnomaly,
        commentLanguageMatchRatio: langMatch,
        repeatCommenterRatio: repeatRatio,
        stateAudienceRatio: stateRatio,
        followerGrowthHistory: [
          { month: "Jan", followers: Math.round(profile.followerCount * 0.85) },
          { month: "Feb", followers: Math.round(profile.followerCount * 0.90) },
          { month: "Mar", followers: Math.round(profile.followerCount * 0.93) },
          { month: "Apr", followers: Math.round(profile.followerCount * 0.97) },
          { month: "May", followers: profile.followerCount }
        ]
      };
      db.mockEngagementData[session.uid] = mockData;
    } else {
      if (mockData.followerGrowthHistory && mockData.followerGrowthHistory.length > 4) {
        mockData.followerGrowthHistory[4].followers = profile.followerCount;
      }
    }

    // Calculate dynamic ATI score
    const atiScore = calculateATI(profile, mockData);
    db.atiScores[session.uid] = {
      creatorUid: session.uid,
      ...atiScore,
      lastUpdated: now
    };

    await writeDb(db);

    return NextResponse.json({ success: true, profile, atiScore });
  } catch (e) {
    console.error("Profile update error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
