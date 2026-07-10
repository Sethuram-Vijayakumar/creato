import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { suggestedRateRange } from "@/lib/ati";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await readDb();
    const deal = db.deals[id];
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (deal.creatorUid !== session.uid && deal.brandUid !== session.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const creator = db.creatorProfiles[deal.creatorUid] || null;
    const brand = db.brandProfiles[deal.brandUid] || null;
    const atiScore = db.atiScores[deal.creatorUid] || null;

    const rateRange = atiScore
      ? suggestedRateRange(atiScore.overallScore, creator?.followerCount || 5000)
      : null;

    return NextResponse.json({
      deal,
      creator,
      brand,
      atiScore,
      rateRange,
      currentUserRole: session.role,
      currentUserId: session.uid
    });
  } catch (e) {
    console.error("Get deal details error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, message, counterAmount } = await req.json();

    const db = await readDb();
    const deal = db.deals[id];
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (deal.creatorUid !== session.uid && deal.brandUid !== session.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date().toISOString();
    let newStatus = deal.status;
    let systemMessage = "";
    let proposedAmt: number | null = null;

    const senderName =
      session.role === "CREATOR"
        ? (db.creatorProfiles[session.uid]?.displayName || "Creator")
        : (db.brandProfiles[session.uid]?.companyName || "Brand");

    if (action === "ACCEPT") {
      newStatus = "ACCEPTED";
      systemMessage = `${senderName} accepted the offer of ₹${deal.amount.toLocaleString()}.`;
    } else if (action === "DECLINE") {
      newStatus = "DECLINED";
      systemMessage = `${senderName} declined the offer.`;
    } else if (action === "COUNTER") {
      if (!counterAmount || isNaN(parseFloat(counterAmount))) {
        return NextResponse.json({ error: "Invalid counter amount" }, { status: 400 });
      }
      newStatus = "COUNTERED";
      deal.amount = parseFloat(counterAmount);
      proposedAmt = parseFloat(counterAmount);
      systemMessage = `${senderName} proposed a counter-offer of ₹${deal.amount.toLocaleString()}.${
        message ? ` Note: ${message}` : ""
      }`;
    } else if (action === "IN_PRODUCTION") {
      newStatus = "IN_PRODUCTION";
      systemMessage = `Deal progressed to In Production.`;
    } else if (action === "DELIVER") {
      newStatus = "DELIVERED";
      systemMessage = `${senderName} marked deliverables as Delivered.`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    deal.status = newStatus;
    deal.updatedAt = now;

    if (!db.dealMessages[id]) {
      db.dealMessages[id] = [];
    }

    db.dealMessages[id].push({
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderUid: session.uid,
      message: systemMessage,
      proposedAmount: proposedAmt,
      createdAt: now
    });

    await writeDb(db);

    return NextResponse.json({ success: true, deal });
  } catch (e) {
    console.error("Update deal status error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
