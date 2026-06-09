import { NextResponse } from "next/server";
import { mondayQuery } from "@/lib/monday";

const COLUMNS_QUERY = `
  query BoardColumns($boardId: ID!) {
    boards(ids: [$boardId]) {
      name
      columns {
        id
        title
        type
      }
    }
  }
`;

type ColumnsResponse = {
  boards: { name: string; columns: { id: string; title: string; type: string }[] }[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");
  if (!boardId) return NextResponse.json({ error: "boardId requerido" }, { status: 400 });

  try {
    const data = await mondayQuery<ColumnsResponse>(COLUMNS_QUERY, { boardId });
    return NextResponse.json(data.boards[0] ?? {});
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
