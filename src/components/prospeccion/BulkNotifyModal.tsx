"use client";

import { useState } from "react";
import { X, CheckCircle, SendHorizonal, RefreshCw } from "lucide-react";
import type { Prospect } from "@/lib/types";

export default function BulkNotifyModal({
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
                <span className="text-slate-300">{finished ? "Proceso completado" : "Enviando avisos…"}</span>
                <span className="text-white font-semibold">{done} / {prospects.length}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${pct}%` }} />
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
