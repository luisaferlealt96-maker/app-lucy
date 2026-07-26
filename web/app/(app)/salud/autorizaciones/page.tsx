"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Shield, Plus, Calendar, Clock, Check, X, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AutorizacionEPS } from "@/lib/supabase/types";

/* ─── helpers ─────────────────────────────────────────────────────── */

function diasRestantes(fechaOrden: string): number {
  const venc = new Date(fechaOrden + "T12:00:00");
  venc.setDate(venc.getDate() + 120);
  return Math.ceil((venc.getTime() - Date.now()) / 86400000);
}

function semaforo(dias: number): { bg: string; color: string; border: string; label: string } {
  if (dias > 30) return { bg: "#E8F5E9", color: "#2e7d32", border: "#A5D6A7", label: `${dias}d restantes` };
  if (dias > 15) return { bg: "#FFF3E0", color: "#e65100", border: "#FFCC80", label: `⚠️ ${dias}d restantes` };
  if (dias > 0)  return { bg: "#FFEBEE", color: "#c62828", border: "#EF9A9A", label: `🔴 ${dias}d restantes` };
  return { bg: "#FFEBEE", color: "#c62828", border: "#EF9A9A", label: "Vencida" };
}

function diasHabilesDesde(fechaStr: string): number {
  const from = new Date(fechaStr + "T12:00:00");
  const now = new Date();
  let days = 0;
  const cur = new Date(from);
  while (cur < now) {
    cur.setDate(cur.getDate() + 1);
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days++;
  }
  return days;
}

const TIPO_LABEL: Record<string, string> = {
  cita:         "🏥 Cita",
  examen:       "🔬 Examen",
  laboratorio:  "🧪 Laboratorio",
  procedimiento: "⚕️ Procedimiento",
};

const COLUMNS = [
  { id: "sin_gestionar", label: "Sin gestionar", color: "#e65100", bg: "#FFF3E0" },
  { id: "en_tramite",    label: "En trámite",    color: "#1565C0", bg: "#E3F2FD" },
  { id: "autorizada",   label: "Autorizadas",   color: "#2e7d32", bg: "#E8F5E9" },
] as const;

/* ─── page ───────────────────────────────────────────────────────── */

export default function AutorizacionesPage() {
  const router = useRouter();
  const [items, setItems]       = useState<AutorizacionEPS[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<AutorizacionEPS | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [editForm, setEditForm] = useState({
    estado: "", fecha_envio_eps: "", numero_autorizacion: "", fecha_autorizacion: "", notas: "",
  });

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("autorizaciones_eps")
      .select("*")
      .order("fecha_orden", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirEditar = (a: AutorizacionEPS) => {
    setSelected(a);
    setSaved(false);
    setEditForm({
      estado:               a.estado,
      fecha_envio_eps:      a.fecha_envio_eps ?? "",
      numero_autorizacion:  a.numero_autorizacion ?? "",
      fecha_autorizacion:   a.fecha_autorizacion ?? "",
      notas:                a.notas ?? "",
    });
  };

  const guardar = async () => {
    if (!selected) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").update({
      estado:              editForm.estado,
      fecha_envio_eps:     editForm.fecha_envio_eps     || null,
      numero_autorizacion: editForm.numero_autorizacion || null,
      fecha_autorizacion:  editForm.fecha_autorizacion  || null,
      notas:               editForm.notas               || null,
      updated_at:          new Date().toISOString(),
    }).eq("id", selected.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setSelected(null); cargar(); }, 900);
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta autorización?")) return;
    const supabase = createClient();
    await supabase.from("autorizaciones_eps").delete().eq("id", id);
    setSelected(null);
    cargar();
  };

  const grupos: Record<string, AutorizacionEPS[]> = {
    sin_gestionar: items.filter(a => a.estado === "sin_gestionar"),
    en_tramite:    items.filter(a => a.estado === "en_tramite"),
    autorizada:    items.filter(a => a.estado === "autorizada"),
  };

  const pendientes = grupos.sin_gestionar.length + grupos.en_tramite.length;

  return (
    <div className="min-h-dvh bg-background pb-32">

      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-5"
        style={{ background: "#F2C5CE" }}
      >
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>Salud</span>
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={22} color="#C0546A" strokeWidth={2.5} />
            <div>
              <h1 className="text-xl font-extrabold text-foreground">Autorizaciones EPS</h1>
              <p className="text-xs font-medium mt-0.5" style={{ color: "#C0546A" }}>
                {loading ? "…" : `${pendientes} pendiente${pendientes !== 1 ? "s" : ""} de gestión`}
              </p>
            </div>
          </div>
          <Link
            href="/salud/nueva-autorizacion"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: "#C0546A" }}
          >
            <Plus size={15} strokeWidth={2.5} /> Nueva
          </Link>
        </div>
      </motion.div>

      {/* ─── MOBILE — tabs ─── */}
      <div className="lg:hidden px-4 pt-4">
        <Tabs defaultValue="sin_gestionar">
          <TabsList className="w-full bg-secondary rounded-xl mb-4 h-10">
            {COLUMNS.map(col => (
              <TabsTrigger
                key={col.id} value={col.id}
                className="flex-1 rounded-lg text-[11px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {col.label}
                <span
                  className="ml-1 text-[10px] font-bold px-1.5 rounded-full"
                  style={{ background: col.bg, color: col.color }}
                >
                  {grupos[col.id].length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {COLUMNS.map(col => (
            <TabsContent key={col.id} value={col.id}>
              <ColumnContent
                col={col} items={grupos[col.id]} loading={loading}
                onEdit={abrirEditar}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* ─── DESKTOP — 3 columns ─── */}
      <div className="hidden lg:flex gap-4 px-6 pt-5 max-w-screen-xl mx-auto items-start">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
              <span className="text-sm font-bold text-foreground">{col.label}</span>
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: col.bg, color: col.color }}
              >
                {grupos[col.id].length}
              </span>
            </div>
            <ColumnContent col={col} items={grupos[col.id]} loading={loading} onEdit={abrirEditar} />
          </div>
        ))}
      </div>

      {/* ─── Modal de edición ─── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-background rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground pr-4">{selected.descripcion}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{TIPO_LABEL[selected.tipo] ?? selected.tipo}</p>
                <p className="text-xs text-muted-foreground">
                  Orden: {new Date(selected.fecha_orden + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{(() => {
                    const d = diasRestantes(selected.fecha_orden);
                    return d > 0 ? `vence en ${d}d` : "vencida";
                  })()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Estado */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground block mb-2">Estado actual</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "sin_gestionar", label: "Sin gestionar — aún no la envié a la EPS" },
                  { value: "en_tramite",    label: "En trámite — ya la envié, esperando respuesta" },
                  { value: "autorizada",   label: "Autorizada — la EPS la aprobó ✓" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEditForm(f => ({ ...f, estado: opt.value }))}
                    className="text-left rounded-xl border-2 px-3 py-2.5 text-sm transition-all"
                    style={editForm.estado === opt.value
                      ? { borderColor: "#C0546A", background: "#FDF2F4", color: "#C0546A", fontWeight: 700 }
                      : { borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha envío */}
            {(editForm.estado === "en_tramite" || editForm.estado === "autorizada") && (
              <div className="mb-4">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">Fecha en que la enviaste a la EPS</label>
                <Input
                  type="date" value={editForm.fecha_envio_eps}
                  onChange={e => setEditForm(f => ({ ...f, fecha_envio_eps: e.target.value }))}
                  className="h-11 rounded-xl"
                />
                {editForm.fecha_envio_eps && (() => {
                  const d = diasHabilesDesde(editForm.fecha_envio_eps);
                  return (
                    <p className={cn("text-xs mt-1 font-semibold", d >= 5 ? "text-amber-600" : "text-muted-foreground")}>
                      {d >= 5 ? `⚠️ Han pasado ${d} días hábiles — la EPS debería haber respondido` : `${d} día${d !== 1 ? "s" : ""} hábil${d !== 1 ? "es" : ""} de espera`}
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Número de autorización */}
            {editForm.estado === "autorizada" && (
              <>
                <div className="mb-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">Número de autorización</label>
                  <Input
                    placeholder="Ej: 2024-123456-7"
                    value={editForm.numero_autorizacion}
                    onChange={e => setEditForm(f => ({ ...f, numero_autorizacion: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">Fecha de autorización</label>
                  <Input
                    type="date" value={editForm.fecha_autorizacion}
                    onChange={e => setEditForm(f => ({ ...f, fecha_autorizacion: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
              </>
            )}

            {/* Notas */}
            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">Notas</label>
              <textarea
                placeholder="Número de radicado, quién atendió, observaciones..."
                value={editForm.notas}
                onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => eliminar(selected.id)}
                className="px-3 h-11 rounded-xl border border-border text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={saving || saved}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={{ background: saved ? "#22c55e" : "#C0546A" }}
              >
                {saved ? <><Check size={15} /> Guardado</> : saving ? "Guardando…" : <><Check size={15} /> Guardar</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ─── Column content ─────────────────────────────────────────────── */

function ColumnContent({
  col, items, loading, onEdit,
}: {
  col: typeof COLUMNS[number];
  items: AutorizacionEPS[];
  loading: boolean;
  onEdit: (a: AutorizacionEPS) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed p-6 text-center"
        style={{ background: col.bg + "30", borderColor: col.color + "40" }}
      >
        <p className="text-sm text-muted-foreground">Sin órdenes aquí</p>
        <Link href="/salud/nueva-autorizacion">
          <p className="text-xs font-semibold mt-1" style={{ color: col.color }}>+ Agregar orden</p>
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((a, i) => (
        <AutorizacionCard key={a.id} a={a} index={i} onEdit={onEdit} />
      ))}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────── */

function AutorizacionCard({ a, index, onEdit }: {
  a: AutorizacionEPS; index: number; onEdit: (a: AutorizacionEPS) => void;
}) {
  const dias = diasRestantes(a.fecha_orden);
  const sem  = semaforo(dias);
  const diasHab = a.fecha_envio_eps ? diasHabilesDesde(a.fecha_envio_eps) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <button onClick={() => onEdit(a)} className="w-full text-left">
        <div
          className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
          style={{ borderLeft: `3px solid ${sem.color}` }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-sm text-foreground leading-tight">{a.descripcion}</p>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border"
                style={{ background: sem.bg, color: sem.color, borderColor: sem.border }}
              >
                {sem.label}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ background: "#F2C5CE", color: "#C0546A" }}
              >
                {TIPO_LABEL[a.tipo] ?? a.tipo}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar size={10} />
                {new Date(a.fecha_orden + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {a.estado === "en_tramite" && diasHab !== null && (
              <p
                className={`text-xs mt-2 flex items-center gap-1 font-semibold ${diasHab >= 5 ? "text-amber-600" : "text-muted-foreground"}`}
              >
                <Clock size={11} />
                {diasHab >= 5
                  ? `⚠️ ${diasHab} días hábiles esperando respuesta`
                  : `${diasHab} día${diasHab !== 1 ? "s" : ""} hábil${diasHab !== 1 ? "es" : ""} en trámite`}
              </p>
            )}

            {a.estado === "autorizada" && a.numero_autorizacion && (
              <p className="text-xs mt-2 font-bold" style={{ color: "#2e7d32" }}>
                ✓ Auth: {a.numero_autorizacion}
              </p>
            )}

            {a.notas && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{a.notas}</p>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
