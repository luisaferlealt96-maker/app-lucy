"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, FlaskConical, FileText, Upload, Trash2,
  MapPin, Calendar, Check, ExternalLink, Clock, X, Pencil, Shield, Users, Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { uploadDocumentoMedico, getUrlDocumento, deleteDocumento } from "@/lib/supabase/storage";
import type { Examen, AutorizacionEPS, MiembroFamilia } from "@/lib/supabase/types";
import { useMiembros } from "@/hooks/useSalud";

const TIPO_LABEL: Record<string, string> = {
  laboratorio: "Laboratorio",
  examen: "Examen diagnóstico",
  procedimiento: "Procedimiento",
};

const ESTADO_COLOR: Record<string, { bg: string; color: string }> = {
  pendiente: { bg: "#FFF3E0", color: "#e65100" },
  listo:     { bg: "#E8F5E9", color: "#2e7d32" },
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

  // Editar
  const [showEdit, setShowEdit] = useState(false);
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

  const cambiarEstado = async (estado: "pendiente" | "en_proceso" | "listo") => {
    if (!examen) return;
    const supabase = createClient();
    const hoy = new Date().toISOString().split("T")[0];
    const updates: Record<string, string | null> = { estado };
    if (estado === "listo" && !examen.fecha_realizacion) updates.fecha_realizacion = hoy;
    if (estado !== "listo") updates.fecha_realizacion = null;
    await supabase.from("examenes").update(updates).eq("id", examen.id);
    await cargar();
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

  const handleGuardarEdicion = async () => {
    if (!examen || !editForm.nombre) return;
    setSavingEdit(true);
    const supabase = createClient();
    await supabase.from("examenes").update({
      nombre: editForm.nombre,
      tipo: editForm.tipo,
      especialidad: editForm.especialidad || null,
      fecha_solicitud: editForm.fecha_solicitud || null,
      hora: editForm.hora || null,
      lugar: editForm.lugar || null,
      acompanante_id: editForm.acompanante_id || null,
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
        <div className="w-8 h-8 rounded-full border-2 border-[#9B8EC4] border-t-transparent animate-spin" />
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

  const estadoStyle = ESTADO_COLOR[examen.estado] ?? ESTADO_COLOR["pendiente"];
  const fechaTexto = examen.fecha_solicitud
    ? new Date(examen.fecha_solicitud + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-dvh bg-background pb-20 max-w-lg md:max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-5" style={{ background: "#EDE9F7" }}>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#9B8EC4" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#9B8EC4" }}>Salud</span>
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{ background: "#9B8EC422", color: "#9B8EC4" }}>
              {TIPO_LABEL[examen.tipo] ?? examen.tipo}
            </span>
            <h1 className="text-xl font-extrabold text-foreground mt-1 leading-tight">{examen.nombre}</h1>
            {examen.especialidad && <p className="text-sm text-muted-foreground mt-0.5">{examen.especialidad}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.5)", color: "#9B8EC4" }}
            >
              <Pencil size={12} strokeWidth={2.5} />
              Editar
            </button>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: estadoStyle.bg, color: estadoStyle.color }}>
              {examen.estado === "listo" ? "Realizado" : "Pendiente"}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {savedEdit && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ background: "#EDE9F7" }}>
            <Check size={15} color="#9B8EC4" strokeWidth={2.5} />
            <p className="text-sm font-semibold" style={{ color: "#9B8EC4" }}>Procedimiento actualizado</p>
          </motion.div>
        )}

        {/* Info */}
        {(fechaTexto || !fechaTexto || examen.lugar || examen.notas) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5">
            {fechaTexto ? (
              <div className="flex items-center gap-2.5">
                <Calendar size={15} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground capitalize">{fechaTexto}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Clock size={15} style={{ color: "#e65100" }} className="shrink-0" />
                <span className="text-sm font-semibold" style={{ color: "#e65100" }}>Pendiente por agendar</span>
              </div>
            )}
            {examen.hora && (
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">
                  {(() => { const [h, m] = examen.hora!.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? "p.m." : "a.m."}`; })()}
                </span>
              </div>
            )}
            {examen.lugar && (
              <div className="flex items-center gap-2.5">
                <MapPin size={15} className="text-muted-foreground shrink-0" />
                <a href={`https://maps.google.com/?q=${encodeURIComponent(examen.lugar)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-foreground underline-offset-2 hover:underline flex items-center gap-1">
                  {examen.lugar}
                  <ExternalLink size={11} className="text-muted-foreground" />
                </a>
              </div>
            )}
            {examen.acompanante && (
              <div className="flex items-center gap-2.5">
                <Users size={15} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{(examen.acompanante as MiembroFamilia).nombre}</span>
              </div>
            )}
            {examen.notas && (
              <p className="text-sm text-muted-foreground border-t border-border pt-2.5 mt-0.5">{examen.notas}</p>
            )}
          </motion.div>
        )}

        {/* Autorización EPS */}
        {authVinculada && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
            className="rounded-2xl p-4 flex flex-col gap-1"
            style={{ background: "#E8F5E9", border: "2px solid #4CAF50" }}>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield size={14} color="#2e7d32" strokeWidth={2.5} />
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
          </motion.div>
        )}

        {/* Orden médica */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Orden médica</p>
          <PDFSlot
            label="Orden médica"
            storagePath={examen.archivo_orden_url}
            uploading={uploadingOrden}
            onUpload={f => handleUpload(f, "orden")}
            onDelete={() => handleDelete("orden")}
            onView={() => examen.archivo_orden_url && abrirPDF(examen.archivo_orden_url)}
            accentColor="#9B8EC4"
            accentBg="#EDE9F7"
          />
        </motion.div>

        {/* Resultado */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Resultado</p>
          <PDFSlot
            label="Resultado"
            storagePath={examen.archivo_resultado_url}
            uploading={uploadingResultado}
            onUpload={f => handleUpload(f, "resultado")}
            onDelete={() => handleDelete("resultado")}
            onView={() => examen.archivo_resultado_url && abrirPDF(examen.archivo_resultado_url)}
            accentColor="#2E7D6A"
            accentBg="#E8F5E9"
            hint={!examen.archivo_resultado_url ? "Al subir el resultado se marca el examen como Listo automáticamente." : undefined}
          />
        </motion.div>

        {/* Cambiar estado */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Estado</p>
          <div className="flex gap-2">
            {(["pendiente", "listo"] as const).map(e => {
              const s = ESTADO_COLOR[e];
              const active = examen.estado === e || (e === "pendiente" && examen.estado === "en_proceso");
              return (
                <button key={e} onClick={() => cambiarEstado(e)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all"
                  style={active
                    ? { background: s.bg, color: s.color, borderColor: s.color }
                    : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
                  {e === "listo" ? "Realizado" : "Pendiente"}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Enviar recordatorio */}
        {examen.acompanante_id && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            {notificado ? (
              <div className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                style={{ background: "#E8F5E9", color: "#2e7d32" }}>
                <Check size={15} strokeWidth={2.5} />
                Recordatorio enviado
              </div>
            ) : (
              <button
                onClick={handleEnviarRecordatorio}
                disabled={notificando}
                className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
                style={{ background: "#EDE9F7", color: "#9B8EC4" }}
              >
                <Bell size={15} strokeWidth={2} />
                {notificando ? "Enviando…" : "Enviar recordatorio por WhatsApp"}
              </button>
            )}
          </motion.div>
        )}

        {/* Eliminar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full h-11 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ background: "#FFF0F0", color: "#c62828" }}
            >
              <Trash2 size={15} strokeWidth={2} />
              Eliminar procedimiento
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 p-4 flex flex-col gap-3"
              style={{ borderColor: "#c62828", background: "#FFF0F0" }}
            >
              <p className="text-sm font-bold text-center" style={{ color: "#c62828" }}>¿Eliminar este procedimiento?</p>
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
        </motion.div>
      </div>

      {/* ── Bottom sheet: Editar procedimiento ── */}
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
                <h2 className="text-base font-extrabold text-foreground">Editar procedimiento</h2>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Nombre</label>
                <Input
                  placeholder="Ej: Hemograma completo, Radiografía de tórax"
                  value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Tipo</label>
                <Select
                  value={editForm.tipo}
                  onValueChange={v => setEditForm(f => ({ ...f, tipo: v as typeof editForm.tipo }))}
                >
                  <SelectTrigger className="rounded-xl border-border bg-card h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laboratorio">Laboratorio</SelectItem>
                    <SelectItem value="examen">Examen diagnóstico</SelectItem>
                    <SelectItem value="procedimiento">Procedimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Especialidad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Especialidad (opcional)</label>
                <Input
                  placeholder="Ej: Cardiología, Neurología"
                  value={editForm.especialidad}
                  onChange={e => setEditForm(f => ({ ...f, especialidad: e.target.value }))}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Fecha + Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Fecha (opcional)</label>
                  <Input
                    type="date"
                    value={editForm.fecha_solicitud}
                    onChange={e => setEditForm(f => ({ ...f, fecha_solicitud: e.target.value }))}
                    className="rounded-xl border-border bg-card h-12"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Hora (opcional)</label>
                  <Input
                    type="time"
                    value={editForm.hora}
                    onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))}
                    className="rounded-xl border-border bg-card h-12"
                  />
                </div>
              </div>

              {/* Acompañante */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Acompañante (opcional)</label>
                <Select
                  value={editForm.acompanante_id ?? "none"}
                  onValueChange={v => setEditForm(f => ({ ...f, acompanante_id: v === "none" ? null : v }))}
                >
                  <SelectTrigger className="rounded-xl border-border bg-card h-12">
                    <SelectValue placeholder="Sin acompañante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin acompañante</SelectItem>
                    {miembros.filter(m => m.rol !== "abuela").map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.emoji} {m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lugar */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Lugar (opcional)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Clínica del Country, Laboratorio Cafam"
                    value={editForm.lugar}
                    onChange={e => setEditForm(f => ({ ...f, lugar: e.target.value }))}
                    className="rounded-xl border-border bg-card h-12 pl-9"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Notas (opcional)</label>
                <Textarea
                  placeholder="Indicaciones de preparación, ayuno, etc."
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
                style={{ background: "#9B8EC4" }}
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
      <div className="rounded-2xl border-2 p-4 flex items-center gap-3"
        style={{ borderColor: accentColor + "40", background: accentBg }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accentColor + "20" }}>
          <FileText size={18} color={accentColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: accentColor }}>{label}</p>
          <p className="text-xs text-muted-foreground">PDF guardado</p>
        </div>
        <button onClick={onView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: accentColor, color: "white" }}>
          <ExternalLink size={12} />Ver PDF
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/10 transition-colors ml-1">
          <Trash2 size={14} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-4 py-3.5 cursor-pointer hover:border-[color:var(--accent)] transition-colors"
        style={{ "--accent": accentColor } as React.CSSProperties}>
        <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
          disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        {uploading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0"
              style={{ borderColor: accentColor + "40", borderTopColor: accentColor }} />
            <p className="text-sm font-semibold text-muted-foreground">Subiendo...</p>
          </>
        ) : (
          <>
            <Upload size={18} className="text-muted-foreground shrink-0" />
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
