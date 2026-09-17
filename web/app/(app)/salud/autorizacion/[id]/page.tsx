"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Shield, Check, Clock, FileText, X, Trash2, Building2, Phone,
  Edit3, ChevronDown, Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { AutorizacionEPS, TipoAutorizacion, EstadoAutorizacion } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function diasRestantes(fechaOrden: string) {
  const venc = new Date(fechaOrden + "T12:00:00");
  venc.setDate(venc.getDate() + 120);
  return Math.ceil((venc.getTime() - Date.now()) / 86400000);
}

function vencimientoTexto(fechaOrden: string) {
  const venc = new Date(fechaOrden + "T12:00:00");
  venc.setDate(venc.getDate() + 120);
  const dias = Math.ceil((venc.getTime() - Date.now()) / 86400000);
  const fechaStr = venc.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  if (dias <= 0)  return { txt: `Venció el ${fechaStr}`, color: "#c62828", bg: "#FFEBEE" };
  if (dias <= 15) return { txt: `🔴 Vence en ${dias} días (${fechaStr}) — ¡urgente!`, color: "#c62828", bg: "#FFEBEE" };
  if (dias <= 30) return { txt: `⚠️ Vence en ${dias} días (${fechaStr})`, color: "#e65100", bg: "#FFF3E0" };
  return { txt: `Vence en ${dias} días (${fechaStr})`, color: "#2e7d32", bg: "#E8F5E9" };
}

const TIPO_LABELS: Record<string, string> = {
  cita: "🏥 Cita con especialista",
  examen: "🔬 Examen diagnóstico",
  laboratorio: "🧪 Laboratorio",
  procedimiento: "⚕️ Procedimiento",
};

const ACCENT = "#C0546A";

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  sin_gestionar: { label: "Sin gestionar", color: "#5C6BC0", bg: "#E8EAF6" },
  en_tramite:    { label: "En trámite",    color: "#e65100", bg: "#FFF3E0" },
  autorizada:    { label: "Autorizada",    color: "#2e7d32", bg: "#E8F5E9" },
};

export default function DetalleAutorizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [auth, setAuth] = useState<AutorizacionEPS | null>(null);
  const [loading, setLoading] = useState(true);

  // ClickUp-style inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEstadoMenu, setShowEstadoMenu] = useState(false);

  const [editForm, setEditForm] = useState({
    descripcion: "",
    tipo: "examen" as TipoAutorizacion,
    fecha_orden: "",
    estado: "sin_gestionar" as EstadoAutorizacion,
    fecha_envio_eps: "",
    numero_autorizacion: "",
    fecha_autorizacion: "",
    nombre_prestador: "",
    telefono_prestador: "",
    notas: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("autorizaciones_eps")
      .select("*, paciente:paciente_id(*), cita:cita_id(id,especialidad,fecha_hora), examen:examen_id(id,nombre,tipo)")
      .eq("id", id)
      .single();
    setAuth(data as AutorizacionEPS);
    if (data) {
      setEditForm({
        descripcion:         data.descripcion ?? "",
        tipo:                data.tipo ?? "examen",
        fecha_orden:         data.fecha_orden ?? "",
        estado:              data.estado ?? "sin_gestionar",
        fecha_envio_eps:     data.fecha_envio_eps ?? "",
        numero_autorizacion: data.numero_autorizacion ?? "",
        fecha_autorizacion:  data.fecha_autorizacion ?? "",
        nombre_prestador:    data.nombre_prestador ?? "",
        telefono_prestador:  data.telefono_prestador ?? "",
        notas:               data.notas ?? "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGuardar = async () => {
    if (!editForm.descripcion.trim() || !editForm.fecha_orden) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").update({
      descripcion:         editForm.descripcion.trim(),
      tipo:                editForm.tipo,
      fecha_orden:         editForm.fecha_orden,
      estado:              editForm.estado,
      fecha_envio_eps:     editForm.fecha_envio_eps     || null,
      numero_autorizacion: editForm.numero_autorizacion.trim() || null,
      fecha_autorizacion:  editForm.fecha_autorizacion  || null,
      nombre_prestador:    editForm.nombre_prestador.trim()    || null,
      telefono_prestador:  editForm.telefono_prestador.trim()  || null,
      notas:               editForm.notas.trim()               || null,
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setEditingField(null);
    await cargar();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCambiarEstado = async (estado: EstadoAutorizacion) => {
    setShowEstadoMenu(false);
    setEditForm(f => ({ ...f, estado }));
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").update({ estado }).eq("id", id);
    setAuth(a => a ? { ...a, estado } : a);
  };

  const handleEliminar = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").delete().eq("id", id);
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background pb-20 max-w-2xl mx-auto pt-6 px-4 flex flex-col gap-3">
        <Skeleton className="h-8 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-2/3 rounded-lg" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  const venc = auth?.fecha_orden ? vencimientoTexto(auth.fecha_orden) : null;
  const dias = auth?.fecha_orden ? diasRestantes(auth.fecha_orden) : 999;
  const semColor = dias > 30 ? "#2E7D6A" : dias > 15 ? "#e65100" : "#c62828";
  const estadoCfg = ESTADO_CONFIG[auth?.estado ?? "sin_gestionar"];

  return (
    <div className="min-h-dvh bg-background pb-24" onClick={() => showEstadoMenu && setShowEstadoMenu(false)}>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 shrink-0">
            <ArrowLeft size={18} style={{ color: ACCENT }} strokeWidth={2.5} />
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Autorizaciones</span>
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
                  className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-30 min-w-[160px]"
                >
                  {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => handleCambiarEstado(key as EstadoAutorizacion)}
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
          <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: ACCENT }}>
            {TIPO_LABELS[auth?.tipo ?? "examen"]}
          </p>
          {editingField === "descripcion" ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={editForm.descripcion}
                onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Ej: Ecocardiograma, Consulta Cardiología"
                className="text-xl font-extrabold h-11 rounded-xl border-border bg-card flex-1"
                onKeyDown={e => {
                  if (e.key === "Enter") handleGuardar();
                  if (e.key === "Escape") setEditingField(null);
                }}
              />
              <button onClick={() => handleGuardar()}
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
            <button onClick={() => setEditingField("descripcion")} className="text-left group flex items-start gap-2 w-full">
              <h1 className="text-2xl font-extrabold text-foreground leading-tight">{auth?.descripcion}</h1>
              <Edit3 size={14} className="mt-2 opacity-0 group-hover:opacity-30 transition-opacity text-muted-foreground shrink-0" />
            </button>
          )}
        </div>

        {saved && (
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

        <div className="flex flex-col gap-3 mt-2">

          {/* Número de autorización — destacado si existe */}
          {auth?.numero_autorizacion ? (
            <div className="rounded-xl p-4 flex flex-col gap-1"
              style={{ background: "#E8F5E9", border: "2px solid #4CAF50" }}>
              <div className="flex items-center gap-2 mb-1">
                <Check size={16} color="#2e7d32" strokeWidth={2.5} />
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2e7d32" }}>
                  Autorización aprobada
                </p>
              </div>
              <p className="text-2xl font-extrabold" style={{ color: "#2e7d32" }}>
                N° {auth.numero_autorizacion}
              </p>
              {auth.fecha_autorizacion && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aprobada el {new Date(auth.fecha_autorizacion + "T12:00:00").toLocaleDateString("es-CO", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              )}
            </div>
          ) : auth?.estado === "autorizada" ? (
            <button
              onClick={() => setEditingField("numero_autorizacion")}
              className="rounded-xl p-4 text-left w-full transition-all active:scale-[0.98]"
              style={{ background: "#FFF3E0", border: "2px dashed #FF9800" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield size={15} color="#e65100" />
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#e65100" }}>
                  ¡Te aprobaron la autorización!
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">Toca aquí para ingresar el número que te dio la EPS</p>
            </button>
          ) : null}

          {/* Properties card */}
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Detalles</p>
            <div className="-mx-1 flex flex-col divide-y divide-border">

              {/* Fecha de la orden */}
              <PropRow
                icon={Calendar}
                label="Fecha orden"
                value={auth?.fecha_orden
                  ? new Date(auth.fecha_orden + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
                  : undefined}
                placeholder="Sin fecha"
                isEditing={editingField === "fecha_orden"}
                onStartEdit={() => setEditingField("fecha_orden")}
                onSave={() => handleGuardar()}
                onCancel={() => setEditingField(null)}
              >
                <DatePicker
                  value={editForm.fecha_orden}
                  onChange={val => setEditForm(f => ({ ...f, fecha_orden: val }))}
                  className="rounded-lg border-border bg-card h-9 w-full"
                />
              </PropRow>

              {/* Vigencia (solo lectura) */}
              {auth?.fecha_orden && venc && (
                <div className="flex items-start gap-3 px-2 py-2.5">
                  <Clock size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">Vigencia</span>
                  <span className="text-sm flex-1" style={{ color: venc.color }}>{venc.txt}</span>
                </div>
              )}

              {/* Fecha envío EPS — solo si aplica */}
              {(editForm.estado === "en_tramite" || auth?.fecha_envio_eps) && (
                <PropRow
                  icon={Clock}
                  label="Enviada EPS"
                  value={auth?.fecha_envio_eps
                    ? new Date(auth.fecha_envio_eps + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
                    : undefined}
                  placeholder="Sin fecha"
                  isEditing={editingField === "fecha_envio_eps"}
                  onStartEdit={() => setEditingField("fecha_envio_eps")}
                  onSave={() => handleGuardar()}
                  onCancel={() => setEditingField(null)}
                >
                  <DatePicker
                    value={editForm.fecha_envio_eps}
                    onChange={val => setEditForm(f => ({ ...f, fecha_envio_eps: val }))}
                    className="rounded-lg border-border bg-card h-9 w-full"
                  />
                </PropRow>
              )}

              {/* Número de autorización — editable siempre desde aquí también */}
              <PropRow
                icon={Shield}
                label="N° autorización"
                value={auth?.numero_autorizacion || undefined}
                placeholder="Sin número"
                isEditing={editingField === "numero_autorizacion"}
                onStartEdit={() => setEditingField("numero_autorizacion")}
                onSave={() => handleGuardar()}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  autoFocus
                  placeholder="Ej: 12345678"
                  value={editForm.numero_autorizacion}
                  onChange={e => setEditForm(f => ({ ...f, numero_autorizacion: e.target.value }))}
                  className="h-9 rounded-lg font-mono font-bold flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardar(); if (e.key === "Escape") setEditingField(null); }}
                />
              </PropRow>

              {/* Fecha de autorización */}
              {(editForm.estado === "autorizada" || auth?.fecha_autorizacion) && (
                <PropRow
                  icon={Calendar}
                  label="Autorizada"
                  value={auth?.fecha_autorizacion
                    ? new Date(auth.fecha_autorizacion + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
                    : undefined}
                  placeholder="Sin fecha"
                  isEditing={editingField === "fecha_autorizacion"}
                  onStartEdit={() => setEditingField("fecha_autorizacion")}
                  onSave={() => handleGuardar()}
                  onCancel={() => setEditingField(null)}
                >
                  <DatePicker
                    value={editForm.fecha_autorizacion}
                    onChange={val => setEditForm(f => ({ ...f, fecha_autorizacion: val }))}
                    className="rounded-lg border-border bg-card h-9 w-full"
                  />
                </PropRow>
              )}

              {/* Nombre del prestador */}
              <PropRow
                icon={Building2}
                label="Prestador"
                value={auth?.nombre_prestador || undefined}
                placeholder="Sin asignar"
                isEditing={editingField === "nombre_prestador"}
                onStartEdit={() => setEditingField("nombre_prestador")}
                onSave={() => handleGuardar()}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  autoFocus
                  placeholder="Ej: Clínica del Country, Centro Médico Dávila"
                  value={editForm.nombre_prestador}
                  onChange={e => setEditForm(f => ({ ...f, nombre_prestador: e.target.value }))}
                  className="h-9 rounded-lg flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardar(); if (e.key === "Escape") setEditingField(null); }}
                />
              </PropRow>

              {/* Teléfono del prestador */}
              <PropRow
                icon={Phone}
                label="Teléfono"
                value={auth?.telefono_prestador || undefined}
                placeholder="Sin asignar"
                isEditing={editingField === "telefono_prestador"}
                onStartEdit={() => setEditingField("telefono_prestador")}
                onSave={() => handleGuardar()}
                onCancel={() => setEditingField(null)}
              >
                <Input
                  autoFocus
                  type="tel"
                  placeholder="Ej: 601 5551234"
                  value={editForm.telefono_prestador}
                  onChange={e => setEditForm(f => ({ ...f, telefono_prestador: e.target.value }))}
                  className="h-9 rounded-lg flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleGuardar(); if (e.key === "Escape") setEditingField(null); }}
                />
              </PropRow>

              {/* Notas */}
              <PropRow
                icon={FileText}
                label="Notas"
                value={auth?.notas || undefined}
                placeholder="Sin notas"
                isEditing={editingField === "notas"}
                onStartEdit={() => setEditingField("notas")}
                onSave={() => handleGuardar()}
                onCancel={() => setEditingField(null)}
              >
                <textarea
                  autoFocus
                  placeholder="Número de radicado, médico que firmó, observaciones..."
                  value={editForm.notas}
                  onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                  rows={2}
                />
              </PropRow>

            </div>
          </div>

          {/* Vinculada a / paciente (solo lectura) */}
          {((auth?.cita || auth?.examen) || auth?.paciente) && (
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
              {(auth?.cita || auth?.examen) && (
                <div className="flex items-center gap-3">
                  <Shield size={14} color={ACCENT} className="shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vinculada a</p>
                    <p className="text-sm font-semibold text-foreground">
                      {auth.cita ? `Cita: ${auth.cita.especialidad}` : `Examen: ${auth.examen?.nombre}`}
                    </p>
                  </div>
                </div>
              )}
              {auth?.paciente && (
                <div className="flex items-center gap-3">
                  <div className="text-base shrink-0">{auth.paciente.emoji}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paciente</p>
                    <p className="text-sm font-semibold text-foreground">{auth.paciente.nombre}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Barra de vigencia visual */}
          {auth?.fecha_orden && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Vigencia de la orden</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, (dias / 120) * 100))}%`,
                      background: semColor,
                    }}
                  />
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: semColor }}>
                  {dias > 0 ? `${dias}d` : "Vencida"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Las órdenes de la EPS tienen 120 días de vigencia desde la fecha de emisión.
              </p>
            </div>
          )}

          {/* Eliminar autorización */}
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{ background: "#FFF0F0", color: "#c62828" }}
              >
                <Trash2 size={14} strokeWidth={2} />Eliminar autorización
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 p-4 flex flex-col gap-3"
                style={{ borderColor: "#c62828", background: "#FFF0F0" }}
              >
                <p className="text-sm font-bold text-center" style={{ color: "#c62828" }}>¿Eliminar esta autorización?</p>
                <p className="text-xs text-center text-muted-foreground">Se borrará permanentemente y no podrás recuperarla.</p>
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
