export type Country = {
  name: string;
  flag: string;
  region: "mexico" | "centroamerica" | "sudamerica" | "caribe_hispano" | "caribe_anglofono" | "territorio";
  idioma: "es" | "en" | "fr" | "nl" | "pt";
};

export const LATAM_COUNTRIES: Country[] = [
  { name: "Antigua y Barbuda",             flag: "🇦🇬", region: "caribe_anglofono",   idioma: "en" },
  { name: "Argentina",                     flag: "🇦🇷", region: "sudamerica",         idioma: "es" },
  { name: "Aruba",                         flag: "🇦🇼", region: "territorio",         idioma: "nl" },
  { name: "Bahamas",                       flag: "🇧🇸", region: "caribe_anglofono",   idioma: "en" },
  { name: "Barbados",                      flag: "🇧🇧", region: "caribe_anglofono",   idioma: "en" },
  { name: "Belize",                        flag: "🇧🇿", region: "centroamerica",      idioma: "en" },
  { name: "Bolivia",                       flag: "🇧🇴", region: "sudamerica",         idioma: "es" },
  { name: "Chile",                         flag: "🇨🇱", region: "sudamerica",         idioma: "es" },
  { name: "Colombia",                      flag: "🇨🇴", region: "sudamerica",         idioma: "es" },
  { name: "Costa Rica",                    flag: "🇨🇷", region: "centroamerica",      idioma: "es" },
  { name: "Cuba",                          flag: "🇨🇺", region: "caribe_hispano",     idioma: "es" },
  { name: "Curaçao",                       flag: "🇨🇼", region: "territorio",         idioma: "nl" },
  { name: "Dominica",                      flag: "🇩🇲", region: "caribe_anglofono",   idioma: "en" },
  { name: "Ecuador",                       flag: "🇪🇨", region: "sudamerica",         idioma: "es" },
  { name: "El Salvador",                   flag: "🇸🇻", region: "centroamerica",      idioma: "es" },
  { name: "Guatemala",                     flag: "🇬🇹", region: "centroamerica",      idioma: "es" },
  { name: "Guyana",                        flag: "🇬🇾", region: "sudamerica",         idioma: "en" },
  { name: "Haití",                         flag: "🇭🇹", region: "caribe_hispano",     idioma: "fr" },
  { name: "Honduras",                      flag: "🇭🇳", region: "centroamerica",      idioma: "es" },
  { name: "Islas Caimán",                  flag: "🇰🇾", region: "territorio",         idioma: "en" },
  { name: "Islas Turcos y Caicos",         flag: "🇹🇨", region: "territorio",         idioma: "en" },
  { name: "Islas Vírgenes Americanas",     flag: "🇻🇮", region: "territorio",         idioma: "en" },
  { name: "Islas Vírgenes Británicas",     flag: "🇻🇬", region: "territorio",         idioma: "en" },
  { name: "Jamaica",                       flag: "🇯🇲", region: "caribe_anglofono",   idioma: "en" },
  { name: "Martinica",                     flag: "🇲🇶", region: "territorio",         idioma: "fr" },
  { name: "México",                        flag: "🇲🇽", region: "mexico",             idioma: "es" },
  { name: "Nicaragua",                     flag: "🇳🇮", region: "centroamerica",      idioma: "es" },
  { name: "Panamá",                        flag: "🇵🇦", region: "centroamerica",      idioma: "es" },
  { name: "Paraguay",                      flag: "🇵🇾", region: "sudamerica",         idioma: "es" },
  { name: "Perú",                          flag: "🇵🇪", region: "sudamerica",         idioma: "es" },
  { name: "Puerto Rico",                   flag: "🇵🇷", region: "caribe_hispano",     idioma: "es" },
  { name: "República Dominicana",          flag: "🇩🇴", region: "caribe_hispano",     idioma: "es" },
  { name: "Sint Maarten",                  flag: "🇸🇽", region: "territorio",         idioma: "nl" },
  { name: "Trinidad y Tobago",             flag: "🇹🇹", region: "caribe_anglofono",   idioma: "en" },
  { name: "Uruguay",                       flag: "🇺🇾", region: "sudamerica",         idioma: "es" },
  { name: "Venezuela",                     flag: "🇻🇪", region: "sudamerica",         idioma: "es" },
];

export const COUNTRY_FLAG: Record<string, string> = Object.fromEntries(
  LATAM_COUNTRIES.map(({ name, flag }) => [name, flag])
);

export const COUNTRY_LANG: Record<string, Country["idioma"]> = Object.fromEntries(
  LATAM_COUNTRIES.map(({ name, idioma }) => [name, idioma])
);

export const COUNTRY_NAMES = LATAM_COUNTRIES.map((c) => c.name);
