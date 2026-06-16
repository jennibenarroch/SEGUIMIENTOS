export function safeError(err: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return err instanceof Error ? err.message : "Error desconocido";
  }
  console.error(err);
  return "Error interno del servidor";
}
