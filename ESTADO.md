# ESTADO — App Familiar Lucy

**Última actualización:** 2026-07-19
**Fase actual:** Pilar de Salud COMPLETO — app en uso
**Lo siguiente:** Cuando se retome, Finanzas o Administrativo (sin prioridad definida aún)

---

## La App

**Nombre:** App Familiar Lucy
**Tipo:** App personal de uso familiar — sin venta, sin Hotmart
**Usuarios:** Luisa (admin), Mamá, 3 tíos, Abuela Rosa (75 años, vista especial)
**Promesa:** "Todo lo importante de la familia en un solo lugar — salud, plata y casa — para que nadie olvide nada."

---

## Decisión de alcance

Finanzas y Administrativo están pausados indefinidamente. Solo Salud está activo.
Los ítems de navegación de Finanzas y Administrativo fueron ocultados del sidebar y bottom nav hasta que se construyan.

---

## Constitución del Producto

**Primera victoria:** Abuela Rosa abre la app, ve su próxima cita médica, y el día antes le llega un recordatorio.

**3 pilares (solo Salud activo):**
1. **Salud** ✅ — citas + medicamentos + exámenes/procedimientos + autorizaciones EPS
2. **Finanzas** ⏸ — pausado
3. **Administrativo** ⏸ — pausado

**Roles:**
- Admin (Luisa): ve y controla todo, gestiona miembros desde Configuración
- Familia (mamá + 3 tíos): ven todo y colaboran
- Abuela: pantalla especial `/abuela`, solo SUS citas y medicamentos, letra grande

---

## Decisiones Técnicas

- **Framework:** Next.js 16 App Router (`proxy.ts` en vez de `middleware.ts`)
- **Base de datos:** Supabase PostgreSQL con RLS
- **Auth:** Supabase Auth, email/password — cuentas familiares
- **Recordatorios:** WhatsApp via Meta API (Edge Function `notificar-citas`)
- **Deploy:** Vercel
- **Stack:** Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + Motion + Lucide + Supabase
- **Abuela:** route group `(abuela)` → URL `/abuela`

---

## Dirección de Arte

| Token | Valor |
|---|---|
| Modo | Claro (light-first) |
| Tipografía | Nunito |
| Fondo | `#FAFAF8` |
| Marca | `#9B8EC4` (lavanda) |
| Salud | `#F2C5CE` / `#C0546A` (rosa) |
| Texto | `#2A2826` |

---

## Lo que está construido y funciona

### Pilar de Salud (`/salud`)
- Kanban de citas: Por agendar → Próximas → Completadas (drag & drop)
- Kanban de exámenes: Sin fecha → Programados → Realizado
- Tabs: Citas · Medicamentos · Procedimientos · Autorizaciones EPS
- Vistas: Columnas y Calendario
- Badge de autorización EPS en tarjeta kanban cuando está aprobada

### Detalle de Cita (`/salud/cita/[id]`)
- Info completa + orden médica (PDF)
- Nota de voz (audio)
- Nota post-cita editable
- Número de autorización EPS vinculada
- Editar datos · Eliminar · Enviar recordatorio WhatsApp

### Detalle de Examen/Procedimiento (`/salud/examen/[id]`)
- Orden médica + resultado (PDFs)
- Cambio de estado (Pendiente / Realizado)
- `fecha_realizacion` guarda cuándo se realizó → dispara recordatorio de resultado a los 5 días
- Número de autorización EPS vinculada
- Editar · Eliminar

### Detalle de Medicamento (`/salud/medicamento/[id]`)
- Fórmula médica (PDF)
- Entregas con fechas y marcar como reclamadas
- Horarios de toma en chips
- Editar · Eliminar

### Detalle de Autorización EPS (`/salud/autorizacion/[id]`)
- Estado: sin gestionar / en trámite / autorizada
- Número de autorización destacado cuando existe
- Barra de vigencia de 120 días
- Editar · Eliminar

### Creación
- Nueva cita (`/salud/nueva-cita`)
- Nuevo medicamento (`/salud/nuevo-medicamento`)
- Nuevo examen (`/salud/nuevo-examen`) — ubicación obligatoria solo cuando hay fecha

### Notificaciones automáticas (Edge Function)
- Recordatorio 24h antes de cita → WhatsApp a todos los miembros activos
- Alerta de autorización por vencer (< 30 días) y en trámite > 5 días hábiles
- Recordatorio de resultado de examen a los 5 días desde `fecha_realizacion`

### Vista Abuela (`/abuela`)
- Solo citas y medicamentos de Abuela Rosa
- Letra grande (24-32px), interfaz simplificada

### Configuración (`/configuracion`)
- Mi perfil: emoji, nombre, WhatsApp, rol, activo/inactivo
- Lista de todos los miembros con edición
- Agregar nuevo miembro
- El sidebar muestra el emoji y nombre real del usuario logueado

---

## Estructura clave del proyecto

```
web/
├── proxy.ts                          ← Auth guard (Next.js 16)
├── app/
│   ├── (app)/
│   │   ├── inicio/page.tsx           ✅
│   │   ├── salud/
│   │   │   ├── page.tsx              ✅ Kanban completo
│   │   │   ├── cita/[id]/page.tsx    ✅
│   │   │   ├── examen/[id]/page.tsx  ✅
│   │   │   ├── medicamento/[id]/     ✅
│   │   │   ├── autorizacion/[id]/    ✅
│   │   │   ├── nueva-cita/           ✅
│   │   │   ├── nuevo-examen/         ✅
│   │   │   └── nuevo-medicamento/    ✅
│   │   └── configuracion/page.tsx    ✅
│   └── (abuela)/
│       ├── abuela/page.tsx           ✅
│       └── mis-citas/page.tsx        ✅
├── components/app/
│   ├── Sidebar.tsx                   ✅ (Finanzas/Admin ocultos)
│   └── BottomNav.tsx                 ✅ (Finanzas/Admin ocultos)
└── supabase/functions/
    └── notificar-citas/index.ts      ✅ Desplegada
```

---

## Pendientes conocidos

- [ ] `telefono` en `miembros_familia` — columna agregada manualmente vía SQL (no está en migración)
- [ ] Columnas extras (`tipo_sangre`, `peso`, `altura`, `alergias`, `condiciones`) — verificar si existen en DB
- [ ] Supabase MCP apunta al proyecto incorrecto (Calmazen) — migraciones y Edge Functions se hacen via CLI o dashboard
- [ ] Finanzas y Administrativo: sin construir, sin prioridad definida
