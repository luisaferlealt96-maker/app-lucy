---
description: Eleva el diseño a nivel de estudio premium (anti-slop), capa por capa y con plan previo
---
DISEÑO PREMIUM / ANTI-SLOP — de "correcto" a "parece hecho por un estudio premium, no por IA"

Regla canónica actualizada: aplica primero `docs/sistema/PROMPT-DISENO.txt`, especialmente las
preguntas simples iniciales, el plan previo y la aprobación antes de tocar código. Contexto: $ARGUMENTS

Sube el diseño y la experiencia de esta app a nivel de estudio de producto premium. Trabaja CAPA POR
CAPA (nunca todo de un golpe), verificando entre cada una. Primero dame un PLAN corto con los VALORES
EXACTOS por pantalla (tamaños de fuente, espaciados, hex, curvas y duraciones de animación) y espera mi
OK; luego ejecuta. Esto es un rescate VISUAL y de experiencia: NO toques la lógica ni los datos.

━━━ [CONTEXTO DE LA APP] — es lo que dirige toda la dirección de arte ━━━
$ARGUMENTS

Si el contexto de arriba viene vacío o incompleto, NO asumas el nicho a secas: primero dedúcelo de
ESTADO.md (promesa central, ICP, dirección de arte ya decidida) y del código, y PREGÚNTAME solo lo que
falte ANTES de diseñar. El contexto completo que necesitas es:
  • Qué hace / pantalla principal
  • Audiencia / ICP (género, edad, nivel socioeconómico LATAM, estado emocional al usarla)
  • Personalidad en 3 adjetivos (gobierna color, copy y ritmo de animación)
  • Paleta/marca a preservar (si la hay) + nicho y 2-3 competidores

EJEMPLO de contexto bien dado (app "Ember", bienestar/burnout — home con un "score" en anillo +
consejos del día): Personalidad: serena pero motivadora, cálida, premium (calma y control; NO
gamificación infantil, NO corporativo frío). Audiencia: adultos con estrés laboral. Paleta: mantener
el ámbar/naranja ("Ember") pero llevándolo a algo más sofisticado y cohesivo. Animaciones clave: el
score cuenta de 0 a su valor sincronizado con el dibujado del anillo; badge de zona con pop (spring);
consejos con entrada escalonada (60ms); transición suave Hoy/Tendencia/Acciones.

LEE PRIMERO: 16-DIRECCION-DE-ARTE (incl. el PASO 0 "del brief al brand kit" — DERIVA la identidad desde
la audiencia/ICP, no copies un nicho; + las prohibiciones anti-slop + el "test del primer reflejo"),
14-LEYES-DE-DISENO (specs exactas + dial de color), 29-REFERENCIA-VISUAL (paleta/tipografía por nicho +
matriz audiencia×nicho), 10-DESIGN-TOKENS, 22-LIBRERIAS-Y-CRAFT (Motion/Phosphor/Lottie/Recharts + las 7
animaciones baseline), 17-VISUALIZACION-DATOS (si hay gráficos/anillos) y 11-DISENO-EMOCIONAL.

━━━ FASE 1 — EXPLORAR (sin cambiar nada) ━━━
Lee el código, levanta el dev server y observa la app real EN MOVIMIENTO (las animaciones no se ven en
un screenshot estático). Crea/actualiza ESTADO.md anotando qué animaciones y craft YA existen y faltan.

━━━ FASE 2 — DIAGNÓSTICO con el "test de entrecerrar los ojos" ━━━
Caza estas señales concretas de "hecho con IA": fondo #000/plano sin profundidad · demasiados textos/
elementos compitiendo · números mal centrados dentro de su anillo (deben ir con su label como grupo
centrado óptica y matemáticamente) · no se entiende el siguiente paso (falta jerarquía) · ícono de la
sección activa del mismo color que su fondo (INVISIBLE) · navegación sin transiciones suaves · paleta
cobarde (azul/gris/morado por default) que no se derivó de la audiencia. Documenta cada violación de los
mandamientos y de las specs numéricas ANTES de tocar nada.

━━━ FASE 3 — PRESÉNTAME EL PLAN Y DETENTE ━━━
- La dirección de arte propuesta DERIVADA del [CONTEXTO] vía PASO 0 de 16: arquetipo + keywords →
  paleta con hex (con contraste AA y daltonismo desde el inicio) + tipografía por clasificación (NO
  Inter/Roboto; Space Grotesk/Geist sobreusadas — usa 29) + motion signature + detalles de craft.
- Qué librerías instalarás (Motion obligatorio; Phosphor fill para estado activo; Lottie si propones
  ilustración/celebración; Recharts si mejora un anillo/gráfico).
- La lista EXACTA de animaciones (las 7 baseline + las específicas de esta app).
NO ejecutes hasta que yo apruebe.

━━━ FASE 4 — (tras mi OK) EJECUTAR por capas (protocolo de diseño del archivo 14) ━━━
 1) Layout y jerarquía: UN objeto principal por pantalla, densidad correcta, "qué sigue" obvio.
 2) Sistema visual y tokens: escala tipográfica, espaciado mecánico (solo 4·8·12·16·24·32·48·64), radio único.
 3) Color con intención: dark-first con profundidad (no #000 plano), acento derivado, regla 60-30-10;
    AUDITA al final y recorta los colores que se colaron.
 4) Tipografía con carácter (2 familias máx).
 5) Movimiento: las 7 animaciones baseline (stagger · conteo de números héroe · dibujado de anillos/
    barras · tap <150ms scale 0.97 · transición entre tabs · aparición de modales/sheets · celebración
    SOLO en hitos reales), prefers-reduced-motion SIEMPRE.
 6) Un detalle de craft por pantalla protagonista (glow / gradiente con dato / glassmorphism), con propósito.
 + Estados: skeleton al cargar, empty states con ilustración + copy + CTA (15).

ELIMINA TODO ANTI-SLOP (listas de 16 y 14): franjas de acento, texto con gradiente, glassmorphism
decorativo, "métrica héroe" repetida, grids idénticas, eyebrows en mayúsculas, marcadores 01/02/03,
fuentes genéricas, gradiente morado-azul por default.

━━━ CIERRE — MÍRALO RENDERIZADO (la regla que más se salta) ━━━
Tras CADA capa: tsc + build + dev limpios; ABRE la pantalla RENDERIZADA a 375px y MÍRALA (mecanismo REAL
de preview/screenshot — el reporte debe incluir la RUTA del screenshot). Puntúala con la RÚBRICA /40 de
07 SOBRE LO QUE VES, no sobre el código — nunca <36/40. Verifica en el render: nav al fondo sin vacío
muerto (min-h-dvh, no min-h-full), fondo CON profundidad, pantalla LLENA DE VALOR, CTA vivo (ver 32).
Test final: "si quito el logo, ¿se ve como estudio premium o como template de IA?".

REGLAS: mejora lo que existe (no reescribas sin avisar) · cero features nuevas (van a ESTADO.md) · causa
raíz, no parches · anima CON PROPÓSITO (no satures) · NUNCA declares una pantalla "lista" sin haberla
MIRADO renderizada a 375px y pasado la rúbrica /40 · actualiza ESTADO.md por capa. Empieza con la Fase 1.
