import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { suggestedRateRange } from "@/lib/ati";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ handle: string }> }
) {
  try {
    const params = await props.params;
    const handle = params.handle.toLowerCase();
    const db = await readDb();

    const profile = Object.values(db.creatorProfiles).find(
      (p) => p.handle.toLowerCase() === handle
    );
    if (!profile) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const uid = profile.uid;
    const atiScore = db.atiScores[uid] || null;
    const mockData = db.mockEngagementData[uid] || null;

    // Filter past collaborations
    const collabs = Object.values(db.pastCollaborations).filter(
      (c) => c.creatorUid === uid
    );

    const rateRange = atiScore
      ? suggestedRateRange(atiScore.overallScore, profile.followerCount)
      : null;

    return NextResponse.json({
      profile,
      atiScore,
      mockData,
      collabs,
      rateRange
    });
  } catch (e) {
    console.error("Get public profile error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
