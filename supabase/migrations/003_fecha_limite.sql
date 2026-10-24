-- Fecha límite (plazo) para gestionar citas, medicamentos y exámenes/procedimientos
ALTER TABLE citas        ADD COLUMN IF NOT EXISTS fecha_limite date;
ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS fecha_limite date;
ALTER TABLE examenes     ADD COLUMN IF NOT EXISTS fecha_limite date;
