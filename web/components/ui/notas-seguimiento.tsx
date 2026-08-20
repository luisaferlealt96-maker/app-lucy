"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Plus, Edit3, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { NotaSeguimiento } from "@/lib/supabase/types";

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const fecha = d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${fecha} · ${hora}`;
}

interface Props {
  citaId?: string;
  examenId?: string;
  medicamentoId?: string;
  accentColor?: string;
  accentBg?: string;
}

export function NotasSeguimiento({
  citaId, examenId, medicamentoId,
  accentColor = "#9B8EC4",
  accentBg = "#EDE9F7",
}: Props) {
  const [notas, setNotas] = useState<NotaSeguimiento[]>([]);
  const [agregando, setAgregando] = useState(false);
  const [nuevaNota, setNuevaNota] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTexto, setEditTexto] = useState("");
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from("notas_seguimiento").select("*");
    if (citaId) query = query.eq("cita_id", citaId);
    else if (examenId) query = query.eq("examen_id", examenId);
    else if (medicamentoId) query = query.eq("medicamento_id", medicamentoId);
    const { data } = await query.order("fecha_nota", { ascending: false });
    setNotas(data ?? []);
  }, [citaId, examenId, medicamentoId]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleAgregar = async () => {
    if (!nuevaNota.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("notas_seguimiento").insert({
      contenido: nuevaNota.trim(),
      fecha_nota: new Date().toISOString(),
      cita_id: citaId ?? null,
      examen_id: examenId ?? null,
      medicamento_id: medicamentoId ?? null,
    });
    setNuevaNota("");
    setAgregando(false);
    setSaving(false);
    await cargar();
  };

  const handleEditar = async (id: string) => {
    if (!editTexto.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("notas_seguimiento")
      .update({ contenido: editTexto.trim(), updated_at: new Date().toISOString() })
      .eq("id", id);
    setEditandoId(null);
    setSaving(false);
    await cargar();
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <FileText size={13} />
          Seguimiento
        </p>
        {!agregando && (
          <button
            onClick={() => setAgregando(true)}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all active:scale-95"
            style={{ color: accentColor, background: accentBg }}
          >
            <Plus size={12} />
            Agregar nota
          </button>
        )}
      </div>

      <AnimatePresence>
        {agregando && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-col gap-2 overflow-hidden"
          >
            <Textarea
              autoFocus
              value={nuevaNota}
              onChange={e => setNuevaNota(e.target.value)}
              placeholder="Escribe la nota de seguimiento..."
              rows={3}
              className="rounded-xl border-border resize-none text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setAgregando(false); setNuevaNota(""); }}
                className="flex-1 h-9 rounded-xl border border-border text-xs font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregar}
                disabled={saving || !nuevaNota.trim()}
                className="flex-1 h-9 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-60"
                style={{ background: accentColor }}
              >
                {saving ? "Guardando..." : <><Check size={13} /> Guardar</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {notas.length === 0 && !agregando ? (
        <p className="text-sm text-muted-foreground italic">
          Sin notas aún. Toca &ldquo;Agregar nota&rdquo; para dejar la primera.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notas.map((nota, i) => (
            <motion.div
              key={nota.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border p-3 flex flex-col gap-1.5"
              style={{ background: accentBg + "66" }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-semibold text-muted-foreground">
                  {formatTimestamp(nota.fecha_nota)}
                </p>
                {editandoId !== nota.id && (
                  <button
                    onClick={() => { setEditandoId(nota.id); setEditTexto(nota.contenido); }}
                    className="flex items-center gap-0.5 text-[10px] font-semibold shrink-0"
                    style={{ color: accentColor }}
                  >
                    <Edit3 size={11} />
                    Editar
                  </button>
                )}
              </div>

              {editandoId === nota.id ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    autoFocus
                    value={editTexto}
                    onChange={e => setEditTexto(e.target.value)}
                    rows={3}
                    className="rounded-xl border-border resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditandoId(null)}
                      className="flex-1 h-8 rounded-lg border border-border text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1"
                    >
                      <X size={11} /> Cancelar
                    </button>
                    <button
                      onClick={() => handleEditar(nota.id)}
                      disabled={saving || !editTexto.trim()}
                      className="flex-1 h-8 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-60"
                      style={{ background: accentColor }}
                    >
                      {saving ? "..." : <><Check size={11} /> Guardar</>}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
