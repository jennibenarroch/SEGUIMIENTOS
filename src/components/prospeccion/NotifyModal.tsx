"use client";

import { useState } from "react";
import { X, AlertCircle, RefreshCw, Send } from "lucide-react";
import type { Prospect } from "@/lib/types";

export default function NotifyModal({
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
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-white font-semibold">Notificar al vendedor</h2>
            <p className="text-slate-400 text-xs mt-0.5">{prospect.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <div className="flex items-center justify-between p-5 border-t border-slate-800">
          <p className="text-xs text-slate-500">Se publicará en la actividad del deal en Monday</p>
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
              {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Enviando…" : "Enviar aviso"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
