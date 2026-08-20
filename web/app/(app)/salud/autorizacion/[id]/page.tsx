"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Shield, Check, Clock, FileText, X, Pencil, Trash2, Building2, Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { AutorizacionEPS, TipoAutorizacion, EstadoAutorizacion } from "@/lib/supabase/types";

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

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  sin_gestionar: { label: "Sin gestionar",  color: "#5C6BC0", bg: "#E8EAF6" },
  en_tramite:    { label: "En trámite",     color: "#e65100", bg: "#FFF3E0" },
  autorizada:    { label: "Autorizada ✓",   color: "#2e7d32", bg: "#E8F5E9" },
};

export default function DetalleAutorizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [auth, setAuth] = useState<AutorizacionEPS | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  // Formulario de edición
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
    if (!editForm.descripcion || !editForm.fecha_orden) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").update({
      descripcion:         editForm.descripcion,
      tipo:                editForm.tipo,
      fecha_orden:         editForm.fecha_orden,
      estado:              editForm.estado,
      fecha_envio_eps:     editForm.fecha_envio_eps     || null,
      numero_autorizacion: editForm.numero_autorizacion || null,
      fecha_autorizacion:  editForm.fecha_autorizacion  || null,
      nombre_prestador:    editForm.nombre_prestador    || null,
      telefono_prestador:  editForm.telefono_prestador  || null,
      notas:               editForm.notas               || null,
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setShowEdit(false);
    await cargar();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEliminar = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").delete().eq("id", id);
    router.back();
  };

  const set = (k: keyof typeof editForm, v: string) =>
    setEditForm(f => ({ ...f, [k]: v }));

  const venc = auth?.fecha_orden ? vencimientoTexto(auth.fecha_orden) : null;
  const dias = auth?.fecha_orden ? diasRestantes(auth.fecha_orden) : 999;
  const semColor = dias > 30 ? "#2E7D6A" : dias > 15 ? "#e65100" : "#c62828";
  const estadoConf = auth ? ESTADO_CONFIG[auth.estado] : null;

  return (
    <div className="min-h-dvh bg-background pb-32 max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-5"
        style={{ background: "#F2C5CE" }}
      >
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>Autorizaciones</span>
        </button>

        {loading ? (
          <Skeleton className="h-14 rounded-xl bg-white/40" />
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Shield size={16} color="#C0546A" strokeWidth={2.5} />
                <p className="text-xs font-bold tracking-wide uppercase" style={{ color: "#C0546A" }}>
                  {TIPO_LABELS[auth?.tipo ?? "examen"]}
                </p>
              </div>
              <h1 className="text-xl font-extrabold text-foreground leading-tight">{auth?.descripcion}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.5)", color: "#C0546A" }}
              >
                <Pencil size={12} strokeWidth={2.5} />
                Editar
              </button>
              {estadoConf && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: estadoConf.bg, color: estadoConf.color }}>
                  {estadoConf.label}
                </span>
              )}
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
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {saved && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ background: "#E8F5E9" }}>
                <Check size={15} color="#2e7d32" strokeWidth={2.5} />
                <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Autorización actualizada</p>
              </motion.div>
            )}

            {/* Número de autorización — destacado si existe */}
            {auth?.numero_autorizacion ? (
              <div className="rounded-2xl p-4 flex flex-col gap-1"
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
                onClick={() => setShowEdit(true)}
                className="rounded-2xl p-4 text-left w-full transition-all active:scale-[0.98]"
                style={{ background: "#FFF3E0", border: "2px dashed #FF9800" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={15} color="#e65100" />
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#e65100" }}>
                    ¡Te aprobaron la autorización!
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">Toca "Editar" para ingresar el número de autorización que te dió la EPS</p>
              </button>
            ) : null}

            {/* Prestador autorizado */}
            {(auth?.nombre_prestador || auth?.telefono_prestador) && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col gap-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 size={13} />
                  Prestador autorizado
                </p>
                {auth.nombre_prestador && (
                  <p className="text-sm font-semibold text-foreground">{auth.nombre_prestador}</p>
                )}
                {auth.telefono_prestador && (
                  <a href={`tel:${auth.telefono_prestador}`}
                    className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "#C0546A" }}>
                    <Phone size={13} />
                    {auth.telefono_prestador}
                  </a>
                )}
              </div>
            )}

            {/* Datos principales */}
            <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
              {auth?.fecha_orden && (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Fecha de la orden</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(auth.fecha_orden + "T12:00:00").toLocaleDateString("es-CO", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                  {venc && (
                    <p className="text-xs font-semibold mt-1" style={{ color: venc.color }}>{venc.txt}</p>
                  )}
                </div>
              )}
              {auth?.fecha_envio_eps && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Clock size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Enviada a la EPS</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(auth.fecha_envio_eps + "T12:00:00").toLocaleDateString("es-CO", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              )}
              {(auth?.cita || auth?.examen) && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Shield size={14} color="#9B8EC4" className="shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vinculada a</p>
                    <p className="text-sm font-semibold text-foreground">
                      {auth.cita ? `Cita: ${auth.cita.especialidad}` : `Examen: ${auth.examen?.nombre}`}
                    </p>
                  </div>
                </div>
              )}
              {auth?.paciente && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="text-base shrink-0">{auth.paciente.emoji}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paciente</p>
                    <p className="text-sm font-semibold text-foreground">{auth.paciente.nombre}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notas */}
            {auth?.notas && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={13} className="text-muted-foreground" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Notas</p>
                </div>
                <p className="text-sm text-foreground">{auth.notas}</p>
              </div>
            )}

            {/* Barra de vigencia visual */}
            {auth?.fecha_orden && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Vigencia de la orden</p>
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
                    Eliminar autorización
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
                    <p className="text-sm font-semibold text-foreground">¿Eliminar esta autorización?</p>
                    <p className="text-xs text-muted-foreground">Se borrará permanentemente y no podrás recuperarla.</p>
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
          </>
        )}
      </motion.div>

      {/* ── Bottom sheet: Editar autorización ── */}
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
              className="w-full max-w-md md:max-w-lg mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} color="#C0546A" strokeWidth={2.5} />
                  <h2 className="text-base font-extrabold text-foreground">Editar autorización</h2>
                </div>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Número de autorización — aparece primero si ya está autorizada */}
              {editForm.estado === "autorizada" && (
                <div className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{ background: "#E8F5E9", border: "2px solid #4CAF50" }}>
                  <div className="flex items-center gap-2">
                    <Check size={15} color="#2e7d32" strokeWidth={2.5} />
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2e7d32" }}>
                      ¡Ingresa el número que te dio la EPS!
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-foreground">Número de autorización</label>
                    <Input
                      autoFocus
                      placeholder="Ej: 12345678"
                      value={editForm.numero_autorizacion}
                      onChange={e => set("numero_autorizacion", e.target.value)}
                      className="rounded-xl border-border bg-white h-13 font-mono text-lg font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-foreground">Fecha en que la autorizaron (opcional)</label>
                    <DatePicker
                      value={editForm.fecha_autorizacion}
                      onChange={val => set("fecha_autorizacion", val)}
                      className="rounded-xl border-border bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-foreground">Nombre del prestador (entidad autorizada)</label>
                    <Input
                      placeholder="Ej: Clínica del Country, Centro Médico Dávila"
                      value={editForm.nombre_prestador}
                      onChange={e => set("nombre_prestador", e.target.value)}
                      className="rounded-xl border-border bg-white h-12"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-foreground">Teléfono del prestador (opcional)</label>
                    <Input
                      type="tel"
                      placeholder="Ej: 601 5551234"
                      value={editForm.telefono_prestador}
                      onChange={e => set("telefono_prestador", e.target.value)}
                      className="rounded-xl border-border bg-white h-12"
                    />
                  </div>
                </div>
              )}

              {/* Estado actual */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">¿En qué punto está?</label>
                <div className="grid grid-cols-1 gap-2">
                  {([
                    { value: "sin_gestionar", label: "Tengo la orden pero aún no la envié a la EPS" },
                    { value: "en_tramite",    label: "Ya la envié y está en revisión en la EPS" },
                    { value: "autorizada",    label: "✅ La EPS ya me autorizó — tengo número" },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => set("estado", opt.value)}
                      className="text-left rounded-xl border-2 px-3 py-2.5 text-sm transition-all"
                      style={editForm.estado === opt.value
                        ? { borderColor: "#C0546A", background: "#FDF2F4", color: "#C0546A", fontWeight: 600 }
                        : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha envío EPS */}
              {(editForm.estado === "en_tramite") && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground">Fecha en que la enviaste a la EPS</label>
                  <DatePicker
                    value={editForm.fecha_envio_eps}
                    onChange={val => set("fecha_envio_eps", val)}
                    className="rounded-xl border-border bg-card"
                  />
                </div>
              )}

              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">¿Qué autorización es?</label>
                <Input
                  placeholder="Ej: Ecocardiograma, Consulta Cardiología"
                  value={editForm.descripcion}
                  onChange={e => set("descripcion", e.target.value)}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Fecha de la orden */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Fecha de la orden médica</label>
                <DatePicker
                  value={editForm.fecha_orden}
                  onChange={val => set("fecha_orden", val)}
                  className="rounded-xl border-border bg-card"
                />
              </div>

              {/* Notas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Notas (opcional)</label>
                <textarea
                  placeholder="Número de radicado, médico que firmó, observaciones..."
                  value={editForm.notas}
                  onChange={e => set("notas", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={handleGuardar}
                disabled={!editForm.descripcion || !editForm.fecha_orden || saving}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#C0546A" }}
              >
                {saving ? "Guardando…" : <><Check size={16} strokeWidth={2.5} /> Guardar cambios</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
