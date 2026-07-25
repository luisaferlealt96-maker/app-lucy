"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Pill, Check, Plus, X, Upload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMiembros } from "@/hooks/useSalud";
import { createClient } from "@/lib/supabase/client";
import { uploadArchivoMedicamento } from "@/lib/supabase/storage";

const FRECUENCIAS = [
  "Cada 4 horas", "Cada 6 horas", "Cada 8 horas", "Cada 12 horas",
  "Una vez al día", "Dos veces al día", "Tres veces al día",
  "Con las comidas", "En ayunas", "Solo cuando sea necesario",
];

const HORAS_COMUNES = ["06:00", "07:00", "08:00", "12:00", "13:00", "14:00", "18:00", "20:00", "21:00", "22:00"];

function NuevoMedicamentoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { miembros } = useMiembros();

  const [form, setForm] = useState({
    paciente_id: params.get("paciente") ?? "",
    nombre: "",
    dosis: "",
    frecuencia: "",
    horas_toma: [] as string[],
    fecha_inicio: "",
    total_entregas: 1,
  });
  // Fechas de cada entrega (array dinámico según total_entregas)
  const [fechasEntregas, setFechasEntregas] = useState<string[]>([""]);
  const [horaCustom, setHoraCustom] = useState("");
  const [archivoFormula, setArchivoFormula] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-asignar Mamita Lucy si no vino paciente por URL
  useEffect(() => {
    if (!form.paciente_id && miembros.length > 0) {
      const abuela = miembros.find(m => m.rol === "abuela");
      if (abuela) setForm(f => ({ ...f, paciente_id: abuela.id }));
    }
  }, [miembros, form.paciente_id]);

  // Sincronizar array de fechas cuando cambia total_entregas
  useEffect(() => {
    setFechasEntregas(prev => {
      const arr = [...prev];
      while (arr.length < form.total_entregas) arr.push("");
      return arr.slice(0, form.total_entregas);
    });
  }, [form.total_entregas]);

  const set = (k: string, v: string | number | null) => setForm(f => ({ ...f, [k]: v ?? "" }));

  const toggleHora = (h: string) => {
    setForm(f => ({
      ...f,
      horas_toma: f.horas_toma.includes(h)
        ? f.horas_toma.filter(x => x !== h)
        : [...f.horas_toma, h].sort(),
    }));
  };

  const addHoraCustom = () => {
    if (!horaCustom || form.horas_toma.includes(horaCustom)) return;
    setForm(f => ({ ...f, horas_toma: [...f.horas_toma, horaCustom].sort() }));
    setHoraCustom("");
  };

  const setFechaEntrega = (index: number, value: string) => {
    setFechasEntregas(prev => prev.map((f, i) => i === index ? value : f));
  };

  const handleSave = async () => {
    if (!form.paciente_id || !form.nombre) return;
    setSaving(true);
    const supabase = createClient();

    const { data: med } = await supabase
      .from("medicamentos")
      .insert({
        paciente_id: form.paciente_id,
        nombre: form.nombre,
        dosis: form.dosis || null,
        frecuencia: form.frecuencia || null,
        horas_toma: form.horas_toma.length > 0 ? form.horas_toma : null,
        fecha_inicio: form.fecha_inicio || null,
        total_entregas: form.total_entregas,
        activo: true,
      })
      .select()
      .single();

    // Insertar entregas si hay más de una o si tienen fecha
    if (med && form.total_entregas >= 1) {
      const entregas = fechasEntregas.map((fecha, i) => ({
        medicamento_id: med.id,
        numero_entrega: i + 1,
        fecha_programada: fecha || null,
        estado: "pendiente" as const,
      }));
      await supabase.from("entregas_medicamento").insert(entregas);
    }

    if (med?.id && archivoFormula) {
      const path = await uploadArchivoMedicamento(archivoFormula, med.id);
      if (path) await supabase.from("medicamentos").update({ archivo_url: path }).eq("id", med.id);
    }

    setSaving(false);
    setDone(true);
    setTimeout(() => router.back(), 1200);
  };

  const valido = form.paciente_id && form.nombre;

  return (
    <div className="min-h-dvh bg-background pb-10 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-pillar-salud px-4 pt-12 pb-5"
      >
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>Salud</span>
        </button>
        <div className="flex items-center gap-3">
          <Pill size={20} color="#C0546A" strokeWidth={2.5} />
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Nuevo medicamento</h1>
            <p className="text-xs font-medium" style={{ color: "#C0546A" }}>para Mamita Lucy 👵</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pt-5 flex flex-col gap-4"
      >
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Medicamento</label>
          <Input
            placeholder="Nombre del medicamento"
            value={form.nombre}
            onChange={e => set("nombre", e.target.value)}
            className="rounded-xl border-border bg-card h-12"
          />
        </div>

        {/* Dosis */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Dosis (opcional)</label>
          <Input
            placeholder="Ej: 10mg, 1 tableta, 5ml"
            value={form.dosis}
            onChange={e => set("dosis", e.target.value)}
            className="rounded-xl border-border bg-card h-12"
          />
        </div>

        {/* Frecuencia */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Frecuencia (opcional)</label>
          <Select value={form.frecuencia ?? ""} onValueChange={v => set("frecuencia", v)}>
            <SelectTrigger className="rounded-xl border-border bg-card h-12">
              <SelectValue placeholder="¿Cada cuánto?" />
            </SelectTrigger>
            <SelectContent>
              {FRECUENCIAS.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Horas de toma */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Horas de toma (opcional)</label>
          <div className="flex flex-wrap gap-2">
            {HORAS_COMUNES.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => toggleHora(h)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  form.horas_toma.includes(h)
                    ? "text-white"
                    : "bg-card border border-border text-muted-foreground"
                }`}
                style={form.horas_toma.includes(h) ? { background: "#9B8EC4" } : {}}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="time"
              value={horaCustom}
              onChange={e => setHoraCustom(e.target.value)}
              className="rounded-xl border-border bg-card h-10 flex-1"
            />
            <button
              type="button"
              onClick={addHoraCustom}
              disabled={!horaCustom}
              className="h-10 w-10 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background: "#9B8EC4" }}
            >
              <Plus size={16} color="#fff" />
            </button>
          </div>
          {form.horas_toma.filter(h => !HORAS_COMUNES.includes(h)).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.horas_toma.filter(h => !HORAS_COMUNES.includes(h)).map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggleHora(h)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ background: "#9B8EC4" }}
                >
                  {h} <X size={11} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fórmula / receta médica */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Fórmula médica (opcional)</label>
          <label
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-4 py-3.5 cursor-pointer hover:border-primary transition-colors"
            style={archivoFormula ? { borderColor: "#2E7D6A", background: "#F0FAF7" } : {}}
          >
            <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
              onChange={e => setArchivoFormula(e.target.files?.[0] ?? null)} />
            {archivoFormula ? (
              <>
                <FileText size={18} color="#2E7D6A" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#2E7D6A" }}>{archivoFormula.name}</p>
                  <p className="text-xs text-muted-foreground">{(archivoFormula.size / 1024).toFixed(0)} KB</p>
                </div>
                <button type="button" onClick={e => { e.preventDefault(); setArchivoFormula(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">Quitar</button>
              </>
            ) : (
              <>
                <Upload size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Subir fórmula médica</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG o PNG · referencia de la receta</p>
                </div>
              </>
            )}
          </label>
        </div>

        {/* ── ENTREGAS DE LA ORDEN ── */}
        <div className="flex flex-col gap-3 bg-card rounded-2xl border border-border p-4">
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">Entregas de la orden</p>
            <p className="text-xs text-muted-foreground mt-0.5">¿Cuántas entregas autoriza la orden médica?</p>
          </div>

          {/* Selector de cantidad */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => set("total_entregas", n)}
                className="flex-1 h-10 rounded-xl text-sm font-bold border-2 transition-all"
                style={form.total_entregas === n
                  ? { background: "#9B8EC4", borderColor: "#9B8EC4", color: "#fff" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)", background: "transparent" }
                }
              >
                {n}
              </button>
            ))}
          </div>

          {/* Fecha por entrega */}
          <div className="flex flex-col gap-2">
            {fechasEntregas.map((fecha, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                  style={{ background: "#F2C5CE", color: "#C0546A" }}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Entrega {i + 1} de {form.total_entregas} — fecha programada
                  </label>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={e => setFechaEntrega(i, e.target.value)}
                    className="rounded-xl border-border bg-secondary h-10 mt-0.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón guardar */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!valido || saving || done}
          className="w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: done ? "#22c55e" : "#9B8EC4", color: "#fff" }}
        >
          {done ? (
            <><Check size={20} strokeWidth={2.5} /> Medicamento guardado</>
          ) : saving ? (
            "Guardando..."
          ) : (
            <><Pill size={18} /> Guardar medicamento</>
          )}
        </button>
      </motion.div>
    </div>
  );
}

export default function NuevoMedicamentoPage() {
  return (
    <Suspense>
      <NuevoMedicamentoContent />
    </Suspense>
  );
}
