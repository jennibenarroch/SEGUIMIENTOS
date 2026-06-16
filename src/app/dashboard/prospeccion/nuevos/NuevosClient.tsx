"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, CheckCircle, Plus, Globe, Tag,
  MessageCircle, Mail, Calendar, Users,
} from "lucide-react";
import type { SuggestedProspect } from "@/lib/mock-data";
import { COUNTRY_FLAG } from "@/lib/countries";

const CAT_COLOR: Record<string, string> = {
  "Snacks & Confitería":        "bg-amber-500/15 text-amber-300",
  "Bebidas & Snacks":           "bg-sky-500/15 text-sky-300",
  Confitería:                   "bg-pink-500/15 text-pink-300",
  "Limpieza del Hogar":         "bg-teal-500/15 text-teal-300",
  "Bebidas & Confitería":       "bg-indigo-500/15 text-indigo-300",
  "Snacks & Limpieza del Hogar":"bg-lime-500/15 text-lime-300",
  "Cuidado Personal":           "bg-rose-500/15 text-rose-300",
  "Confitería & Snacks":        "bg-orange-500/15 text-orange-300",
  "Snacks & Bebidas":           "bg-cyan-500/15 text-cyan-300",
  "Bebidas & Limpieza del Hogar":"bg-emerald-500/15 text-emerald-300",
};
function catColor(c: string) {
  return CAT_COLOR[c] ?? "bg-slate-700/50 text-slate-400";
}

export default function NuevosClient({
  prospects,
  semana,
  meta,
}: {
  prospects: SuggestedProspect[];
  semana: string;
  meta: number;
}) {
  const [agregados, setAgregados] = useState<Set<string>>(new Set());

  function toggleAgregar(id: string) {
    setAgregados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const total = prospects.length;
  const pct = Math.round((agregados.size / meta) * 100);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/prospeccion" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold">Prospectos Nuevos IA</h1>
            <p className="text-slate-500 text-xs">Semana {semana} · {total} sugerencias</p>
          </div>
        </div>

        {/* Cuota semanal */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Cuota semanal</span>
            <span className={`text-sm font-bold ${agregados.size >= meta ? "text-green-400" : "text-white"}`}>
              {agregados.size}/{meta}
            </span>
            {agregados.size >= meta && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                {agregados.size === 0
                  ? "Agrega prospectos al pipeline para completar tu cuota"
                  : agregados.size >= meta
                  ? "¡Cuota semanal completada!"
                  : `${meta - agregados.size} prospectos más para completar la cuota`}
              </span>
            </div>
            <span className={`text-xs font-semibold ${agregados.size >= meta ? "text-green-400" : "text-slate-400"}`}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${agregados.size >= meta ? "bg-green-500" : "bg-violet-500"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {/* Cabecera de la lista */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <p className="text-xs text-slate-500">
            Sugeridos por IA basándose en el ICP · Aprueba los que quieras agregar al pipeline
          </p>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {prospects.map((p) => {
            const added = agregados.has(p.id);
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-5 transition-all ${
                  added
                    ? "bg-green-500/5 border-green-500/30"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji país */}
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
                    {COUNTRY_FLAG[p.country] ?? "🌍"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Nombre + badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      {p.idioma === "en" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium">EN</span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Globe className="w-3 h-3" />
                        {p.country}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${catColor(p.category)}`}>
                        <Tag className="w-3 h-3" />
                        {p.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        {p.canal === "WhatsApp"
                          ? <MessageCircle className="w-3 h-3 text-green-400" />
                          : <Mail className="w-3 h-3 text-blue-400" />}
                        Primer contacto por {p.canal}
                      </span>
                    </div>

                    {/* Razón IA */}
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                      <span className="text-violet-400 font-medium">IA · </span>
                      {p.razon}
                    </p>

                    {/* Contacto sugerido */}
                    <p className="text-xs text-slate-500">
                      Contacto objetivo: <span className="text-slate-400">{p.contactoCargo}</span>
                    </p>
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => toggleAgregar(p.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                      added
                        ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                        : "bg-violet-600 hover:bg-violet-500 text-white"
                    }`}
                    title={added ? "Quitar del pipeline" : "Agregar al pipeline"}
                  >
                    {added ? (
                      <><CheckCircle className="w-3.5 h-3.5" /> Agregado</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> Agregar</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Los prospectos se actualizan cada lunes · Próxima tanda: 16 jun 2026
        </p>
      </main>
    </div>
  );
}
