import { NextResponse } from "next/server";
import { getProspects } from "@/lib/monday-prospects";

export async function GET() {
  try {
    const items = await getProspects();
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
