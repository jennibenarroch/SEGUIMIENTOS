import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac } from "crypto";

function verifySession(cookie: string | undefined): boolean {
  if (!cookie) return false;
  const lastDot = cookie.lastIndexOf(".");
  if (lastDot === -1) return false;
  const name = cookie.slice(0, lastDot);
  const sig = cookie.slice(lastDot + 1);
  const secret = process.env.AUTH_SECRET ?? "fallback-secret";
  const expected = createHmac("sha256", secret).update(name).digest("hex");
  return sig === expected;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas de API de auth no requieren sesión
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;

  if (!verifySession(session)) {
    // API routes devuelven 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    // Páginas redirigen al login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
