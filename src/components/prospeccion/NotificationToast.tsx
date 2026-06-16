"use client";

import { CheckCircle, ExternalLink, X } from "lucide-react";

export type Toast = {
  key: number;
  id: string;
  name: string;
  seller: string;
  mondayUrl: string;
};

export default function NotificationToast({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  return (
    <div className="w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden pointer-events-auto">
      <div className="h-1 bg-green-500 w-full" />
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-wide">Contacto efectivo</p>
          <p className="text-white text-sm font-medium mt-0.5 truncate">{toast.name}</p>
          {toast.seller && (
            <p className="text-slate-500 text-xs mt-0.5">Vendedor: {toast.seller}</p>
          )}
          <a
            href={toast.mondayUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium mt-2 transition-colors"
          >
            Ver respuesta en Monday
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
