import { mondayQuery } from "./monday";

// IDs de los items en el grupo "Links de catalogos" del board 4522025014
const CATALOG_ITEMS: Record<string, string> = {
  "argentina": "5124245861",
  "bolivia": "5124316052",
  "chile": "5124465180",
  "colombia": "5124541712",
  "costa rica": "5124638222",
  "ecuador": "5124710455",
  "el salvador": "5124742236",
  "guatemala": "5124766654",
  "honduras": "5124802718",
  "méxico": "5124887450",
  "mexico": "5124887450",
  "nicaragua": "5124915107",
  "panamá": "5124937147",
  "panama": "5124937147",
  "paraguay": "5124965864",
  "perú": "5125050194",
  "peru": "5125050194",
  "puerto rico": "5125135925",
  "rep. dominicana": "5125163835",
  "república dominicana": "5125163835",
  "republica dominicana": "5125163835",
  "trinidad y tobago": "5316153878",
  "trinidad": "5316153878",
  "uruguay": "5125182475",
  "venezuela": "5125253400",
  // Caribe anglófono → catálogo en inglés
  "barbados": "11520427417",
  "jamaica": "11520427417",
  "caribe ingles": "11520427417",
  "caribe inglés": "11520427417",
};

const GENERAL_CATALOG_ID = "6606283756";

const UPDATES_QUERY = `
  query GetCatalogUpdates($itemId: ID!) {
    items(ids: [$itemId]) {
      updates(limit: 1) {
        text_body
      }
    }
  }
`;

type UpdatesResponse = {
  items: { updates: { text_body: string }[] }[];
};

export async function getCatalogLink(country: string): Promise<string | null> {
  const key = country.toLowerCase().trim();
  const itemId = CATALOG_ITEMS[key] ?? GENERAL_CATALOG_ID;

  try {
    const data = await mondayQuery<UpdatesResponse>(UPDATES_QUERY, { itemId });
    const textBody = data.items[0]?.updates[0]?.text_body ?? "";
    const match = textBody.match(/Link:\s*(https?:\/\/\S+)/);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}
