"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Pill, FileText, Upload, Trash2, ExternalLink,
  Check, Package, X, Plus, Minus, Calendar, RotateCcw, Clock,
  Edit3, ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { uploadArchivoMedicamento, getUrlDocumento, deleteDocumento } from "@/lib/supabase/storage";
import { NotasSeguimiento } from "@/components/ui/notas-seguimiento";
import type { Medicamento, EntregaMedicamento } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function formatFechaCorta(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function esVencida(fecha: string | null) {
  if (!fecha) return false;
  return new Date(fecha + "T23:59:59") < new Date();
}

const ACCENT = "#2E7D6A";

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  activo:   { label: "Activo",   color: ACCENT,     bg: "#E8F5E9" },
  inactivo: { label: "Inactivo", color: "#757575",  bg: "#F5F5F5" },
};

export default function MedicamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [med, setMed] = useState<Medicamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFormula, setUploadingFormula] = useState(false);

  // Deshacer entrega
  const [confirmDeshacerId, setConfirmDeshacerId] = useState<string | null>(null);

  // Editar fecha de entrega inline
  const [editandoEntregaId, setEditandoEntregaId] = useState<string | null>(null);
  const [editandoTipoFecha, setEditandoTipoFecha] = useState<"programada" | "reclamada">("programada");
  const [fechaEditEntrega, setFechaEditEntrega] = useState("");
  const [savingFechaEntrega, setSavingFechaEntrega] = useState(false);

  // ClickUp-style inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEstadoMenu, setShowEstadoMenu] = useState(false);
  const [nuevaHora, setNuevaHora] = useState("");
  const [editForm, setEditForm] = useState({
    nombre: "",
    dosis: "",
    frecuencia: "",
    horas_toma: [] as string[],
    fecha_inicio: "",
    notas: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("medicamentos")
      .select("*, entregas_medicamento(*), paciente:paciente_id(*)")
      .eq("id", id)
      .single();
    setMed(data);
    if (data) {
      setEditForm({
        nombre: data.nombre ?? "",
        dosis: data.dosis ?? "",
        frecuencia: data.frecuencia ?? "",
        horas_toma: data.horas_toma ?? [],
        fecha_inicio: data.fecha_inicio ?? "",
        notas: data.notas ?? "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleUpload = async (file: File) => {
    if (!med) return;
    setUploadingFormula(true);
    const path = await uploadArchivoMedicamento(file, med.id);
    if (path) {
      const supabase = createClient();
      await supabase.from("medicamentos").update({ archivo_url: path }).eq("id", med.id);
      await cargar();
    }
    setUploadingFormula(false);
  };

  const handleDelete = async () => {
    if (!med?.archivo_url) return;
    await deleteDocumento(med.archivo_url);
    const supabase = createClient();
    await supabase.from("medicamentos").update({ archivo_url: null }).eq("id", med.id);
    await cargar();
  };

  const abrirFormula = async () => {
    if (!med?.archivo_url) return;
    const url = await getUrlDocumento(med.archivo_url);
    if (url) window.open(url, "_blank");
  };

  const handleCambiarEstado = async (activo: boolean) => {
    setShowEstadoMenu(false);
    if (!med) return;
    const supabase = createClient();
    await supabase.from("medicamentos").update({ activo }).eq("id", med.id);
    setMed(m => m ? { ...m, activo } : m);
  };

  const marcarEntrega = async (entregaId: string) => {
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];
    await supabase.from("entregas_medicamento")
      .update({ estado: "reclamada", fecha_reclamada: hoy })
      .eq("id", entregaId);
    await cargar();
  };

  const deshacerEntrega = async (entregaId: string) => {
    const supabase = createClient();
    await supabase.from("entregas_medicamento")
      .update({ estado: "pendiente", fecha_reclamada: null })
      .eq("id", entregaId);
    setConfirmDeshacerId(null);
    await cargar();
  };

  const abrirEditFecha = (entrega: EntregaMedicamento, tipo: "programada" | "reclamada") => {
    setEditandoEntregaId(entrega.id);
    setEditandoTipoFecha(tipo);
    setFechaEditEntrega(tipo === "programada" ? (entrega.fecha_programada ?? "") : (entrega.fecha_reclamada ?? ""));
  };

  const handleGuardarFechaEntrega = async () => {
    if (!editandoEntregaId) return;
    setSavingFechaEntrega(true);
    const supabase = createClient();
    const campo = editandoTipoFecha === "programada" ? "fecha_programada" : "fecha_reclamada";
    await supabase.from("entregas_medicamento")
      .update({ [campo]: fechaEditEntrega || null })
      .eq("id", editandoEntregaId);
    setEditandoEntregaId(null);
    setSavingFechaEntrega(false);
    await cargar();
  };

  const agregarHora = () => {
    const h = nuevaHora.trim();
    if (h && !editForm.horas_toma.includes(h)) {
      setEditForm(f => ({ ...f, horas_toma: [...f.horas_toma, h].sort() }));
    }
    setNuevaHora("");
  };

  const quitarHora = (h: string) => {
    setEditForm(f => ({ ...f, horas_toma: f.horas_toma.filter(x => x !== h) }));
  };

  const handleEliminar = async () => {
    if (!med) return;
    setDeleting(true);
    const supabase = createClient();
    if (med.archivo_url) await deleteDocumento(med.archivo_url);
    await supabase.from("medicamentos").delete().eq("id", id);
    router.back();
  };

  const handleGuardarEdicion = async () => {
    if (!med || !editForm.nombre.trim()) return;
    setSavingEdit(true);
    const supabase = createClient();
    await supabase.from("medicamentos").update({
      nombre: editForm.nombre.trim(),
      dosis: editForm.dosis.trim() || null,
      frecuencia: editForm.frecuencia.trim() || null,
      horas_toma: editForm.horas_toma.length > 0 ? editForm.horas_toma : null,
      fecha_inicio: editForm.fecha_inicio || null,
      notas: editForm.notas.trim() || null,
    }).eq("id", id);
    setSavingEdit(false);
    setSavedEdit(true);
    setEditingField(null);
    await cargar();
    setTimeout(() => setSavedEdit(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background pb-20 max-w-lg md:max-w-2xl mx-auto pt-6 px-4 flex flex-col gap-3">
        <Skeleton className="h-8 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-2/3 rounded-lg" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  if (!med) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Medicamento no encontrado</p>
        <button onClick={() => router.back()} className="text-sm text-primary underline">Volver</button>
      </div>
    );
  }

  const entregas = (med.entregas_medicamento ?? []).sort((a, b) => a.numero_entrega - b.numero_entrega);
  const reclamadas = entregas.filter(e => e.estado === "reclamada").length;
  const estadoCfg = ESTADO_CONFIG[med.activo ? "activo" : "inactivo"];

  return (
    <div className="min-h-dvh bg-background pb-24" onClick={() => showEstadoMenu && setShowEstadoMenu(false)}>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 shrink-0">
            <ArrowLeft size={18} style={{ color: ACCENT }} strokeWidth={2.5} />
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Salud</span>
          </button>

          <div className="relative" onClick={e => e.stopPropagation()}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEstadoMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: estadoCfg.bg, color: estadoCfg.color }}
            >
              {estadoCfg.label}
              <ChevronDown size={11} strokeWidth={2.5} />
            </motion.button>
            <AnimatePresence>
              {showEstadoMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-30 min-w-[140px]"
                >
                  {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => handleCambiarEstado(key === "activo")}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-muted/60 transition-colors text-left"
                      style={{ color: cfg.color }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                      {cfg.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Title block */}
        <div className="pt-5 pb-2">
          <p className="text-[11px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5" style={{ color: ACCENT }}>
            <Pill size={12} strokeWidth={2.5} />MEDICAMENTO
          </p>
          {editingField === "nombre" ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={editForm.nombre}
                onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre del medicamento"
                className="text-xl font-extrabold h-11 rounded-xl border-border bg-card flex-1"
                onKeyDown={e => {
                  if (e.key === "Enter") handleGuardarEdicion();
                  if (e.key === "Escape") setEditingField(null);
                }}
              />
              <button onClick={handleGuardarEdicion}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ background: ACCENT }}>
                <Check size={15} />
              </button>
              <button onClick={() => setEditingField(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-border shrink-0">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingField("nombre")} className="text-left group flex items-start gap-2 w-full">
              <h1 className="text-2xl font-extrabold text-foreground leading-tight">{med.nombre}</h1>
              <Edit3 size={14} className="mt-2 opacity-0 group-hover:opacity-30 transition-opacity text-muted-foreground shrink-0" />
            </button>
          )}
        </div>

        {savedEdit && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg"
            style={{ background: "#E8F5E9" }}
          >
            <Check size={13} color="#2e7d32" strokeWidth={2.5} />
            <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Guardado</p>
          </motion.div>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start mt-2">
          <div className="flex flex-col gap-3 mb-6 lg:mb-0">

          {/* Properties card */}
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Detalles</p>
            <div className="-mx-1 flex flex-col divide-y divide-border">

              {/* Dosis */}
              <PropRow
                icon={Pill}
                label="Dosis"
                value={med.dosis || undefined}
                placeholder="Sin dosis"
                isEditing={editingField === "dosis"}
                onStartEdit={() => setEditingField("dosis")}
                onSave={handleGuardarEdicion}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  autoFocus
                  value={editForm.dosis}
                  onChange={e => setEditForm(f => ({ ...f, dosis: e.target.value }))}
                  placeholder="Ej: 1 tableta, 5ml"
                  className="h-9 rounded-lg flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion(); if (e.key === "Escape") setEditingField(null); }}
                />
              </PropRow>

              {/* Frecuencia */}
              <PropRow
                icon={Clock}
                label="Frecuencia"
                value={med.frecuencia || undefined}
                placeholder="Sin frecuencia"
                isEditing={editingField === "frecuencia"}
                onStartEdit={() => setEditingField("frecuencia")}
                onSave={handleGuardarEdicion}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  autoFocus
                  value={editForm.frecuencia}
                  onChange={e => setEditForm(f => ({ ...f, frecuencia: e.target.value }))}
                  placeholder="Ej: Cada 8 horas, Una vez al día"
                  className="h-9 rounded-lg flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion(); if (e.key === "Escape") setEditingField(null); }}
                />
              </PropRow>

              {/* Horarios de toma */}
              <PropRow
                icon={Clock}
                label="Horarios"
                value={med.horas_toma && med.horas_toma.length > 0 ? med.horas_toma.join(", ") : undefined}
                placeholder="Sin horarios"
                isEditing={editingField === "horas_toma"}
                onStartEdit={() => setEditingField("horas_toma")}
                onSave={handleGuardarEdicion}
                onCancel={() => setEditingField(null)}
              >
                <div className="flex flex-col gap-2 w-full">
                  {editForm.horas_toma.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {editForm.horas_toma.map(h => (
                        <span key={h} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: "#B8E2D4", color: ACCENT }}>
                          {h}
                          <button type="button" onClick={() => quitarHora(h)} className="ml-0.5">
                            <Minus size={10} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={nuevaHora}
                      onChange={e => setNuevaHora(e.target.value)}
                      className="h-9 rounded-lg flex-1"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarHora(); } }}
                    />
                    <button type="button" onClick={agregarHora}
                      className="h-9 px-3 rounded-lg text-xs font-bold text-white flex items-center gap-1 shrink-0"
                      style={{ background: ACCENT }}>
                      <Plus size={13} />Agregar
                    </button>
                  </div>
                </div>
              </PropRow>

              {/* Fecha de inicio */}
              <PropRow
                icon={Calendar}
                label="Desde"
                value={med.fecha_inicio ? formatFechaCorta(med.fecha_inicio) : undefined}
                placeholder="Sin fecha"
                isEditing={editingField === "fecha_inicio"}
                onStartEdit={() => setEditingField("fecha_inicio")}
                onSave={handleGuardarEdicion}
                onCancel={() => setEditingField(null)}
              >
                <DatePicker
                  value={editForm.fecha_inicio}
                  onChange={val => setEditForm(f => ({ ...f, fecha_inicio: val }))}
                  className="rounded-lg border-border bg-card h-9 w-full"
                />
              </PropRow>

              {/* Notas */}
              <PropRow
                icon={FileText}
                label="Notas"
                value={med.notas || undefined}
                placeholder="Sin notas"
                isEditing={editingField === "notas"}
                onStartEdit={() => setEditingField("notas")}
                onSave={handleGuardarEdicion}
                onCancel={() => setEditingField(null)}
              >
                <Textarea
                  autoFocus
                  value={editForm.notas}
                  onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Indicaciones especiales, con qué tomarlo, etc."
                  rows={2}
                  className="rounded-lg text-sm resize-none flex-1"
                />
              </PropRow>

            </div>
          </div>

          {/* Entregas */}
          {entregas.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-muted-foreground" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Entregas · {reclamadas}/{entregas.length} reclamadas
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {entregas.map(entrega => {
                  const reclamada = entrega.estado === "reclamada";
                  const vencida = !reclamada && esVencida(entrega.fecha_programada);
                  const editando = editandoEntregaId === entrega.id;
                  const bg    = reclamada ? "#E8F5E9" : vencida ? "#FFF3E0" : "#F0FAF7";
                  const color = reclamada ? "#2e7d32" : vencida ? "#e65100" : ACCENT;
                  const fechaTexto = reclamada
                    ? (entrega.fecha_reclamada ? formatFechaCorta(entrega.fecha_reclamada) : "Reclamada")
                    : (entrega.fecha_programada ? formatFechaCorta(entrega.fecha_programada) : "Sin fecha");
                  return (
                    <div key={entrega.id}
                      className="flex flex-col gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: bg }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                          style={{ background: color + "22", color }}>
                          {entrega.numero_entrega}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color }}>
                            Entrega {entrega.numero_entrega} de {entregas.length}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {reclamada ? `Reclamada el ${fechaTexto}` : vencida ? `Vencida · ${fechaTexto}` : fechaTexto}
                          </p>
                        </div>
                        {!reclamada && !editando && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => abrirEditFecha(entrega, "programada")}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                              style={{ background: color + "22" }}
                              title="Editar fecha programada">
                              <Calendar size={13} style={{ color }} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => marcarEntrega(entrega.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                              style={{ background: ACCENT }}>
                              <Check size={11} strokeWidth={2.5} />Reclamar
                            </button>
                          </div>
                        )}
                        {reclamada && !editando && (
                          <div className="flex items-center gap-1.5">
                            {confirmDeshacerId === entrega.id ? (
                              <>
                                <button
                                  onClick={() => setConfirmDeshacerId(null)}
                                  className="text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-lg hover:bg-black/5 transition-colors">
                                  No
                                </button>
                                <button
                                  onClick={() => deshacerEntrega(entrega.id)}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white transition-all active:scale-95"
                                  style={{ background: "#e65100" }}>
                                  Sí, deshacer
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmDeshacerId(entrega.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                  style={{ background: "#2e7d3222" }}
                                  title="Deshacer entrega">
                                  <RotateCcw size={12} color="#2e7d32" strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => abrirEditFecha(entrega, "reclamada")}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                  style={{ background: "#2e7d3222" }}
                                  title="Editar fecha reclamada">
                                  <Calendar size={13} color="#2e7d32" strokeWidth={2.5} />
                                </button>
                                <Check size={15} color="#2e7d32" strokeWidth={2.5} />
                              </>
                            )}
                          </div>
                        )}
                        {editando && (
                          <button onClick={() => setEditandoEntregaId(null)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.08)" }}>
                            <X size={13} className="text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {editando && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 overflow-hidden">
                            <DatePicker
                              value={fechaEditEntrega}
                              onChange={val => setFechaEditEntrega(val)}
                              className="rounded-xl border-border bg-white text-sm flex-1"
                            />
                            <button
                              onClick={handleGuardarFechaEntrega}
                              disabled={savingFechaEntrega}
                              className="h-9 px-3 rounded-xl text-xs font-bold text-white flex items-center gap-1 disabled:opacity-60"
                              style={{ background: ACCENT }}>
                              {savingFechaEntrega ? "…" : <><Check size={12} strokeWidth={2.5} />Guardar</>}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fórmula / receta */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Fórmula médica</p>
            {med.archivo_url ? (
              <div className="rounded-xl border p-3 flex items-center gap-3"
                style={{ borderColor: `${ACCENT}30`, background: "#F0FAF7" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#B8E2D4" }}>
                  <FileText size={16} color={ACCENT} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: ACCENT }}>Fórmula guardada</p>
                  <p className="text-xs text-muted-foreground">PDF disponible</p>
                </div>
                <button onClick={abrirFormula}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white shrink-0"
                  style={{ background: ACCENT }}>
                  <ExternalLink size={10} />Ver
                </button>
                <button onClick={handleDelete}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors">
                  <Trash2 size={12} className="text-muted-foreground" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 cursor-pointer hover:border-primary transition-colors">
                <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
                  disabled={uploadingFormula}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                {uploadingFormula ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                      style={{ borderColor: "#B8E2D4", borderTopColor: ACCENT }} />
                    <p className="text-sm text-muted-foreground">Subiendo...</p>
                  </>
                ) : (
                  <>
                    <Upload size={15} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Subir fórmula médica</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG o PNG · máx. 10 MB</p>
                    </div>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Eliminar medicamento */}
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{ background: "#FFF0F0", color: "#c62828" }}
              >
                <Trash2 size={14} strokeWidth={2} />Eliminar medicamento
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 p-4 flex flex-col gap-3"
                style={{ borderColor: "#c62828", background: "#FFF0F0" }}
              >
                <p className="text-sm font-bold text-center" style={{ color: "#c62828" }}>¿Eliminar este medicamento?</p>
                <p className="text-xs text-center text-muted-foreground">Se borrará junto con su fórmula médica. No se puede deshacer.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={deleting}
                    className="flex-1 h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                    style={{ background: "#c62828" }}
                  >
                    <Trash2 size={13} />
                    {deleting ? "Eliminando…" : "Sí, eliminar"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          </div>

          {/* ── RIGHT: seguimiento ── */}
          <div className="flex flex-col gap-3 mt-4 lg:mt-0">
            <NotasSeguimiento medicamentoId={id} accentColor={ACCENT} accentBg="#E8F5E9" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline-editable property row ──
function PropRow({
  icon: Icon,
  label,
  value,
  placeholder,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  placeholder?: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-2 py-2.5 rounded-xl transition-colors",
        isEditing ? "bg-muted/60" : "hover:bg-muted/40 cursor-pointer group"
      )}
      onClick={() => !isEditing && onStartEdit()}
    >
      <Icon size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            {children}
            <div className="flex gap-1.5">
              <button
                onClick={e => { e.stopPropagation(); onSave(); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
                style={{ background: ACCENT }}
              >
                <Check size={12} />Guardar
              </button>
              <button
                onClick={e => { e.stopPropagation(); onCancel(); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground transition-all active:scale-95"
              >
                <X size={12} />Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn(
              "text-sm flex-1 min-w-0",
              value ? "text-foreground" : "text-muted-foreground italic"
            )}>
              {value || placeholder || "—"}
            </span>
            <Edit3 size={12} className="opacity-0 group-hover:opacity-30 transition-opacity text-muted-foreground shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
