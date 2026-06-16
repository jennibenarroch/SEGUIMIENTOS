"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, RefreshCw, Presentation, Printer } from "lucide-react";
import type { Deal } from "@/lib/types";
import type { Presentation as PresentationType, Slide } from "@/app/api/ai/generate-presentation/route";
import type { Idea } from "./DealIdeasModal";

const SLIDE_ACCENT = [
  "border-blue-500/40 bg-blue-500/5",
  "border-indigo-500/40 bg-indigo-500/5",
  "border-violet-500/40 bg-violet-500/5",
  "border-purple-500/40 bg-purple-500/5",
  "border-pink-500/40 bg-pink-500/5",
];

export default function PresentationModal({
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
