import { NextResponse } from "next/server";
import { getProspects, col } from "@/lib/monday-prospects";

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
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
