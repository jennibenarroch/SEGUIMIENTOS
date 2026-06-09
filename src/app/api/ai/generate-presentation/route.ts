import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSeasonContext } from "@/lib/seasons";

export type Slide = {
  section: string;
  headline: string;
  points: string[];
  highlight?: string;
};

export type Presentation = {
  clientName: string;
  dealName: string;
  subtitle: string;
  slides: Slide[];
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurado en .env.local" }, { status: 500 });
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
        ideaTitle?: string;
        ideaType?: string;
        ideaDescription?: string;
        ideaLicenses?: string[];
        ideaArgument?: string;
      };
    };

    const anthropic = new Anthropic({ apiKey });
    const now = new Date();
    const monthYear = now.toLocaleString("es-PA", { month: "long", year: "numeric" });
    const seasonContext = getSeasonContext(deal.country ?? "", now);

    const hasIdea = !!deal.ideaTitle;
    const sinContacto = !deal.lastContact || deal.lastContact === "—";
    const daysSinceContact = (!sinContacto && deal.lastContact)
      ? Math.floor((Date.now() - new Date(deal.lastContact).getTime()) / 86400000)
      : null;
    const nextActionOverdue = deal.nextAction ? new Date(deal.nextAction) < now : false;

    let situacion = "";
    if (hasIdea) {
      situacion = `Presentar la idea "${deal.ideaTitle}" (${deal.ideaType}) — propuesta nueva para reactivar o hacer crecer la cuenta.`;
    } else if (nextActionOverdue && daysSinceContact && daysSinceContact > 30) {
      situacion = `Deal detenido — sin actividad hace ${daysSinceContact} días. La presentación debe reactivar el interés.`;
    } else if (deal.targetMonth) {
      situacion = `Preparar el terreno para el pedido objetivo de ${deal.targetMonth}.`;
    } else {
      situacion = "Seguimiento comercial — mantener la relación y avanzar hacia el siguiente pedido.";
    }

    const prompt = `Eres un experto en ventas B2B para Sicoben Ediciones, editorial y distribuidora de libros y productos infantiles con más de 62 años de experiencia, presencia en 15 países y licencias de Disney, Mattel (Barbie, Hot Wheels, Fisher-Price), Nickelodeon (Paw Patrol), BBC Studios (Bluey) y Universal (Gabby's Dollhouse, Minions, Cómo Entrenar a Tu Dragón).

DEAL / CLIENTE:
- Deal: ${deal.name}
- País: ${deal.country || "—"}
- Canal / Categoría: ${deal.category || "—"}
- Fase: ${deal.fase || "—"}
- Contacto: ${deal.contactPerson || "—"}
- Compras: ${deal.buyerPerson || "—"}
- Último contacto: ${deal.lastContact || "no registrado"}
- Mes objetivo pedido: ${deal.targetMonth || "—"}
- Valor objetivo: ${deal.targetValue ? `$${deal.targetValue}` : "—"}
- Notas: ${deal.lastNotes || "—"}

${hasIdea ? `IDEA A PRESENTAR:
- Título: ${deal.ideaTitle}
- Tipo: ${deal.ideaType}
- Descripción: ${deal.ideaDescription}
- Licencias: ${deal.ideaLicenses?.join(", ") || "—"}
- Argumento de venta: ${deal.ideaArgument}` : ""}

${seasonContext}

SITUACIÓN:
${situacion}

FECHA: ${monthYear}

Crea una presentación comercial de EXACTAMENTE 5 diapositivas para este cliente. Cada diapositiva debe ser concisa, persuasiva y personalizada para este deal específico.

Estructura obligatoria:
1. "Por qué ahora" — la oportunidad actual (temporada, momento del mercado, situación del deal)
2. "Sicoben para tu canal" — por qué Sicoben encaja específicamente con este tipo de negocio y país
3. ${hasIdea ? `"La propuesta: ${deal.ideaTitle}" — desarrolla la idea con argumentos concretos` : '"Tu portafolio ideal" — licencias y productos más relevantes para su canal con argumentos de rotación'}
4. "Soluciones de exhibición" — qué formato de exhibidor encaja mejor con su espacio (Pallet Display, PDQ, Colgante, Ristras, etc.)
5. "Próximos pasos" — 3 acciones concretas y fechas sugeridas

Para cada diapositiva:
- section: título corto de la sección (máximo 4 palabras)
- headline: titular principal impactante de la diapositiva (máximo 10 palabras)
- points: array de 3-4 puntos concisos y específicos (no genéricos)
- highlight: (opcional) cifra, dato o frase de impacto para resaltar visualmente

Responde SOLO con JSON válido:
{
  "clientName": "${deal.contactPerson || deal.name}",
  "dealName": "${deal.name}",
  "subtitle": "Sicoben Ediciones · ${monthYear}",
  "slides": [
    {
      "section": "...",
      "headline": "...",
      "points": ["...", "...", "..."],
      "highlight": "..."
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Sin respuesta de texto");

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato de respuesta inválido");

    const presentation = JSON.parse(jsonMatch[0]) as Presentation;
    return NextResponse.json({ presentation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
