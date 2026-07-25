-- ================================================================
-- MIGRACIÓN 001 — Pilar de Salud + Auth familiar
-- App Lucy Familia
-- ================================================================

-- ── Extensión para UUIDs ─────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Trigger para updated_at automático ──────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ================================================================
-- TABLA: miembros_familia
-- Un registro por cada persona de la familia (con o sin cuenta)
-- ================================================================
create table miembros_familia (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  nombre          text not null check (length(nombre) between 1 and 100),
  fecha_nacimiento date,
  emoji           text not null default '👤',
  rol             text not null default 'familiar'
                    check (rol in ('admin', 'familiar', 'abuela')),
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index miembros_user_id_idx on miembros_familia(user_id);
create index miembros_rol_idx on miembros_familia(rol);

create trigger miembros_updated_at
  before update on miembros_familia
  for each row execute function set_updated_at();

-- ================================================================
-- TABLA: citas
-- Citas médicas de cualquier miembro de la familia
-- ================================================================
create table citas (
  id                  uuid primary key default gen_random_uuid(),
  paciente_id         uuid not null references miembros_familia(id) on delete cascade,
  acompanante_id      uuid references miembros_familia(id) on delete set null,
  especialidad        text not null,
  medico              text,
  lugar               text,
  fecha_hora          timestamptz not null,
  notas_pre           text,
  notas_post          text,
  estado              text not null default 'pendiente'
                        check (estado in ('pendiente', 'completada', 'cancelada')),
  recordatorio_enviado boolean not null default false,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index citas_paciente_idx       on citas(paciente_id);
create index citas_acompanante_idx    on citas(acompanante_id);
create index citas_fecha_estado_idx   on citas(fecha_hora, estado);
create index citas_created_by_idx     on citas(created_by);

create trigger citas_updated_at
  before update on citas
  for each row execute function set_updated_at();

-- ================================================================
-- TABLA: medicamentos
-- Medicamentos activos/históricos por miembro
-- ================================================================
create table medicamentos (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references miembros_familia(id) on delete cascade,
  nombre          text not null,
  dosis           text,
  frecuencia      text,
  horas_toma      text[],         -- ej: ["08:00", "14:00", "20:00"]
  fecha_inicio    date,
  fecha_fin       date,
  activo          boolean not null default true,
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index medicamentos_paciente_idx  on medicamentos(paciente_id);
create index medicamentos_activo_idx    on medicamentos(paciente_id, activo);

create trigger medicamentos_updated_at
  before update on medicamentos
  for each row execute function set_updated_at();

-- ================================================================
-- TABLA: examenes
-- Laboratorios, exámenes y procedimientos
-- ================================================================
create table examenes (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references miembros_familia(id) on delete cascade,
  tipo            text not null
                    check (tipo in ('laboratorio', 'examen', 'procedimiento')),
  nombre          text not null,
  especialidad    text,
  fecha_solicitud date,
  fecha_resultado date,
  lugar           text,
  resultado       text,
  estado          text not null default 'pendiente'
                    check (estado in ('pendiente', 'en_proceso', 'listo')),
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index examenes_paciente_idx  on examenes(paciente_id);
create index examenes_tipo_idx      on examenes(paciente_id, tipo);
create index examenes_estado_idx    on examenes(estado);

create trigger examenes_updated_at
  before update on examenes
  for each row execute function set_updated_at();

-- ================================================================
-- RLS — Row Level Security
-- Regla simple: cualquier usuario autenticado de la familia
-- puede ver y editar todos los datos (app personal compartida)
-- ================================================================
alter table miembros_familia  enable row level security;
alter table citas              enable row level security;
alter table medicamentos       enable row level security;
alter table examenes           enable row level security;

-- miembros_familia
create policy "familia_lee_miembros"
  on miembros_familia for select
  using (auth.uid() is not null);

create policy "familia_escribe_miembros"
  on miembros_familia for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- citas
create policy "familia_lee_citas"
  on citas for select
  using (auth.uid() is not null);

create policy "familia_escribe_citas"
  on citas for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- medicamentos
create policy "familia_lee_medicamentos"
  on medicamentos for select
  using (auth.uid() is not null);

create policy "familia_escribe_medicamentos"
  on medicamentos for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- examenes
create policy "familia_lee_examenes"
  on examenes for select
  using (auth.uid() is not null);

create policy "familia_escribe_examenes"
  on examenes for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ================================================================
-- DATOS INICIALES — miembros de la familia Lucy
-- ================================================================
insert into miembros_familia (nombre, fecha_nacimiento, emoji, rol) values
  ('Abuela Rosa',  '1951-03-15', '👵', 'abuela'),
  ('Mamá',         '1971-06-20', '👩', 'familiar'),
  ('Luisa',        '1996-01-10', '🙋‍♀️', 'admin'),
  ('Tío 1',        '1968-09-05', '👨', 'familiar'),
  ('Tío 2',        '1973-11-22', '👨', 'familiar'),
  ('Tío 3',        '1976-04-18', '👨', 'familiar');
