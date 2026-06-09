import { getDeals, dealCol, type DealItem } from "@/lib/monday-deals";
import SeguimientoClient from "./SeguimientoClient";

export const dynamic = "force-dynamic";

export type Deal = {
  id: string;
  name: string;
  country: string;
  category: string;
  fase: string;
  estadoKpi: string;
  contactPerson: string;
  buyerPerson: string;
  email: string;
  email1: string;
  vendor: string;
  lastContact: string;
  nextAction: string;
  targetMonth: string;
  targetValue: string;
  lastNotes: string;
  updatedAt: string;
};

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}sem`;
  return `${Math.floor(days / 30)}mes`;
}

function toDeal(item: DealItem): Deal {
  return {
    id: item.id,
    name: item.name,
    country: dealCol(item, "dup__of_categor_a__1"),
    category: dealCol(item, "dup__of_ciudad__1"),
    fase: dealCol(item, "estado_1__1"),
    estadoKpi: dealCol(item, "dup__of_estado__1"),
    contactPerson: dealCol(item, "lookup__1"),
    buyerPerson: dealCol(item, "lookup4__1"),
    email: dealCol(item, "dup__of_ext_mkm0rqbe"),
    email1: dealCol(item, "lookup_mkm01t6a"),
    vendor: dealCol(item, "lookup_mm0y5fjq"),
    lastContact: dealCol(item, "fecha_1_mkkktxgd"),
    nextAction: dealCol(item, "fecha_mkkkqae2"),
    targetMonth: dealCol(item, "conectar_tableros_Mjj4B8ST"),
    targetValue: dealCol(item, "n_meros__1"),
    lastNotes: dealCol(item, "texto90"),
    updatedAt: timeSince(item.updated_at),
  };
}

export default async function SeguimientoPage() {
  let deals: Deal[] = [];
  let error = "";

  try {
    const items = await getDeals();
    deals = items.map(toDeal);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <SeguimientoClient
      deals={deals}
      error={error}
      boardId={process.env.NEXT_PUBLIC_MONDAY_DEALS_BOARD_ID ?? ""}
    />
  );
}
