import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// ── Cliente público ───────────────────────────────────────────────────────────
// Seguro para componentes cliente ("use client") y Server Components.
// Permisos acotados por las Row Level Security policies del proyecto.

export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

// ── Cliente de servidor (admin) ───────────────────────────────────────────────
// Solo para Server Components, Route Handlers y Server Actions.
// Bypasea Row Level Security — NUNCA importar desde componentes "use client".

export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY no está configurado. " +
      "Este cliente solo puede usarse en el servidor.",
    );
  }
  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
