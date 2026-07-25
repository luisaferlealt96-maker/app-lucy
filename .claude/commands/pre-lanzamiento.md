---
description: Certificación go-live — veredicto APTO/NO APTO con los 10 bloques (seguridad, datos, IA, pago, rigor de entrega 48)
---
CERTIFICACIÓN PRE-LANZAMIENTO — ¿está lista para vender? (go-live check)

Regla canónica actualizada: aplica primero `docs/sistema/PROMPT-PRE-LANZAMIENTO.txt`, especialmente
las preguntas simples sobre deploy, checkout real y permiso para corregir bloqueantes.

Antes de cobrarle a un solo usuario, certifica que esta app está lista para producción y venta.
Revísala a fondo y dame un veredicto final APTO / NO APTO con la lista de bloqueantes. Para cada
punto marca ✅ ok / ⚠️ arreglar / ❌ bloqueante:

━━━ CONTEXTO (qué me preocupa, fecha de lanzamiento) ━━━
$ARGUMENTS
(Si viene vacío, deduce el estado real de la app de ESTADO.md y del código.)

  1. SEGURIDAD (docs/sistema/27 + 09): auditoría OWASP 2025, fail-open, secretos fuera del repo,
     RLS + prueba de IDOR (acceso cruzado entre usuarios), headers + CSP real, webhook de pago con
     firma verificada.
  2. DATOS (25): índices (FKs incluidas), RLS de alto rendimiento, migraciones seguras, backups.
  3. ESCALA (13): ¿aguanta 300-500 usuarios? pooling (puerto 6543), paginación, caché, jobs async,
     y qué tier toca (recuerda: el Supabase Free se rompe primero — pausa a los 7 días + egress 5GB).
  4. IA, si aplica (30 + 31): claves en el servidor, async para imagen/audio, resiliencia
     (reintentos/timeout/degradación), guardrails (moderación/anti-inyección), observabilidad
     (tabla ai_calls), alertas de gasto, y golden set de evals.
  5. PAGO (18): idempotencia del webhook, manejo de past_due/dunning, y prueba end-to-end real
     pagar → plan activo → features desbloqueadas.
  6. LEGAL (09): privacidad, términos, borrado de cuenta, aviso de procesamiento por IA.
  7. ECONOMÍA: costo de IA por usuario Pro < 20% del precio (medido con ai_calls, no estimado).
  8. OPERACIÓN (31): Sentry activo, mini-runbook de incidentes, status page, canal de soporte
     visible, y rollback probado.
  9. PRODUCTO ENRIQUECIDO (32): cada pantalla clave MIRADA renderizada a 375px — nav al fondo sin
     vacío muerto, fondo con profundidad, pantalla llena de valor, CTA vivo, rúbrica /40 ≥ 36. Una
     app básica / plana / vacía NO es APTA aunque funcione.
 10. RIGOR DE ENTREGA (48 — la puerta final, lo que evita que YO tenga que corregir):
     - AUTO-QA END-TO-END: maneja la app como usuario real, toca CADA botón, recorre CADA flujo
       (primera victoria, acción frecuente, llegar al límite del plan, pago, recuperación de error),
       verifica los 6 estados (vacío/carga/éxito/error/deshabilitado/offline) y el PRIMER ARRANQUE vacío.
     - PRE-MORTEM: "si esto fracasa/me avergüenza/me cuesta dinero en 1 semana, ¿por qué?" → corrige los top.
     - INVARIANTES: dinero (gating en servidor, webhook idempotente, refund/chargeback correctos),
       datos (no se pierden, export), seguridad (IDOR probado).
     - CIRCUIT-BREAKER de costo de IA: tope global + por-usuario + kill-switch + alerta (no factura sorpresa).
     - CALIDAD DEL OUTPUT de IA: el resultado es genuinamente bueno/completo/en-marca, no slop.
     - MANUAL-DEL-DUEÑO.md generado (cuentas, claves, deploy, tareas comunes, runbook) en lenguaje simple.

Corrige los ❌ y ⚠️ que puedas sin romper nada (verificando con tsc + build + dev), y dame la lista
de lo que requiere mi decisión o mi acción (pagar dominio, dar una clave, etc.). No declares APTO
sin haberlo verificado con evidencia real (incluido el auto-QA manejando la app, no solo que compile).
