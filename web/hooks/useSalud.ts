"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MiembroFamilia, Cita, Medicamento, Examen } from "@/lib/supabase/types";

export function calcularEdad(fechaNacimiento: string | null): number | null {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export function useMiembros() {
  const [miembros, setMiembros] = useState<MiembroFamilia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("miembros_familia")
      .select("*")
      .eq("activo", true)
      .order("created_at");
    setMiembros(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { miembros, loading, refresh: fetch };
}

export function useCitasProximas(limit = 5) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("citas")
      .select("*, paciente:paciente_id(*), acompanante:acompanante_id(*)")
      .gte("fecha_hora", new Date().toISOString())
      .eq("estado", "pendiente")
      .order("fecha_hora")
      .limit(limit);
    setCitas(data ?? []);
    setLoading(false);
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);
  return { citas, loading, refresh: fetch };
}

export function useCitasMiembro(miembroId: string) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("citas")
      .select("*, paciente:paciente_id(*), acompanante:acompanante_id(*)")
      .eq("paciente_id", miembroId)
      .order("fecha_hora", { ascending: false });
    setCitas(data ?? []);
    setLoading(false);
  }, [miembroId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { citas, loading, refresh: fetch };
}

export function useMedicamentosMiembro(miembroId: string) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("medicamentos")
      .select("*")
      .eq("paciente_id", miembroId)
      .order("activo", { ascending: false })
      .order("nombre");
    setMedicamentos(data ?? []);
    setLoading(false);
  }, [miembroId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { medicamentos, loading, refresh: fetch };
}

export function useAbuelaData() {
  const [abuelaId, setAbuelaId] = useState<string | null>(null);
  const [abuela, setAbuela] = useState<MiembroFamilia | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data: abuelaData } = await supabase
      .from("miembros_familia")
      .select("*")
      .eq("rol", "abuela")
      .single();
    if (!abuelaData) { setLoading(false); return; }
    setAbuelaId(abuelaData.id);
    setAbuela(abuelaData);

    const [{ data: c }, { data: m }, { data: e }] = await Promise.all([
      supabase
        .from("citas")
        .select("*, paciente:paciente_id(*), acompanante:acompanante_id(*)")
        .eq("paciente_id", abuelaData.id)
        .or("estado.eq.por_agendar,estado.eq.pendiente,estado.eq.completada")
        .order("fecha_hora", { ascending: true, nullsFirst: true })
        .limit(40),
      supabase
        .from("medicamentos")
        .select("*, entregas_medicamento(*)")
        .eq("paciente_id", abuelaData.id)
        .order("activo", { ascending: false })
        .order("nombre"),
      supabase
        .from("examenes")
        .select("*")
        .eq("paciente_id", abuelaData.id)
        .order("fecha_solicitud", { ascending: true, nullsFirst: true })
        .limit(50),
    ]);
    setCitas(c ?? []);
    setMedicamentos(m ?? []);
    setExamenes(e ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const marcarEntregaReclamada = useCallback(async (entregaId: string) => {
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];
    await supabase
      .from("entregas_medicamento")
      .update({ estado: "reclamada", fecha_reclamada: hoy })
      .eq("id", entregaId);
    // Actualizar estado local sin refetch completo
    setMedicamentos(prev => prev.map(med => ({
      ...med,
      entregas_medicamento: med.entregas_medicamento?.map(e =>
        e.id === entregaId
          ? { ...e, estado: "reclamada" as const, fecha_reclamada: hoy }
          : e
      ),
    })));
  }, []);

  return { abuelaId, abuela, citas, medicamentos, examenes, loading, refresh: cargar, marcarEntregaReclamada };
}

export function useExamenesMiembro(miembroId: string) {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("examenes")
      .select("*")
      .eq("paciente_id", miembroId)
      .order("fecha_solicitud", { ascending: false });
    setExamenes(data ?? []);
    setLoading(false);
  }, [miembroId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { examenes, loading, refresh: fetch };
}
