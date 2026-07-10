import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

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

    const messages = db.dealMessages[id] || [];

    return NextResponse.json({ messages });
  } catch (e) {
    console.error("Fetch deal messages error", e);
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

    const { message } = await req.json();
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const db = await readDb();
    const deal = db.deals[id];
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    if (deal.creatorUid !== session.uid && deal.brandUid !== session.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date().toISOString();
    const newMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderUid: session.uid,
      message: message.trim(),
      proposedAmount: null,
      createdAt: now
    };

    if (!db.dealMessages[id]) {
      db.dealMessages[id] = [];
    }

    db.dealMessages[id].push(newMessage);
    deal.updatedAt = now;

    await writeDb(db);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (e) {
    console.error("Post deal message error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
