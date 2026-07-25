---
description: Crea o eleva la página de ventas de alta conversión (estructura del 19 + message-match), con plan previo y tu OK
---
PÁGINA DE VENTAS PREMIUM — landing de alta conversión (no una landing básica)

Regla canónica actualizada: aplica primero `docs/sistema/PROMPT-LANDING.txt`, especialmente las
preguntas simples sobre audiencia, promesa, CTA, precio, garantía y testimonios reales.

Crea (o eleva) la página de ventas de esta app para que CONVIERTA. Primero dame la estructura
propuesta y el ángulo de copy, ESPERA MI OK, y luego constrúyela completa (código real, no mockup).

━━━ CONTEXTO (promesa, nicho, pricing, ángulo si lo tengo) ━━━
$ARGUMENTS

Si el contexto de arriba viene vacío o incompleto, dedúcelo de ESTADO.md (promesa central, ICP,
pricing, dirección de arte) y del código; pregúntame solo lo que falte antes de proponer.

LEE PRIMERO: docs/sistema/19-PAGINA-DE-VENTAS.md (estructura validada ≥11 secciones + copy de
respuesta directa), docs/sistema/52-COPY-VISUALES-CONVERSION.md (argumento de venta, visual que vende,
marca y CTA), 16-DIRECCION-DE-ARTE.md + 29-REFERENCIA-VISUAL.md (misma identidad visual que la
app, no genérica), 22-LIBRERIAS-Y-CRAFT.md (animaciones de entrada premium),
02B-ONBOARDING-MONETIZACION.md (la promesa y el pricing) y 20-ASSETS-VISUALES.md (hero, OG, visuales).

CONSTRUYE con la estructura del archivo 19 y las reglas del 52: hero con promesa clara + CTA, el problema/dolor real,
la solución (cómo funciona en 3 pasos), beneficios (no features), prueba social, demo/visual del
producto, pricing con ancla (anual como $/mes), FAQ que derriba objeciones, garantía, y CTA final.
Copy en el idioma del usuario, específico y sin relleno.

ANTES DE PROPONER EL DISEÑO, escribe el argumento de conversión:
dolor específico → mecanismo → resultado → prueba/demo → oferta → reversibilidad → acción.
El hero debe tener headline <=10 palabras, subtítulo <=2 líneas mobile, palabras clave resaltadas
y visual real que muestre antes→después, desbloqueo, progreso o prueba. Si no hay garantía real,
no escribas "garantía visible"; déjalo como pendiente interno.

CTA SEGÚN EL MODELO (archivo 19 → "ADAPTACIÓN AL FLUJO HOTMART"): antes de escribir un solo CTA,
lee en ESTADO.md qué modelo de monetización se definió (02B) y, si no está claro, PREGÚNTAME.
Si Modelo 1 (hard paywall): el CTA lleva al checkout de Hotmart. Si Modelo 2 (onboarding-first,
el default B2C): el CTA lleva al REGISTRO GRATIS de la app ("Crear mi plan gratis") — el checkout
aparece tras el onboarding; la landing vende el REGISTRO, el onboarding vende el PAGO.

PRUEBA SOCIAL: si aún no hay 3 testimonios REALES, usa la jerarquía día-1 del 19 (demo/GIF del
producto real + garantía Hotmart + resultado del fundador con fecha) y OMITE la sección de
testimonios — nunca placeholders ni inventados. Sin claims de ingresos/salud (políticas de ads, 47).

MESSAGE-MATCH (archivo 19): el headline del hero debe ECOAR la promesa exacta del anuncio/email que
trae al visitante (los creativos del archivo 34). Si corres varios ángulos, idealmente cada uno
aterriza en un hero que recoge SU promesa — no un hero genérico para todos. Es la fuga de conversión
más barata de tapar.

REGLAS: una sola promesa central (la de ESTADO.md); CTAs consistentes que llevan al mismo lugar;
performance (Core Web Vitals — ver 28 si es Next.js); responsive mobile-first; CERO patrones engañosos
(urgencia falsa, costos ocultos, confirmshaming). Mismo nivel anti-slop que la app: pásala por la
rúbrica /40 del archivo 07. Verifica tsc + build + dev al cerrar cada capa; mejora lo que exista (no
reescribas sin avisar); causa raíz, no parches; no la declares "lista" sin levantarla y mirarla
renderizada; actualiza ESTADO.md.
