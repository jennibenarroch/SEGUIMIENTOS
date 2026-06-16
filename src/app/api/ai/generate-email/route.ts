import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCatalogLink } from "@/lib/catalog";
import { safeError } from "@/lib/api-error";

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
        contactPerson?: string;
      };
      vendorName?: string;
    };

    const anthropic = new Anthropic({ apiKey });

    const vendor = vendorName?.trim() || "el equipo de ventas";
    const sinContacto =
      !prospect.lastContact ||
      prospect.lastContact === "—" ||
      prospect.status?.toLowerCase() === "sin acción";

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
      situacion = "PRIMER CONTACTO — nunca se ha contactado a este prospecto antes. Este es el email de introducción de Sicoben.";
      prioridad = `Este email es la primera impresión de Sicoben para este prospecto. Estructura:
1. Saludo + presentación rápida de quién es Sicoben (1 oración: editorial con 62 años, 15 países, licencias líderes)
2. Argumento ESPECÍFICO para su canal "${prospect.category || "su tipo de negocio"}" — usa el ARGUMENTO POR TIPO DE CANAL correspondiente arriba para que el mensaje hable directo a su negocio
3. Llamada a la acción concreta: invitar a ver el catálogo, agendar una llamada o solicitar una muestra
Menciona 1-2 licencias relevantes para su canal. El tono debe ser directo, confiado y orientado al negocio — no genérico.`;
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
Libros de colorear, libros de actividades con stickers, marcadores mágicos, libros educativos para preescolares y escolares. Todos con personajes de las licencias más reconocidas del mercado. Precios accesibles, alta rotación, producto de impulso natural en el punto de venta.

PROPUESTA DE VALOR:
Alta rotación garantizada gracias a personajes que los niños ya conocen y piden. Impulso comercial inmediato en el punto de venta. Catálogo amplio y renovado con 200 títulos nuevos por año. Respaldo de 62 años en el mercado y presencia en toda Latinoamérica.

PRINCIPIO COMERCIAL:
"Donde estén las mamás y los papás, ahí debe estar Sicoben." El producto llega directo al consumidor final en el canal correcto.

CANALES OBJETIVO (donde Sicoben se posiciona perfectamente):
Papelerías, distribuidoras de papelería, librerías, jugueterías, distribuidoras de juguetes, farmacias, supermercados, hipermercados, almacenes generales, tiendas de artículos para el hogar, tiendas por departamento, tiendas de conveniencia, Dollar Stores, clubes de precios, canal tradicional, escuelas.

ARGUMENTO POR TIPO DE CANAL (úsalo para personalizar el intro):
- Papelería / Distribuidora de papelería: Los libros de actividades y colorear son el complemento natural de sus útiles escolares. Mismos clientes, misma visita de compra, margen adicional sin esfuerzo extra. En temporada escolar, los títulos con licencias Disney y Mattel multiplican el ticket promedio.
- Librería / Editorial: Sicoben amplía el catálogo infantil con títulos de alta rotación respaldados por las licencias que los niños ya piden. No compite con libros académicos; cubre el segmento entretenimiento/regalo donde el impulso de compra es inmediato.
- Juguetería / Distribuidora de juguetes: Los libros de actividades con Barbie, Hot Wheels y Paw Patrol son el complemento perfecto al juguete. El cliente que ya viene a comprar el juguete agrega el libro sin dudar. Producto de regalo fácil para cualquier ocasión.
- Farmacia / Cadena de farmacias: Las mamás compran en la farmacia y sus hijos están a su lado. Un exhibidor colgante o PDQ junto a la caja genera ventas de impulso inmediato sin ocupar espacio en el piso. Alta rotación, bajo riesgo de inventario.
- Supermercado / Hipermercado: Tráfico masivo + producto de impulso = ventas constantes. Sicoben ofrece soluciones de exhibición que se adaptan a cualquier zona de la tienda: cabecera de góndola, pallet central o exhibidor junto a caja.
- Almacén general / Tienda multimarca: Todo lo que vende el almacén está dirigido a la familia. Los libros infantiles con licencias se venden solos; los clientes los reconocen y los piden. Surtido flexible para cualquier tamaño de espacio.
- Artículos para el hogar: Las familias que decoran y equipan su hogar también compran para sus hijos. Libros de actividades y colorear son el regalo perfecto de bajo costo con alto valor percibido. Excelente para incorporar en displays de caja o zona de regalos.

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
- SALUDO OBLIGATORIO en las dos primeras líneas:
  Línea 1 — nombre de contacto:
  ${prospect.contactPerson
    ? `• Persona de contacto: "${prospect.contactPerson}" → usa solo su primer nombre: "Hola ${prospect.contactPerson.split(" ")[0]}," (o "Hi ${prospect.contactPerson.split(" ")[0]}," en inglés)`
    : `• Sin contacto registrado → "Hola," (o "Hi," en inglés). NUNCA uses el nombre de la empresa.`
  }
  Línea 2 — saludo de cortesía: "Espero que se encuentren muy bien." (en inglés: "Hope you're doing well.")
- ASUNTO: debe ser un gancho que despierte curiosidad o urgencia en el comprador — algo que haga que quieran abrirlo. NUNCA pongas el nombre del cliente en el asunto. Ejemplos de buen asunto: "¿Ya tiene Bluey en su punto de venta?", "La licencia que sus clientes ya están buscando", "Solución de exhibición que no ocupa piso"
- Máximo 3 párrafos cortos y directos
- Sin frases vacías en el cuerpo ("me dirijo a usted", "por medio de la presente", "en referencia a lo anterior")
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
    return NextResponse.json({ error: safeError(err) }, { status: 500 });
  }
}
