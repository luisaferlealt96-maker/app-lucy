"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Pill, FileText, Upload, Trash2, ExternalLink,
  Check, Package, Circle, X, Pencil, Plus, Minus, Calendar, RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { uploadArchivoMedicamento, getUrlDocumento, deleteDocumento } from "@/lib/supabase/storage";
import type { Medicamento, EntregaMedicamento } from "@/lib/supabase/types";

function formatFechaCorta(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function esVencida(fecha: string | null) {
  if (!fecha) return false;
  return new Date(fecha + "T23:59:59") < new Date();
}

export default function MedicamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [med, setMed] = useState<Medicamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFormula, setUploadingFormula] = useState(false);
  const [togglingActivo, setTogglingActivo] = useState(false);

  // Deshacer entrega
  const [confirmDeshacerId, setConfirmDeshacerId] = useState<string | null>(null);

  // Editar fecha de entrega inline
  const [editandoEntregaId, setEditandoEntregaId] = useState<string | null>(null);
  const [editandoTipoFecha, setEditandoTipoFecha] = useState<"programada" | "reclamada">("programada");
  const [fechaEditEntrega, setFechaEditEntrega] = useState("");
  const [savingFechaEntrega, setSavingFechaEntrega] = useState(false);

  // Editar
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    dosis: "",
    frecuencia: "",
    horas_toma: [] as string[],
    fecha_inicio: "",
    notas: "",
  });
  const [nuevaHora, setNuevaHora] = useState("");
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

  const toggleActivo = async () => {
    if (!med) return;
    setTogglingActivo(true);
    const supabase = createClient();
    await supabase.from("medicamentos").update({ activo: !med.activo }).eq("id", med.id);
    await cargar();
    setTogglingActivo(false);
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
    if (!med || !editForm.nombre) return;
    setSavingEdit(true);
    const supabase = createClient();
    await supabase.from("medicamentos").update({
      nombre: editForm.nombre,
      dosis: editForm.dosis || null,
      frecuencia: editForm.frecuencia || null,
      horas_toma: editForm.horas_toma.length > 0 ? editForm.horas_toma : null,
      fecha_inicio: editForm.fecha_inicio || null,
      notas: editForm.notas || null,
    }).eq("id", id);
    setSavingEdit(false);
    setSavedEdit(true);
    setShowEdit(false);
    await cargar();
    setTimeout(() => setSavedEdit(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2E7D6A] border-t-transparent animate-spin" />
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

  return (
    <div className="min-h-dvh bg-background pb-20 max-w-lg md:max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-5" style={{ background: "#B8E2D4" }}>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#2E7D6A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#2E7D6A" }}>Salud</span>
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Pill size={16} color="#2E7D6A" strokeWidth={2.5} />
              <span className="text-xs font-bold tracking-wide" style={{ color: "#2E7D6A" }}>MEDICAMENTO</span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground leading-tight">{med.nombre}</h1>
            {med.dosis && <p className="text-sm text-muted-foreground mt-0.5">{med.dosis}</p>}
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.5)", color: "#2E7D6A" }}
            >
              <Pencil size={12} strokeWidth={2.5} />
              Editar
            </button>
            <button
              onClick={toggleActivo}
              disabled={togglingActivo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-60"
              style={med.activo
                ? { background: "#E8F5E9", color: "#2e7d32", borderColor: "#2e7d32" }
                : { background: "#f3f4f6", color: "#6b7280", borderColor: "#d1d5db" }}
            >
              <Circle size={7} fill="currentColor" color="currentColor" />
              {med.activo ? "Activo" : "Inactivo"}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {savedEdit && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ background: "#E8F5E9" }}>
            <Check size={15} color="#2e7d32" strokeWidth={2.5} />
            <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Medicamento actualizado</p>
          </motion.div>
        )}

        {/* Info */}
        {(med.frecuencia || (med.horas_toma && med.horas_toma.length > 0) || med.fecha_inicio || med.notas) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
            {med.frecuencia && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Frecuencia</p>
                <p className="text-sm font-semibold text-foreground">{med.frecuencia}</p>
              </div>
            )}
            {med.horas_toma && med.horas_toma.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Horario de toma</p>
                <div className="flex flex-wrap gap-1.5">
                  {med.horas_toma.map(h => (
                    <span key={h} className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "#B8E2D4", color: "#2E7D6A" }}>{h}</span>
                  ))}
                </div>
              </div>
            )}
            {med.fecha_inicio && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Desde</p>
                <p className="text-sm font-semibold text-foreground">{formatFechaCorta(med.fecha_inicio)}</p>
              </div>
            )}
            {med.notas && (
              <p className="text-sm text-muted-foreground border-t border-border pt-2.5 mt-0.5">{med.notas}</p>
            )}
          </motion.div>
        )}

        {/* Entregas */}
        {entregas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-muted-foreground" />
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Entregas · {reclamadas}/{entregas.length} reclamadas
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {entregas.map(entrega => {
                const reclamada = entrega.estado === "reclamada";
                const vencida = !reclamada && esVencida(entrega.fecha_programada);
                const editando = editandoEntregaId === entrega.id;
                const bg    = reclamada ? "#E8F5E9" : vencida ? "#FFF3E0" : "#F0FAF7";
                const color = reclamada ? "#2e7d32" : vencida ? "#e65100" : "#2E7D6A";
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
                            style={{ background: "#2E7D6A" }}>
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
                            style={{ background: "#2E7D6A" }}>
                            {savingFechaEntrega ? "…" : <><Check size={12} strokeWidth={2.5} />Guardar</>}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Fórmula / receta */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Fórmula médica</p>
          {med.archivo_url ? (
            <div className="rounded-2xl border-2 p-4 flex items-center gap-3"
              style={{ borderColor: "#2E7D6A40", background: "#F0FAF7" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#B8E2D4" }}>
                <FileText size={18} color="#2E7D6A" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "#2E7D6A" }}>Fórmula guardada</p>
                <p className="text-xs text-muted-foreground">PDF disponible</p>
              </div>
              <button onClick={abrirFormula}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                style={{ background: "#2E7D6A" }}>
                <ExternalLink size={12} />Ver PDF
              </button>
              <button onClick={handleDelete}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/10 transition-colors ml-1">
                <Trash2 size={14} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-4 py-3.5 cursor-pointer hover:border-[#2E7D6A] transition-colors">
              <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
                disabled={uploadingFormula}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              {uploadingFormula ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                    style={{ borderColor: "#B8E2D4", borderTopColor: "#2E7D6A" }} />
                  <p className="text-sm font-semibold text-muted-foreground">Subiendo...</p>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Subir fórmula médica</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG o PNG · máx. 10 MB</p>
                  </div>
                </>
              )}
            </label>
          )}
        </motion.div>

        {/* Eliminar medicamento */}
        <div className="pt-2 pb-2">
          <AnimatePresence mode="wait">
            {!confirmDelete ? (
              <motion.button
                key="btn-delete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-red-600 transition-colors"
              >
                <Trash2 size={15} />
                Eliminar medicamento
              </motion.button>
            ) : (
              <motion.div
                key="confirm-delete"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="rounded-2xl border-2 p-4 flex flex-col gap-3"
                style={{ borderColor: "#c6282840", background: "#fff5f5" }}
              >
                <p className="text-sm font-semibold text-foreground">¿Eliminar este medicamento?</p>
                <p className="text-xs text-muted-foreground">Se borrará permanentemente junto con su fórmula médica.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-10 rounded-xl text-sm font-bold border border-border bg-background"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={deleting}
                    className="flex-1 h-10 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-1.5"
                    style={{ background: "#c62828" }}
                  >
                    {deleting ? "Eliminando…" : <><Trash2 size={14} /> Sí, eliminar</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom sheet: Editar medicamento ── */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg md:max-w-2xl mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">Editar medicamento</h2>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Nombre del medicamento</label>
                <Input
                  placeholder="Ej: Metformina 850mg"
                  value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Dosis */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Dosis (opcional)</label>
                <Input
                  placeholder="Ej: 1 tableta, 5ml"
                  value={editForm.dosis}
                  onChange={e => setEditForm(f => ({ ...f, dosis: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Frecuencia */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Frecuencia (opcional)</label>
                <Input
                  placeholder="Ej: Cada 8 horas, Una vez al día"
                  value={editForm.frecuencia}
                  onChange={e => setEditForm(f => ({ ...f, frecuencia: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Horas de toma */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Horarios de toma (opcional)</label>
                {editForm.horas_toma.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editForm.horas_toma.map(h => (
                      <span key={h} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#B8E2D4", color: "#2E7D6A" }}>
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
                    className="rounded-xl border-border bg-card h-11 flex-1"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); agregarHora(); } }}
                  />
                  <button type="button" onClick={agregarHora}
                    className="h-11 px-3 rounded-xl text-xs font-bold text-white flex items-center gap-1"
                    style={{ background: "#2E7D6A" }}>
                    <Plus size={14} />Agregar
                  </button>
                </div>
              </div>

              {/* Fecha inicio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Fecha de inicio (opcional)</label>
                <DatePicker
                  value={editForm.fecha_inicio}
                  onChange={val => setEditForm(f => ({ ...f, fecha_inicio: val }))}
                  className="rounded-xl border-border bg-card"
                />
              </div>

              {/* Notas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Notas (opcional)</label>
                <Textarea
                  placeholder="Indicaciones especiales, con qué tomarlo, etc."
                  value={editForm.notas}
                  onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                  rows={3}
                  className="rounded-xl border-border resize-none text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleGuardarEdicion}
                disabled={!editForm.nombre || savingEdit}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#2E7D6A" }}
              >
                {savingEdit ? "Guardando…" : <><Check size={16} strokeWidth={2.5} /> Guardar cambios</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
