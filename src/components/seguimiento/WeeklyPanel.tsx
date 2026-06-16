"use client";

import { useState, useMemo } from "react";
import { AlertCircle, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";
import type { Deal } from "@/lib/types";

export default function WeeklyPanel({ deals }: { deals: Deal[] }) {
  const [open, setOpen] = useState(true);

  const { byCountry, isLateInWeek } = useMemo(() => {
    const now = new Date();
    const late = now.getDay() >= 4;
    const weekStart = new Date(now);
    const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const map: Record<string, { total: number; contacted: number }> = {};
    for (const d of deals) {
      const country = d.country?.trim() || "Sin país";
      if (!map[country]) map[country] = { total: 0, contacted: 0 };
      map[country].total++;
      if (d.lastContact) {
        const lc = new Date(d.lastContact);
        if (!isNaN(lc.getTime()) && lc >= weekStart) map[country].contacted++;
      }
    }

    const list = Object.entries(map)
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => a.contacted - a.total + b.total - b.contacted);

    return { byCountry: list, isLateInWeek: late };
  }, [deals]);

  const pending = byCountry.filter((c) => c.contacted < c.total);
  if (byCountry.length === 0) return null;

  return (
    <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm">Seguimiento semanal por país</span>
          <span className="text-xs text-slate-500">presentaciones generadas esta semana</span>
          {pending.length > 0 ? (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isLateInWeek ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"
            }`}>
              {pending.length} país{pending.length > 1 ? "es" : ""} pendiente{pending.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Al día ✓</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {byCountry.map(({ country, contacted, total }) => {
            const done = contacted >= total;
            const warn = !done && isLateInWeek;
            const pct = Math.min(100, Math.round((contacted / total) * 100));
            return (
              <div key={country} className={`rounded-xl p-3 border ${
                done ? "border-green-500/30 bg-green-500/5"
                : warn ? "border-red-500/30 bg-red-500/5"
                : "border-slate-700/60 bg-slate-950"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-white truncate pr-1">{country}</p>
                  {warn && <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                  {done && <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${done ? "bg-green-500" : warn ? "bg-red-500" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold tabular-nums ${done ? "text-green-400" : warn ? "text-red-400" : "text-slate-300"}`}>
                    {contacted}/{total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
