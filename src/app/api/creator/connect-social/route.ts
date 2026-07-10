import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { calculateATI } from "@/lib/ati";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { provider } = await req.json();
    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    const db = await readDb();
    const profile = db.creatorProfiles[session.uid];
    if (!profile) {
      return NextResponse.json({ error: "Profile not found. Complete basic onboarding first." }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (provider === "instagram") {
      profile.followerCount = 22000;
      profile.primaryLanguage = "Tamil";
      profile.state = "Tamil Nadu";
      profile.city = "Chennai";
      profile.niche = "Food";
      profile.secondaryLanguages = ["English", "Hindi"];
      profile.bio = "Passionate home chef showcasing traditional Tamil unboxing and recipes.";
      profile.profileImageUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop";

      db.mockEngagementData[session.uid] = {
        creatorUid: session.uid,
        engagementRate: 0.082, // 8.2%
        growthAnomaly: false,
        commentLanguageMatchRatio: 0.85,
        repeatCommenterRatio: 0.45,
        stateAudienceRatio: 0.78,
        followerGrowthHistory: [
          { month: "Jan", followers: 18000 },
          { month: "Feb", followers: 19500 },
          { month: "Mar", followers: 20500 },
          { month: "Apr", followers: 21200 },
          { month: "May", followers: 22000 }
        ]
      };
    } else if (provider === "youtube") {
      profile.followerCount = 55000;
      profile.primaryLanguage = "Telugu";
      profile.state = "Andhra Pradesh";
      profile.city = "Hyderabad";
      profile.niche = "Comedy";
      profile.secondaryLanguages = ["English"];
      profile.bio = "Daily Telugu comedy sketches and relatable middle-class family humor.";
      profile.profileImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop";

      db.mockEngagementData[session.uid] = {
        creatorUid: session.uid,
        engagementRate: 0.065, // 6.5%
        growthAnomaly: false,
        commentLanguageMatchRatio: 0.82,
        repeatCommenterRatio: 0.38,
        stateAudienceRatio: 0.72,
        followerGrowthHistory: [
          { month: "Jan", followers: 45000 },
          { month: "Feb", followers: 48000 },
          { month: "Mar", followers: 51000 },
          { month: "Apr", followers: 53500 },
          { month: "May", followers: 55000 }
        ]
      };
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    // Recalculate ATI score
    const atiScore = calculateATI(profile, db.mockEngagementData[session.uid]);
    db.atiScores[session.uid] = {
      creatorUid: session.uid,
      ...atiScore,
      lastUpdated: now
    };

    db.creatorProfiles[session.uid] = profile;
    await writeDb(db);

    return NextResponse.json({ success: true, profile, atiScore });
  } catch (e) {
    console.error("Connect Social Error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
