-- ============================================================
-- App Familiar Lucy — esquema inicial
-- Generado desde el código fuente (types.ts + hooks + pages)
-- Aplicar en Supabase SQL Editor o via CLI
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TIPOS ENUM ──────────────────────────────────────────────
create type rol_tipo            as enum ('admin', 'familiar', 'abuela');
create type estado_cita         as enum ('pendiente', 'completada', 'cancelada', 'por_agendar');
create type tipo_examen         as enum ('laboratorio', 'examen', 'procedimiento');
create type estado_examen       as enum ('pendiente', 'en_proceso', 'listo');
create type estado_entrega      as enum ('pendiente', 'reclamada');
create type estado_autorizacion as enum ('sin_gestionar', 'en_tramite', 'autorizada');
create type tipo_autorizacion   as enum ('cita', 'examen', 'laboratorio', 'procedimiento');

-- ─── MIEMBROS_FAMILIA ─────────────────────────────────────────
create table if not exists miembros_familia (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete set null,
  nombre           text not null,
  email            text,
  fecha_nacimiento date,
  emoji            text not null default '🧑',
  rol              rol_tipo not null default 'familiar',
  activo           boolean not null default true,
  tipo_sangre      text,
  peso             numeric(5,2),
  altura           numeric(5,2),
  alergias         text,
  condiciones      text,
  telefono         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- índices clave
create index if not exists idx_miembros_user_id  on miembros_familia(user_id);
create index if not exists idx_miembros_rol       on miembros_familia(rol);
create index if not exists idx_miembros_activo    on miembros_familia(activo);

-- RLS
alter table miembros_familia enable row level security;
create policy "familia_select" on miembros_familia for select using (true);
create policy "familia_insert" on miembros_familia for insert with check ((select auth.uid()) is not null);
create policy "familia_update" on miembros_familia for update using ((select auth.uid()) is not null);
create policy "familia_delete" on miembros_familia for delete using ((select auth.uid()) is not null);

-- ─── CITAS ────────────────────────────────────────────────────
create table if not exists citas (
  id                   uuid primary key default uuid_generate_v4(),
  paciente_id          uuid not null references miembros_familia(id) on delete cascade,
  acompanante_id       uuid references miembros_familia(id) on delete set null,
  especialidad         text not null,
  medico               text,
  lugar                text,
  lugar_detalle        text,
  fecha_hora           timestamptz,
  notas_pre            text,
  notas_post           text,
  estado               estado_cita not null default 'por_agendar',
  recordatorio_enviado boolean not null default false,
  audio_url            text,
  archivo_url          text,
  created_by           uuid references auth.users(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_citas_paciente_id    on citas(paciente_id);
create index if not exists idx_citas_acompanante_id on citas(acompanante_id);
create index if not exists idx_citas_estado         on citas(estado);
create index if not exists idx_citas_fecha_hora     on citas(fecha_hora);

alter table citas enable row level security;
create policy "citas_select" on citas for select using (true);
create policy "citas_insert" on citas for insert with check ((select auth.uid()) is not null);
create policy "citas_update" on citas for update using ((select auth.uid()) is not null);
create policy "citas_delete" on citas for delete using ((select auth.uid()) is not null);

-- ─── MEDICAMENTOS ────────────────────────────────────────────
create table if not exists medicamentos (
  id             uuid primary key default uuid_generate_v4(),
  paciente_id    uuid not null references miembros_familia(id) on delete cascade,
  nombre         text not null,
  dosis          text,
  frecuencia     text,
  horas_toma     text[],
  fecha_inicio   date,
  fecha_fin      date,
  total_entregas integer not null default 1,
  activo         boolean not null default true,
  notas          text,
  archivo_url    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_medicamentos_paciente_id on medicamentos(paciente_id);
create index if not exists idx_medicamentos_activo      on medicamentos(activo);

alter table medicamentos enable row level security;
create policy "medicamentos_select" on medicamentos for select using (true);
create policy "medicamentos_insert" on medicamentos for insert with check ((select auth.uid()) is not null);
create policy "medicamentos_update" on medicamentos for update using ((select auth.uid()) is not null);
create policy "medicamentos_delete" on medicamentos for delete using ((select auth.uid()) is not null);

-- ─── ENTREGAS_MEDICAMENTO ─────────────────────────────────────
create table if not exists entregas_medicamento (
  id               uuid primary key default uuid_generate_v4(),
  medicamento_id   uuid not null references medicamentos(id) on delete cascade,
  numero_entrega   integer not null,
  fecha_programada date,
  fecha_reclamada  date,
  estado           estado_entrega not null default 'pendiente',
  created_at       timestamptz not null default now()
);

create index if not exists idx_entregas_medicamento_id on entregas_medicamento(medicamento_id);

alter table entregas_medicamento enable row level security;
create policy "entregas_select" on entregas_medicamento for select using (true);
create policy "entregas_insert" on entregas_medicamento for insert with check ((select auth.uid()) is not null);
create policy "entregas_update" on entregas_medicamento for update using ((select auth.uid()) is not null);
create policy "entregas_delete" on entregas_medicamento for delete using ((select auth.uid()) is not null);

-- ─── EXAMENES ────────────────────────────────────────────────
create table if not exists examenes (
  id                              uuid primary key default uuid_generate_v4(),
  paciente_id                     uuid not null references miembros_familia(id) on delete cascade,
  acompanante_id                  uuid references miembros_familia(id) on delete set null,
  tipo                            tipo_examen not null default 'examen',
  nombre                          text not null,
  especialidad                    text,
  fecha_solicitud                 date,
  hora                            time,
  fecha_resultado                 date,
  lugar                           text,
  resultado                       text,
  estado                          estado_examen not null default 'pendiente',
  notas                           text,
  archivo_orden_url               text,
  archivo_resultado_url           text,
  fecha_realizacion               date,
  recordatorio_resultado_enviado  boolean not null default false,
  created_by                      uuid references auth.users(id) on delete set null,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

create index if not exists idx_examenes_paciente_id    on examenes(paciente_id);
create index if not exists idx_examenes_acompanante_id on examenes(acompanante_id);
create index if not exists idx_examenes_estado         on examenes(estado);
create index if not exists idx_examenes_fecha_solicitud on examenes(fecha_solicitud);

alter table examenes enable row level security;
create policy "examenes_select" on examenes for select using (true);
create policy "examenes_insert" on examenes for insert with check ((select auth.uid()) is not null);
create policy "examenes_update" on examenes for update using ((select auth.uid()) is not null);
create policy "examenes_delete" on examenes for delete using ((select auth.uid()) is not null);

-- ─── AUTORIZACIONES_EPS ──────────────────────────────────────
create table if not exists autorizaciones_eps (
  id                   uuid primary key default uuid_generate_v4(),
  paciente_id          uuid not null references miembros_familia(id) on delete cascade,
  descripcion          text not null,
  tipo                 tipo_autorizacion not null default 'examen',
  fecha_orden          date not null,
  estado               estado_autorizacion not null default 'sin_gestionar',
  fecha_envio_eps      date,
  numero_autorizacion  text,
  fecha_autorizacion   date,
  notas                text,
  cita_id              uuid references citas(id) on delete set null,
  examen_id            uuid references examenes(id) on delete set null,
  created_by           uuid references auth.users(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_autorizaciones_paciente_id on autorizaciones_eps(paciente_id);
create index if not exists idx_autorizaciones_estado      on autorizaciones_eps(estado);
create index if not exists idx_autorizaciones_fecha_orden on autorizaciones_eps(fecha_orden);

alter table autorizaciones_eps enable row level security;
create policy "autorizaciones_select" on autorizaciones_eps for select using (true);
create policy "autorizaciones_insert" on autorizaciones_eps for insert with check ((select auth.uid()) is not null);
create policy "autorizaciones_update" on autorizaciones_eps for update using ((select auth.uid()) is not null);
create policy "autorizaciones_delete" on autorizaciones_eps for delete using ((select auth.uid()) is not null);

-- ─── STORAGE BUCKET ──────────────────────────────────────────
-- Crear en Supabase dashboard: Storage > New bucket > "documentos-medicos" > Private
-- O via SQL (requiere extensión storage):
-- insert into storage.buckets (id, name, public) values ('documentos-medicos', 'documentos-medicos', false);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_miembros_updated_at
  before update on miembros_familia
  for each row execute function handle_updated_at();

create or replace trigger trg_citas_updated_at
  before update on citas
  for each row execute function handle_updated_at();

create or replace trigger trg_medicamentos_updated_at
  before update on medicamentos
  for each row execute function handle_updated_at();

create or replace trigger trg_examenes_updated_at
  before update on examenes
  for each row execute function handle_updated_at();

create or replace trigger trg_autorizaciones_updated_at
  before update on autorizaciones_eps
  for each row execute function handle_updated_at();
