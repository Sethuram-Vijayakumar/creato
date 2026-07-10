import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { suggestedRateRange } from "@/lib/ati";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const db = await readDb();

    // Map creator profiles with their ATI scores and pricing ranges
    let creators = Object.values(db.creatorProfiles).map((profile) => {
      const score = db.atiScores[profile.uid] || {
        overallScore: 0,
        engagementAuthenticity: 0,
        vernacularDepth: 0,
        communityDepth: 0,
        localRelevance: 0
      };
      
      const rateRange = suggestedRateRange(score.overallScore, profile.followerCount);

      return {
        ...profile,
        atiScore: score,
        suggestedRate: rateRange.suggested,
        rateRange
      };
    });

    // Extract filters
    const query = searchParams.get("query")?.toLowerCase();
    const languages = searchParams.getAll("language");
    const states = searchParams.getAll("state");
    const niches = searchParams.getAll("niche");
    const minATI = parseInt(searchParams.get("minATI") || "0");
    const minFollowers = parseInt(searchParams.get("minFollowers") || "0");
    const maxFollowers = parseInt(searchParams.get("maxFollowers") || "1000000");
    const minBudget = parseInt(searchParams.get("minBudget") || "0");
    const maxBudget = parseInt(searchParams.get("maxBudget") || "1000000");

    if (query) {
      creators = creators.filter(
        (c) =>
          c.displayName.toLowerCase().includes(query) ||
          c.handle.toLowerCase().includes(query) ||
          c.bio.toLowerCase().includes(query)
      );
    }

    if (languages.length > 0) {
      creators = creators.filter((c) =>
        languages.some((l) => c.primaryLanguage === l || c.secondaryLanguages.includes(l))
      );
    }

    if (states.length > 0) {
      creators = creators.filter((c) => states.some((s) => c.state === s));
    }

    if (niches.length > 0) {
      creators = creators.filter((c) => niches.some((n) => c.niche === n));
    }

    if (minATI > 0) {
      creators = creators.filter((c) => c.atiScore.overallScore >= minATI);
    }

    creators = creators.filter(
      (c) => c.followerCount >= minFollowers && c.followerCount <= maxFollowers
    );

    creators = creators.filter(
      (c) => c.suggestedRate >= minBudget && c.suggestedRate <= maxBudget
    );

    return NextResponse.json({ creators });
  } catch (e) {
    console.error("Fetch creators error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
