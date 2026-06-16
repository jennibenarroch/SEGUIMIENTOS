"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, RefreshCw, TrendingUp, MessageSquare, Mail, MessageCircle, Phone, Zap } from "lucide-react";
import type { Deal } from "@/lib/types";
import type { Strategy } from "@/app/api/ai/generate-deal-strategies/route";

const URGENCIA_STYLE: Record<string, { bar: string; badge: string; badgeText: string }> = {
  alta:  { bar: "bg-red-500",    badge: "bg-red-500/15 border-red-500/30",       badgeText: "text-red-400" },
  media: { bar: "bg-yellow-400", badge: "bg-yellow-500/15 border-yellow-500/30", badgeText: "text-yellow-400" },
  baja:  { bar: "bg-blue-500",   badge: "bg-blue-500/15 border-blue-500/30",     badgeText: "text-blue-400" },
};

const CANAL_ICON: Record<string, React.ReactNode> = {
  email:    <Mail className="w-3 h-3" />,
  whatsapp: <MessageCircle className="w-3 h-3" />,
  llamada:  <Phone className="w-3 h-3" />,
};

const CANAL_LABEL: Record<string, string> = {
  email: "Email", whatsapp: "WhatsApp", llamada: "Llamada",
};

export default function DealStrategiesModal({
  deal,
  onClose,
  onUseStrategy,
}: {
  deal: Deal;
  onClose: () => void;
  onUseStrategy: (strategy: Strategy, channel: "email" | "whatsapp") => void;
}) {
  const [loading, setLoading] = useState(true);
  const [genError, setGenError] = useState("");
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const res = await fetch("/api/ai/generate-deal-strategies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deal: {
              name: deal.name, country: deal.country, category: deal.category,
              fase: deal.fase, contactPerson: deal.contactPerson,
              buyerPerson: deal.buyerPerson, lastContact: deal.lastContact,
              nextAction: deal.nextAction, targetMonth: deal.targetMonth,
              targetValue: deal.targetValue, lastNotes: deal.lastNotes,
              vendor: deal.vendor,
            },
          }),
        });
        const data = await res.json() as { strategies?: Strategy[]; error?: string };
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Error al generar");
        setStrategies(data.strategies ?? []);
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

        <div className="flex items-start justify-between p-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Diagnóstico de venta
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {deal.name} · {deal.country}
              {deal.fase && <span className="ml-1">· {deal.fase}</span>}
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
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <RefreshCw className="w-4 h-4 text-orange-300 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <p className="text-white text-sm font-medium">Analizando por qué no está comprando…</p>
              <p className="text-slate-500 text-xs">Claude está revisando el historial y el contexto del deal</p>
            </div>
          )}

          {genError && !loading && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>{genError}</p>
            </div>
          )}

          {!loading && !genError && strategies.length > 0 && (
            <div className="space-y-5">
              <p className="text-xs text-slate-500">
                Claude identificó <span className="text-white font-medium">{strategies.length} hipótesis</span> sobre por qué no está comprando. Elige una para generar el mensaje.
              </p>

              {strategies.map((s, i) => {
                const urg = URGENCIA_STYLE[s.urgencia] ?? URGENCIA_STYLE.baja;
                const canalLabel = CANAL_LABEL[s.canal] ?? s.canal;
                const canalIcon = CANAL_ICON[s.canal];
                const isCanalSendable = s.canal === "email" || s.canal === "whatsapp";

                return (
                  <div key={i} className="rounded-xl border border-slate-700/60 bg-slate-950 overflow-hidden">
                    <div className={`h-1 ${urg.bar}`} />
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                        <h3 className="text-white font-semibold text-sm">{s.titulo}</h3>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${urg.badge} ${urg.badgeText}`}>
                          Urgencia {s.urgencia}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                          {canalIcon} {canalLabel}
                        </span>
                      </div>

                      <div className="bg-slate-900/70 border border-slate-700/50 rounded-lg px-3 py-2.5">
                        <p className="text-xs text-slate-500 mb-0.5 font-medium uppercase tracking-wide">Por qué no está comprando</p>
                        <p className="text-sm text-slate-300">{s.hipotesis}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Qué hacer</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{s.enfoque}</p>
                      </div>

                      {s.puntosClave.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {s.puntosClave.map((pt) => (
                            <span key={pt} className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                              <Zap className="w-2.5 h-2.5 text-yellow-500" />{pt}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-1 flex-wrap">
                        {isCanalSendable ? (
                          <button
                            onClick={() => { onUseStrategy(s, s.canal as "email" | "whatsapp"); onClose(); }}
                            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Generar {canalLabel} con este enfoque
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => { onUseStrategy(s, "email"); onClose(); }}
                              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Generar email
                            </button>
                            <button
                              onClick={() => { onUseStrategy(s, "whatsapp"); onClose(); }}
                              className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Generar WhatsApp
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && (
          <div className="flex justify-end p-5 border-t border-slate-800 flex-shrink-0">
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
