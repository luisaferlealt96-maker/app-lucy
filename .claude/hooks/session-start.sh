#!/usr/bin/env bash
# SessionStart hook — recordatorio inicial del SO (siempre exit 0, solo informa).

echo "=== SO APPS · RECORDATORIO DE ARRANQUE ==="

if [ -f "ESTADO.md" ]; then
  echo "→ Existe ESTADO.md: LÉELO ANTES de cualquier cosa (es tu memoria persistente)."
  CHECKPOINT=$(grep -i -m1 "checkpoint" ESTADO.md 2>/dev/null || true)
  if [ -n "$CHECKPOINT" ]; then
    echo "  Último checkpoint anotado: $CHECKPOINT"
  fi
else
  echo "→ No hay ESTADO.md: proyecto nuevo → lee docs/sistema/INICIO.md y sigue sus FLUJOS A/B/C."
fi

echo ""
echo "LAS 7 REGLAS DE ORO (resumen — completas en CLAUDE.md):"
echo "1. CONSULTA ANTES DE ACTUAR: lee los archivos de la tabla de ruteo ANTES de construir nada."
echo "2. NUNCA 'LISTO' SIN CHECKLIST · 3. ESTADO.md es tu memoria: léelo al abrir, actualízalo al cerrar."
echo "4. UNA CAPA A LA VEZ, verificando (tsc+build+dev) · 5. NO te saltes fases ni archivos del sistema."
echo "6. DEFINE ANTES DE CONSTRUIR: loop (24), auth (26), datos+RLS (25), arquitectura IA (30)."
echo "7. PRODUCTO ENRIQUECIDO, no MVP básico — MÍRALO RENDERIZADO a 375px y puntúa /40 antes de declarar listo."
echo ""
echo "La tabla de ruteo de CLAUDE.md dicta QUÉ LEER antes de cada tarea. No es sugerencia: es la secuencia."

exit 0
