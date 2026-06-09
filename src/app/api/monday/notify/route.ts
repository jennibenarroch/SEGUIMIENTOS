import { NextResponse } from "next/server";
import { mondayQuery } from "@/lib/monday";

// Notificación directa a un usuario en Monday (campanazo)
const NOTIFY_USER = `
  mutation Notify($userId: ID!, $itemId: ID!, $text: String!) {
    create_notification(
      user_id: $userId,
      target_id: $itemId,
      text: $text,
      target_type: Project
    ) {
      text
    }
  }
`;

// Update (comentario visible en el item)
const POST_UPDATE = `
  mutation PostUpdate($itemId: ID!, $body: String!) {
    create_update(item_id: $itemId, body: $body) {
      id
    }
  }
`;

// Actualizar fecha de último contacto
const SET_DATE = `
  mutation SetDate($boardId: ID!, $itemId: ID!, $colId: String!, $value: JSON!) {
    change_column_value(board_id: $boardId, item_id: $itemId, column_id: $colId, value: $value) {
      id
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { itemId, message, vendorIds } = await req.json() as {
      itemId: string;
      message: string;
      vendorIds?: number[];
    };

    if (!itemId || !message?.trim()) {
      return NextResponse.json({ error: "itemId y message son requeridos" }, { status: 400 });
    }

    const boardId = process.env.MONDAY_PROSPECTS_BOARD_ID;
    const today = new Date().toISOString().split("T")[0];

    // 1. Publicar update (comentario) en el item
    await mondayQuery(POST_UPDATE, { itemId, body: message });

    // 2. Enviar notificación directa a cada vendedor asignado
    if (vendorIds && vendorIds.length > 0) {
      const shortText = message.split("\n")[0].replace(/[*_~]/g, "").trim();
      await Promise.all(
        vendorIds.map((userId) =>
          mondayQuery(NOTIFY_USER, {
            userId: String(userId),
            itemId,
            text: shortText,
          }).catch(() => null) // no fallar si un usuario no acepta notificaciones
        )
      );
    }

    // 3. Actualizar fecha de último contacto a hoy
    if (boardId) {
      await mondayQuery(SET_DATE, {
        boardId,
        itemId,
        colId: "fecha53",
        value: JSON.stringify({ date: today }),
      }).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
