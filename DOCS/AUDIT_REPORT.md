# Auditoría de SalesAI — Estado del Proyecto

**Fecha:** 2026-06-11  
**Proyecto:** SalesAI — Sistema de asistencia de ventas B2B con IA  
**Versión auditada:** branch `staging`  
**Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Claude API + Monday CRM + Resend

---

## RESUMEN EJECUTIVO

El proyecto tiene **2 de 8 módulos del MASTERPLAN completamente operativos** (Módulo 1 — Prospección y Módulo 2 — Seguimiento Multicanal). Se han implementado además varias capacidades de IA que no estaban explícitamente descritas en el MASTERPLAN original. Los módulos 3 al 7 están visibles en el dashboard como tarjetas de navegación pero no tienen páginas ni lógica implementada. La infraestructura base (Monday API, Resend, Supabase, mock data) está en buen estado.

---

## 1. FUNCIONALIDADES COMPLETADAS

Estas funcionalidades están implementadas, conectadas y funcionales.

### Dashboard principal (`/dashboard`)
- Pantalla de bienvenida/login con nombre de vendedor
- Dashboard con tarjetas de los 8 módulos (con badges "Nuevo" donde corresponde)
- Navegación entre módulos

### Módulo 1 — Prospección Inteligente (`/dashboard/prospeccion`)
- Vista completa de prospectos con datos desde Monday CRM (board real)
- Soporte para modo mock local (`NEXT_PUBLIC_USE_MOCK=true`)
- Semáforo de salud de contacto (verde/amarillo/rojo) basado en fecha de último contacto
- Panel de cuota semanal por país (meta: 10 prospectos nuevos/semana, alerta desde el jueves)
- Filtros por estado, vendedor y búsqueda libre
- Agrupación de prospectos en "Nuevos (sin primer contacto)" y "En seguimiento"
- Modal de notificación individual: publica update en el item de Monday + notifica al vendedor asignado + actualiza fecha de último contacto
- Modal de notificación masiva con progress bar y respeto al rate limit de Monday (1 req/seg)
- Modal de email generado por IA (Claude): genera asunto + cuerpo personalizado en < 10 seg
  - Considera situación: primer contacto / seguimiento sin respuesta / retomar contacto frío / contacto activo
  - Detecta idioma según país (inglés para Caribe anglófono)
  - Incluye link al catálogo del país (obtenido dinámicamente de Monday)
  - El email se abre pre-llenado en el cliente de correo del vendedor (mailto:) con CC al supervisor
  - No se envía sin aprobación explícita
- Polling automático cada 45 segundos para detectar nuevos "Contacto Efectivo"
  - Toast in-app tipo WhatsApp con link al item en Monday
  - Notificación del navegador (con permiso)
- Sub-vista: Prospectos Nuevos IA (`/dashboard/prospeccion/nuevos`)
  - Lista de 10 sugerencias de prospecto por semana con razón IA, país, categoría, canal y cargo objetivo
  - Barra de progreso de cuota semanal
  - Botón "Agregar al pipeline" por prospecto (estado local en sesión)
  - Soporte bilingüe (badge EN para anglófonos del Caribe)

### Módulo 2 — Seguimiento Multicanal (`/dashboard/seguimiento`)
- Vista de deals internacionales con datos desde Monday CRM (board real)
- Soporte para modo mock local
- Semáforo de próxima acción (verde/amarillo/rojo) basado en fecha de próxima acción
- Panel semanal por país: progreso de deals contactados esta semana
- Filtros por fase, país y búsqueda libre
- Estadísticas: total, acciones vencidas, acciones en 3 días, sin próxima acción
- **Modal "Estrategias de venta" (Diagnóstico IA):** genera 3 hipótesis sobre por qué el cliente no compra, con enfoque, puntos clave, canal recomendado y urgencia (alta/media/baja)
- **Modal "Seguimiento" (email/WhatsApp):** genera borrador de mensaje con IA, con switcher de canal
  - Envío real de email via Resend con CC al supervisor
  - WhatsApp: copia al portapapeles
  - Registro automático en Monday (update en timeline + actualización fecha de último contacto)
  - Integra estrategia elegida en la redacción si viene de "Estrategias"
  - Respeta el flujo de aprobación del vendedor
- **Modal "Ideas para presentar":** genera 3 ideas creativas con nombre, tipo, licencias y argumento de venta
  - Tipos: Exhibidor, Activación, Temporada, Bundle, Lanzamiento, Cross Merchandising
  - Al menos una idea alineada a temporada comercial vigente (usa `getSeasonContext`)
- **Modal "Presentación comercial":** genera presentación de 5 diapositivas personalizada
  - Puede venir de una idea seleccionada o generarse directamente
  - Incluye: portada, 5 slides estructurados con sección, headline, puntos e highlight
  - Opción de imprimir/exportar a PDF via window.print()

### APIs y servicios de backend
- **Monday GraphQL client** (`/lib/monday.ts`): cliente genérico reutilizable
- **Monday Prospects** (`/lib/monday-prospects.ts`): queries para el board de prospectos
- **Monday Deals** (`/lib/monday-deals.ts`): queries para el board de deals internacionales
- **Resend client** (`/lib/resend.ts`): helper de envío de email
- **Supabase client** (`/lib/supabase.ts`): cliente público y admin (con manejo de RLS)
- **Seasons** (`/lib/seasons.ts`): calendario comercial completo (Regreso a clases, Semana Santa, Día de la Madre, Verano, Halloween, Black Friday, Navidad) para Latinoamérica y Caribe anglófono, retorna contexto listo para prompts de IA
- **Catalog** (`/lib/catalog.ts`): mapeo de país → item de Monday para obtener link de catálogo dinámicamente (21 países + inglés caribeño)
- **Mock data** (`/lib/mock-data.ts`): 15 prospectos mock, 10 deals mock y 10 sugerencias IA mock para desarrollo local sin llamar a Monday

### APIs (Route Handlers)
- `POST /api/ai/generate-email` — genera email de prospecto (Claude Opus)
- `POST /api/ai/generate-followup-email` — genera email/WhatsApp de seguimiento de deal (Claude Opus)
- `POST /api/ai/generate-deal-ideas` — genera 3 ideas creativas para reactivar deal (Claude Opus)
- `POST /api/ai/generate-deal-strategies` — genera 3 hipótesis de diagnóstico de venta (Claude Sonnet)
- `POST /api/ai/generate-presentation` — genera presentación de 5 slides (Claude Opus)
- `POST /api/deals/send-followup` — envía email vía Resend + registra en Monday timeline
- `POST /api/monday/notify` — publica update en Monday + notifica usuarios + actualiza fecha
- `GET /api/monday/check-efectivos` — polling para detectar contactos efectivos nuevos
- `GET /api/monday/prospects` — lista de prospectos sin procesar
- `GET /api/monday/board-columns` — utilidad para introspección de columnas de un board

### Páginas legales
- `/privacidad` — Política de Privacidad
- `/terminos` — Términos y Condiciones
- `/cookies` — Política de Cookies
- `/aviso-legal` — Aviso Legal
- Componente `CookieBanner` con aceptar/rechazar y persistencia en localStorage
- Layout reutilizable `LegalLayout` para todas las páginas legales

---

## 2. FUNCIONALIDADES PARCIALES

Empezadas pero incompletas o con limitaciones importantes.

### Sugerencias IA de prospectos nuevos (Módulo 1 — sub-vista "Prospectos Nuevos IA")
- **Implementado:** UI completa, datos mock para semana W24
- **Faltante:** La generación real de sugerencias via IA no está implementada. La página carga siempre los mismos 10 mock hardcodeados en `mock-data.ts`. No hay API route que llame a Claude para generar sugerencias semanales reales basadas en el ICP.
- **Faltante:** El botón "Agregar" solo actualiza estado local en el navegador; no crea el deal en Monday ni persiste nada.

### Registro de llamadas en Monday (Módulo 1)
- **Implementado:** El MASTERPLAN describe que el vendedor registra el resultado de llamadas (contestó / no contestó / dejó mensaje) en Monday. La UI de prospectos no tiene ese flujo implementado.
- **Faltante:** No hay modal ni botón para registrar resultado de llamada desde la app.

### Campo "Contacto Clave" / Comprador de Categoría (Módulo 1)
- **Implementado:** El tipo `Prospect` no tiene campo `contactKey` ni "Comprador de Categoría".
- **Faltante:** No hay lógica para detectar cuando se llena ese campo en Monday, pausar la secuencia y generar mensaje personalizado al comprador.

### Envío automático de emails (Módulo 2)
- **Implementado:** Resend está configurado y el email se envía desde `send-followup`.
- **Limitación:** El `from` está hardcodeado como `onboarding@resend.dev` (dominio sandbox de Resend, solo acepta envíos a emails verificados). Para producción real se necesita un dominio propio verificado en Resend.

### Tracking de apertura de materiales
- **Implementado:** El MASTERPLAN requiere links con tracking en toda presentación o material enviado.
- **Faltante:** El sistema no genera links con tracking. La presentación generada se visualiza in-app y se puede imprimir, pero no hay integración con Bitly ni sistema de tracking propio para saber si el cliente la abrió.

---

## 3. FUNCIONALIDADES PENDIENTES

No se ha escrito ninguna línea de código para estos módulos/funcionalidades.

### Módulo 3 — Materiales de Ventas con IA (`/dashboard/materiales`)
- La ruta existe como enlace en el dashboard pero no tiene página implementada (devolvería 404).
- **Pendiente:** Generación de presentaciones PPTX descargables (vs. solo visualización web in-app).
- **Pendiente:** Generación de guiones de video personalizados (gancho → problema → solución → CTA).
- **Pendiente:** Exportación real a PPTX (PptxGenJS) y PDF (WeasyPrint/Puppeteer).

### Módulo 4 — Propuestas Creativas con IA (`/dashboard/propuestas`)
- La ruta existe como enlace en el dashboard pero no tiene página implementada.
- **Pendiente:** Flujo de 3 pasos: selección de tipo (Exhibidor/Exhibición/Temporada) → 3 conceptos IA → documento final PPTX/PDF.
- **Pendiente:** Diferenciación entre "Ideas para presentar" del Módulo 2 (que ya existe) y las Propuestas Creativas formales del Módulo 4.

### Módulo 5 — Retención de Clientes Activos (`/dashboard/retencion`)
- La ruta existe como enlace en el dashboard pero no tiene página implementada.
- **Pendiente:** Clasificación A/B/C con ciclos de 7/15/30 días.
- **Pendiente:** Semáforo de salud por cliente activo.
- **Pendiente:** Secuencia WhatsApp → Llamada → WhatsApp → Visita presencial por ciclo.
- **Pendiente:** Detección de "Cliente en Riesgo" tras 3 ciclos sin respuesta + notificación al gerente.
- **Pendiente:** Modo Pedido vs. Modo Propuesta alternado automáticamente.
- **Pendiente:** Brief de visita presencial generado por IA.
- **Pendiente:** Ciclos que nunca se detienen automáticamente.

### Módulo 6 — Alertas de Viaje por País (`/dashboard/viajes`)
- La ruta existe como enlace en el dashboard pero no tiene página implementada.
- **Pendiente:** Monitoreo diario de 3 disparadores (temporada / inactividad / clientes en riesgo) por país.
- **Pendiente:** Generación de alertas con 30 días de anticipación.
- **Pendiente:** Kit de Viaje automático (lista de clientes + propuestas + calendario de visitas).
- **Pendiente:** Calendario de visitas optimizado por zona geográfica.

### Módulo 7 — Informes Semanales (`/dashboard/informes`)
- La ruta existe como enlace en el dashboard pero no tiene página implementada.
- **Pendiente:** Generación automática cada lunes a las 7:00 AM (Panamá) — requiere cron job.
- **Pendiente:** Informe desglosado por vendedor en 5 secciones.
- **Pendiente:** Resumen ejecutivo IA con logros, alertas y comparativa vs. semana anterior.
- **Pendiente:** Entrega simultánea en Monday (adjunto) y Email (HTML + PDF).

### Módulo 8 — Integración Monday CRM profunda
- **Pendiente:** Bandeja de aprobaciones como app nativa/iframe dentro de Monday.
- **Pendiente:** Automatizaciones de Monday disparando acciones de IA.
- **Pendiente:** Sincronización bidireccional de respuestas del prospecto actualizando estado en Monday.
- **Pendiente:** Vista de pipeline con indicadores de salud dentro de Monday.

### Secuencias automáticas de follow-up con timer
- **Pendiente:** Ninguna secuencia automática está implementada. Todo es manual (el vendedor abre la app y genera el mensaje). No hay cola (BullMQ/Redis) ni scheduler para disparar pasos de secuencia con 1-2 días de espera.

### WhatsApp Business API (Meta Cloud)
- **Pendiente:** No hay integración con la API de WhatsApp Business. Los mensajes de WhatsApp se copian al portapapeles para que el vendedor los envíe manualmente.

### LinkedIn API
- **Pendiente:** No hay integración con LinkedIn en ningún módulo.

### Autenticación real
- **Pendiente:** El login actual es solo un campo de nombre sin validación ni sesión real. No hay autenticación de usuarios, roles (vendedor/gerente) ni autorización.

### Base de datos activa (PostgreSQL / Supabase)
- **Pendiente:** Supabase está inicializado como cliente pero no se usa en ningún módulo activo. No hay tablas, migraciones ni queries implementados. El estado de secuencias e historial de mensajes no se persiste en BD.

---

## 4. FUNCIONALIDADES NUEVAS (no estaban en el MASTERPLAN)

Estas funcionalidades fueron implementadas y aportan valor real pero no estaban descritas en el MASTERPLAN original.

### Diagnóstico de venta "¿Por qué no compra?" (Módulo 2)
- Modal "Estrategias" que genera 3 hipótesis distintas sobre por qué un cliente/deal no está avanzando, con enfoque accionable, puntos clave, canal recomendado y nivel de urgencia.
- Va más allá del follow-up genérico del MASTERPLAN: ayuda al vendedor a entender el obstáculo específico antes de redactar el mensaje.

### Generación de ideas creativas en el contexto de deals (Módulo 2)
- Modal "Ideas para presentar" dentro del Módulo 2 que genera 3 conceptos creativos (Exhibidor, Activación, Temporada, Bundle, Lanzamiento, Cross Merchandising) para reactivar un deal específico.
- Conectado directamente con el generador de presentaciones: el vendedor puede elegir la idea y obtener la presentación en un solo flujo.

### Presentación comercial web (in-app) con opción de imprimir/PDF
- El MASTERPLAN especificaba solo PPTX descargable. Se implementó una presentación visual renderizada en el navegador con opción `window.print()` para exportar a PDF.
- Tiene portada, 5 slides estructurados con colores diferenciados, secciones, headlines, puntos y highlights.

### Contexto de temporada comercial automático en todos los prompts de IA
- La librería `seasons.ts` detecta automáticamente qué temporada comercial está activa, en preparación o próxima según el país y la fecha actual, e inyecta ese contexto en todos los prompts de IA.
- Esto aplica a: generación de ideas, estrategias, presentaciones y mensajes de seguimiento.

### Catálogo dinámico por país desde Monday
- `catalog.ts` obtiene en tiempo real el link del catálogo vigente para cada país desde un board especial de Monday, e inyecta ese link en los emails de prospección de primera contacto.
- Cubre 21 países + inglés caribeño con fallback al catálogo general.

### Notificación de "Contacto Efectivo" en tiempo real
- Polling automático cada 45 segundos al board de prospectos para detectar items que cambian a estado "Contacto Efectivo".
- Toast in-app tipo notificación WhatsApp + notificación del navegador (con permiso).
- Evita repetir notificaciones guardando IDs ya notificados en localStorage.

### Notificación masiva a vendedores
- Botón "Notificar a todos" que envía avisos en lote a todos los prospectos visibles con los filtros actuales, con barra de progreso y respeto al rate limit de Monday (1 req/segundo).

### API de introspección de columnas de Monday (`board-columns`)
- Endpoint utilitario para descubrir IDs y tipos de columnas de cualquier board de Monday desde la app.

### Páginas legales completas
- Cuatro páginas legales (Privacidad, Términos, Cookies, Aviso Legal) con layout compartido.
- Cookie Banner con consentimiento y persistencia.
- Estas páginas no estaban en el MASTERPLAN pero son necesarias para el lanzamiento.

---

## 5. DEUDA TÉCNICA IDENTIFICADA

- **Autenticación:** El login no tiene sesión real. Cualquier persona con la URL puede acceder.
- **Dominio Resend:** El `from: "onboarding@resend.dev"` solo funciona para envíos a emails verificados. Requiere dominio propio para producción.
- **Prospectos Nuevos IA:** Los datos son siempre los 10 mismos hardcodeados. La IA no genera sugerencias reales.
- **Persistencia de acciones:** Las aprobaciones del vendedor no se guardan en BD (Supabase inicializado pero sin uso). Al recargar se pierde el historial de la sesión.
- **WhatsApp:** Solo copia texto al portapapeles. No hay integración real con WhatsApp Business API.
- **PPTX/PDF real:** Solo hay visualización web. No hay generación de archivos descargables.
- **Sin cola/scheduler:** No hay BullMQ ni ningún scheduler para automatizar secuencias con timing.

---

## TABLA RESUMEN

| Módulo | Estado | Notas |
|--------|--------|-------|
| Dashboard + Login | ✅ Completo | Login sin auth real |
| M1 — Prospección Inteligente | ✅ Operativo | Prospectos nuevos IA en mock |
| M2 — Seguimiento Multicanal | ✅ Operativo | WhatsApp solo copia texto |
| M3 — Materiales de Ventas IA | ❌ Pendiente | PPTX/guión video sin implementar |
| M4 — Propuestas Creativas IA | ❌ Pendiente | UI del M2 cubre parte del concepto |
| M5 — Retención Clientes Activos | ❌ Pendiente | Sin ninguna línea de código |
| M6 — Alertas de Viaje por País | ❌ Pendiente | Sin ninguna línea de código |
| M7 — Informes Semanales | ❌ Pendiente | Requiere cron + BD activa |
| M8 — Integración Monday profunda | 🟡 Parcial | Leer/escribir funciona; iframe/auto no |
| Diagnóstico IA "¿Por qué no compra?" | ✅ Nuevo | No estaba en MASTERPLAN |
| Contexto de temporadas comerciales | ✅ Nuevo | No estaba en MASTERPLAN |
| Catálogo dinámico por país | ✅ Nuevo | No estaba en MASTERPLAN |
| Notificación "Contacto Efectivo" RT | ✅ Nuevo | No estaba en MASTERPLAN |
| Páginas legales | ✅ Nuevo | No estaban en MASTERPLAN |

---

*Reporte generado automáticamente el 2026-06-11 · SalesAI Audit*
