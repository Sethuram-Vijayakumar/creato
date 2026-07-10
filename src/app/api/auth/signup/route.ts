import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (role !== "CREATOR" && role !== "BRAND") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const db = await readDb();

    // Check if email already exists
    const emailExists = Object.values(db.users).some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const uid = role.toLowerCase() + "_" + Math.random().toString(36).substring(2, 9);
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    db.users[uid] = {
      uid,
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: now
    };

    await writeDb(db);

    const token = signToken({ uid, email: email.toLowerCase(), role });

    const response = NextResponse.json({ success: true, user: { uid, email, role } });
    response.cookies.set("creato_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (e) {
    console.error("Signup error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
