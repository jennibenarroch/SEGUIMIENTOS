# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**SalesAI** — Sistema de asistencia de ventas B2B con IA para equipos pequeños (1–5 vendedores).
Centraliza prospección, seguimiento multicanal, generación de materiales y propuestas creativas desde **Monday CRM** como interfaz principal. La IA redacta; el vendedor aprueba; el sistema envía y registra.

Ver especificación completa: @DOCS/MASTERPLAN.md

## Stack Tecnológico

- **Frontend web / landing:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend (a construir):** Node.js + FastAPI (Python) para los módulos de IA
- **Base de datos:** PostgreSQL — estado de secuencias, historial de mensajes
- **Queue:** Redis + BullMQ — manejo de secuencias de seguimiento y reintentos
- **Frontend Monday:** Monday Apps SDK (iframe app dentro de Monday)
- **IA:** Anthropic Claude API — redacción de mensajes, propuestas, guiones
- **Hosting:** Railway o Render

## Comandos

```bash
# Desarrollo
npm run dev          # Servidor local en http://localhost:3000

# Build y calidad
npm run build        # Build de producción
npm run lint         # ESLint
npm run type-check   # TypeScript sin emitir (tsc --noEmit)

# Test (cuando se agreguen)
npm test             # Correr todos los tests
npm test -- --testPathPattern=nombre  # Correr un test específico
```

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout con metadata
│   ├── page.tsx            # Landing page (ruta /)
│   └── (módulos futuros)
├── components/
│   ├── landing/            # Secciones de la landing page
│   └── ui/                 # Componentes reutilizables
└── lib/                    # Utilidades, clientes de API
```

## Módulos del Sistema (orden de desarrollo)

1. **Prospección Inteligente** — cuota semanal de 10 prospectos, secuencia WhatsApp→Email→Llamada
2. **Seguimiento Multicanal** — follow-up con aprobación del vendedor en Monday
3. **Materiales de Ventas IA** — presentaciones PPTX y guiones de video personalizados
4. **Propuestas Creativas IA** — 3 opciones por solicitud, genera PPTX/PDF en < 30 seg
5. **Retención de Clientes Activos** — ciclos A/B/C, semáforo de salud, nunca se detiene
6. **Alertas de Viaje por País** — 30 días de anticipación, Kit de Viaje automático
7. **Informes Semanales** — lunes 7 AM hora Panamá, por vendedor, a Monday + Email
8. **Integración Monday CRM** — API GraphQL, bandeja de aprobaciones, automatizaciones

## Reglas de Negocio Críticas (IMPORTANTE)

- **Ningún mensaje se envía sin aprobación explícita del vendedor** — esto es inviolable
- Orden de canales fijo: WhatsApp → Email → Llamada (1–2 días entre intentos)
- Las llamadas **nunca se automatizan**; la IA genera guion, el vendedor llama
- La IA siempre genera **exactamente 3** conceptos creativos por solicitud
- Ciclos de clientes activos **nunca se detienen** automáticamente
- Toda propuesta/material enviado debe ir con **link de tracking**
- Idioma: español para Latinoamérica, inglés para Caribe anglófono (Barbados, Jamaica, Trinidad, etc.)

## Convención de Ramas

Este proyecto tiene **solo dos ramas**. No crear ninguna otra salvo que la usuaria lo pida explícitamente.

| Rama | Propósito | Alias reconocidos |
|------|-----------|-------------------|
| `main` | Producción — lo que los usuarios ven online | "producción", "prod", "main", "online", "la web", "publicar", "subir a producción", "lo que los usuarios van a ver" |
| `staging` | Desarrollo — donde se prueban los cambios antes de publicar | "desarrollo", "development", "dev", "staging", "ambiente de prueba", "entorno de pruebas" |

**Reglas por defecto:**
- Todos los commits van en `staging`.
- Solo mergeamos `staging → main` cuando algo está listo para publicar.
- Si la usuaria pide crear una rama para una funcionalidad concreta, crearla a partir de `staging`, no de `main`.

## Workflow

- Explorar archivos relevantes antes de implementar; usar plan mode para cambios multi-archivo
- Al agregar un nuevo módulo, crear primero la interfaz Monday (columnas + automatizaciones), luego el backend
- Verificar siempre corriendo `npm run type-check` + `npm run lint` antes de reportar tarea completa
- Correr un solo test a la vez (`npm test -- --testPathPattern=`), no el suite completo

## Integraciones Externas

| Servicio | Uso |
|----------|-----|
| Monday CRM API (GraphQL) | Interfaz principal, datos de deals, automatizaciones |
| WhatsApp Business API (Meta Cloud) | Envío/recepción de mensajes |
| Gmail API / OAuth | Emails con tracking de apertura |
| LinkedIn API | Búsqueda de prospectos, mensajes DM |
| Anthropic Claude API | Motor de IA (redacción, propuestas, guiones) |
| PptxGenJS | Generación de presentaciones PPTX |
| Puppeteer / WeasyPrint | Generación de PDFs de propuestas |
| Bitly API (o tracking propio) | Seguimiento de apertura de materiales |

## Convenciones de Código

- Nombres de archivos y componentes en inglés (PascalCase para componentes, camelCase para utils)
- Texto visible al usuario en **español** (el producto es para vendedores hispanohablantes)
- Usar `type` sobre `interface` en TypeScript salvo que se necesite extensión
- Tailwind para estilos — no CSS modules ni styled-components
- Server Components por defecto en Next.js; marcar `"use client"` solo cuando sea necesario

## Cuando se compacte el contexto

Preservar: módulo en desarrollo activo, reglas de negocio críticas (especialmente "aprobación del vendedor"), integraciones configuradas, decisiones de arquitectura tomadas.
