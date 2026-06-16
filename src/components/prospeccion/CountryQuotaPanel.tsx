"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Prospect } from "@/lib/types";
import { LATAM_COUNTRIES, COUNTRY_FLAG } from "@/lib/countries";

const WEEKLY_GOAL = 50;

function startOfCurrentWeek(): Date {
  const now = new Date();
  const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diff);
  return monday;
}

export default function CountryQuotaPanel({ prospects }: { prospects: Prospect[] }) {
  const [open, setOpen] = useState(true);

  const { countries, weekTotal } = useMemo(() => {
    const weekStart = startOfCurrentWeek();
    const weekCount: Record<string, number> = {};
    const totalCount: Record<string, number> = {};

    for (const p of prospects) {
      const country = p.country?.trim();
      if (!country) continue;
      totalCount[country] = (totalCount[country] ?? 0) + 1;
      const created = new Date(p.createdAt);
      if (!isNaN(created.getTime()) && created >= weekStart) {
        weekCount[country] = (weekCount[country] ?? 0) + 1;
      }
    }

    const list = LATAM_COUNTRIES.map(({ name }) => ({
      country: name,
      thisWeek: weekCount[name] ?? 0,
      total: totalCount[name] ?? 0,
    })).sort((a, b) => b.thisWeek - a.thisWeek || b.total - a.total);

    const wTotal = list.reduce((sum, c) => sum + c.thisWeek, 0);
    return { countries: list, weekTotal: wTotal };
  }, [prospects]);

  const goalPct = Math.min(100, Math.round((weekTotal / WEEKLY_GOAL) * 100));
  const goalReached = weekTotal >= WEEKLY_GOAL;

  return (
    <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white font-medium text-sm">Nuevos prospectos por país</span>
          <span className="text-xs text-slate-500">meta: {WEEKLY_GOAL} nuevos / semana</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            goalReached ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
          }`}>
            {weekTotal} / {WEEKLY_GOAL} esta semana
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Barra de progreso global */}
      {open && (
        <div className="px-5 pb-2">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${goalReached ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">{goalPct}% de la meta semanal completada</p>
        </div>
      )}

      {open && (
        <div className="px-5 pb-5 pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {countries.map(({ country, thisWeek, total }) => {
            const pct = weekTotal > 0 ? Math.round((thisWeek / weekTotal) * 100) : 0;
            return (
              <Link
                key={country}
                href={`/dashboard/prospeccion/pais/${encodeURIComponent(country)}`}
                className={`rounded-xl p-3 border transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer block ${
                  thisWeek > 0
                    ? "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40"
                    : "border-slate-700/60 bg-slate-950 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-white truncate pr-1">
                    {COUNTRY_FLAG[country] && <span className="mr-1">{COUNTRY_FLAG[country]}</span>}
                    {country}
                  </p>
                  {thisWeek > 0 && (
                    <span className="text-xs font-bold tabular-nums text-blue-400 flex-shrink-0">{thisWeek}</span>
                  )}
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all bg-blue-500"
                    style={{ width: thisWeek > 0 ? `${Math.max(pct, 8)}%` : "0%" }}
                  />
                </div>
                {total > 0 && (
                  <p className="text-xs text-slate-600 mt-1">{total} total</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
