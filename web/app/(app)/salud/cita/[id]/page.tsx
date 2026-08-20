"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Calendar, Clock, MapPin, User, FileText, Check,
  Edit3, Upload, Trash2, ExternalLink, MessageSquare, X, Pencil, Mic, Bell,
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

  // Voz en notas post-cita
  const [notasMode, setNotasMode] = useState<"texto" | "voz">("texto");
  const [audioPostBlob, setAudioPostBlob] = useState<Blob | null>(null);
  const [audioPostSignedUrl, setAudioPostSignedUrl] = useState<string | null>(null);

  // Recordatorio de trámite
  const [authsVinculadas, setAuthsVinculadas] = useState<AutorizacionEPS[]>([]);
  const [enviandoTramite, setEnviandoTramite] = useState(false);
  const [tramiteEnviado, setTramiteEnviado] = useState(false);

  // Pedir reporte post-cita
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [reporteEnviado, setReporteEnviado] = useState(false);

  // Editar datos de la cita
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    especialidad: "",
    medico: "",
    fecha: "",
    hora: "",
    lugar: "",
    lugar_detalle: "",
    acompanante_id: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);
  const [otraEsp, setOtraEsp] = useState(false);

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

  const handleGuardarEdicion = async () => {
    if (!cita || !editForm.especialidad) return;
    setSavingEdit(true);
    const supabase = createClient();
    const tieneFechaCompleta = editForm.fecha && editForm.hora;
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
    }).eq("id", id);
    setSavingEdit(false);
    setSavedEdit(true);
    setShowEdit(false);
    await cargar();
    setTimeout(() => setSavedEdit(false), 2000);

    if (tieneFechaCompleta && cita.estado === "por_agendar") {
      const supabaseWA = createClient();
      supabaseWA.functions.invoke("notificar-citas", { body: { tipo: "nueva_cita", cita_id: id } }).catch(() => {});
    }
  };

  const { fecha, hora } = (cita?.fecha_hora)
    ? formatFechaHora(cita.fecha_hora)
    : { fecha: "Sin fecha asignada", hora: "" };

  const acompanantes = miembros.filter(m => m.id !== cita?.paciente_id);
  const mapsUrl = editForm.lugar
    ? `https://maps.google.com/?q=${encodeURIComponent(editForm.lugar)}`
    : null;

  return (
    <div className="min-h-dvh bg-background pb-32 max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-pillar-salud px-4 pt-12 pb-5"
      >
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>Salud</span>
        </button>

        {loading ? (
          <Skeleton className="h-16 rounded-xl bg-white/40" />
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold tracking-wide" style={{ color: "#C0546A" }}>
                {cita?.especialidad?.toUpperCase()}
              </p>
              <h1 className="text-xl font-extrabold text-foreground mt-0.5">
                {cita?.nombre || cita?.paciente?.nombre}
              </h1>
              {cita?.nombre && (
                <p className="text-xs text-muted-foreground mt-0.5">{cita.paciente?.nombre}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.5)", color: "#C0546A" }}
              >
                <Pencil size={12} strokeWidth={2.5} />
                Editar
              </button>
              <span className={cn(
                "text-[11px] font-bold px-3 py-1 rounded-full",
                cita?.estado === "completada" ? "bg-green-100 text-green-700" :
                cita?.estado === "cancelada"  ? "bg-gray-100 text-gray-500" :
                cita?.estado === "por_agendar" ? "bg-orange-100 text-orange-700" :
                "bg-white/60 text-[#C0546A]"
              )}>
                {cita?.estado === "completada"  ? "✓ Completada" :
                 cita?.estado === "cancelada"   ? "Cancelada" :
                 cita?.estado === "por_agendar" ? "Sin fecha" :
                 "Pendiente"}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pt-5 flex flex-col gap-4"
      >
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Aviso si falta fecha */}
            {cita?.estado === "por_agendar" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: "#FFF3E0", border: "1.5px solid #FFB74D" }}
              >
                <Clock size={16} color="#e65100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "#e65100" }}>Falta asignar fecha</p>
                  <p className="text-xs text-muted-foreground">Toca "Editar" para agregar la fecha y el lugar cuando los tengas.</p>
                </div>
              </motion.div>
            )}

            {savedEdit && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{ background: "#E8F5E9" }}
              >
                <Check size={15} color="#2e7d32" strokeWidth={2.5} />
                <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Cita actualizada</p>
              </motion.div>
            )}

            {/* Info de la cita */}
            <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
              <InfoRow icon={Calendar} label="Fecha" value={fecha} />
              <InfoRow icon={Clock} label="Hora" value={hora || "—"} />
              {cita?.medico    && <InfoRow icon={User}   label="Médico"      value={cita.medico} />}
              {cita?.lugar     && <InfoRow icon={MapPin} label="Lugar"       value={cita.lugar} mapsLink={`https://maps.google.com/?q=${encodeURIComponent(cita.lugar)}`} />}
              {cita?.acompanante && <InfoRow icon={User} label="Acompañante" value={cita.acompanante.nombre} accent />}
            </div>

            {/* Autorización EPS */}
            {authVinculada && (
              <div className="rounded-2xl p-4 flex flex-col gap-1"
                style={{ background: "#E8F5E9", border: "2px solid #4CAF50" }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <Check size={15} color="#2e7d32" strokeWidth={2.5} />
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2e7d32" }}>
                    Autorización EPS aprobada
                  </p>
                </div>
                <p className="text-2xl font-extrabold" style={{ color: "#2e7d32" }}>
                  N° {authVinculada.numero_autorizacion}
                </p>
                {authVinculada.descripcion && (
                  <p className="text-xs text-muted-foreground">{authVinculada.descripcion}</p>
                )}
              </div>
            )}

            {/* Orden médica */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Orden / referencia</p>
              {cita?.archivo_url ? (
                <div className="rounded-xl border-2 p-3 flex items-center gap-3"
                  style={{ borderColor: "#C0546A40", background: "#FDF2F4" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F2C5CE" }}>
                    <FileText size={16} color="#C0546A" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "#C0546A" }}>Orden guardada</p>
                    <p className="text-xs text-muted-foreground">PDF disponible para el acompañante</p>
                  </div>
                  <button onClick={abrirOrden}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0"
                    style={{ background: "#C0546A" }}>
                    <ExternalLink size={11} />Ver
                  </button>
                  <button onClick={handleDeleteOrden}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/10 transition-colors">
                    <Trash2 size={13} className="text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 cursor-pointer hover:border-primary transition-colors">
                  <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
                    disabled={uploadingOrden}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadOrden(f); }} />
                  {uploadingOrden ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                        style={{ borderColor: "#F2C5CE", borderTopColor: "#C0546A" }} />
                      <p className="text-sm font-semibold text-muted-foreground">Subiendo...</p>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Subir orden de la cita</p>
                        <p className="text-xs text-muted-foreground">PDF, JPG o PNG · el acompañante podrá verla</p>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Audio de la cita */}
            {audioSignedUrl && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Mic size={13} />
                  Nota de voz
                </p>
                <div className="rounded-xl border p-3" style={{ background: "#F9F4FF", borderColor: "#C0546A30" }}>
                  <audio
                    src={audioSignedUrl}
                    controls
                    className="w-full h-10"
                    style={{ accentColor: "#C0546A" }}
                  />
                </div>
              </div>
            )}

            {/* Recordatorio WhatsApp */}
            {cita?.estado === "pendiente" && (
              <button
                onClick={handleEnviarRecordatorio}
                disabled={enviandoWA || waEnviado}
                className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70"
                style={waEnviado
                  ? { background: "#22c55e", color: "#fff" }
                  : { background: "#25D366", color: "#fff" }}
              >
                {waEnviado ? (
                  <><Check size={16} strokeWidth={2.5} /> Recordatorio enviado a todos</>
                ) : enviandoWA ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <><MessageSquare size={16} strokeWidth={2.5} /> Enviar recordatorio por WhatsApp</>
                )}
              </button>
            )}

            {/* Pedir reporte post-cita — cita pasada sin notas */}
            {cita?.fecha_hora && new Date(cita.fecha_hora) < new Date() &&
             !cita.notas_post && !cita.audio_post_url && (
              <button
                onClick={handlePedirReporte}
                disabled={enviandoReporte || reporteEnviado}
                className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70"
                style={reporteEnviado
                  ? { background: "#22c55e", color: "#fff" }
                  : { background: "#FFF3E0", color: "#e65100", border: "1.5px solid #FFB74D" }}
              >
                {reporteEnviado ? (
                  <><Check size={16} strokeWidth={2.5} /> Reporte solicitado</>
                ) : enviandoReporte ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-orange-300 border-t-orange-600 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <><MessageSquare size={16} strokeWidth={2.5} /> Pedir reporte de la cita al acompañante</>
                )}
              </button>
            )}

            {/* Recordatorio de trámite — solo cuando hay auth en tramite */}
            {authsVinculadas.some(a => a.estado === "en_tramite") && (
              <button
                onClick={handlePedirEstadoTramite}
                disabled={enviandoTramite || tramiteEnviado}
                className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70"
                style={tramiteEnviado
                  ? { background: "#22c55e", color: "#fff" }
                  : { background: "#EDE7F6", color: "#6A3EA1" }}
              >
                {tramiteEnviado ? (
                  <><Check size={16} strokeWidth={2.5} /> Recordatorio enviado</>
                ) : enviandoTramite ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <><Bell size={16} strokeWidth={2.5} /> Pedir estado del trámite a la EPS</>
                )}
              </button>
            )}

            {/* Notas previas */}
            {cita?.notas_pre && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Notas previas</p>
                <p className="text-sm text-foreground">{cita.notas_pre}</p>
              </div>
            )}

            {/* Notas post-cita */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={13} />
                  Notas de la cita
                </p>
                {!editandoNotas && (
                  <button
                    onClick={() => { setEditandoNotas(true); setNotasMode("texto"); setAudioPostBlob(null); }}
                    className="flex items-center gap-1 text-xs text-primary font-semibold"
                  >
                    <Edit3 size={12} />
                    {cita?.notas_post || cita?.audio_post_url ? "Editar" : "Agregar"}
                  </button>
                )}
              </div>

              {editandoNotas ? (
                <div className="flex flex-col gap-3">
                  {/* Toggle texto / voz */}
                  <div className="flex rounded-lg overflow-hidden border border-border text-[11px] font-semibold self-start">
                    <button
                      type="button"
                      onClick={() => { setNotasMode("texto"); setAudioPostBlob(null); }}
                      className="px-3 py-1.5 transition-colors"
                      style={notasMode === "texto"
                        ? { background: "#9B8EC4", color: "#fff" }
                        : { background: "transparent", color: "var(--muted-foreground)" }}
                    >
                      ✍️ Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNotasMode("voz"); setNotas(""); }}
                      className="px-3 py-1.5 transition-colors"
                      style={notasMode === "voz"
                        ? { background: "#9B8EC4", color: "#fff" }
                        : { background: "transparent", color: "var(--muted-foreground)" }}
                    >
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
                      {saving ? "Guardando..." : <><Check size={15} /> Guardar</>}
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
                  <Check size={12} /> Notas guardadas
                </p>
              )}
            </div>
            {/* Seguimiento — notas con fecha y hora */}
            <NotasSeguimiento
              citaId={id}
              accentColor="#9B8EC4"
              accentBg="#EDE9F7"
            />

            {/* Eliminar */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{ background: "#FFF0F0", color: "#c62828" }}
              >
                <Trash2 size={15} strokeWidth={2} />
                Eliminar cita
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border-2 p-4 flex flex-col gap-3"
                style={{ borderColor: "#c62828", background: "#FFF0F0" }}
              >
                <p className="text-sm font-bold text-center" style={{ color: "#c62828" }}>¿Eliminar esta cita?</p>
                <p className="text-xs text-center text-muted-foreground">Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={deleting}
                    className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                    style={{ background: "#c62828" }}
                  >
                    <Trash2 size={14} />
                    {deleting ? "Eliminando…" : "Sí, eliminar"}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Bottom sheet: Editar cita ── */}
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
              className="w-full max-w-md md:max-w-xl mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />

              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">Editar cita</h2>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Nombre de la cita */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Nombre de la cita (opcional)</label>
                <Input
                  placeholder="Ej: Cita de control, Revisión de tensión…"
                  value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Especialidad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Especialidad</label>
                <Select
                  value={otraEsp ? "Otra" : editForm.especialidad}
                  onValueChange={v => {
                    if (v === "Otra") { setOtraEsp(true); setEditForm(f => ({ ...f, especialidad: "" })); }
                    else { setOtraEsp(false); setEditForm(f => ({ ...f, especialidad: v ?? "" })); }
                  }}
                >
                  <SelectTrigger className="rounded-xl border-border bg-card h-12">
                    <SelectValue placeholder="Especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESPECIALIDADES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
                <AnimatePresence>
                  {otraEsp && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <Input
                        autoFocus
                        placeholder="Ej: Reumatología, Genética, Hematología…"
                        value={editForm.especialidad}
                        onChange={e => setEditForm(f => ({ ...f, especialidad: e.target.value }))}
                        className="rounded-xl border-border bg-card h-12 mt-1"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Médico */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Médico (opcional)</label>
                <Input
                  placeholder="Nombre del médico"
                  value={editForm.medico}
                  onChange={e => setEditForm(f => ({ ...f, medico: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Fecha</label>
                  <DatePicker
                    value={editForm.fecha}
                    onChange={val => setEditForm(f => ({ ...f, fecha: val }))}
                    className="rounded-xl border-border bg-card"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Hora</label>
                  <Input
                    type="time"
                    value={editForm.hora}
                    onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))}
                    className="rounded-xl border-border bg-card h-12"
                  />
                </div>
              </div>

              {/* Lugar */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Lugar</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Clínica del Country, Cra 15 #98-42"
                    value={editForm.lugar}
                    onChange={e => setEditForm(f => ({ ...f, lugar: e.target.value }))}
                    className="rounded-xl border-border bg-card h-12 pl-9 pr-24"
                  />
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg"
                      style={{ background: "#E8F5E9", color: "#2e7d32" }}>
                      <ExternalLink size={11} />Ver
                    </a>
                  )}
                </div>
                <Input
                  placeholder="Consultorio, piso, torre… (opcional)"
                  value={editForm.lugar_detalle}
                  onChange={e => setEditForm(f => ({ ...f, lugar_detalle: e.target.value }))}
                  className="rounded-xl border-border bg-card h-11 text-sm"
                />
              </div>

              {/* Acompañante */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">¿Quién la acompaña? (opcional)</label>
                <Select value={editForm.acompanante_id} onValueChange={v => setEditForm(f => ({ ...f, acompanante_id: v ?? "" }))}>
                  <SelectTrigger className="rounded-xl border-border bg-card h-12">
                    {(() => {
                      const m = editForm.acompanante_id ? acompanantes.find(x => x.id === editForm.acompanante_id) : null;
                      return (
                        <span className={`flex-1 text-left text-sm truncate${m ? "" : " text-muted-foreground"}`}>
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
              </div>

              <button
                type="button"
                onClick={handleGuardarEdicion}
                disabled={!editForm.especialidad || savingEdit}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#C0546A" }}
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

function InfoRow({ icon: Icon, label, value, accent = false, mapsLink }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean; mapsLink?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={15} className={accent ? "text-primary" : "text-muted-foreground"} />
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className={cn("text-sm font-semibold flex-1 min-w-0 truncate", accent ? "text-primary" : "text-foreground")}>{value}</span>
      {mapsLink && (
        <a href={mapsLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg shrink-0"
          style={{ background: "#E8F5E9", color: "#2e7d32" }}>
          <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}
