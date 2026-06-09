# PRD — SalesAI: Prospección, Seguimiento & Propuestas Creativas

**Versión:** 1.1  
**Fecha:** Junio 2026  
**Estado:** Borrador actualizado  
**Desarrollado en:** Claude Code  

---

## 1. Resumen Ejecutivo

Sistema de asistencia de ventas impulsado por IA diseñado para equipos B2B pequeños (1–5 vendedores). Centraliza la prospección, el seguimiento multicanal, la generación de materiales y la creación de propuestas comerciales creativas desde Monday CRM como interfaz principal. La IA redacta mensajes, genera presentaciones, guiones de video y propuestas personalizadas de exhibidores, exhibiciones y temporadas; el vendedor aprueba y envía. Integra Monday CRM, WhatsApp, LinkedIn y Email en un flujo unificado.

---

## 2. Problema

Los vendedores de la empresa enfrentan tres dolores simultáneos que reducen su efectividad:

1. **Olvido de follow-up:** No existe un sistema de alertas inteligentes que recuerde cuándo y cómo hacer seguimiento.
2. **Falta de contexto para comunicarse:** El vendedor no siempre sabe qué mensaje enviar en cada etapa del prospecto.
3. **Información dispersa:** Los prospectos, conversaciones, materiales y estados están en distintas herramientas sin sincronización.
4. **Propuestas creativas genéricas:** Las propuestas de exhibidores, exhibiciones y temporadas se crean manualmente sin personalización por cliente, lo que consume tiempo y reduce su efectividad.

Adicionalmente, la empresa está expandiéndose al mercado del Caribe anglófono, lo que añade la necesidad de comunicación bilingüe (español/inglés) gestionada de forma eficiente.

---

## 3. Objetivos del Producto

| # | Objetivo | Métrica de éxito |
|---|----------|-----------------|
| 1 | Aumentar la tasa de respuesta de prospectos | +30% en tasa de respuesta en 90 días |
| 2 | Reducir tiempo de redacción de mensajes y materiales | -60% tiempo invertido por vendedor |
| 3 | Eliminar prospectos "perdidos" por falta de seguimiento | 0 prospectos sin actividad > 7 días sin alerta |
| 4 | Centralizar toda la información en Monday | 100% de interacciones registradas automáticamente |
| 5 | Habilitar prospección activa con IA | Identificar ≥ 20 nuevos prospectos/semana por vendedor |
| 6 | Acelerar creación de propuestas creativas personalizadas | Reducir de horas a < 5 minutos por propuesta generada |

---

## 4. Usuarios

### Usuario Primario — Vendedor
- Equipo de 1–5 personas
- Trabaja desde Monday CRM a diario
- Usa WhatsApp, Email y LinkedIn para contactar clientes
- Necesita rapidez: no quiere aprender una herramienta nueva compleja

### Usuario Secundario — Gerente / Director Comercial
- Supervisa el pipeline y el desempeño del equipo
- Necesita visibilidad del estado de cada prospecto y la actividad del vendedor

---

## 5. Alcance — MVP (Fase 1)

### 5.1 Módulo de Prospección Inteligente

#### Cuota semanal mínima: 10 prospectos por vendedor
- **Dos vías de ingreso de prospectos:**
  - **Manual:** el vendedor agrega prospectos directamente en Monday (nombre, empresa, cargo conocido, canal disponible)
  - **IA automática:** cada semana el sistema sugiere nuevos prospectos B2B basados en el ICP definido, usando LinkedIn, directorios web y referencias internas; el vendedor aprueba cuáles incorporar
- Monday muestra un indicador semanal por vendedor: *"X / 10 prospectos nuevos esta semana"* con alerta si no se alcanza la cuota al jueves
- La IA sugiere perfiles de empresas/contactos ideales basados en el ICP (Ideal Customer Profile) definido
- Importación directa del prospecto a Monday con datos pre-llenados (empresa, cargo conocido, canal preferido, idioma detectado)
- Detección automática de idioma del prospecto (español/inglés) para ajustar comunicación

#### Objetivo de cada prospecto: identificar al Comprador de Categoría
Cada deal en Monday tiene un campo **"Contacto Clave"** que se considera vacío hasta que se registra el **nombre + cargo del comprador de categoría** (ej: Jefe de Compras, Category Manager, Gerente de Compras). Ese es el objetivo final de la secuencia de prospección.

#### Secuencia de contacto multicanal (por prospecto nuevo)
La secuencia se activa automáticamente al crear el deal y sigue este orden con **1–2 días entre cada intento**:

| Paso | Canal | Acción de IA | Espera |
|------|-------|-------------|--------|
| 1 | **WhatsApp** | IA redacta mensaje de primer contacto | 1–2 días sin respuesta |
| 2 | **WhatsApp** | IA redacta seguimiento corto ("¿pudiste ver mi mensaje?") | 1–2 días sin respuesta |
| 3 | **Email** | IA redacta email formal con más contexto de la empresa | 1–2 días sin respuesta |
| 4 | **Email** | IA redacta email de seguimiento con material adjunto | 1–2 días sin respuesta |
| 5 | **Llamada** | IA genera guion de llamada para el vendedor (no automatizada) | Vendedor registra resultado |
| 6 | **Llamada** | Segundo intento de llamada con guion alternativo | Vendedor registra resultado |

- Todos los mensajes de WhatsApp y Email los redacta la IA y el vendedor aprueba antes de enviar
- Los guiones de llamada son una guía para el vendedor; él marca en Monday si contestaron, no contestaron o dejó mensaje
- Si en algún paso el prospecto responde → la secuencia se pausa y el sistema alerta al vendedor

#### Cuando se identifica al Comprador de Categoría
Al registrar el nombre + cargo del comprador en el campo "Contacto Clave" de Monday:
1. **Monday marca automáticamente** el deal como *"Contacto Clave Identificado"* y pausa la secuencia de prospección general
2. **La IA genera inmediatamente** un mensaje de presentación personalizado dirigido específicamente a ese comprador (por el canal más apropiado según los datos disponibles)
3. El vendedor aprueba y envía ese primer mensaje al comprador
4. Se activa una nueva secuencia de seguimiento enfocada en agendar una reunión/presentación con ese comprador

### 5.2 Módulo de Seguimiento Multicanal
- **Secuencias de follow-up automáticas** con pasos definidos por etapa del pipeline
- La IA redacta el mensaje siguiente según: etapa actual, historial de interacciones, canal, idioma y perfil del prospecto
- El vendedor revisa y aprueba desde Monday antes de enviar
- Canales soportados:
  - **WhatsApp Business API** — mensajes de texto, audio transcrito, documentos
  - **Email** — con seguimiento de apertura y clics
  - **LinkedIn** — mensajes directos y solicitudes de conexión
- Alertas inteligentes al vendedor cuando un prospecto lleva X días sin respuesta (umbral configurable)
- Registro automático de todas las interacciones enviadas en el timeline de Monday

### 5.3 Módulo de Materiales de Ventas con IA
- **Generación de presentaciones personalizadas** por prospecto (nombre, empresa, industria, dolor específico) en formato PPTX
- **Generación de guiones de video** personalizados que el vendedor graba (1–2 minutos, estructura: gancho → problema → solución → CTA)
- Biblioteca de plantillas reutilizables (pitch inicial, propuesta, caso de éxito, cierre)
- Adjunto automático de materiales al mensaje de seguimiento generado por la IA
- **Tracking de apertura:** saber si el prospecto abrió la presentación o vio el video (vía link con tracking)

### 5.4 Módulo de Propuestas Creativas con IA ⭐ NUEVO

Este módulo permite a los vendedores generar propuestas comerciales creativas y personalizadas para tres tipos de oportunidades: **exhibidores físicos**, **exhibiciones/eventos/activaciones** y **propuestas por temporada** (Navidad, Verano, Regreso a clases, etc.).

#### Proceso de generación (3 pasos desde Monday)

**Paso 1 — IA analiza al cliente y sugiere conceptos**
La IA toma del deal en Monday:
- Historial de compras y categorías que maneja el cliente
- Tipo de negocio, tamaño de tienda y ubicación
- Temporada activa del calendario comercial
- Tendencias del mercado relevantes para su industria
- Notas del vendedor sobre el cliente (campo libre en Monday)

Con esa información, la IA genera **3 opciones creativas distintas**, cada una con:
- Nombre del concepto (ej: *"Isla de Verano Tropical"*, *"Torre de Impulso Navideña"*)
- Descripción creativa en 2–3 líneas
- Tipo de exhibidor o formato de activación sugerido
- Productos recomendados para destacar
- Estimado de impacto visual y argumento de venta

**Paso 2 — Vendedor selecciona y afina**
El vendedor revisa las 3 opciones en Monday, elige la más adecuada (o combina elementos de varias) y puede agregar notas adicionales de personalización antes de generar el documento final.

**Paso 3 — IA genera el documento final**
La IA produce la propuesta completa en el formato que elija el vendedor:
- **PPTX:** Presentación visual lista para mostrar al cliente, con portada personalizada (nombre del cliente, logo si está disponible), slides de concepto creativo, imágenes de referencia, descripción del exhibidor/activación, productos incluidos, y call to action
- **PDF:** Documento ejecutivo de propuesta con el mismo contenido, optimizado para enviar por WhatsApp o Email
- **Ambos:** Generados simultáneamente con un solo clic

#### Tipos de propuestas soportadas

| Tipo | Descripción | Ejemplos |
|------|-------------|---------|
| **Exhibidor físico** | Displays, stands, puntos de venta en tienda | Torre de producto, isla central, cabecera de góndola, display de mostrador |
| **Exhibición / Activación** | Eventos, activaciones de marca, experiencias en punto de venta | Degustación temática, activación interactiva, evento de lanzamiento |
| **Temporada** | Propuestas alineadas al calendario comercial | Navidad, Verano, Regreso a clases, Día de la Madre, Halloween, Black Friday |

#### Personalización profunda por cliente
Cada propuesta incluye obligatoriamente:
- Nombre del cliente y de su negocio en portada y contenido
- Referencias a sus categorías y productos actuales
- Argumentos de venta adaptados a su tipo de tienda y ubicación
- Idioma correcto (español o inglés según la región del cliente)
- Temporada o contexto de mercado vigente al momento de generarla

#### Tracking post-envío
- Link con tracking generado automáticamente al adjuntar la propuesta
- Alerta al vendedor cuando el cliente abre la propuesta
- Registro de cuántas veces fue abierta y desde qué dispositivo
- Si no la abre en 48h → sistema sugiere follow-up de recordatorio

### 5.5 Módulo de Retención y Seguimiento de Clientes Activos ⭐ NUEVO

Este módulo es distinto al de prospección: los clientes ya compran, pero el objetivo es **mantener la relación activa, generar nuevos pedidos y presentar propuestas nuevas de forma continua e insistente** sin perder ningún cliente por falta de contacto.

#### Clasificación de clientes por nivel de atención

| Categoría | Perfil | Frecuencia de contacto |
|-----------|--------|----------------------|
| **A — Top** | Clientes de mayor volumen y valor | Semanal (cada 7 días) |
| **B — Medios** | Clientes regulares con potencial de crecimiento | Quincenal (cada 15 días) |
| **C — Pequeños** | Clientes de menor volumen | Mensual (cada 30 días) |

- La categoría A/B/C se asigna en Monday por el vendedor y puede ajustarse en cualquier momento
- Monday muestra un semáforo de salud por cliente: 🟢 al día / 🟡 próximo a vencer / 🔴 vencido sin contacto
- El sistema alerta al vendedor 24h antes de que venza el ciclo de contacto de cada cliente

#### Secuencia de contacto por ciclo (orden fijo)

Cada ciclo inicia en WhatsApp y escala si no hay respuesta, con **1–2 días entre cada intento**:

| Paso | Canal | Contenido generado por IA |
|------|-------|--------------------------|
| 1 | **WhatsApp** | Mensaje de contacto del ciclo: saludo + propósito (pedido o propuesta nueva) |
| 2 | **Llamada** | Guion de llamada con contexto del cliente y objetivo del ciclo |
| 3 | **WhatsApp** | Segundo WhatsApp más directo: "¿Puedo pasarme a verte esta semana?" |
| 4 | **Visita presencial** | Brief de visita: historial del cliente, propuestas activas, objetivos |

- Los mensajes de WhatsApp son redactados por la IA y **aprobados por el vendedor** antes de enviar
- Los guiones de llamada y briefs de visita son orientativos; el vendedor registra el resultado en Monday
- **Si el cliente no responde en ningún paso → el ciclo NO se cierra.** El sistema reinicia el siguiente ciclo con un tono y enfoque distintos (la IA varía el mensaje para no repetirse), siempre requiriendo aprobación del vendedor

#### Doble objetivo por ciclo: pedidos + propuestas nuevas

Cada ciclo tiene uno de dos modos que la IA usa para personalizar el mensaje:

- **Modo Pedido:** enfocado en reabastecimiento, con referencia al último pedido y productos que podría necesitar según historial
- **Modo Propuesta:** enfocado en presentar una propuesta creativa nueva (exhibidor, temporada, activación); la IA puede generar la propuesta al mismo tiempo que el mensaje

El vendedor puede cambiar el modo antes de aprobar, o dejar que la IA alterne automáticamente entre ambos ciclo a ciclo.

#### Alerta de "Cliente en Riesgo"
Si un cliente activo lleva **3 ciclos completos consecutivos sin responder**, el sistema:
1. Marca el deal como 🔴 **"Cliente en Riesgo"** en Monday
2. Notifica al gerente/director comercial además del vendedor
3. La secuencia **nunca se detiene automáticamente** — siempre continúa con aprobación del vendedor
4. La IA genera un mensaje especial de re-engagement con tono diferente para ese momento crítico

### 5.6 Módulo de Alertas de Viaje por País ⭐ NUEVO

Este módulo analiza continuamente el estado de los clientes y el calendario comercial para recomendar **cuándo es el momento óptimo de viajar a cada país o región**, con al menos **1 mes de anticipación**, y prepara todo el material necesario para el viaje automáticamente.

#### Regiones cubiertas
- **Centroamérica:** Guatemala, Costa Rica, El Salvador, Honduras, Nicaragua
- **Caribe anglófono:** Jamaica, Barbados, Trinidad y Tobago, y otras islas del Caribe

#### Tres disparadores de alerta de viaje

La IA monitorea los tres factores simultáneamente por país/región y genera la alerta cuando se cumple **uno o más** de ellos con 1 mes de anticipación:

| Disparador | Descripción | Lógica |
|-----------|-------------|--------|
| **Temporada comercial** | Épocas donde los clientes deben comprar con anticipación | 60 días antes del inicio de temporada (Navidad, Verano, Regreso a clases, etc.) → alerta 1 mes antes del viaje ideal |
| **Inactividad de clientes** | Clientes en ese país que llevan demasiado tiempo sin pedido | Si ≥ 3 clientes del mismo país superan su ciclo de contacto sin respuesta → alerta de visita presencial regional |
| **Clientes en Riesgo** | Clientes marcados 🔴 en ese país | Si ≥ 2 clientes del mismo país están en estado "Cliente en Riesgo" → alerta urgente de viaje |

#### Contenido de la alerta
La alerta llega a **Monday** (notificación al vendedor responsable + al gerente comercial) e incluye:
- País/región afectada
- Motivo(s) que la dispararon (temporada / inactividad / riesgo)
- Fecha sugerida de viaje (calculada con 1 mes de anticipación al disparador)
- Lista preliminar de clientes a visitar con su estado actual (🟢🟡🔴)
- Nivel de urgencia: **Alta** (clientes en riesgo) / **Media** (inactividad) / **Planificada** (temporada)

#### Preparación automática al confirmar el viaje
Cuando el vendedor o gerente confirma el viaje en Monday, la IA prepara automáticamente un **Kit de Viaje** completo que incluye:

**1. Lista de clientes a visitar**
- Todos los clientes activos del país ordenados por prioridad (Riesgo → Categoría A → B → C)
- Estado actual de cada uno: última compra, último contacto, ciclo vencido, propuestas pendientes
- Datos de contacto del Comprador de Categoría si ya está identificado

**2. Propuestas creativas listas por cliente**
- La IA genera automáticamente una propuesta creativa personalizada para cada cliente a visitar (usando el Módulo 5.4)
- Formato PPTX y PDF listos para presentar en la visita
- Propuestas alineadas a la temporada vigente durante el período del viaje

**3. Calendario sugerido de visitas**
- Agenda diaria optimizada por zona geográfica dentro del país (para minimizar desplazamientos)
- Tiempo estimado por visita según categoría del cliente (A: 60 min / B: 45 min / C: 30 min)
- Espacio reservado para visitas no planificadas o reuniones adicionales
- Exportable a calendario desde Monday

#### Calendario comercial base (configurable)
El sistema incluye un calendario comercial pre-cargado con las temporadas clave por región:

| Temporada | Meses de venta fuerte | Viaje ideal |
|-----------|----------------------|-------------|
| Navidad / Fin de año | Noviembre–Diciembre | Octubre |
| Verano / Vacaciones | Junio–Julio | Mayo |
| Regreso a clases | Enero–Febrero | Diciembre |
| Semana Santa | Marzo–Abril | Febrero |
| Día de la Madre | Mayo | Abril |
| Black Friday | Noviembre | Octubre |

El gerente puede agregar, editar o desactivar temporadas desde Monday según las particularidades de cada mercado.

### 5.7 Módulo de Informes Semanales ⭐ NUEVO

Cada lunes temprano (7:00 AM) el sistema genera y entrega automáticamente un **informe ejecutivo de la semana anterior** al gerente/director comercial, desglosado por vendedor. Se entrega simultáneamente en Monday (notificación + documento adjunto) y por Email.

#### Contenido del informe por vendedor

Para cada vendedor del equipo, el informe muestra:

**Prospección**
- Prospectos nuevos agregados en la semana (meta: 10) con indicador ✅ o ⚠️
- Prospectos contactados por primera vez
- Tasa de respuesta de primeros contactos
- Prospectos donde se identificó al Comprador de Categoría

**Seguimiento de prospectos**
- Mensajes enviados por canal (WhatsApp / Email / Llamadas)
- Prospectos que respondieron vs. que siguen sin respuesta
- Prospectos nuevos marcados como "Inactivo" esta semana

**Clientes activos**
- Clientes contactados en el ciclo correspondiente
- Clientes que respondieron y registraron resultado
- Clientes que pasaron a estado 🔴 "Cliente en Riesgo"
- Ciclos vencidos sin atender (alerta de descuido)

**Propuestas creativas**
- Propuestas generadas y enviadas esta semana
- Propuestas abiertas por el cliente (tasa de apertura)
- Propuestas sin abrir con seguimiento pendiente

**Visitas y viajes**
- Visitas presenciales realizadas y registradas
- Alertas de viaje generadas o confirmadas

#### Resumen ejecutivo general (encabezado del informe)
Antes del detalle por vendedor, el informe incluye una sección de 5–8 líneas redactada por la IA con:
- Los 3 logros más destacados de la semana del equipo
- Las 2–3 alertas o riesgos más urgentes a atender esta semana
- Comparativa simple vs. semana anterior (mejor / igual / peor)

#### Formato de entrega
- **Monday:** notificación al gerente con el informe como documento adjunto en el board de gestión
- **Email:** email automático al gerente con el informe en el cuerpo del mensaje (formato HTML legible) + PDF adjunto descargable
- **Hora de envío:** todos los lunes a las 7:00 AM hora local de Panamá

### 5.8 Integración con Monday CRM (Interfaz Principal)
- App nativa o integración profunda en Monday (columnas, automatizaciones, vistas)
- Panel de "Bandeja de aprobaciones" en Monday: el vendedor ve mensajes listos para enviar de todos sus prospectos
- Vista de pipeline con indicadores de salud (días sin contacto, materiales enviados, tasa de apertura)
- Automatizaciones de Monday disparando acciones de la IA (ej: cuando prospecto pasa a etapa "Propuesta enviada" → IA genera follow-up de 3 días)
- Sincronización bidireccional: respuestas del prospecto actualizan el estado en Monday

---

## 6. Alcance — Fase 2 (Post-MVP)

- Generación automática de videos con avatares IA (sin grabación del vendedor)
- Integración con Google Calendar para agendar llamadas directamente desde el flujo de seguimiento
- Scoring de prospectos con IA (probabilidad de cierre)
- Reportes de rendimiento por vendedor y por canal
- Expansión a más idiomas del Caribe (francés, neerlandés)

---

## 7. Flujos Principales

### Flujo A — Nuevo Prospecto (Manual o Sugerido por IA)
```
1. Vendedor agrega prospecto en Monday O aprueba sugerencia de la IA
2. IA crea el deal con datos disponibles; campo "Contacto Clave" vacío
3. IA genera mensaje de primer contacto por WhatsApp (idioma detectado)
4. Vendedor aprueba y envía
5. Si no responde en 1–2 días → IA genera segundo WhatsApp ("¿pudiste ver mi mensaje?")
6. Si no responde → IA genera Email formal + material adjunto
7. Si no responde → IA genera segundo Email de seguimiento
8. Si no responde → IA genera guion de llamada para el vendedor
9. Vendedor llama y registra resultado en Monday (contestó / no contestó / dejó mensaje)
10. Si no responde en segunda llamada → deal pasa a "Inactivo" con decisión manual
--- En cualquier punto si se identifica al Comprador de Categoría ---
11. Vendedor registra nombre + cargo en campo "Contacto Clave"
12. Monday marca deal como "Contacto Clave Identificado" y pausa secuencia actual
13. IA genera mensaje de presentación personalizado para ese comprador
14. Vendedor aprueba y envía → inicia nueva secuencia hacia reunión/presentación
```

### Flujo B — Seguimiento de Prospecto Existente
```
1. Monday detecta que el prospecto lleva N días sin actividad
2. Sistema alerta al vendedor con notificación
3. IA genera mensaje de seguimiento contextualizado (según historial)
4. IA adjunta material relevante para la etapa (presentación o guion de video)
5. Vendedor revisa, ajusta si lo desea, y aprueba
6. Vendedor envía por el canal adecuado (WhatsApp / Email / LinkedIn)
7. Sistema registra y actualiza Monday automáticamente
8. Si no hay respuesta en X días → repite ciclo con mensaje diferente
```

### Flujo C — Generación de Material de Ventas
```
1. Vendedor (o automatización) solicita material para un prospecto específico
2. IA toma datos del prospecto desde Monday: empresa, industria, etapa, dolor
3. IA genera presentación PPTX personalizada + guion de video
4. Vendedor revisa materiales en Monday
5. Vendedor graba video (si aplica) o usa solo la presentación
6. Sistema genera link con tracking para adjuntar al mensaje
7. Al enviar: sistema monitorea apertura/visualización
8. Si el prospecto abre → alerta al vendedor para hacer follow-up inmediato
```

### Flujo D — Generación de Propuesta Creativa
```
1. Vendedor abre deal de un cliente en Monday y hace clic en "Generar propuesta creativa"
2. Selecciona el tipo: Exhibidor / Exhibición / Temporada
3. IA analiza: historial del cliente, tipo de negocio, ubicación, temporada activa y notas del vendedor
4. IA presenta 3 opciones creativas con nombre, concepto y productos sugeridos (< 15 seg)
5. Vendedor selecciona la opción preferida y agrega ajustes opcionales
6. Vendedor elige formato de salida: PPTX, PDF o ambos
7. IA genera el documento final personalizado (< 30 seg)
8. Vendedor revisa, descarga y adjunta al mensaje de envío
9. Sistema genera link con tracking para la propuesta
10. Vendedor aprueba y envía por el canal del cliente (WhatsApp / Email)
11. Sistema monitorea apertura y alerta al vendedor cuando el cliente la abre
12. Si no abre en 48h → IA sugiere mensaje de seguimiento de recordatorio
```

### Flujo E — Ciclo de Contacto con Cliente Activo
```
1. Sistema detecta que el ciclo de un cliente está por vencer (24h antes) → alerta al vendedor
2. IA determina el modo del ciclo: Pedido o Propuesta (o vendedor lo cambia manualmente)
3. IA genera mensaje de WhatsApp personalizado (historial + modo del ciclo + idioma)
4. Vendedor aprueba y envía
   → Si responde: vendedor registra resultado, se programa el próximo ciclo
   → Si no responde en 1–2 días: continúa al paso 5
5. IA genera guion de llamada para el vendedor
6. Vendedor llama y registra resultado en Monday
   → Si responde: se programa el próximo ciclo
   → Si no responde en 1–2 días: continúa al paso 7
7. IA genera segundo WhatsApp más directo ("¿Puedo pasarme a verte?")
8. Vendedor aprueba y envía
   → Si responde: se programa el próximo ciclo
   → Si no responde en 1–2 días: continúa al paso 9
9. IA genera brief de visita presencial con contexto completo del cliente
10. Vendedor agenda visita y registra resultado
    → Ciclo completado → sistema programa el próximo ciclo según categoría A/B/C
    → Si es el 3er ciclo consecutivo sin respuesta → marcar "Cliente en Riesgo" + notificar gerente
11. IA genera mensaje especial de re-engagement → vendedor aprueba → ciclo continúa sin parar
```

### Flujo F — Alerta y Preparación de Viaje por País
```
1. Sistema monitorea diariamente por país: temporadas, inactividad y clientes en riesgo
2. Se cumple uno o más disparadores con 1 mes de anticipación al momento ideal de viaje
3. Sistema genera alerta en Monday → notifica al vendedor responsable + gerente comercial
4. Alerta incluye: país, motivo(s), fecha sugerida, lista preliminar de clientes y nivel de urgencia
5. Vendedor o gerente revisa la alerta y confirma el viaje (o lo reprograma) en Monday
6. Al confirmar → IA genera el Kit de Viaje completo:
   a. Lista de clientes ordenada por prioridad con su estado actual
   b. Propuesta creativa personalizada para cada cliente (PPTX + PDF)
   c. Calendario diario de visitas optimizado por zona geográfica
7. Vendedor revisa el Kit de Viaje en Monday y ajusta lo necesario
8. Durante el viaje: vendedor registra resultado de cada visita en Monday desde el móvil
9. Post-viaje: sistema actualiza automáticamente el estado de todos los clientes visitados
10. IA genera resumen de resultados del viaje para el gerente (clientes visitados, pedidos, propuestas entregadas)
```

### Integraciones Requeridas
| Sistema | Tipo de integración | Uso |
|---------|-------------------|-----|
| Monday CRM | API oficial (GraphQL) | Interfaz principal, datos de prospectos, automatizaciones |
| WhatsApp Business API | Meta Cloud API | Envío/recepción de mensajes |
| LinkedIn | LinkedIn API / automatización | Búsqueda de prospectos, mensajes DM |
| Gmail / SMTP | Gmail API / OAuth | Envío de emails con tracking |
| Anthropic Claude API | REST API | Motor de IA para redacción y generación de contenido |
| Servicio de tracking de links | Bitly API o propio | Seguimiento de apertura de materiales |
| PowerPoint / PPTX | PptxGenJS o python-pptx | Generación de presentaciones y propuestas creativas |
| PDF Generator | WeasyPrint o Puppeteer | Generación de propuestas en formato PDF ejecutivo |

### Stack Tecnológico Recomendado para Claude Code
- **Backend:** Node.js o Python (FastAPI)
- **Base de datos:** PostgreSQL (estado de secuencias, historial de mensajes)
- **Frontend Monday:** Monday Apps SDK (iframe app dentro de Monday)
- **Queue de mensajes:** Redis + BullMQ (para manejo de secuencias y reintentos)
- **Hosting:** Railway, Render o similar (fácil deploy desde Claude Code)

### Requisitos No Funcionales
- Tiempo de respuesta de la IA para generar un mensaje: < 10 segundos
- Disponibilidad: 99% uptime en horario laboral (lunes–sábado, 7am–8pm)
- Todos los datos almacenados en servidores con cumplimiento GDPR/LGPD
- Logs de auditoría de todas las acciones del vendedor (qué aprobó, qué modificó)

---

## 9. Reglas de Negocio

1. **Ningún mensaje se envía sin aprobación explícita del vendedor** (clic en "Aprobar y enviar" en Monday)
2. **Límite de intentos de seguimiento:** máximo 5 mensajes sin respuesta por prospecto antes de marcar como "Inactivo" y requerir decisión manual del vendedor
3. **Detección de idioma:** si el nombre de dominio o país del prospecto es anglófono (Barbados, Jamaica, Trinidad, etc.) → la IA genera el contenido en inglés por defecto
4. **Personalización mínima obligatoria:** todo mensaje generado por IA debe incluir al menos el nombre del contacto y el nombre de su empresa
5. **Un canal activo a la vez:** no enviar el mismo mensaje por WhatsApp y email simultáneamente; el sistema respeta el canal primario del prospecto
6. **Materiales con tracking:** toda presentación o video enviado debe ir con link de tracking; no se permiten adjuntos directos sin seguimiento
7. **Actualización automática de etapa:** si el prospecto responde a cualquier canal → Monday se actualiza automáticamente a "Respondió"
8. **Propuestas creativas siempre en 3 opciones:** la IA siempre genera exactamente 3 conceptos distintos por solicitud; el vendedor no puede pedir menos ni más en el MVP
9. **Personalización mínima en propuestas:** toda propuesta creativa debe incluir nombre del cliente, tipo de negocio y al menos un producto o categoría específica del cliente; la IA no genera propuestas genéricas sin datos del deal
10. **Temporada vigente por defecto:** si el vendedor no especifica temporada, la IA usa la temporada comercial más próxima del calendario según la fecha actual
11. **Propuestas en idioma del cliente:** las propuestas creativas respetan la misma lógica de idioma que los mensajes (español para Latinoamérica, inglés para clientes del Caribe anglófono)
12. **Cuota semanal mínima:** cada vendedor debe tener al menos 10 prospectos nuevos por semana; Monday muestra alerta si al jueves no se ha alcanzado la cuota
13. **Secuencia de canales fija:** el orden de contacto es siempre WhatsApp → Email → Llamada, con 1–2 días de espera entre cada intento; no se puede saltar canales salvo que el vendedor lo anule manualmente
14. **Pausa automática al identificar Comprador de Categoría:** en el momento en que se registra el nombre + cargo del comprador en Monday, la secuencia general se pausa y la IA genera de inmediato el primer mensaje dirigido a esa persona
15. **Guiones de llamada son orientativos:** las llamadas nunca se automatizan; la IA genera el guion como apoyo y el vendedor registra el resultado manualmente en Monday
16. **Clasificación A/B/C obligatoria:** todo cliente activo debe tener una categoría asignada en Monday; sin categoría el sistema no puede programar su ciclo de contacto
17. **Ciclos de clientes activos nunca se detienen:** a diferencia de los prospectos (que se marcan "Inactivo" tras 5 intentos), los clientes activos siempre continúan con nuevo ciclo tras aprobación del vendedor
18. **Alternancia automática Pedido/Propuesta:** si el vendedor no especifica el modo del ciclo, la IA alterna automáticamente entre Modo Pedido y Modo Propuesta ciclo a ciclo para mantener variedad
19. **Alerta de Cliente en Riesgo al gerente:** tras 3 ciclos consecutivos sin respuesta, la notificación llega tanto al vendedor como al gerente/director comercial; no es solo interna del vendedor
20. **Brief de visita obligatorio:** antes de toda visita presencial a cliente activo, la IA debe generar el brief; el vendedor no puede marcar la visita como realizada sin haber visto el brief en Monday
21. **Alertas de viaje con 1 mes de anticipación:** el sistema calcula la fecha ideal de viaje por país y genera la alerta exactamente 30 días antes para dar tiempo de organización
22. **Triple disparador de viaje:** una alerta de viaje se genera si se cumple al menos uno de tres condiciones: temporada comercial próxima, ≥ 3 clientes inactivos en el mismo país, o ≥ 2 clientes en estado "Cliente en Riesgo" en el mismo país
23. **Kit de Viaje obligatorio antes de salir:** ningún viaje queda confirmado en Monday sin que la IA haya generado el Kit completo (lista + propuestas + calendario); el vendedor debe marcarlo como revisado
24. **Calendario comercial editable:** el gerente puede agregar, modificar o desactivar temporadas del calendario base desde Monday; los cambios aplican inmediatamente a las alertas futuras
25. **Resumen post-viaje automático:** al cerrar un viaje en Monday, la IA genera automáticamente un resumen de resultados para el gerente sin que el vendedor tenga que redactarlo
26. **Informe semanal automático e inamovible:** el informe se genera y envía todos los lunes a las 7:00 AM sin intervención manual; no requiere que nadie lo solicite
27. **El informe refleja solo actividad registrada en Monday:** si el vendedor no registró una llamada o visita en Monday, no aparece en el informe; esto incentiva el registro correcto
28. **Informe solo para el gerente:** los vendedores no reciben el informe comparativo; cada uno puede ver solo su propio desempeño en Monday si lo consulta directamente

---

## 10. Criterios de Aceptación (MVP)

- [ ] Un vendedor puede buscar prospectos desde Monday y que aparezcan importados como deals
- [ ] La IA genera un mensaje de primer contacto por canal en < 10 seg y aparece en la bandeja de aprobaciones
- [ ] El vendedor puede aprobar/rechazar/editar el mensaje desde Monday sin salir de la plataforma
- [ ] El sistema registra cada mensaje enviado en el timeline del deal en Monday
- [ ] El vendedor recibe alerta en Monday cuando un prospecto lleva 3+ días sin respuesta
- [ ] La IA genera una presentación PPTX personalizada descargable en < 30 seg
- [ ] La IA genera un guion de video estructurado (gancho, problema, solución, CTA) por prospecto
- [ ] El sistema detecta si el prospecto abrió el link de la presentación y notifica al vendedor
- [ ] Los mensajes se generan correctamente en español e inglés según la región del prospecto
- [ ] El pipeline de Monday refleja el estado actualizado de cada prospecto en tiempo real
- [ ] La IA genera exactamente 3 opciones creativas distintas por solicitud en < 15 seg usando datos del deal
- [ ] Cada opción creativa incluye: nombre del concepto, descripción, tipo de exhibidor/activación y productos sugeridos
- [ ] El vendedor puede seleccionar una opción y solicitar PPTX, PDF o ambos desde Monday
- [ ] La propuesta final generada incluye nombre del cliente, productos reales y temporada vigente
- [ ] El documento se genera en < 30 seg y está disponible para descarga desde Monday
- [ ] El sistema genera link con tracking para cada propuesta enviada
- [ ] El vendedor recibe alerta cuando el cliente abre la propuesta
- [ ] Si el cliente no abre la propuesta en 48h, el sistema sugiere un mensaje de seguimiento
- [ ] Monday muestra indicador semanal "X / 10 prospectos nuevos" por vendedor con alerta al jueves si no se alcanza
- [ ] La IA sugiere al menos 10 nuevos prospectos por semana por vendedor según el ICP definido
- [ ] Al crear un deal, la secuencia WhatsApp → Email → Llamada se activa automáticamente con 1–2 días entre pasos
- [ ] El campo "Contacto Clave" en Monday registra nombre + cargo del comprador de categoría
- [ ] Al completar "Contacto Clave", Monday cambia el estado a "Contacto Clave Identificado" y pausa la secuencia
- [ ] La IA genera en < 10 seg un mensaje de presentación personalizado para el comprador identificado
- [ ] El vendedor puede registrar el resultado de cada llamada (contestó / no contestó / dejó mensaje) desde Monday
- [ ] La IA genera guion de llamada estructurado por prospecto antes de cada intento telefónico
- [ ] Todo cliente activo tiene campo de categoría A/B/C en Monday con ciclo de contacto asignado
- [ ] Monday muestra semáforo 🟢🟡🔴 de salud de contacto por cada cliente activo
- [ ] El vendedor recibe alerta 24h antes de que venza el ciclo de contacto de un cliente
- [ ] La secuencia WhatsApp → Llamada → WhatsApp → Visita se activa automáticamente al iniciar cada ciclo
- [ ] La IA genera brief de visita presencial con historial, propuestas activas y objetivos del cliente
- [ ] El modo del ciclo (Pedido / Propuesta) puede ser asignado por el vendedor o alternado automáticamente por la IA
- [ ] Tras 3 ciclos sin respuesta el deal se marca "Cliente en Riesgo" y se notifica al gerente
- [ ] La IA genera mensaje especial de re-engagement para clientes en riesgo con tono diferenciado
- [ ] Los ciclos de clientes activos nunca se detienen automáticamente; siempre requieren aprobación del vendedor para continuar
- [ ] El sistema monitorea diariamente por país los tres disparadores: temporada, inactividad y clientes en riesgo
- [ ] Las alertas de viaje se generan con exactamente 30 días de anticipación a la fecha ideal
- [ ] La alerta llega en Monday tanto al vendedor responsable como al gerente comercial
- [ ] La alerta indica: país, motivo(s), fecha sugerida de viaje y nivel de urgencia (Alta/Media/Planificada)
- [ ] Al confirmar un viaje, la IA genera el Kit de Viaje completo en < 2 minutos
- [ ] El Kit de Viaje incluye lista de clientes ordenada por prioridad con estado actual
- [ ] El Kit de Viaje incluye propuesta creativa PPTX + PDF personalizada para cada cliente a visitar
- [ ] El Kit de Viaje incluye calendario diario de visitas optimizado por zona geográfica
- [ ] El gerente puede agregar/editar/desactivar temporadas del calendario comercial desde Monday
- [ ] Post-viaje: la IA genera resumen automático de resultados para el gerente al cerrar el viaje en Monday
- [ ] El sistema genera y envía el informe semanal automáticamente todos los lunes a las 7:00 AM hora Panamá
- [ ] El informe llega simultáneamente en Monday (notificación + adjunto) y por Email (HTML + PDF)
- [ ] El informe desglosa resultados por vendedor en 5 secciones: prospección, seguimiento, clientes activos, propuestas y visitas
- [ ] Cada sección del informe incluye indicadores ✅/⚠️ según cumplimiento de metas
- [ ] El encabezado del informe incluye resumen ejecutivo de la IA con logros, alertas y comparativa vs. semana anterior
- [ ] El informe solo refleja actividad registrada en Monday; lo no registrado no aparece

---

## 11. Fuera de Alcance (MVP)

- Llamadas telefónicas automatizadas
- Generación de videos con avatares IA
- Integración con Salesforce u otros CRM
- App móvil nativa (se usa Monday mobile)
- Sistema de facturación o contratos
- Publicación en redes sociales

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| LinkedIn bloquea automatización | Media | Alto | Usar LinkedIn API oficial; limitar acciones a < 50/día |
| WhatsApp Business API rechaza cuenta | Baja | Alto | Registrar cuenta de negocio verificada antes del desarrollo |
| Vendedores no adoptan la herramienta | Media | Alto | Onboarding con el equipo; hacer la bandeja de aprobaciones en Monday muy simple |
| Calidad de mensajes IA no es suficiente | Baja | Medio | Iterar prompts con ejemplos reales del equipo en primeras semanas |
| Costos de API escalan rápido | Baja | Medio | Implementar caché de plantillas; limitar tokens por prospecto |

---

## 13. Glosario

| Término | Definición |
|---------|-----------|
| ICP | Ideal Customer Profile — perfil de empresa/cliente ideal para la empresa |
| Follow-up | Mensaje de seguimiento enviado después del primer contacto sin respuesta |
| Deal | Registro de un prospecto/oportunidad dentro de Monday CRM |
| Secuencia | Serie de mensajes programados con tiempos y canales específicos por etapa |
| Bandeja de aprobaciones | Vista en Monday donde el vendedor ve y aprueba mensajes generados por IA |
| Tracking | Seguimiento de si el prospecto abrió/vio el material enviado |
| Propuesta Creativa | Documento personalizado (PPTX/PDF) con conceptos de exhibidores, exhibiciones o temporadas generado por IA |
| Exhibidor | Display físico, stand o elemento de punto de venta para presentar productos en tienda |
| Activación | Evento o experiencia en punto de venta para generar interés y ventas |
| Temporada | Período del calendario comercial con oportunidad de venta temática (Navidad, Verano, etc.) |
| Concepto Creativo | Una de las 3 ideas que genera la IA como propuesta, con nombre, descripción y productos sugeridos |
| Comprador de Categoría | Persona dentro de la empresa prospecto con poder de decisión de compra para la categoría que vende la empresa (ej: Category Manager, Jefe de Compras) |
| Contacto Clave | Campo en Monday donde se registra el nombre + cargo del Comprador de Categoría; su llenado activa una nueva secuencia de seguimiento |
| Cuota Semanal | Meta mínima de 10 prospectos nuevos por vendedor por semana |
| Guion de Llamada | Documento generado por la IA con estructura de conversación telefónica para que el vendedor use como guía; no es automatizado |
| Cliente Activo | Empresa que ya tiene relación comercial con la empresa y realiza pedidos; se gestiona en el módulo de Retención |
| Ciclo de Contacto | Período programado de contacto con un cliente activo según su categoría (A: 7 días / B: 15 días / C: 30 días) |
| Categoría A/B/C | Clasificación del cliente activo según su volumen y valor; determina la frecuencia de contacto |
| Cliente en Riesgo | Cliente activo que lleva 3 ciclos consecutivos completos sin responder; activa alerta al gerente |
| Brief de Visita | Documento generado por la IA con el contexto completo del cliente antes de una visita presencial |
| Modo Pedido | Modo del ciclo de contacto enfocado en reabastecimiento y nuevo pedido |
| Modo Propuesta | Modo del ciclo de contacto enfocado en presentar una propuesta creativa nueva |
| Alerta de Viaje | Notificación generada por el sistema cuando se detecta que es momento óptimo de viajar a un país específico |
| Kit de Viaje | Paquete completo generado por la IA al confirmar un viaje: lista de clientes + propuestas + calendario de visitas |
| Calendario Comercial | Registro de temporadas de venta fuerte por región, usado para calcular alertas de viaje con anticipación |
| Disparador de Viaje | Condición que activa una alerta de viaje: temporada próxima, inactividad de clientes, o clientes en riesgo en el mismo país |
| Informe Semanal | Documento ejecutivo generado automáticamente cada lunes con el desempeño de cada vendedor de la semana anterior |

---

*Documento generado con asistencia de Claude · v1.5 — Módulo de Informes Semanales agregado · Para desarrollo en Claude Code*
