import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("creato_session")?.value;

  let session: { uid: string; email: string; role: "CREATOR" | "BRAND" | "ADMIN" } | null = null;

  if (sessionCookie) {
    try {
      const parts = sessionCookie.split(".");
      if (parts.length === 3) {
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(payloadBase64));
        session = payload;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  const isCreatorRoute = path.startsWith("/creator");
  const isBrandRoute = path.startsWith("/brand");

  const isAuthPage = path.endsWith("/login") || path.endsWith("/signup");

  if (isCreatorRoute) {
    if (isAuthPage) {
      if (session && session.role === "CREATOR") {
        return NextResponse.redirect(new URL("/creator/dashboard", request.url));
      }
    } else {
      if (!session || session.role !== "CREATOR") {
        // Clear session if it exists but role is wrong
        const response = NextResponse.redirect(new URL("/creator/login", request.url));
        if (session) response.cookies.delete("creato_session");
        return response;
      }
    }
  }

  if (isBrandRoute) {
    if (isAuthPage) {
      if (session && session.role === "BRAND") {
        return NextResponse.redirect(new URL("/brand/dashboard", request.url));
      }
    } else {
      if (!session || session.role !== "BRAND") {
        const response = NextResponse.redirect(new URL("/brand/login", request.url));
        if (session) response.cookies.delete("creato_session");
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/creator/:path*",
    "/brand/:path*",
  ],
};
