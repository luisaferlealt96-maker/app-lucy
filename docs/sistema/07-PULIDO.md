# FASE 6 — PULIDO Y OPTIMIZACIÓN

## Objetivo
Transformar una app que "funciona" en una que "se siente profesional". Esta fase es la diferencia entre una web app hecha con IA genérica y una que parece hecha por un equipo de producto.

---

## Capa 1: Micro-interacciones

Las micro-interacciones son lo que hace que una app se sienta "viva". No son decoración — son feedback que le dice al usuario que la app responde a sus acciones.

### Micro-interacciones Obligatorias

**Botones:**
```css
/* Hover — Cambio sutil de color o elevación */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Click — Feedback táctil */
.btn:active {
  transform: translateY(0px) scale(0.98);
}

/* Transición suave */
.btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Cards / Elementos de Lista:**
```css
/* Hover sutil en cards clickeables */
.card-interactive:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}
```

**Inputs:**
```css
/* Focus ring visible y suave */
input:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--primary);
  border-color: var(--primary);
}

/* Label que se reduce al hacer focus (float label pattern) — OPCIONAL */
```

**Aparición de Resultados:**
```css
/* Fade in + slide up para resultados generados */
@keyframes resultAppear {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.result-card {
  animation: resultAppear 0.4s ease-out;
}
```

**Modales:**
```css
/* Entrada suave */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Overlay fade */
@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Copiar al Portapapeles:**
```
Click "Copiar" → Ícono cambia a ✓ (check) + texto cambia a "¡Copiado!" → 
Vuelve al estado original después de 2 segundos
```

**Eliminar:**
```
Click "Eliminar" → Modal de confirmación → Confirmar → 
El elemento se desvanece (fade out + slide) → Toast "Eliminado" con opción "Deshacer"
```

### Micro-interacciones Opcionales (pero recomendadas)

- **Contador de caracteres** que cambia de color al acercarse al límite
- **Shake animation** en inputs con error de validación
- **Confetti o animación de celebración** al completar un hito
- **Smooth scroll** al navegar a secciones internas
- **Transición de página** al cambiar de pantalla (fade o slide)
- **Typing indicator** mientras la IA genera la respuesta
- **Progress bar** en procesos de múltiples pasos

---

## Capa 2: Copywriting Final

Revisar CADA texto de la app y asegurarse de que sea:

### Títulos de Pantalla
```
❌ "Dashboard"          → ✅ "Tu espacio de trabajo"
❌ "Historial"          → ✅ "Tus resultados"
❌ "Configuración"      → ✅ "Tu cuenta"
❌ "Nueva generación"   → ✅ "Crea algo nuevo"
```

### Botones y CTAs
```
❌ "Submit"             → ✅ "Generar mi propuesta"
❌ "Save"               → ✅ "Guardar"
❌ "Delete"             → ✅ "Eliminar"
❌ "Cancel"             → ✅ "Cancelar"
❌ "Sign up"            → ✅ "Crear mi cuenta gratis"
❌ "Upgrade"            → ✅ "Desbloquear Pro"
❌ "Learn more"         → ✅ "Ver qué incluye"
```

### Estados Vacíos
```
❌ "No hay datos"       
✅ "Aún no tienes resultados guardados. ¡Crea el primero!"

❌ "Lista vacía"        
✅ "Tu historial está vacío. Cada propuesta que generes aparecerá aquí."

❌ "No results found"   
✅ "No encontramos nada con esa búsqueda. Prueba con otras palabras."
```

### Mensajes de Error
```
❌ "Error 500"
✅ "Algo salió mal de nuestro lado. Intenta de nuevo en unos segundos."

❌ "Network error"
✅ "Parece que no hay conexión a internet. Verifica tu red e intenta de nuevo."

❌ "Invalid input"
✅ "El texto es muy largo. Intenta con algo más corto (máximo 500 caracteres)."

❌ "Rate limit exceeded"
✅ "Has hecho muchas solicitudes. Espera un momento e intenta de nuevo."
```

### Mensajes de Loading (para generación IA)
Rotar entre mensajes para que no se sienta repetitivo:
```javascript
const loadingMessages = [
  "Analizando tu solicitud...",
  "Generando tu resultado...",
  "Casi listo...",
  "Poniendo los toques finales..."
];
```

### Mensajes de Éxito
```
"¡Listo! Tu propuesta está lista."
"Guardado correctamente ✓"
"Copiado al portapapeles ✓"
"¡Bienvenido/a! Ya puedes empezar."
```

### Placeholder Text en Inputs
```
❌ "Escribe aquí"
✅ "Describe tu producto o servicio..." (contexto específico de la app)

❌ "Search"
✅ "Busca en tus resultados..."
```

---

## Capa 3: Diseño Visual Final

### Refinamiento de Color
- Verificar que el color primario se use solo en elementos que deben llamar la atención
- Los fondos de sección deben alternar sutilmente (ej: white → gray-50 → white)
- Los bordes deben ser sutiles (gray-200, no gray-400)
- Las sombras deben ser suaves (shadow-sm, no shadow-lg en todo)

### Refinamiento de Tipografía
- Verificar jerarquía: solo 1 título grande por pantalla
- Los subtítulos/descripciones en color más suave que el texto principal
- Interlineado cómodo en textos largos (leading-relaxed)
- Peso de fuente: bold solo para títulos, medium para botones, regular para body

### Refinamiento de Espaciado
- "Respira" — si algo se siente apretado, agregar más espacio
- Secciones separadas con mínimo 32px (gap-8)
- Contenido dentro de cards con padding generoso (p-6)
- En mobile, márgenes laterales mínimo de 16px

### Favicon e Identidad
```html
<!-- Generar un favicon simple. Opciones: -->
<!-- 1. SVG con las iniciales de la app -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='20' fill='%23[COLOR_PRIMARIO]'/>
    <text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' 
      fill='white' font-family='system-ui' font-size='50' font-weight='bold'>
      [INICIALES]
    </text>
  </svg>" />

<!-- 2. Emoji como favicon (rápido pero menos profesional) -->
<link rel="icon" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <text y='.9em' font-size='90'>🚀</text>
  </svg>" />
```

### Meta Tags y SEO Básico
```html
<title>[Nombre de la App] — [Beneficio en 5 palabras]</title>
<meta name="description" content="[Descripción de 150 caracteres max]" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="[Nombre de la App]" />
<meta property="og:description" content="[Descripción]" />
<meta property="og:image" content="[URL de imagen de preview]" />
```

### Página 404 (Obligatoria)
Toda app necesita una página 404 que no sea la pantalla blanca del servidor:
```
Contenido de la 404:
- Ilustración o ícono simpático (no un error técnico)
- "Esta página no existe" (no "Error 404 Not Found")
- "Parece que te perdiste. Vuelve al inicio →"
- Botón grande para ir a Home
- Opcionalmente: campo de búsqueda o links a secciones populares
```

La 404 debe mantener el header y la navegación de la app. NUNCA mostrar una página completamente diferente.

### Transiciones entre Páginas
No cambiar de pantalla con un corte brusco. Mínimo:
```css
/* Fade simple al cambiar de ruta */
.page-enter { opacity: 0; }
.page-enter-active { opacity: 1; transition: opacity 200ms ease-out; }
.page-exit { opacity: 1; }
.page-exit-active { opacity: 0; transition: opacity 150ms ease-out; } /* salidas TAMBIÉN ease-out (doctrina del 10/14) — nunca ease-in */
```

Si se usa un router con soporte para transiciones (Next.js App Router, React Router v7+), aprovecharlo. Si no, un fade CSS simple es suficiente.

### Emails Transaccionales (si hay auth)
Los emails que envía la app deben ser tan pulidos como la app:
```
Bienvenida: 
  Subject: "Bienvenido/a a [App] 🎉"
  Contenido: Nombre del usuario + qué puede hacer primero + link directo a la app

Resultado exportado:
  Subject: "Tu [resultado] está listo"
  Contenido: Preview del resultado + link para verlo en la app

Recuperar contraseña:
  Subject: "Restablece tu contraseña"
  Contenido: Link de reset (NO incluir la contraseña en el email) + expira en 1h
```

Para MVP: Usar los templates por defecto de Supabase Auth (ya están bien). Personalizar después.

---

## Capa 4: Performance Final

### Optimizaciones Obligatorias
- **Lazy loading** de componentes que no están en la vista inicial
- **Debounce** en inputs que disparan búsquedas o llamadas API
- **Memoización** de componentes pesados que no cambian frecuentemente
- **Compresión de imágenes** (WebP preferido, AVIF si hay soporte, <200KB)
- **Limitar re-renders** con React.memo, useMemo, useCallback donde tenga impacto real
- **font-display: swap** en todas las fuentes para no bloquear el render

### Reduce Motion — Obligatorio
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Esto NO es opcional. Usuarios con condiciones vestibulares pueden sufrir mareos con animaciones.

### Qué NO Optimizar en un MVP
- No implementar service workers para offline/PWA por moda (excepción justificada: el service worker mínimo para **web push opt-in** de re-enganche — ver `24-GAMIFICACION.md`)
- No implementar SSR/SSG a menos que sea parte del stack base
- No optimizar bundles a nivel granular
- No hacer code splitting extremo
- Estas optimizaciones son para después del product-market fit

---

## Capa 5: Legal y Compliance (Ver 09-SEGURIDAD.md para detalle)

Antes de lanzar, verificar que estas páginas existen y son accesibles:
- [ ] Política de Privacidad (link en footer y registro)
- [ ] Términos de Servicio (link en footer y registro)
- [ ] Aviso de cookies (si hay usuarios europeos)
- [ ] Checkbox de aceptación en formulario de registro
- [ ] Opción de eliminar cuenta en Configuración

---

## SEVERIDAD EN EL CHECKLIST (triar bajo presión, nunca sacrificar lo crítico)

Cuando el tiempo aprieta, el riesgo es gastar la última hora en microcopy mientras el flujo de pago sigue roto. Para evitarlo, **todo ítem de pulido lleva una etiqueta de prioridad** y se resuelve en ese orden. Nunca se sacrifica un CRÍTICO por pulir un MEDIO.

```
CRÍTICO  (bloquea el envío — se resuelve primero, sí o sí)
  - Accesibilidad (foco visible, lectores de pantalla, aria-live en contenido dinámico)
  - Contraste de texto suficiente (WCAG AA)
  - Targets táctiles ≥44px (que se pueda usar con el dedo)
  - Que el FLUJO DE PAGO funcione de punta a punta (si la app cobra, esto es lo primero)

ALTO  (se resuelve antes de "listo", salvo excepción justificada y avisada)
  - Performance (carga, Core Web Vitals, sin jank)
  - Seguridad (no exponer claves, validación, RLS)
  - Jerarquía visual (una acción primaria clara, el ojo sabe a dónde ir)

MEDIO  (pulido fino — solo después de cerrar CRÍTICO y ALTO)
  - Tipografía fina (kerning, viudas, escala)
  - Animación y micro-interacciones de detalle
  - Microcopy y afinado de tono
```

> Regla de triaje: si queda una hora, se gasta en CRÍTICO → ALTO. Un MEDIO sin resolver es un detalle; un CRÍTICO sin resolver es una app que no se puede vender.

---

## RÚBRICA DE CRÍTICA DE 5 EJES (complementa la rúbrica /40)

La rúbrica de Nielsen /40 mide usabilidad. Esta la complementa midiendo **craft y dirección** del entregable, sea una app, una landing o un deck. Es una herramienta de CRÍTICA cualitativa (genera el KEEP/FIX/QUICK-WINS de abajo); **el GATE numérico de pantallas de app es la RÚBRICA DE CRAFT VISUAL /20** (más abajo), que tiene anclas 0-4 y corte obligatorio. Puntuar **0-10 cada eje**, con PESOS según el medio:

```
EJE                       QUÉ MIDE
1. Coherencia filosófica   ¿el diseño tiene una idea rectora y todo la respeta?
2. Jerarquía               ¿el ojo sabe qué mirar primero, segundo, tercero?
3. Craft de ejecución      ¿el detalle fino está cuidado (espaciado, tipografía, estados)?
4. Funcionalidad           ¿hace lo que promete, sin fricción, en el flujo real?
5. Originalidad            ¿se siente propio o es una plantilla genérica más?

PESOS SEGÚN EL MEDIO (el mismo eje no pesa igual en todo):
  Deck / presentación  → pesa JERARQUÍA y coherencia filosófica
  Landing / página     → pesa FUNCIONALIDAD/conversión y jerarquía
  App / herramienta    → pesa FUNCIONALIDAD y craft de ejecución
  Pieza de marca/arte  → pesa ORIGINALIDAD y coherencia filosófica
```

### Formato de salida de la crítica

```
KEEP        → qué ya funciona y NO hay que tocar (anclarlo para no romperlo al iterar)
FIX         → qué corregir, etiquetado por severidad:
                ⚠️ crítico    (bloquea)
                ⚡ importante  (resolver antes de cerrar)
                💡 nice       (mejora si sobra tiempo)
QUICK-WINS  → cambios de bajo costo y alto impacto, listos para aplicar ya
```

> **Insight sobre variantes:** si generaste varias versiones, NO compiten por un único ganador. Cada una puede tener su caso de uso distinto — una más sobria para el cliente, otra más vistosa para redes. Antes de "elegir la mejor", preguntá para qué medio es cada una.

---

## RÚBRICA DE CRÍTICA PRE-ENVÍO (puntaje, no opinión)

"Se ve bien" no es un criterio. Antes de dar una pantalla protagonista por terminada, puntuarla contra las 10 heurísticas de Nielsen, **0-4 cada una** (0 = ausente, 4 = excelente). Total sobre 40:

```
 1. Visibilidad del estado del sistema (el usuario siempre sabe qué pasa)         [0-4]
 2. Lenguaje del usuario, no del sistema (mundo real, no jerga interna)           [0-4]
 3. Control y libertad (deshacer, cancelar, salir, volver)                        [0-4]
 4. Consistencia y estándares (mismos patrones en toda la app)                    [0-4]
 5. Prevención de errores (el mejor error es el que no ocurre)                     [0-4]
 6. Reconocer mejor que recordar (opciones visibles, no memoria)                  [0-4]
 7. Flexibilidad y eficiencia (atajos para expertos sin estorbar al novato)        [0-4]
 8. Estético y minimalista (cada elemento se gana su lugar — archivo 14)          [0-4]
 9. Errores claros y con solución (qué pasó + qué hacer — archivo 11)             [0-4]
10. Ayuda contextual cuando se necesita (tooltips, empty states que enseñan)       [0-4]
                                                                         TOTAL: __/40
```

```
BANDAS DE PUNTAJE:
  36-40 → pasa el corte de USABILIDAD (para "listo" falta el 2º corte: craft visual ≥16/20, ver abajo)
  28-35 → bueno, pulir los puntos de 2-3 antes de enviar
  20-27 → necesita trabajo; no enviar aún
  <20   → rehacer la pantalla
Realidad: un 4 es raro; la mayoría de UIs reales puntúan 20-32. Subir cada heurística baja
es trabajo concreto de pulido, no opinión.
```

### Anclas objetivas 0-4 (para que el puntaje sea repetible entre agentes)

El corte ≥36/40 es el gate visual central del SO (lo exige `32-DEL-MVP-AL-PRODUCTO.md` sobre el render a 375px). Sin anclas, dos agentes puntúan la misma pantalla distinto porque el filo se juega en "¿esto es 2 o 3?". Esta tabla fija qué significa cada puntaje de forma verificable. Puntuá sobre el render real a 375px, no sobre la intención:

```
ANCLA   SIGNIFICADO (vale para los 10 criterios)
  0   Ausente o roto. El criterio no se atendió, o lo que hay perjudica (ej: ilegible, foco invisible).
  1   Presente pero deficiente. Se intentó, falla en lo básico y se nota a simple vista.
  2   Aceptable con problemas notorios. Funciona, pero un usuario los percibe sin buscarlos.
  3   Bien, detalles menores. Solo un ojo entrenado detecta qué afinar. Apto para enviar.
  4   Ejemplar. Nivel del decil superior; nada que mejorar en este criterio.
```

Regla de oro del corte: si dudás entre dos anclas, **el problema visible baja el puntaje** (elegí el menor). El "2 vs 3" se decide así: ¿un usuario cualquiera lo nota sin buscarlo? → es 2. ¿Solo lo ve quien revisa con lupa? → es 3.

Qué mirar para puntuar cada criterio de forma objetiva (la pista verificable, no el gusto):

```
 1. Estado del sistema  → ¿toda acción >100ms tiene feedback inmediato (skeleton/spinner inline)?
                          ¿el usuario nunca se pregunta "se colgó"? (ver 15, escala de latencia)
 2. Lenguaje del usuario → ¿0 jerga técnica/inglés crudo en la UI? ¿títulos y CTAs en su mundo? (ver 07 copy)
 3. Control y libertad  → ¿toda acción destructiva tiene confirmación + undo? ¿hay volver/cancelar/cerrar visible?
 4. Consistencia        → ¿el mismo componente luce/actúa igual en todas las pantallas? ¿0 variantes accidentales?
 5. Prevención de error → ¿inputs validan antes de enviar? ¿estados deshabilitados claros? ¿se evita el error de raíz?
 6. Reconocer vs recordar→ ¿las opciones están visibles, sin pedir memorizar datos de otra pantalla?
 7. Flexibilidad         → ¿hay atajos para el experto (teclado, defaults) sin estorbar al novato?
 8. Estético/minimalista → ¿1 sola acción primaria por pantalla? ¿cada elemento se gana su lugar? (ver 14)
                          ¿jerarquía, espaciado, color, tipografía y movimiento respetan las leyes de 14?
 9. Errores con solución → ¿cada error dice qué pasó + qué hacer, sin código técnico? (ver 11)
10. Ayuda contextual    → ¿empty states que enseñan, tooltips donde se necesita, 0 pantalla muda?
```

Nota sobre los criterios visuales de craft (jerarquía, espaciado, color, tipografía, movimiento, estados,
profundidad/craft) que el SO también audita: caen dentro de las heurísticas 4, 8 y 9 de esta rúbrica; usá
las "Capas 1-3" de este archivo y `14-LEYES-DE-DISENO.md` como la lista verificable de qué mirar para subir
esos puntajes. Accesibilidad (incluido el contenido dinámico anunciado en aria-live, ver 15) entra en el
gate de calidad de `03-PRINCIPIOS-APP-EXITOSA.md` y es prerrequisito de un 3-4 en la heurística 8.

**Gate de carga cognitiva (si falla 1, es crítico — corregir antes de puntuar lo demás):**
```
[ ] Cada grupo/lista visible tiene ≤4-5 ítems antes de pedir scroll o agrupar
[ ] Cada decisión presenta ≤4 opciones (más = parálisis; archivo 15 "next best action")
[ ] UNA acción primaria por pantalla (archivo 14, mandamiento 1)
[ ] El usuario no tiene que recordar nada de una pantalla a la otra
[ ] Ninguna pantalla pide >5-7 campos sin dividir en pasos
[ ] El texto por bloque cabe en 3-4 líneas (archivo 14, límites de texto)
[ ] El "qué sigue" es obvio sin leer instrucciones
[ ] Cero elementos que parezcan interactivos y no hagan nada (CLAUDE.md, regla UX 11)
→ 4 o más fallas = sobrecarga crítica; simplificar antes de cualquier otra cosa.
```

---

## RÚBRICA DE CRAFT VISUAL /20 (separada de la /40 — mide lo que Nielsen deja pasar)

La rúbrica /40 es de **usabilidad** (Nielsen): una pantalla usable pero SOSA puede sacar 36/40 y seguir pareciendo template. Esta rúbrica mide el **craft visual** — lo que separa "correcta" de "diseñada". Se puntúa SIEMPRE junto a la /40, sobre el render real a 375px. Cinco ejes, **0-4 cada uno**, total sobre 20:

```
EJE 1 — JERARQUÍA (test de entrecerrar los ojos: ¿se lee 1→2→3→4?)
  0  Al entrecerrar, todo pesa igual: no hay un elemento dominante; el ojo no sabe dónde empezar.
  2  Hay un elemento dominante, pero el 2º y 3º nivel compiten entre sí (dos cosas del mismo
     tamaño/peso reclaman ser "lo segundo"), o hay >3 tamaños de texto en la pantalla.
  4  Al entrecerrar se leen 4 niveles nítidos en orden (héroe → título → cuerpo → label);
     máx 3 tamaños; el ojo recorre la pantalla en el orden que el diseño quiso.

EJE 2 — PROFUNDIDAD (¿fondo plano o 3 niveles?)
  0  Fondo de UN fill plano (#000, gris uniforme, beige plano); cards que solo se distinguen
     por un borde; cero sensación de capas.
  2  Hay algún intento (una sombra, un borde sutil) pero inconsistente: unas cards elevan y
     otras no, o el fondo es plano y solo las cards tienen tratamiento.
  4  3 niveles consistentes en TODA la pantalla: base con profundidad (mesh/gradiente sutil o
     tinte), superficies elevadas (sombra suave + luz en dark / sombra multicapa en claro),
     áreas hundidas (inputs). Se percibe qué flota y qué recede sin leer nada.

EJE 3 — IDENTIDAD OWNABLE (¿intercambiable con otra app?)
  0  Brand kit intercambiable: si le cambias el logo por el de otra app del SO o de cualquier
     demo de IA, nadie lo nota. Dark + 1 acento + fuente de moda sin tratamiento.
  2  Hay decisiones (acento con intención, tipografía con carácter) pero NINGÚN dispositivo
     ownable: sin textura, ilustración, foto, 2ª nota de color ni tratamiento propio de la
     display. Correcta pero anónima.
  4  ≥1 dispositivo ownable visible en la pantalla (textura/grano, ilustración de la serie,
     tratamiento de foto, detalle firma) + el kit pasa el test del 16: NO podría intercambiarse
     con otra app sin que se note.

EJE 4 — MOVIMIENTO (¿las 7 baseline vivas?)
  0  Pantalla estática: aparece de golpe, números plantados, taps sin feedback.
  2  Algunas baseline presentes (3-4 de 7): hay stagger o feedback de tap, pero faltan piezas
     obvias (números héroe sin conteo, modales que aparecen en seco, tabs con corte).
  4  Las 7 baseline del 22 verificadas UNA POR UNA en esta pantalla (las que apliquen) +
     prefers-reduced-motion respetado + el carácter del motion es consistente (una sola firma).

EJE 5 — ENCAJE ÓPTICO (¿números centrados, radius consistente, alineaciones?)
  0  Desencajes visibles a simple vista: número descentrado en su anillo, chips estirados con
     hueco muerto, radios distintos entre cards, contenido que flota asimétrico.
  2  El grueso encaja pero hay 1-2 detalles que un usuario nota sin buscarlos (un ícono
     descentrado en su botón circular, un padding asimétrico, una fila desalineada).
  4  Pasa la sección 8 del 43 completa: números compuestos en una composición decidida y
     centrados a OJO, radius idéntico en toda la pantalla, chips que abrazan su contenido,
     padding simétrico, alineaciones a la retícula. Solo una lupa encontraría algo.
                                                                        TOTAL: __/20
```

```
REGLA DE GATE (doble corte, ambos obligatorios):
  PANTALLA LISTA = ≥36/40 en usabilidad Y ≥16/20 en craft visual.
  - 38/40 + 12/20 = usable pero sosa → NO está lista (subir craft: ejes en 0-2).
  - 30/40 + 18/20 = linda pero frustrante → NO está lista (subir usabilidad).
  Puntúa el REVISOR INDEPENDIENTE: un subagente con contexto LIMPIO (doctrina del 12 —
  quien construyó la pantalla está contaminado por la intención; el revisor solo ve el
  screenshot a 375px + estas dos rúbricas, sin acceso al razonamiento del constructor).
  El puntaje intermedio (1 y 3) se usa cuando la pantalla queda entre dos anclas; ante la
  duda, el problema visible baja el puntaje (misma regla de oro de la /40).
```

### Anclas para los ítems subjetivos del checklist de cierre (criterios observables, no gusto)

**"CTA héroe VIVO"** deja de ser opinión — el CTA cumple los 4 o no está vivo:

```
[ ] Contraste ≥3:1 del CTA con su fondo inmediato (medido, no estimado)
[ ] Estado hover/tap DEFINIDO e implementado (whileTap scale 0.97 o :active propio — se ve responder)
[ ] NUNCA disabled por defecto: habilitado hasta que arranca el request; valida al click con hint
    (regla de forms del 43 — nada de pill muerto al 50% de opacidad esperando el form perfecto)
[ ] Área táctil ≥48px de alto y ancho completo o centrado en la zona cómoda del pulgar (43, thumb zone)
```

**"¿Es genuinamente bueno / se ve premium?"** se responde con 3 checks observables, no con adjetivos:

```
[ ] Test del logo: tapando el logo, ¿la pantalla se distingue de un template y de las otras apps del SO?
[ ] Test del reflejo: ¿al menos UNA decisión visual de esta pantalla NO la tomarías en otro proyecto
    del mismo tipo? (16, test de genericidad — si todo es reusable, es default disfrazado)
[ ] Craft visual ≥16/20 en la rúbrica de arriba, puntuado por el revisor independiente
```

---

## Checklist Final de Pulido

```
MICRO-INTERACCIONES
[ ] Todos los botones tienen hover y active states
[ ] Los inputs tienen focus states claros
[ ] Los resultados aparecen con animación
[ ] Los modales tienen animación de entrada/salida
[ ] Copiar muestra confirmación visual
[ ] Eliminar tiene confirmación + undo

COPYWRITING
[ ] Todos los textos están en el idioma del usuario final
[ ] Los botones usan verbos de acción específicos
[ ] Los estados vacíos son útiles y tienen CTA
[ ] Los errores son claros y ofrecen solución
[ ] Los loadings son conversacionales
[ ] No hay textos placeholder tipo "Lorem ipsum" ni "TODO"

DISEÑO
[ ] Paleta de colores aplicada consistentemente
[ ] Tipografía con jerarquía clara
[ ] Espaciado generoso y consistente
[ ] Favicon implementado
[ ] Meta tags de SEO configurados

PERFORMANCE
[ ] La app carga en <3 segundos
[ ] No hay errores en consola
[ ] No hay requests innecesarios
[ ] Los loadings se muestran inmediatamente tras cada acción
```

### GATE DE MICRO-CRAFT (recorrer antes de dar la fase por cerrada)

Antes de declarar el pulido terminado, **recorrer el doc `43-MICRO-CRAFT-Y-EJECUCION.md`** y verificar el detalle fino que se escapa a las rúbricas: tipografía fina (viudas, escala, kerning), overflow y `min-w-0` (textos largos que no rompan el layout), forms (estados, validación, autofill), touch (targets ≥44px), y dark mode robusto (no solo invertir colores).

```
[ ] Recorrido el doc 43-MICRO-CRAFT-Y-EJECUCION.md sobre la pantalla terminada
[ ] Render mirado CON DATOS REALES (nombres largos, listas vacías, números grandes),
    NUNCA con lorem ipsum ni datos de juguete — el lorem oculta los bugs de layout
[ ] Aplicado el principio "quita un accesorio antes de terminar": sacar el elemento
    decorativo que menos aporta. Casi siempre el diseño mejora al restar.
```

### Criterios de Salida de Fase 6
- [ ] Cada pantalla protagonista pasa el GATE DOBLE: ≥36/40 usabilidad Y ≥16/20 craft visual,
      puntuadas por el revisor independiente (subagente con contexto limpio, doctrina del 12)
- [ ] La app se siente profesional y pulida
- [ ] Todos los textos son finales (no hay placeholders)
- [ ] Las micro-interacciones están implementadas
- [ ] La performance es aceptable
- [ ] Gate de micro-craft recorrido (doc 43) con datos reales
- [ ] El usuario aprobó el look & feel final

→ **Siguiente: Cargar `08-DEPLOY.md`**
