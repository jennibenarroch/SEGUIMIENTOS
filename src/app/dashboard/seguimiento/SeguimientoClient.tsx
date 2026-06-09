"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Search, AlertCircle, ExternalLink, RefreshCw,
  X, CheckCircle, ChevronDown, ChevronUp, Calendar, Lightbulb, Tag,
  Presentation, Printer
} from "lucide-react";
import type { Deal } from "./page";
import type { Presentation as PresentationType, Slide } from "@/app/api/ai/generate-presentation/route";

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

function isDealOverdue(deal: Deal): boolean {
  if (!deal.nextAction) return false;
  const d = new Date(deal.nextAction);
  return !isNaN(d.getTime()) && d < new Date();
}

// ── Panel semanal por país ───────────────────────────────────────────────────

function WeeklyPanel({ deals }: { deals: Deal[] }) {
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
      .sort((a, b) => a.contacted - b.total + b.contacted - a.total);

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
                    <div className={`h-1.5 rounded-full transition-all ${done ? "bg-green-500" : warn ? "bg-red-500" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }} />
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

// ── Tipos de idea ────────────────────────────────────────────────────────────

type Idea = {
  titulo: string;
  tipo: string;
  descripcion: string;
  licencias: string[];
  argumento: string;
};

const TIPO_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "Exhibidor":          { bg: "bg-blue-500/10",   text: "text-blue-300",   border: "border-blue-500/30" },
  "Activación":         { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/30" },
  "Temporada":          { bg: "bg-pink-500/10",   text: "text-pink-300",   border: "border-pink-500/30" },
  "Bundle":             { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30" },
  "Lanzamiento":        { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/30" },
  "Cross Merchandising":{ bg: "bg-teal-500/10",   text: "text-teal-300",   border: "border-teal-500/30" },
};
function tipoStyle(tipo: string) {
  return TIPO_STYLE[tipo] ?? { bg: "bg-slate-700/40", text: "text-slate-300", border: "border-slate-600/40" };
}

// ── Modal de ideas ───────────────────────────────────────────────────────────

function DealIdeasModal({
  deal,
  onClose,
  onPresent,
}: {
  deal: Deal;
  onClose: () => void;
  onPresent: (idea: Idea) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [genError, setGenError] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const overdue = isDealOverdue(deal);

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const res = await fetch("/api/ai/generate-deal-ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deal: {
              name: deal.name, country: deal.country, category: deal.category,
              fase: deal.fase, contactPerson: deal.contactPerson,
              targetMonth: deal.targetMonth, targetValue: deal.targetValue,
              lastNotes: deal.lastNotes, isOverdue: overdue,
            },
          }),
        });
        const data = await res.json() as { ideas?: Idea[]; error?: string };
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Error al generar");
        setIdeas(data.ideas ?? []);
      } catch (e) {
        if (!cancelled) setGenError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    generate();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Ideas para presentar
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {deal.name} · {deal.country}
              {overdue && <span className="ml-2 text-red-400 font-medium">· Atrasado</span>}
            </p>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="relative">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
                <RefreshCw className="w-4 h-4 text-yellow-300 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <p className="text-white text-sm font-medium">Generando 3 ideas…</p>
              <p className="text-slate-500 text-xs">Claude está analizando el perfil del cliente</p>
            </div>
          )}

          {genError && !loading && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{genError}</p>
            </div>
          )}

          {!loading && !genError && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Selecciona una idea. La IA generará la presentación basada en el concepto elegido.</p>
              {ideas.map((idea, i) => {
                const style = tipoStyle(idea.tipo);
                return (
                  <div key={i} className={`rounded-xl border p-4 space-y-3 ${style.border} ${style.bg}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      <h3 className="text-white font-semibold text-sm">{idea.titulo}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                        {idea.tipo}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{idea.descripcion}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {idea.licencias.map((lic) => (
                        <span key={lic} className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                          <Tag className="w-2.5 h-2.5" />{lic}
                        </span>
                      ))}
                    </div>
                    <div className="bg-slate-900/70 border border-slate-700/50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500 mb-0.5 font-medium">Argumento clave</p>
                      <p className="text-xs text-slate-300 italic">"{idea.argumento}"</p>
                    </div>
                    <button
                      onClick={() => { onPresent(idea); onClose(); }}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      Generar presentación con esta idea
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && (
          <div className="flex justify-end p-5 border-t border-slate-800 flex-shrink-0">
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal de presentación ────────────────────────────────────────────────────

const SLIDE_ACCENT = [
  "border-blue-500/40 bg-blue-500/5",
  "border-indigo-500/40 bg-indigo-500/5",
  "border-violet-500/40 bg-violet-500/5",
  "border-purple-500/40 bg-purple-500/5",
  "border-pink-500/40 bg-pink-500/5",
];

function PresentationModal({
  deal,
  idea,
  onClose,
}: {
  deal: Deal;
  idea?: Idea;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [genError, setGenError] = useState("");
  const [pres, setPres] = useState<PresentationType | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const res = await fetch("/api/ai/generate-presentation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deal: {
              name: deal.name, country: deal.country, category: deal.category,
              fase: deal.fase, contactPerson: deal.contactPerson,
              buyerPerson: deal.buyerPerson, lastContact: deal.lastContact,
              nextAction: deal.nextAction, targetMonth: deal.targetMonth,
              targetValue: deal.targetValue, lastNotes: deal.lastNotes,
              ideaTitle: idea?.titulo, ideaType: idea?.tipo,
              ideaDescription: idea?.descripcion, ideaLicenses: idea?.licencias,
              ideaArgument: idea?.argumento,
            },
          }),
        });
        const data = await res.json() as { presentation?: PresentationType; error?: string };
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Error al generar");
        setPres(data.presentation ?? null);
      } catch (e) {
        if (!cancelled) setGenError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    generate();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Presentation className="w-4 h-4 text-indigo-400" />
              Presentación comercial
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">{deal.name} · {deal.country}</p>
          </div>
          <div className="flex items-center gap-2">
            {pres && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
            )}
            {!loading && (
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5" id="presentation-content">
          {loading && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="relative">
                <Presentation className="w-8 h-8 text-indigo-400" />
                <RefreshCw className="w-4 h-4 text-indigo-300 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <p className="text-white text-sm font-medium">Generando presentación…</p>
              <p className="text-slate-500 text-xs">Claude está preparando las diapositivas</p>
            </div>
          )}

          {genError && !loading && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{genError}</p>
            </div>
          )}

          {!loading && pres && (
            <div className="space-y-4">
              {/* Portada */}
              <div className="rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-6 text-center">
                <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-2">Sicoben Ediciones</p>
                <h1 className="text-white text-xl font-bold leading-tight mb-1">{pres.dealName}</h1>
                <p className="text-slate-400 text-sm">{pres.subtitle}</p>
                {idea && (
                  <span className="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                    💡 {idea.titulo}
                  </span>
                )}
              </div>

              {/* Diapositivas */}
              {pres.slides.map((slide: Slide, i: number) => (
                <div key={i} className={`rounded-xl border p-5 ${SLIDE_ACCENT[i % SLIDE_ACCENT.length]}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{slide.section}</span>
                  </div>
                  <h3 className="text-white font-bold text-base leading-snug mb-3">{slide.headline}</h3>
                  {slide.highlight && (
                    <div className="mb-3 inline-block bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                      <p className="text-white font-semibold text-sm">{slide.highlight}</p>
                    </div>
                  )}
                  <ul className="space-y-1.5">
                    {slide.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-slate-500 mt-1 flex-shrink-0">▸</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex justify-end p-5 border-t border-slate-800 flex-shrink-0">
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

type Props = { deals: Deal[]; error: string; boardId: string };

export default function SeguimientoClient({ deals, error, boardId }: Props) {
  const [search, setSearch] = useState("");
  const [filterFase, setFilterFase] = useState("todos");
  const [filterCountry, setFilterCountry] = useState("todos");
  const [presModal, setPresModal] = useState<{ deal: Deal; idea?: Idea } | null>(null);
  const [ideasModal, setIdeasModal] = useState<Deal | null>(null);

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
          <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
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
              onClick={() => window.location.reload()}
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
                              onClick={() => setPresModal({ deal: d })}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            >
                              <Presentation className="w-3 h-3" />
                              Presentación
                            </button>
                            <button
                              onClick={() => setIdeasModal(d)}
                              className={`flex items-center gap-1.5 text-xs border px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                isDealOverdue(d)
                                  ? "text-yellow-400 border-yellow-500/50 hover:border-yellow-400 bg-yellow-500/5 font-semibold"
                                  : "text-slate-400 hover:text-yellow-400 border-slate-700 hover:border-yellow-500"
                              }`}
                            >
                              <Lightbulb className="w-3 h-3" />
                              {isDealOverdue(d) ? "💡 Reactivar" : "Ideas"}
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
