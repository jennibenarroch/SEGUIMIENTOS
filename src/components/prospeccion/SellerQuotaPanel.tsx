"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Prospect } from "@/lib/types";
import { SELLERS_CONFIG } from "@/lib/sellers";

export const SELLERS = SELLERS_CONFIG.map((s) => s.name);

const AVATAR_COLOR: Record<string, string> = Object.fromEntries(
  SELLERS_CONFIG.map((s) => [s.name, s.avatarColor])
);

const BAR_COLOR: Record<string, string> = Object.fromEntries(
  SELLERS_CONFIG.map((s) => [s.name, s.barColor])
);

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function SellerQuotaPanel({ prospects }: { prospects: Prospect[] }) {
  const [open, setOpen] = useState(true);

  const stats = useMemo(() => {
    const withContact: Record<string, number> = {};
    const total: Record<string, number> = {};

    for (const p of prospects) {
      const seller = p.seller?.trim();
      if (!seller) continue;
      total[seller] = (total[seller] ?? 0) + 1;
      if (p.lastContact && p.lastContact !== "—") {
        withContact[seller] = (withContact[seller] ?? 0) + 1;
      }
    }

    const totalAll = prospects.filter((p) => p.lastContact && p.lastContact !== "—").length;

    return SELLERS.map((name) => ({
      seller: name,
      seguimientos: withContact[name] ?? 0,
      total: total[name] ?? 0,
      totalAll,
    }));
  }, [prospects]);

  const maxSeg = Math.max(...stats.map((s) => s.seguimientos), 1);
  const totalSeguimientos = stats.reduce((sum, s) => sum + s.seguimientos, 0);

  return (
    <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm">Seguimientos por vendedor</span>
          <span className="text-xs text-slate-500">prospectos con contacto previo registrado</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
            {totalSeguimientos} seguimientos activos
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.map(({ seller, seguimientos, total }) => {
            const pct = Math.round((seguimientos / maxSeg) * 100);
            const avatarCls = AVATAR_COLOR[seller] ?? "bg-slate-700 text-slate-300";
            const barCls = BAR_COLOR[seller] ?? "bg-blue-500";
            return (
              <Link
                key={seller}
                href={`/dashboard/prospeccion/vendedor/${encodeURIComponent(seller)}`}
                className="rounded-xl p-4 border border-slate-700/60 bg-slate-950 hover:border-slate-600 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarCls}`}>
                    {initials(seller)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{seller}</p>
                    <p className="text-xs text-slate-500">{total} prospectos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${barCls}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-slate-300">
                    {seguimientos}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5">con contacto previo</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
