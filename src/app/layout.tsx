import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesAI — Prospección, Seguimiento y Propuestas con IA",
  description:
    "Sistema de asistencia de ventas B2B con IA. Centraliza prospección, seguimiento multicanal y propuestas creativas desde Monday CRM. La IA redacta; tú apruebas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
