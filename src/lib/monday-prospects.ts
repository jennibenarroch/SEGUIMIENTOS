import { mondayQuery } from "./monday";

export type ColumnValue = {
  id: string;
  text: string;
  value: string | null;
};

export type MondayItem = {
  id: string;
  name: string;
  state: string;
  created_at: string;
  updated_at: string;
  column_values: ColumnValue[];
};

type BoardResponse = {
  boards: {
    items_page: {
      cursor: string | null;
      items: MondayItem[];
    };
  }[];
};

// Solo las columnas que mostramos en la tabla
// "text_contacto" = columna de nombre de contacto en Monday (configurar al conectar el board real)
const NEEDED_COLUMNS = ["status", "text3", "color_mm0ykm0j", "fecha0", "fecha53", "text9", "tel_fono", "multiple_person", "text"];

const PROSPECTS_QUERY = `
  query GetProspects($boardId: ID!, $cursor: String, $cols: [String!]) {
    boards(ids: [$boardId]) {
      items_page(limit: 200, cursor: $cursor) {
        cursor
        items {
          id
          name
          state
          created_at
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

export async function getProspects(): Promise<MondayItem[]> {
  const boardId = process.env.MONDAY_PROSPECTS_BOARD_ID;
  if (!boardId) throw new Error("MONDAY_PROSPECTS_BOARD_ID no configurado en .env.local");

  const items: MondayItem[] = [];
  let cursor: string | null = null;

  do {
    const data: BoardResponse = await mondayQuery<BoardResponse>(PROSPECTS_QUERY, {
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

// Helper: get a column value by column id
export function col(item: MondayItem, columnId: string): string {
  return item.column_values.find((c) => c.id === columnId)?.text ?? "";
}
