# SETUP-CLAUDE-CODE — Cómo aprovechar el paquete nativo de Claude Code

> Para ti, que NO eres técnico. Este SO ya viene "instalado" para Claude Code: al copiar la
> carpeta del SO a tu proyecto, todo lo de abajo funciona solo. Aquí te explico qué es cada cosa.

## 1. La carpeta `.claude/` — tus "botones"

Dentro del proyecto hay una carpeta oculta llamada `.claude/`. Contiene **slash commands**:
atajos que escribes en el chat de Claude Code empezando con `/`. En vez de pegar un prompt
larguísimo, escribes el comando y listo. Ejemplo: escribe `/arranque` y presiona Enter.

Después de la barra puedes agregar contexto: `/diseno app de hábitos para mamás ocupadas`.
Si no agregas nada, la IA lo deduce sola de ESTADO.md (la memoria del proyecto).

## 2. Los 14 comandos disponibles

| Comando | Qué hace |
|---|---|
| `/arranque` | Inicia todo: retoma el proyecto o arranca uno nuevo con la Primera Pregunta |
| `/retomar` | Vuelve donde quedaste: lee ESTADO.md y te dice el siguiente paso |
| `/auditoria` | Audita tu app completa y la eleva a 10/10 |
| `/diseno` | Sube el diseño a nivel de estudio premium (anti "look de IA") |
| `/onboarding-paywall` | Mejora el onboarding y la pantalla de pago para convertir más |
| `/rescate` | Rescata una app estancada (flujo + UX + seguridad) sin romperla |
| `/retencion` | Implementa rachas, XP y re-enganche para que la gente vuelva |
| `/landing` | Crea la página de ventas de alta conversión |
| `/adquisicion` | Activa el motor de tráfico: afiliados Hotmart, ads, contenido, email |
| `/lanzamiento` | Prepara el lanzamiento en 5 fases + dunning y win-back |
| `/backoffice` | Construye tu panel de dueño: ventas, ganancia real, costo de IA |
| `/deploy` | Publica la app en internet de principio a fin (GitHub + Supabase + Vercel) |
| `/pre-lanzamiento` | Certificación final: veredicto APTO / NO APTO antes de cobrar |
| `/auditar-so` | (Uso interno) Revisa la coherencia del propio SO antes de reempacarlo |

## 3. Los hooks — tus "guardianes automáticos"

En `.claude/hooks/` viven 4 scripts que Claude Code ejecuta SOLO, sin que tú hagas nada:

- **Al empezar cada sesión**: le recuerda a la IA leer ESTADO.md y las 7 Reglas de Oro.
- **Cada vez que edita código**: revisa al instante que el código TypeScript no tenga errores;
  si los hay, la IA los ve y los corrige antes de seguir.
- **Antes de "terminar"**: le impide a la IA declarar el trabajo listo si hay errores de código
  o si lleva horas sin actualizar ESTADO.md (su memoria).
- **Antes de "compactar"** (cuando la conversación se hace muy larga y se resume): le recuerda
  releer ESTADO.md y las reglas para no perder el hilo.

No tienes que tocarlos. Si un guardián bloquea algo, la IA te lo explicará en simple.

## 4. El MCP de Playwright — para que la IA VEA tus pantallas

La Regla de Oro 7 exige que la IA MIRE cada pantalla renderizada antes de declararla lista.
Para eso el proyecto incluye el archivo `.mcp.json`, que conecta un "navegador para la IA"
(Playwright): con él, la IA abre tu app, la ve a tamaño celular (375px), toma screenshots y
puntúa el diseño sobre lo que VE.

Cómo activarlo: la primera vez que abras Claude Code en el proyecto, te preguntará si apruebas
el servidor MCP "playwright". Di que sí. Eso es todo (necesita internet la primera vez para
descargarse).

⚠️ Importante: si NO apruebas o no funciona el MCP, el control visual queda **degradado** — la
IA solo podrá verificar el código, no cómo se ve la app, y te avisará que la verificación
visual quedó pendiente. Con el MCP activo, el ciclo de diseño es mucho más confiable.

## 5. Los scripts de `scripts/` (opcional, para mantenimiento)

- `scripts/audit-diseno.sh /ruta/de/tu/app` — revisión mecánica de diseño (colores fuera de
  tokens, espaciados fuera de escala, fuentes prohibidas, console.log).
- `scripts/release.sh` — solo para quien mantiene el SO: verifica la coherencia antes de reempacar.

## 6. ¿Y si algo no funciona?

Escríbele a Claude Code en el chat, en tus palabras: "el comando /diseno no aparece" o
"me salió un aviso raro al cerrar". La IA diagnostica y lo arregla — para eso está.
