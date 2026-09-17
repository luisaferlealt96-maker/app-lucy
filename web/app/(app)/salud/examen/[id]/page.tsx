"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, FileText, Upload, Trash2,
  MapPin, Calendar, Check, ExternalLink, Clock, X, Shield, User, Bell,
  Building2, Phone, Edit3, ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { uploadDocumentoMedico, getUrlDocumento, deleteDocumento } from "@/lib/supabase/storage";
import { NotasSeguimiento } from "@/components/ui/notas-seguimiento";
import type { Examen, AutorizacionEPS, MiembroFamilia } from "@/lib/supabase/types";
import { useMiembros } from "@/hooks/useSalud";
import { cn } from "@/lib/utils";

const TIPO_LABEL: Record<string, string> = {
  laboratorio: "Laboratorio",
  examen: "Examen diagnóstico",
  procedimiento: "Procedimiento",
};

const ACCENT = "#9B8EC4";

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente",  color: "#e65100", bg: "#FFF3E0" },
  listo:     { label: "Realizado",  color: "#2e7d32", bg: "#E8F5E9" },
};

export default function ExamenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingOrden, setUploadingOrden] = useState(false);
  const [uploadingResultado, setUploadingResultado] = useState(false);
  const [notificando, setNotificando] = useState(false);
  const [notificado, setNotificado] = useState(false);
  const { miembros } = useMiembros();

  // ClickUp-style inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEstadoMenu, setShowEstadoMenu] = useState(false);

  // Agregar autorización rápida
  const [showAddAuth, setShowAddAuth] = useState(false);
  const [addAuthForm, setAddAuthForm] = useState({ numero: "", nombre_prestador: "", telefono_prestador: "" });
  const [savingAuth, setSavingAuth] = useState(false);
  const [editForm, setEditForm] = useState<{
    nombre: string;
    tipo: "laboratorio" | "examen" | "procedimiento";
    especialidad: string;
    fecha_solicitud: string;
    hora: string;
    lugar: string;
    acompanante_id: string | null;
    notas: string;
  }>({
    nombre: "",
    tipo: "examen",
    especialidad: "",
    fecha_solicitud: "",
    hora: "",
    lugar: "",
    acompanante_id: null,
    notas: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [authVinculada, setAuthVinculada] = useState<AutorizacionEPS | null>(null);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const [{ data }, { data: auths }] = await Promise.all([
      supabase.from("examenes").select("*, acompanante:acompanante_id(*)").eq("id", id).single(),
      supabase.from("autorizaciones_eps").select("*").eq("examen_id", id),
    ]);
    setExamen(data);
    const authAprobada = (auths ?? []).find((a: AutorizacionEPS) => a.estado === "autorizada" && a.numero_autorizacion);
    setAuthVinculada(authAprobada ?? null);
    if (data) {
      setEditForm({
        nombre: data.nombre ?? "",
        tipo: data.tipo ?? "examen",
        especialidad: data.especialidad ?? "",
        fecha_solicitud: data.fecha_solicitud ?? "",
        hora: data.hora ? data.hora.slice(0, 5) : "",
        lugar: data.lugar ?? "",
        acompanante_id: data.acompanante_id ?? "",
        notas: data.notas ?? "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleUpload = async (file: File, tipo: "orden" | "resultado") => {
    if (!examen) return;
    tipo === "orden" ? setUploadingOrden(true) : setUploadingResultado(true);
    const path = await uploadDocumentoMedico(file, examen.id, tipo);
    if (path) {
      const supabase = createClient();
      const field = tipo === "orden" ? "archivo_orden_url" : "archivo_resultado_url";
      const updates: Record<string, string | null> = { [field]: path };
      if (tipo === "resultado" && examen.estado !== "listo") updates.estado = "listo";
      await supabase.from("examenes").update(updates).eq("id", examen.id);
      await cargar();
    }
    tipo === "orden" ? setUploadingOrden(false) : setUploadingResultado(false);
  };

  const handleDelete = async (tipo: "orden" | "resultado") => {
    if (!examen) return;
    const path = tipo === "orden" ? examen.archivo_orden_url : examen.archivo_resultado_url;
    if (!path) return;
    await deleteDocumento(path);
    const supabase = createClient();
    const field = tipo === "orden" ? "archivo_orden_url" : "archivo_resultado_url";
    await supabase.from("examenes").update({ [field]: null }).eq("id", examen.id);
    await cargar();
  };

  const abrirPDF = async (storagePath: string) => {
    const url = await getUrlDocumento(storagePath);
    if (url) window.open(url, "_blank");
  };

  const handleCambiarEstado = async (estado: "pendiente" | "listo") => {
    setShowEstadoMenu(false);
    if (!examen) return;
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];
    const updates: Record<string, string | null> = { estado };
    if (estado === "listo" && !examen.fecha_realizacion) updates.fecha_realizacion = hoy;
    if (estado !== "listo") updates.fecha_realizacion = null;
    await supabase.from("examenes").update(updates).eq("id", examen.id);
    setExamen(e => e ? { ...e, estado, fecha_realizacion: updates.fecha_realizacion ?? e.fecha_realizacion } : e);
  };

  const handleEliminar = async () => {
    if (!examen) return;
    setDeleting(true);
    const supabase = createClient();
    if (examen.archivo_orden_url) await deleteDocumento(examen.archivo_orden_url);
    if (examen.archivo_resultado_url) await deleteDocumento(examen.archivo_resultado_url);
    await supabase.from("examenes").delete().eq("id", id);
    router.back();
  };

  const handleEnviarRecordatorio = async () => {
    setNotificando(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notificar-citas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ tipo: "manual_examen", examen_id: id }),
    });
    setNotificando(false);
    setNotificado(true);
    setTimeout(() => setNotificado(false), 3000);
  };

  // fieldChanged decides whether to send WA notification
  const handleGuardarEdicion = async (fieldChanged?: string) => {
    if (!examen || !editForm.nombre.trim()) return;
    setSavingEdit(true);
    const supabase = createClient();
    const estadoAntes = examen.estado;
    const tenieFecha = !!examen.fecha_solicitud;
    await supabase.from("examenes").update({
      nombre: editForm.nombre.trim(),
      tipo: editForm.tipo,
      especialidad: editForm.especialidad.trim() || null,
      fecha_solicitud: editForm.fecha_solicitud || null,
      hora: editForm.hora || null,
      lugar: editForm.lugar.trim() || null,
      acompanante_id: editForm.acompanante_id || null,
      notas: editForm.notas.trim() || null,
    }).eq("id", id);
    setSavingEdit(false);
    setSavedEdit(true);
    setEditingField(null);
    await cargar();
    setTimeout(() => setSavedEdit(false), 2000);

    const dateChanged = fieldChanged === "fecha_solicitud" || fieldChanged === "hora";
    if (dateChanged && editForm.fecha_solicitud && (estadoAntes === "pendiente" || !tenieFecha)) {
      createClient().functions.invoke("notificar-citas", { body: { tipo: "manual_examen", examen_id: id } })
        .catch((e) => console.error("WA examen agendado:", e));
    }
  };

  const handleAddAuth = async () => {
    if (!examen || !addAuthForm.numero.trim()) return;
    setSavingAuth(true);
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];
    await supabase.from("autorizaciones_eps").insert({
      paciente_id: examen.paciente_id,
      descripcion: examen.nombre,
      tipo: examen.tipo as "cita" | "examen" | "laboratorio" | "procedimiento",
      fecha_orden: hoy,
      estado: "autorizada" as const,
      vigencia_dias: 30,
      numero_autorizacion: addAuthForm.numero.trim(),
      fecha_autorizacion: hoy,
      nombre_prestador: addAuthForm.nombre_prestador.trim() || null,
      telefono_prestador: addAuthForm.telefono_prestador.trim() || null,
      examen_id: id,
    });
    setSavingAuth(false);
    setShowAddAuth(false);
    setAddAuthForm({ numero: "", nombre_prestador: "", telefono_prestador: "" });
    await cargar();
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

  if (!examen) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Examen no encontrado</p>
        <button onClick={() => router.back()} className="text-sm text-primary underline">Volver</button>
      </div>
    );
  }

  const estadoCfg = ESTADO_CONFIG[examen.estado === "en_proceso" ? "pendiente" : examen.estado] ?? ESTADO_CONFIG.pendiente;
  const fechaTexto = examen.fecha_solicitud
    ? new Date(examen.fecha_solicitud + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })
    : undefined;
  const horaTexto = examen.hora
    ? (() => { const [h, m] = examen.hora!.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? "p.m." : "a.m."}`; })()
    : undefined;
  const acompanantes = miembros.filter(m => m.rol !== "abuela");

  return (
    <div className="min-h-dvh bg-background pb-24" onClick={() => showEstadoMenu && setShowEstadoMenu(false)}>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
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
                      onClick={() => handleCambiarEstado(key as "pendiente" | "listo")}
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

      <div className="max-w-5xl mx-auto px-4">
        {/* Title block */}
        <div className="pt-5 pb-2">
          {editingField === "tipo" ? (
            <div className="flex flex-col gap-1.5 mb-1.5 max-w-[220px]">
              <Select
                value={editForm.tipo}
                onValueChange={v => setEditForm(f => ({ ...f, tipo: v as typeof editForm.tipo }))}
              >
                <SelectTrigger className="h-8 rounded-lg border-border bg-card text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="examen">Examen diagnóstico</SelectItem>
                  <SelectItem value="procedimiento">Procedimiento</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1.5">
                <button onClick={() => handleGuardarEdicion("tipo")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white"
                  style={{ background: ACCENT }}>
                  <Check size={11} />Guardar
                </button>
                <button onClick={() => setEditingField(null)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-border text-muted-foreground">
                  <X size={11} />Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingField("tipo")} className="inline-flex mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ background: ACCENT + "22", color: ACCENT }}>
                {TIPO_LABEL[examen.tipo] ?? examen.tipo}
              </span>
            </button>
          )}

          {editingField === "nombre" ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={editForm.nombre}
                onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre del examen/procedimiento"
                className="text-xl font-extrabold h-11 rounded-xl border-border bg-card flex-1"
                onKeyDown={e => {
                  if (e.key === "Enter") handleGuardarEdicion("nombre");
                  if (e.key === "Escape") setEditingField(null);
                }}
              />
              <button onClick={() => handleGuardarEdicion("nombre")}
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
              <h1 className="text-2xl font-extrabold text-foreground leading-tight">{examen.nombre}</h1>
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
            style={{ background: "#EDE9F7" }}
          >
            <Check size={13} color={ACCENT} strokeWidth={2.5} />
            <p className="text-sm font-semibold" style={{ color: ACCENT }}>Guardado</p>
          </motion.div>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start mt-2">
          <div className="flex flex-col gap-3 mb-6 lg:mb-0">

          {/* Pendiente por agendar banner */}
          {!examen.fecha_solicitud && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
              style={{ background: "#FFF3E0", border: "1.5px solid #FFB74D" }}
            >
              <Clock size={14} color="#e65100" className="shrink-0" />
              <p className="text-sm flex-1" style={{ color: "#e65100" }}>Falta asignar fecha</p>
              <button
                onClick={() => setEditingField("fecha_solicitud")}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                style={{ background: "#e65100" }}
              >
                Agendar
              </button>
            </motion.div>
          )}

          {/* Properties card */}
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Detalles</p>
            <div className="-mx-1 flex flex-col divide-y divide-border">

              {/* Especialidad */}
              <PropRow
                icon={FileText}
                label="Especialidad"
                value={examen.especialidad || undefined}
                placeholder="Sin especialidad"
                isEditing={editingField === "especialidad"}
                onStartEdit={() => setEditingField("especialidad")}
                onSave={() => handleGuardarEdicion("especialidad")}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  autoFocus
                  value={editForm.especialidad}
                  onChange={e => setEditForm(f => ({ ...f, especialidad: e.target.value }))}
                  placeholder="Ej: Cardiología, Neurología"
                  className="h-9 rounded-lg flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion("especialidad"); if (e.key === "Escape") setEditingField(null); }}
                />
              </PropRow>

              {/* Fecha */}
              <PropRow
                icon={Calendar}
                label="Fecha"
                value={fechaTexto}
                placeholder="Sin fecha"
                isEditing={editingField === "fecha_solicitud"}
                onStartEdit={() => setEditingField("fecha_solicitud")}
                onSave={() => handleGuardarEdicion("fecha_solicitud")}
                onCancel={() => setEditingField(null)}
              >
                <DatePicker
                  value={editForm.fecha_solicitud}
                  onChange={val => setEditForm(f => ({ ...f, fecha_solicitud: val }))}
                  className="rounded-lg border-border bg-card h-9 w-full"
                />
              </PropRow>

              {/* Hora */}
              <PropRow
                icon={Clock}
                label="Hora"
                value={horaTexto}
                placeholder="Sin hora"
                isEditing={editingField === "hora"}
                onStartEdit={() => setEditingField("hora")}
                onSave={() => handleGuardarEdicion("hora")}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  type="time"
                  autoFocus
                  value={editForm.hora}
                  onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))}
                  className="h-9 rounded-lg border-border bg-card"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion("hora"); }}
                />
              </PropRow>

              {/* Lugar */}
              <PropRow
                icon={MapPin}
                label="Lugar"
                value={examen.lugar || undefined}
                placeholder="Sin asignar"
                isEditing={editingField === "lugar"}
                onStartEdit={() => setEditingField("lugar")}
                onSave={() => handleGuardarEdicion("lugar")}
                onCancel={() => setEditingField(null)}
                mapsLink={examen.lugar ? `https://maps.google.com/?q=${encodeURIComponent(examen.lugar)}` : undefined}
              >
                <Input
                  autoFocus
                  value={editForm.lugar}
                  onChange={e => setEditForm(f => ({ ...f, lugar: e.target.value }))}
                  placeholder="Ej: Clínica del Country, Laboratorio Cafam"
                  className="h-9 rounded-lg flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion("lugar"); }}
                />
              </PropRow>

              {/* Acompañante */}
              <PropRow
                icon={User}
                label="Acompañante"
                value={(examen.acompanante as MiembroFamilia | undefined)?.nombre}
                placeholder="Sin acompañante"
                accent={!!examen.acompanante}
                isEditing={editingField === "acompanante"}
                onStartEdit={() => setEditingField("acompanante")}
                onSave={() => handleGuardarEdicion("acompanante")}
                onCancel={() => setEditingField(null)}
              >
                <Select
                  value={editForm.acompanante_id ?? "none"}
                  onValueChange={v => setEditForm(f => ({ ...f, acompanante_id: v === "none" ? null : v }))}
                >
                  <SelectTrigger className="h-9 rounded-lg border-border bg-card text-sm w-full">
                    {(() => {
                      const m = editForm.acompanante_id ? acompanantes.find(x => x.id === editForm.acompanante_id) : null;
                      return (
                        <span className={m ? "" : "text-muted-foreground"}>
                          {m ? `${m.emoji ?? ""} ${m.nombre}`.trim() : "Sin acompañante"}
                        </span>
                      );
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin acompañante</SelectItem>
                    {acompanantes.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.emoji} {m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PropRow>

              {/* Notas */}
              <PropRow
                icon={FileText}
                label="Notas"
                value={examen.notas || undefined}
                placeholder="Sin notas"
                isEditing={editingField === "notas"}
                onStartEdit={() => setEditingField("notas")}
                onSave={() => handleGuardarEdicion("notas")}
                onCancel={() => setEditingField(null)}
              >
                <Textarea
                  autoFocus
                  value={editForm.notas}
                  onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Indicaciones de preparación, ayuno, etc."
                  rows={2}
                  className="rounded-lg text-sm resize-none flex-1"
                />
              </PropRow>

            </div>
          </div>

          {/* Autorización EPS */}
          {authVinculada ? (
            <Link href={`/salud/autorizacion/${authVinculada.id}`}>
              <div className="rounded-xl p-3.5 flex flex-col gap-0.5 transition-all active:scale-[0.98]"
                style={{ background: "#E8F5E9", border: "1.5px solid #4CAF50" }}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <Shield size={13} color="#2e7d32" strokeWidth={2.5} />
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#2e7d32" }}>
                      Autorización EPS aprobada
                    </p>
                  </div>
                  <ExternalLink size={12} color="#2e7d32" />
                </div>
                <p className="text-xl font-extrabold" style={{ color: "#2e7d32" }}>
                  N° {authVinculada.numero_autorizacion}
                </p>
                {authVinculada.descripcion && (
                  <p className="text-xs text-muted-foreground">{authVinculada.descripcion}</p>
                )}
              </div>
            </Link>
          ) : (
            <div className="rounded-xl p-3.5 border border-dashed border-border bg-card flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Shield size={15} className="text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">¿Ya tienes número de autorización?</p>
              </div>
              <button
                onClick={() => setShowAddAuth(true)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all active:scale-[0.97]"
                style={{ background: ACCENT }}
              >
                Agregar
              </button>
            </div>
          )}

          {/* Documentos card */}
          <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Orden médica</p>
              <PDFSlot
                label="Orden médica"
                storagePath={examen.archivo_orden_url}
                uploading={uploadingOrden}
                onUpload={f => handleUpload(f, "orden")}
                onDelete={() => handleDelete("orden")}
                onView={() => examen.archivo_orden_url && abrirPDF(examen.archivo_orden_url)}
                accentColor={ACCENT}
                accentBg="#EDE9F7"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Resultado</p>
              <PDFSlot
                label="Resultado"
                storagePath={examen.archivo_resultado_url}
                uploading={uploadingResultado}
                onUpload={f => handleUpload(f, "resultado")}
                onDelete={() => handleDelete("resultado")}
                onView={() => examen.archivo_resultado_url && abrirPDF(examen.archivo_resultado_url)}
                accentColor="#2E7D6A"
                accentBg="#E8F5E9"
                hint={!examen.archivo_resultado_url ? "Al subir el resultado se marca como Realizado automáticamente." : undefined}
              />
            </div>
          </div>

          {/* Enviar recordatorio */}
          {examen.acompanante_id && (
            <div>
              {notificado ? (
                <div className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ background: "#E8F5E9", color: "#2e7d32" }}>
                  <Check size={15} strokeWidth={2.5} />
                  Recordatorio enviado
                </div>
              ) : (
                <button
                  onClick={handleEnviarRecordatorio}
                  disabled={notificando}
                  className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
                  style={{ background: "#EDE9F7", color: ACCENT }}
                >
                  <Bell size={15} strokeWidth={2} />
                  {notificando ? "Enviando…" : "Enviar recordatorio por WhatsApp"}
                </button>
              )}
            </div>
          )}

          {/* Eliminar */}
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{ background: "#FFF0F0", color: "#c62828" }}
              >
                <Trash2 size={14} strokeWidth={2} />Eliminar procedimiento
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 p-4 flex flex-col gap-3"
                style={{ borderColor: "#c62828", background: "#FFF0F0" }}
              >
                <p className="text-sm font-bold text-center" style={{ color: "#c62828" }}>¿Eliminar este procedimiento?</p>
                <p className="text-xs text-center text-muted-foreground">Esta acción no se puede deshacer.</p>
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
            <NotasSeguimiento examenId={id} accentColor={ACCENT} accentBg="#EDE9F7" />
          </div>
        </div>
      </div>

      {/* ── Bottom sheet: Agregar autorización ── */}
      <AnimatePresence>
        {showAddAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddAuth(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-md mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">Número de autorización</h2>
                <button type="button" onClick={() => setShowAddAuth(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">N° de autorización *</label>
                <Input
                  placeholder="Ej: 123456789"
                  value={addAuthForm.numero}
                  onChange={e => setAddAuthForm(f => ({ ...f, numero: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 size={12} />
                  Nombre del prestador (opcional)
                </label>
                <Input
                  placeholder="Ej: Clínica El Bosque"
                  value={addAuthForm.nombre_prestador}
                  onChange={e => setAddAuthForm(f => ({ ...f, nombre_prestador: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Phone size={12} />
                  Teléfono del prestador (opcional)
                </label>
                <Input
                  type="tel"
                  placeholder="Ej: 6015551234"
                  value={addAuthForm.telefono_prestador}
                  onChange={e => setAddAuthForm(f => ({ ...f, telefono_prestador: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              <button
                type="button"
                onClick={handleAddAuth}
                disabled={!addAuthForm.numero.trim() || savingAuth}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: ACCENT }}
              >
                {savingAuth ? "Guardando…" : <><Check size={16} strokeWidth={2.5} /> Guardar autorización</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Inline-editable property row ──
function PropRow({
  icon: Icon,
  label,
  value,
  placeholder,
  accent,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  mapsLink,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  placeholder?: string;
  accent?: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  mapsLink?: string;
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
      <Icon size={15} className={cn("mt-0.5 shrink-0", accent ? "text-primary" : "text-muted-foreground")} />
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
              accent ? "font-semibold text-primary" :
              value ? "text-foreground" : "text-muted-foreground italic"
            )}>
              {value || placeholder || "—"}
            </span>
            {mapsLink && value && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 transition-colors hover:opacity-80"
                style={{ background: "#E8F5E9", color: "#2e7d32" }}
              >
                <ExternalLink size={10} />
              </a>
            )}
            <Edit3 size={12} className="opacity-0 group-hover:opacity-30 transition-opacity text-muted-foreground shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PDF Slot ────────────────────────────────────────────────────── */

function PDFSlot({
  label, storagePath, uploading, onUpload, onDelete, onView, accentColor, accentBg, hint,
}: {
  label: string;
  storagePath: string | null;
  uploading: boolean;
  onUpload: (f: File) => void;
  onDelete: () => void;
  onView: () => void;
  accentColor: string;
  accentBg: string;
  hint?: string;
}) {
  if (storagePath) {
    return (
      <div className="rounded-xl border p-3 flex items-center gap-3"
        style={{ borderColor: accentColor + "40", background: accentBg }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: accentColor + "20" }}>
          <FileText size={16} color={accentColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: accentColor }}>{label}</p>
          <p className="text-xs text-muted-foreground">PDF guardado</p>
        </div>
        <button onClick={onView}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: accentColor, color: "white" }}>
          <ExternalLink size={10} />Ver
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors">
          <Trash2 size={12} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 cursor-pointer hover:border-[color:var(--accent)] transition-colors"
        style={{ "--accent": accentColor } as React.CSSProperties}>
        <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
          disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        {uploading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
              style={{ borderColor: accentColor + "40", borderTopColor: accentColor }} />
            <p className="text-sm text-muted-foreground">Subiendo...</p>
          </>
        ) : (
          <>
            <Upload size={15} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Subir {label.toLowerCase()}</p>
              <p className="text-xs text-muted-foreground">PDF, JPG o PNG · máx. 10 MB</p>
            </div>
          </>
        )}
      </label>
      {hint && <p className="text-xs text-muted-foreground mt-1.5 px-1">{hint}</p>}
    </div>
  );
}
