# PÁGINA DE VENTAS DE ALTA CONVERSIÓN — Estructura, Copy y Visuales que Venden

> **Cuándo cargar este archivo:**
> - Siempre que se cree la landing/página de ventas de la app
> - Junto con `52-COPY-VISUALES-CONVERSION.md`, `14-LEYES-DE-DISENO.md`, `16-DIRECCION-DE-ARTE.md`, `22-LIBRERIAS-Y-CRAFT.md` y `11-DISENO-EMOCIONAL.md`
>
> **Por qué existe:** Una app excelente con una página de ventas básica (2-3 bloques de texto, sin visuales) NO vende. Este archivo recoge los patrones exactos de las páginas que mejor convierten del mundo — Linear, Notion, Stripe, Vercel, Framer — combinados con copywriting de respuesta directa. Una landing creada con este sistema tiene MÍNIMO 11 secciones, visuales reales en cada una, animaciones con propósito, y cumple los Core Web Vitals. "Básica" deja de ser una opción.

---

## EL ESTÁNDAR 2026 — Lo que Comparten TODAS las Páginas que Convierten

La investigación across decenas de SaaS top es unánime en 4 cosas. Si la landing no las tiene, no está terminada:

```
1. POSICIONAMIENTO IMPLACABLE arriba del pliegue: en 3-5 segundos el visitante entiende
   QUÉ es, PARA QUIÉN y POR QUÉ importa — sin scroll.
2. VISUALES REALES DEL PRODUCTO, nunca ilustraciones de stock: las páginas top dejan que
   el producto hable — screenshots reales, UI pulida, previews interactivos.
3. MOVIMIENTO CON PROPÓSITO, sin frenar la carga: micro-animaciones que añaden significado,
   no ruido — reveal al hacer scroll, hover states, checkmarks animados.
4. UNA PÁGINA DE PRICING que responde preguntas antes de que el usuario dude.
```

La causa #1 de páginas que no convierten, según la investigación: sin una propuesta de valor única, con un hero que describe el producto en vez de mostrar qué cambia para el usuario. El patrón ganador es de "mostrar", no "describir": minimal motion que añade significado, no ruido — reveal de contenido al hacer scroll, checkmarks animados en formularios, micro-animación en los íconos de cada beneficio al entrar en viewport.

> **Regla nueva de conversion:** antes de diseñar, escribir el argumento de venta con `52-COPY-VISUALES-CONVERSION.md`. La landing NO se aprueba si el hero tiene parrafos largos, si el visual no demuestra antes→despues o si el CTA no lleva a una accion concreta. La IA debe producir copy de respuesta directa, no copy explicativo.

---

## EL ARCO NARRATIVO — StoryBrand SB7 como columna vertebral de las 11 secciones

Antes de escribir la landing, revisar `52-COPY-VISUALES-CONVERSION.md` → "1bis. FORMULA DE TITULAR" (las 4 U's) y "2bis. PATRONES VALIDADOS DE APPS GANADORAS" — esos dan la fórmula del titular y la evidencia de apps reales; esta sección da el ARCO que conecta las 11 secciones entre sí para que la landing se lea como una historia, no como una lista de bloques sueltos (Donald Miller, *Building a StoryBrand*, 2017):

```
PERSONAJE   -> el visitante es el HÉROE (no la app). El Hero de la sección 1 le habla a ÉL.
PROBLEMA    -> secciones 2-3 (prueba social + problema): lo que le está costando no resolverlo.
GUÍA        -> la app aparece como GUÍA con empatía (entiende el problema) + autoridad (sabe resolverlo).
              Nunca como protagonista ("nosotros somos los mejores") — el texto dice "vos vas a lograr".
PLAN        -> secciones 4-6 (solución + beneficios + cómo funciona): el camino claro a seguir.
LLAMADO A LA ACCIÓN -> el CTA, repetido en hero/mid-page/final (ya especificado abajo).
FRACASO EVITADO -> lo que se pierde si no actúa (pérdida honesta, nunca culpa).
ÉXITO       -> sección de cierre: el estado transformado que el héroe alcanza.
```

Chequeo rápido: si al leer la landing de corrido no queda claro quién es el héroe (el visitante) y quién es el guía (la app), el arco está roto — normalmente porque el copy habla de la app en vez de hablarle al usuario.

---

## MESSAGE-MATCH — la landing debe continuar la promesa del anuncio (no empezar de cero)

La causa más silenciosa de una landing que "no convierte" no está en la landing: es la **ruptura entre el anuncio y el hero**. El visitante hizo clic por una promesa concreta (el creativo de `34-ADQUISICION-Y-TRAFICO.md`, el asunto del email, el post de TikTok). Si el hero le habla de otra cosa, su cerebro registra "esto no es lo que vine a ver" y rebota en 2 segundos — sin importar lo bonita que sea la página.

```
REGLA DE CONGRUENCIA (information scent): el headline del hero debe ECOAR la promesa exacta
del anuncio/email/post que trajo al visitante.
  - Mismo beneficio, mismo lenguaje, mismo ángulo. Si el ad dice "deja de empezar tus videos
    desde cero", el hero NO dice "la plataforma de IA más completa" — dice algo como
    "Tus videos, listos sin empezar desde cero".
  - Si corres varios ángulos/audiencias en 34, idealmente cada uno lleva a una variante de hero
    (o a una landing) que recoge SU promesa — no a un hero genérico para todos.
  - El nivel de consciencia (Schwartz, regla 11 de copy) debe coincidir: tráfico frío de
    descubrimiento (TikTok/Reels) aterriza en un hero que agita el problema; tráfico caliente
    (retargeting, lista de email) aterriza directo en la oferta.
```

> **Por qué importa para Hotmart/LATAM:** el grueso del tráfico llega por redes (IG/TikTok) con un creativo muy específico. Cada quiebre de congruencia entre ese creativo y el hero es conversión que ya pagaste (en ad spend o en alcance) y tiras. El message-match es de las palancas más baratas: no requiere rediseñar nada, solo alinear el copy del hero con el del anuncio de `34`.

---

## PATRONES DE HERO POR TIPO DE APP (con ejemplos reales)

El hero cambia según el tipo de producto. Elegir el patrón según el nicho de la app:

```
TIPO "HERRAMIENTA/DASHBOARD" (productividad, fitness tracker, finanzas personales)
  → Patrón Linear: headline corto y confiado (<8 palabras) sobre fondo OSCURO, con un
    screenshot grande del producto real ocupando buena parte del hero, con glow/gradiente
    detrás que lo hace "flotar". Cero ilustraciones — la UI real es el héroe.
  → "Lead con la UI de tu producto en el hero. Usa fondo oscuro para que los screenshots
    resalten. Headline bajo 8 palabras."

TIPO "WORKSPACE/CONTENIDO" (apps de notas, organización, creación)
  → Patrón Notion: fondo CLARO, minimalista, acogedor. Headline que compromete con UN
    resultado antes de que el visitante haga scroll. Whitespace generoso, screenshot del
    producto con buen espacio alrededor.

TIPO "IA / DEV TOOL" (generadores, asistentes, apps con IA)
  → Dark mode es el estándar para audiencias de producto/tech — combina con el patrón Linear:
    hero oscuro, screenshot/demo del producto, gradientes cinematográficos sutiles.

TIPO "DEMO INTERACTIVO" (cuando el producto es muy visual o inmediato)
  → Demos embebidos reemplazan screenshots estáticos, aumentando tiempo en página y
    conversión simultáneamente. Si la app lo permite, un mini-demo interactivo en el hero
    (aunque sea con datos de ejemplo) supera a cualquier imagen.
```

### Bento Grid de Features (el patrón que reemplaza la lista aburrida de "features")
En vez de 3-5 bloques de texto con un ícono, el patrón ganador es un **bento grid**: una cuadrícula de bloques de distinto tamaño, cada uno con un screenshot/UI real del producto mostrando ESE feature en acción. Sin iconos genéricos, sin ilustraciones — solo el producto. El bloque más grande para el feature más importante (jerarquía por tamaño, igual que en `17-VISUALIZACION-DATOS.md`). El fondo oscuro hace que cada screenshot "resalte" como una ventana iluminada.

```
Implementación: grid de 2-3 columnas, bloques de 1x1, 1x2, 2x1, 2x2 según importancia.
Cada bloque: título corto de beneficio + screenshot/mockup real recortado + (opcional)
micro-animación del elemento al entrar en viewport (fade + slide-up, stagger entre bloques).
```

---

## LA ESTRUCTURA VALIDADA (orden de secciones, de arriba a abajo)

El error #1 de las páginas que no convierten: listar lo que la app HACE en vez de lo que el usuario LOGRA. La gente no compra software, compra una versión mejor de su situación. Cada elemento de la página se filtra por: "¿esto acerca al visitante a imaginar su vida resuelta?"

La regla de copywriting que lo resume (transformación feature→beneficio): en vez de "tiene encriptación avanzada", decir "protege los datos de tus clientes para que duermas tranquilo". Lo específico le gana a lo genérico siempre.

Esta es la secuencia que comparten las landing pages de mayor conversión (Notion, Linear, Framer, Asana y las top de SaaS 2026). Cada sección tiene un trabajo psicológico específico.

### 1. HERO (above the fold) — los primeros 3-5 segundos deciden todo
El visitante debe entender QUÉ es, PARA QUIÉN y POR QUÉ le importa, sin hacer scroll.
```
- Header de marca: logo + nombre de app siempre visibles. El logo/nombre lleva a `/`.
- Headline: el beneficio/transformación en <8 palabras (máx 44 caracteres). NO el nombre
  de la app, NO una feature. La promesa central. Las cifras concretas en el headline
  superan a las afirmaciones vagas por un margen notable.
  ✅ "Crea apps con IA y véndelas cada mes"
  ✗ "La plataforma de gestión de proyectos con IA más completa"
- Subheadline: 1-2 líneas que aclaran el cómo y para quién (amplía la promesa, baja la duda)
- Resaltar 1-2 palabras clave en negrita/acento si cambian la decision: resultado, tiempo,
  perdida evitada o mecanismo. No convertir todo el parrafo en negritas.
- UN CTA primario dominante (color de acento, verbo de acción): "Empieza gratis" / "Quiero acceso"
- Visual del producto REAL según el PATRÓN DE HERO elegido arriba (screenshot, demo, bento).
  Nunca ilustración de stock. Debe demostrar antes→despues, desbloqueo, progreso o prueba
  real en 3-5 segundos.
- Sin navegación que distraiga: el hero concentra la atención en el CTA.
- Opcional: una línea de prueba social bajo el CTA ("+2.000 personas ya lo usan")
- Micro-animación de entrada: el visual del producto entra con fade+slide (400-600ms),
  el headline puede tener un sutil reveal de palabras o gradiente animado en una palabra clave.
```

### 2. PRUEBA SOCIAL INMEDIATA (apenas pasa el hero)
La confianza se construye antes que el argumento. Logos, números, o testimonios arriba.
```
- Logos de clientes/medios, O un número fuerte ("+10.000 apps creadas"), O 2-3 testimonios cortos
- Colocar señales de confianza (logos, badges, testimonios) arriba del pliegue puede elevar
  la conversión de forma notable — la confianza llega antes que el argumento
- Nombrar es más potente que abstraer: "usado por [marcas reales]" > "usado por empresas"
- Si hay rating/reseñas, mostrarlo con estrellas
```

### 3. EL PROBLEMA (agitar el dolor)
Antes de la solución, nombrar el dolor que el visitante vive. Que piense "me están leyendo la mente".
```
- 2-3 frases que describen la frustración actual con vívido detalle
- Técnica de respuesta directa: agitar el problema antes de presentar la cura. El contraste
  hace que la solución se sienta urgente.
- Ejemplo: "Pagaste miles a un desarrollador que tardó meses y entregó algo que no servía.
  Mientras, tu idea seguía sin existir."
```

### 4. LA SOLUCIÓN / TRANSFORMACIÓN (el puente)
Presentar la app como el puente del dolor (estado actual) al deseo (estado soñado).
```
- "Antes vs Después": el contraste visual o textual del antes (con la app) y después
- La promesa central reformulada como mecanismo: "Así es como [app] lo resuelve"
- Mantener el foco en el RESULTADO, no en el listado técnico
```

### 5. BENEFICIOS (no features) — BENTO GRID con producto real
```
PATRÓN PRINCIPAL: bento grid de 4-6 bloques de distinto tamaño (ver sección de arriba),
cada uno con: título de beneficio (outcome concreto) + screenshot/UI real de ESE feature
+ 1 línea de apoyo. El bloque más grande = el feature/resultado más importante.
- Fórmula feature→beneficio→emoción: qué hace → qué logras → cómo te sentirás
- Cuantificar siempre que se pueda: "Ahorra 10 horas a la semana" > "Ahorra tiempo"
- Headlines de bloque accionables, no genéricos
- Micro-animación: cada bloque entra con fade+slide-up al hacer scroll, escalonado
  (stagger 60-80ms entre bloques) — "reveal" que añade significado sin saturar
- Si no hay bento (app muy simple): alternativa en zigzag (texto+visual alternando lados),
  pero SIEMPRE con visual real, nunca solo texto
```

### 6. CÓMO FUNCIONA (reducir la fricción percibida)
3 pasos simples que muestran lo fácil que es empezar.
```
- "1. Describe tu idea → 2. La IA la construye → 3. Véndela"
- Cada paso con un ícono/visual. Que se sienta alcanzable, no complejo.
```

### 7. PRUEBA SOCIAL PROFUNDA (testimonios con cara y resultado)
Testimonios reales que demuestran la transformación.
```
- Foto + nombre + resultado específico y VERIFICABLE ("pasé de 2 horas a 15 minutos por propuesta")
- Los testimonios con número/resultado concreto convierten más que los genéricos
- Si hay casos de estudio o capturas de resultados reales, incluirlos (con permiso)
- Video testimonios > texto, si existen
```

#### MOCKUPS HONESTOS PRE-LANZAMIENTO — qué SÍ mostrar cuando la app interna no existe todavía

El SO ya prohíbe inventar testimonios o prueba social falsa (ver abajo). Pero eso NO significa dejar el bento grid de beneficios vacío de visuales — significa construir el visual con HTML/CSS real, honesto sobre su naturaleza, en vez de un screenshot inventado o un ícono genérico:

```
JERARQUÍA DE FIDELIDAD (usar la más alta que el proyecto pueda pagar en esta sesión):
1. Screenshot/GIF REAL de la app interna ya construida — la opción ganadora, úsala en cuanto exista.
2. Mini-demo funcional en HTML/CSS/Motion que reproduce el mecanismo REAL de la app (no una
   ilustración decorativa) — ej. un carrusel de 3-4 "momentos" que muestra el ANTES/DURANTE/DESPUÉS
   con el contenido REAL del dominio (nunca lorem ipsum): brain dump → priorización → plan con
   bloques → reporte semanal. Esto SÍ es honesto: demuestra el mecanismo real, no actúa como si
   fuera captura de una app terminada.
3. Wireframe rotulado explícitamente como boceto (si el proyecto está en fase muy temprana) — nunca
   presentado con el pulido de un producto terminado si no lo es.

PROHIBIDO SIEMPRE: capturas de stock, mockups de otra app con el logo cambiado, o cualquier visual
que sugiera "así se ve la app ya en producción" cuando no es cierto.
```

Un carrusel de 3-4 mini-demos (mecanismo real, contenido real, sin pretender ser un screenshot de producción) cumple el rol de "visuales reales del producto" del estándar 2026 de abajo, incluso antes de tener la app interna terminada — y es lo que Cal AI y Tiimo muestran en su propio onboarding antes del paywall (ver `52` → "2bis. Patrones validados de apps ganadoras", punto 2).

#### PRUEBA SOCIAL EN FRÍO — el playbook del día 1 (cuando aún NO hay testimonios)

Los checklists piden testimonios y números que una app recién lanzada NO tiene — y la ética del SO
**prohíbe inventarlos**: el placeholder "María G. ganó $500" es exactamente la puerta por donde se
cuelan los testimonios fabricados. La jerarquía día-1, en orden de fuerza:

```
1º DEMO EN VIVO / GIF DEL PRODUCTO REAL funcionando — la prueba más fuerte que existe:
   no AFIRMA que funciona, lo DEMUESTRA en 10 segundos. Prioridad absoluta sobre todo lo demás.
2º GARANTÍA DE HOTMART destacada — reversión de riesgo que el comprador puede verificar por sí mismo.
3º RESULTADOS DEL PROPIO FUNDADOR, con fecha y contexto — "Yo la uso para mis carruseles:
   en junio 2026 pasé de 2 horas a 10 minutos por pieza". Honesto y específico, divulgando que eres tú.
4º 3-5 BETA TESTERS con nombre real, a cambio de acceso gratis — SIEMPRE divulgado
   ("probó la beta con acceso gratuito"). Reales, contactables, con permiso.
5º CONTADOR REAL desde N usuarios ("+37 personas ya lo usan") — solo cuando el número exista,
   NUNCA antes ni redondeado hacia arriba.

REGLA DURA: la sección de testimonios se OMITE hasta tener 3 reales — nunca se rellena con
placeholders, "ejemplos ilustrativos" ni fotos de stock con nombre. Una landing sin testimonios
es honesta; una con testimonios falsos es fraude, mata la cuenta de ads y viola la moderación
de Hotmart (ver 47).
```

### 8. MANEJO DE OBJECIONES (FAQ estratégico)
Responder las dudas que frenan la compra, framadas para vender.
```
- 4-6 preguntas que son las objeciones reales: "¿Necesito saber programar?",
  "¿Y si no funciona para mi caso?", "¿Cuánto tardo en ver resultados?"
- Las respuestas no solo informan: reducen el riesgo percibido y reafirman el valor
- Incluir la objeción de precio reframeada (ver garantía abajo)
```

### 9. PRICING (claro, con anclaje y transparencia)
```
- Presentar el valor antes del precio (lo que logra >> lo que cuesta)
- Anclaje: comparar con el costo de NO tenerlo (contratar a alguien, tiempo perdido)
- TRANSPARENCIA es señal de confianza: publicar el precio exacto (no "contactar ventas")
  reduce el ciclo de decisión y filtra mejores leads
- EL ANUAL SIEMPRE COMO PRECIO MENSUAL ("$X/mes, facturado anualmente"), NUNCA el total anual en grande:
  así el anual se ve MÁS BARATO que el mensual de un vistazo (la comparación que vende). El total va
  solo en letra chica. Mostrar el mensual al lado como ancla "cara".
  → Anual PRE-SELECCIONADO + badge "Más popular / Mejor valor" (+15-20% eligen anual, Mojo/RevenueCat).
  → Ahorro como "2 MESES GRATIS" (≈17%), no como "%". Descomponer por día ("menos de $1 al día").
  → DATO LATAM (clave para Hotmart): este display dio +45% de ingreso por paywall en Brasil.
- Precios en .99 para LATAM (ej: $19.99). 
- CTA en cada plan
- Si hay garantía, ponerla aquí bien visible
- Nunca escribir placeholders como "garantia visible" o "pago seguro". Si existe, nombrar
  la politica concreta: "Garantia Hotmart de 7 dias" / "30 dias o te devolvemos tu dinero".
  Si aun no existe, no se muestra en UI publica; queda como pendiente interno.
```

### 10. GARANTÍA / REVERSIÓN DE RIESGO
Quitar el miedo a perder el dinero.
```
- "Garantía de X días o te devolvemos tu dinero" (Hotmart facilita esto)
- Reduce drásticamente la fricción de la compra
- Framear como confianza en el producto, no como salida
```

### 11. CTA FINAL (cierre emocional)
La última oportunidad, con urgencia genuina.
```
- Reafirmar la transformación una vez más
- CTA dominante repetido
- Opcional: urgencia/escasez REAL (no falsa): bono por tiempo limitado, plazas, precio de lanzamiento
- Cerrar con la visión del estado soñado: "Imagina [resultado] en 30 días"
```

---

## REGLAS DE COPYWRITING DE RESPUESTA DIRECTA

Aplicar el conocimiento de los maestros (Schwartz, Halbert, Kennedy, Georgi, Bencivenga):

```
1. UN SOLO LECTOR: escribir como si le hablaras a UNA persona específica (el avatar),
   no a "usuarios". "Tú", no "ustedes".

2. CLARIDAD > INGENIO: que se entienda en 3 segundos le gana a que suene listo.
   La confusión mata la conversión.

3. ESPECIFICIDAD VENDE — pero solo SEGURA y VERIFICABLE: "de 2 horas a 4 minutos por carrusel"
   es más creíble que "ahorra tiempo". Los números concretos generan credibilidad.
   ⛔ REGLA: números específicos SOLO si son verificables y propios (medidos, con contexto).
   PROHIBIDOS los claims de INGRESOS ("gana $1.847 en 21 días") y de SALUD no sustentados:
   violan las políticas de anuncios de Meta/TikTok (income claims), queman la cuenta de ads
   y arriesgan la moderación de Hotmart (ver 47 → "claims publicitarios y moderación").
   La especificidad segura vive en PROCESO y TIEMPO, no en promesas de resultado económico/corporal.

4. BENEFICIO DEL BENEFICIO: no "ahorra tiempo" → "recupera tus noches y cena con tu familia".
   Llegar a la emoción detrás del resultado.

5. EL LECTOR ES EL HÉROE, la app es la herramienta. No "somos los mejores",
   sino "tú vas a lograr".

6. AGITAR ANTES DE RESOLVER (PAS: Problema-Agitación-Solución): nombrar el dolor,
   intensificarlo, luego presentar la cura.

7. VENDER LA TRANSFORMACIÓN, no la herramienta: la gente compra el agujero, no el taladro.

8. PRUEBA EN CADA AFIRMACIÓN: cada claim grande necesita respaldo (testimonio, número, demo).

9. UN CONCEPTO POR SECCIÓN: cada sección defiende una sola idea. No amontonar.

10. CTA QUE CONTINÚA LA CONVERSACIÓN: el botón dice lo que el usuario obtiene
    ("Quiero crear mi app"), no una orden genérica ("Enviar").

11. NIVEL DE CONSCIENCIA (Schwartz): adaptar el mensaje a qué tan consciente es el avatar
    del problema/solución. Frío = educar sobre el problema; caliente = ir directo a la oferta.

12. ELIMINAR FRICCIÓN VERBAL: frases cortas. Párrafos de 1-3 líneas. Verbos fuertes.
    Cero relleno corporativo.
```

---

## VISUALES DE ALTA CONVERSIÓN

```
- MOSTRAR EL PRODUCTO REAL: screenshots reales, demo embebido, GIF del producto en acción.
  El estándar 2026 es demostrar visualmente, no describir.
- HERO VISUAL con personalidad: split-screen (texto + visual) o producto centrado con glow.
- ZIGZAG en beneficios: alternar visual izquierda/derecha para ritmo.
- MICRO-ANIMACIONES sutiles que demuestran funcionalidad (Notion, Linear, Framer lo hacen).
- JERARQUÍA aplicada (ver `14-LEYES-DE-DISENO.md`): el CTA siempre es el elemento de
  mayor contraste; el ojo va al botón.
- CONSISTENCIA con la app: misma paleta, tipografía y personalidad que el producto real.
- MOBILE-FIRST: la mayoría llega por celular (especialmente tráfico de Instagram/TikTok).
  CTA sticky en mobile. Todo legible sin zoom.
- WHITESPACE generoso: las páginas apretadas se sienten baratas y bajan la confianza.
```

---

## RENDIMIENTO Y RESPONSIVE — Specs Técnicos (no negociables)

Una landing hermosa que carga lento PIERDE conversión. Cumplir estos 3 indicadores (Core Web Vitals de Google) no es opcional:

```
LCP (Largest Contentful Paint) < 2.5s — idealmente <1.5s
  → La imagen/elemento más grande del hero debe pintarse rápido.
  → Imagen del hero en AVIF/WebP, <100KB, SIN lazy-loading (carga inmediata) y con
    <link rel="preload"> si es crítica.
  → Fuentes con preload; evitar fuentes que bloqueen el render.

INP (Interaction to Next Paint) < 200ms
  → Las animaciones e interacciones (hover, scroll-reveal, CTAs) deben responder rápido.
  → Code splitting: no cargar JS de secciones que el usuario no ha visto.
  → Minimizar scripts de terceros que bloqueen el hilo principal.

CLS (Cumulative Layout Shift) < 0.1
  → TODO <img> con width/height definidos (o aspect-ratio en CSS) — nada "salta" al cargar.
  → Skeletons que reservan el espacio exacto del contenido real.
```

### Cómo tener animaciones Y velocidad a la vez
```
- Las animaciones de scroll-reveal (fade+slide al entrar en viewport) son CSS/JS ligero —
  no afectan LCP si no bloquean el render inicial. Usar Intersection Observer o las
  utilidades de scroll de Motion (ver 22-LIBRERIAS-Y-CRAFT.md).
- El hero carga INMEDIATO sin animación de entrada pesada — opcional un fade simple.
  Las animaciones más elaboradas van en secciones below-the-fold (no compiten con el LCP).
- Imágenes below-the-fold: SÍ lazy-loading. Solo el hero carga inmediato.
```

### Responsive — mobile-first (el grueso del tráfico llega por mobile)
```
- Diseñar primero para 375-390px (anchos móviles más comunes), expandir a tablet/desktop.
- Heros mobile-responsive con CTA claro impactan directo en la conversión del tráfico
  pesado de mobile/redes sociales.
- Bento grid: en mobile colapsa a 1 columna (bloques apilados, mantienen su jerarquía
  por orden: el más importante primero).
- CTA STICKY en mobile: barra fija inferior con el botón principal siempre visible.
- Texto: en mobile, los límites de `14-LEYES-DE-DISENO.md` (1 titular + 1 subtitular de
  2-3 líneas) son AÚN más importantes — la pantalla es chica.
- Touch targets ≥48px, sin hover-only (todo debe funcionar con tap).
- Probar el diseño en 375px de ancho ANTES de dar por terminada la landing.
```

---

## REGLAS DE CTA (colocación validada)

```
- Hero: H1 + CTA primario (60% del foco de la página está aquí)
- Mid-page: CTA después de la prueba social profunda (cuando la confianza es alta)
- Final: CTA de cierre emocional
- Sticky en mobile: barra fija con el CTA siempre visible
- UN solo tipo de acción primaria en toda la página (no competir "compra" con "agenda demo")
- Botones: alto contraste + verbo de acción + tamaño táctil (≥48px)
- Texto del CTA = lo que el usuario gana, no lo que hace
```

---

## ADAPTACIÓN AL FLUJO HOTMART

Como la venta se procesa por Hotmart (ver `18-VENTA-HOTMART.md`), el DESTINO del CTA depende del
modelo de monetización elegido en `02B` (y anotado en ESTADO.md) — no es siempre el checkout:

```
SI MODELO 1 (hard paywall — B2B, valor obvio):
- El CTA primario lleva al checkout de Hotmart (el link del producto), no a un registro propio.
- La landing vende el PAGO directamente. Tras comprar, Hotmart + Resend dan el acceso (ver 18).

SI MODELO 2 (onboarding-first — el DEFAULT B2C del SO, ver 02B):
- El CTA primario lleva al REGISTRO GRATIS de la app ("Crear mi plan gratis" / "Empezar gratis"),
  NO al checkout. El checkout de Hotmart aparece DESPUÉS, tras el onboarding, en el paywall in-app.
- La landing vende el REGISTRO; el onboarding vende el PAGO. Mandar tráfico frío directo al
  checkout de Hotmart en este modelo rompe la estrategia completa (te saltas el onboarding que
  convierte +234%) — es el error de configuración más caro de la landing.
- El puente al checkout (pantalla de transición, ?email=, retorno) está en 02B → "EL PUENTE DE CHECKOUT".

EN AMBOS MODELOS:
- Mencionar la garantía de Hotmart como reversión de riesgo
- Si hay landing + checkout de Hotmart, mantener coherencia visual entre ambos
- Para tráfico de Instagram/TikTok (audiencia de creadores): la página debe cargar rápido
  y convertir en mobile — es por donde llega el grueso del tráfico
```

---

## CHECKLIST DE PÁGINA DE VENTAS

```
ESTRUCTURA (mínimo 11 secciones, ninguna "básica")
[ ] Hero con headline <8 palabras + subheadline + 1 CTA + visual REAL del producto
    (patrón según tipo de app: Linear/Notion/IA — ver PATRONES DE HERO)
[ ] Prueba social inmediata tras el hero (logos/número/testimonios arriba del pliegue)
[ ] Sección de problema (agita el dolor)
[ ] Solución como transformación (antes/después)
[ ] BENTO GRID de 4-6 beneficios con screenshots/UI reales (no iconos genéricos)
[ ] Cómo funciona en 3 pasos simples
[ ] Testimonios con foto + nombre + resultado concreto — SOLO si hay ≥3 reales; si no, jerarquía día-1 (demo/GIF real + garantía + fundador + betas divulgados) y la sección de testimonios se OMITE (nunca placeholders)
[ ] FAQ que maneja las objeciones reales
[ ] Pricing transparente (precio visible) con anclaje + plan destacado
[ ] Garantía / reversión de riesgo visible
[ ] CTA final con cierre emocional

COPY
[ ] Vende transformación, no features
[ ] Le habla a UN avatar ("tú", específico)
[ ] Claims respaldados con prueba (números, testimonios)
[ ] Específico, no genérico (cifras concretas en headline y beneficios) — sin claims de ingresos/salud (regla 3 de copy; ver 47)
[ ] Frases cortas, párrafos de 1-3 líneas, verbos fuertes
[ ] CTAs dicen lo que el usuario gana

VISUAL Y ANIMACIÓN
[ ] Muestra el producto real en CADA sección relevante (no ilustraciones de stock)
[ ] Mismo universo visual que la app (paleta, tipografía, archivo 16)
[ ] Scroll-reveal con propósito: bloques entran con fade+slide al hacer scroll (stagger)
[ ] Micro-animaciones en CTAs, checkmarks de formularios, iconos de beneficio
[ ] Jerarquía: el CTA es el mayor contraste

RENDIMIENTO Y RESPONSIVE
[ ] LCP <2.5s: hero optimizado (AVIF/WebP <100KB, preload, sin lazy en el hero)
[ ] CLS <0.1: todas las imágenes con dimensiones definidas
[ ] INP <200ms: animaciones below-the-fold no bloquean interacción
[ ] Probado en 375px de ancho — mobile-first real
[ ] CTA sticky en mobile
[ ] Touch targets ≥48px

CONVERSIÓN
[ ] Se hizo la "PASADA FINAL DE AUTO-AUDITORÍA" de `52`: recorrido completo de arriba a abajo
    DESPUÉS de terminar de escribir todo — no solo revisar cada sección al momento de escribirla.
[ ] TODO subheadline/párrafo/bullet se contó en palabras contra el "PRESUPUESTO DE COPY" de `52`
    (subheadline ≤12-14 palabras, bullet ≤10-12, párrafo ≤2 líneas mobile) — no "se ve corto".
[ ] Ninguna sección tiene 3+ bloques de texto seguidos sin un ícono/mockup/foto — ver "DENSIDAD
    VISUAL" de `52`.
[ ] Si hay un asset que la IA no puede generar (foto del fundador, video, captura real), existe un
    placeholder con ícono + instrucción de 1 línea — nunca un espacio vacío ni una ilustración
    generica haciendo de asset real (ver "PLACEHOLDER DE ASSET REAL" en `52`).
[ ] El headline del hero pasó por las 4 U's de `52` (Útil/Urgente/Ultra-específico/Único), no solo
    por el límite de 8 palabras — y el ángulo coincide con el nivel de consciencia de Schwartz del
    tráfico que va a recibir.
[ ] El arco StoryBrand se cumple: el visitante es el héroe, la app es la guía, no al revés.
[ ] Si la app interna aún no existe, los visuales de cada sección siguen la jerarquía de mockups
    honestos (arriba) — nunca un screenshot inventado ni un ícono genérico haciendo de "producto real".
[ ] Message-match: el headline del hero ecoa la promesa exacta del anuncio/email que trae al visitante (congruencia con 34)
[ ] Un solo tipo de acción primaria
[ ] CTA en hero, mid-page y final
[ ] El CTA lleva al destino del MODELO elegido (02B/ESTADO.md): Modelo 1 -> checkout Hotmart · Modelo 2A -> onboarding/preview sin cuenta y luego paywall/login · Modelo 2B -> registro gratis solo si el progreso debe persistir antes del pago
[ ] Test final: ¿un desconocido entiende qué gana en 5 segundos, en mobile, con la página
    ya cargada?
```
