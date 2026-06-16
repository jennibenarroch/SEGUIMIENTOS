import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSeasonContext } from "@/lib/seasons";
import { safeError } from "@/lib/api-error";

export type Strategy = {
  titulo: string;
  hipotesis: string;
  enfoque: string;
  puntosClave: string[];
  canal: "email" | "whatsapp" | "llamada";
  urgencia: "alta" | "media" | "baja";
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurado" },
      { status: 500 },
    );
  }

  try {
    const { deal } = await req.json() as {
      deal: {
        name: string;
        country?: string;
        category?: string;
        fase?: string;
        contactPerson?: string;
        buyerPerson?: string;
        lastContact?: string;
        nextAction?: string;
        targetMonth?: string;
        targetValue?: string;
        lastNotes?: string;
        vendor?: string;
      };
    };

    const anthropic = new Anthropic({ apiKey });
    const now = new Date();
    const seasonContext = getSeasonContext(deal.country ?? "", now);

    const daysSinceContact =
      deal.lastContact && deal.lastContact !== "—"
        ? Math.floor((Date.now() - new Date(deal.lastContact).getTime()) / 86400000)
        : null;

    const nextActionOverdue = deal.nextAction
      ? new Date(deal.nextAction) < now
      : false;

    const situacion = [
      deal.fase ? `Fase actual: ${deal.fase}` : null,
      daysSinceContact !== null
        ? `Último contacto hace ${daysSinceContact} día${daysSinceContact === 1 ? "" : "s"}`
        : "Sin contacto registrado",
      nextActionOverdue ? `⚠ Acción vencida (estaba programada para ${deal.nextAction})` : null,
      deal.lastNotes ? `Notas del último contacto: "${deal.lastNotes}"` : null,
      deal.targetMonth ? `Mes objetivo de pedido: ${deal.targetMonth}` : null,
      deal.targetValue ? `Valor objetivo: $${deal.targetValue}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `Eres un experto en ventas B2B para Sicoben Ediciones. Empresa familiar con más de 60 años de trayectoria, presencia en 15 países de América Latina y el Caribe, despachos desde la Zona Libre de Colón en Panamá. Categorías: Actividad, Lectura, Colorear, Packs, Aqua Books y Magic Pen. Marca exclusiva propia + licencias: Disney, Mattel (Barbie, Hot Wheels), Nickelodeon (Paw Patrol, Bob Esponja), BBC Studios (Bluey), Universal (Gabby's Dollhouse, Minions, Cómo Entrenar a Tu Dragón, Trolls). Surtido en cajas de ~24 unidades, coleccionables que generan recompra, soluciones de exhibición para cualquier espacio.

DATOS DEL DEAL:
- Cliente: ${deal.name}
- País: ${deal.country || "—"}
- Categoría / Canal: ${deal.category || "—"}
- Persona de contacto: ${deal.contactPerson || "—"}
- Comprador/Decisor: ${deal.buyerPerson || "—"}
- Vendedor responsable: ${deal.vendor || "—"}

SITUACIÓN ACTUAL:
${situacion}

${seasonContext}

TAREA:
Analiza este deal y genera EXACTAMENTE 3 hipótesis distintas sobre por qué este cliente no está comprando o no está respondiendo, junto con una estrategia concreta y accionable para cada hipótesis.

Las 3 hipótesis deben ser cualitativamente diferentes entre sí — no repitas el mismo ángulo con distintas palabras. Piensa en:
- Objeciones comerciales (precio, presupuesto, inventario lleno)
- Objeciones relacionales (desconfianza, falta de relación con el decisor)
- Objeciones de timing o contexto (mal momento, competidor activo, temporada equivocada)
- Problemas operativos (espacio de exhibición, logística, procesos de compra)
- Falta de urgencia o propuesta de valor no clara

Para el campo "canal": elige el canal más efectivo para esa estrategia específica.
Para "urgencia": evalúa qué tan urgente es actuar con ese enfoque dada la situación actual.

Responde SOLO con JSON válido, sin texto adicional:
{
  "strategies": [
    {
      "titulo": "nombre del enfoque (máximo 6 palabras)",
      "hipotesis": "por qué crees que no está comprando — sé específico con el contexto del deal (2 oraciones max)",
      "enfoque": "qué hacer o decir exactamente — accionable y concreto (2-3 oraciones)",
      "puntosClave": ["argumento clave 1", "argumento clave 2", "argumento clave 3"],
      "canal": "email" | "whatsapp" | "llamada",
      "urgencia": "alta" | "media" | "baja"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Sin respuesta del modelo");

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato de respuesta inválido");

    const { strategies } = JSON.parse(jsonMatch[0]) as { strategies: Strategy[] };
    if (!Array.isArray(strategies) || strategies.length === 0) throw new Error("El modelo no generó estrategias");

    return NextResponse.json({ strategies });
  } catch (err) {
    return NextResponse.json(
      { error: safeError(err) },
      { status: 500 },
    );
  }
}
