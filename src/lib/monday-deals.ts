import { mondayQuery } from "./monday";

export type DealItem = {
  id: string;
  name: string;
  updated_at: string;
  column_values: { id: string; text: string; value: string | null }[];
};

type BoardResponse = {
  boards: {
    items_page: {
      cursor: string | null;
      items: DealItem[];
    };
  }[];
};

const NEEDED_COLUMNS = [
  "dup__of_categor_a__1",   // País
  "dup__of_ciudad__1",       // Categoría
  "fecha_1_mkkktxgd",        // Fecha de Contacto
  "fecha_mkkkqae2",          // Dia de PROX ACC
  "estado_1__1",             // Fase
  "dup__of_estado__1",       // Estado KPI
  "lookup__1",               // Persona Contacto
  "lookup4__1",              // Persona Compras
  "dup__of_ext_mkm0rqbe",    // Correo electrónico
  "lookup_mkm01t6a",         // Correo electrónico 1
  "lookup_mm0y5fjq",         // Vendedor Responsable
  "n_meros__1",              // Valor objetivo
  "texto90",                 // Fecha / Asunto (notas último contacto)
  "conectar_tableros_Mjj4B8ST", // Mes Objetivo
];

const DEALS_QUERY = `
  query GetDeals($boardId: ID!, $cursor: String, $cols: [String!]) {
    boards(ids: [$boardId]) {
      items_page(limit: 200, cursor: $cursor) {
        cursor
        items {
          id
          name
          updated_at
          column_values(ids: $cols) {
            id
            text
            value
          }
        }
      }
    }
  }
`;

export async function getDeals(): Promise<DealItem[]> {
  const boardId = process.env.MONDAY_DEALS_BOARD_ID;
  if (!boardId) throw new Error("MONDAY_DEALS_BOARD_ID no configurado en .env.local");

  const items: DealItem[] = [];
  let cursor: string | null = null;

  do {
    const data: BoardResponse = await mondayQuery<BoardResponse>(DEALS_QUERY, {
      boardId,
      cursor: cursor ?? undefined,
      cols: NEEDED_COLUMNS,
    });

    const page = data.boards[0]?.items_page;
    if (!page) break;

    items.push(...page.items);
    cursor = page.cursor;
  } while (cursor);

  return items;
}

export function dealCol(item: DealItem, columnId: string): string {
  return item.column_values.find((c) => c.id === columnId)?.text ?? "";
}
