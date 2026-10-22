-- Prestador (y teléfono) con quien se agenda la cita/procedimiento.
-- Sirve cuando no hay autorización EPS que traiga ese dato.
alter table citas
  add column if not exists nombre_prestador   text,
  add column if not exists telefono_prestador text;

alter table examenes
  add column if not exists nombre_prestador   text,
  add column if not exists telefono_prestador text;
