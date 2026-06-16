"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SELLERS = ["Jenni", "Orlando", "Omar", "Joaquin", "John", "Daniel"];

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !password) {
      setError("Selecciona tu nombre e ingresa la contraseña.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = (await res.json()) as { ok?: boolean; error?: string };

    if (data.ok) {
      router.push("/dashboard");
    } else {
      setError(data.error ?? "Contraseña incorrecta.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Sicoben" width={120} height={40} className="h-10 w-auto" onError={() => {}} />
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <h1 className="text-white text-2xl font-semibold mb-1">Bienvenido</h1>
          <p className="text-white/40 text-sm mb-6">Acceso exclusivo para el equipo Sicoben</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5">Tu nombre</label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 appearance-none"
              >
                <option value="" className="bg-[#111]">Selecciona tu nombre</option>
                {SELLERS.map((s) => (
                  <option key={s} value={s} className="bg-[#111]">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">
          SalesAI · Sicoben Ediciones
        </p>
      </div>
    </div>
  );
}
