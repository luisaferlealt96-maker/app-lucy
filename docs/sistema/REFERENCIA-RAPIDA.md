# REFERENCIA RÁPIDA — Sistema Operativo para Web Apps con IA

---

## Cómo Usar en Codex

### Setup Permanente (hacer una vez por proyecto)

```
mi-app/
├── CLAUDE.md          ← lo lee Claude Code automáticamente
├── AGENTS.md          ← lo lee Codex automáticamente (idéntico)
├── ESTADO.md          ← lo crea y mantiene el agente (memoria entre sesiones)
└── docs/sistema/      ← todos los archivos 00-52 + 02B + plantillas del sistema
```

Con esto, **el agente lee los documentos por sí mismo** según la tarea (la tabla de ruteo está en CLAUDE.md/AGENTS.md) y mantiene `ESTADO.md` con las decisiones y el progreso. Los prompts de abajo siguen el flujo por fases; el método de "subir archivos manualmente" solo aplica si usas una IA de chat sin acceso a archivos.

### Los archivos MD adicionales (numerados) se cargan solo cuando los necesitas, como contexto extra para fases específicas.

---

## ESCENARIO 1: Crear una App desde Cero

**El plan canónico es el de 8 sesiones de `INICIO.md` (sección B5) — esa es la fuente única del plan de sesiones; no uses otro mapa.** Con Claude Code/Codex NO subes archivos: el agente presenta ese Plan Maestro y lee él mismo los archivos de cada sesión (tabla de ruteo de CLAUDE.md).

**Para arrancar (Sesión 1):** pega `PROMPT-ARRANQUE.txt` (o simplemente di "comenzar").

**Para cada sesión siguiente:**
```
Lee ESTADO.md y continúa con la siguiente sesión del Plan Maestro (INICIO.md, sección B5).
```

Resumen del plan (los archivos exactos, condicionales y entregables de cada sesión están en `INICIO.md` B5):

| Sesión | Foco |
|---|---|
| 1 | Validación, monetización y arquitectura |
| 2 | Identidad visual y sistema de diseño |
| 3 | Página de ventas |
| 4 | Onboarding, paywall y login |
| 5 | App interna simplificada |
| 6 | Integraciones reales y seguridad |
| 7 | Testing, animaciones, pulido y RIGOR DE ENTREGA (48) |
| 8 | Adquisición, lanzamiento y backoffice |

> Solo si usas una IA de chat SIN acceso a archivos: sube `00-SISTEMA-MAESTRO.md` + los archivos que `INICIO.md` B5 lista para la sesión en curso, como contexto manual, sesión por sesión.

---

## ESCENARIO 2: Mejorar una App Existente

### Sesión Única — Auditoría + Fixes
**Archivos a subir:** `03-PRINCIPIOS-APP-EXITOSA.md` + `06-TESTING.md` + `07-PULIDO.md` + `11-DISENO-EMOCIONAL.md`
(CLAUDE.md ya está en la raíz)
**Prompt:**
```
Tengo una app web existente que necesita revisión profesional.
[Adjuntar archivos del proyecto]

Haz lo siguiente en orden:
1. Revisa contra los mandamientos y anti-patrones del archivo de Principios (03)
2. Ejecuta los tests del archivo de Testing (funcional, edge cases,
   responsive, accesibilidad, performance, seguridad)
3. Aplica el pulido del archivo de Pulido
4. Primero entrégame el reporte y espera mi OK antes de tocar código
5. Corrige solo lo aprobado, por capas, verificando cada cambio
6. Dame un resumen de qué cambió y qué quedó pendiente

Si falta contexto importante, pregúntame en palabras simples antes de actuar.
```

### Sesión Extra — Seguridad Pre-Deploy
**Archivos a subir:** `09-SEGURIDAD.md` + `27-REVISION-SEGURIDAD.md`
**Prompt:**
```
Revisa la seguridad de esta app antes de desplegarla:
[Adjuntar archivos del proyecto]
- Verifica que no hay API keys en el frontend
- Verifica que los inputs se sanitizan
- Verifica RLS si usa Supabase
- Genera las páginas legales mínimas
- Aplica todos los fixes
```

---

## ESCENARIO 3: Solo Necesito el CLAUDE.md

Si ya sabes lo que estás haciendo y solo quieres que Codex siga buenas prácticas mientras codea, solo necesitas el `CLAUDE.md` en la raíz del proyecto. Nada más.

Codex lo leerá automáticamente y aplicará: tokens de diseño, accesibilidad, seguridad, patrones de código, convenciones de nombres, y el checklist de calidad.

---

## Estructura de Archivos

```
PARA AGENTES DE CÓDIGO (automático):
  CLAUDE.md                        # Lo lee Claude Code. Reglas de código + verificación.
  AGENTS.md                        # Lo lee Codex. Idéntico a CLAUDE.md.

PARA CARGAR POR SESIÓN (cuando necesites la fase):
  01-IDEACION.md                   # Fase 0: Sin idea → App Brief
  02-VALIDACION.md                 # Fase 1: Viabilidad + retención + pricing
  03-PRINCIPIOS-APP-EXITOSA.md     # Fase 2: 16 principios UX (10 mandamientos + 6 adicionales) + anti-patrones
  04-ARQUITECTURA.md               # Fase 3: Pantallas + flujos + wireframes
  05-CREACION.md                   # Fase 4: Proceso de código paso a paso
  06-TESTING.md                    # Fase 5: QA + Core Web Vitals + WCAG
  07-PULIDO.md                     # Fase 6: Micro-interacciones + copy + SEO
  08-DEPLOY.md                     # Fase 7: Vercel + Supabase + Analytics
  09-SEGURIDAD.md                  # Transversal: BFF + Legal + Privacidad
  10-DESIGN-TOKENS.md              # Transversal: Tokens + Dark mode + Tailwind
  11-DISENO-EMOCIONAL.md           # Transversal: Personalidad + Celebración + Movimiento
  12-FLUJO-AGENTICO.md             # Transversal: Verificación + Framework + Costos de IA
  13-INFRA-ESCALABILIDAD.md        # Transversal: Arquitectura + Escalar a 500-1000 usuarios
  14-LEYES-DE-DISENO.md            # Transversal: Especificaciones exactas de diseño (anti-genérico)
  15-PATRONES-UX.md                # Transversal: Patrones UX de alto impacto en retención
  16-DIRECCION-DE-ARTE.md          # Transversal: Identidad visual audaz (anti-genérico, nivel gusto)
  17-VISUALIZACION-DATOS.md        # Transversal: Gráficos y dashboards premium
  18-VENTA-HOTMART.md              # Transversal: Venta por Hotmart + Resend (por defecto)
  19-PAGINA-DE-VENTAS.md           # Transversal: Landing de alta conversión + copy
  20-ASSETS-VISUALES.md            # Transversal: Logo, favicon, imágenes (ChatGPT/Gemini)
  21-BACKOFFICE.md                 # Etapa: Panel de admin del dueño (ventas, errores, métricas)
  02B-ONBOARDING-MONETIZACION.md   # Estrategia: Onboarding + Paywall validados (Duolingo, Cal AI, Noom)
  22-LIBRERIAS-Y-CRAFT.md          # Transversal: Librerías de animación/íconos + animaciones baseline
  23-SKILLS-COMUNIDAD.md           # Setup: Skills de diseño de la comunidad (opcional)
  24-GAMIFICACION.md               # Retención: hábito (Hooked), rachas, XP, recompensa variable, anti-patrones
  25-BASE-DE-DATOS.md              # Backend: esquema, índices, migraciones seguras, EXPLAIN, pooling
  26-AUTH-MODERNO.md               # Auth 2026: passkeys, sesión/tokens, rate limits, MFA, anti-enumeración
  27-REVISION-SEGURIDAD.md         # Seguridad: OWASP Top 10:2025, semgrep, deps, secretos (pre-venta)
  28-INGENIERIA-NEXTJS.md          # Next.js: RSC, Server Actions, caché, Core Web Vitals
  29-REFERENCIA-VISUAL.md          # Diseño: paletas y tipografías por nicho (lookup rápido)
  30-INTEGRACION-IA.md             # IA: texto (streaming/caching), imagen/audio (async+Storage), resiliencia, costo
  31-EVALS-OBSERVABILIDAD-OPERACION.md # IA: evals (golden set), observabilidad (ai_calls), CI/CD, runbook, soporte
  32-DEL-MVP-AL-PRODUCTO.md         # El listón: de MVP básico/plano/vacío a producto enriquecido y vendible (¡míralo renderizado!)
  33-RAG-Y-CONTEXTO.md             # RAG sobre documentos: pgvector, chunking, retrieval, hybrid, reranking (solo si hace falta)
  34-ADQUISICION-Y-TRAFICO.md      # Distribución: afiliados Hotmart, paid ads, contenido/SEO, lead magnet + email
  35-LANZAMIENTO-Y-RETENCION.md    # Lanzamiento, bump/upsell, retención, dunning, win-back, referidos, renovación anual
  36-ANALITICA-Y-EVENTOS.md        # Analítica de producto: PostHog, taxonomía de eventos, funnel → North Star
  37-FEATURE-FLAGS-Y-EXPERIMENTOS.md # Feature flags, A/B, kill-switch, rollout gradual
  38-PERFORMANCE-BUDGET.md         # Presupuesto de performance + Core Web Vitals como gate de CI (LATAM)
  39-INTERNACIONALIZACION.md       # i18n / multi-mercado (Brasil pt-BR, monedas LATAM) con next-intl
  40-UNIT-ECONOMICS.md             # Economía unitaria: COGS, margen, break-even, LTV:CAC (¿es viable?)
  41-CRAFT-DE-ANIMACION.md         # Animación de élite: cuándo NO animar, easing perceptual, runtime GPU, View Transitions, motion narrativo
  42-UX-WRITING.md                 # Microcopy de interfaz: nombres de controles, errores, consistencia de verbos
  52-COPY-VISUALES-CONVERSION.md   # Conversion: headline, visual de valor, garantia concreta, marca y CTA
  43-MICRO-CRAFT-Y-EJECUCION.md    # Última milla verificable: micro-tipografía, overflow/min-w-0, forms, touch, dark robusto, URL-estado
  44-DESCUBRIMIENTO-DE-USUARIO.md  # Investigar el problema con usuarios reales (Mom Test/JTBD, screener, síntesis) antes del gate de pago
  45-SEO-TECNICO.md                # SEO técnico: metadata dinámica, sitemap/robots, schema.org, ISR, programmatic SEO
  46-EMAIL-DELIVERABILITY.md       # Que el email no caiga en spam: SPF/DKIM/DMARC, subdominio dedicado, warmup, higiene
  47-LEGAL-FISCAL-Y-SOPORTE.md     # Operación post-venta: fiscal/legal LATAM, ToS/refund/disclaimer IA, soporte como retención, moderación
  48-RIGOR-DE-ENTREGA.md           # La app casi perfecta desde la v1: auto-QA E2E, pre-mortem, invariantes dinero/datos/seguridad, circuit-breaker IA, manual del dueño
  PLANTILLA-REVISION-PANTALLA.md   # Revisión de pantalla (15 campos, antes de aprobar)
  PLANTILLA-SELF-CHECK.md          # Checklist de coherencia del PROPIO SO (refs, fences, IDs, rangos)
  PROMPT-ARRANQUE.txt              # Pega esto al arrancar un proyecto
  PROMPT-RETOMAR.txt               # Pega esto al volver a una sesión (retoma desde ESTADO.md)
  PROMPT-DEPLOY.txt                # Publica la app sola vía Conectores (GitHub/Supabase/Vercel)
  PROMPT-AUDITORIA.txt             # Auditoría end-to-end (modo --rapido / --exhaustivo): reporte → apruebas → ejecuta
  PROMPT-PRE-LANZAMIENTO.txt       # Certificación go-live: ¿lista para vender? (APTO/NO APTO)
  PROMPT-DISENO.txt                # Diseño premium a nivel estudio (deriva del [CONTEXTO], anti-slop + rúbrica /40)
  PROMPT-ADQUISICION.txt           # Plan de tráfico/clientes (afiliados Hotmart, ads, contenido, email)
  PROMPT-LANZAMIENTO.txt           # Plan de lanzamiento + retención/dunning
  PROMPT-RETENCION.txt             # Implementar gamificación/retención (loop Hooked, rachas, XP)
  PROMPT-LANDING.txt               # Crear/elevar la landing de alta conversión (≥11 secciones)
  PROMPT-BACKOFFICE.txt            # Construir el panel de admin del dueño (ventas, métricas, costo IA)
  PROMPT-RESCATE.txt               # Rescatar una app estancada (flujo + UX + auditoría de seguridad, R1-R5)
  PROMPT-MEJORA-ONBOARDING-PAYWALL.txt # Rehacer onboarding y paywall con datos 2026 + 52
  PROMPT-AUDITAR-SO.txt            # Audita la coherencia del propio SO antes de reempacar el zip
  INICIO.md                        # Protocolo de arranque ("comenzar") + análisis de referencias
  PLANTILLA-ESTADO.md              # Plantilla de la memoria del proyecto

YA NO NECESITAS CARGAR:
  00-SISTEMA-MAESTRO.md            # Reemplazado por CLAUDE.md para Codex
```

---

## Reglas de Oro (resumen)

1. **Mínimo esfuerzo para el usuario** — La IA propone y ejecuta, el usuario aprueba
2. **Valor en 30 segundos** — Resultado útil antes de configurar nada
3. **1-2 acciones por pantalla** — Si hay más, modal o nueva pantalla
4. **Onboarding invisible** — Máximo 2-3 pasos con opciones predefinidas
5. **Feedback en toda interacción** — Hover, loading, éxito, error
6. **Mobile first** — 70%+ viene del celular
7. **Copy humano** — "Generar mi propuesta", no "Submit"
8. **Código completo** — Nada de TODO o placeholders
9. **Tokens, no colores directos** — CSS variables para todo
10. **API keys en el servidor** — NUNCA en el frontend
