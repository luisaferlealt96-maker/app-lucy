-- ============================================================
-- Notificaciones in-app
-- ============================================================

create type tipo_notificacion as enum (
  'recordatorio_wa',
  'reporte_cita',
  'autorizacion_aprobada',
  'autorizacion_por_vencer',
  'entrega_vencida'
);

create table if not exists notificaciones (
  id           uuid primary key default gen_random_uuid(),
  tipo         tipo_notificacion not null,
  titulo       text not null,
  mensaje      text,
  entidad_tipo text,
  entidad_id   uuid,
  leida        boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_notificaciones_leida      on notificaciones(leida);
create index if not exists idx_notificaciones_created_at on notificaciones(created_at desc);

alter table notificaciones enable row level security;
create policy "notificaciones_select" on notificaciones for select using (true);
create policy "notificaciones_insert" on notificaciones for insert with check ((select auth.uid()) is not null);
create policy "notificaciones_update" on notificaciones for update using ((select auth.uid()) is not null);
create policy "notificaciones_delete" on notificaciones for delete using ((select auth.uid()) is not null);
