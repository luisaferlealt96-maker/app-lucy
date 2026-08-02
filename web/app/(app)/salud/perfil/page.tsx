"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Pencil, X, Check,
  Droplets, Scale, Ruler, AlertTriangle, Heart,
  Calendar, Pill, FlaskConical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAbuelaData, calcularEdad } from "@/hooks/useSalud";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PerfilSaludPage() {
  const router = useRouter();
  const { abuela, citas, medicamentos, examenes, loading, refresh } = useAbuelaData();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo_sangre: "",
    peso: "",
    altura: "",
    alergias: "",
    condiciones: "",
  });

  useEffect(() => {
    if (abuela) {
      setForm({
        tipo_sangre: abuela.tipo_sangre ?? "",
        peso: abuela.peso?.toString() ?? "",
        altura: abuela.altura?.toString() ?? "",
        alergias: abuela.alergias ?? "",
        condiciones: abuela.condiciones ?? "",
      });
    }
  }, [abuela]);

  const handleSave = async () => {
    if (!abuela) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("miembros_familia").update({
      tipo_sangre: form.tipo_sangre || null,
      peso: form.peso ? parseFloat(form.peso) : null,
      altura: form.altura ? parseFloat(form.altura) : null,
      alergias: form.alergias || null,
      condiciones: form.condiciones || null,
    }).eq("id", abuela.id);
    await refresh();
    setSaving(false);
    setEditing(false);
  };

  const edad = calcularEdad(abuela?.fecha_nacimiento ?? null);
  const medsActivos = medicamentos.filter(m => m.activo).length;
  const citasPendientes = citas.filter(c => c.estado === "pendiente" || c.estado === "por_agendar").length;

  return (
    <div className="min-h-dvh bg-background pb-20 max-w-lg md:max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-pillar-salud px-4 pt-12 pb-6"
      >
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-5">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>Salud</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center text-4xl shadow-sm">
              {loading ? "..." : (abuela?.emoji ?? "👵")}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground leading-tight">
                {loading ? "Cargando..." : (abuela?.nombre ?? "–")}
              </h1>
              {edad !== null && (
                <p className="text-sm font-semibold mt-0.5" style={{ color: "#C0546A" }}>
                  {edad} años
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/50 hover:bg-white/80 transition-colors"
          >
            <Pencil size={15} color="#C0546A" />
          </button>
        </div>
      </motion.div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Resumen rápido */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/salud" className="bg-card border border-border rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
              <Calendar size={18} color="#C0546A" />
              <p className="text-xl font-extrabold text-foreground">{citasPendientes}</p>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Citas activas</p>
            </Link>
            <Link href="/salud" className="bg-card border border-border rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
              <Pill size={18} color="#2E7D6A" />
              <p className="text-xl font-extrabold text-foreground">{medsActivos}</p>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Medicamentos</p>
            </Link>
            <Link href="/salud" className="bg-card border border-border rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
              <FlaskConical size={18} color="#9B8EC4" />
              <p className="text-xl font-extrabold text-foreground">{examenes.length}</p>
              <p className="text-xs text-muted-foreground font-medium leading-tight">Procedimientos</p>
            </Link>
          </div>
        </motion.div>

        {/* Datos clínicos */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Datos clínicos</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <DatoChip
                icon={<Droplets size={15} color="#C0546A" />}
                label="Tipo de sangre"
                value={abuela?.tipo_sangre ?? "–"}
                bg="#FFF0F3"
                onEdit={() => setEditing(true)}
              />
              <DatoChip
                icon={<Scale size={15} color="#2E7D6A" />}
                label="Peso"
                value={abuela?.peso ? `${abuela.peso} kg` : "–"}
                bg="#F0FAF7"
                onEdit={() => setEditing(true)}
              />
              <DatoChip
                icon={<Ruler size={15} color="#9B8EC4" />}
                label="Altura"
                value={abuela?.altura ? `${abuela.altura} m` : "–"}
                bg="#F5F3FF"
                onEdit={() => setEditing(true)}
              />
            </div>
          </div>
        </motion.div>

        {/* Alergias */}
        {(abuela?.alergias || !loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl border p-4"
              style={{ background: abuela?.alergias ? "#FFF3E0" : "var(--card)", borderColor: abuela?.alergias ? "#FFB300" : "var(--border)" }}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} color={abuela?.alergias ? "#e65100" : "#9ca3af"} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1"
                    style={{ color: abuela?.alergias ? "#e65100" : "var(--muted-foreground)" }}>
                    Alergias
                  </p>
                  {abuela?.alergias ? (
                    <p className="text-sm text-foreground leading-relaxed">{abuela.alergias}</p>
                  ) : (
                    <button onClick={() => setEditing(true)} className="text-sm text-muted-foreground">
                      Sin alergias registradas · <span className="underline">Agregar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Condiciones / antecedentes */}
        {(abuela?.condiciones || !loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl border p-4"
              style={{ background: abuela?.condiciones ? "#F0FAF7" : "var(--card)", borderColor: abuela?.condiciones ? "#2E7D6A" : "var(--border)" }}>
              <div className="flex items-start gap-2.5">
                <Heart size={16} color={abuela?.condiciones ? "#2E7D6A" : "#9ca3af"} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1"
                    style={{ color: abuela?.condiciones ? "#2E7D6A" : "var(--muted-foreground)" }}>
                    Condiciones / antecedentes
                  </p>
                  {abuela?.condiciones ? (
                    <p className="text-sm text-foreground leading-relaxed">{abuela.condiciones}</p>
                  ) : (
                    <button onClick={() => setEditing(true)} className="text-sm text-muted-foreground">
                      Sin condiciones registradas · <span className="underline">Agregar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl p-6 shadow-2xl w-[420px] max-h-[90dvh] overflow-y-auto mx-4"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-base text-foreground">Editar datos clínicos</h3>
              <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100">
                <X size={14} />
              </button>
            </div>

            {/* Tipo de sangre */}
            <div className="mb-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-2">Tipo de sangre</label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_SANGRE.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, tipo_sangre: t }))}
                    className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all"
                    style={form.tipo_sangre === t
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
                  value={form.peso}
                  onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                  className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Altura (m)</label>
                <Input type="number" step="0.01" placeholder="1.60"
                  value={form.altura}
                  onChange={e => setForm(f => ({ ...f, altura: e.target.value }))}
                  className="h-11 rounded-xl" />
              </div>
            </div>

            {/* Alergias */}
            <div className="mb-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Alergias (opcional)</label>
              <textarea
                placeholder="Ej: Penicilina, mariscos, látex..."
                value={form.alergias}
                onChange={e => setForm(f => ({ ...f, alergias: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
            </div>

            {/* Condiciones */}
            <div className="mb-5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide block mb-1.5">Condiciones / antecedentes (opcional)</label>
              <textarea
                placeholder="Ej: Hipertensión, diabetes tipo 2..."
                value={form.condiciones}
                onChange={e => setForm(f => ({ ...f, condiciones: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "#C0546A" }}>
                {saving ? "Guardando..." : <><Check size={15} />Guardar</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DatoChip({
  icon, label, value, bg, onEdit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  onEdit: () => void;
}) {
  return (
    <button onClick={onEdit}
      className="rounded-xl p-3 flex flex-col gap-1.5 text-left hover:opacity-80 transition-opacity border border-transparent hover:border-border"
      style={{ background: bg }}>
      {icon}
      <p className="text-base font-extrabold text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground font-medium leading-tight">{label}</p>
    </button>
  );
}
