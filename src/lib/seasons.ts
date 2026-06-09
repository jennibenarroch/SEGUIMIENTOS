type SeasonDef = {
  name: string;
  nameEn: string;
  saleMonths: number[];   // meses de ventas fuertes (1=enero, 12=diciembre)
  prepMonths: number[];   // meses ideales para proponer/preparar
};

// Calendario comercial base — aplica a toda Latinoamérica y el Caribe
const SEASONS: SeasonDef[] = [
  {
    name: "Regreso a Clases (1er semestre)",
    nameEn: "Back to School (1st semester)",
    saleMonths: [1, 2],
    prepMonths: [11, 12],
  },
  {
    name: "Semana Santa / Pascua",
    nameEn: "Easter / Holy Week",
    saleMonths: [3, 4],
    prepMonths: [2, 3],
  },
  {
    name: "Día de la Madre",
    nameEn: "Mother's Day",
    saleMonths: [5],
    prepMonths: [4],
  },
  {
    name: "Verano / Vacaciones de Medio Año",
    nameEn: "Summer / Mid-Year Vacation",
    saleMonths: [6, 7],
    prepMonths: [5, 6],
  },
  {
    name: "Regreso a Clases (2do semestre)",
    nameEn: "Back to School (2nd semester)",
    saleMonths: [7, 8],
    prepMonths: [6, 7],
  },
  {
    name: "Halloween",
    nameEn: "Halloween",
    saleMonths: [10],
    prepMonths: [9, 10],
  },
  {
    name: "Black Friday",
    nameEn: "Black Friday",
    saleMonths: [11],
    prepMonths: [10],
  },
  {
    name: "Navidad / Fin de Año",
    nameEn: "Christmas / New Year",
    saleMonths: [11, 12],
    prepMonths: [10, 11],
  },
];

const CARIBE_INGLES = [
  "barbados", "jamaica", "trinidad", "trinidad y tobago",
  "caribe ingles", "caribe inglés", "caribbean",
];

function isAnglophone(country: string): boolean {
  const c = country.toLowerCase();
  return CARIBE_INGLES.some((k) => c.includes(k));
}

export type ActiveSeason = {
  name: string;
  status: "activa" | "preparacion" | "proxima";
  detail: string;
};

export function getActiveSeasons(country: string, date: Date = new Date()): ActiveSeason[] {
  const eng = isAnglophone(country);
  const month = date.getMonth() + 1; // 1–12
  const nextMonth = month === 12 ? 1 : month + 1;
  const monthAfter = nextMonth === 12 ? 1 : nextMonth + 1;

  const results: ActiveSeason[] = [];

  for (const s of SEASONS) {
    const label = eng ? s.nameEn : s.name;

    if (s.saleMonths.includes(month)) {
      results.push({
        name: label,
        status: "activa",
        detail: eng
          ? `Currently in peak sales season (${label}). Proposals should highlight seasonal themes.`
          : `Temporada activa ahora (${label}). Las propuestas deben incluir temática de temporada.`,
      });
    } else if (s.prepMonths.includes(month)) {
      results.push({
        name: label,
        status: "preparacion",
        detail: eng
          ? `Ideal preparation window for ${label} — the right time to propose seasonal displays and bundles.`
          : `Ventana ideal de preparación para ${label} — momento perfecto para proponer exhibidores y paquetes de temporada.`,
      });
    } else if (s.prepMonths.includes(nextMonth) || s.prepMonths.includes(monthAfter)) {
      results.push({
        name: label,
        status: "proxima",
        detail: eng
          ? `${label} is coming up in 1–2 months. Start conversations about seasonal planning now.`
          : `${label} llega en 1–2 meses. Buen momento para iniciar conversaciones de planificación.`,
      });
    }
  }

  return results;
}

export function getSeasonContext(country: string, date: Date = new Date()): string {
  const eng = isAnglophone(country);
  const seasons = getActiveSeasons(country, date);

  if (seasons.length === 0) {
    return eng
      ? "No major commercial season active right now, but evergreen products (coloring books, activity books) sell year-round."
      : "No hay temporada comercial mayor activa en este momento, pero los productos evergreen (libros de colorear, actividades) venden todo el año.";
  }

  const header = eng
    ? `SEASONAL CONTEXT FOR ${country.toUpperCase()}:`
    : `TEMPORADAS COMERCIALES PARA ${country.toUpperCase()}:`;

  const lines = seasons.map((s) => {
    const badge =
      s.status === "activa"      ? (eng ? "🔴 ACTIVE NOW"    : "🔴 ACTIVA AHORA") :
      s.status === "preparacion" ? (eng ? "🟡 PREP WINDOW"   : "🟡 EN PREPARACIÓN") :
                                   (eng ? "🔵 UPCOMING"      : "🔵 PRÓXIMA");
    return `- ${badge}: ${s.name} — ${s.detail}`;
  });

  const footer = eng
    ? "Use the most relevant season(s) above to tailor the proposal to this client's buying calendar."
    : "Usa la(s) temporada(s) más relevantes para personalizar la propuesta al calendario de compra de este cliente.";

  return [header, ...lines, footer].join("\n");
}
