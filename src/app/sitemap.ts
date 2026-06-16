import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://salesai.sicobenediciones.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/aviso-legal`,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/privacidad`,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terminos`,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/cookies`,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
