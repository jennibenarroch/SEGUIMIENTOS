import { NextResponse } from "next/server";
import { mondayQuery } from "@/lib/monday";
import { safeError } from "@/lib/api-error";

const ALLOWED_BOARD_IDS = [
  process.env.NEXT_PUBLIC_MONDAY_PROSPECTS_BOARD_ID,
  process.env.NEXT_PUBLIC_MONDAY_DEALS_BOARD_ID,
].filter(Boolean);

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

  if (ALLOWED_BOARD_IDS.length > 0 && !ALLOWED_BOARD_IDS.includes(boardId)) {
    return NextResponse.json({ error: "boardId no permitido" }, { status: 403 });
  }

  try {
    const data = await mondayQuery<ColumnsResponse>(COLUMNS_QUERY, { boardId });
    return NextResponse.json(data.boards[0] ?? {});
  } catch (err) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 });
  }
}
