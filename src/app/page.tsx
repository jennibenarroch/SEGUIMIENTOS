"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SalesAI</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-5 py-4 text-base outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
          >
            Entrar
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
