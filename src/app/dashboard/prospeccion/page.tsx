import { getProspects, col, type MondayItem } from "@/lib/monday-prospects";
import ProspeccionClient from "./ProspeccionClient";

export const dynamic = "force-dynamic";

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}sem`;
  return `${Math.floor(days / 30)}mes`;
}

export type Prospect = {
  id: string;
  name: string;
  country: string;
  status: string;
  seller: string;
  vendorIds: number[];   // IDs de usuario Monday para notificación directa
  category: string;
  nextContact: string;
  lastContact: string;
  updatedAt: string;
  createdAt: string;
};

function extractVendorIds(item: MondayItem): number[] {
  const col = item.column_values.find((c) => c.id === "multiple_person");
  if (!col?.value) return [];
  try {
    const parsed = JSON.parse(col.value) as { personsAndTeams?: { id: number; kind: string }[] };
    return (parsed.personsAndTeams ?? [])
      .filter((p) => p.kind === "person")
      .map((p) => p.id);
  } catch {
    return [];
  }
}

function toProspect(item: MondayItem): Prospect {
  return {
    id: item.id,
    name: item.name,
    country: col(item, "text3"),
    status: col(item, "status"),
    seller: col(item, "color_mm0ykm0j"),
    vendorIds: extractVendorIds(item),
    category: col(item, "text9"),
    nextContact: col(item, "fecha0"),
    lastContact: col(item, "fecha53"),
    updatedAt: timeSince(item.updated_at),
    createdAt: item.created_at,
  };
}

export default async function ProspeccionPage() {
  let prospects: Prospect[] = [];
  let error = "";

  try {
    const items = await getProspects();
    prospects = items.map(toProspect);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <ProspeccionClient
      prospects={prospects}
      error={error}
      boardId={process.env.NEXT_PUBLIC_MONDAY_PROSPECTS_BOARD_ID ?? ""}
    />
  );
}
