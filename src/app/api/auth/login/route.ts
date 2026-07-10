import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await readDb();

    // Find user by email
    const user = Object.values(db.users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const token = signToken({ uid: user.uid, email: user.email, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: { uid: user.uid, email: user.email, role: user.role }
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
    console.error("Login error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
