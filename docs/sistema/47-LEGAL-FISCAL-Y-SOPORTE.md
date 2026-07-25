# LEGAL, FISCAL Y SOPORTE — La Operación Post-Venta que Convierte "una App que Vende" en "un Negocio"

> **Cuándo cargar este archivo:**
> - Cuando la app YA vende (o está a punto): al primer ingreso recurrente por Hotmart (junto con `18-VENTA-HOTMART.md` y `40-UNIT-ECONOMICS.md`)
> - Al montar las páginas legales mínimas (complementa la privacidad/LGPD de `09-SEGURIDAD.md`, que NO se duplica aquí)
> - Cuando hay que dar soporte a clientes reales y bajar el churn (junto con `35-LANZAMIENTO-Y-RETENCION.md` y `31-EVALS-OBSERVABILIDAD-OPERACION.md`)
> - Si la app tiene contenido de usuarios (UGC) o salidas de IA públicas/compartibles (Trust & Safety, junto con `30-INTEGRACION-IA.md`)
>
> **Por qué existe:** el SO ya cubre cómo VENDER por Hotmart (`18`), si la app GANA dinero (`40`), la seguridad/privacidad/LGPD (`09`), la retención/dunning (`35`), la observabilidad y un soporte mínimo viable (`31`) y los guardrails de IA (`30`). Lo que faltaba es la **CAPA OPERATIVA post-venta**: las obligaciones fiscales/legales que NO desaparecen porque vendas por Hotmart, el soporte entendido como SISTEMA DE RETENCIÓN (no un buzón olvidado), y la moderación/Trust & Safety cuando hay UGC o salidas públicas. Es la diferencia entre "una app que vende" y "un negocio que no te mete en problemas y retiene".

---

## 1. FISCAL Y LEGAL OPERATIVO (LATAM, con Hotmart)

### Hotmart como vendedor / Merchant of Record — reduce, NO elimina tu carga fiscal

En muchos países Hotmart actúa como el **vendedor de cara al comprador**: cobra al cliente, emite el comprobante al consumidor, retiene/paga ciertos impuestos del lado del consumidor, y te paga a ti como **productor** (descontando su tarifa de procesamiento y las retenciones que te apliquen). Eso te quita de encima parte de la fricción fiscal con el comprador final.

```
Lo que Hotmart SÍ suele resolver (verificar por país, no asumir):
- El cobro al comprador y su medio de pago (tarjeta, boleto, PIX, etc.).
- El comprobante/recibo al CONSUMIDOR final.
- La retención/pago de ciertos impuestos al consumo del lado del comprador.

Lo que Hotmart NO resuelve por ti:
- Declarar lo que Hotmart TE PAGA como tu INGRESO (esto es tuyo, siempre).
- Tu contabilidad, tu facturación al régimen, y entender QUÉ te retuvieron al pagarte.
```

> **Regla dura: verificar el modelo POR PAÍS, no asumir.** "Merchant of Record" no funciona igual en Colombia, México, Brasil, Argentina, Chile o Perú, ni para todos los productos. El alcance de lo que Hotmart hace por ti cambia con tu país de residencia fiscal y el del comprador. Confírmalo en tu panel y con la doc de Hotmart **antes** de prometerte que "Hotmart se encarga de los impuestos".

### Lo que el dueño SIGUE debiendo (no es opcional al escalar)

Aunque Hotmart sea el vendedor de cara al comprador, lo que te paga es **ingreso tuyo** y eso genera obligaciones:

| Obligación | Qué significa | Cuándo apretar |
|---|---|---|
| **Declarar el ingreso** | Lo que Hotmart te transfiere es renta tuya (persona natural o empresa, según tu país y monto). Declararlo según tu régimen. | Desde el primer pago; en serio al volverse recurrente |
| **Contabilidad / facturación** | Llevar registro de ingresos y, si tu régimen lo exige, emitir tus propias facturas (a Hotmart o por tu actividad). | Al pasar de "ingresos sueltos" a recurrencia |
| **Entender las retenciones** | Hotmart te retiene/descuenta al pagarte (procesamiento + posibles retenciones). Lo que LLEGA a tu cuenta ≠ el bruto. Esto alimenta el INGRESO NETO de `40`. | Antes de modelar unit economics con cifras reales |
| **Persona natural vs empresa** | Al escalar suele convenir constituir empresa (régimen, deducciones, límites de persona natural). Decisión local. | Cuando el ingreso recurrente lo justifique |

> **Recomendación dura, no negociable al escalar:** al PRIMER ingreso recurrente, consultar un **contador local**. No es un lujo ni "para después": las reglas de declaración, retención y régimen son específicas de tu país y cambian. El SO te da el mapa; el contador firma el terreno. Esto **NO es opcional** cuando el negocio empieza a facturar de verdad.

### Documentos legales mínimos (complementa `09`, NO lo duplica)

`09-SEGURIDAD.md` ya cubre la **Política de Privacidad**, el cumplimiento **LGPD/Ley 1581/LFPDPPP**, el consentimiento, la transferencia internacional a la IA y los derechos del titular. **Eso no se repite aquí.** Lo que falta del lado contractual/comercial:

```
1. TÉRMINOS DE SERVICIO (ToS)
   - Qué es el servicio y qué NO promete; condiciones de uso aceptable; derecho a terminar cuentas.
   - Que el acceso se vende vía Hotmart (suscripción) y vive en la app (Vercel/Supabase).
   - Ley aplicable y resolución de disputas (tu país).

2. POLÍTICA DE REEMBOLSO  → ALINEAR con la de Hotmart (no contradecirla).
   - Hotmart impone su propia ventana/garantía legal de reembolso (verificar la vigente por país).
   - Tu política NO puede prometer menos de lo que Hotmart garantiza, ni contradecir su flujo.
   - El webhook ya maneja PURCHASE_REFUNDED/CHARGEBACK (corte de acceso, ver 18) — el TEXTO legal
     debe coincidir con ese comportamiento real.

3. DISCLAIMER + LIMITACIÓN DE RESPONSABILIDAD  → CRÍTICO para apps de IA.
   - Frase núcleo: "Esto es ORIENTACIÓN generada por IA, NO consejo médico/legal/financiero/
     profesional. El usuario es responsable de sus decisiones." Adaptar al dominio de la app.
   - La salida de IA puede ser incorrecta o incompleta; el usuario debe verificar.
   - Sin esto, una app de IA que "aconseja" salud/dinero/legal te expone a responsabilidad real.

4. EDAD MÍNIMA (si aplica)
   - Declarar edad mínima de uso (13/16/18 según el dato que trates y tu país); reforzado si hay
     datos sensibles o de menores (ver 09). En un MVP, lo más simple es prohibir <18 si hay duda.
```

### Capa legal de SUSCRIPCIÓN (obligatoria antes de vender recurrente)

Vender una suscripción añade obligaciones que un pago único no tiene. Cuatro piezas, todas antes de la primera venta:

```
1. PÁGINA "CÓMO CANCELAR" IN-APP — OBLIGATORIA.
   Pasos concretos (con capturas si se puede) + LINK DIRECTO al portal del comprador de Hotmart
   donde se cancela. Accesible desde ajustes/cuenta sin buscar. Una cancelación difícil no retiene:
   produce churn con rabia, reembolsos, chargebacks y reseñas de 1 estrella — y es un dark pattern
   prohibido por el propio SO (CLAUDE.md / 03).

2. AVISO DE RENOVACIÓN AUTOMÁTICA visible ANTES del checkout.
   En el paywall y en el puente de checkout (02B): "Se renueva automáticamente cada mes/año.
   Cancela cuando quieras desde tu cuenta." Con trial: la FECHA EXACTA del primer cobro (ya lo
   exige 02B). Cobros recurrentes "sorpresa" = disputas y riesgo de consumo.

3. DERECHO DE RETRACTO DE 7 DÍAS (CDC de Brasil, que Hotmart aplica).
   El comprador puede desistir dentro de los 7 días con devolución — Hotmart lo opera. Tu garantía
   y tus textos deben ser COHERENTES con esa ventana: nunca ofrecer menos de 7 días ni poner
   condiciones que la contradigan. En otros países LATAM hay figuras análogas: verificar por mercado.

4. COHERENCIA GARANTÍA PROMETIDA ↔ VENTANA REAL DE REEMBOLSO EN HOTMART.
   Si la landing/paywall promete "30 días o te devolvemos el dinero", la garantía del producto EN
   EL PANEL de Hotmart debe estar configurada a 30 días (se configura por producto). Prometer 30
   con 7 configurados = el cliente pide el día 20, Hotmart lo rechaza, y el incumplimiento es TUYO
   (reembolso manual + reclamo). Verificarlo en el panel antes de publicar la promesa.
```

### Claims publicitarios y moderación (Meta / TikTok / Hotmart)

Los claims del copy no son solo un tema de conversión — son un riesgo operativo que puede matar tus canales:

```
- INCOME CLAIMS ("gana $1.847 en 21 días", "factura $10k/mes"): violan las políticas de anuncios
  de Meta y TikTok. Resultado: anuncios rechazados y, reincidiendo, la CUENTA PUBLICITARIA
  bloqueada — pierdes el canal de pago completo, no un anuncio.
- CLAIMS DE SALUD no sustentados ("pierde 5 kg en 2 semanas") y apelaciones a atributos personales
  ("¿cansado de tu sobrepeso?"): mismas políticas, mismo riesgo.
- HOTMART TAMBIÉN MODERA: productos y páginas con promesas de enriquecimiento o salud sin sustento
  pueden no pasar la aprobación o ser dados de baja después. Los testimonios inventados violan
  además sus términos (y la ley de consumo).
- REGLA DEL SO (coherente con la regla 3 de copy de 19): números específicos SOLO verificables y
  propios, enmarcados en PROCESO y TIEMPO ("de 2 horas a 4 minutos por carrusel"), nunca en
  promesas de ingresos o resultados de salud. La prueba social sigue el playbook "en frío" de 19
  (jamás placeholders).
```

> **El disclaimer NO es decorativo.** Para una app de IA, la limitación de responsabilidad es la pieza legal que más te protege: define que generas *orientación*, no *consejo profesional vinculante*. Tiene que estar (a) en los ToS, (b) visible en la app donde la IA produce la salida sensible, y (c) coherente con el aviso de procesamiento de IA que ya pide `09`. Tres lugares, el mismo mensaje.

### Dónde van los textos legales

Coherente con `09`: links en el **footer** (siempre visible) y en el **registro** (checkbox no premarcado). Para apps de IA, sumar el disclaimer **junto a la salida** de la IA, no solo enterrado en los ToS.

```
Footer:  [Términos de Servicio] · [Política de Privacidad] · [Política de Reembolso] · [Contacto/Soporte]
Registro: "Al crear tu cuenta aceptas los [Términos] y la [Política de Privacidad]." (checkbox NO premarcado)
En la salida de IA: micro-disclaimer contextual ("Esto es orientación, no consejo profesional").
```

### Checklist legal/fiscal — EMPEZAR vs ESCALAR

```
PARA EMPEZAR (antes/al primer venta)
[ ] ToS publicados (servicio, uso aceptable, terminación, ley aplicable)
[ ] Política de Reembolso publicada y ALINEADA con la de Hotmart (no promete menos ni contradice)
[ ] Página "cómo cancelar" IN-APP con pasos + link al portal del comprador de Hotmart
[ ] Aviso de renovación automática visible ANTES del checkout (paywall + puente de 02B)
[ ] Retracto de 7 días (CDC Brasil vía Hotmart) respetado: garantía ≥ 7 días, textos coherentes
[ ] Garantía prometida (ej. 30 días) = ventana de reembolso CONFIGURADA en el panel de Hotmart
[ ] Copy sin income claims ni claims de salud no sustentados (políticas Meta/TikTok + moderación Hotmart)
[ ] Disclaimer + limitación de responsabilidad (IA = orientación, no consejo profesional) en ToS y junto a la salida
[ ] Edad mínima declarada si aplica
[ ] (de 09) Política de Privacidad + LGPD/consentimiento + transferencia internacional a IA
[ ] Sé qué te RETIENE Hotmart al pagarte (para el ingreso NETO de 40)

PARA ESCALAR (al volverse recurrente / crecer)
[ ] Contador local consultado — declaración del ingreso de Hotmart según tu régimen y país
[ ] Decisión persona natural vs empresa tomada con asesoría
[ ] Contabilidad/facturación montada según tu régimen
[ ] Modelo fiscal de Hotmart verificado POR PAÍS (no asumido) para tu(s) mercado(s)
[ ] Si vendes multi-país/multi-moneda: revisar obligaciones por mercado (ver 39)
```

---

## 2. SOPORTE AL CLIENTE COMO SISTEMA DE RETENCIÓN

> **Esto extiende, no duplica, el "soporte mínimo viable" de `31` (Parte 4).** El `31` dice que DEBE existir un canal real (formulario → `support_tickets` + Resend, o Crisp/Plain/Tawk). Aquí se sube de "que exista" a "que RETENGA": SLA, IA + escalada, rescate de churn, loop de feedback y métricas.

### Principio: el soporte ES parte del producto vendible

Un cliente bien atendido NO churnea. Y como el soporte rescata clientes que ya pagaron, es **la inversión de retención más barata que existe** — evita el CAC de conseguir un reemplazo (conecta con `40`: un cliente retenido vale su LTV completo; uno perdido cuesta un CAC nuevo). El soporte malo no se ve en el balance hasta que el churn lo grita.

### Canales por etapa (no montes un call center el día 1)

```
MÍNIMO VIABLE (arranque):
  - Email soporte@tuapp.com  +  Centro de ayuda / FAQ (las dudas top, reduce tickets).
  - El formulario in-app → support_tickets + Resend que ya pide 31.

CRECIENDO (cuando el volumen lo justifique):
  - Chat (Crisp/Plain/Tawk, varios con plan gratis) para respuesta más rápida.
  - Base de conocimiento navegable + búsqueda.

NO antes de tiempo: teléfono/WhatsApp 1:1 no escala — añádelo solo si tu avatar lo exige.
```

### SLA — define y CUMPLE un tiempo de respuesta

```
- SLA explícito y prometido: ej. primera respuesta < 24h hábiles (y dilo en el centro de ayuda).
- Respuesta automática de "lo recibimos" al instante (gestiona expectativa — ya en 31).
- CANNED RESPONSES / plantillas para lo repetitivo (acceso, magic link no llega, cómo cancelar,
  cómo actualizar el método de pago → enlaza con el dunning de 35). Responder rápido y bien lo
  repetitivo libera tiempo para lo difícil.
```

### Soporte con IA + escalada humana (regla dura)

```
- Un bot/FAQ con IA responde lo repetitivo (acceso, facturación, "cómo hago X"). Bien hecho,
  resuelve el grueso sin intervención humana.
- Aplica los GUARDRAILS de 30: moderación de la salida, anti-inyección (el usuario no debe poder
  reprogramar al bot), grounding (responde SOLO con base en tu FAQ/docs; si no sabe, escala).
- ⛔ REGLA DURA: NUNCA dejar al usuario en LOOP con un bot sin salida a humano. Siempre un
  "hablar con una persona" visible. Un bot que no resuelve Y no deja escalar es un generador de
  churn y reseñas de 1 estrella en el marketplace de Hotmart.
```

### Soporte que RESCATA churn (proactivo, no reactivo)

El mejor soporte no espera el ticket: detecta la señal y actúa. Conecta directo con la cancelación/dunning/win-back de `35`.

```
SEÑAL                          → INTERVENCIÓN PROACTIVA (cruza con 35)
Cancela (encuesta de baja)     → oferta de rescate según la razón / oferta de PAUSA (35)
past_due (pago falló, de 18)   → cadencia de dunning días 1/3/5/7 (35) — "actualiza tu método"
Caída de uso / no vuelve       → re-onboarding ("el valor que te perdiste") + tip de uso (35)
Ticket sin resolver > SLA      → escalar y disculpa proactiva (un ticket olvidado = churn casi seguro)
```

### Loop de feedback — el soporte es tu mejor fuente de producto

```
- Los tickets recurrentes SON el backlog: si 5 personas preguntan lo mismo, no respondas 5 veces —
  ARRÉGLALO en la UI/onboarding (ya insinuado en 31, aquí es proceso).
- Cada tema recurrente → un candidato a mejora del producto y a caso del descubrimiento continuo (44).
- Cada bug reportado en soporte → un caso de regresión (test de 06 o eval de 31), para que no vuelva.
- Revisar el TOP-5 de temas cada semana/quincena → alimenta el backlog y el descubrimiento (44).
```

### Métricas de soporte (mídelas, o no lo estás operando)

| Métrica | Qué indica | Señal de alarma |
|---|---|---|
| **Tiempo de primera respuesta** | ¿cumples tu SLA? | sistemáticamente > SLA prometido |
| **CSAT** (satisfacción post-ticket) | ¿resolviste bien? | tendencia a la baja |
| **Tickets / usuario activo** | ¿el producto confunde? | sube = fricción en la UI |
| **Top-5 temas recurrentes** | QUÉ arreglar en el producto | el mismo tema mes a mes = no lo arreglaste |
| **% resuelto por IA / sin escalar** | eficiencia del bot | bajo = el bot no ayuda; muy alto = ¿escala bien lo difícil? |
| **Tickets que terminaron en cancelación** | soporte como retención | alto = el soporte no rescata |

> **El top-5 de temas recurrentes es oro de producto.** No es una lista de quejas: es el roadmap que tus clientes ya te escribieron. Cruzarlo con `44` (descubrimiento) y `35` (razones de cancelación) te dice exactamente qué arreglar para bajar churn — gratis.

---

## 3. TRUST & SAFETY / MODERACIÓN (condicional — solo si aplica)

> **Esta sección APLICA SOLO si la app tiene contenido de usuarios (UGC) o salidas de IA públicas/compartibles.** Si la app es de un solo usuario, sin UGC, y las salidas de IA son privadas (solo las ve quien las generó), **esta sección NO aplica — y eso está bien, no hay nada que montar aquí.** Dilo explícitamente y pasa de largo.

### Si HAY contenido de usuarios (UGC) o salidas públicas/compartibles

```
POLÍTICA DE USO ACEPTABLE (parte de los ToS de la sección 1):
  - Qué está prohibido publicar/generar (acoso, ilegal, spam, sexual con menores, etc.).
  - Consecuencias (advertencia, suspensión, baja) y derecho a terminar la cuenta.

HERRAMIENTAS DE MODERACIÓN COMUNITARIA:
  - REPORTAR contenido/usuario (botón visible).
  - BLOQUEAR / SILENCIAR a otro usuario.
  - Manejo de ABUSO y SPAM (rate limit, detección de patrones, baneo).
  - EDAD MÍNIMA reforzada (coherente con la sección 1 y con 09 para menores/datos sensibles).
```

### Para apps de IA: moderación de OUTPUTS (enlaza con los guardrails de `30`)

`30` ya define los guardrails de IA (moderación entrada/salida, anti-inyección, grounding). La capa de Trust & Safety los **opera** cuando la salida puede volverse pública o compartible:

```
- MODERACIÓN DE SALIDA (de 30, guardrail #1): pasar la salida del modelo por un clasificador
  (Moderation API del proveedor o un Haiku barato) ANTES de mostrarla o de permitir compartirla.
  Especialmente crítico si esa salida se publica o comparte (ya no es solo del usuario).
- ANTI-INYECCIÓN (de 30, guardrail #2): el input del usuario son DATOS, no instrucciones —
  no debe reprogramar el sistema ni la moderación.
- NO GENERAR CONTENIDO PROHIBIDO: políticas claras de qué la IA NO produce; bloquear y registrar
  el intento (status 'moderated' en ai_calls, ver 31).
- Si la salida se COMPARTE públicamente, la responsabilidad sube: modera ANTES de exponerla, no después.
```

> **Si NO hay UGC ni salida pública, esta sección entera no aplica.** No inventes una cola de moderación para una app de un solo usuario con salidas privadas — sería gold-plating. La regla: ¿el contenido que genera un usuario puede llegar a OTRO usuario o al público? Si no, salta esta sección.

---

## CHECKLIST DE CIERRE — Legal, Fiscal y Soporte

```
FISCAL / LEGAL
[ ] Modelo de Hotmart como vendedor VERIFICADO por país (no asumido)
[ ] Sé qué me retiene/descuenta Hotmart al pagarme (alimenta el ingreso NETO de 40)
[ ] Ingreso de Hotmart declarado como renta propia según mi régimen
[ ] Contador local consultado al primer ingreso recurrente (NO opcional al escalar)
[ ] ToS publicados (servicio, uso aceptable, terminación, ley aplicable)
[ ] Política de Reembolso alineada con Hotmart (coherente con el corte de acceso del webhook de 18)
[ ] Capa de suscripción: "cómo cancelar" in-app + aviso de renovación pre-checkout + retracto 7 días + garantía = ventana configurada en Hotmart
[ ] Claims publicitarios limpios (sin income/salud) — coherente con 19 y con la moderación de Hotmart
[ ] Disclaimer + limitación de responsabilidad (IA ≠ consejo profesional) en ToS Y junto a la salida
[ ] Edad mínima declarada si aplica
[ ] (de 09, no duplicar) Privacidad + LGPD + consentimiento + transferencia internacional a IA

SOPORTE COMO RETENCIÓN
[ ] Canal real visible en la app (email soporte@ + FAQ mínimo; chat al crecer) — base en 31
[ ] SLA definido y prometido (ej. < 24h) + canned responses para lo repetitivo
[ ] Bot/IA de FAQ con escalada a humano SIEMPRE disponible (nunca loop sin salida)
[ ] Soporte proactivo cableado a 35: rescate por cancelación, dunning (past_due), re-onboarding
[ ] Loop de feedback: top-5 temas → backlog/UI (44); bug de soporte → test/eval (06/31)
[ ] Métricas: tiempo de respuesta, CSAT, tickets/usuario, top-5 temas, % resuelto por IA

TRUST & SAFETY (solo si hay UGC o salida pública/compartible — si no, NO aplica)
[ ] Política de uso aceptable en los ToS
[ ] Reportar / bloquear / silenciar; manejo de abuso y spam; edad mínima reforzada
[ ] Moderación de OUTPUTS de IA antes de publicar/compartir (guardrails de 30: moderación, anti-inyección)
[ ] Si NO hay UGC ni salida pública: documentado que esta sección no aplica
```

---

## CÓMO SE CONECTA

```
18-VENTA-HOTMART.md    → Hotmart como vendedor (reduce carga fiscal); el webhook ya hace el corte por
                         REFUNDED/CHARGEBACK que la Política de Reembolso debe reflejar; Resend monta los
                         emails de soporte/dunning. La Política de Reembolso se ALINEA con la de Hotmart.
40-UNIT-ECONOMICS.md   → lo que Hotmart te retiene/descuenta define el INGRESO NETO; el soporte como
                         retención protege el LTV (un cliente retenido = su LTV; uno perdido = un CAC nuevo).
09-SEGURIDAD.md        → Privacidad/LGPD/consentimiento/transferencia a IA YA viven ahí (NO se duplican);
                         este doc añade ToS, Reembolso y Disclaimer (capa contractual/comercial).
35-LANZAMIENTO-Y-RETENCION.md → el soporte proactivo opera su encuesta de cancelación, oferta de pausa,
                         dunning (past_due) y win-back; el soporte es el brazo humano de la retención.
31-EVALS-OBSERVABILIDAD-OPERACION.md → extiende el "soporte mínimo viable" (Parte 4) a un SISTEMA;
                         los bugs de soporte se vuelven casos de regresión/eval; status page baja tickets.
30-INTEGRACION-IA.md   → los guardrails (moderación entrada/salida, anti-inyección, grounding) son la base
                         del bot de soporte y de la moderación de OUTPUTS en Trust & Safety.
44-DESCUBRIMIENTO-DE-USUARIO.md → el top-5 de temas de soporte alimenta el descubrimiento continuo y el
                         backlog: los tickets recurrentes son producto que tus clientes ya te escribieron.
```
