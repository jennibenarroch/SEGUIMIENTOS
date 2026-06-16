"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, RefreshCw, Sparkles, Mail, CheckCircle } from "lucide-react";
import type { Prospect } from "@/lib/types";
import { getSellerByName } from "@/lib/sellers";

export default function EmailModal({
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

  const supervisorEmail = process.env.NEXT_PUBLIC_SUPERVISOR_EMAIL ?? "";
  const managerEmail = process.env.NEXT_PUBLIC_MANAGER_EMAIL ?? "";
  const sellerEmail = getSellerByName(prospect.seller ?? "")?.email ?? "";

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
              contactPerson: prospect.contactPerson,
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

  function handleApprove() {
    const ccList = [...new Set([supervisorEmail, managerEmail, sellerEmail].filter(Boolean))].join(",");
    const mailto =
      `mailto:${encodeURIComponent(to)}` +
      `?subject=${encodeURIComponent(subject)}` +
      (ccList ? `&cc=${encodeURIComponent(ccList)}` : "") +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
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
          )}

          {!loading && !genError && (
            <>
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Revisa y edita el borrador antes de aprobar. Ningún mensaje se envía sin tu aprobación explícita.</span>
              </div>

              {(supervisorEmail || managerEmail || sellerEmail) && (
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-blue-300 text-xs">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Al aprobar, se copiará automáticamente a{" "}
                    {[...new Set([supervisorEmail, managerEmail, sellerEmail].filter(Boolean))].map((email, i, arr) => (
                      <span key={email}>
                        <strong className="text-blue-200">{email}</strong>
                        {i < arr.length - 1 ? " · " : ""}
                      </span>
                    ))}.
                  </span>
                </div>
              )}

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

        {!loading && !genError && (
          <div className="flex items-center justify-between p-5 border-t border-slate-800">
            <p className="text-xs text-slate-500">Se abrirá tu cliente de correo pre-llenado para que tú lo envíes</p>
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
