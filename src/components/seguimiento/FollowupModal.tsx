"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, RefreshCw, CheckCircle, Mail, MessageCircle, Send, Copy, TrendingUp, MessageSquare } from "lucide-react";
import type { Deal } from "@/lib/types";
import type { Strategy } from "@/app/api/ai/generate-deal-strategies/route";

type FollowupStage = "loading" | "review" | "sending" | "success";

export default function FollowupModal({
  deal,
  strategy,
  initialChannel = "email",
  onClose,
}: {
  deal: Deal;
  strategy?: Strategy;
  initialChannel?: "email" | "whatsapp";
  onClose: () => void;
}) {
  const [channel, setChannel] = useState<"email" | "whatsapp">(initialChannel);
  const [stage, setStage] = useState<FollowupStage>("loading");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [genError, setGenError] = useState("");
  const [sendError, setSendError] = useState("");

  const emailTo = deal.email || deal.email1;
  const isLocked = stage === "loading" || stage === "sending";

  const generate = useCallback(
    async (ch: "email" | "whatsapp") => {
      setStage("loading");
      setGenError("");
      try {
        const res = await fetch("/api/ai/generate-followup-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deal: {
              name: deal.name, country: deal.country, category: deal.category,
              fase: deal.fase, contactPerson: deal.contactPerson,
              buyerPerson: deal.buyerPerson, lastContact: deal.lastContact,
              nextAction: deal.nextAction, targetMonth: deal.targetMonth,
              targetValue: deal.targetValue, lastNotes: deal.lastNotes,
            },
            vendorName: deal.vendor,
            channel: ch,
            strategy: strategy
              ? {
                  titulo: strategy.titulo,
                  hipotesis: strategy.hipotesis,
                  enfoque: strategy.enfoque,
                  puntosClave: strategy.puntosClave,
                }
              : undefined,
          }),
        });
        const data = await res.json() as { subject?: string; body?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Error al generar");
        setSubject(data.subject ?? "");
        setBody(data.body ?? "");
        setStage("review");
      } catch (e) {
        setGenError(e instanceof Error ? e.message : "Error desconocido");
        setStage("review");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => { generate("email"); }, [generate]);

  function switchChannel(ch: "email" | "whatsapp") {
    if (ch === channel || isLocked) return;
    setChannel(ch);
    generate(ch);
  }

  async function handleSend() {
    setSendError("");
    setStage("sending");
    try {
      const res = await fetch("/api/deals/send-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id, dealName: deal.name,
          emailTo: channel === "email" ? emailTo : undefined,
          subject: subject || "Seguimiento", body, channel,
          vendor: deal.vendor,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setStage("success");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Error al enviar");
      setStage("review");
    }
  }

  async function handleCopyWA() {
    try {
      await navigator.clipboard.writeText(body);
      fetch("/api/deals/send-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id, dealName: deal.name,
          subject: "Mensaje WhatsApp preparado", body,
          channel: "whatsapp", vendor: deal.vendor,
        }),
      }).catch(() => null);
      setStage("success");
    } catch {
      setSendError("No se pudo copiar al portapapeles");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isLocked ? undefined : onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-start justify-between p-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Generar seguimiento
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {deal.name} · {deal.country}
              {deal.contactPerson && <span className="ml-1">· {deal.contactPerson}</span>}
            </p>
            {strategy && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">
                <TrendingUp className="w-2.5 h-2.5" />
                Enfoque: {strategy.titulo}
              </span>
            )}
          </div>
          {!isLocked && stage !== "success" && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {stage !== "success" && (
          <div className="flex gap-2 px-5 pt-4 flex-shrink-0">
            <button
              onClick={() => switchChannel("email")}
              disabled={isLocked}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                channel === "email" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              onClick={() => switchChannel("whatsapp")}
              disabled={isLocked}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                channel === "whatsapp" ? "bg-green-700 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">
          {isLocked && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className={`w-6 h-6 animate-spin ${channel === "email" ? "text-blue-400" : "text-green-400"}`} />
              <p className="text-white text-sm font-medium">
                {stage === "loading"
                  ? `Redactando ${channel === "email" ? "email" : "mensaje WhatsApp"}…`
                  : "Enviando…"}
              </p>
              <p className="text-slate-500 text-xs">Claude está analizando el contexto del deal</p>
            </div>
          )}

          {stage === "review" && genError && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>{genError}</p>
            </div>
          )}

          {stage === "review" && !genError && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
                Revisa y edita el borrador. Ningún mensaje se envía sin tu aprobación explícita.
              </p>

              {channel === "email" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Asunto</label>
                  <input
                    type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                    placeholder="Asunto del email"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  {channel === "email" ? "Mensaje" : "Mensaje WhatsApp"}
                </label>
                <textarea
                  value={body} onChange={(e) => setBody(e.target.value)}
                  rows={channel === "email" ? 10 : 5}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none"
                  placeholder="El mensaje aparecerá aquí…"
                />
              </div>

              {channel === "email" && emailTo && (
                <p className="text-xs text-slate-500">
                  Se enviará a: <span className="text-slate-300">{emailTo}</span>
                  {process.env.NEXT_PUBLIC_SUPERVISOR_EMAIL && (
                    <span className="ml-2 text-slate-600">· CC: {process.env.NEXT_PUBLIC_SUPERVISOR_EMAIL}</span>
                  )}
                </p>
              )}
              {channel === "email" && !emailTo && (
                <p className="text-xs text-amber-400">
                  No hay email registrado para este deal. Puedes agregar uno en Monday o copiar el mensaje manualmente.
                </p>
              )}

              {sendError && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>{sendError}</p>
                </div>
              )}
            </div>
          )}

          {stage === "success" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">
                  {channel === "email" ? "Email enviado ✓" : "Copiado al portapapeles ✓"}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {channel === "email"
                    ? `Enviado a ${emailTo}${/^\d+$/.test(deal.id) ? " · Registrado en Monday" : ""}`
                    : `Listo para enviar por WhatsApp${/^\d+$/.test(deal.id) ? " · Registrado en Monday" : ""}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {stage === "review" && !genError && (
          <div className="flex justify-between items-center p-5 border-t border-slate-800 flex-shrink-0">
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
              Cancelar
            </button>
            {channel === "email" ? (
              <button
                onClick={handleSend}
                disabled={!body.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {emailTo ? "Aprobar y enviar email" : "Solo registrar en Monday"}
              </button>
            ) : (
              <button
                onClick={handleCopyWA}
                disabled={!body.trim()}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                Copiar para WhatsApp
              </button>
            )}
          </div>
        )}

        {stage === "success" && (
          <div className="flex justify-center p-5 border-t border-slate-800 flex-shrink-0">
            <button onClick={onClose} className="text-sm text-white bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg transition-colors">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
