"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Search, AlertCircle, ExternalLink, RefreshCw,
  Calendar, Lightbulb, Presentation, MessageSquare, TrendingUp,
} from "lucide-react";
import type { Strategy } from "@/app/api/ai/generate-deal-strategies/route";
import type { Deal } from "@/lib/types";
import WeeklyPanel from "@/components/seguimiento/WeeklyPanel";
import DealIdeasModal, { type Idea } from "@/components/seguimiento/DealIdeasModal";
import PresentationModal from "@/components/seguimiento/PresentationModal";
import DealStrategiesModal from "@/components/seguimiento/DealStrategiesModal";
import FollowupModal from "@/components/seguimiento/FollowupModal";

// ── Colores de fase ──────────────────────────────────────────────────────────

const FASE_COLOR: Record<string, string> = {
  "prospecto":          "bg-slate-700/50 text-slate-400",
  "primer contacto":    "bg-blue-500/15 text-blue-300",
  "en negociación":     "bg-yellow-500/15 text-yellow-300",
  "propuesta enviada":  "bg-purple-500/15 text-purple-300",
  "pedido confirmado":  "bg-green-500/15 text-green-300",
  "cerrado":            "bg-emerald-500/15 text-emerald-300",
};
function faseColor(s: string) {
  return FASE_COLOR[s.toLowerCase()] ?? "bg-slate-700/50 text-slate-300";
}

// ── Semáforo de próxima acción ───────────────────────────────────────────────

type Health = "green" | "yellow" | "red";

function actionHealth(nextAction: string): Health {
  if (!nextAction) return "red";
  const d = new Date(nextAction);
  if (isNaN(d.getTime())) return "red";
  const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return "red";
  if (diffDays <= 3) return "yellow";
  return "green";
}

const DOT_CLS: Record<Health, string> = {
  green:  "bg-green-400",
  yellow: "bg-yellow-400",
  red:    "bg-red-500",
};
const ROW_CLS: Record<Health, string> = {
  green:  "border-l-2 border-green-500/40",
  yellow: "border-l-2 border-yellow-500/40",
  red:    "border-l-2 border-red-500/40",
};

// ── Página principal ─────────────────────────────────────────────────────────

type Props = { deals: Deal[]; error: string; boardId: string };

export default function SeguimientoClient({ deals, error, boardId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterFase, setFilterFase] = useState("todos");
  const [filterCountry, setFilterCountry] = useState("todos");
  const [presModal, setPresModal] = useState<{ deal: Deal; idea?: Idea } | null>(null);
  const [ideasModal, setIdeasModal] = useState<Deal | null>(null);
  const [followupModal, setFollowupModal] = useState<{ deal: Deal; strategy?: Strategy; channel?: "email" | "whatsapp" } | null>(null);
  const [strategiesModal, setStrategiesModal] = useState<Deal | null>(null);

  const fases = useMemo(() => {
    const s = new Set(deals.map((d) => d.fase).filter(Boolean));
    return ["todos", ...Array.from(s).sort()];
  }, [deals]);

  const countries = useMemo(() => {
    const s = new Set(deals.map((d) => d.country).filter(Boolean));
    return ["todos", ...Array.from(s).sort()];
  }, [deals]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deals.filter((d) => {
      if (filterFase !== "todos" && d.fase !== filterFase) return false;
      if (filterCountry !== "todos" && d.country !== filterCountry) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.contactPerson.toLowerCase().includes(q)
      );
    });
  }, [deals, search, filterFase, filterCountry]);

  const stats = useMemo(() => {
    const today = new Date();
    const overdue = deals.filter((d) => {
      if (!d.nextAction) return false;
      const nd = new Date(d.nextAction);
      return !isNaN(nd.getTime()) && nd < today;
    }).length;
    const soon = deals.filter((d) => {
      if (!d.nextAction) return false;
      const nd = new Date(d.nextAction);
      if (isNaN(nd.getTime())) return false;
      const diff = Math.ceil((nd.getTime() - today.getTime()) / 86400000);
      return diff >= 0 && diff <= 3;
    }).length;
    return { total: deals.length, overdue, soon, noAction: deals.filter((d) => !d.nextAction).length };
  }, [deals]);

  return (
    <>
      {strategiesModal && (
        <DealStrategiesModal
          deal={strategiesModal}
          onClose={() => setStrategiesModal(null)}
          onUseStrategy={(strategy, channel) => {
            setFollowupModal({ deal: strategiesModal, strategy, channel });
          }}
        />
      )}
      {followupModal && (
        <FollowupModal
          deal={followupModal.deal}
          strategy={followupModal.strategy}
          initialChannel={followupModal.channel ?? "email"}
          onClose={() => setFollowupModal(null)}
        />
      )}
      {ideasModal && (
        <DealIdeasModal
          deal={ideasModal}
          onClose={() => setIdeasModal(null)}
          onPresent={(idea) => { setPresModal({ deal: ideasModal, idea }); }}
        />
      )}
      {presModal && (
        <PresentationModal
          deal={presModal.deal}
          idea={presModal.idea}
          onClose={() => setPresModal(null)}
        />
      )}

      <div className="min-h-screen bg-slate-950">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-semibold">Seguimiento Multicanal</h1>
            <p className="text-slate-500 text-xs">Módulo 2 · Deals Internacionales · {deals.length} clientes</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a
              href={`https://sicobenediciones.monday.com/boards/${boardId}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />Ver en Monday
            </a>
            <button
              onClick={() => router.refresh()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />Actualizar
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium text-sm">Error al conectar con Monday</p>
                <p className="text-red-300/70 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {!error && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total deals",        value: stats.total,    dot: "bg-slate-500" },
                { label: "Acción vencida",     value: stats.overdue,  dot: "bg-red-500" },
                { label: "Acción en 3 días",   value: stats.soon,     dot: "bg-yellow-400" },
                { label: "Sin próxima acción", value: stats.noAction, dot: "bg-slate-600" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                  </div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {!error && <WeeklyPanel deals={deals} />}

          {!error && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar deal, país, contacto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
              <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors">
                {countries.map((c) => <option key={c} value={c}>{c === "todos" ? "Todos los países" : c}</option>)}
              </select>
              <select value={filterFase} onChange={(e) => setFilterFase(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors">
                {fases.map((f) => <option key={f} value={f}>{f === "todos" ? "Todas las fases" : f}</option>)}
              </select>
            </div>
          )}

          {!error && filtered.length > 0 && (
            <p className="text-xs text-slate-500 mb-4">
              {filtered.length !== deals.length ? `${filtered.length} de ${deals.length} deals` : `${deals.length} deals`}
            </p>
          )}

          {!error && filtered.length > 0 && (
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-slate-800">
                  <tr>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Deal / Cliente</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden sm:table-cell">País</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden md:table-cell">Fase</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden lg:table-cell">Contacto</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden xl:table-cell">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Próx. acción</span>
                    </th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden xl:table-cell">Mes objetivo</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Presentation className="w-3.5 h-3.5 text-indigo-400" />
                        Presentación IA
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((d) => {
                    const health = actionHealth(d.nextAction);
                    return (
                      <tr key={d.id} className={`bg-slate-950 hover:bg-slate-900/50 transition-colors ${ROW_CLS[health]}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_CLS[health]}`} />
                            <div>
                              <p className="font-medium text-white leading-tight">{d.name}</p>
                              {d.category && <p className="text-xs text-slate-500 mt-0.5">{d.category}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{d.country || "—"}</td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {d.fase
                            ? <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${faseColor(d.fase)}`}>{d.fase}</span>
                            : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">
                          <div>{d.contactPerson || "—"}</div>
                          {d.buyerPerson && d.buyerPerson !== d.contactPerson && (
                            <div className="text-slate-600 mt-0.5">{d.buyerPerson}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs hidden xl:table-cell">
                          {d.nextAction
                            ? <span className={health === "red" ? "text-red-400" : health === "yellow" ? "text-yellow-400" : "text-slate-400"}>{d.nextAction}</span>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden xl:table-cell">{d.targetMonth || "—"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => setStrategiesModal(d)}
                              className="flex items-center gap-1.5 text-xs text-orange-400 border border-orange-500/40 hover:border-orange-400 bg-orange-500/5 hover:bg-orange-500/10 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium"
                            >
                              <TrendingUp className="w-3 h-3" />
                              Estrategias
                            </button>
                            <button
                              onClick={() => setFollowupModal({ deal: d })}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-500 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Seguimiento
                            </button>
                            <button
                              onClick={() => setPresModal({ deal: d })}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            >
                              <Presentation className="w-3 h-3" />
                              Presentación
                            </button>
                            <button
                              onClick={() => setIdeasModal(d)}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-yellow-400 border border-slate-700 hover:border-yellow-500 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            >
                              <Lightbulb className="w-3 h-3" />
                              Ideas
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!error && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500 text-sm">
              {search || filterFase !== "todos" || filterCountry !== "todos"
                ? "Sin resultados con los filtros aplicados."
                : "No hay deals en el board."}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
