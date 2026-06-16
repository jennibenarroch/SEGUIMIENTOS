"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, RefreshCw, Lightbulb, Tag, Presentation } from "lucide-react";
import type { Deal } from "@/lib/types";

export type Idea = {
  titulo: string;
  tipo: string;
  descripcion: string;
  licencias: string[];
  argumento: string;
};

const TIPO_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "Exhibidor":           { bg: "bg-blue-500/10",   text: "text-blue-300",   border: "border-blue-500/30" },
  "Activación":          { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/30" },
  "Temporada":           { bg: "bg-pink-500/10",   text: "text-pink-300",   border: "border-pink-500/30" },
  "Bundle":              { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30" },
  "Lanzamiento":         { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/30" },
  "Cross Merchandising": { bg: "bg-teal-500/10",   text: "text-teal-300",   border: "border-teal-500/30" },
};
function tipoStyle(tipo: string) {
  return TIPO_STYLE[tipo] ?? { bg: "bg-slate-700/40", text: "text-slate-300", border: "border-slate-600/40" };
}

export default function DealIdeasModal({
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

  const overdue = (() => {
    if (!deal.nextAction) return false;
    const d = new Date(deal.nextAction);
    return !isNaN(d.getTime()) && d < new Date();
  })();

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
                      <p className="text-xs text-slate-300 italic">&quot;{idea.argumento}&quot;</p>
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
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
