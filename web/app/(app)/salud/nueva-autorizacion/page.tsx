"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Shield, Check, Calendar, FlaskConical, Pencil, ChevronRight, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useMiembros } from "@/hooks/useSalud";
import type { Cita, Examen, TipoAutorizacion } from "@/lib/supabase/types";

type Modo = "seleccionar" | "cita" | "examen" | "formulario";

function diasRestantes(fechaOrden: string, vigenciaDias = 120): number {
  const venc = new Date(fechaOrden + "T12:00:00");
  venc.setDate(venc.getDate() + vigenciaDias);
  return Math.ceil((venc.getTime() - Date.now()) / 86400000);
}

function vencimientoTexto(fechaOrden: string, vigenciaDias = 120) {
  const dias = diasRestantes(fechaOrden, vigenciaDias);
  const fecha = new Date(fechaOrden + "T12:00:00");
  fecha.setDate(fecha.getDate() + vigenciaDias);
  const fechaStr = fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
  if (dias <= 0) return { txt: "Esta orden ya venció", color: "#c62828" };
  if (dias <= 15) return { txt: `🔴 Vence en ${dias}d (${fechaStr}) — ¡urgente!`, color: "#c62828" };
  if (dias <= 30) return { txt: `⚠️ Vence en ${dias}d (${fechaStr})`, color: "#e65100" };
  return { txt: `Vence en ${dias}d (${fechaStr})`, color: "#2e7d32" };
}

function NuevaAutorizacionContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { miembros } = useMiembros();

  const [modo, setModo]         = useState<Modo>("seleccionar");
  const [citas, setCitas]       = useState<Cita[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);

  const [form, setForm] = useState({
    paciente_id:     params.get("paciente") ?? "",
    descripcion:     "",
    tipo:            "examen" as TipoAutorizacion,
    fecha_orden:     "",
    vigencia_dias:   "120",
    estado:          "sin_gestionar",
    fecha_envio_eps: "",
    notas:           "",
    cita_id:         null as string | null,
    examen_id:       null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);

  useEffect(() => {
    if (!form.paciente_id) {
      const abuela = miembros.find(m => m.rol === "abuela");
      if (abuela) setForm(f => ({ ...f, paciente_id: abuela.id }));
    }
  }, [miembros, form.paciente_id]);

  useEffect(() => {
    if (modo !== "cita" && modo !== "examen") return;
    const supabase = createClient();
    if (modo === "cita") {
      supabase.from("citas")
        .select("*")
        .in("estado", ["pendiente", "por_agendar"])
        .order("fecha_hora", { ascending: true })
        .then(({ data }) => setCitas(data ?? []));
    } else {
      supabase.from("examenes")
        .select("*")
        .in("estado", ["pendiente", "en_proceso"])
        .order("created_at", { ascending: false })
        .then(({ data }) => setExamenes(data ?? []));
    }
  }, [modo]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const seleccionarCita = (cita: Cita) => {
    setForm(f => ({ ...f, cita_id: cita.id, examen_id: null, descripcion: cita.especialidad, tipo: "cita" }));
    setModo("formulario");
  };

  const seleccionarExamen = (examen: Examen) => {
    const tipoMap: Record<string, TipoAutorizacion> = {
      laboratorio: "laboratorio", examen: "examen", procedimiento: "procedimiento",
    };
    setForm(f => ({ ...f, examen_id: examen.id, cita_id: null, descripcion: examen.nombre, tipo: tipoMap[examen.tipo] ?? "examen" }));
    setModo("formulario");
  };

  const irManual = () => {
    setForm(f => ({ ...f, cita_id: null, examen_id: null }));
    setModo("formulario");
  };

  const handleSave = async () => {
    if (!form.paciente_id || !form.descripcion || !form.fecha_orden) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("autorizaciones_eps").insert({
      paciente_id:     form.paciente_id,
      descripcion:     form.descripcion,
      tipo:            form.tipo,
      fecha_orden:     form.fecha_orden,
      vigencia_dias:   parseInt(form.vigencia_dias) || 120,
      estado:          form.estado,
      fecha_envio_eps: form.fecha_envio_eps || null,
      notas:           form.notas || null,
      cita_id:         form.cita_id,
      examen_id:       form.examen_id,
      created_by:      user?.id ?? null,
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => router.push("/salud/autorizaciones"), 1200);
  };

  const valido  = form.paciente_id && form.descripcion.trim() && form.fecha_orden;
  const venc    = form.fecha_orden ? vencimientoTexto(form.fecha_orden, parseInt(form.vigencia_dias) || 120) : null;
  const citaVinculada   = form.cita_id   ? citas.find(c => c.id === form.cita_id)     : null;
  const examenVinculado = form.examen_id ? examenes.find(e => e.id === form.examen_id) : null;

  return (
    <div className="min-h-dvh bg-background pb-32 max-w-md mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-5" style={{ background: "#F2C5CE" }}>
        <button onClick={() => modo === "seleccionar" ? router.back() : setModo("seleccionar")}
          className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>
            {modo === "seleccionar" ? "Autorizaciones" : "Atrás"}
          </span>
        </button>
        <div className="flex items-center gap-3">
          <Shield size={20} color="#C0546A" strokeWidth={2.5} />
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Nueva orden</h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: "#C0546A" }}>
              {modo === "seleccionar" ? "Registrar para gestionar con la EPS"
                : modo === "cita"    ? "Elige la cita relacionada"
                : modo === "examen"  ? "Elige el examen relacionado"
                : "Completa los datos de la orden"}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* Paso 1 — elegir modo */}
        {modo === "seleccionar" && (
          <motion.div key="seleccionar"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground mb-1">
              ¿Esta autorización está relacionada con algo ya registrado en la app?
            </p>

            <button onClick={() => setModo("cita")}
              className="flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98]"
              style={{ borderColor: "#C0546A", background: "#FDF2F4" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F2C5CE" }}>
                <Calendar size={18} color="#C0546A" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">Sí, es para una cita médica</p>
                <p className="text-xs text-muted-foreground mt-0.5">Vincular a una cita ya registrada</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>

            <button onClick={() => setModo("examen")}
              className="flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98]"
              style={{ borderColor: "#9B8EC4", background: "#F5F3FF" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EDE9F7" }}>
                <FlaskConical size={18} color="#9B8EC4" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">Sí, es para un examen o procedimiento</p>
                <p className="text-xs text-muted-foreground mt-0.5">Vincular a un examen ya registrado</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>

            <button onClick={irManual}
              className="flex items-center gap-3 rounded-2xl border-2 border-border px-4 py-4 text-left transition-all active:scale-[0.98] bg-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-secondary">
                <Pencil size={18} className="text-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground">No, es una orden nueva</p>
                <p className="text-xs text-muted-foreground mt-0.5">Escribir los datos manualmente</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          </motion.div>
        )}

        {/* Paso 2a — lista de citas */}
        {modo === "cita" && (
          <motion.div key="cita"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-4 flex flex-col gap-2">
            {citas.length === 0 ? (
              <div className="rounded-2xl p-8 text-center border border-dashed mt-2"
                style={{ background: "#FDF2F4", borderColor: "#F2C5CE" }}>
                <Calendar size={28} className="mx-auto mb-2" color="#C0546A" />
                <p className="text-sm font-semibold text-foreground">No hay citas activas</p>
                <p className="text-xs text-muted-foreground mt-1">Registra primero la cita en la app</p>
              </div>
            ) : citas.map(cita => {
              const fh = cita.fecha_hora
                ? new Date(cita.fecha_hora).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })
                : null;
              return (
                <button key={cita.id} onClick={() => seleccionarCita(cita)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-all active:scale-[0.98] hover:border-[#C0546A] hover:shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F2C5CE" }}>
                    <Calendar size={16} color="#C0546A" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{cita.especialidad}</p>
                    {fh
                      ? <div className="flex items-center gap-1 mt-0.5"><Clock size={11} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">{fh}</span></div>
                      : <p className="text-xs text-muted-foreground mt-0.5">Sin fecha asignada</p>}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Paso 2b — lista de exámenes */}
        {modo === "examen" && (
          <motion.div key="examen"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-4 flex flex-col gap-2">
            {examenes.length === 0 ? (
              <div className="rounded-2xl p-8 text-center border border-dashed mt-2"
                style={{ background: "#F5F3FF", borderColor: "#EDE9F7" }}>
                <FlaskConical size={28} className="mx-auto mb-2" color="#9B8EC4" />
                <p className="text-sm font-semibold text-foreground">No hay exámenes activos</p>
                <p className="text-xs text-muted-foreground mt-1">Registra primero el examen en la app</p>
              </div>
            ) : examenes.map(examen => {
              const tipoLabel: Record<string, string> = { laboratorio: "🧪 Lab", examen: "🔬 Examen", procedimiento: "⚕️ Proc" };
              return (
                <button key={examen.id} onClick={() => seleccionarExamen(examen)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-all active:scale-[0.98] hover:border-[#9B8EC4] hover:shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EDE9F7" }}>
                    <FlaskConical size={16} color="#9B8EC4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{examen.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tipoLabel[examen.tipo] ?? examen.tipo}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Paso 3 — formulario */}
        {modo === "formulario" && (
          <motion.div key="formulario"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-5 flex flex-col gap-5">

            {/* Chip de vinculación */}
            {(citaVinculada || examenVinculado) && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: citaVinculada ? "#FDF2F4" : "#F5F3FF" }}>
                <Shield size={13} color={citaVinculada ? "#C0546A" : "#9B8EC4"} />
                <p className="text-xs font-semibold" style={{ color: citaVinculada ? "#C0546A" : "#9B8EC4" }}>
                  Vinculada a: {citaVinculada ? citaVinculada.especialidad : examenVinculado!.nombre}
                </p>
              </div>
            )}

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground">¿Qué autorización es?</label>
              <Input
                placeholder="Ej: Ecocardiograma, Consulta Cardiología, Resonancia lumbar"
                value={form.descripcion}
                onChange={e => set("descripcion", e.target.value)}
                className="h-12 rounded-xl border-border bg-card"
              />
            </div>

            {/* Tipo — solo si es manual */}
            {!form.cita_id && !form.examen_id && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Tipo de orden</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "examen",        label: "🔬 Examen diagnóstico" },
                    { value: "laboratorio",   label: "🧪 Laboratorio" },
                    { value: "procedimiento", label: "⚕️ Procedimiento" },
                    { value: "cita",          label: "🏥 Cita con especialista" },
                  ] as const).map(t => (
                    <button key={t.value} type="button" onClick={() => set("tipo", t.value)}
                      className="rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-all"
                      style={form.tipo === t.value
                        ? { borderColor: "#C0546A", background: "#FDF2F4", color: "#C0546A", fontWeight: 700 }
                        : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fecha de la orden */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground">Fecha de la orden médica</label>
              <p className="text-xs text-muted-foreground -mt-0.5">El día que el médico escribió la orden.</p>
              <Input type="date" value={form.fecha_orden}
                onChange={e => set("fecha_orden", e.target.value)}
                className="h-12 rounded-xl border-border bg-card" />
              {venc && <p className="text-xs font-semibold" style={{ color: venc.color }}>{venc.txt}</p>}
            </div>

            {/* Vigencia */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground">Vigencia de la orden (días)</label>
              <p className="text-xs text-muted-foreground -mt-0.5">Cuántos días tiene de validez según lo que dice la orden. Lo más común es 120 días.</p>
              <Input type="number" min="1" max="365" value={form.vigencia_dias}
                onChange={e => set("vigencia_dias", e.target.value)}
                className="h-12 rounded-xl border-border bg-card" />
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground">¿En qué punto está?</label>
              {[
                { value: "sin_gestionar", label: "Tengo la orden pero aún no la envié a la EPS" },
                { value: "en_tramite",    label: "Ya la envié al módulo de autorizaciones de la EPS" },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => set("estado", opt.value)}
                  className="text-left rounded-xl border-2 px-3 py-2.5 text-sm transition-all"
                  style={form.estado === opt.value
                    ? { borderColor: "#C0546A", background: "#FDF2F4", color: "#C0546A", fontWeight: 600 }
                    : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className={`overflow-hidden transition-all duration-300 -mx-1 px-1 ${form.estado === "en_tramite" ? "max-h-28 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Fecha en que la enviaste</label>
                <Input type="date" value={form.fecha_envio_eps}
                  onChange={e => set("fecha_envio_eps", e.target.value)}
                  className="h-12 rounded-xl border-border bg-card" />
              </div>
            </div>

            {/* Notas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground">Notas (opcional)</label>
              <textarea
                placeholder="Número de radicado, médico que firmó, observaciones..."
                value={form.notas}
                onChange={e => set("notas", e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>

            <button onClick={handleSave} disabled={!valido || saving || done}
              className="w-full h-14 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: done ? "#22c55e" : "#C0546A" }}>
              {done ? <><Check size={20} strokeWidth={2.5} /> Orden guardada</>
                : saving ? "Guardando…"
                : <><Shield size={18} /> Guardar orden</>}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default function NuevaAutorizacionPage() {
  return (
    <Suspense>
      <NuevaAutorizacionContent />
    </Suspense>
  );
}
