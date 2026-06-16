import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSeasonContext } from "@/lib/seasons";
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
    const { deal, vendorName, channel = "email", strategy } = await req.json() as {
      channel?: "email" | "whatsapp";
      vendorName?: string;
      strategy?: {
        titulo: string;
        hipotesis: string;
        enfoque: string;
        puntosClave: string[];
      };
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

    const isWhatsapp = channel === "whatsapp";

    const prompt = `Eres un vendedor B2B de Sicoben Ediciones escribiendo directamente a un cliente o prospecto. Conoces la empresa a fondo y escribes como alguien de adentro — con naturalidad, calidez y confianza en el producto.

SOBRE SICOBEN EDICIONES:
Somos una empresa familiar con más de 60 años de trayectoria. Operamos en 15 países de América Latina y el Caribe, atendiendo a distribuidores y retailers. Todos los pedidos se despachan desde la Zona Libre de Colón en Panamá — un hub logístico clave en América Latina que garantiza rapidez y eficiencia. Ofrecemos soluciones personalizadas a medida según las necesidades de cada cliente. Cada año lanzamos cientos de productos nuevos en diversos formatos y diseños.

PROPÓSITO DE MARCA:
Somos creadores de ideas y recursos para transformar la curiosidad en descubrimiento. Un puente para enriquecer la conexión entre adultos y niños. Creemos que la educación debe ser divertida y que los valores y la magia caben en la misma mesa. "Porque en la aventura de crecer todos somos protagonistas."

MARCA PROPIA Y LICENCIAS:
- Marca exclusiva Sicoben: libros educativos y de entretenimiento con diseños originales, alta rotación
- Disney: Princesas, Stitch, Rey León, Disney Junior
- Mattel: Barbie, Hot Wheels, Fisher-Price
- Nickelodeon: Paw Patrol, Bob Esponja
- BBC Studios: Bluey (licencia en rápido crecimiento)
- Universal: Gabby's Dollhouse, Minions, Cómo Entrenar a Tu Dragón, Trolls

CATEGORÍAS DE PRODUCTOS:
- ACTIVIDAD: Especializada en aprendizaje activo. Fortalece psicomotricidad fina, matemáticas y caligrafía. Introduce números, letras, colores y formas. Incluye stickers. Libros de 16 a 48 páginas. "Diversión garantizada, aprendizaje asegurado."
- LECTURA: Desarrollo lector infantil. Textos breves para primeros lectores e historias largas para lectores avanzados. Tapa dura y blanda. Disponibles en español e inglés.
- COLOREAR: Libros de 16 a 80 páginas. Variedad de formatos, algunos con stickers. Temáticas amplias y licencias populares. "El formato ideal para explorar, aprender y disfrutar coloreando sin límites."
- PACKS: Combinación de libro de colorear o actividades + complemento especial (lápices, stickers, rompecabezas o juegos). Perfectos como regalo práctico y atractivo. Fáciles de exhibir en ristras, exhibidores o ganchos.
- AQUA BOOKS Y MAGIC PEN: Colorea con agua (Aqua Books) o con marcador mágico que revela colores (Magic Pen). Reutilizables. Para niños de 3 a 6 años. Estimulan la creatividad. "Una experiencia mágica que encantará a todos."

VENTAJAS OPERATIVAS CLAVE (úsalas cuando sean relevantes para el cliente):
- Surtido en empaques pequeños: cajas de aprox. 24 unidades surtidas (si son 2 títulos = 12 de cada uno) — mínimo de inversión, máxima variedad
- Coleccionables: colecciones de 2+ libros con temática común que generan recompra natural
- Doble código de barras: uno por título, uno por colección — facilita la gestión de inventario del cliente
- Gran número de colecciones disponible en español e inglés
- Soluciones de exhibición adaptables a cualquier espacio: Ristras, PDQ, Self PDQ, Exhibidor Colgante, Exhibidor de Piso, Pallet Display

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

${strategy ? `ESTRATEGIA SELECCIONADA POR EL VENDEDOR:
El vendedor eligió este enfoque específico para este mensaje:
- Enfoque: ${strategy.titulo}
- Por qué no compra (hipótesis): ${strategy.hipotesis}
- Cómo abordarlo: ${strategy.enfoque}
- Puntos clave a incluir: ${strategy.puntosClave.join(" · ")}

INSTRUCCIÓN CRÍTICA: Este mensaje DEBE seguir fielmente esta estrategia. El enfoque y los puntos clave deben guiar el ángulo y contenido del mensaje.` : `PRIORIDAD PARA ESTE EMAIL:
${prioridad}`}

${isWhatsapp ? `REGLAS (mensaje WhatsApp):
- Tono muy casual y directo, como un WhatsApp real entre conocidos de negocios
- MÁXIMO 3-4 líneas de texto total
- NO uses formato markdown (sin **, ni _, ni guiones de lista)
- No uses saludo formal largo — ve directo al punto
- Firma con el nombre: ${vendor}
- Si el cliente es del Caribe anglófono → redacta en inglés

Responde SOLO con JSON, sin texto adicional antes o después:
{
  "body": "mensaje WhatsApp en texto plano, máximo 4 líneas"
}` : `REGLAS:
- Tono cercano, de colega de negocio — no de vendedor presionando
- ESTRUCTURA OBLIGATORIA (no omitir ningún paso):
  1. Saludo por nombre: "Hola [Nombre]," — si no hay nombre, usa "Hola," o "Hi," (en inglés)
  2. Línea de apertura humana OBLIGATORIA — esta línea va sola, antes del cuerpo, y debe ser cálida y genuina. Ejemplos: "Espero que estés muy bien." / "Espero que el negocio esté yendo excelente." / "Hope you're doing great!" / "Hope business is going well on your end!" — NO saltar esta línea bajo ninguna circunstancia
  3. El cuerpo del mensaje (máximo 2 párrafos)
  4. Cierre con llamada a la acción concreta
  5. Firma con el nombre: ${vendor}
- El asunto debe reflejar el ángulo real del email — nada genérico
- Evitar frases corporativas vacías ("por medio de la presente", "me dirijo a usted con el fin de")
- Si el cliente es del Caribe anglófono (Barbados, Jamaica, Trinidad, etc.) → redacta en inglés

El campo "body" DEBE comenzar SIEMPRE con estas dos líneas antes del contenido:
  Línea 1: saludo ("Hola [Nombre]," / "Hi [Nombre],")
  Línea 2 (línea en blanco)
  Línea 3: frase de bienvenida cálida ("Espero que estés muy bien." / "Hope you're doing well!")
  Línea 4 (línea en blanco)
  Línea 5 en adelante: el cuerpo del mensaje

EJEMPLO CORRECTO de inicio del body:
"Hi Maria,\\n\\nHope you're doing great!\\n\\nQuick question about..."

INCORRECTO (nunca hagas esto):
"Quick question about..." ← falta saludo y bienvenida

Responde SOLO con JSON, sin texto adicional antes o después:
{
  "subject": "asunto del email (máximo 60 caracteres)",
  "body": "cuerpo completo del email con saltos de línea representados como \\n"
}`}`;

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

    const parsed = JSON.parse(jsonMatch[0]) as { subject?: string; body: string };
    if (!parsed.body) throw new Error("El modelo no generó el cuerpo del mensaje");

    return NextResponse.json({ subject: parsed.subject ?? "", body: parsed.body });
  } catch (err) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 });
  }
}
