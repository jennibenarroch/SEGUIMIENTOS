"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Search, AlertCircle, ExternalLink, RefreshCw, Send, X, CheckCircle, SendHorizonal, Sparkles, Mail, ChevronDown, ChevronUp } from "lucide-react";
import type { Prospect } from "./page";

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

type Health = "green" | "yellow" | "red";

function contactHealth(lastContact: string): Health {
  if (!lastContact) return "red";
  const d = new Date(lastContact);
  if (isNaN(d.getTime())) return "red";
  return d >= startOfCurrentWeek() ? "green" : "yellow";
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

// ── Modal de notificación ────────────────────────────────────────────────────

type ModalState = { prospect: Prospect } | null;

function NotifyModal({
  prospect,
  onClose,
  onSent,
}: {
  prospect: Prospect;
  onClose: () => void;
  onSent: (id: string, date: string) => void;
}) {
  const today = new Date().toLocaleDateString("es-PA", { day: "2-digit", month: "2-digit", year: "numeric" });
  const defaultMsg = `📋 Acción requerida — ${today}\n\nFavor contactar a *${prospect.name}* hoy.\n\nPaís: ${prospect.country || "—"}\nÚltimo contacto: ${prospect.lastContact || "nunca"}\nEstado: ${prospect.status || "—"}\n\nGracias.`;

  const [message, setMessage] = useState(defaultMsg);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/monday/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: prospect.id, message, vendorIds: prospect.vendorIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      onSent(prospect.id, new Date().toISOString().split("T")[0]);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-white font-semibold">Notificar al vendedor</h2>
            <p className="text-slate-400 text-xs mt-0.5">{prospect.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              Mensaje que aparecerá en el item de Monday
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors resize-none font-mono"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Se publicará en la actividad del deal en Monday
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
            >
              {sending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {sending ? "Enviando…" : "Enviar aviso"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal de envío masivo ────────────────────────────────────────────────────

function BulkNotifyModal({
  prospects,
  onClose,
  onDone,
}: {
  prospects: Prospect[];
  onClose: () => void;
  onDone: (sent: Record<string, string>) => void;
}) {
  const today = new Date().toLocaleDateString("es-PA", { day: "2-digit", month: "2-digit", year: "numeric" });
  const defaultMsg = (p: Prospect) =>
    `📋 Acción requerida — ${today}\n\nFavor contactar a *${p.name}* hoy.\n\nPaís: ${p.country || "—"}\nÚltimo contacto: ${p.lastContact || "nunca"}\nEstado: ${p.status || "—"}\n\nGracias.`;

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);

  async function handleSendAll() {
    setRunning(true);
    const results: Record<string, string> = {};
    const dateStr = new Date().toISOString().split("T")[0];

    for (const p of prospects) {
      try {
        const res = await fetch("/api/monday/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: p.id, message: defaultMsg(p), vendorIds: p.vendorIds }),
        });
        if (res.ok) {
          results[p.id] = dateStr;
          setDone((n) => n + 1);
        } else {
          setErrors((n) => n + 1);
        }
      } catch {
        setErrors((n) => n + 1);
      }
      // Pausa entre requests para respetar el rate limit de Monday (60 req/min)
      await new Promise((r) => setTimeout(r, 1100));
    }

    setFinished(true);
    onDone(results);
  }

  const pct = prospects.length > 0 ? Math.round((done / prospects.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!running ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-white font-semibold">Notificar a todos</h2>
            <p className="text-slate-400 text-xs mt-0.5">{prospects.length} prospectos seleccionados</p>
          </div>
          {!running && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {!running && !finished && (
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>Se enviará un aviso personalizado en Monday para cada uno de los <strong className="text-white">{prospects.length} prospectos</strong> visibles con los filtros actuales.</p>
              <p>Cada aviso incluye: nombre del prospecto, país, último contacto y estado.</p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-300 text-xs">
                ⚠️ Esta acción no se puede deshacer. Los vendedores recibirán una notificación por cada prospecto.
              </div>
            </div>
          )}

          {running && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">
                  {finished ? "Proceso completado" : "Enviando avisos…"}
                </span>
                <span className="text-white font-semibold">{done} / {prospects.length}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-green-400">✓ {done} enviados</span>
                {errors > 0 && <span className="text-red-400">✗ {errors} errores</span>}
              </div>
              {!finished && (
                <p className="text-xs text-slate-500">Enviando 1 por segundo para respetar los límites de Monday…</p>
              )}
            </div>
          )}

          {finished && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {done} avisos enviados correctamente{errors > 0 ? `, ${errors} con error` : ""}.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
          {!running && !finished && (
            <>
              <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSendAll}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
              >
                <SendHorizonal className="w-4 h-4" />
                Confirmar y enviar todos
              </button>
            </>
          )}
          {finished && (
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all">
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal de email IA ────────────────────────────────────────────────────────

type EmailModalState = { prospect: Prospect } | null;

function EmailModal({
  prospect,
  onClose,
}: {
  prospect: Prospect;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [genError, setGenError] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const res = await fetch("/api/ai/generate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospect: {
              name: prospect.name,
              country: prospect.country,
              category: prospect.category,
              status: prospect.status,
              lastContact: prospect.lastContact,
            },
            vendorName: prospect.seller,
          }),
        });
        const data = await res.json() as { subject?: string; body?: string; error?: string };
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Error al generar");
        setSubject(data.subject ?? "");
        setBody(data.body ?? "");
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

  const CC_SUPERVISOR = "jenni.benarroch@sicobenediciones.com";

  function handleApprove() {
    const mailto =
      `mailto:${encodeURIComponent(to)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&cc=${encodeURIComponent(CC_SUPERVISOR)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Email sugerido por IA
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Prospecto: {prospect.name} · {prospect.country}</p>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <RefreshCw className="w-4 h-4 text-purple-300 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium">Generando email personalizado…</p>
                <p className="text-slate-500 text-xs mt-1">Claude está redactando el borrador</p>
              </div>
            </div>
          )}

          {genError && !loading && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No se pudo generar el email</p>
                  <p className="text-xs mt-0.5 text-red-300/80">{genError}</p>
                  {genError.includes("ANTHROPIC_API_KEY") && (
                    <p className="text-xs mt-2 text-slate-400">
                      Agrega tu API key de Anthropic en{" "}
                      <code className="bg-slate-800 px-1 rounded text-purple-300">.env.local</code>{" "}
                      → <code className="bg-slate-800 px-1 rounded text-purple-300">ANTHROPIC_API_KEY=sk-ant-...</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && !genError && (
            <>
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Revisa y edita el borrador antes de aprobar. Ningún mensaje se envía sin tu aprobación explícita.</span>
              </div>

              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-blue-300 text-xs">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Al aprobar, se copiará automáticamente a{" "}
                  <strong className="text-blue-200">{CC_SUPERVISOR}</strong> en el correo.
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Para (email del prospecto)</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Asunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Cuerpo del email</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !genError && (
          <div className="flex items-center justify-between p-5 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Se abrirá tu cliente de correo pre-llenado para que tú lo envíes
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={!subject.trim() || !body.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Aprobar y abrir correo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel de cuota semanal por país ─────────────────────────────────────────

const QUOTA_PER_COUNTRY = 10;

function CountryQuotaPanel({ prospects }: { prospects: Prospect[] }) {
  const [open, setOpen] = useState(true);

  const { quotas, isLateInWeek } = useMemo(() => {
    const weekStart = startOfCurrentWeek();
    // day 4 = jueves → si ya es jueves o viernes, alertar por cuota incompleta
    const late = new Date().getDay() >= 4;
    const byCountry: Record<string, number> = {};

    for (const p of prospects) {
      const country = p.country?.trim() || "Sin país";
      if (!byCountry[country]) byCountry[country] = 0;
      const created = new Date(p.createdAt);
      if (!isNaN(created.getTime()) && created >= weekStart) {
        byCountry[country]++;
      }
    }

    const list = Object.entries(byCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => a.count - b.count); // primero los que tienen menos

    return { quotas: list, isLateInWeek: late };
  }, [prospects]);

  const reached = quotas.filter((q) => q.count >= QUOTA_PER_COUNTRY).length;
  const total = quotas.length;

  if (total === 0) return null;

  return (
    <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header del panel */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm">Cuota semanal por país</span>
          <span className="text-xs text-slate-500">5 prospectos nuevos / país / semana</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            reached === total
              ? "bg-green-500/15 text-green-400"
              : isLateInWeek
              ? "bg-red-500/15 text-red-400"
              : "bg-yellow-500/15 text-yellow-400"
          }`}>
            {reached} / {total} países
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Grid de países */}
      {open && (
        <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {quotas.map(({ country, count }) => {
            const pct = Math.min(100, Math.round((count / QUOTA_PER_COUNTRY) * 100));
            const done = count >= QUOTA_PER_COUNTRY;
            const warn = !done && isLateInWeek;
            return (
              <div
                key={country}
                className={`rounded-xl p-3 border ${
                  done
                    ? "border-green-500/30 bg-green-500/5"
                    : warn
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-slate-700/60 bg-slate-950"
                }`}
              >
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
                    {count}/{QUOTA_PER_COUNTRY}
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

// ── Página principal ─────────────────────────────────────────────────────────

type Props = {
  prospects: Prospect[];
  error: string;
  boardId: string;
};

export default function ProspeccionClient({ prospects, error, boardId }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterSeller, setFilterSeller] = useState("todos");
  const [modal, setModal] = useState<ModalState>(null);
  const [emailModal, setEmailModal] = useState<EmailModalState>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  // { id → fecha enviado } para esta sesión
  const [sent, setSent] = useState<Record<string, string>>({});

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
          <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-white font-semibold">Prospección Inteligente</h1>
            <p className="text-slate-500 text-xs">Módulo 1 · {prospects.length} prospectos</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
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
              onClick={() => window.location.reload()}
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
                { label: "Total prospectos",        value: stats.total,  dot: "bg-slate-500" },
                { label: "Contactados esta semana", value: stats.green,  dot: "bg-green-400" },
                { label: "Sin contacto reciente",   value: stats.yellow, dot: "bg-yellow-400" },
                { label: "Nunca contactados",        value: stats.red,    dot: "bg-red-500" },
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
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((p) => {
                    const health = contactHealth(p.lastContact);
                    const sentDate = sent[p.id];
                    return (
                      <tr key={p.id} className={`bg-slate-950 hover:bg-slate-900/50 transition-colors ${ROW_CLS[health]}`}>
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
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(p.status)}`}>
                              {p.status}
                            </span>
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{p.seller || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden xl:table-cell">{p.lastContact || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden xl:table-cell">{p.nextContact || "—"}</td>
                        <td className="px-5 py-3.5">
                          {sentDate ? (
                            <span className="flex items-center gap-1.5 text-xs text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {sentDate}
                            </span>
                          ) : (
                            <button
                              onClick={() => setModal({ prospect: p })}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-500 px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              <Send className="w-3 h-3" />
                              Notificar
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <button
                            onClick={() => setEmailModal({ prospect: p })}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 border border-slate-700 hover:border-purple-500 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <Mail className="w-3 h-3" />
                            Generar email
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
    </>
  );
}
