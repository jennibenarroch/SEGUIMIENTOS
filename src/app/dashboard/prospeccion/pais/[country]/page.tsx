import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProspects, col, type MondayItem } from "@/lib/monday-prospects";
import { MOCK_PROSPECTS } from "@/lib/mock-data";
import { COUNTRY_FLAG } from "@/lib/countries";
import type { Prospect } from "@/lib/types";
import CountryReportClient from "./CountryReportClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const name = decodeURIComponent(country);
  return { title: `Prospectos · ${name}`, robots: { index: false, follow: false } };
}

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}sem`;
  return `${Math.floor(days / 30)}mes`;
}

function extractVendorIds(item: MondayItem): number[] {
  const c = item.column_values.find((cv) => cv.id === "multiple_person");
  if (!c?.value) return [];
  try {
    const parsed = JSON.parse(c.value) as { personsAndTeams?: { id: number; kind: string }[] };
    return (parsed.personsAndTeams ?? []).filter((p) => p.kind === "person").map((p) => p.id);
  } catch { return []; }
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
    contactPerson: col(item, "text_contacto") || undefined,
  };
}

export default async function CountryReportPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryName = decodeURIComponent(country);
  const flag = COUNTRY_FLAG[countryName] ?? "🌍";

  let allProspects: Prospect[] = [];
  let error = "";

  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    allProspects = MOCK_PROSPECTS;
  } else {
    try {
      const items = await getProspects();
      allProspects = items.map(toProspect);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  const prospects = allProspects.filter(
    (p) => p.country?.trim().toLowerCase() === countryName.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/prospeccion" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{flag}</span>
          <div>
            <h1 className="text-white font-semibold">{countryName}</h1>
            <p className="text-slate-500 text-xs">Reporte de prospectos</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <CountryReportClient
          countryName={countryName}
          prospects={prospects}
          error={error}
        />
      </main>
    </div>
  );
}
