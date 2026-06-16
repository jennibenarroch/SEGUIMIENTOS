"use client";

import { useState, useMemo } from "react";
import { Users, CheckCircle2, Clock, AlertTriangle, Circle, Globe, Sparkles } from "lucide-react";
import EmailModal from "@/components/prospeccion/EmailModal";
import type { Prospect } from "@/lib/types";
import { COUNTRY_FLAG } from "@/lib/countries";
import { SELLERS_CONFIG } from "@/lib/sellers";

export const AVATAR_COLOR: Record<string, string> = Object.fromEntries(
  SELLERS_CONFIG.map((s) => [s.name, s.avatarColor])
);

const QUOTA = 10;

function startOfCurrentWeek(): Date {
  const now = new Date();
  const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diff);
  return monday;
}

function contactHealth(lastContact: string): "green" | "yellow" | "red" {
  if (!lastContact || lastContact === "—") return "red";
  const d = new Date(lastContact);
  if (isNaN(d.getTime())) return "red";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 7) return "green";
  if (days <= 14) return "yellow";
  return "red";
}

const SEMAFORO: Record<string, { label: string; dot: string; text: string }> = {
  green:  { label: "Al día",       dot: "bg-green-500",  text: "text-green-400"  },
  yellow: { label: "Por vencer",   dot: "bg-yellow-500", text: "text-yellow-400" },
  red:    { label: "Sin contacto", dot: "bg-red-500",    text: "text-red-400"    },
};

export default function SellerReportClient({
  sellerName,
  prospects,
  error,
}: {
  sellerName: string;
  prospects: Prospect[];
  error: string;
}) {
  const [emailProspect, setEmailProspect] = useState<Prospect | null>(null);
  const stats = useMemo(() => {
    const weekStart = startOfCurrentWeek();
    const newThisWeek = prospects.filter((p) => {
      const d = new Date(p.createdAt);
      return !isNaN(d.getTime()) && d >= weekStart;
    }).length;

    const byHealth = { green: 0, yellow: 0, red: 0 };
    for (const p of prospects) byHealth[contactHealth(p.lastContact)]++;

    const byCountry: Record<string, number> = {};
    for (const p of prospects) {
      if (p.country) byCountry[p.country] = (byCountry[p.country] ?? 0) + 1;
    }

    return { newThisWeek, byHealth, byCountry };
  }, [prospects]);

  if (error) {
    return <div className="text-center py-20 text-slate-500 text-sm">Error: {error}</div>;
  }

  return (
    <>
    {emailProspect && (
      <EmailModal prospect={emailProspect} onClose={() => setEmailProspect(null)} />
    )}
    <div className="space-y-8">
      {/* Cuota semanal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Cuota semanal</p>
        <div className="flex items-end gap-4 mb-3">
          <span className={`text-4xl font-bold tabular-nums ${stats.newThisWeek >= QUOTA ? "text-green-400" : "text-white"}`}>
            {stats.newThisWeek}
          </span>
          <span className="text-slate-500 text-lg mb-1">/ {QUOTA}</span>
          {stats.newThisWeek >= QUOTA && <CheckCircle2 className="w-6 h-6 text-green-400 mb-1" />}
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${stats.newThisWeek >= QUOTA ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${Math.min(100, Math.round((stats.newThisWeek / QUOTA) * 100))}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">prospectos nuevos esta semana</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-4 h-4 text-blue-400" />}         label="Total"        value={prospects.length}       color="blue"   />
        <StatCard icon={<Circle className="w-4 h-4 text-green-400 fill-green-400" />} label="Al día" value={stats.byHealth.green}  color="green"  />
        <StatCard icon={<Clock className="w-4 h-4 text-yellow-400" />}        label="Por vencer"   value={stats.byHealth.yellow}  color="yellow" />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-red-400" />}   label="Sin contacto" value={stats.byHealth.red}     color="red"    />
      </div>

      {/* Por país */}
      {Object.keys(stats.byCountry).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Por país</p>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byCountry)
              .sort(([, a], [, b]) => b - a)
              .map(([country, count]) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="text-base w-6">{COUNTRY_FLAG[country] ?? "🌍"}</span>
                  <span className="text-sm text-slate-300 w-40 truncate">{country}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.round((count / prospects.length) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums w-6 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Lista de prospectos */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
          {prospects.length === 0 ? "Sin prospectos asignados" : `${prospects.length} prospectos`}
        </p>

        {prospects.length === 0 ? (
          <div className="text-center py-16 text-slate-600 text-sm bg-slate-900 rounded-2xl border border-slate-800">
            No hay prospectos asignados a {sellerName} todavía.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Empresa</th>
                  <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium hidden sm:table-cell">País</th>
                  <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium hidden md:table-cell">Último contacto</th>
                  <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium hidden md:table-cell">Próximo contacto</th>
                  <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Aviso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {prospects.map((p) => {
                  const health = contactHealth(p.lastContact);
                  const s = SEMAFORO[health];
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <span className="text-white font-medium text-xs">{p.name}</span>
                        </div>
                        {p.contactPerson && (
                          <p className="text-xs text-slate-500 mt-0.5 pl-4">{p.contactPerson}</p>
                        )}
                        {p.status && (
                          <span className="ml-4 mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{p.status}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-400">
                          {COUNTRY_FLAG[p.country] && <span className="mr-1">{COUNTRY_FLAG[p.country]}</span>}
                          {p.country || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`text-xs ${s.text}`}>{p.lastContact || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{p.nextContact || "—"}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setEmailProspect(p)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          Email IA
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const bg: Record<string, string> = {
    blue: "border-blue-500/20", green: "border-green-500/20",
    yellow: "border-yellow-500/20", red: "border-red-500/20",
  };
  return (
    <div className={`bg-slate-900 border rounded-2xl p-4 ${bg[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500">{label}</span></div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}
