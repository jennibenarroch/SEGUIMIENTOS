import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSeasonContext } from "@/lib/seasons";

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
        targetMonth?: string;
        targetValue?: string;
        lastNotes?: string;
        isOverdue?: boolean;
      };
    };

    const anthropic = new Anthropic({ apiKey });

    const now = new Date();
    const month = now.toLocaleString("es-PA", { month: "long" });
    const year = now.getFullYear();
    const seasonContext = getSeasonContext(deal.country ?? "", now);

    const prompt = `Eres un experto en marketing comercial B2B para Sicoben Ediciones, empresa con más de 62 años vendiendo libros y productos infantiles educativos y de entretenimiento en 15 países de América Latina y el Caribe.

PORTAFOLIO DE SICOBEN:
Licencias: Disney (Princesas, Stitch, Rey León, Disney Junior), Mattel (Barbie, Hot Wheels, Fisher-Price), Nickelodeon (Paw Patrol), BBC Studios (Bluey), Universal (Gabby's Dollhouse, Minions, Cómo Entrenar a Tu Dragón).
Productos: libros de colorear, libros de actividades con stickers, marcadores mágicos, libros educativos preescolares y escolares.
Exhibidores disponibles: Pallet Display (espacios grandes), Exhibidor de Piso, Exhibidor Colgante de 4 espacios, Self PDQ (abre la caja y exhibe), PDQ (cualquier estantería), Ristras (cross merchandising).
Canales: farmacias, jugueterías, tiendas por departamento, tiendas de conveniencia, dollar stores, hipermercados, supermercados, escuelas.

DEAL ATASCADO:
- Nombre del deal: ${deal.name}
- País: ${deal.country || "—"}
- Canal / Categoría: ${deal.category || "—"}
- Fase actual: ${deal.fase || "—"}
- Contacto: ${deal.contactPerson || "—"}
- Mes objetivo de pedido: ${deal.targetMonth || "no definido"}
- Valor objetivo: ${deal.targetValue ? `$${deal.targetValue}` : "—"}
- Notas del último contacto: ${deal.lastNotes || "sin notas"}
- Situación: ${deal.isOverdue ? "ATRASADO — el mes objetivo ya pasó y no hubo pedido" : "Sin actividad reciente, necesita reactivación"}
- Fecha actual: ${month} ${year}

${seasonContext}

TU TAREA: Genera EXACTAMENTE 3 ideas creativas y distintas para reactivar este deal. Cada idea debe ser concreta, personalizada para este cliente/canal específico y accionable de inmediato.

Los tipos de ideas pueden ser:
- Exhibidor nuevo o upgrade del exhibidor actual
- Activación o evento en punto de venta
- Temporada (usa las temporadas activas/próximas del calendario anterior — obligatorio si hay alguna activa o en preparación)
- Bundle o paquete especial de productos
- Promoción de lanzamiento de título nuevo
- Cross merchandising con Ristras o PDQ en zona específica de la tienda

IMPORTANTE: Si hay temporadas activas o en preparación en el calendario de arriba, AL MENOS UNA de las 3 ideas debe estar alineada a esa temporada. Las ideas deben mencionar la temporada específica por nombre. Al menos una idea debe estar alineada a temporada activa o en preparación si existe.

Para cada idea incluye:
- titulo: nombre creativo y memorable (máximo 6 palabras)
- tipo: "Exhibidor" | "Activación" | "Temporada" | "Bundle" | "Lanzamiento" | "Cross Merchandising"
- descripcion: 2 oraciones. Qué es y por qué encaja con este cliente específico
- licencias: array de 1-3 licencias de Sicoben más relevantes para esta idea
- argumento: 1 oración con el argumento de venta principal para este cliente

Responde SOLO con JSON válido, sin texto antes ni después:
[
  {
    "titulo": "...",
    "tipo": "...",
    "descripcion": "...",
    "licencias": ["..."],
    "argumento": "..."
  },
  { ... },
  { ... }
]`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Sin respuesta de texto");

    const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Formato de respuesta inválido");

    const ideas = JSON.parse(jsonMatch[0]) as {
      titulo: string;
      tipo: string;
      descripcion: string;
      licencias: string[];
      argumento: string;
    }[];

    if (!Array.isArray(ideas) || ideas.length !== 3) throw new Error("El modelo no generó exactamente 3 ideas");

    return NextResponse.json({ ideas });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
