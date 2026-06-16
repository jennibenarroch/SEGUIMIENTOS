import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://salesai.sicobenediciones.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SalesAI — Asistente de Ventas B2B con IA",
    template: "%s · SalesAI",
  },
  description:
    "Sistema de asistencia de ventas B2B con IA para equipos pequeños. Centraliza prospección, seguimiento multicanal y propuestas creativas desde Monday CRM.",
  keywords: ["ventas B2B", "CRM", "inteligencia artificial ventas", "prospección", "seguimiento comercial", "Monday CRM", "Sicoben"],
  authors: [{ name: "Sicoben Ediciones", url: "https://sicobenediciones.com" }],
  creator: "Sicoben Ediciones",
  publisher: "Sicoben Ediciones",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
    languages: { "es-PA": "/" },
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "SalesAI",
    locale: "es_PA",
    title: "SalesAI — Asistente de Ventas B2B con IA",
    description:
      "Centraliza prospección, seguimiento multicanal y propuestas creativas con IA desde Monday CRM. La IA redacta; el vendedor aprueba.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SalesAI — Asistente de Ventas B2B con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SalesAI — Asistente de Ventas B2B con IA",
    description:
      "Centraliza prospección, seguimiento multicanal y propuestas creativas con IA desde Monday CRM.",
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "Sicoben Ediciones",
      url: "https://sicobenediciones.com",
      email: "jenni.benarroch@sicobenediciones.com",
      foundingLocation: { "@type": "Country", name: "Panamá" },
    },
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#webapp`,
      name: "SalesAI",
      url: APP_URL,
      description:
        "Sistema de asistencia de ventas B2B con IA. Gestiona prospección, seguimiento multicanal y propuestas creativas desde Monday CRM.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      offers: { "@type": "Offer", availability: "https://schema.org/InStoreOnly" },
      provider: { "@id": `${APP_URL}/#organization` },
      featureList: [
        "Prospección inteligente con IA",
        "Seguimiento multicanal WhatsApp / Email / Llamada",
        "Propuestas creativas PPTX y PDF",
        "Retención de clientes activos con ciclos A/B/C",
        "Alertas de viaje por país con Kit de Viaje automático",
        "Informes semanales automáticos los lunes a las 7 AM",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
