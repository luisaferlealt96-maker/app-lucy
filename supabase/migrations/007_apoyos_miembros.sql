-- Personas de apoyo: cada miembro puede tener otros miembros que también
-- reciben lo que se le asigna (recordatorios como acompañante, órdenes que creó, etc.)
ALTER TABLE miembros_familia
  ADD COLUMN IF NOT EXISTS apoyos uuid[] NOT NULL DEFAULT '{}';
