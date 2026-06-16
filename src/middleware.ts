import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifySession(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const lastDot = cookie.lastIndexOf(".");
  if (lastDot === -1) return false;
  const name = cookie.slice(0, lastDot);
  const sig = cookie.slice(lastDot + 1);
  const secret = process.env.AUTH_SECRET ?? "fallback-secret";

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = Uint8Array.from(
    sig.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) ?? []
  );

  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(name));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  const valid = await verifySession(session);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
