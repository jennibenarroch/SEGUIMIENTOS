import { NextResponse } from "next/server";
import { getProspects } from "@/lib/monday-prospects";
import { safeError } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await getProspects();
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 });
  }
}
