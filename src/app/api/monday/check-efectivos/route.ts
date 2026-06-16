import { NextResponse } from "next/server";
import { getProspects, col } from "@/lib/monday-prospects";
import { safeError } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await getProspects();
    const efectivos = items
      .filter((item) => col(item, "status").toLowerCase() === "contacto efectivo")
      .map((item) => ({
        id:     item.id,
        name:   item.name,
        seller: col(item, "color_mm0ykm0j"),
      }));
    return NextResponse.json(efectivos);
  } catch (err) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 });
  }
}
