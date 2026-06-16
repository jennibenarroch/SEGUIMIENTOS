import { NextResponse } from "next/server";
import { createHmac } from "crypto";

function signSession(name: string): string {
  const secret = process.env.AUTH_SECRET ?? "fallback-secret";
  const sig = createHmac("sha256", secret).update(name).digest("hex");
  return `${name}.${sig}`;
}

export async function POST(req: Request) {
  try {
    const { name, password } = (await req.json()) as { name?: string; password?: string };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Selecciona tu nombre." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Ingresa la contraseña." }, { status: 400 });
    }

    const correctPassword = process.env.AUTH_PASSWORD;
    if (!correctPassword || password !== correctPassword) {
      return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
    }

    const sessionValue = signSession(name.trim());
    const response = NextResponse.json({ ok: true });
    response.cookies.set("session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Error al iniciar sesión." }, { status: 500 });
  }
}
