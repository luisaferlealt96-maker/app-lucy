# LANZAMIENTO Y RETENCIÓN — Vender en Picos y Mantener el Dinero que ya Entró

> **Cuándo cargar este archivo:**
> - Cuando la app está lista para su PRIMER lanzamiento (o un relanzamiento), después de `34-ADQUISICION-Y-TRAFICO.md`
> - Cuando ya hay clientes y el dueño quiere SUBIR el AOV/LTV (order bumps, upsells) o BAJAR el churn (retención, dunning)
> - Junto con `18-VENTA-HOTMART.md` (el estado `past_due` del webhook conecta con el dunning de aquí) y `02-VALIDACION.md` (estrategia de retención y win-back)
>
> **Por qué existe:** Adquirir clientes (archivo 34) es solo la mitad. La otra mitad es **vender en PICOS** (un lanzamiento concentra ventas que goteando tardarían meses) y **no perder el dinero que ya entró** (cada cliente retenido vale más que uno nuevo, y recuperar un pago fallido es la conversión más barata que existe). Este archivo cubre el playbook de lanzamiento, cómo subir el ticket promedio con bumps/upsells, cómo frenar el churn voluntario e involuntario (dunning), y cómo conseguir prueba social cuando todavía no tienes ni un cliente.

---

## PLAYBOOK DE LANZAMIENTO (vender en picos, no a goteo)

Un lanzamiento concentra en una ventana corta (5-7 días) las ventas que el goteo tardaría meses en producir. Funciona por **urgencia y escasez REALES** (oferta de fundadores que expira, cupos, bono que se va) + **prueba social acumulada** (todos comprando a la vez). No es para siempre: es un evento.

### Las 5 fases del lanzamiento
```
FASE 1 — PRE-LANZAMIENTO (1-2 semanas antes): construir DESEO antes de abrir la venta.
  - Sembrar contenido sobre el problema (los ángulos del archivo 34) sin vender aún.
  - Anunciar que "algo viene" + abrir la LISTA DE ESPERA (captura de emails, ver abajo).
  - Reclutar afiliados (archivo 34) y darles fecha + kit para que disparen el mismo día.

FASE 2 — LISTA DE ESPERA: capturar a los interesados ANTES de abrir.
  - Landing simple "Entra a la lista y sé el primero (+ bono/precio de fundador)".
  - Email warming: 3-4 emails que educan sobre el problema y suben la expectativa.
  - Beneficio real por estar en la lista: precio/cupo/bono exclusivo → razón para inscribirse.

FASE 3 — OFERTA DE FUNDADORES (apertura del carrito): la mejor oferta que existirá.
  - Precio de fundador (más bajo que el normal) y/o bono exclusivo (plantilla, mes extra,
    onboarding 1:1) SOLO durante la ventana. Marco: "esto no se repite".
  - Para suscripción: "precio bloqueado de por vida" para fundadores = imán potente + baja churn
    (no querrán perder el precio viejo).
  - Cupos limitados REALES si el soporte/infra lo justifica (nada de falsa escasez — archivo 19).

FASE 4 — VENTANA DE CARRITO (5-7 días, cierre con fecha): la urgencia hace el trabajo.
  - Secuencia de emails de venta (abajo) + recordatorios de afiliados + ads retargeting.
  - Subir la intensidad hacia el final: día de cierre = 2-3 emails ("últimas horas").
  - Mostrar prueba social en vivo ("X personas ya entraron hoy").

FASE 5 — POST-LANZAMIENTO: cerrar, entregar y preparar el siguiente.
  - Cerrar la oferta de verdad (si dijiste que cerraba, cierra — o matas tu credibilidad).
  - Onboarding impecable de los que entraron (la 1ª victoria <60s del archivo 02).
  - Pedir testimonios a los primeros resultados (alimenta la prueba social del próximo lanzamiento).
  - Pasar a "evergreen": la venta diaria por los canales del archivo 34 + relanzamientos periódicos.
```

### Secuencia de emails de la ventana de carrito (con Resend del archivo 18)

> **⚠️ PRERREQUISITO antes del PRIMER envío masivo** (warming de lista de espera, ventana de carrito): pasar por `46-EMAIL-DELIVERABILITY.md` — SPF/DKIM/DMARC en el dominio de envío + warmup si el dominio es nuevo (un dominio frío mandando 500 emails el día de apertura = spam garantizado justo cuando más duele) — y **consentimiento/opt-in real** de cada dirección (`47-LEGAL-FISCAL-Y-SOPORTE.md`). La lista de espera YA es opt-in si se capturó bien; una lista comprada o "prestada" jamás se usa.

```
APERTURA (día 1):    "Ya está abierto" — la oferta + el bono + la fecha de cierre exacta.
VALOR (día 2-3):     mecanismo + prueba social (caso/testimonio) + recordar el cierre.
OBJECIONES (día 4):  derribar las 3 dudas top + garantía. "¿Es para mí?".
URGENCIA (día 5-6):  "cierra en 48h / 24h" — el bono o el precio de fundador se va.
ÚLTIMO AVISO (cierre): 2-3 emails el último día ("últimas horas", "se cierra esta noche").
```

#### PROMPT para el plan + emails de lanzamiento
```
Eres estratega de lanzamientos de infoproducto/SaaS en Hotmart (LATAM). Diseña el lanzamiento de
[NOMBRE APP] ([qué hace] para [avatar]). Oferta de fundadores: [precio/bono]. Promesa: [ESTADO.md].
Entrega:
1. CALENDARIO de las 5 fases (pre-lanzamiento, lista de espera, oferta, ventana 5-7 días, post).
2. La OFERTA de fundadores recomendada (precio + bono + por qué urge), sin falsa escasez.
3. La secuencia de emails de WARMING (lista de espera, 3-4 emails) lista para Resend (archivo 18).
4. La secuencia de emails de la VENTANA de carrito (apertura → último aviso) lista para Resend:
   asunto + preview + cuerpo HTML simple, 1 CTA al checkout Hotmart, reglas de copy del archivo 19.
5. El brief para los AFILIADOS (qué publicar cada día de la ventana — encadena con el kit del 34).
Idioma del avatar. PROHIBIDO falsa escasez/urgencia: la fecha de cierre y los cupos deben ser reales.
```

### CHECKLIST DE LANZAMIENTO DÍA-A-DÍA (D-14 → D+7)

La versión operativa de las 5 fases: qué se hace cada día, quién lo hace y cómo se sabe que quedó hecho. "App" = lo ejecuta la IA/el sistema; "Dueño" = solo el dueño puede (paneles, publicar en sus redes); "Afiliados" = lo disparan ellos con el kit.

| Fecha | Acción | Responsable | Criterio de "hecho" |
|---|---|---|---|
| D-14 | Definir oferta de fundadores (precio + bono + fecha de cierre REAL) y anotarla en ESTADO.md | Dueño + app | Oferta escrita con fecha exacta en ESTADO.md |
| D-14 | Verificar prerrequisitos: deliverability (46) + opt-in (47) + landing pasó checklist (19) + webhook probado (18) | App | Los 4 checks en verde, anotados |
| D-13 | Abrir lista de espera (landing simple + captura) + grupo/difusión de WhatsApp opcional (34) | App + dueño | Página publicada, primer registro de prueba entra |
| D-12 | Sembrar contenido del problema (sin vender): 3-5 piezas programadas para las 2 semanas | App genera, dueño publica | Calendario con las piezas listas |
| D-10 | Reclutar/avisar afiliados: fecha de apertura + kit + brief de la ventana | Dueño (outreach) + app (kit) | ≥3-10 afiliados confirmados con kit en mano |
| D-7 | Email/WhatsApp de warming #1 a la lista ("falta 1 semana" + valor) | App | Enviado; open rate visto en el panel |
| D-5 | Warming #2 (educar sobre el mecanismo + anticipar el bono) | App | Enviado |
| D-3 | Warming #3 ("en 3 días abre; esto incluirá la oferta de fundadores") | App | Enviado; afiliados reconfirmados para D-0 |
| D-1 | Ensayo general: compra de prueba end-to-end (checkout → webhook → acceso → email) | App + dueño | Compra de prueba entra SIN tocar nada a mano |
| D-0 | APERTURA: email "ya está abierto" + publicación propia + afiliados disparan + ads retargeting si hay píxel verificado (34) | Todos | Checkout activo, primeras ventas visibles en Hotmart |
| D+1 | Prueba social en vivo ("X personas ya entraron") + responder TODAS las dudas de preventa (WhatsApp/email) | Dueño + app | Cero dudas sin responder >12h |
| D+2 | Email de valor (mecanismo + caso/testimonio) + recordatorio de cierre | App | Enviado |
| D+3 | Email de objeciones ("¿es para mí?" + garantía) + pieza orgánica de demo | App | Enviado + publicado |
| D+4 | Aviso "quedan 48h" (email + stories + afiliados empujan) | Todos | Enviado; afiliados publicaron |
| D+5 | "Últimas 24h" + 2-3 emails el día de cierre ("últimas horas" / "cierra esta noche") | App | Secuencia de cierre completa enviada |
| D+5/6 | CERRAR de verdad (quitar oferta/subir precio a la fecha dicha) | Dueño (panel Hotmart) + app (landing) | La oferta YA no se puede comprar; landing actualizada |
| D+6 | Onboarding impecable de la cohorte: monitorear primera victoria <60s, resolver accesos caídos (punto crítico #1) | App | 0 tickets de acceso sin resolver; activación medida (36) |
| D+7 | Retro del lanzamiento: ventas por canal (src), conversión de lista, feedback; pedir testimonios a los primeros con resultado; agradecer y liquidar bonus a afiliados top | App + dueño | Números en ESTADO.md + ≥3 testimonios pedidos |

---

## ORDER BUMP / UPSELL / DOWNSELL EN HOTMART (subir el AOV y el LTV)

El cliente más barato de convencer es el que YA está comprando. Subir el ticket promedio (AOV) en el momento de la compra es ingreso casi gratis. Hotmart soporta estos tres mecanismos nativamente.

```
ORDER BUMP (en el checkout, antes de pagar): un extra de bajo precio con un clic.
  - Qué ofrecer: un complemento de alto valor percibido y bajo costo de entrega
    (pack de plantillas, mes extra, mini-curso de uso, acceso a comunidad).
  - Regla: precio del bump = 20-40% del producto principal; "sí o no" de 1 clic, sin fricción.
  - Configuración: en Hotmart, "Order bump" asociado al producto principal en el checkout.

UPSELL (1-click, JUSTO después de comprar): una oferta mayor sin volver a meter la tarjeta.
  - Qué ofrecer: el plan anual (si compró mensual), un tier superior, un add-on premium,
    o un servicio 1:1. La "Página de gracias con oferta" / upsell 1-click de Hotmart.
  - El momento de máxima disposición a comprar es justo después de decir "sí".

DOWNSELL (si rechaza el upsell): una versión más barata de la oferta.
  - Qué ofrecer: el mismo beneficio en versión reducida, o un plan de pago en cuotas, o el
    plan mensual si rechazó el anual. "Si no es el momento del completo, lleva esto".

PARA SUSCRIPCIÓN (caso por defecto del SO), el mayor LTV viene de:
  - Upsell del MENSUAL → ANUAL en la página de gracias (cash upfront + menor churn, ver 02/19).
  - Order bump de un add-on de una sola vez (plantillas/onboarding) que sube el AOV del día 1.
```

> **Conexión con el webhook:** un order bump o upsell genera transacciones/eventos adicionales en Hotmart. El webhook del `18-VENTA-HOTMART.md` debe tratarlos por su `transaction`/`event_id` (idempotencia ya cubierta) y, si el upsell es el plan anual, actualizar el plan del perfil. Verificar que el `apply_hotmart_event` no confunda dos compras del mismo cliente (dedupe por transacción, no por email).

---

## RETENCIÓN Y CHURN VOLUNTARIO (que no se vayan por decisión propia)

Churn voluntario = el usuario decide cancelar. Bajarlo unos puntos compone enormemente el LTV. La estrategia de retención del producto (mecánicas, gamificación) vive en `02-VALIDACION.md` y `24-GAMIFICACION.md`; aquí va lo específico del **momento de cancelar**.

```
ENCUESTA DE CANCELACIÓN (al pulsar "cancelar", antes de confirmar):
  - 1 pregunta con opciones: muy caro / no lo uso / le falta X / encontré algo mejor / otro.
  - Sirve para 2 cosas: datos del backoffice (¿por qué se van?) Y ramificar la oferta de rescate.

ALTERNATIVAS A LA BAJA (⚠️ realidad Hotmart primero — leer antes de implementar nada):
  LA FACTURACIÓN LA CONTROLA HOTMART, NO TU APP. Un flag "paused" en Supabase NO detiene el
  cobro recurrente: el cliente seguiría pagando mientras cree que está "pausado" → reembolsos,
  reclamos y reseñas negativas en Hotmart. PROHIBIDO ofrecer una "pausa que no factura" que tu
  sistema no puede cumplir. Las jugadas REALES, en orden de preferencia:

  A) DESCUENTO PARA QUEDARSE (cupón de oferta): en vez de cancelar, ofrecer X% de descuento por
     1-3 meses vía cupón/oferta de Hotmart sobre la suscripción (verificar en el panel cómo
     aplicarlo a una suscripción activa; si el panel no lo permite, la variante es cancelar +
     recomprar con cupón, ver B). Es la respuesta natural al "muy caro".
  B) CANCELAR + CUPÓN DE REGRESO CON FECHA: se cancela de verdad (Hotmart deja de cobrar, cero
     sorpresas) y el cliente se lleva un cupón de recompra con fecha límite ("vuelve antes del
     [fecha] con 40% off y tu cuenta tal como la dejaste"). Sus datos se conservan (periodo de
     gracia, abajo) → la "pausa" honesta del modelo Hotmart: sin cobro Y con puente de regreso.
  C) PAUSA SOLO-DE-ACCESO con aviso honesto (solo si hay una razón real, ej. quiere conservar
     una racha/cupo): congelar el USO en la app, PERO diciendo explícitamente qué pasa con el
     cobro: "Hotmart seguirá cobrando tu suscripción con normalidad; lo que pausamos es tu
     [racha/contenido/cupo]". Si no puedes explicarla sin que suene a trampa, no la ofrezcas.
  → En los 3 casos: registrar la elección en el event_log (21/36) para medir qué rescata churn.

OFERTA DE RESCATE SEGÚN LA RAZÓN (ramificar con la respuesta de la encuesta):
  - "Muy caro"        → descuento 30-50% por 1-2 meses, o downgrade a un plan más barato.
  - "No lo uso"       → re-onboarding ("aquí está el valor que te perdiste") + tip de uso.
  - "Le falta X"      → si está en el roadmap, decirlo + acceso anticipado; si no, escuchar.
  - "Encontré algo mejor" → diferenciador + oferta; difícil, pero los datos valen oro.

PERIODO DE GRACIA (no borrar datos al cancelar):
  - Conservar datos 30-90 días. Email a los 7 días ("tus [47 resultados] te esperan").
  - El webhook ya marca cancelación al fin de ciclo sin borrar (archivo 18) — respetarlo.

WIN-BACK (recuperar al que ya se fue) — consolida la estrategia del archivo 02:
  - Emails a los 30 / 60 / 90 días: novedades + oferta de regreso (precio especial de vuelta).
  - El que ya usó el producto y se fue convierte mucho mejor que un lead frío.

RENOVACIÓN ANUAL — el "acantilado" del mes 12 (el churn que casi nadie atiende):
  - Una suscripción ANUAL no churnea poco a poco: llega íntegra al mes 12 y ahí decide de golpe.
    Si el cobro recurrente anual sorprende al cliente, cancela o pide reembolso (y un reembolso
    anual duele 12× más que uno mensual).
  - Cadencia PRE-renovación (suave, no agresiva): email a los ~30 días y ~7 días antes del cobro
    recordando el VALOR recibido en el año ("esto lograste / creaste / ahorraste con la app") +
    la fecha exacta de renovación. Convertir el cobro en algo esperado, no en una emboscada.
  - Es transparencia que retiene: el cliente que ve su año resumido renueva con gusto; el que se
    siente cobrado "a escondidas" cancela y deja reseña negativa en Hotmart.
```

#### PROMPT para el flujo de retención de cancelación
```
Diseña el FLUJO de cancelación retentivo de [NOMBRE APP] (suscripción Hotmart). Entrega:
1. La encuesta de cancelación (pregunta + opciones) y cómo ramifica la oferta de rescate.
2. La alternativa a la baja que aplique (descuento vía cupón / cancelar + cupón de regreso con
   fecha / pausa solo-de-acceso con aviso honesto del cobro — NUNCA prometer "pausa que no
   factura": la facturación la controla Hotmart, ver archivo 35) con su copy exacto.
3. La oferta de rescate por cada razón (copy de cada una, sin confirmshaming ni manipulación).
4. La secuencia win-back de 3 emails (días 30/60/90) lista para Resend (archivo 18).
Tono empático (nunca culpar al usuario), idioma del avatar. PROHIBIDO dark patterns: cancelar
debe ser fácil; la retención se gana con valor y oferta honesta, no escondiendo el botón.
```

---

## DUNNING — recuperar pagos fallidos (la conversión más barata que existe)

Churn INVOLUNTARIO = el cliente NO quería irse, pero su pago falló (tarjeta vencida, sin fondos, límite). **Quería seguir pagando.** Recuperarlo no requiere convencer a nadie — solo arreglar el método de pago. Es la conversión de menor costo y mayor ROI del negocio, y la más ignorada.

```
EN HOTMART: los reintentos de cobro recurrente los gestiona Hotmart automáticamente, y dispara
los eventos PURCHASE_DELAYED / PURCHASE_OVERDUE → tu webhook marca el perfil como `past_due`
(ya implementado en 18-VENTA-HOTMART.md). El estado `past_due` mantiene el ACCESO durante la
gracia (NO cortar de golpe — el cliente quiere pagar).

NUESTRA CADENCIA DE RECUPERACIÓN (sobre el estado past_due, con Resend del archivo 18):
  DÍA 1:  email suave — "no pudimos procesar tu pago, suele ser la tarjeta. Actualízala aquí →"
          + banner NO bloqueante en la app (link para actualizar el método en Hotmart).
  DÍA 3:  recordatorio — reforzar QUÉ pierde si no resuelve (framing de pérdida) + link directo.
  DÍA 5:  urgencia — "tu acceso se suspende en X días. Un clic para mantenerlo." + link.
  DÍA 7:  último aviso — "hoy es el último día antes de suspender." Tras esto, Hotmart agota
          reintentos → evento de cancelación → degradar a free (NO borrar datos: win-back).

ACTUALIZAR TARJETA / RECUPERACIÓN VÍA HOTMART:
  - El cliente actualiza el método en SU panel de comprador de Hotmart (el link va en los emails).
  - Hotmart reintenta el cobro; si entra → evento PURCHASE_APPROVED → el webhook lo reactiva a
    `active` (la máquina de estados del 18 ya permite past_due → active).
  - El banner en la app desaparece al volver a `active`.
```

> **Por qué importa tanto:** una parte grande del churn de suscripción es involuntario (tarjetas que vencen). Cada cliente que el dunning recupera es LTV que ya tenías y casi pierdes — sin costo de adquisición. Conecta directo con el estado `past_due` del webhook del archivo 18: la cadencia de aquí es lo que CONVIERTE ese estado en una recuperación, en vez de dejar la suscripción en limbo hasta que muere.

#### PROMPT para la cadencia de dunning (emails)
```
Escribe la cadencia de DUNNING de [NOMBRE APP] (suscripción Hotmart, estado past_due del webhook
del archivo 18): 4 emails (días 1/3/5/7) listos para Resend, cada uno con asunto + preview +
cuerpo HTML simple y 1 CTA "Actualizar mi método de pago" (link al panel de comprador de Hotmart).
Tono: servicial, NO acusatorio (el cliente no falló a propósito — fue la tarjeta). Escalar la
urgencia día a día con framing de pérdida honesto. Incluye también el copy del BANNER no bloqueante
in-app para el estado past_due. Idioma del avatar.
```

---

## REFERIDOS / MEMBER-GET-MEMBER (el cliente feliz como canal más barato)

El usuario que ya vive la transformación es tu mejor vendedor: su recomendación llega con confianza que ningún ad compra. Un programa de referidos baja el CAC (`40`) y, de paso, RETIENE — el que refiere se compromete más con el producto. Es a la vez retención y adquisición orgánica, por eso vive entre `34` y este archivo.

```
DOS FORMAS DE HACERLO EN EL MODELO HOTMART (elegir según control de facturación):

A) CONVERTIR CLIENTES EN AFILIADOS (lo más simple — usa la infra que YA existe en 34):
   - Hotmart tiene programa de afiliados nativo. Invita a tus clientes felices a afiliarse:
     ganan comisión por cada persona que traen. Cero desarrollo: es la afiliación del archivo 34
     aplicada a tu base de usuarios.
   - Ideal para nichos donde el cliente tiene audiencia (creadores, coaches, profesionales).
   - El costo (comisión) ya está modelado en la economía unitaria de 40 — respeta ese margen.

B) RECOMPENSA IN-APP "DA Y RECIBE" (más fricción, más viral, requiere reconciliación):
   - Cada usuario tiene un código/enlace. El referido compra por Hotmart con ese código (UTM/SRC
     o cupón dedicado); el webhook de 18 atribuye la venta y, al confirmarse (PURCHASE_APPROVED),
     tu servidor premia a AMBOS: al referido (ej. descuento de bienvenida) y al que refirió
     (ej. 1 mes gratis, créditos extra, o un add-on premium).
   - La recompensa al que refiere se otorga SOLO cuando el referido PAGA y pasa la garantía
     (evita fraude y reembolsos que dejan la recompensa regalada). Tope de referidos premiables
     por mes para proteger el margen (40).
```

```
REGLAS DE UN PROGRAMA QUE FUNCIONA (no "comparte por compartir"):
- Pedir el referido en el momento de MÁXIMA felicidad: justo tras una victoria real (un hito de
  racha, un resultado exportado, un logro) — NUNCA al instalar ni en frío. Engancha con 24.
- La recompensa de doble lado (referidor Y referido ganan) convierte mucho más que la de un lado.
- Recompensa atada al VALOR de la app (más uso/créditos/tiempo), no efectivo: refuerza el hábito
  en vez de atraer cazadores de dinero.
- Hacer el acto de referir de 1 toque (link/código copiable + share nativo, ver 03).
- Medirlo: eventos de referido en el event_log (21/36) — cuántos invitan, cuántos convierten (factor K).
```

> **Cuándo NO montarlo:** antes de tener la curva de retención aplanada (`24`). Un programa de referidos sobre un producto que no retiene solo acelera la llegada de gente que también se irá — y te cuesta recompensas. Primero el producto retiene; después se amplifica con referidos.

---

## PRUEBA SOCIAL DESDE CERO (testimonios cuando aún no tienes clientes)

La landing del archivo 19 y los creativos del archivo 34 PIDEN prueba social — pero al arrancar no tienes ni un cliente. El problema del huevo y la gallina. Cómo romperlo honestamente (sin inventar nada):

```
1. BETA SEMBRADA: regala/abre acceso gratuito a 10-20 personas de tu nicho a cambio de
   feedback honesto y, si les sirve, un testimonio. Es la fuente #1 de los primeros testimonios.
2. CASOS PROPIOS / DEMOSTRACIÓN: usa la app tú mismo y documenta TU resultado real con números
   ("generé X en Y minutos"). Un caso real propio es prueba legítima.
3. RESULTADOS DEL PROCESO, no solo del producto: si la app aún no tiene clientes con resultados
   de largo plazo, muestra el OUTPUT (lo que produce) y el AHORRO de tiempo — eso es demostrable
   desde el día 1.
4. OFERTA DE FUNDADORES (archivo 34/lanzamiento): los primeros que pagan a cambio de precio
   especial → se convierten en los testimonios del próximo lanzamiento. Pídeselo apenas tengan
   su primera victoria (la del onboarding <60s).
5. MICRO-COMPROMISOS: reseñas en el marketplace de Hotmart, capturas de mensajes de usuarios
   felices (con permiso), conteo de uso ("+X resultados generados esta semana").

REGLA INNEGOCIABLE: CERO testimonios inventados, fotos de stock como "clientes", o números
falsos. Es ilegal, te baja Hotmart, y destruye la confianza. Prueba social REAL o ninguna —
mientras tanto, vende con la transformación, la demo y la garantía (reversión de riesgo).
```

#### PROMPT para conseguir y formatear prueba social inicial
```
Diseña el plan de PRUEBA SOCIAL DESDE CERO de [NOMBRE APP]. Entrega: (1) el mensaje de invitación
a la beta sembrada (10-20 personas del nicho) pidiendo feedback + testimonio; (2) las 3 preguntas
exactas para que el beta-tester escriba un testimonio con RESULTADO concreto (no genérico);
(3) cómo documentar 1 caso propio con números reales; (4) cómo formatear los testimonios para la
landing del archivo 19 (foto + nombre + resultado). Idioma del avatar. Recuérdame la regla:
solo prueba social real, nunca inventada.
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`18-VENTA-HOTMART.md`**: el DUNNING de aquí opera sobre el estado **`past_due`** del webhook (eventos `PURCHASE_DELAYED`/`OVERDUE`) y la máquina de estados (`past_due → active` al recuperar). Order bumps/upsells generan transacciones que el webhook procesa por `event_id` (idempotencia). Todos los emails (lanzamiento, retención, win-back, dunning) usan el **Resend** ya montado ahí.
- **`02-VALIDACION.md`**: la estrategia de retención y el win-back nacen ahí; este archivo operacionaliza el MOMENTO de cancelar (encuesta, pausa, rescate) y el dunning. El nuevo gate de demanda valida ANTES de invertir en lanzar.
- **`34-ADQUISICION-Y-TRAFICO.md`**: el lanzamiento concentra los canales de adquisición (afiliados, ads, email) en una ventana; la prueba social de aquí alimenta los creativos y emails de allá. El programa de **referidos** (opción A) reutiliza la afiliación de Hotmart de allá: convierte clientes felices en afiliados.
- **`40-UNIT-ECONOMICS.md`**: la recompensa de referidos y la comisión de afiliados consumen margen — la economía unitaria fija cuánto puedes premiar sin romper el LTV:CAC. La renovación anual bien atendida sube el LTV (menos churn en el mes 12).
- **`19-PAGINA-DE-VENTAS.md`**: la oferta de fundadores, los bumps/upsells y la prueba social viven en la landing y en su copy de respuesta directa (sin falsa escasez ni dark patterns).
- **`21-BACKOFFICE.md`**: el churn voluntario vs involuntario, la recuperación por dunning y el efecto de bumps/upsells en el AOV/LTV se MIDEN ahí (bloque nuevo de métricas de negocio).
- **`24-GAMIFICACION.md`**: la retención del PRODUCTO (rachas, hitos, re-enganche) complementa la retención del MOMENTO de cancelar de este archivo — la gamificación evita llegar al "cancelar"; este archivo rescata a quien ya llegó.
- **`46-EMAIL-DELIVERABILITY.md` + `47-LEGAL-FISCAL-Y-SOPORTE.md`**: prerrequisito de TODO envío masivo del lanzamiento — SPF/DKIM/DMARC + warmup y consentimiento/opt-in ANTES del primer email de warming.
- **`PROMPT-RETENER-INGRESOS.txt`** (`/retener-ingresos`): el brazo ejecutor de las secciones de churn de este archivo (cancelación, dunning, win-back, renovación anual). El lanzamiento se ejecuta con `PROMPT-LANZAMIENTO.txt`.
