"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Heart, Plus, Calendar, Pill, FlaskConical, Clock, Circle,
  Check, Package, MapPin, Mic, User, Activity, X, FileText,
  ChevronLeft, ChevronRight, LayoutGrid, Pencil, Search, ExternalLink, Shield,
  ChevronDown, Download,
} from "lucide-react";
import Link from "next/link";
import {
  DndContext, DragOverlay,
  useDraggable, useDroppable,
  MouseSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAbuelaData, useMiembros, calcularEdad } from "@/hooks/useSalud";
import { formatFechaHora } from "@/lib/utils/fecha";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { EntregaMedicamento, Cita, Medicamento, Examen, MiembroFamilia, AutorizacionEPS } from "@/lib/supabase/types";

/* ─── utils ─────────────────────────────────────────────────────── */

function formatFechaCorta(fecha: string) {
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function esVencida(fecha: string | null) {
  if (!fecha) return false;
  return new Date(fecha + "T23:59:59") < new Date();
}

/* ─── page ───────────────────────────────────────────────────────── */

export default function SaludPage() {
  const { abuelaId, abuela, citas, medicamentos, examenes, loading, refresh, marcarEntregaReclamada } = useAbuelaData();
  const { miembros } = useMiembros();

  const citasPendienteAgendar = citas.filter(c => c.estado === "por_agendar");
  const citasAgendadas        = citas.filter(c => c.estado === "pendiente");
  const citasCompletadas      = citas.filter(c => c.estado === "completada");
  const citasActivas          = citas.filter(c => c.estado !== "completada" && c.estado !== "cancelada");
  const medsActivos           = medicamentos.filter(m => m.activo);
  const medsPorReclamar       = medsActivos.filter(m => (m.entregas_medicamento ?? []).every(e => e.estado !== "reclamada"));
  const medsConEntregas       = medsActivos.filter(m => (m.entregas_medicamento ?? []).some(e => e.estado === "reclamada"));

  const nuevaCitaHref  = `/salud/nueva-cita${abuelaId ? `?paciente=${abuelaId}` : ""}`;
  const nuevoMedHref   = `/salud/nuevo-medicamento${abuelaId ? `?paciente=${abuelaId}` : ""}`;
  const nuevoExHref    = `/salud/nuevo-examen${abuelaId ? `?paciente=${abuelaId}` : ""}`;
  const nuevoAuthHref  = `/salud/nueva-autorizacion${abuelaId ? `?paciente=${abuelaId}` : ""}`;

  const edad = calcularEdad(abuela?.fecha_nacimiento ?? null);

  // Tab móvil — persistido en sessionStorage para sobrevivir navegación
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("salud_tab") ?? "citas";
    return "citas";
  });
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    sessionStorage.setItem("salud_tab", val);
  };
  const [kanbanBoard, setKanbanBoard] = useState<"citas" | "medicamentos" | "examenes" | "autorizaciones">(() => {
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem("salud_kanban");
      if (s === "citas" || s === "medicamentos" || s === "examenes" || s === "autorizaciones") return s;
    }
    return "citas";
  });
  const handleKanbanBoard = (b: "citas" | "medicamentos" | "examenes" | "autorizaciones") => {
    setKanbanBoard(b);
    sessionStorage.setItem("salud_kanban", b);
  };

  // Search
  const [searchOpen, setSearchOpen] = useState(false);

  // WhatsApp config / settings
  const [plusOpen, setPlusOpen] = useState(false);

  // Autorizaciones EPS
  const [autorizaciones, setAutorizaciones] = useState<AutorizacionEPS[]>([]);
  const [loadingAuth, setLoadingAuth]       = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("autorizaciones_eps")
      .select("*, cita:cita_id(id, especialidad, fecha_hora), examen:examen_id(id, nombre, tipo)")
      .order("fecha_orden", { ascending: false })
      .then(({ data }) => { setAutorizaciones((data ?? []) as AutorizacionEPS[]); setLoadingAuth(false); });
  }, []);

  // Edit datos clínicos
  const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const [editingDatos, setEditingDatos] = useState(false);
  const [savingDatos, setSavingDatos]   = useState(false);
  const [datosForm, setDatosForm] = useState({ tipo_sangre: "", peso: "", altura: "", alergias: "", condiciones: "" });

  useEffect(() => {
    if (abuela) {
      setDatosForm({
        tipo_sangre: abuela.tipo_sangre ?? "",
        peso:        abuela.peso?.toString() ?? "",
        altura:      abuela.altura?.toString() ?? "",
        alergias:    abuela.alergias ?? "",
        condiciones: abuela.condiciones ?? "",
      });
    }
  }, [abuela]);

  const handleSaveDatos = async () => {
    if (!abuelaId) return;
    setSavingDatos(true);
    const supabase = createClient();
    await supabase.from("miembros_familia").update({
      tipo_sangre: datosForm.tipo_sangre || null,
      peso:        datosForm.peso  ? parseFloat(datosForm.peso)  : null,
      altura:      datosForm.altura ? parseFloat(datosForm.altura) : null,
      alergias:    datosForm.alergias    || null,
      condiciones: datosForm.condiciones || null,
    }).eq("id", abuelaId);
    await refresh();
    setSavingDatos(false);
    setEditingDatos(false);
  };

  return (
    <div className="min-h-dvh bg-background pb-28 lg:pb-0">

      {/* ═══ MOBILE ═══════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-14 pb-5"
          style={{ background: "#F2C5CE" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-2xl">👵</div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Heart size={13} color="#C0546A" fill="#C0546A" />
                  <span className="text-xs font-bold tracking-wide" style={{ color: "#C0546A" }}>SALUD Y BIENESTAR</span>
                </div>
                <h1 className="text-xl font-extrabold text-foreground">Mamita Lucy</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Search size={16} color="#C0546A" />
              </button>
              <Link href={nuevaCitaHref}
                className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center active:scale-95 transition-transform"
                style={{ color: "#C0546A" }}
              >
                <Plus size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Calendar,     label: "Citas",        value: loading ? "–" : citasActivas.length.toString(),  tab: "citas" },
              { icon: Pill,         label: "Medicamentos", value: loading ? "–" : medsActivos.length.toString(),   tab: "medicamentos" },
              { icon: FlaskConical, label: "Exámenes",     value: loading ? "–" : examenes.length.toString(),      tab: "examenes" },
            ].map(({ icon: Icon, label, value, tab }, i) => (
              <motion.button key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => handleTabChange(tab)}
                className="bg-white/50 rounded-xl p-3 flex items-center gap-2 active:scale-95 transition-transform text-left">
                <Icon size={16} color="#C0546A" strokeWidth={2} className="shrink-0" />
                <div>
                  <p className="text-xl font-extrabold text-foreground leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Banner Autorizaciones EPS */}
        <div className="px-4 pt-3">
          <Link href="/salud/autorizaciones">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm active:scale-[0.98] transition-all">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F2C5CE" }}>
                <Shield size={17} color="#C0546A" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Autorizaciones EPS</p>
                <p className="text-xs text-muted-foreground">Gestionar órdenes y seguimiento de trámites</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </div>
          </Link>
        </div>

        <div className="px-4 pt-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full bg-secondary rounded-xl mb-4 h-10">
              <TabsTrigger value="citas" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Calendar size={13} className="mr-1" />Citas
              </TabsTrigger>
              <TabsTrigger value="medicamentos" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Pill size={13} className="mr-1" />Medicamentos
              </TabsTrigger>
              <TabsTrigger value="examenes" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FlaskConical size={13} className="mr-1" />Procedimientos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="citas">
              <MobileCitasList citas={citas} loading={loading} nuevaCitaHref={nuevaCitaHref} />
            </TabsContent>
            <TabsContent value="medicamentos">
              <MobileMedsList medicamentos={medicamentos} medsPorReclamar={medsPorReclamar} medsConEntregas={medsConEntregas} loading={loading} nuevoMedHref={nuevoMedHref} marcarEntregaReclamada={marcarEntregaReclamada} />
            </TabsContent>
            <TabsContent value="examenes">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{loading ? "…" : `${examenes.length} pendiente${examenes.length !== 1 ? "s" : ""}`}</p>
                <Link href={nuevoExHref} className="flex items-center gap-1 text-xs font-semibold text-primary"><Plus size={13} />Agregar</Link>
              </div>
              {loading ? (
                <div className="flex flex-col gap-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
              ) : examenes.length === 0 ? (
                <EmptyState icon={FlaskConical} texto="Sin procedimientos registrados" href={nuevoExHref} cta="Agregar" />
              ) : (
                <div className="flex flex-col gap-3">
                  {examenes.map((ex, i) => <ExamenCard key={ex.id} examen={ex} index={i} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ═══ DESKTOP — kanban full-width ══════════════════════════════ */}
      <div className="hidden lg:flex flex-col p-6 h-dvh" style={{ background: "#F2F4F7" }}>

        {/* Header: patient info + action buttons */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-5 shrink-0"
        >
          <div className="flex items-center gap-4">
            <Link href="/salud/perfil">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-black/5 hover:opacity-80 transition-opacity"
                style={{ background: "#F2C5CE" }}>
                {abuela?.emoji ?? "👵"}
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Heart size={13} fill="#C0546A" color="#C0546A" />
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Salud y bienestar</span>
              </div>
              <Link href="/salud/perfil" className="hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-extrabold text-foreground leading-tight">
                  {abuela?.nombre ?? "Mamita Lucy"}
                  {edad && <span className="text-sm font-normal text-muted-foreground ml-2">{edad} años · Bogotá</span>}
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <StatChip label="Tipo" value={abuela?.tipo_sangre ?? "–"} color="#C0546A" bg="#F2C5CE" />
              <StatChip label="Altura" value={abuela?.altura ? `${abuela.altura} m` : "–"} color="#2E7D6A" bg="#B8E2D4" />
              <StatChip label="Peso" value={abuela?.peso ? `${abuela.peso} kg` : "–"} color="#9B8EC4" bg="#EDE9F7" />
              <button
                onClick={() => setEditingDatos(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white transition-colors ml-1"
                style={{ background: "#F2C5CE22" }}
              >
                <Pencil size={13} color="#C0546A" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} title="Buscar"
              className="w-9 h-9 rounded-xl bg-white border border-black/8 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <Search size={15} className="text-foreground" />
            </button>
            <div className="w-px h-5 bg-border mx-0.5" />
            <div className="relative">
              <button
                onClick={() => setPlusOpen(p => !p)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ background: "#C0546A" }}>
                <Plus size={15} strokeWidth={2.5} />Nuevo<ChevronDown size={13} />
              </button>
              {plusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPlusOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-black/8 py-1.5 z-50 min-w-[200px]">
                    <Link href={nuevaCitaHref} onClick={() => setPlusOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FDF2F4] transition-colors text-sm font-semibold text-foreground">
                      <Calendar size={14} color="#C0546A" />Nueva cita
                    </Link>
                    <Link href={nuevoMedHref} onClick={() => setPlusOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0FAF7] transition-colors text-sm font-semibold text-foreground">
                      <Pill size={14} color="#2E7D6A" />Nuevo medicamento
                    </Link>
                    <Link href={nuevoExHref} onClick={() => setPlusOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F5F3FF] transition-colors text-sm font-semibold text-foreground">
                      <FlaskConical size={14} color="#9B8EC4" />Nuevo examen
                    </Link>
                    <div className="h-px bg-border mx-3 my-1" />
                    <Link href={nuevoAuthHref} onClick={() => setPlusOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FDF2F4] transition-colors text-sm font-semibold text-foreground">
                      <Shield size={14} color="#C0546A" />Nueva autorización
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-3 gap-4 mb-5 shrink-0"
        >
          {[
            { icon: Calendar,     label: "Citas activas",            value: loading ? "–" : citasActivas.length.toString(), accent: "#C0546A", bg: "#F2C5CE", board: "citas"          as const },
            { icon: Pill,         label: "Medicamentos activos",     value: loading ? "–" : medsActivos.length.toString(),  accent: "#2E7D6A", bg: "#B8E2D4", board: "medicamentos"   as const },
            { icon: Activity,     label: "Procedimientos pendientes", value: loading ? "–" : examenes.length.toString(),    accent: "#9B8EC4", bg: "#EDE9F7", board: "examenes"        as const },
          ].map(({ icon: Icon, label, value, accent, bg, board }, i) => (
            <motion.button key={label} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.06 }}
              onClick={() => handleKanbanBoard(board)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex items-center gap-4 text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              style={kanbanBoard === board ? { outline: `2px solid ${accent}40` } : {}}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon size={20} color={accent} strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: accent }}>{value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Kanban */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="flex-1 min-h-0"
        >
          <KanbanBoardView
            citas={citas}
            citasPendienteAgendar={citasPendienteAgendar}
            citasAgendadas={citasAgendadas}
            citasCompletadas={citasCompletadas}
            medicamentos={medicamentos}
            medsActivos={medsActivos}
            medsPorReclamar={medsPorReclamar}
            medsConEntregas={medsConEntregas}
            examenes={examenes}
            autorizaciones={autorizaciones}
            loadingAuth={loadingAuth}
            setAutorizaciones={setAutorizaciones}
            loading={loading}
            refresh={refresh}
            nuevaCitaHref={nuevaCitaHref}
            nuevoMedHref={nuevoMedHref}
            nuevoExHref={nuevoExHref}
            nuevoAuthHref={nuevoAuthHref}
            marcarEntregaReclamada={marcarEntregaReclamada}
            activeBoard={kanbanBoard}
            onBoardChange={handleKanbanBoard}
          />
        </motion.div>
      {/* Modal edición datos clínicos */}
      {editingDatos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl p-6 shadow-2xl w-[420px] max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-base text-foreground">Datos clínicos</h3>
              <button onClick={() => setEditingDatos(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100">
                <X size={14} />
              </button>
            </div>

            {/* Tipo de sangre */}
            <div className="mb-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-2">Tipo de sangre</label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_SANGRE.map(t => (
                  <button key={t} onClick={() => setDatosForm(f => ({ ...f, tipo_sangre: t }))}
                    className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all"
                    style={datosForm.tipo_sangre === t
                      ? { borderColor: "#C0546A", background: "#F2C5CE", color: "#C0546A" }
                      : { borderColor: "var(--border)", background: "transparent", color: "var(--muted-foreground)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Peso y altura */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Peso (kg)</label>
                <Input type="number" step="0.1" placeholder="58.0"
                  value={datosForm.peso}
                  onChange={e => setDatosForm(f => ({ ...f, peso: e.target.value }))}
                  className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Altura (m)</label>
                <Input type="number" step="0.01" placeholder="1.60"
                  value={datosForm.altura}
                  onChange={e => setDatosForm(f => ({ ...f, altura: e.target.value }))}
                  className="h-11 rounded-xl" />
              </div>
            </div>

            {/* Alergias */}
            <div className="mb-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Alergias (opcional)</label>
              <textarea
                placeholder="Ej: Penicilina, mariscos, látex..."
                value={datosForm.alergias}
                onChange={e => setDatosForm(f => ({ ...f, alergias: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
            </div>

            {/* Condiciones */}
            <div className="mb-5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Condiciones / antecedentes (opcional)</label>
              <textarea
                placeholder="Ej: Hipertensión, diabetes tipo 2..."
                value={datosForm.condiciones}
                onChange={e => setDatosForm(f => ({ ...f, condiciones: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditingDatos(false)}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveDatos} disabled={savingDatos}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "#C0546A" }}>
                {savingDatos ? "Guardando..." : <><Check size={15} />Guardar</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
      {searchOpen && (
        <SearchOverlay
          citas={citas}
          medicamentos={medicamentos}
          examenes={examenes}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Kanban board ───────────────────────────────────────────────── */

type PendingMove = { type: "cita" | "examen" | "autorizacion"; id: string; targetCol: string };

function diasRestantesAuth(fechaOrden: string): number {
  const venc = new Date(fechaOrden + "T12:00:00");
  venc.setDate(venc.getDate() + 120);
  return Math.ceil((venc.getTime() - Date.now()) / 86400000);
}

function KanbanBoardView({
  citas, citasPendienteAgendar, citasAgendadas, citasCompletadas,
  medicamentos, medsActivos, medsPorReclamar, medsConEntregas, examenes,
  autorizaciones, loadingAuth, setAutorizaciones,
  loading, refresh,
  nuevaCitaHref, nuevoMedHref, nuevoExHref, nuevoAuthHref,
  marcarEntregaReclamada,
  activeBoard, onBoardChange,
}: {
  citas: Cita[]; citasPendienteAgendar: Cita[]; citasAgendadas: Cita[]; citasCompletadas: Cita[];
  medicamentos: Medicamento[]; medsActivos: Medicamento[]; medsPorReclamar: Medicamento[]; medsConEntregas: Medicamento[]; examenes: Examen[];
  autorizaciones: AutorizacionEPS[]; loadingAuth: boolean;
  setAutorizaciones: React.Dispatch<React.SetStateAction<AutorizacionEPS[]>>;
  loading: boolean; refresh: () => void;
  nuevaCitaHref: string; nuevoMedHref: string; nuevoExHref: string; nuevoAuthHref: string;
  marcarEntregaReclamada: (id: string) => void;
  activeBoard: "citas" | "medicamentos" | "examenes" | "autorizaciones";
  onBoardChange: (b: "citas" | "medicamentos" | "examenes" | "autorizaciones") => void;
}) {
  const [citasView, setCitasView] = useState<"kanban" | "calendario">("kanban");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [pendingDate, setPendingDate] = useState("");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const parts = (active.id as string).split(":");
    const type = parts[0];
    const itemId = parts[1];
    const fromCol = parts[2];
    const toCol = over.id as string;
    if (fromCol === toCol) return;

    const supabase = createClient();

    if (type === "cita") {
      if (toCol === "citas-por_agendar") {
        await supabase.from("citas").update({ estado: "por_agendar", fecha_hora: null }).eq("id", itemId);
        refresh();
        return;
      }
      if (toCol === "citas-proximas") {
        await supabase.from("citas").update({ estado: "pendiente" }).eq("id", itemId);
        refresh();
        return;
      }
      if (toCol === "citas-completadas") {
        await supabase.from("citas").update({ estado: "completada" }).eq("id", itemId);
        refresh();
        return;
      }
    }

    if (type === "examen") {
      if (toCol === "ex-programados") {
        await supabase.from("examenes").update({ fecha_solicitud: new Date().toISOString().split("T")[0] }).eq("id", itemId);
        refresh();
        return;
      }
      if (toCol === "ex-realizado") {
        const hoy = new Date().toISOString().split("T")[0];
        await supabase.from("examenes").update({ estado: "listo", fecha_realizacion: hoy }).eq("id", itemId);
        refresh();
        return;
      }
      if (toCol === "ex-por_agendar") {
        await supabase.from("examenes").update({ fecha_solicitud: null, estado: "pendiente", fecha_realizacion: null }).eq("id", itemId);
        refresh();
        return;
      }
    }

    if (type === "med") {
      if (toCol === "meds-inactivos") {
        await supabase.from("medicamentos").update({ activo: false }).eq("id", itemId);
        refresh();
        return;
      }
      if (toCol === "meds-por-reclamar" || toCol === "meds-activos") {
        await supabase.from("medicamentos").update({ activo: true }).eq("id", itemId);
        refresh();
        return;
      }
    }

    if (type === "auth") {
      const refreshAuth = async () => {
        const { data } = await supabase
          .from("autorizaciones_eps")
          .select("*, cita:cita_id(id, especialidad, fecha_hora), examen:examen_id(id, nombre, tipo)")
          .order("fecha_orden", { ascending: false });
        setAutorizaciones(data ?? []);
      };
      if (toCol === "auth-sin_gestionar") {
        await supabase.from("autorizaciones_eps").update({ estado: "sin_gestionar" }).eq("id", itemId);
        await refreshAuth();
        return;
      }
      if (toCol === "auth-en_tramite") {
        await supabase.from("autorizaciones_eps").update({
          estado: "en_tramite",
          fecha_envio_eps: new Date().toISOString().split("T")[0],
        }).eq("id", itemId);
        await refreshAuth();
        return;
      }
      if (toCol === "auth-autorizada") {
        await supabase.from("autorizaciones_eps").update({
          estado: "autorizada",
          fecha_autorizacion: new Date().toISOString().split("T")[0],
        }).eq("id", itemId);
        await refreshAuth();
        return;
      }
    }
  }, [refresh, setAutorizaciones]);

  const confirmMove = async () => {
    if (!pendingMove || !pendingDate) return;
    const supabase = createClient();
    if (pendingMove.type === "cita") {
      await supabase.from("citas").update({
        estado: "pendiente",
        fecha_hora: new Date(pendingDate + "T09:00:00").toISOString(),
      }).eq("id", pendingMove.id);
      refresh();
    } else if (pendingMove.type === "examen") {
      await supabase.from("examenes").update({
        fecha_solicitud: pendingDate,
      }).eq("id", pendingMove.id);
      refresh();
    } else if (pendingMove.type === "autorizacion") {
      await supabase.from("autorizaciones_eps").update({
        estado: "en_tramite",
        fecha_envio_eps: pendingDate,
      }).eq("id", pendingMove.id);
      const { data } = await supabase.from("autorizaciones_eps").select("*, cita:cita_id(id, especialidad, fecha_hora), examen:examen_id(id, nombre, tipo)").order("fecha_orden", { ascending: false });
      setAutorizaciones(data ?? []);
    }
    setPendingMove(null);
    setPendingDate("");
  };

  const boards = [
    { id: "citas"           as const, label: "Citas",           icon: Calendar,     count: citas.length,                                               accent: "#C0546A", bg: "#F2C5CE" },
    { id: "medicamentos"    as const, label: "Medicamentos",    icon: Pill,         count: medsPorReclamar.length + medsConEntregas.length,            accent: "#2E7D6A", bg: "#B8E2D4" },
    { id: "examenes"        as const, label: "Procedimientos",  icon: FlaskConical, count: examenes.length,                                            accent: "#9B8EC4", bg: "#EDE9F7" },
    { id: "autorizaciones"  as const, label: "Autorizaciones",  icon: Shield,       count: autorizaciones.filter(a => a.estado !== "autorizada").length, accent: "#C0546A", bg: "#F2C5CE" },
  ];

  const authSinGestionar = autorizaciones.filter(a => a.estado === "sin_gestionar");
  const authEnTramite    = autorizaciones.filter(a => a.estado === "en_tramite");
  const authAutorizada   = autorizaciones.filter(a => a.estado === "autorizada");

  const exSinFecha    = examenes.filter(e => !e.fecha_solicitud && e.estado !== "listo");
  const exProgramados = examenes.filter(e => !!e.fecha_solicitud && e.estado !== "listo");
  const exListo       = examenes.filter(e => e.estado === "listo");
  const medsInactivos = medicamentos.filter(m => !m.activo);

  const getOverlayContent = () => {
    if (!activeId) return null;
    const [type, id] = activeId.split(":");
    if (type === "cita") {
      const c = citas.find(x => x.id === id);
      const authC = autorizaciones.find(a => a.cita_id === id && a.estado === "autorizada" && !!a.numero_autorizacion);
      return c ? <CitaCard cita={c} index={0} authVinculada={authC} /> : null;
    }
    if (type === "examen") {
      const e = examenes.find(x => x.id === id);
      return e ? <ExamenCard examen={e} index={0} /> : null;
    }
    if (type === "med") {
      const m = medicamentos.find(x => x.id === id);
      return m ? <MedicamentoCard med={m} index={0} marcarEntregaReclamada={marcarEntregaReclamada} /> : null;
    }
    if (type === "auth") {
      const a = autorizaciones.find(x => x.id === id);
      return a ? <AutorizacionCard auth={a} index={0} /> : null;
    }
    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={e => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex flex-col gap-4 h-full">

        {/* Board selector + view toggle */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-black/5 w-fit">
            {boards.map(b => {
              const Icon = b.icon;
              const active = activeBoard === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onBoardChange(b.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={active ? { background: b.bg, color: b.accent } : { color: "var(--muted-foreground)" }}
                >
                  <Icon size={14} strokeWidth={2} />
                  {b.label}
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={active
                      ? { background: b.accent + "25", color: b.accent }
                      : { background: "#f3f4f6", color: "#6b7280" }}>
                    {loading ? "…" : b.count}
                  </span>
                </button>
              );
            })}
            {(activeBoard !== "citas" || citasView === "kanban") && (
              <>
                <div className="w-px h-5 bg-border mx-1" />
                <p className="hidden xl:block text-[11px] text-muted-foreground px-2 select-none">Arrastra para mover</p>
              </>
            )}
          </div>

          {activeBoard === "citas" && (
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-black/5 shadow-sm">
              <button
                onClick={() => setCitasView("kanban")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={citasView === "kanban"
                  ? { background: "#F2C5CE", color: "#C0546A" }
                  : { color: "var(--muted-foreground)" }}
              >
                <LayoutGrid size={13} />Columnas
              </button>
              <button
                onClick={() => setCitasView("calendario")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={citasView === "calendario"
                  ? { background: "#F2C5CE", color: "#C0546A" }
                  : { color: "var(--muted-foreground)" }}
              >
                <Calendar size={13} />Calendario
              </button>
            </div>
          )}
        </div>

        {/* Columns / Calendar */}
        {activeBoard === "citas" && citasView === "calendario" && (
          <CalendarioView citas={citas} examenes={examenes} medicamentos={medicamentos} nuevaCitaHref={nuevaCitaHref} />
        )}
        {!(activeBoard === "citas" && citasView === "calendario") && (
        <div className="flex gap-4 overflow-x-auto pb-2 flex-1 min-h-0" style={{ scrollbarWidth: "thin", alignItems: "flex-start" }}>

          {activeBoard === "citas" && (
            <>
              <KanbanColumn droppableId="citas-por_agendar" title="Por agendar" color="#e65100" bg="#FFF3E0" count={citasPendienteAgendar.length} addHref={nuevaCitaHref} loading={loading}>
                {citasPendienteAgendar.map((c, i) => (
                  <DraggableCard key={c.id} id={`cita:${c.id}:citas-por_agendar`}>
                    <CitaCard cita={c} index={i} authVinculada={autorizaciones.find(a => a.cita_id === c.id && a.estado === "autorizada" && !!a.numero_autorizacion)} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="citas-proximas" title="Próximas" color="#C0546A" bg="#F2C5CE" count={citasAgendadas.length} addHref={nuevaCitaHref} loading={loading}>
                {citasAgendadas.map((c, i) => (
                  <DraggableCard key={c.id} id={`cita:${c.id}:citas-proximas`}>
                    <CitaCard cita={c} index={i} authVinculada={autorizaciones.find(a => a.cita_id === c.id && a.estado === "autorizada" && !!a.numero_autorizacion)} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="citas-completadas" title="Completadas" color="#16a34a" bg="#dcfce7" count={citasCompletadas.length} addHref={nuevaCitaHref} loading={loading} noAdd>
                {citasCompletadas.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#16a34a55", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Arrastra aquí para completar</p>
                  </div>
                ) : citasCompletadas.map((c, i) => (
                  <DraggableCard key={c.id} id={`cita:${c.id}:citas-completadas`}>
                    <CitaCard cita={c} index={i} authVinculada={autorizaciones.find(a => a.cita_id === c.id && a.estado === "autorizada" && !!a.numero_autorizacion)} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
            </>
          )}

          {activeBoard === "medicamentos" && (
            <>
              <KanbanColumn droppableId="meds-por-reclamar" title="Por reclamar" color="#e65100" bg="#FFF3E0" count={medsPorReclamar.length} addHref={nuevoMedHref} loading={loading}>
                {medsPorReclamar.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#e6510055", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Medicamentos recién registrados aparecen aquí</p>
                  </div>
                ) : medsPorReclamar.map((m, i) => (
                  <DraggableCard key={m.id} id={`med:${m.id}:meds-por-reclamar`}>
                    <MedicamentoCard med={m} index={i} marcarEntregaReclamada={marcarEntregaReclamada} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="meds-activos" title="Activos" color="#2E7D6A" bg="#B8E2D4" count={medsConEntregas.length} addHref={nuevoMedHref} loading={loading} noAdd>
                {medsConEntregas.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#2E7D6A55", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Cuando reclames la primera entrega, el medicamento pasa aquí</p>
                  </div>
                ) : medsConEntregas.map((m, i) => (
                  <DraggableCard key={m.id} id={`med:${m.id}:meds-activos`}>
                    <MedicamentoCard med={m} index={i} marcarEntregaReclamada={marcarEntregaReclamada} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="meds-inactivos" title="Inactivos" color="#6b7280" bg="#f3f4f6" count={medsInactivos.length} addHref={nuevoMedHref} loading={loading} noAdd>
                {medsInactivos.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#6b728055", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Arrastra aquí para desactivar</p>
                  </div>
                ) : medsInactivos.map((m, i) => (
                  <DraggableCard key={m.id} id={`med:${m.id}:meds-inactivos`}>
                    <MedicamentoCard med={m} index={i} marcarEntregaReclamada={marcarEntregaReclamada} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
            </>
          )}

          {activeBoard === "examenes" && (
            <>
              <KanbanColumn droppableId="ex-por_agendar" title="Por agendar" color="#e65100" bg="#FFF3E0" count={exSinFecha.length} addHref={nuevoExHref} loading={loading}>
                {exSinFecha.map((e, i) => (
                  <DraggableCard key={e.id} id={`examen:${e.id}:ex-por_agendar`}>
                    <ExamenCard examen={e} index={i} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="ex-programados" title="Programados" color="#9B8EC4" bg="#EDE9F7" count={exProgramados.length} addHref={nuevoExHref} loading={loading}>
                {exProgramados.map((e, i) => (
                  <DraggableCard key={e.id} id={`examen:${e.id}:ex-programados`}>
                    <ExamenCard examen={e} index={i} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="ex-realizado" title="Realizado" color="#2e7d32" bg="#E8F5E9" count={exListo.length} addHref={nuevoExHref} loading={loading} noAdd>
                {exListo.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#2e7d3255", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Arrastra aquí cuando ya se realizó</p>
                  </div>
                ) : exListo.map((e, i) => (
                  <DraggableCard key={e.id} id={`examen:${e.id}:ex-realizado`}>
                    <ExamenCard examen={e} index={i} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
            </>
          )}

          {activeBoard === "autorizaciones" && (
            <>
              <KanbanColumn droppableId="auth-sin_gestionar" title="Sin gestionar" color="#e65100" bg="#FFF3E0" count={authSinGestionar.length} addHref={nuevoAuthHref} loading={loadingAuth}>
                {authSinGestionar.map((a, i) => (
                  <DraggableCard key={a.id} id={`auth:${a.id}:auth-sin_gestionar`}>
                    <AutorizacionCard auth={a} index={i} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="auth-en_tramite" title="En trámite" color="#1565C0" bg="#E3F2FD" count={authEnTramite.length} addHref={nuevoAuthHref} loading={loadingAuth} noAdd>
                {authEnTramite.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#1565C055", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Arrastra aquí cuando la enviaste a la EPS</p>
                  </div>
                ) : authEnTramite.map((a, i) => (
                  <DraggableCard key={a.id} id={`auth:${a.id}:auth-en_tramite`}>
                    <AutorizacionCard auth={a} index={i} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
              <KanbanColumn droppableId="auth-autorizada" title="Autorizada" color="#2E7D6A" bg="#B8E2D4" count={authAutorizada.length} addHref={nuevoAuthHref} loading={loadingAuth} noAdd>
                {authAutorizada.length === 0 ? (
                  <div className="rounded-xl p-5 text-center border border-dashed mt-1"
                    style={{ borderColor: "#2E7D6A55", background: "white" }}>
                    <p className="text-xs text-muted-foreground">Arrastra aquí cuando la aprueben</p>
                  </div>
                ) : authAutorizada.map((a, i) => (
                  <DraggableCard key={a.id} id={`auth:${a.id}:auth-autorizada`}>
                    <AutorizacionCard auth={a} index={i} />
                  </DraggableCard>
                ))}
              </KanbanColumn>
            </>
          )}
        </div>
        )}
      </div>

      {/* Drag overlay — ghost card */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="opacity-80 rotate-1 shadow-2xl scale-[1.03] pointer-events-none">
            {getOverlayContent()}
          </div>
        ) : null}
      </DragOverlay>

      {/* Date picker modal */}
      {pendingMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl p-6 shadow-2xl w-80"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-foreground">Asignar fecha</h3>
              <button
                onClick={() => { setPendingMove(null); setPendingDate(""); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {pendingMove.type === "cita"
                ? "¿Para cuándo es la cita? Se guardará a las 9:00 a.m."
                : pendingMove.type === "autorizacion"
                  ? "¿Cuándo enviaste la orden a la EPS?"
                  : "¿Cuándo está programado el examen?"}
            </p>
            <DatePicker
              value={pendingDate}
              onChange={val => setPendingDate(val)}
              className="mb-4 rounded-xl"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setPendingMove(null); setPendingDate(""); }}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmMove}
                disabled={!pendingDate}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                style={{ background: pendingMove.type === "cita" ? "#C0546A" : "#9B8EC4" }}
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DndContext>
  );
}

/* ─── DnD primitives ─────────────────────────────────────────────── */

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  // Don't transform the ghost — DragOverlay handles the moving visual
  const style = (!isDragging && transform) ? { transform: CSS.Translate.toString(transform) } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0.3 : 1 }}
      className="touch-none"
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function KanbanColumn({
  droppableId, title, color, bg, count, addHref, loading, noAdd = false, children,
}: {
  droppableId: string; title: string; color: string; bg: string; count: number; addHref: string;
  loading: boolean; noAdd?: boolean; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  return (
    <div
      ref={setNodeRef}
      className="w-[280px] shrink-0 flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: isOver ? bg + "CC" : bg + "55",
        border: isOver ? `2px dashed ${color}66` : "1px solid rgba(0,0,0,0.05)",
        transition: "background 150ms ease, border 150ms ease",
      }}
    >
      <div className="flex items-center justify-between px-3.5 py-3 border-b" style={{ borderColor: color + "22" }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-sm font-bold text-foreground">{title}</span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: color + "22", color }}>
            {loading ? "…" : count}
          </span>
        </div>
        {!noAdd && (
          <Link href={addHref}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ background: color + "22" }}>
              <Plus size={13} color={color} strokeWidth={2.5} />
            </div>
          </Link>
        )}
      </div>

      <div
        className="flex flex-col gap-2.5 p-2.5 overflow-y-auto"
        style={{ scrollbarWidth: "thin", maxHeight: "calc(100dvh - 368px)" }}
      >
        {loading ? (
          [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : children}
      </div>
    </div>
  );
}

/* ─── Cards compartidas ──────────────────────────────────────────── */

function StatChip({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg" style={{ background: bg }}>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <span className="text-xs font-bold leading-tight" style={{ color }}>{value}</span>
    </div>
  );
}

function CitaCard({ cita, index, authVinculada }: { cita: Cita; index: number; authVinculada?: AutorizacionEPS }) {
  const porAgendar = cita.estado === "por_agendar";
  const accentColor = porAgendar ? "#e65100" : "#C0546A";
  const accentBg    = porAgendar ? "#FFF3E0" : "#F2C5CE";
  const fh = cita.fecha_hora ? formatFechaHora(cita.fecha_hora) : null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/salud/cita/${cita.id}`}>
        <div className="rounded-xl border border-black/6 bg-white hover:shadow-md transition-all cursor-pointer overflow-hidden">
          <div className="h-1 w-full" style={{ background: accentColor }} />
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-sm text-foreground leading-tight">{cita.especialidad}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                style={{ background: accentBg, color: accentColor }}>
                {porAgendar ? "⏳ Por agendar" : "Próxima"}
              </span>
            </div>
            {cita.medico && <p className="text-xs text-muted-foreground mt-0.5">{cita.medico}</p>}
            {authVinculada?.numero_autorizacion && (
              <div className="flex items-center gap-1 mt-1.5 px-2 py-1 rounded-lg" style={{ background: "#E8F5E9" }}>
                <Shield size={10} style={{ color: "#2e7d32" }} />
                <span className="text-[10px] font-bold" style={{ color: "#2e7d32" }}>
                  Auth N° {authVinculada.numero_autorizacion}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-black/5">
              {fh ? (
                <>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} className="text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-muted-foreground">{fh.fecha}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-muted-foreground">{fh.hora}</span>
                  </div>
                </>
              ) : (
                <span className="text-[11px] font-semibold" style={{ color: "#e65100" }}>Sin fecha asignada</span>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                {cita.archivo_url && <FileText size={11} color="#C0546A" />}
                {cita.lugar && <MapPin size={11} className="text-muted-foreground" />}
                {cita.audio_url && <Mic size={11} className="text-muted-foreground" />}
              </div>
            </div>
            {cita.acompanante && (
              <div className="flex items-center gap-1 mt-1.5">
                <User size={10} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{cita.acompanante.nombre}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MedicamentoCard({ med, index, marcarEntregaReclamada }: {
  med: Medicamento; index: number; marcarEntregaReclamada: (id: string) => void;
}) {
  const entregas = med.entregas_medicamento ?? [];
  const reclamadas = entregas.filter(e => e.estado === "reclamada").length;
  const porReclamar = med.activo && reclamadas === 0;
  const proxima = entregas.find(e => e.estado === "pendiente" && e.fecha_programada);
  const dotColor = !med.activo ? "#9ca3af" : porReclamar ? "#e65100" : "#22c55e";
  const topBar  = !med.activo ? "#9ca3af" : porReclamar ? "#e65100" : "#2E7D6A";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/salud/medicamento/${med.id}`}>
      <div className="rounded-xl border border-black/6 bg-white overflow-hidden hover:shadow-md active:scale-[0.98] transition-all cursor-pointer">
        <div className="h-1 w-full" style={{ background: topBar }} />
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Circle size={7} fill={dotColor} color={dotColor} className="shrink-0 mt-0.5" />
              <p className="font-bold text-sm text-foreground leading-tight">{med.nombre}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {med.archivo_url && <FileText size={11} color="#2E7D6A" />}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={!med.activo
                  ? { background: "#f3f4f6", color: "#6b7280" }
                  : porReclamar
                  ? { background: "#FFF3E0", color: "#e65100" }
                  : { background: "#f0fdf4", color: "#15803d" }}>
                {!med.activo ? "Inactivo" : porReclamar ? "Por reclamar" : "Activo"}
              </span>
            </div>
          </div>
          {med.dosis && <p className="text-xs text-muted-foreground mt-0.5 ml-3.5">{med.dosis}</p>}
          {med.frecuencia && <p className="text-xs text-muted-foreground ml-3.5">{med.frecuencia}</p>}
          {proxima && !reclamadas && (
            <p className="text-[11px] font-semibold ml-3.5 mt-1" style={{ color: "#e65100" }}>
              Entrega {proxima.numero_entrega}: {formatFechaCorta(proxima.fecha_programada!)}
            </p>
          )}
          {med.horas_toma && med.horas_toma.length > 0 && (
            <div className="flex gap-1.5 mt-2 ml-3.5 flex-wrap">
              {med.horas_toma.map(h => (
                <span key={h} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#B8E2D4", color: "#2E7D6A" }}>{h}</span>
              ))}
            </div>
          )}
          {entregas.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-black/5">
              <div className="flex items-center gap-1.5 mb-2">
                <Package size={11} className="text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Entregas · {reclamadas}/{entregas.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entregas.sort((a, b) => a.numero_entrega - b.numero_entrega).map(entrega => (
                  <ChipEntrega key={entrega.id} entrega={entrega} total={entregas.length}
                    onMarcar={() => marcarEntregaReclamada(entrega.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </Link>
    </motion.div>
  );
}

/* ─── Mobile lists ───────────────────────────────────────────────── */

function MobileCitaCard({ cita, index }: { cita: Cita; index: number }) {
  const porAgendar  = cita.estado === "por_agendar";
  const completada  = cita.estado === "completada";
  const fh = cita.fecha_hora ? formatFechaHora(cita.fecha_hora) : null;
  const accent   = completada ? "#16a34a" : porAgendar ? "#e65100" : "#C0546A";
  const accentBg = completada ? "#dcfce7"  : porAgendar ? "#FFF3E0" : "#F2C5CE";
  const badgeLabel = completada ? "✓ Completada" : porAgendar ? "⏳ Por agendar" : (fh?.fecha ?? "Sin fecha");
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/salud/cita/${cita.id}`}>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm leading-snug">{cita.especialidad}</p>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
              style={{ background: accentBg, color: accent }}>
              {badgeLabel}
            </span>
          </div>
          {cita.medico && <p className="text-xs text-muted-foreground mt-0.5">{cita.medico}</p>}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
            {fh ? (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{fh.hora}</span>
              </div>
            ) : (
              !completada && <span className="text-xs font-semibold" style={{ color: "#e65100" }}>Sin fecha asignada</span>
            )}
            {cita.acompanante && <span className="text-xs text-muted-foreground">Acomp: <span className="font-semibold text-foreground">{cita.acompanante.nombre}</span></span>}
            {cita.archivo_url && <FileText size={12} color="#C0546A" className="ml-auto" />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MobileSectionHeader({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2 first:mt-0">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: bg, color }}>{count}</span>
      <div className="flex-1 h-px" style={{ background: color + "22" }} />
    </div>
  );
}

function MobileCitasList({ citas, loading, nuevaCitaHref }: { citas: Cita[]; loading: boolean; nuevaCitaHref: string }) {
  const porAgendar  = citas.filter(c => c.estado === "por_agendar");
  const proximas    = citas.filter(c => c.estado === "pendiente");
  const completadas = citas.filter(c => c.estado === "completada");
  const total = citas.length;
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{loading ? "…" : `${total} cita${total !== 1 ? "s" : ""}`}</p>
        <Link href={nuevaCitaHref} className="flex items-center gap-1 text-xs font-semibold text-primary"><Plus size={13} />Nueva cita</Link>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : total === 0 ? (
        <EmptyState icon={Calendar} texto="Sin citas registradas" href={nuevaCitaHref} cta="Agregar primera cita" />
      ) : (
        <div className="flex flex-col">
          {porAgendar.length > 0 && (
            <>
              <MobileSectionHeader label="Por agendar" count={porAgendar.length} color="#e65100" bg="#FFF3E0" />
              <div className="flex flex-col gap-2.5">
                {porAgendar.map((c, i) => <MobileCitaCard key={c.id} cita={c} index={i} />)}
              </div>
            </>
          )}
          {proximas.length > 0 && (
            <>
              <MobileSectionHeader label="Próximas" count={proximas.length} color="#C0546A" bg="#F2C5CE" />
              <div className="flex flex-col gap-2.5">
                {proximas.map((c, i) => <MobileCitaCard key={c.id} cita={c} index={i} />)}
              </div>
            </>
          )}
          {completadas.length > 0 && (
            <>
              <MobileSectionHeader label="Completadas" count={completadas.length} color="#16a34a" bg="#dcfce7" />
              <div className="flex flex-col gap-2.5">
                {completadas.map((c, i) => <MobileCitaCard key={c.id} cita={c} index={i} />)}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function MobileMedsList({ medicamentos, medsPorReclamar, medsConEntregas, loading, nuevoMedHref, marcarEntregaReclamada }: {
  medicamentos: Medicamento[]; medsPorReclamar: Medicamento[]; medsConEntregas: Medicamento[]; loading: boolean; nuevoMedHref: string;
  marcarEntregaReclamada: (id: string) => void;
}) {
  const totalActivos = medsPorReclamar.length + medsConEntregas.length;
  const medsInactivos = medicamentos.filter(m => !m.activo);

  const MedCard = ({ med, index }: { med: Medicamento; index: number }) => {
    const entregas = med.entregas_medicamento ?? [];
    const reclamadas = entregas.filter(e => e.estado === "reclamada").length;
    const porReclamar = med.activo && reclamadas === 0;
    const proxima = entregas.find(e => e.estado === "pendiente" && e.fecha_programada);
    const dotColor = !med.activo ? "#9ca3af" : porReclamar ? "#e65100" : "#22c55e";
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
        <Link href={`/salud/medicamento/${med.id}`}>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Circle size={8} fill={dotColor} color={dotColor} className="shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{med.nombre}</p>
                {med.dosis && <p className="text-xs text-muted-foreground">{med.dosis}</p>}
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={!med.activo
                ? { background: "#f3f4f6", color: "#6b7280" }
                : porReclamar
                ? { background: "#FFF3E0", color: "#e65100" }
                : { background: "#f0fdf4", color: "#15803d" }}>
              {!med.activo ? "Inactivo" : porReclamar ? "Por reclamar" : "Activo"}
            </span>
          </div>
          {proxima && !reclamadas && (
            <p className="text-[11px] font-semibold ml-4 mt-1" style={{ color: "#e65100" }}>
              Entrega {proxima.numero_entrega}: {formatFechaCorta(proxima.fecha_programada!)}
            </p>
          )}
          {med.frecuencia && <p className="text-xs text-muted-foreground mt-1.5 ml-4">{med.frecuencia}</p>}
          {med.horas_toma && med.horas_toma.length > 0 && (
            <div className="flex gap-1.5 mt-2 ml-4 flex-wrap">
              {med.horas_toma.map(h => (
                <span key={h} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F2C5CE", color: "#C0546A" }}>{h}</span>
              ))}
            </div>
          )}
          {entregas.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Package size={12} className="text-muted-foreground" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                  Entregas · {reclamadas}/{entregas.length} reclamadas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entregas.sort((a, b) => a.numero_entrega - b.numero_entrega).map(entrega => (
                  <ChipEntrega key={entrega.id} entrega={entrega} total={entregas.length}
                    onMarcar={() => marcarEntregaReclamada(entrega.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{loading ? "…" : `${totalActivos} medicamento${totalActivos !== 1 ? "s" : ""}`}</p>
        <Link href={nuevoMedHref} className="flex items-center gap-1 text-xs font-semibold text-primary"><Plus size={13} />Agregar</Link>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : medicamentos.length === 0 ? (
        <EmptyState icon={Pill} texto="Sin medicamentos registrados" href={nuevoMedHref} cta="Agregar medicamento" />
      ) : (
        <div className="flex flex-col">
          {medsPorReclamar.length > 0 && (
            <>
              <MobileSectionHeader label="Por reclamar" count={medsPorReclamar.length} color="#e65100" bg="#FFF3E0" />
              <div className="flex flex-col gap-2.5">
                {medsPorReclamar.map((m, i) => <MedCard key={m.id} med={m} index={i} />)}
              </div>
            </>
          )}
          {medsConEntregas.length > 0 && (
            <>
              <MobileSectionHeader label="Activos" count={medsConEntregas.length} color="#2E7D6A" bg="#B8E2D4" />
              <div className="flex flex-col gap-2.5">
                {medsConEntregas.map((m, i) => <MedCard key={m.id} med={m} index={i} />)}
              </div>
            </>
          )}
          {medsInactivos.length > 0 && (
            <>
              <MobileSectionHeader label="Inactivos" count={medsInactivos.length} color="#6b7280" bg="#f3f4f6" />
              <div className="flex flex-col gap-2.5">
                {medsInactivos.map((m, i) => <MedCard key={m.id} med={m} index={i} />)}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Chip entrega ───────────────────────────────────────────────── */

function ChipEntrega({ entrega, total, onMarcar }: {
  entrega: EntregaMedicamento; total: number; onMarcar: () => void;
}) {
  const reclamada = entrega.estado === "reclamada";
  const vencida   = !reclamada && esVencida(entrega.fecha_programada);
  const bg    = reclamada ? "#E8F5E9" : vencida ? "#FFF3E0" : "#F2C5CE";
  const color = reclamada ? "#2e7d32" : vencida ? "#e65100" : "#C0546A";
  const fechaTexto = reclamada
    ? (entrega.fecha_reclamada ? formatFechaCorta(entrega.fecha_reclamada) : "Reclamada")
    : (entrega.fecha_programada ? formatFechaCorta(entrega.fecha_programada) : "Sin fecha");
  return (
    <button type="button" onClick={reclamada ? undefined : (e) => { e.preventDefault(); e.stopPropagation(); onMarcar(); }} disabled={reclamada}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all active:scale-95 disabled:cursor-default"
      style={{ background: bg }}>
      {reclamada
        ? <Check size={11} color={color} strokeWidth={3} />
        : <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
      <span className="text-[11px] font-bold" style={{ color }}>
        {entrega.numero_entrega}/{total} · {fechaTexto}
      </span>
      {!reclamada && (
        <span className="text-[10px] font-semibold opacity-70" style={{ color }}>
          {vencida ? "Vencida" : "Pendiente"}
        </span>
      )}
    </button>
  );
}

/* ─── Examen card ────────────────────────────────────────────────── */

const TIPO_LABEL: Record<string, string> = {
  laboratorio:   "🧪 Lab",
  examen:        "🔬 Examen",
  procedimiento: "⚕️ Proc",
};

function ExamenCard({ examen, index }: { examen: Examen; index: number }) {
  const porAgendar  = !examen.fecha_solicitud;
  const accentColor = porAgendar ? "#e65100" : "#9B8EC4";
  const accentBg    = porAgendar ? "#FFF3E0" : "#EDE9F7";
  const fechaTexto  = examen.fecha_solicitud
    ? new Date(examen.fecha_solicitud + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })
    : null;
  const estadoLabel: Record<string, string> = { pendiente: "Programado", listo: "Realizado" };
  const tieneArchivos = !!(examen.archivo_orden_url || examen.archivo_resultado_url);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/salud/examen/${examen.id}`}>
        <div className="rounded-xl border border-black/6 bg-white overflow-hidden hover:shadow-md transition-all cursor-pointer">
          <div className="h-1 w-full" style={{ background: accentColor }} />
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: accentBg, color: accentColor }}>
                  {TIPO_LABEL[examen.tipo] ?? examen.tipo}
                </span>
                <p className="font-bold text-sm text-foreground leading-tight mt-1">{examen.nombre}</p>
              </div>
              {tieneArchivos && (
                <div className="flex gap-0.5 shrink-0 mt-0.5">
                  {examen.archivo_orden_url && <FileText size={13} color="#9B8EC4" />}
                  {examen.archivo_resultado_url && <FileText size={13} color="#2E7D6A" />}
                </div>
              )}
            </div>
            {examen.especialidad && <p className="text-xs text-muted-foreground mt-0.5">{examen.especialidad}</p>}
            {examen.lugar && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} className="text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground line-clamp-1">{examen.lugar}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-black/5">
              {fechaTexto ? (
                <div className="flex items-center gap-1">
                  <Calendar size={11} className="text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground">{fechaTexto}</span>
                </div>
              ) : (
                <span className="text-[11px] font-semibold" style={{ color: "#e65100" }}>Sin fecha asignada</span>
              )}
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: accentBg, color: accentColor }}>
                {estadoLabel[examen.estado] ?? examen.estado}
              </span>
            </div>
            {examen.notas && <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">{examen.notas}</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Calendario ─────────────────────────────────────────────────── */

const DAYS_ES  = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

type CalEvent = {
  kind: "cita" | "examen" | "entrega";
  id: string; title: string; href: string;
  time?: string; sub?: string;
};

const EV_STYLE = {
  cita:    { bg: "#FDF2F4", border: "#C0546A", text: "#C0546A" },
  examen:  { bg: "#EDE9F7", border: "#9B8EC4", text: "#9B8EC4" },
  entrega: { bg: "#D1FAE5", border: "#2E7D6A", text: "#2E7D6A" },
};

function dateKey(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toDateString();
}

function descargarSemanaImagen(weekDays: Date[], eventMap: Map<string, CalEvent[]>) {
  const W = 1120, H = 640;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Fondo
  ctx.fillStyle = "#FAFAFA";
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = "#F2C5CE";
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = "#C0546A";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("App Lucy", 24, 40);
  const semLabel = `${weekDays[0].toLocaleDateString("es-CO",{day:"numeric",month:"long"})} – ${weekDays[6].toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"})}`;
  ctx.fillStyle = "#9B6070";
  ctx.font = "500 15px system-ui, sans-serif";
  ctx.fillText(`Programación de la semana · ${semLabel}`, 24, 58);

  const colW = (W - 32) / 7;
  const DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  const today = new Date(); today.setHours(0,0,0,0);

  weekDays.forEach((day, i) => {
    const x = 16 + i * colW;
    const isHoy = day.toDateString() === today.toDateString();

    // Columna fondo
    ctx.fillStyle = isHoy ? "#FDF2F4" : "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(x + 2, 72, colW - 4, H - 80, 12);
    ctx.fill();
    if (isHoy) {
      ctx.strokeStyle = "#C0546A44";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Día header
    ctx.fillStyle = isHoy ? "#C0546A" : "#888";
    ctx.font = `bold 11px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(DAYS[i], x + colW / 2, 92);
    ctx.fillStyle = isHoy ? "#C0546A" : "#333";
    ctx.font = `bold 18px system-ui, sans-serif`;
    ctx.fillText(day.getDate().toString(), x + colW / 2, 114);

    // Eventos del día
    const dayEvents = eventMap.get(day.toDateString()) ?? [];
    dayEvents.forEach((ev, ci) => {
      const cy = 128 + ci * 76;
      if (cy + 68 > H - 8) return;
      const st = EV_STYLE[ev.kind];

      ctx.fillStyle = st.bg;
      ctx.beginPath();
      ctx.roundRect(x + 6, cy, colW - 12, 68, 8);
      ctx.fill();
      ctx.strokeStyle = st.border + "88";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = st.text;
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(ev.title.slice(0, 18), x + 12, cy + 18);

      if (ev.time) {
        ctx.fillStyle = st.text + "BB";
        ctx.font = "500 10px system-ui, sans-serif";
        ctx.fillText(ev.time, x + 12, cy + 34);
      }
      if ("sub" in ev && ev.sub) {
        ctx.fillStyle = st.text + "88";
        ctx.font = "10px system-ui, sans-serif";
        ctx.fillText(ev.sub.slice(0, 22), x + 12, cy + 50);
      }
    });

    if (dayEvents.length === 0) {
      ctx.fillStyle = "#CCC";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("–", x + colW / 2, 148);
    }
  });

  // Footer
  ctx.fillStyle = "#EEE";
  ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = "#AAA";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("App Lucy · app-lucy.vercel.app", W - 16, H - 8);

  const link = document.createElement("a");
  link.download = `lucy-semana-${weekDays[0].toISOString().slice(0,10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function CalendarioView({ citas, examenes, medicamentos, nuevaCitaHref }: {
  citas: Cita[]; examenes: Examen[]; medicamentos: Medicamento[]; nuevaCitaHref: string;
}) {
  const [calView, setCalView] = useState<"semana" | "mes">("semana");
  const [refDate, setRefDate] = useState(() => new Date());

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const weekStart = useMemo(() => {
    const d = new Date(refDate); d.setHours(0,0,0,0);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  }, [refDate]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
    }), [weekStart]);

  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  const monthGrid = useMemo(() => {
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const cells: (Date | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const eventMap = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const add = (key: string, ev: CalEvent) => {
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    };
    citas.filter(c => c.fecha_hora).forEach(c => {
      const key = new Date(c.fecha_hora!).toDateString();
      add(key, {
        kind: "cita", id: c.id, href: `/salud/cita/${c.id}`,
        title: c.especialidad,
        time: new Date(c.fecha_hora!).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        sub: c.lugar ?? undefined,
      });
    });
    examenes.filter(e => e.fecha_solicitud && e.estado !== "listo").forEach(e => {
      add(dateKey(e.fecha_solicitud!), {
        kind: "examen", id: e.id, href: `/salud/examen/${e.id}`,
        title: e.nombre,
        time: e.hora ? (() => { const [h,m] = e.hora!.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? "p.m." : "a.m."}`; })() : undefined,
        sub: e.lugar ?? undefined,
      });
    });
    medicamentos.filter(m => m.activo).forEach(m => {
      (m.entregas_medicamento ?? []).filter(e => e.fecha_programada && e.estado === "pendiente").forEach(e => {
        add(dateKey(e.fecha_programada!), {
          kind: "entrega", id: e.id, href: `/salud/medicamento/${m.id}`,
          title: `Entrega ${e.numero_entrega} · ${m.nombre}`,
        });
      });
    });
    return map;
  }, [citas, examenes, medicamentos]);

  const getEvents = (d: Date) => eventMap.get(d.toDateString()) ?? [];
  const isToday   = (d: Date) => d.toDateString() === today.toDateString();

  const prev = () => {
    const d = new Date(refDate);
    calView === "semana" ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
    setRefDate(d);
  };
  const next = () => {
    const d = new Date(refDate);
    calView === "semana" ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
    setRefDate(d);
  };

  const sinFecha = citas.filter(c => !c.fecha_hora);
  const weekLabel = `${weekDays[0].toLocaleDateString("es-CO",{day:"numeric",month:"short"})} – ${weekDays[6].toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"})}`;

  const legendItems: { label: string; bg: string; color: string }[] = [
    { label: "Cita", bg: EV_STYLE.cita.bg, color: EV_STYLE.cita.text },
    { label: "Procedimiento", bg: EV_STYLE.examen.bg, color: EV_STYLE.examen.text },
    { label: "Entrega med.", bg: EV_STYLE.entrega.bg, color: EV_STYLE.entrega.text },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden" style={{ background: "#F8F9FB" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <button onClick={prev}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90">
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <span className="text-sm font-extrabold text-foreground min-w-[220px] text-center tracking-tight">
            {calView === "semana" ? weekLabel : `${MONTHS_ES[month]} ${year}`}
          </span>
          <button onClick={next}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90">
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => setRefDate(new Date())}
            className="ml-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:bg-gray-50 active:scale-95"
            style={{ borderColor: "#C0546A44", color: "#C0546A" }}>
            Hoy
          </button>
          {calView === "semana" && (
            <button onClick={() => descargarSemanaImagen(weekDays, eventMap)}
              title="Descargar imagen"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 text-muted-foreground hover:text-foreground">
              <Download size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Leyenda inline */}
          <div className="hidden xl:flex items-center gap-3">
            {legendItems.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="text-[11px] font-semibold text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
          {/* Toggle vista */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl" style={{ background: "#f3f4f6" }}>
            {(["semana","mes"] as const).map(v => (
              <button key={v} onClick={() => setCalView(v)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={calView === v
                  ? { background: "white", color: "#C0546A", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }
                  : { color: "#9ca3af" }}>
                {v === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sin fecha banner */}
      {sinFecha.length > 0 && (
        <div className="px-4 py-2 flex items-center gap-2 shrink-0"
          style={{ background: "#FFF3E0", borderBottom: "1px solid #FFE0B2" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#e6510022" }}>
            <Clock size={11} color="#e65100" />
          </div>
          <span className="text-xs font-semibold" style={{ color: "#e65100" }}>
            {sinFecha.length} cita{sinFecha.length !== 1 ? "s" : ""} sin fecha
          </span>
          <Link href={nuevaCitaHref} className="ml-auto text-xs font-bold underline underline-offset-2"
            style={{ color: "#e65100" }}>Ver →</Link>
        </div>
      )}

      {/* ── VISTA SEMANA ── */}
      {calView === "semana" && (
        <div className="flex gap-2 flex-1 min-h-0 overflow-hidden p-3">
          {weekDays.map((day, i) => {
            const dayEvents = getEvents(day);
            const hoy = isToday(day);
            return (
              <div key={i} className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden"
                style={{
                  background: hoy ? "#FDF2F4" : "white",
                  border: hoy ? "1.5px solid #C0546A33" : "1px solid rgba(0,0,0,0.06)",
                  boxShadow: hoy ? "0 2px 12px #C0546A18" : "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                {/* Día header */}
                <div className="flex flex-col items-center px-1 pt-2.5 pb-2 shrink-0"
                  style={{ borderBottom: `1px solid ${hoy ? "#C0546A22" : "rgba(0,0,0,0.05)"}` }}>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5"
                    style={{ color: hoy ? "#C0546A" : "#9ca3af" }}>
                    {DAYS_ES[i]}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold"
                    style={hoy
                      ? { background: "#C0546A", color: "white", boxShadow: "0 2px 8px #C0546A55" }
                      : { color: "#374151" }}>
                    {day.getDate()}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1.5">
                      {dayEvents.slice(0, 3).map((ev, di) => (
                        <div key={di} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: EV_STYLE[ev.kind].border }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Eventos */}
                <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1.5" style={{ scrollbarWidth: "thin" }}>
                  {dayEvents.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-4 opacity-20">
                      <div className="w-0.5 h-10 rounded-full" style={{ background: hoy ? "#C0546A" : "#d1d5db" }} />
                    </div>
                  )}
                  {dayEvents.map(ev => {
                    const st = EV_STYLE[ev.kind];
                    return (
                      <Link key={`${ev.kind}-${ev.id}`} href={ev.href}>
                        <div className="rounded-xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer"
                          style={{ background: st.bg, boxShadow: `0 1px 4px ${st.border}22` }}>
                          <div className="h-[3px] w-full" style={{ background: st.border }} />
                          <div className="px-2 py-1.5">
                            <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: st.text }}>
                              {ev.title}
                            </p>
                            {ev.time && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={9} style={{ color: st.border }} />
                                <span className="text-[10px] font-bold" style={{ color: st.border }}>{ev.time}</span>
                              </div>
                            )}
                            {ev.sub && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin size={8} className="text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground truncate">{ev.sub}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VISTA MES ── */}
      {calView === "mes" && (
        <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: "thin" }}>
          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-2 gap-1">
            {DAYS_ES.map((d, idx) => (
              <div key={d} className="text-center py-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest"
                  style={{ color: idx >= 5 ? "#C0546A99" : "#9ca3af" }}>
                  {d}
                </span>
              </div>
            ))}
          </div>
          {/* Grid días */}
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((date, i) => {
              if (!date) return <div key={`e-${i}`} className="min-h-[80px]" />;
              const dayEvents = getEvents(date);
              const hoy = isToday(date);
              const currentM = date.getMonth() === month;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div key={i} className="min-h-[80px] rounded-xl p-1.5 flex flex-col transition-all"
                  style={{
                    background: hoy ? "#FDF2F4" : isWeekend ? "#FAFAFA" : "white",
                    border: hoy ? "1.5px solid #C0546A33" : "1px solid rgba(0,0,0,0.05)",
                    boxShadow: hoy ? "0 2px 8px #C0546A12" : "none",
                    opacity: !currentM ? 0.4 : 1,
                  }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center self-start mb-1"
                    style={hoy
                      ? { background: "#C0546A", color: "white", boxShadow: "0 1px 6px #C0546A44" }
                      : { color: "var(--foreground)" }}>
                    <span className="text-[11px] font-extrabold">{date.getDate()}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 3).map(ev => {
                      const st = EV_STYLE[ev.kind];
                      return (
                        <Link key={`${ev.kind}-${ev.id}`} href={ev.href}>
                          <div className="rounded-md px-1.5 py-[3px] text-[10px] font-bold truncate hover:opacity-80 transition-opacity leading-tight"
                            style={{
                              background: st.bg,
                              color: st.text,
                              borderLeft: `2px solid ${st.border}`,
                            }}>
                            {ev.title}
                          </div>
                        </Link>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] font-bold text-muted-foreground pl-1">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Search overlay ─────────────────────────────────────────────── */

const TIPO_LABEL_SEARCH: Record<string, string> = {
  laboratorio: "🧪 Lab",
  examen: "🔬 Examen",
  procedimiento: "⚕️ Procedimiento",
};

function SearchOverlay({
  citas, medicamentos, examenes, onClose,
}: {
  citas: Cita[]; medicamentos: Medicamento[]; examenes: Examen[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();

  const citasFiltradas = q
    ? citas.filter(c =>
        c.especialidad.toLowerCase().includes(q) ||
        (c.medico?.toLowerCase() ?? "").includes(q) ||
        (c.lugar?.toLowerCase() ?? "").includes(q))
    : [];

  const medsFiltrados = q
    ? medicamentos.filter(m =>
        m.nombre.toLowerCase().includes(q) ||
        (m.dosis?.toLowerCase() ?? "").includes(q))
    : [];

  const exFiltrados = q
    ? examenes.filter(e =>
        e.nombre.toLowerCase().includes(q) ||
        (e.especialidad?.toLowerCase() ?? "").includes(q) ||
        e.tipo.toLowerCase().includes(q))
    : [];

  const hayResultados = citasFiltradas.length + medsFiltrados.length + exFiltrados.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: -8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/8">
          <Search size={17} className="text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar cita, medicamento, examen..."
            className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
          />
          {query ? (
            <button onClick={() => setQuery("")}
              className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <X size={11} />
            </button>
          ) : (
            <button onClick={onClose}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[65vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {!q && (
            <div className="py-10 text-center">
              <Search size={28} className="mx-auto mb-2 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">Escribe para buscar entre citas, medicamentos y procedimientos</p>
            </div>
          )}

          {q && !hayResultados && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Sin resultados para <span className="font-semibold">"{query}"</span></p>
            </div>
          )}

          {citasFiltradas.length > 0 && (
            <div className="px-3 pt-3 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Citas · {citasFiltradas.length}
              </p>
              {citasFiltradas.map(c => (
                <Link key={c.id} href={`/salud/cita/${c.id}`} onClick={onClose}>
                  <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#FDF2F4] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F2C5CE" }}>
                      <Calendar size={14} color="#C0546A" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.especialidad}</p>
                      {c.medico && <p className="text-xs text-muted-foreground truncate">{c.medico}</p>}
                    </div>
                    {c.archivo_url && <FileText size={13} color="#C0546A" className="shrink-0" />}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "#F2C5CE", color: "#C0546A" }}>
                      {c.estado === "por_agendar" ? "Por agendar" : c.estado === "pendiente" ? "Próxima" : c.estado}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {medsFiltrados.length > 0 && (
            <div className="px-3 pt-2 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Medicamentos · {medsFiltrados.length}
              </p>
              {medsFiltrados.map(m => (
                <Link key={m.id} href={`/salud/medicamento/${m.id}`} onClick={onClose}>
                  <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F0FAF7] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#B8E2D4" }}>
                      <Pill size={14} color="#2E7D6A" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.nombre}</p>
                      {m.dosis && <p className="text-xs text-muted-foreground truncate">{m.dosis}</p>}
                    </div>
                    {m.archivo_url && <FileText size={13} color="#2E7D6A" className="shrink-0" />}
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      m.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {m.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {exFiltrados.length > 0 && (
            <div className="px-3 pt-2 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Exámenes y procedimientos · {exFiltrados.length}
              </p>
              {exFiltrados.map(e => (
                <Link key={e.id} href={`/salud/examen/${e.id}`} onClick={onClose}>
                  <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F5F3FF] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EDE9F7" }}>
                      <FlaskConical size={14} color="#9B8EC4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {TIPO_LABEL_SEARCH[e.tipo] ?? e.tipo}{e.especialidad ? ` · ${e.especialidad}` : ""}
                      </p>
                    </div>
                    {(e.archivo_orden_url || e.archivo_resultado_url) && <FileText size={13} color="#9B8EC4" className="shrink-0" />}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "#EDE9F7", color: "#9B8EC4" }}>
                      {e.estado === "en_proceso" ? "En proceso" : e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

function EmptyState({ icon: Icon, texto, href, cta }: {
  icon: React.ElementType; texto: string; href: string; cta: string;
}) {
  return (
    <div className="rounded-2xl p-8 text-center border border-dashed" style={{ background: "#F2C5CE22", borderColor: "#F2C5CE" }}>
      <Icon size={32} className="mx-auto mb-3" color="#C0546A" />
      <p className="text-sm font-semibold text-foreground">{texto}</p>
      <Link href={href}><p className="text-xs text-primary font-semibold mt-2">+ {cta}</p></Link>
    </div>
  );
}

/* ─── Autorización card ──────────────────────────────────────────── */

const TIPO_AUTH_LABEL: Record<string, string> = {
  cita: "🏥 Cita", examen: "🔬 Examen", laboratorio: "🧪 Lab", procedimiento: "⚕️ Proc",
};

function AutorizacionCard({ auth, index }: { auth: AutorizacionEPS; index: number }) {
  const dias     = diasRestantesAuth(auth.fecha_orden);
  const semColor = dias > 30 ? "#2E7D6A" : dias > 15 ? "#e65100" : "#c62828";
  const semBg    = dias > 30 ? "#B8E2D4" : dias > 15 ? "#FFF3E0" : "#FFEBEE";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/salud/autorizacion/${auth.id}`} className="block rounded-xl border border-black/6 bg-white overflow-hidden hover:shadow-md active:scale-[0.98] transition-all">
        <div className="h-1 w-full" style={{ background: semColor }} />
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm text-foreground leading-tight">{auth.descripcion}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap"
              style={{ background: semBg, color: semColor }}>
              {dias > 0 ? `${dias}d` : "Vencida"}
            </span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-1 inline-block"
            style={{ background: "#F2C5CE", color: "#C0546A" }}>
            {TIPO_AUTH_LABEL[auth.tipo] ?? auth.tipo}
          </span>
          {(auth.cita || auth.examen) && (
            <div className="flex items-center gap-1 mt-1.5">
              <Shield size={9} color="#9B8EC4" />
              <span className="text-[10px] font-semibold" style={{ color: "#9B8EC4" }}>
                {auth.cita ? auth.cita.especialidad : auth.examen?.nombre}
              </span>
            </div>
          )}
          {auth.fecha_envio_eps && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-black/5">
              <Clock size={10} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                Enviada {new Date(auth.fecha_envio_eps + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
              </span>
            </div>
          )}
          {auth.numero_autorizacion && (
            <p className="text-[10px] font-bold mt-1" style={{ color: "#2e7d32" }}>N° {auth.numero_autorizacion}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── WhatsApp config modal ──────────────────────────────────────── */

