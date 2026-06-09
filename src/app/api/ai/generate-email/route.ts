import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCatalogLink } from "@/lib/catalog";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurado en .env.local" },
      { status: 500 }
    );
  }

  try {
    const { prospect, vendorName } = await req.json() as {
      prospect: {
        name: string;
        country?: string;
        category?: string;
        status?: string;
        lastContact?: string;
      };
      vendorName?: string;
    };

    const anthropic = new Anthropic({ apiKey });

    const vendor = vendorName?.trim() || "el equipo de ventas";
    const sinContacto = !prospect.lastContact || prospect.lastContact === "—";

    const daysSinceContact = (!sinContacto && prospect.lastContact)
      ? Math.floor((Date.now() - new Date(prospect.lastContact).getTime()) / 86400000)
      : null;

    const catalogLink = await getCatalogLink(prospect.country ?? "");
    const catalogInfo = catalogLink
      ? `El catálogo vigente para ${prospect.country} es: ${catalogLink} — incluye este link en el email invitándolo a verlo.`
      : "No hay catálogo específico disponible; omite la mención del catálogo.";

    // Diagnóstico situacional
    let situacion: string;
    let prioridad: string;

    if (sinContacto) {
      situacion = "PRIMER CONTACTO — nunca se ha contactado a este prospecto antes.";
      prioridad = `Preséntate y presenta Sicoben con un gancho claro y relevante para su canal (${prospect.category || "su tipo de negocio"}). El objetivo es despertar curiosidad y conseguir una respuesta o una reunión. Menciona 1-2 licencias que encajen con su rubro. Si hay catálogo, invítalo a verlo.`;
    } else if (daysSinceContact !== null && daysSinceContact > 21) {
      situacion = `RETOMAR CONTACTO — el último contacto fue hace ${daysSinceContact} días. El prospecto se ha enfriado.`;
      prioridad = `No repitas el mismo mensaje anterior. Trae algo nuevo: una temporada próxima, un título nuevo, un ángulo diferente sobre por qué ahora es el momento ideal para el canal de este cliente. Reconoce el tiempo transcurrido con naturalidad sin disculpas excesivas.`;
    } else if (daysSinceContact !== null && daysSinceContact > 7 && prospect.status?.toLowerCase() === "sin acción") {
      situacion = `SEGUIMIENTO SIN RESPUESTA — contacto hace ${daysSinceContact} días sin respuesta registrada.`;
      prioridad = `Cambia el ángulo del mensaje anterior. Usa un gancho diferente: una temporada activa, una licencia distinta, o una pregunta directa sobre su situación actual de inventario o exhibición. El asunto del email debe ser nuevo y llamativo, no una variación del anterior.`;
    } else {
      situacion = `CONTACTO ACTIVO — último contacto hace ${daysSinceContact ?? "pocos"} días, estado: "${prospect.status || "prospecto"}".`;
      prioridad = `Continúa la conversación con naturalidad. Avanza hacia el siguiente paso concreto: ver el catálogo, agendar una reunión, o hacer un pedido de prueba. Muestra que conoces su canal y tienes algo específico para ofrecerle.`;
    }

    const prompt = `Eres un experto en ventas B2B para Sicoben Ediciones. A continuación tienes todo el contexto de la empresa para escribir emails comerciales altamente efectivos.

SOBRE SICOBEN EDICIONES:
Sicoben Ediciones es una editorial y distribuidora de libros y productos infantiles educativos y de entretenimiento con más de 62 años de experiencia. Opera en 15 países de América Latina y el Caribe, vende millones de libros al año y lanza 200 títulos nuevos anualmente. Trabaja con las 5 licencias más importantes del mercado infantil.

MARCAS Y LICENCIAS:
- Disney: Princesas, Stitch, Rey León, Disney Junior — líder mundial en licencias infantiles por más de 50 años
- Mattel: Barbie, Hot Wheels, Fisher-Price — marcas emblemáticas favoritas por generaciones
- Nickelodeon: Paw Patrol — licencia número uno en productos preescolares los últimos 3 años
- BBC Studios: Bluey — licencia en rápido crecimiento que encanta a niños y padres
- Universal: Gabby's Dollhouse, Minions, Cómo Entrenar a Tu Dragón
- Marca propia Sicoben: libros educativos y entretenidos, ideales para alta rotación e impulso comercial

PRODUCTOS:
Libros de colorear, libros de actividades con stickers, marcadores mágicos, libros educativos para preescolares y escolares. Todos con personajes de las licencias más reconocidas del mercado.

PROPUESTA DE VALOR:
Alta rotación garantizada gracias a personajes que los niños ya conocen y piden. Impulso comercial inmediato en el punto de venta. Catálogo amplio y renovado con 200 títulos nuevos por año. Respaldo de 62 años en el mercado y presencia en toda Latinoamérica.

PRINCIPIO COMERCIAL:
"Donde estén las mamás y los papás, ahí debe estar Sicoben." El producto llega directo al consumidor final en el canal correcto.

CANALES OBJETIVO (donde Sicoben se posiciona):
Farmacias, jugueterías, tiendas por departamento, tiendas de conveniencia, Dollar Stores, hipermercados y clubes de precios, canal tradicional, escuelas, supermercados.

SOLUCIONES DE EXHIBICIÓN (adaptadas al espacio del cliente):
Sicoben entiende que los espacios son pequeños y limitados, por eso ofrece soluciones para cualquier tipo de tienda:
- Pallet Display: para espacios grandes, la exhibición más poderosa
- Display Exhibidor de Piso: entra en casi todos los lados, surtido razonable
- Exhibidor Colgante de 4 Espacios: no ocupa espacio en el piso, entra en todos lados
- Exhibidor de Colgantes: mayor variedad de productos colgantes para el mercado
- Self PDQ: viene con el producto, simplemente abres la caja y a exhibir
- PDQ: exhibe los productos en cualquier estantería
- Ristras: se cuelgan haciendo cross donde mejor convenga
Esto permite adaptarse a farmacias, tiendas pequeñas, supermercados y cualquier formato de retail.

---

El vendedor "${vendor}" necesita un email comercial personalizado para enviar al siguiente prospecto/cliente.

DATOS DEL PROSPECTO:
- Nombre: ${prospect.name}
- País: ${prospect.country || "Latinoamérica"}
- Categoría/Rubro: ${prospect.category || "No especificado"}
- Estado en CRM: ${prospect.status || "prospecto"}
- Último contacto: ${prospect.lastContact || "nunca"}

CATÁLOGO:
- ${catalogInfo}

DIAGNÓSTICO DE SITUACIÓN:
${situacion}

PRIORIDAD PARA ESTE EMAIL:
${prioridad}

REGLAS:
- Máximo 3 párrafos cortos y directos
- El asunto debe reflejar el ángulo real del email — nada genérico
- Sin frases vacías ("espero que estés bien", "me dirijo a usted", "por medio de la presente")
- Firma con el nombre del vendedor: ${vendor}
- Si el prospecto es del Caribe anglófono (Barbados, Jamaica, Trinidad, etc.) → redacta en inglés

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
