"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, ChevronDown } from "lucide-react";

type CookiePrefs = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
};

const STORAGE_KEY = "salesai_cookie_consent";

function loadPrefs(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePrefs;
  } catch {
    return null;
  }
}

function savePrefs(analytics: boolean, marketing: boolean) {
  const prefs: CookiePrefs = {
    necessary: true,
    analytics,
    marketing,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-blue-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  );
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!loadPrefs()) setVisible(true);
  }, []);

  if (!visible) return null;

  function acceptAll() {
    savePrefs(true, true);
    setVisible(false);
  }

  function rejectAll() {
    savePrefs(false, false);
    setVisible(false);
  }

  function saveCustom() {
    savePrefs(analytics, marketing);
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/97 backdrop-blur-sm border-t border-slate-700/80 shadow-2xl">
      <div className="max-w-screen-xl mx-auto px-5 py-5">

        {!showCustomize ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Cookie className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-white font-semibold text-sm">Usamos cookies</p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Usamos cookies propias y de terceros para mejorar la experiencia y analizar el uso del sitio.
                Consulta nuestra{" "}
                <Link href="/privacidad" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                  Política de Privacidad
                </Link>{" "}
                y{" "}
                <Link href="/cookies" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                  Política de Cookies
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
              <button
                onClick={rejectAll}
                className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
              >
                Rechazar
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
              >
                Personalizar <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-blue-400" />
                <p className="text-white font-semibold text-sm">Personalizar cookies</p>
              </div>
              <button
                onClick={() => setShowCustomize(false)}
                className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-2 mb-5">
              {/* Necessary */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold">Necesarias</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">Esenciales para el funcionamiento del sitio. No se pueden desactivar.</p>
                </div>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                  Siempre activas
                </span>
              </div>

              {/* Analytics */}
              <div
                onClick={() => setAnalytics((v) => !v)}
                className="flex items-center justify-between gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold">Analítica</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">Nos ayudan a entender cómo se usa el sitio para mejorarlo.</p>
                </div>
                <Toggle checked={analytics} onChange={() => setAnalytics((v) => !v)} />
              </div>

              {/* Marketing */}
              <div
                onClick={() => setMarketing((v) => !v)}
                className="flex items-center justify-between gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold">Marketing</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">Permiten mostrar publicidad personalizada según tu actividad.</p>
                </div>
                <Toggle checked={marketing} onChange={() => setMarketing((v) => !v)} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Link
                href="/cookies"
                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors hidden sm:block"
              >
                Ver todas las cookies que usamos
              </Link>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={rejectAll}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
                >
                  Rechazar todas
                </button>
                <button
                  onClick={saveCustom}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all"
                >
                  Guardar preferencias
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
