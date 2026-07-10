import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("creato_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(sessionCookie);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await readDb();
    let deals = Object.values(db.deals);

    if (session.role === "CREATOR") {
      deals = deals.filter((d) => d.creatorUid === session.uid);
    } else if (session.role === "BRAND") {
      deals = deals.filter((d) => d.brandUid === session.uid);
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Enrich deals with other party info
    const enrichedDeals = deals.map((d) => {
      const creatorProfile = db.creatorProfiles[d.creatorUid] || null;
      const brandProfile = db.brandProfiles[d.brandUid] || null;
      return {
        ...d,
        creator: creatorProfile,
        brand: brandProfile
      };
    });

    // Sort by updated time descending
    enrichedDeals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ deals: enrichedDeals });
  } catch (e) {
    console.error("Fetch deals error", e);
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

    const { creatorUid, deliverableType, amount, brief } = await req.json();

    if (!creatorUid || !deliverableType || !amount || !brief) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await readDb();
    const creator = db.creatorProfiles[creatorUid];
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const brand = db.brandProfiles[session.uid];
    if (!brand) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    const dealId = "deal_" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const newDeal = {
      id: dealId,
      creatorUid,
      brandUid: session.uid,
      deliverableType,
      amount: parseFloat(amount),
      brief,
      status: "OFFER_SENT" as const,
      createdAt: now,
      updatedAt: now
    };

    db.deals[dealId] = newDeal;

    // Initialize messages subcollection
    db.dealMessages[dealId] = [
      {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        senderUid: session.uid,
        message: `Hello ${creator.displayName}, I would love to collaborate with you! Here is our campaign brief:\n\n${brief}`,
        proposedAmount: parseFloat(amount),
        createdAt: now
      }
    ];

    await writeDb(db);

    return NextResponse.json({ success: true, dealId, deal: newDeal });
  } catch (e) {
    console.error("Create deal error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
