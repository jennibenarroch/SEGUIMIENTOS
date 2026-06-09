import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSeasonContext } from "@/lib/seasons";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurado en .env.local" },
      { status: 500 }
    );
  }

  try {
    const { deal, vendorName } = await req.json() as {
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
      vendorName?: string;
    };

    const anthropic = new Anthropic({ apiKey });

    const vendor = vendorName?.trim() || "el equipo de ventas";
    const now = new Date();
    const seasonContext = getSeasonContext(deal.country ?? "", now);

    const sinContacto = !deal.lastContact || deal.lastContact === "—";
    const daysSinceContact = (!sinContacto && deal.lastContact)
      ? Math.floor((Date.now() - new Date(deal.lastContact).getTime()) / 86400000)
      : null;

    const nextActionOverdue = deal.nextAction
      ? new Date(deal.nextAction) < now
      : false;

    const hasNotes = deal.lastNotes && deal.lastNotes.trim().length > 5;

    // Diagnóstico situacional
    let situacion: string;
    let prioridad: string;

    if (deal.ideaTitle) {
      situacion = `PRESENTAR IDEA NUEVA — el vendedor tiene una idea específica para reactivar este cliente: "${deal.ideaTitle}" (${deal.ideaType}).`;
      prioridad = `El email gira en torno a esta idea. Preséntala con entusiasmo y naturalidad, como si se te acabara de ocurrir pensando en el cliente. Conecta la idea con su canal/categoría específica. Cierra con una invitación concreta a conversar sobre cómo implementarla.`;
    } else if (nextActionOverdue && daysSinceContact !== null && daysSinceContact > 30) {
      situacion = `DEAL DETENIDO — la acción programada (${deal.nextAction}) ya venció y no hubo movimiento en ${daysSinceContact} días. Riesgo de pérdida del deal.`;
      prioridad = `Aborda directamente la situación sin rodeos: ha pasado tiempo y quieres retomar la conversación. Trae algo concreto y nuevo — una temporada próxima, un producto con alta demanda actual, o una pregunta directa sobre qué cambió desde el último contacto. No actúes como si nada hubiera pasado.`;
    } else if (nextActionOverdue) {
      situacion = `ACCIÓN VENCIDA — la próxima acción estaba programada para ${deal.nextAction} y no se realizó.`;
      prioridad = `Reactiva el deal con un ángulo fresco. ${hasNotes ? `El último contacto dejó estas notas: "${deal.lastNotes}" — continúa desde ahí.` : "Pregunta directamente por el estado actual del inventario y la exhibición."} Si hay temporada activa o próxima, úsala como gancho.`;
    } else if (hasNotes) {
      situacion = `CONTINUACIÓN DE CONVERSACIÓN — hay notas del último contacto hace ${daysSinceContact ?? "?"} días: "${deal.lastNotes}".`;
      prioridad = `Continúa exactamente desde donde quedaron. Haz referencia directa a lo que se habló o quedó pendiente. No empieces de cero — demuestra que llevas el hilo de la conversación.`;
    } else if (deal.targetMonth) {
      situacion = `DEAL CON FECHA OBJETIVO — el pedido está proyectado para ${deal.targetMonth}. Último contacto hace ${daysSinceContact ?? "?"} días.`;
      prioridad = `Acércate al mes objetivo con naturalidad. Pregunta cómo van los preparativos para el pedido, si necesita algo para facilitar la decisión, y si hay temporada relevante para ese mes, menciónala.`;
    } else {
      situacion = `SEGUIMIENTO DE RUTINA — cliente activo, último contacto hace ${daysSinceContact ?? "?"} días.`;
      prioridad = `Mantén la relación con un mensaje corto y relevante. Pregunta por el estado de la mercancía (rotación, inventario, exhibición). Si hay temporada activa o próxima, úsala para abrir la conversación sobre el siguiente pedido.`;
    }

    const prompt = `Eres un experto en ventas B2B para Sicoben Ediciones. A continuación tienes el contexto completo de la empresa.

SOBRE SICOBEN EDICIONES:
Sicoben Ediciones es una editorial y distribuidora de libros y productos infantiles educativos y de entretenimiento con más de 62 años de experiencia. Opera en 15 países de América Latina y el Caribe, vende millones de libros al año y lanza 200 títulos nuevos anualmente.

MARCAS Y LICENCIAS:
- Disney: Princesas, Stitch, Rey León, Disney Junior
- Mattel: Barbie, Hot Wheels, Fisher-Price
- Nickelodeon: Paw Patrol (licencia #1 en preescolar 3 años consecutivos)
- BBC Studios: Bluey (licencia en rápido crecimiento)
- Universal: Gabby's Dollhouse, Minions, Cómo Entrenar a Tu Dragón
- Marca propia Sicoben: libros educativos y entretenidos para alta rotación

SOLUCIONES DE EXHIBICIÓN:
Pallet Display, Exhibidor de Piso, Exhibidor Colgante, Self PDQ, PDQ, Ristras — adaptables a cualquier espacio.

---

DATOS DEL CLIENTE / DEAL:
- Nombre del deal: ${deal.name}
- País: ${deal.country || "—"}
- Categoría / Canal: ${deal.category || "—"}
- Fase actual: ${deal.fase || "—"}
- Persona de contacto: ${deal.contactPerson || "—"}
- Persona de compras: ${deal.buyerPerson || "—"}
- Último contacto: ${deal.lastContact || "no registrado"}
- Próxima acción programada: ${deal.nextAction || "—"}
- Mes objetivo de pedido: ${deal.targetMonth || "—"}
- Valor objetivo: ${deal.targetValue ? `$${deal.targetValue}` : "—"}
- Notas del último contacto: ${deal.lastNotes || "—"}

${seasonContext}

${deal.ideaTitle ? `IDEA A PRESENTAR:
- Título: ${deal.ideaTitle}
- Tipo: ${deal.ideaType}
- Descripción: ${deal.ideaDescription}
- Licencias: ${deal.ideaLicenses?.join(", ") || "—"}
- Argumento: ${deal.ideaArgument}` : ""}

DIAGNÓSTICO DE SITUACIÓN:
${situacion}

PRIORIDAD PARA ESTE EMAIL:
${prioridad}

REGLAS:
- Tono cercano, de colega de negocio — no de vendedor presionando
- Máximo 3 párrafos cortos y directos
- Dirigirse por nombre a la persona de contacto si está disponible
- El asunto debe reflejar el ángulo real del email — nada genérico
- Sin frases vacías ("espero que estés bien", "me dirijo a usted", "por medio de la presente")
- Firma con el nombre del vendedor: ${vendor}
- Si el cliente es del Caribe anglófono (Barbados, Jamaica, Trinidad, etc.) → redacta en inglés

Responde SOLO con JSON, sin texto adicional antes o después:
{
  "subject": "asunto del email (máximo 60 caracteres)",
  "body": "cuerpo completo del email con saltos de línea representados como \\n"
}`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No se obtuvo respuesta de texto del modelo");
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Formato de respuesta del modelo inválido");

    const { subject, body } = JSON.parse(jsonMatch[0]) as { subject: string; body: string };
    if (!subject || !body) throw new Error("El modelo no generó asunto o cuerpo");

    return NextResponse.json({ subject, body });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
