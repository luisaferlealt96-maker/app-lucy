-- Agregar campo vigencia real de la orden médica (días)
ALTER TABLE autorizaciones_eps
  ADD COLUMN IF NOT EXISTS vigencia_dias integer NOT NULL DEFAULT 120;
