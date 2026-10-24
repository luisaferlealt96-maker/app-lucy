-- Seguridad: ningún dato de la familia se puede leer sin iniciar sesión.
-- Se eliminan las políticas abiertas (using true) y las duplicadas; queda una por comando.

-- autorizaciones_eps
drop policy if exists "family can manage autorizaciones" on public.autorizaciones_eps;
drop policy if exists autorizaciones_select on public.autorizaciones_eps;
create policy autorizaciones_select on public.autorizaciones_eps for select to authenticated using ((select auth.uid()) is not null);

-- citas
drop policy if exists citas_select on public.citas;
-- (familia_lee_citas / familia_escribe_citas ya exigen sesión)

-- entregas_medicamento
drop policy if exists entregas_select on public.entregas_medicamento;

-- examenes
drop policy if exists examenes_select on public.examenes;

-- medicamentos
drop policy if exists medicamentos_select on public.medicamentos;

-- miembros_familia
drop policy if exists familia_select on public.miembros_familia;

-- notas_seguimiento
drop policy if exists auth_select on public.notas_seguimiento;
drop policy if exists auth_insert on public.notas_seguimiento;
drop policy if exists auth_update on public.notas_seguimiento;
drop policy if exists auth_delete on public.notas_seguimiento;
create policy notas_select on public.notas_seguimiento for select to authenticated using ((select auth.uid()) is not null);
create policy notas_insert on public.notas_seguimiento for insert to authenticated with check ((select auth.uid()) is not null);
create policy notas_update on public.notas_seguimiento for update to authenticated using ((select auth.uid()) is not null);
create policy notas_delete on public.notas_seguimiento for delete to authenticated using ((select auth.uid()) is not null);

-- notificaciones
drop policy if exists notificaciones_select on public.notificaciones;
create policy notificaciones_select on public.notificaciones for select to authenticated using ((select auth.uid()) is not null);
