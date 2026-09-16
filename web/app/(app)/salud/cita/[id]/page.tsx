"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Calendar, Clock, MapPin, User, FileText, Check,
  Edit3, Upload, Trash2, ExternalLink, MessageSquare, X, Mic, Bell,
  Shield, Building2, Phone, ChevronDown, ChevronUp,
} from "lucide-react";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { uploadArchivoCita, getUrlDocumento, deleteDocumento } from "@/lib/supabase/storage";
import { formatFechaHora } from "@/lib/utils/fecha";
import { NotasSeguimiento } from "@/components/ui/notas-seguimiento";
import type { Cita, MiembroFamilia, AutorizacionEPS } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const ESPECIALIDADES = [
  "Cardiología", "Neurología", "Odontología", "Oftalmología",
  "Ortopedia", "Dermatología", "Ginecología", "Urología",
  "Gastroenterología", "Endocrinología", "Psiquiatría", "Medicina general",
  "Nutrición", "Fisioterapia", "Otra",
];

const ACCENT = "#C0546A";

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  por_agendar: { label: "Sin fecha",   color: "#e65100", bg: "#FFF3E0" },
  pendiente:   { label: "Pendiente",   color: ACCENT,    bg: "#FDF2F4" },
  completada:  { label: "Completada",  color: "#2e7d32", bg: "#E8F5E9" },
  cancelada:   { label: "Cancelada",   color: "#757575", bg: "#F5F5F5" },
};

export default function DetalleCitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [cita, setCita] = useState<Cita | null>(null);
  const [miembros, setMiembros] = useState<MiembroFamilia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingOrden, setUploadingOrden] = useState(false);
  const [audioSignedUrl, setAudioSignedUrl] = useState<string | null>(null);
  const [authVinculada, setAuthVinculada] = useState<AutorizacionEPS | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enviandoWA, setEnviandoWA] = useState(false);
  const [waEnviado, setWaEnviado] = useState(false);
  const [notasMode, setNotasMode] = useState<"texto" | "voz">("texto");
  const [audioPostBlob, setAudioPostBlob] = useState<Blob | null>(null);
  const [audioPostSignedUrl, setAudioPostSignedUrl] = useState<string | null>(null);
  const [authsVinculadas, setAuthsVinculadas] = useState<AutorizacionEPS[]>([]);
  const [enviandoTramite, setEnviandoTramite] = useState(false);
  const [tramiteEnviado, setTramiteEnviado] = useState(false);
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [reporteEnviado, setReporteEnviado] = useState(false);
  const [showAddAuth, setShowAddAuth] = useState(false);
  const [addAuthForm, setAddAuthForm] = useState({ numero: "", nombre_prestador: "", telefono_prestador: "" });
  const [savingAuth, setSavingAuth] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "", especialidad: "", medico: "",
    fecha: "", hora: "", lugar: "", lugar_detalle: "", acompanante_id: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);
  const [otraEsp, setOtraEsp] = useState(false);

  // ClickUp-style state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEstadoMenu, setShowEstadoMenu] = useState(false);
  const [openAuth, setOpenAuth] = useState(true);
  const [openOrden, setOpenOrden] = useState(true);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const [{ data }, { data: mbs }, { data: auths }] = await Promise.all([
      supabase
        .from("citas")
        .select("*, paciente:paciente_id(*), acompanante:acompanante_id(*)")
        .eq("id", id)
        .single(),
      supabase.from("miembros_familia").select("*").eq("activo", true).order("nombre"),
      supabase.from("autorizaciones_eps").select("*").eq("cita_id", id),
    ]);
    setCita(data);
    const allAuths = auths ?? [];
    setAuthsVinculadas(allAuths);
    const authAprobada = allAuths.find(a => a.estado === "autorizada" && a.numero_autorizacion);
    setAuthVinculada(authAprobada ?? null);
    setNotas(data?.notas_post ?? "");
    setMiembros(mbs ?? []);
    if (data?.audio_url) {
      const url = await getUrlDocumento(data.audio_url);
      setAudioSignedUrl(url);
    }
    if (data?.audio_post_url) {
      const url = await getUrlDocumento(data.audio_post_url);
      setAudioPostSignedUrl(url);
    }
    if (data) {
      const fh = data.fecha_hora ? new Date(data.fecha_hora) : null;
      setEditForm({
        nombre: data.nombre ?? "",
        especialidad: data.especialidad ?? "",
        medico: data.medico ?? "",
        fecha: fh ? fh.toISOString().split("T")[0] : "",
        hora: fh ? fh.toTimeString().slice(0, 5) : "",
        lugar: data.lugar ?? "",
        lugar_detalle: data.lugar_detalle ?? "",
        acompanante_id: data.acompanante_id ?? "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleUploadOrden = async (file: File) => {
    if (!cita) return;
    setUploadingOrden(true);
    const path = await uploadArchivoCita(file, cita.id);
    if (path) {
      const supabase = createClient();
      await supabase.from("citas").update({ archivo_url: path }).eq("id", cita.id);
      await cargar();
    }
    setUploadingOrden(false);
  };

  const handleDeleteOrden = async () => {
    if (!cita?.archivo_url) return;
    await deleteDocumento(cita.archivo_url);
    const supabase = createClient();
    await supabase.from("citas").update({ archivo_url: null }).eq("id", cita.id);
    await cargar();
  };

  const abrirOrden = async () => {
    if (!cita?.archivo_url) return;
    const url = await getUrlDocumento(cita.archivo_url);
    if (url) window.open(url, "_blank");
  };

  const handleEnviarRecordatorio = async () => {
    if (!cita) return;
    setEnviandoWA(true);
    const supabase = createClient();
    await supabase.functions.invoke("notificar-citas", {
      body: { tipo: "manual", cita_id: cita.id },
    });
    setEnviandoWA(false);
    setWaEnviado(true);
    setTimeout(() => setWaEnviado(false), 3000);
  };

  const handlePedirReporte = async () => {
    if (!cita) return;
    setEnviandoReporte(true);
    const supabase = createClient();
    await supabase.functions.invoke("notificar-citas", {
      body: { tipo: "pedir_reporte", cita_id: cita.id },
    });
    setEnviandoReporte(false);
    setReporteEnviado(true);
    setTimeout(() => setReporteEnviado(false), 4000);
  };

  const handlePedirEstadoTramite = async () => {
    if (!cita) return;
    setEnviandoTramite(true);
    const supabase = createClient();
    await supabase.functions.invoke("notificar-citas", {
      body: { tipo: "recordatorio_tramite", cita_id: cita.id },
    });
    setEnviandoTramite(false);
    setTramiteEnviado(true);
    setTimeout(() => setTramiteEnviado(false), 4000);
  };

  const handleEliminar = async () => {
    if (!cita) return;
    setDeleting(true);
    const supabase = createClient();
    if (cita.archivo_url) await deleteDocumento(cita.archivo_url);
    await supabase.from("citas").delete().eq("id", id);
    router.back();
  };

  const handleGuardarNotas = async () => {
    if (!cita) return;
    setSaving(true);
    const supabase = createClient();
    let audio_post_url: string | null = cita.audio_post_url ?? null;
    if (notasMode === "voz" && audioPostBlob) {
      const ext = audioPostBlob.type.includes("mp4") ? "m4a" : "webm";
      const path = `notas-post/${Date.now()}.${ext}`;
      const { data: uploaded } = await supabase.storage
        .from("audios-salud")
        .upload(path, audioPostBlob, { contentType: audioPostBlob.type });
      if (uploaded) {
        const { data: { publicUrl } } = supabase.storage
          .from("audios-salud")
          .getPublicUrl(uploaded.path);
        audio_post_url = publicUrl;
      }
    }
    await supabase.from("citas")
      .update({
        notas_post: notasMode === "texto" ? (notas || null) : null,
        audio_post_url,
        estado: "completada",
      })
      .eq("id", id);
    setSaving(false);
    setSaved(true);
    setEditandoNotas(false);
    setCita(c => c ? { ...c, notas_post: notasMode === "texto" ? notas : null, audio_post_url, estado: "completada" } : c);
    if (audio_post_url) {
      const signed = await getUrlDocumento(audio_post_url);
      setAudioPostSignedUrl(signed);
    }
    setTimeout(() => setSaved(false), 2000);
  };

  // fieldChanged is passed to decide whether to send WA notification
  const handleGuardarEdicion = async (fieldChanged?: string) => {
    if (!cita || !editForm.especialidad) return;
    setSavingEdit(true);
    const supabase = createClient();
    const tieneFechaCompleta = editForm.fecha && editForm.hora;
    const estadoAntes = cita.estado;
    await supabase.from("citas").update({
      nombre: editForm.nombre || null,
      especialidad: editForm.especialidad,
      medico: editForm.medico || null,
      lugar: editForm.lugar || null,
      lugar_detalle: editForm.lugar_detalle || null,
      fecha_hora: tieneFechaCompleta
        ? new Date(`${editForm.fecha}T${editForm.hora}`).toISOString()
        : null,
      acompanante_id: editForm.acompanante_id || null,
      estado: tieneFechaCompleta && cita.estado === "por_agendar" ? "pendiente" : cita.estado,
      recordatorio_enviado: tieneFechaCompleta ? false : undefined,
    }).eq("id", id);
    setSavingEdit(false);
    setSavedEdit(true);
    setEditingField(null);
    await cargar();
    setTimeout(() => setSavedEdit(false), 2000);

    // Only notify via WA when date or time is explicitly changed
    const dateChanged = fieldChanged === "fecha" || fieldChanged === "hora";
    if (tieneFechaCompleta && dateChanged && (estadoAntes === "por_agendar" || estadoAntes === "pendiente")) {
      createClient().functions.invoke("notificar-citas", { body: { tipo: "manual", cita_id: id } })
        .catch((e) => console.error("WA nueva cita agendada:", e));
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    setShowEstadoMenu(false);
    const supabase = createClient();
    await supabase.from("citas").update({ estado: nuevoEstado }).eq("id", id);
    setCita(c => c ? { ...c, estado: nuevoEstado as Cita["estado"] } : c);
  };

  const handleAddAuth = async () => {
    if (!cita || !addAuthForm.numero.trim()) return;
    setSavingAuth(true);
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];
    await supabase.from("autorizaciones_eps").insert({
      paciente_id: cita.paciente_id,
      descripcion: cita.nombre ?? cita.especialidad,
      tipo: "cita" as const,
      fecha_orden: hoy,
      estado: "autorizada" as const,
      vigencia_dias: 30,
      numero_autorizacion: addAuthForm.numero.trim(),
      fecha_autorizacion: hoy,
      nombre_prestador: addAuthForm.nombre_prestador.trim() || null,
      telefono_prestador: addAuthForm.telefono_prestador.trim() || null,
      cita_id: id,
    });
    setSavingAuth(false);
    setShowAddAuth(false);
    setAddAuthForm({ numero: "", nombre_prestador: "", telefono_prestador: "" });
    await cargar();
  };

  const { fecha, hora } = (cita?.fecha_hora)
    ? formatFechaHora(cita.fecha_hora)
    : { fecha: "Sin fecha asignada", hora: "" };

  const acompanantes = miembros.filter(m => m.id !== cita?.paciente_id);
  const estadoCfg = ESTADO_CONFIG[cita?.estado ?? "pendiente"] ?? ESTADO_CONFIG.pendiente;

  return (
    <div className="min-h-dvh bg-background pb-24" onClick={() => showEstadoMenu && setShowEstadoMenu(false)}>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 shrink-0">
            <ArrowLeft size={18} style={{ color: ACCENT }} strokeWidth={2.5} />
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Salud</span>
          </button>

          {/* Status chip with dropdown */}
          {!loading && cita && (
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
                    className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-30 min-w-[160px]"
                  >
                    {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleCambiarEstado(key)}
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
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col gap-3 pt-6">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-10 w-2/3 rounded-lg" />
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Title block */}
            <div className="pt-5 pb-2">
              <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: ACCENT }}>
                {cita?.especialidad}
              </p>
              {editingField === "nombre" ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={editForm.nombre}
                    onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder={cita?.paciente?.nombre ?? "Nombre de la cita"}
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
                  <h1 className="text-2xl font-extrabold text-foreground leading-tight">
                    {cita?.nombre || cita?.paciente?.nombre}
                  </h1>
                  <Edit3 size={14} className="mt-2 opacity-0 group-hover:opacity-30 transition-opacity text-muted-foreground shrink-0" />
                </button>
              )}
              {cita?.nombre && (
                <p className="text-sm text-muted-foreground mt-1">{cita.paciente?.nombre}</p>
              )}
            </div>

            {savedEdit && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-2.5 flex items-center gap-2 mb-3"
                style={{ background: "#E8F5E9" }}
              >
                <Check size={13} color="#2e7d32" strokeWidth={2.5} />
                <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Guardado</p>
              </motion.div>
            )}

            {/* Two-column layout: properties left, notes right on desktop */}
            <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start mt-2">

              {/* ── LEFT: properties + sections + actions ── */}
              <div className="flex flex-col gap-3 mb-6 lg:mb-0">

                {/* Por agendar banner */}
                {cita?.estado === "por_agendar" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
                    style={{ background: "#FFF3E0", border: "1.5px solid #FFB74D" }}
                  >
                    <Clock size={14} color="#e65100" className="shrink-0" />
                    <p className="text-sm flex-1" style={{ color: "#e65100" }}>Falta asignar fecha</p>
                    <button
                      onClick={() => setEditingField("fecha")}
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
                  value={cita?.especialidad}
                  isEditing={editingField === "especialidad"}
                  onStartEdit={() => setEditingField("especialidad")}
                  onSave={() => handleGuardarEdicion("especialidad")}
                  onCancel={() => setEditingField(null)}
                >
                  <div className="flex flex-col gap-1.5 w-full">
                    <Select
                      value={otraEsp ? "Otra" : editForm.especialidad}
                      onValueChange={v => {
                        if (v === "Otra") { setOtraEsp(true); setEditForm(f => ({ ...f, especialidad: "" })); }
                        else { setOtraEsp(false); setEditForm(f => ({ ...f, especialidad: v ?? "" })); }
                      }}
                    >
                      <SelectTrigger className="h-9 rounded-lg border-border bg-card text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESPECIALIDADES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {otraEsp && (
                      <Input
                        autoFocus
                        value={editForm.especialidad}
                        onChange={e => setEditForm(f => ({ ...f, especialidad: e.target.value }))}
                        placeholder="Especialidad personalizada"
                        className="h-9 rounded-lg"
                        onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion("especialidad"); }}
                      />
                    )}
                  </div>
                </PropRow>

                {/* Fecha */}
                <PropRow
                  icon={Calendar}
                  label="Fecha"
                  value={fecha !== "Sin fecha asignada" ? fecha : undefined}
                  placeholder="Sin fecha"
                  isEditing={editingField === "fecha"}
                  onStartEdit={() => setEditingField("fecha")}
                  onSave={() => handleGuardarEdicion("fecha")}
                  onCancel={() => setEditingField(null)}
                >
                  <DatePicker
                    value={editForm.fecha}
                    onChange={val => setEditForm(f => ({ ...f, fecha: val }))}
                    className="rounded-lg border-border bg-card h-9 w-full"
                  />
                </PropRow>

                {/* Hora */}
                <PropRow
                  icon={Clock}
                  label="Hora"
                  value={hora || undefined}
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

                {/* Médico */}
                <PropRow
                  icon={User}
                  label="Médico"
                  value={cita?.medico || undefined}
                  placeholder="Sin asignar"
                  isEditing={editingField === "medico"}
                  onStartEdit={() => setEditingField("medico")}
                  onSave={() => handleGuardarEdicion("medico")}
                  onCancel={() => setEditingField(null)}
                >
                  <Input
                    autoFocus
                    value={editForm.medico}
                    onChange={e => setEditForm(f => ({ ...f, medico: e.target.value }))}
                    placeholder="Nombre del médico"
                    className="h-9 rounded-lg flex-1"
                    onKeyDown={e => {
                      if (e.key === "Enter") handleGuardarEdicion("medico");
                      if (e.key === "Escape") setEditingField(null);
                    }}
                  />
                </PropRow>

                {/* Lugar */}
                <PropRow
                  icon={MapPin}
                  label="Lugar"
                  value={cita?.lugar || undefined}
                  placeholder="Sin asignar"
                  isEditing={editingField === "lugar"}
                  onStartEdit={() => setEditingField("lugar")}
                  onSave={() => handleGuardarEdicion("lugar")}
                  onCancel={() => setEditingField(null)}
                  mapsLink={cita?.lugar ? `https://maps.google.com/?q=${encodeURIComponent(cita.lugar)}` : undefined}
                >
                  <div className="flex flex-col gap-1.5 w-full">
                    <Input
                      autoFocus
                      value={editForm.lugar}
                      onChange={e => setEditForm(f => ({ ...f, lugar: e.target.value }))}
                      placeholder="Ej: Clínica del Country, Cra 15 #98-42"
                      className="h-9 rounded-lg"
                      onKeyDown={e => { if (e.key === "Enter") handleGuardarEdicion("lugar"); }}
                    />
                    <Input
                      value={editForm.lugar_detalle}
                      onChange={e => setEditForm(f => ({ ...f, lugar_detalle: e.target.value }))}
                      placeholder="Consultorio, piso, torre… (opcional)"
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                </PropRow>

                {/* Acompañante */}
                <PropRow
                  icon={User}
                  label="Acompañante"
                  value={cita?.acompanante?.nombre || undefined}
                  placeholder="Sin acompañante"
                  accent={!!cita?.acompanante}
                  isEditing={editingField === "acompanante"}
                  onStartEdit={() => setEditingField("acompanante")}
                  onSave={() => handleGuardarEdicion("acompanante")}
                  onCancel={() => setEditingField(null)}
                >
                  <Select
                    value={editForm.acompanante_id}
                    onValueChange={v => setEditForm(f => ({ ...f, acompanante_id: v ?? "" }))}
                  >
                    <SelectTrigger className="h-9 rounded-lg border-border bg-card text-sm w-full">
                      {(() => {
                        const m = editForm.acompanante_id
                          ? acompanantes.find(x => x.id === editForm.acompanante_id)
                          : null;
                        return (
                          <span className={m ? "" : "text-muted-foreground"}>
                            {m ? `${m.emoji ?? ""} ${m.nombre}`.trim() : "Sin acompañante"}
                          </span>
                        );
                      })()}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin acompañante</SelectItem>
                      {acompanantes.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.emoji} {m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PropRow>

                  </div>{/* end properties list */}
                </div>{/* end properties card */}

                {/* Autorización EPS + Orden card */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div>
                  <button
                    onClick={() => setOpenAuth(v => !v)}
                    className="flex items-center gap-2 w-full py-3 px-4 hover:bg-muted/40 transition-colors text-left"
                  >
                    <Shield size={13} className="text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex-1">
                      Autorización EPS
                    </span>
                    {openAuth
                      ? <ChevronUp size={13} className="text-muted-foreground" />
                      : <ChevronDown size={13} className="text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {openAuth && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 pt-1">
                          {authVinculada ? (
                            <Link href={`/salud/autorizacion/${authVinculada.id}`}>
                              <div className="rounded-xl p-3.5 flex flex-col gap-0.5 transition-all active:scale-[0.98]"
                                style={{ background: "#E8F5E9", border: "1.5px solid #4CAF50" }}>
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <Check size={12} color="#2e7d32" strokeWidth={2.5} />
                                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#2e7d32" }}>
                                      Aprobada
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
                            <div className="rounded-xl p-3.5 border border-dashed border-border flex items-center justify-between gap-3">
                              <p className="text-sm text-muted-foreground">¿Ya tienes número de autorización?</p>
                              <button
                                onClick={() => setShowAddAuth(true)}
                                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                                style={{ background: ACCENT }}
                              >
                                Agregar
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-border mx-4" />

                {/* Orden / referencia */}
                <div>
                  <button
                    onClick={() => setOpenOrden(v => !v)}
                    className="flex items-center gap-2 w-full py-3 px-4 hover:bg-muted/40 transition-colors text-left"
                  >
                    <FileText size={13} className="text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex-1">
                      Orden / referencia
                    </span>
                    {openOrden
                      ? <ChevronUp size={13} className="text-muted-foreground" />
                      : <ChevronDown size={13} className="text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {openOrden && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 pt-1">
                          {cita?.archivo_url ? (
                            <div className="rounded-xl border p-3 flex items-center gap-3"
                              style={{ borderColor: `${ACCENT}30`, background: "#FDF2F4" }}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "#F2C5CE" }}>
                                <FileText size={14} color={ACCENT} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold" style={{ color: ACCENT }}>Orden guardada</p>
                                <p className="text-xs text-muted-foreground">PDF disponible para el acompañante</p>
                              </div>
                              <button onClick={abrirOrden}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white shrink-0"
                                style={{ background: ACCENT }}>
                                <ExternalLink size={10} />Ver
                              </button>
                              <button onClick={handleDeleteOrden}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors">
                                <Trash2 size={12} className="text-muted-foreground" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 cursor-pointer hover:border-primary transition-colors">
                              <input
                                type="file"
                                accept=".pdf,application/pdf,image/jpeg,image/png"
                                className="hidden"
                                disabled={uploadingOrden}
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadOrden(f); }}
                              />
                              {uploadingOrden ? (
                                <>
                                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                                    style={{ borderColor: "#F2C5CE", borderTopColor: ACCENT }} />
                                  <p className="text-sm font-semibold text-muted-foreground">Subiendo...</p>
                                </>
                              ) : (
                                <>
                                  <Upload size={15} className="text-muted-foreground shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">Subir orden de la cita</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG o PNG · el acompañante podrá verla</p>
                                  </div>
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                </div>{/* end auth+orden card */}

                {/* Audio de la cita */}
                {audioSignedUrl && (
                  <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Mic size={12} />Nota de voz
                    </p>
                    <div className="rounded-xl border p-3" style={{ background: "#F9F4FF", borderColor: "#C0546A30" }}>
                      <audio src={audioSignedUrl} controls className="w-full h-10" style={{ accentColor: ACCENT }} />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {cita?.estado === "pendiente" && (
                    <button
                      onClick={handleEnviarRecordatorio}
                      disabled={enviandoWA || waEnviado}
                      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70"
                      style={waEnviado
                        ? { background: "#22c55e", color: "#fff" }
                        : { background: "#25D366", color: "#fff" }}
                    >
                      {waEnviado ? (
                        <><Check size={15} strokeWidth={2.5} />Recordatorio enviado</>
                      ) : enviandoWA ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Enviando…</>
                      ) : (
                        <><MessageSquare size={15} strokeWidth={2.5} />Enviar recordatorio WA</>
                      )}
                    </button>
                  )}

                  {cita?.fecha_hora && new Date(cita.fecha_hora) < new Date() &&
                   !cita.notas_post && !cita.audio_post_url && (
                    <button
                      onClick={handlePedirReporte}
                      disabled={enviandoReporte || reporteEnviado}
                      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70"
                      style={reporteEnviado
                        ? { background: "#22c55e", color: "#fff" }
                        : { background: "#FFF3E0", color: "#e65100", border: "1.5px solid #FFB74D" }}
                    >
                      {reporteEnviado ? (
                        <><Check size={15} strokeWidth={2.5} />Reporte solicitado</>
                      ) : enviandoReporte ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-orange-300 border-t-orange-600 animate-spin" />Enviando…</>
                      ) : (
                        <><MessageSquare size={15} strokeWidth={2.5} />Pedir reporte al acompañante</>
                      )}
                    </button>
                  )}

                  {authsVinculadas.some(a => a.estado === "en_tramite") && (
                    <button
                      onClick={handlePedirEstadoTramite}
                      disabled={enviandoTramite || tramiteEnviado}
                      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70"
                      style={tramiteEnviado
                        ? { background: "#22c55e", color: "#fff" }
                        : { background: "#EDE7F6", color: "#6A3EA1" }}
                    >
                      {tramiteEnviado ? (
                        <><Check size={15} strokeWidth={2.5} />Recordatorio enviado</>
                      ) : enviandoTramite ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin" />Enviando…</>
                      ) : (
                        <><Bell size={15} strokeWidth={2.5} />Pedir estado del trámite EPS</>
                      )}
                    </button>
                  )}
                </div>

                {/* Delete */}
                <div className="mt-2">
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      style={{ background: "#FFF0F0", color: "#c62828" }}
                    >
                      <Trash2 size={14} strokeWidth={2} />Eliminar cita
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border-2 p-4 flex flex-col gap-3"
                      style={{ borderColor: "#c62828", background: "#FFF0F0" }}
                    >
                      <p className="text-sm font-bold text-center" style={{ color: "#c62828" }}>¿Eliminar esta cita?</p>
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

              {/* ── RIGHT: notes + seguimiento ── */}
              <div className="flex flex-col gap-4 mt-4 lg:mt-0">

                {/* Notas previas */}
                {cita?.notas_pre && (
                  <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      Notas previas
                    </p>
                    <p className="text-sm text-foreground">{cita.notas_pre}</p>
                  </div>
                )}

                {/* Notas post-cita */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={12} />Notas de la cita
                    </p>
                    {!editandoNotas && (
                      <button
                        onClick={() => { setEditandoNotas(true); setNotasMode("texto"); setAudioPostBlob(null); }}
                        className="flex items-center gap-1 text-xs text-primary font-semibold"
                      >
                        <Edit3 size={11} />
                        {cita?.notas_post || cita?.audio_post_url ? "Editar" : "Agregar"}
                      </button>
                    )}
                  </div>

                  {editandoNotas ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex rounded-lg overflow-hidden border border-border text-[11px] font-semibold self-start">
                        <button type="button"
                          onClick={() => { setNotasMode("texto"); setAudioPostBlob(null); }}
                          className="px-3 py-1.5 transition-colors"
                          style={notasMode === "texto"
                            ? { background: "#9B8EC4", color: "#fff" }
                            : { background: "transparent", color: "var(--muted-foreground)" }}>
                          ✍️ Texto
                        </button>
                        <button type="button"
                          onClick={() => { setNotasMode("voz"); setNotas(""); }}
                          className="px-3 py-1.5 transition-colors"
                          style={notasMode === "voz"
                            ? { background: "#9B8EC4", color: "#fff" }
                            : { background: "transparent", color: "var(--muted-foreground)" }}>
                          🎙️ Voz
                        </button>
                      </div>

                      {notasMode === "texto" ? (
                        <Textarea
                          value={notas}
                          onChange={e => setNotas(e.target.value)}
                          placeholder="¿De qué trató la cita? ¿Qué dijo el médico? ¿Qué sigue?"
                          rows={4}
                          className="rounded-xl border-border resize-none text-sm"
                          autoFocus
                        />
                      ) : (
                        <VoiceRecorder onAudio={setAudioPostBlob} />
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditandoNotas(false)}
                          className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-muted-foreground"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleGuardarNotas}
                          disabled={saving || (notasMode === "voz" && !audioPostBlob)}
                          className="flex-1 h-10 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                          style={{ background: "#9B8EC4" }}
                        >
                          {saving ? "Guardando..." : <><Check size={14} />Guardar</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {cita?.notas_post ? (
                        <p className="text-sm text-foreground">{cita.notas_post}</p>
                      ) : audioPostSignedUrl ? (
                        <div className="rounded-xl border p-3" style={{ background: "#F9F4FF", borderColor: "#9B8EC430" }}>
                          <audio src={audioPostSignedUrl} controls className="w-full h-10" style={{ accentColor: "#9B8EC4" }} />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          El acompañante puede escribir o grabar aquí qué pasó en la cita.
                        </p>
                      )}
                    </>
                  )}

                  {saved && (
                    <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                      <Check size={11} />Notas guardadas
                    </p>
                  )}
                </div>

                {/* Seguimiento */}
                <NotasSeguimiento citaId={id} accentColor="#9B8EC4" accentBg="#EDE9F7" />
              </div>

            </div>
          </>
        )}
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
                  <Building2 size={12} />Nombre del prestador (opcional)
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
                  <Phone size={12} />Teléfono del prestador (opcional)
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
                {savingAuth ? "Guardando…" : <><Check size={16} strokeWidth={2.5} />Guardar autorización</>}
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
      <Icon
        size={15}
        className={cn("mt-0.5 shrink-0", accent ? "text-primary" : "text-muted-foreground")}
      />
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
              "text-sm flex-1 min-w-0 truncate",
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
