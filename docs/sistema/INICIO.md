# INICIO — El Protocolo Maestro de Arranque

> **Para el agente:** Este archivo define exactamente qué hacer desde el primer mensaje. Léelo completo al arrancar un proyecto nuevo. Es tu guía de conducción — tú propones, decides y ejecutas; el usuario aprueba o ajusta.

---

## REGLA ABSOLUTA: Eficiencia de Tokens

Lee SOLO `CLAUDE.md` al arrancar. NO escanees toda la carpeta ni abras todos los archivos numerados de golpe. Cada archivo se lee BAJO DEMANDA, justo antes de la tarea que lo necesita. Con más de 40 archivos en el sistema, leerlos todos al inicio es lento, caro y paraliza al agente.

---

## PASO 1: Detectar el Estado del Proyecto

```
¿Existe ESTADO.md en la raíz?
  SÍ → Leerlo. Retomar donde quedó: "Estamos en [app], fase [N], lo siguiente es [X]. ¿Continuamos?"
  NO → Proyecto nuevo. Ir al PASO 2.
```

---

## PASO 2: La Primera Pregunta (única, con 3 caminos)

Presentar esto exactamente, en una sola pregunta:

> "¡Sistema listo! ¿Por dónde empezamos?
>
> **1. Quiero crear una app pero no sé exactamente qué** — yo te propongo ideas con potencial de ingresos y tú eliges.
> **2. Ya tengo una idea de app** — me la cuentas y lo construimos juntos de principio a fin.
> **3. Ya tengo una app creada y quiero mejorarla** — me das contexto y la auditamos y mejoramos."

Esperar la respuesta. Según lo que elija, ir al flujo correspondiente.

---

## FLUJO A — "No tengo idea de app" (Investigación Estratégica + Arbitraje LATAM)

> **Principio rector:** La estrategia más inteligente no es inventar algo nuevo — es encontrar ideas que ya funcionan y generan dinero en mercados extranjeros (EEUU, Europa, Asia) pero que aún no han llegado o no han tenido éxito en LATAM. Eso elimina el riesgo de validación: si ya funciona afuera, el problema existe. Solo hay que adaptarlo al contexto LATAM.

### A1. Entender el punto de partida del usuario (UNA pregunta, con 3 opciones)

> "Para encontrarte la mejor idea, cuéntame: ¿cuál de estos aplica a tu caso?
>
> **1. Tengo un tema, nicho o habilidad que me apasiona** — (ej: fitness, finanzas, educación, marketing, bienestar, cripto, gastronomía...) y quiero una app en ese mundo.
> **2. Tengo conocimiento o experiencia en algo específico** — (ej: soy nutricionista, trabajo en ventas, soy creador de contenido...) y quiero monetizarlo con una app.
> **3. No tengo preferencia — quiero que me traigas las mejores oportunidades** basadas en lo que más está funcionando afuera y aún no existe en LATAM."

Según su respuesta, ir a A2a, A2b o A2c.

---

### A2a. Si tiene un tema o pasión

Con el nicho declarado, investigar usando herramientas de búsqueda web:

```
PASO 1 — Ver qué funciona afuera en ese nicho:
  → Buscar en Product Hunt: "[nicho] app" — ver las más votadas del último año
  → Buscar en Indie Hackers: "[nicho] + revenue" — ver founders con ingresos reales
  → Buscar en Acquire.com: apps de ese nicho en venta con MRR confirmado

PASO 2 — Verificar que el dolor existe en LATAM:
  → Google Trends: comparar las keywords del nicho en ES vs EN (¿crece la búsqueda en español?)
  → Reddit en español o comunidades LATAM del nicho: ¿se quejan de lo mismo?
  → AppSumo: ¿hay herramientas similares que venden bien? (precio de referencia)

PASO 3 — Filtro de arbitraje LATAM:
  ✅ App exitosa en mercado extranjero (reseñas, revenue, usuarios)
  ✅ Dolor confirmado en LATAM (búsquedas, quejas, comunidades)
  ✅ Sin competidor fuerte en español / sin versión adaptada a LATAM
  → Esa combinación = oportunidad de oro
```

### A2b. Si tiene conocimiento o experiencia profesional

```
PASO 1 — Identificar el dolor que más vive su comunidad profesional:
  → Preguntar: "¿Qué es lo que más tiempo te quita o más frustración te genera
    en tu trabajo/área? ¿Qué harías diferente si hubiera una herramienta para eso?"
  → Buscar en Reddit ([profesión] subreddit): los posts más upvoteados de quejas
  → Buscar en Product Hunt: "[profesión] tool" — ver qué ya existe para ese rol en inglés

PASO 2 — Encontrar la brecha LATAM:
  → ¿Existe algo similar en inglés? (si sí, hay mercado)
  → ¿Hay una versión en español con tracción? (si no, hay oportunidad)
  → Google Trends en español: ¿el problema se busca en LATAM?

PASO 3 — Filtro de arbitraje:
  → Igual que A2a. La experiencia del usuario es la ventaja competitiva: entiende
    el problema mejor que nadie y puede hablar con autoridad a su comunidad.
```

### A2c. Si quiere que la IA investigue y proponga

Este es el modo de mayor valor estratégico. El agente hace la investigación completa:

```
PASO 1 — Detectar tendencias globales emergentes:
  → Exploding Topics: categorías de más crecimiento en los últimos 6 meses
  → Product Hunt: productos más votados del último trimestre por categoría
  → Indie Hackers: posts recientes de founders con crecimiento explosivo

PASO 2 — Identificar nichos con arbitraje LATAM confirmado:
  → Buscar apps en inglés con: 1K+ reseñas positivas + precio $10-50/mes + sin versión en español
  → Google Trends: comparar búsquedas EN vs ES de esas categorías
  → Acquire.com: ver múltiplos de venta (indica cuánto vale el mercado)

PASO 3 — Filtrar por viabilidad para el SO (app construible en 1 semana):
  → Problema puntual y claro (no CRM completo, no plataforma compleja)
  → Monetizable por suscripción mensual ($15-49/mes)
  → No requiere hardware, aprobación de stores, ni regulaciones complejas
  → Beneficiaria de IA para ser mejor que las alternativas existentes
```

---

### A3. Presentar las 5 Mejores Oportunidades (formato estándar)

Con la investigación hecha, presentar exactamente así — no más de 5, no menos de 3:

```
🌎 OPORTUNIDAD #[N]: [Nombre propuesto]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Qué resuelve: [problema en 1 línea, en lenguaje del usuario]
💊 Por qué DUELE (painkiller): [el dolor urgente + score /20 de las 4 preguntas de 01]
💰 Modelo: Suscripción $[X]-[Y]/mes  ·  Categoría: [que monetiza — salud/foto/productividad/finanzas]
🌍 Referencia exitosa afuera: [nombre de app + métrica: "hace $X MRR" o "X reseñas"]
🇱🇦 Por qué LATAM aún no lo tiene: [explicación concreta de la brecha]
📈 Señal de demanda REAL: [reseñas 1-2★ de líderes / "ojalá existiera" en Reddit / Google Trends]
⚡ Momento-IA (wow): [el paso tedioso que la IA borra en UN toque, estilo Cal AI]
⏰ Por qué AHORA: [el cambio/capacidad de IA reciente que la destraba hoy]
🔁 Por qué RETIENE: [la razón para volver — se repite / acumula datos / es un sistema]
🏗️ Complejidad de construcción: [Baja / Media] — construible en [X] sesiones
```

Cerrar con:
> "¿Cuál te llama más la atención? Si ninguna convence, dime qué le cambiarías y busco más opciones."

---

### A4. El usuario elige → Pasar al FLUJO B, directamente al B3

Una vez elegida la oportunidad de la lista, ir directamente a **FLUJO B paso B3** (Constitución del Producto). **Saltarse B0, B1 y B2** — la idea ya está elegida, la investigación ya está hecha y el reporte de validación ya existe implícitamente en la oportunidad presentada. Documentar en ESTADO.md la oportunidad elegida como el "reporte de validación" del proyecto antes de avanzar.

---

### Reglas del FLUJO A

```
- SIEMPRE investigar antes de proponer. Nunca inventar ideas "de la cabeza" sin
  respaldarlas con datos de mercado reales. El usuario merece oportunidades validadas.
- CADA oportunidad PASA los 8 pilares de una idea ganadora (01-IDEACION) antes de mostrarla —
  sobre todo: painkiller (≥16/20), un momento-IA puntual, categoría que paga, y razón de
  retención (la IA churna rápido: sin razón para volver, no va). Si una no pasa, se reformula
  o se descarta — NO se presenta "la primera que se te ocurra" para llenar la lista.
- El criterio de arbitraje LATAM no es negociable: si la app ya existe y tiene éxito
  en español, no es una oportunidad — es competencia. Buscar la BRECHA.
- Presentar el problema primero, el nombre después. El problema es lo que valida;
  el nombre es secundario.
- Si la investigación no produce resultados claros en una categoría, decírselo al
  usuario y buscar en otra dirección — honestidad sobre datos débiles.
- Máximo 5 opciones. Más opciones = parálisis. Menos = puede no haber fit.
```

---

## FLUJO B — "Tengo una idea de app" (Validación + Investigación + Construcción)

> **Principio rector:** Antes de diseñar una sola pantalla, la idea se valida con datos reales de mercado. No para desanimar al usuario — sino para que construya la versión correcta desde el inicio, con referencias reales de apps que ya funcionan como base. Construir sobre evidencia, no sobre intuición.

---

### B0. Escuchar la idea (sin interrumpir, sin juzgar)

Pedir al usuario que describa su idea con libertad:
> "Cuéntame tu idea. No importa si es vaga o si aún no tienes todo claro — con lo que me digas empiezo a investigar."

Con solo 2-3 líneas del usuario ya es suficiente para arrancar la investigación. NO hacer preguntas adicionales antes de investigar — primero los datos, luego las preguntas.

---

### B1. Investigación y Validación (el paso que cambia todo)

**Objetivo:** encontrar apps que ya resuelven este problema (o uno similar) en otros mercados, entender qué funciona y qué falla en ellas, y determinar si la idea tiene mercado probado o requiere más validación.

**Usar búsqueda web activamente en estas fuentes, en este orden:**

```
PASO 1 — App Store y Play Store (la fuente más honesta de mercado):
  Buscar: "[idea del usuario] app" en ambas stores
  Extraer:
  ✦ ¿Existen apps similares? (si sí, el mercado está confirmado)
  ✦ ¿Cuántas reseñas tienen? (volumen = tamaño del mercado)
  ✦ ¿Qué calificación tienen? (4+ estrellas = satisfacción, <3.5 = oportunidad)
  ✦ ¿Qué dice la gente en las reseñas de 1 y 2 estrellas? (eso = lo que hay que resolver)
  ✦ ¿Hay apps en inglés sin versión en español? (arbitraje LATAM)
  ✦ ¿Qué precio cobran? (referencia de monetización)

PASO 2 — Product Hunt:
  Buscar: "[categoría o problema]" — ver los más votados del último año
  Extraer: ¿Qué producto similar ya se lanzó? ¿Cómo lo recibió la comunidad?

PASO 3 — Indie Hackers:
  Buscar: "[nicho] revenue" o "[tipo de app] indie hacker"
  Extraer: ¿Hay founders ganando dinero con algo similar? ¿Cuánto?

PASO 4 — Google Trends:
  Comparar el problema/solución en inglés vs español
  ¿Crece el interés en LATAM? ¿Está en tendencia o bajando?

PASO 5 — Reddit:
  Buscar en r/SaaS, r/apps, r/[nicho]: ¿la gente pide algo así?
  Buscar en comunidades LATAM: ¿se quejan del mismo problema?
```

---

### B2. Presentar el Reporte de Validación (antes de cualquier otra decisión)

Con los datos de la investigación, presentar este reporte al usuario en lenguaje claro — sin tecnicismos, como si se lo explicaras a alguien que nunca ha creado una app:

```
📊 REPORTE DE VALIDACIÓN: [Nombre provisional de la idea]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ / ⚠️ / ❌  VEREDICTO: [Excelente oportunidad / Viable con ajustes / Mercado incierto]

📱 LO QUE ENCONTRÉ EN LAS STORES:
   Apps similares en inglés: [nombres + calificación + número de reseñas]
   Lo que los usuarios AMAN de ellas: [2-3 puntos de las reseñas 5 estrellas]
   Lo que los usuarios ODIAN: [2-3 quejas recurrentes de reseñas 1-2 estrellas]
   → Esto último es tu oportunidad: resolver lo que ellas no resuelven.

🌎 BRECHA LATAM:
   [¿Existe versión en español con tracción? Si no → hay oportunidad clara]
   [¿Qué tan activo está el interés en LATAM según Google Trends?]

💰 SEÑALES DE NEGOCIO:
   Precio que cobra la competencia: $[X]-[Y]/mes
   Tamaño estimado del mercado: [dato si se encontró]
   Fundadores ganando dinero con algo similar: [sí/no + cuánto si hay dato]

🎯 POSICIONAMIENTO RECOMENDADO:
   En vez de competir de frente con [app existente], tu versión podría ganar siendo
   "[diferenciador 1]" + "[diferenciador 2]" para [audiencia LATAM específica].
   Ejemplo de promesa: "[Esta app ayuda a X a lograr Y sin Z]"

📱 LAS 2-3 APPS QUE VAN A SER TU REFERENCIA:
   [App 1]: usar como referencia de [flujo / diseño / funciones]
   [App 2]: aprender de su error en [punto débil encontrado]
   [App 3]: tomar inspiración de su [elemento específico]
```

Cerrar el reporte con una recomendación clara:

> **Si el veredicto es positivo:**
> "Tu idea tiene mercado probado. Encontré apps similares que funcionan bien afuera y hay una brecha clara en español. Te recomiendo avanzar — y ya tenemos las referencias perfectas para que tu versión sea mejor que ellas. ¿Seguimos?"

> **Si hay ajustes recomendados:**
> "La idea tiene potencial pero encontré [situación]. Te sugiero ajustar [específico] antes de construir. Aquí te explico por qué y cómo lo haría..."

> **Si el mercado es incierto:**
> "No encontré suficiente evidencia de que este problema genere dinero. Eso no significa que sea mala idea, pero antes de construir habría que validar más. Te propongo dos caminos: [validar primero con landing page] o [ajustar la idea hacia [variante con más datos]]."

---

### B3. Completar la Constitución del Producto (ahora con datos reales)

Con el reporte en mano, las preguntas de la Constitución se responden mucho más fácil — la investigación ya respondió varias. Hacer las que faltan, UNA POR MENSAJE:

```
[Si la investigación ya respondió quién es el usuario, saltarla]
[Si la investigación ya respondió el problema, confirmarlo con el usuario]

Preguntas que siempre hay que hacer:
→ "¿Cuál sería la primera victoria que el usuario debe sentir en los primeros minutos?"
→ "¿Cuáles son las 3 funciones del MVP? (con la investigación ya sabemos cuáles
   funcionan en la competencia — ¿cuáles de esas priorizamos?)"
→ "¿Hay algo que definitivamente NO debe hacer tu app, aunque parezca buena idea?"
   (si no se le ocurre nada —común en no-técnicos—, ofrécele ejemplos para elegir:
    "ej: nunca publicar/enviar sin tu permiso, nunca inventar datos, nunca presionar con
     culpa para retener, nunca compartir los datos del usuario". No la dejes en blanco.)
```

Redactar la promesa central basada en el posicionamiento del reporte:
> "Esta app ayuda a [usuario LATAM] a lograr [resultado] sin [fricción que la competencia tiene], mediante [mecanismo diferencial]."

---

### B4. Referencias visuales (usando las apps encontradas como punto de partida)

> "Ya tenemos las apps de referencia del reporte. ¿Quieres que tomemos su diseño como inspiración, o tienes otras apps que te gusten más visualmente? También puedes subirme capturas de pantalla de lo que te inspire — incluso de otros rubros."

Si confirma las del reporte → ejecutar ANÁLISIS DE REFERENCIAS con esas apps
Si agrega otras → combinar ambas fuentes

---

### B5. Presentar el Plan Maestro (única versión canónica — no repetir ni resumir)

**La investigación NO es opcional aunque el usuario tenga una idea muy clara.** Incluso si llega convencido de lo que quiere construir, siempre hacer la validación — no para disuadirlo, sino para darle referencias reales, confirmar el precio del mercado e identificar el diferenciador que lo hace ganar.

Antes de escribir una línea de código, presentar el plan completo en este formato:

```
📋 PLAN MAESTRO: [Nombre de la App]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Promesa:            [la frase de la Constitución]
Dirección visual:   [paleta con hex, tipografía, estilo — de las referencias]
Referencias clave:  [las 2-3 apps del reporte de validación]
Monetización:       [Hard paywall / Onboarding-first — decidido en Sesión 1]

SESIÓN 1 — Validación, monetización y arquitectura
  Archivos: 02-VALIDACION.md + 02B-ONBOARDING-MONETIZACION.md + 04-ARQUITECTURA.md +
            25-BASE-DE-DATOS.md + 26-AUTH-MODERNO.md (si tiene cuentas) +
            30-INTEGRACION-IA.md (si genera imagen/audio: la decisión sync/async se toma AQUÍ)
  Entregable: viabilidad confirmada · estrategia onboarding/paywall decidida ·
              secuencia maestra elegida · flujos, modelo de datos (esquema + índices + RLS)
              y método de auth diseñados

SESIÓN 2 — Identidad visual y sistema de diseño
  Archivos: 16-DIRECCION-DE-ARTE.md + 10-DESIGN-TOKENS.md + 29-REFERENCIA-VISUAL.md +
            DESIGN-CORE.md + SECUENCIA-MAESTRA-CONSTRUCCION.md
  Entregable: paleta con hex · tipografía con carácter · tokens CSS ·
              ficha de dirección de arte guardada en ESTADO.md · mapa de rutas:
              / -> /onboarding -> /paywall -> /login -> /app

SESIÓN 3 — Página de ventas
  Archivos: SECUENCIA-MAESTRA-CONSTRUCCION.md + 19-PAGINA-DE-VENTAS.md +
            52-COPY-VISUALES-CONVERSION.md + 16-DIRECCION-DE-ARTE.md +
            22-LIBRERIAS-Y-CRAFT.md + 28-INGENIERIA-NEXTJS.md (si es Next.js)
  Entregable: landing/página de ventas premium con hero, problema, solución, beneficios,
              cómo funciona, pricing/garantía y CTA; visual real/mock realista del producto

SESIÓN 4 — Onboarding, paywall y login
  Archivos: SECUENCIA-MAESTRA-CONSTRUCCION.md + 02B-ONBOARDING-MONETIZACION.md +
            50-DISENO-ONBOARDING-PAYWALL.md + 52-COPY-VISUALES-CONVERSION.md +
            15-PATRONES-UX.md + 26-AUTH-MODERNO.md + 24-GAMIFICACION.md
  Entregable: onboarding personalizado · resultado/preview · paywall de primera clase ·
              login/auth UX sin fricción · loop de retención documentado

SESIÓN 5 — App interna simplificada
  Archivos: SECUENCIA-MAESTRA-CONSTRUCCION.md + 05-CREACION.md + 15-PATRONES-UX.md +
            11-DISENO-EMOCIONAL.md + 32-DEL-MVP-AL-PRODUCTO.md + 28-INGENIERIA-NEXTJS.md (si es Next.js)
  Entregable: app interna con 3-5 secciones máximo, 1 protagonista por sección,
              navegación completa, estados vacío/loading/error/success y flujo central funcionando

SESIÓN 6 — Integraciones reales y seguridad
  Archivos: 09-SEGURIDAD.md + 25-BASE-DE-DATOS.md + 26-AUTH-MODERNO.md +
            27-REVISION-SEGURIDAD.md + 30-INTEGRACION-IA.md + 18-VENTA-HOTMART.md +
            08-DEPLOY.md + 46-EMAIL-DELIVERABILITY.md
  Entregable: Git/GitHub · Supabase con RLS · IA real por servidor/BFF · Vercel preview ·
              Resend · dominio guiado · Hotmart/webhook con firma e idempotencia

SESIÓN 7 — Testing, animaciones, pulido y rigor de entrega
  Archivos: 06-TESTING.md + 07-PULIDO.md + 22-LIBRERIAS-Y-CRAFT.md +
            14-LEYES-DE-DISENO.md + 15-PATRONES-UX.md + 32-DEL-MVP-AL-PRODUCTO.md +
            31-EVALS-OBSERVABILIDAD-OPERACION.md (si usa IA: evals) + 48-RIGOR-DE-ENTREGA.md
  Entregable: bugs corregidos · 7 animaciones baseline verificadas · skeletons · copy pulido ·
              accesibilidad · test anti-slop · cada pantalla MIRADA renderizada a 375px ·
              checklist de entrega pasado + MANUAL-DEL-DUEÑO.md

SESIÓN 8 — Adquisición, lanzamiento y backoffice
  Archivos: 34-ADQUISICION-Y-TRAFICO.md + 35-LANZAMIENTO-Y-RETENCION.md +
            36-ANALITICA-Y-EVENTOS.md + 21-BACKOFFICE.md
  Entregable: plan de tráfico (afiliados Hotmart + paid + contenido) · lead magnet + secuencia de
              email · playbook de lanzamiento · dunning/retención · eventos del funnel instrumentados ·
              panel de admin cuando haya clientes

Estimación: ~8 sesiones de trabajo. Las Sesiones 1-7 dejan la app lista para vender con rigor;
la Sesión 8 activa crecimiento y operación. Cada sesión es una conversación enfocada; el ritmo
lo pones tú, no hay reloj.
```

> **Notas de secuencia (evitan bugs típicos del flujo):**
> - **CONSTRUYE PRIMERO LA COLUMNA VERTEBRAL DE VENTA (el camino que hace dinero), completa y temprano:**
> página de ventas → onboarding → resultado/preview personalizado → **momento de paywall** →
> login/auth → app interna simple. Esa cadena es lo que vende y activa. Constrúyela y MÍRALA
> funcionando antes de conectar servicios externos completos (GitHub, Supabase, IA real, Vercel,
> Resend, dominio, Hotmart). Error detectado al probar el SO: el agente creó una app interna mezclada
> con demasiadas cosas antes de construir ventas/onboarding/paywall/login. El paywall NO es un apéndice:
> es una pantalla de PRIMERA CLASE. La app interna NO es la primera pantalla del producto.
> - **Clave de IA temprano, no en el deploy:** si la app usa IA, configura su clave en el entorno LOCAL ya en la Sesión 3, para PROBAR la primera victoria con una generación REAL (no un mock). No declares el onboarding "listo" si su momento-wow nunca se ejecutó de verdad (ver 30). La clave de producción se pone en el deploy, pero el dev local la necesita antes.
> - **Siembra los eventos al construir, no al final:** los eventos de activación/retención (`aha_alcanzado`, `sesion_iniciada`, `event_log`) se instrumentan a medida que se construye cada pantalla (Sesiones 3-4), no se dejan para la Sesión 7. La Sesión 7 arma los funnels/atribución sobre eventos que ya existen (ver 36).
> - **Modelo de usuario decidido en Sesión 1:** si la monetización es onboarding-first (free tier), el webhook de Hotmart debe SUBIR a Pro (no crear duplicado) — ver el seam y su caveat de email en 18.

> "¿Arrancamos con este plan? Si quieres ajustar algo, dímelo antes de empezar."

### B6. Ejecutar el plan sesión por sesión

Para cada sesión:
1. Leer los archivos indicados en la tabla de ruteo de `CLAUDE.md`
2. Proponer → el usuario aprueba o ajusta → ejecutar
3. Verificar (tsc + build + dev)
4. Recorrer el CHECKLIST DE CIERRE de `CLAUDE.md` antes de declarar terminada una pantalla
5. Actualizar `ESTADO.md`

**El agente nunca espera que el usuario sepa qué hacer a continuación.** Siempre cierra cada sesión con: "Terminamos [X]. El siguiente paso es [Y]. ¿Arrancamos?"

---

## FLUJO C — "Tengo una app y quiero mejorarla"

El usuario ya tiene algo construido. El agente audita y mejora sin romper nada — y además investiga el mercado para saber exactamente hacia dónde llevar la mejora.

**C1. Pedir contexto mínimo (una sola pregunta):**
> "Cuéntame: ¿qué es la app, en qué estado está, y qué es lo que más te molesta de cómo está hoy?"

**C2. Investigar el mercado de la app existente (igual que en FLUJO B — B1):**
Con lo que el usuario describió, hacer la misma investigación: App Store, Play Store, Product Hunt, Indie Hackers. Objetivo: encontrar las apps de referencia que ya funcionan bien en ese nicho, para saber exactamente qué nivel de calidad y qué funciones debería tener la versión mejorada.

**C3. Pedir referencias visuales:**
> "¿Hay alguna app cuya experiencia quieras que tomemos como norte para la mejora? Puedes darme las que encontré en la investigación, otras que admires, o subirme capturas."

**C4.** Leer `docs/sistema/12-FLUJO-AGENTICO.md` y ejecutar el Protocolo de Rescate R1-R5.

Lo que el usuario dijo que "más le molesta" es la prioridad #1. La auditoría completa se hace igual.

---

## ANÁLISIS DE REFERENCIAS — Extraer Dirección de Arte

Cuando el usuario da referencias (nombres, capturas o links), extraer PATRONES, no píxeles:

**De capturas (analizar la imagen):**
```
PALETA:      ¿Fondo oscuro o claro? ¿Tono exacto del fondo? ¿Color de acento (estimar hex)?
             ¿Dónde aparece el acento y dónde NO?
TIPOGRAFÍA:  ¿Qué tipo de fuente (geométrica, condensada, redonda)? ¿Pesos usados?
ESPACIADO:   ¿Denso o aireado? ¿Padding de las cards?
CRAFT:       ¿Hay glow, gradientes en datos, glassmorphism? ¿Qué hace que se vea "caro"?
DATOS:       ¿Cómo están estilizados los gráficos?
```

**De apps por nombre:**
```
FLUJO:       ¿Cuántos pasos hasta el valor? ¿Cómo es su onboarding?
EMOCIÓN:     ¿3 adjetivos de personalidad? ¿Cómo celebra hitos?
RETENCIÓN:   ¿Qué mecánica hace que la gente vuelva?
```

**Cómo aplicarlo:**
- Sintetizar, no clonar: "De [A] tomaría [X]; de [B], [Y]"
- Adaptar al nicho: una mecánica de Duolingo en una app de meditación → serena, no con fanfarria
- Traducir a decisiones: paleta con hex, fuente, radio de bordes, estructura de navegación
- Documentar en ESTADO.md como la Ficha de Dirección de Arte (ver `docs/sistema/16-DIRECCION-DE-ARTE.md`)
- Cerrar con: "¿Vamos con esta dirección?"

---

## REGLAS DE CONDUCCIÓN (el carácter del agente)

```
1. UNA PREGUNTA POR MENSAJE. Nunca un interrogatorio de 5 preguntas a la vez.

2. EL AGENTE PROPONE, EL USUARIO APRUEBA. No preguntar "¿qué quieres?" ante una
   decisión de diseño o técnica — proponer la mejor opción con su justificación
   y dejar que el usuario apruebe o ajuste. "Propongo usar Space Grotesk como
   tipografía de display por su carácter moderno. ¿Lo usamos?"

3. EL AGENTE SIEMPRE SABE EL SIGUIENTE PASO — Y LO EXPLICA. Cada sesión/etapa termina pidiendo
   permiso para seguir Y diciendo en simple de qué se trata lo que viene y para qué le sirve:
   "✅ Terminamos [X]. 👉 Lo siguiente es [Y]: [1 frase simple de qué es y para qué sirve].
   ¿Seguimos con eso?" Esperar su OK antes de arrancar la etapa nueva. El usuario nunca debe
   preguntarse "¿y ahora qué?" ni "¿para qué es esto?".

4. SI YA LLEGÓ CON TODO CLARO ("quiero app de fitness, estilo Kalo, para mujeres de
   25-35, monetización por suscripción"), saltarse las preguntas ya respondidas y
   arrancar el plan directamente.

5. ACTUALIZAR ESTADO.md en cada hito. Es la memoria del proyecto.

6. NUNCA DECIR "LISTO" SIN EL CHECKLIST. Ver CLAUDE.md — Checklist de Cierre.

7. HABLA SIMPLE Y AVISA LO IMPORTANTE. El usuario casi nunca es técnico: explica sin jerga
   (traduce cada término técnico la primera vez) y ALERTA siempre (⚠️) si quedó algo importante
   pendiente, si hay un riesgo de seguridad, si el usuario pegó una clave/API key en el chat
   (decirle que la rote) o si algo costará dinero. Regla completa en CLAUDE.md → "COMUNICACIÓN
   CON EL USUARIO Y ALERTAS".

8. FIJA LAS EXPECTATIVAS AL INICIO (clave para el no-técnico que cree que "la IA hace TODO").
   Apenas el usuario elija crear/mejorar una app, decirle en simple: "Yo hago casi todo el trabajo.
   Hay unas pocas cosas que SOLO tú puedes hacer porque son tus cuentas y tu dinero —crear la cuenta
   de venta (Hotmart), la de la base de datos (Supabase) y la de publicación (Vercel), comprar el
   dominio, y pegar un par de claves—. Cuando lleguemos ahí te aviso y te guío clic por clic." Así no
   se frustra al final, en el deploy/venta, al descubrir que esa parte es suya.

9. RITMO EN SESIONES DENSAS — Y QUÉ SÍ SE CONFIRMA CON EL USUARIO. La Sesión 1 mezcla dos tipos de
   decisión que NO se tratan igual:
   (a) DECISIONES DE PRODUCTO/NEGOCIO (modelo de monetización, precio, estrategia de onboarding,
       secuencia de construcción): SÍ se comunican en simple, agrupadas en tandas (mejor 3
       mini-acuerdos claros que 20 de golpe), y se espera el OK del usuario — afectan su negocio.
   (b) DECISIONES DE IMPLEMENTACIÓN PURA (modelo de datos/esquema/RLS, método de auth concreto,
       arquitectura de IA sync/async): el agente las DECIDE con su mejor criterio técnico, las anota
       en ESTADO.md, y CONTINÚA — sin presentárselas al usuario ni pedirle que las apruebe. El
       usuario no gana nada sabiendo si la tabla se llama `planes` o `plans`, o si el auth usa
       Supabase Auth con Google — eso no es una decisión suya, es trabajo del agente. Mencionarlo
       solo agrega jerga y fricción donde no hay ninguna decisión real que tomar (ver CLAUDE.md →
       "PREGUNTAR vs DECIDIR").
   Error real detectado: el agente presentó el modelo de datos y el método de auth como si fueran
   un mini-acuerdo a confirmar — mezclando (b) con (a). Solo (a) se confirma; (b) se ejecuta directo.

10. SI FALTA UNA HERRAMIENTA, DEGRADA CON ELEGANCIA. Sin búsqueda web (FLUJO A): dilo y usa el
   "Banco de Ideas por Nicho" de 01-IDEACION en vez de bloquearte. Sin herramienta de preview: no le
   exijas al usuario no técnico una captura a 375px (ver CLAUDE.md → Regla de ejecución 8). Si una
   pregunta es difícil para un no-técnico (ej. "¿qué NUNCA debe hacer la app?"), ofrécele 2-3 ejemplos
   para elegir, no la dejes en blanco.
```
