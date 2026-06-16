"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, AlertCircle, ExternalLink, RefreshCw, Send, CheckCircle, SendHorizonal, Sparkles, Mail, Plus } from "lucide-react";
import type { Prospect } from "@/lib/types";
import NotifyModal from "@/components/prospeccion/NotifyModal";
import BulkNotifyModal from "@/components/prospeccion/BulkNotifyModal";
import EmailModal from "@/components/prospeccion/EmailModal";
import NotificationToast, { type Toast } from "@/components/prospeccion/NotificationToast";
import CountryQuotaPanel from "@/components/prospeccion/CountryQuotaPanel";
import SellerQuotaPanel from "@/components/prospeccion/SellerQuotaPanel";

// ── Colores de estado ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  "contacto efectivo": "bg-green-500/15 text-green-300",
  "sin acción":        "bg-slate-700/50 text-slate-400",
  "propuesta enviada": "bg-purple-500/15 text-purple-300",
  "negociación":       "bg-blue-500/15 text-blue-300",
  "inactivo":          "bg-red-500/15 text-red-300",
  "cliente":           "bg-emerald-500/15 text-emerald-300",
};
function statusColor(s: string) {
  return STATUS_COLOR[s.toLowerCase()] ?? "bg-slate-700/50 text-slate-300";
}

// ── Semáforo de contacto ─────────────────────────────────────────────────────

function startOfCurrentWeek(): Date {
  const now = new Date();
  const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diff);
  return monday;
}

function startOfLastWeek(): Date {
  const m = startOfCurrentWeek();
  const last = new Date(m);
  last.setDate(m.getDate() - 7);
  return last;
}

type Health = "green" | "yellow" | "red";

function contactHealth(lastContact: string): Health {
  if (!lastContact || lastContact === "—") return "red";
  const d = new Date(lastContact);
  if (isNaN(d.getTime())) return "red";
  if (d >= startOfCurrentWeek()) return "green";
  if (d >= startOfLastWeek())    return "yellow";
  return "red";
}

function daysAgo(dateStr: string): string {
  if (!dateStr || dateStr === "—") return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
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

// ── Constantes de polling ────────────────────────────────────────────────────

const POLL_MS = 45_000;
const LS_KEY  = "salesai_notified_efectivos";

// ── Página principal ─────────────────────────────────────────────────────────

type ModalState      = { prospect: Prospect } | null;
type EmailModalState = { prospect: Prospect } | null;

type Props = {
  prospects: Prospect[];
  error: string;
  boardId: string;
};

export default function ProspeccionClient({ prospects, error, boardId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterSeller, setFilterSeller] = useState("todos");
  const [modal, setModal] = useState<ModalState>(null);
  const [emailModal, setEmailModal] = useState<EmailModalState>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [sent,   setSent]   = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const knownRef    = useRef<Set<string>>(new Set());
  const toastKeyRef = useRef(0);

  // Polling: detecta nuevos "contacto efectivo" y lanza notificación
  useEffect(() => {
    const stored  = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[];
    const initial = prospects
      .filter((p) => p.status.toLowerCase() === "contacto efectivo")
      .map((p) => p.id);
    const known = new Set([...stored, ...initial]);
    knownRef.current = known;
    localStorage.setItem(LS_KEY, JSON.stringify([...known]));

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    async function poll() {
      try {
        const res = await fetch("/api/monday/check-efectivos");
        if (!res.ok) return;
        const items = (await res.json()) as { id: string; name: string; seller: string }[];

        for (const item of items) {
          if (knownRef.current.has(item.id)) continue;
          knownRef.current.add(item.id);
          localStorage.setItem(LS_KEY, JSON.stringify([...knownRef.current]));

          const mondayUrl = `https://sicobenediciones.monday.com/boards/${boardId}/items/${item.id}`;

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Contacto Efectivo ✅", {
              body: `${item.name}${item.seller ? ` · Vendedor: ${item.seller}` : ""}`,
              icon: "/favicon.ico",
              tag: `ef-${item.id}`,
            });
          }

          const key = ++toastKeyRef.current;
          setToasts((prev) => [...prev, { key, id: item.id, name: item.name, seller: item.seller, mondayUrl }]);
          setTimeout(() => setToasts((prev) => prev.filter((t) => t.key !== key)), 8000);
        }
      } catch {
        // Ignorar errores de polling silenciosamente
      }
    }

    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statuses = useMemo(() => {
    const s = new Set(prospects.map((p) => p.status).filter(Boolean));
    return ["todos", ...Array.from(s).sort()];
  }, [prospects]);

  const sellers = useMemo(() => {
    const s = new Set(prospects.map((p) => p.seller).filter(Boolean));
    return ["todos", ...Array.from(s).sort()];
  }, [prospects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter((p) => {
      if (filterStatus !== "todos" && p.status !== filterStatus) return false;
      if (filterSeller !== "todos" && p.seller !== filterSeller) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
      );
    });
  }, [prospects, search, filterStatus, filterSeller]);

  const grouped = useMemo(() => ({
    nuevos:      filtered.filter(p => (!p.lastContact || p.lastContact === "—") && !sent[p.id]),
    contactados: filtered.filter(p => (p.lastContact && p.lastContact !== "—") || sent[p.id]),
  }), [filtered, sent]);

  const stats = useMemo(() => ({
    total:  prospects.length,
    green:  prospects.filter((p) => contactHealth(p.lastContact) === "green").length,
    yellow: prospects.filter((p) => contactHealth(p.lastContact) === "yellow").length,
    red:    prospects.filter((p) => contactHealth(p.lastContact) === "red").length,
  }), [prospects]);

  function handleSent(id: string, date: string) {
    setSent((prev) => ({ ...prev, [id]: date }));
  }

  function handleBulkDone(results: Record<string, string>) {
    setSent((prev) => ({ ...prev, ...results }));
  }

  return (
    <>
      {bulkOpen && (
        <BulkNotifyModal
          prospects={filtered}
          onClose={() => setBulkOpen(false)}
          onDone={(results) => { handleBulkDone(results); setBulkOpen(false); }}
        />
      )}
      {modal && (
        <NotifyModal
          prospect={modal.prospect}
          onClose={() => setModal(null)}
          onSent={handleSent}
        />
      )}
      {emailModal && (
        <EmailModal
          prospect={emailModal.prospect}
          onClose={() => setEmailModal(null)}
        />
      )}

      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-semibold">Prospección Inteligente</h1>
            <p className="text-slate-500 text-xs">Módulo 1 · {prospects.length} prospectos</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/dashboard/prospeccion/nuevos"
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 border border-violet-500/40 hover:border-violet-400 bg-violet-500/10 hover:bg-violet-500/15 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Prospectos nuevos IA
            </Link>
            <a
              href={`https://sicobenediciones.monday.com/boards/${boardId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver en Monday
            </a>
            <button
              onClick={() => router.refresh()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error */}
          {error && (
            <div className="mb-6 p-5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium text-sm">Error al conectar con Monday</p>
                <p className="text-red-300/70 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          {!error && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total prospectos",            value: stats.total,  dot: "bg-slate-500" },
                { label: "Contactados esta semana",     value: stats.green,  dot: "bg-green-400" },
                { label: "Contactados semana pasada",   value: stats.yellow, dot: "bg-yellow-400" },
                { label: "Más de 1 semana sin acción",  value: stats.red,    dot: "bg-red-500" },
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

          {/* Cuota semanal por país */}
          {!error && <SellerQuotaPanel prospects={prospects} />}
          {!error && <CountryQuotaPanel prospects={prospects} />}

          {/* Filters */}
          {!error && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar prospecto, país, categoría..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s === "todos" ? "Todos los estados" : s}</option>
                ))}
              </select>
              <select
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {sellers.map((s) => (
                  <option key={s} value={s}>{s === "todos" ? "Todos los vendedores" : s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Barra de acciones */}
          {!error && filtered.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500">
                {filtered.length !== prospects.length
                  ? `${filtered.length} de ${prospects.length} prospectos`
                  : `${prospects.length} prospectos`}
              </p>
              <button
                onClick={() => setBulkOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <SendHorizonal className="w-3.5 h-3.5" />
                Notificar a todos ({filtered.length})
              </button>
            </div>
          )}

          {/* Table */}
          {!error && filtered.length > 0 && (
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-slate-800">
                  <tr>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Prospecto</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden sm:table-cell">País</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden md:table-cell">Estado</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden lg:table-cell">Vendedor</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden xl:table-cell">Últ. contacto</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden xl:table-cell">Próx. contacto</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium">Aviso</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium hidden sm:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Email IA
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* ── Nuevos: sin primer contacto ── */}
                  {grouped.nuevos.length > 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-2 bg-purple-950/40 border-y border-purple-800/40">
                        <span className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                          Nuevos — sin primer contacto ({grouped.nuevos.length})
                        </span>
                      </td>
                    </tr>
                  )}
                  {grouped.nuevos.map((p) => {
                    const health = contactHealth(p.lastContact);
                    const sentDate = sent[p.id];
                    return (
                      <tr key={p.id} className={`bg-slate-950 hover:bg-slate-900/50 transition-colors divide-y divide-slate-800/60 ${ROW_CLS[health]}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_CLS[health]}`} />
                            <div>
                              <p className="font-medium text-white leading-tight">{p.name}</p>
                              {p.category && <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{p.country || "—"}</td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {p.status ? (
                            p.status.toLowerCase() === "contacto efectivo" ? (
                              <a href={`https://sicobenediciones.monday.com/boards/${boardId}/items/${p.id}`} target="_blank" rel="noreferrer"
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(p.status)} hover:ring-1 hover:ring-green-400/40 transition-all`}>
                                {p.status}<ExternalLink className="w-3 h-3 opacity-70" />
                              </a>
                            ) : (
                              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
                            )
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{p.seller || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs hidden xl:table-cell italic">Sin contacto</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden xl:table-cell">{p.nextContact || "—"}</td>
                        <td className="px-5 py-3.5">
                          {sentDate ? (
                            <span className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />{sentDate}</span>
                          ) : (
                            <button onClick={() => setModal({ prospect: p })}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-500 px-2.5 py-1.5 rounded-lg transition-all">
                              <Send className="w-3 h-3" />Notificar
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <button onClick={() => setEmailModal({ prospect: p })}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 border border-slate-700 hover:border-purple-500 px-2.5 py-1.5 rounded-lg transition-all">
                            <Mail className="w-3 h-3" />Generar email
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* ── En seguimiento: ya tuvieron contacto ── */}
                  {grouped.contactados.length > 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-2 bg-blue-950/40 border-y border-blue-800/40">
                        <span className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                          Prospectos en seguimiento ({grouped.contactados.length})
                        </span>
                      </td>
                    </tr>
                  )}
                  {grouped.contactados.map((p) => {
                    const health = contactHealth(p.lastContact);
                    const sentDate = sent[p.id];
                    return (
                      <tr key={p.id} className={`bg-slate-950 hover:bg-slate-900/50 transition-colors divide-y divide-slate-800/60 ${ROW_CLS[health]}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_CLS[health]}`} />
                            <div>
                              <p className="font-medium text-white leading-tight">{p.name}</p>
                              {p.category && <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{p.country || "—"}</td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {p.status ? (
                            p.status.toLowerCase() === "contacto efectivo" ? (
                              <a href={`https://sicobenediciones.monday.com/boards/${boardId}/items/${p.id}`} target="_blank" rel="noreferrer"
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(p.status)} hover:ring-1 hover:ring-green-400/40 transition-all`}>
                                {p.status}<ExternalLink className="w-3 h-3 opacity-70" />
                              </a>
                            ) : (
                              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
                            )
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{p.seller || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden xl:table-cell">{daysAgo(p.lastContact)}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden xl:table-cell">{p.nextContact || "—"}</td>
                        <td className="px-5 py-3.5">
                          {sentDate ? (
                            <span className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />{sentDate}</span>
                          ) : (
                            <button onClick={() => setModal({ prospect: p })}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-500 px-2.5 py-1.5 rounded-lg transition-all">
                              <Send className="w-3 h-3" />Notificar
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <button onClick={() => setEmailModal({ prospect: p })}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 border border-slate-700 hover:border-purple-500 px-2.5 py-1.5 rounded-lg transition-all">
                            <Mail className="w-3 h-3" />Generar email
                          </button>
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
              {search || filterStatus !== "todos" || filterSeller !== "todos"
                ? "Sin resultados con los filtros aplicados."
                : "No hay prospectos en el board."}
            </div>
          )}
        </main>
      </div>

      {/* Toast stack — esquina inferior derecha, sobre todos los modales */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <NotificationToast
            key={t.key}
            toast={t}
            onClose={() => setToasts((prev) => prev.filter((x) => x.key !== t.key))}
          />
        ))}
      </div>
    </>
  );
}
