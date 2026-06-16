import { NextResponse } from "next/server";
import { Resend } from "resend";
import { mondayQuery } from "@/lib/monday";
import { safeError } from "@/lib/api-error";

const POST_UPDATE = `
  mutation PostUpdate($itemId: ID!, $body: String!) {
    create_update(item_id: $itemId, body: $body) { id }
  }
`;

const SET_DATE = `
  mutation SetDate($boardId: ID!, $itemId: ID!, $colId: String!, $value: JSON!) {
    change_column_value(board_id: $boardId, item_id: $itemId, column_id: $colId, value: $value) { id }
  }
`;

export async function POST(req: Request) {
  try {
    const { dealId, dealName, emailTo, subject, body, channel, vendor } =
      await req.json() as {
        dealId: string;
        dealName: string;
        emailTo?: string;
        subject: string;
        body: string;
        channel: "email" | "whatsapp";
        vendor?: string;
      };

    const boardId = process.env.MONDAY_DEALS_BOARD_ID;
    const today = new Date().toISOString().split("T")[0];
    // Monday IDs are numeric strings; mock IDs like "deal-001" are not
    const isRealDeal = dealId && /^\d+$/.test(dealId);

    // 1. Send email via Resend (only for email channel with a valid address)
    if (channel === "email" && emailTo?.includes("@")) {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) throw new Error("RESEND_API_KEY no configurado");

      const resend = new Resend(resendKey);
      const htmlBody = body
        .split("\n")
        .map((line) => (line.trim() ? `<p style="margin:0 0 12px;">${line}</p>` : "<br>"))
        .join("");

      const ccList = [...new Set(
        [process.env.SUPERVISOR_EMAIL, process.env.MANAGER_EMAIL].filter(Boolean) as string[]
      )];

      const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: emailTo,
        ...(ccList.length > 0 ? { cc: ccList } : {}),
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.6;color:#222;">${htmlBody}</div>`,
      });

      if (error) throw new Error(`Error enviando email: ${error.message}`);
    }

    // 2. Log interaction in Monday deals timeline
    if (isRealDeal) {
      const icon = channel === "email" ? "📧" : "💬";
      const label = channel === "email" ? "Email" : "WhatsApp";
      const updateBody =
        `${icon} **${label} enviado** por ${vendor ?? "vendedor"}\n\n` +
        (subject ? `**Asunto:** ${subject}\n\n` : "") +
        body;

      await mondayQuery(POST_UPDATE, { itemId: dealId, body: updateBody }).catch(() => null);

      // 3. Update last-contact date on the deals board
      if (boardId) {
        await mondayQuery(SET_DATE, {
          boardId,
          itemId: dealId,
          colId: "fecha_1_mkkktxgd",
          value: JSON.stringify({ date: today }),
        }).catch(() => null);
      }
    }

    return NextResponse.json({ ok: true, dealName, channel });
  } catch (err) {
    return NextResponse.json(
      { error: safeError(err) },
      { status: 500 },
    );
  }
}
