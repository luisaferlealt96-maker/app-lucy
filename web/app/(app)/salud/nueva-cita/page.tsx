"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Calendar, Check, MapPin, ExternalLink, Clock,
  Upload, FileText, Shield, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { useMiembros } from "@/hooks/useSalud";
import { createClient } from "@/lib/supabase/client";
import { uploadArchivoCita } from "@/lib/supabase/storage";

const ESPECIALIDADES = [
  "Cardiología", "Neurología", "Odontología", "Oftalmología",
  "Ortopedia", "Dermatología", "Ginecología", "Urología",
  "Gastroenterología", "Endocrinología", "Psiquiatría", "Medicina general",
  "Nutrición", "Fisioterapia", "Otra",
];

function vencimientoTexto(fechaOrden: string, vigenciaDias = 120) {
  const venc = new Date(fechaOrden + "T12:00:00");
  venc.setDate(venc.getDate() + vigenciaDias);
  const dias = Math.ceil((venc.getTime() - Date.now()) / 86400000);
  const fechaStr = venc.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
  if (dias <= 0)  return { txt: "Esta orden ya venció", color: "#c62828" };
  if (dias <= 15) return { txt: `🔴 Vence en ${dias}d (${fechaStr}) — ¡urgente!`, color: "#c62828" };
  if (dias <= 30) return { txt: `⚠️ Vence en ${dias}d (${fechaStr})`, color: "#e65100" };
  return { txt: `Vence en ${dias}d (${fechaStr})`, color: "#2e7d32" };
}

type AuthForm = {
  fecha_orden: string;
  vigencia_dias: string;
  estado: "sin_gestionar" | "en_tramite";
  fecha_envio_eps: string;
  notas: string;
};

function NuevaCitaContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { miembros } = useMiembros();

  const [tieneFecha, setTieneFecha] = useState(true);
  const [form, setForm] = useState({
    paciente_id: params.get("paciente") ?? "",
    acompanante_id: "",
    especialidad: "",
    medico: "",
    lugar: "",
    lugar_detalle: "",
    fecha: "",
    hora: "",
    notas_pre: "",
  });
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [archivoOrden, setArchivoOrden] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const notasMode = useRef<"texto" | "voz">("texto");
  const [otraEsp, setOtraEsp] = useState(false);

  // Autorización EPS
  const [necesitaAuth, setNecesitaAuth] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState<AuthForm>({
    fecha_orden: "",
    vigencia_dias: "120",
    estado: "sin_gestionar",
    fecha_envio_eps: "",
    notas: "",
  });
  const [authConfirmada, setAuthConfirmada] = useState(false);

  useEffect(() => {
    if (!form.paciente_id && miembros.length > 0) {
      const abuela = miembros.find(m => m.rol === "abuela");
      if (abuela) setForm(f => ({ ...f, paciente_id: abuela.id }));
    }
  }, [miembros, form.paciente_id]);

  const set = (k: string, v: string | null) => setForm(f => ({ ...f, [k]: v ?? "" }));
  const setAuth = (k: keyof AuthForm, v: string) =>
    setAuthForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.paciente_id || !form.especialidad) return;
    if (tieneFecha && (!form.fecha || !form.hora || !form.lugar)) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;

    let audio_url: string | null = null;
    if (audioBlob) {
      const ext = audioBlob.type.includes("mp4") ? "m4a" : "webm";
      const path = `notas/${Date.now()}.${ext}`;
      const { data: uploaded } = await supabase.storage
        .from("audios-salud")
        .upload(path, audioBlob, { contentType: audioBlob.type });
      if (uploaded) {
        const { data: { publicUrl } } = supabase.storage
          .from("audios-salud")
          .getPublicUrl(uploaded.path);
        audio_url = publicUrl;
      }
    }

    const { data: inserted } = await supabase.from("citas").insert({
      paciente_id: form.paciente_id,
      acompanante_id: form.acompanante_id || null,
      especialidad: form.especialidad,
      medico: form.medico || null,
      lugar: tieneFecha ? (form.lugar || null) : null,
      lugar_detalle: tieneFecha ? (form.lugar_detalle || null) : null,
      fecha_hora: tieneFecha ? new Date(`${form.fecha}T${form.hora}`).toISOString() : null,
      notas_pre: form.notas_pre || null,
      audio_url,
      estado: tieneFecha ? "pendiente" : "por_agendar",
    }).select("id").single();

    if (inserted?.id && archivoOrden) {
      const path = await uploadArchivoCita(archivoOrden, inserted.id);
      if (path) await supabase.from("citas").update({ archivo_url: path }).eq("id", inserted.id);
    }

    // Crear autorización vinculada si aplica
    if (inserted?.id && necesitaAuth && authConfirmada && authForm.fecha_orden) {
      await supabase.from("autorizaciones_eps").insert({
        paciente_id: form.paciente_id,
        descripcion: form.especialidad,
        tipo: "cita",
        fecha_orden: authForm.fecha_orden,
        vigencia_dias: parseInt(authForm.vigencia_dias) || 120,
        estado: authForm.estado,
        fecha_envio_eps: authForm.fecha_envio_eps || null,
        notas: authForm.notas || null,
        cita_id: inserted.id,
        created_by: userId,
      });
    }

    // Notificar por WhatsApp solo cuando tiene fecha, hora y lugar
    if (inserted?.id && tieneFecha) {
      supabase.functions.invoke("notificar-citas", {
        body: { tipo: "nueva_cita", cita_id: inserted.id },
      }).catch(() => {});
    }

    setSaving(false);
    setDone(true);
    setTimeout(() => router.back(), 1200);
  };

  const confirmarAuth = () => {
    if (!authForm.fecha_orden) return;
    setAuthConfirmada(true);
    setShowAuthModal(false);
  };

  const acompanantes = miembros.filter(m => m.id !== form.paciente_id);
  const valido = form.paciente_id && form.especialidad &&
    (tieneFecha ? (form.fecha && form.hora && form.lugar) : true);
  const mapsUrl = form.lugar
    ? `https://maps.google.com/?q=${encodeURIComponent(form.lugar)}`
    : null;
  const venc = authForm.fecha_orden ? vencimientoTexto(authForm.fecha_orden, parseInt(authForm.vigencia_dias) || 120) : null;

  return (
    <div className="min-h-dvh bg-background pb-32 max-w-md md:max-w-xl mx-auto">
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
        <div className="flex items-center gap-3">
          <Calendar size={20} color="#C0546A" strokeWidth={2.5} />
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Nueva cita médica</h1>
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
        {/* Toggle ¿Tiene fecha? */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-bold text-foreground">¿Ya tienes fecha para esta cita?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTieneFecha(true)}
              className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-semibold transition-all"
              style={tieneFecha
                ? { background: "#F2C5CE", color: "#C0546A", border: "2px solid #C0546A" }
                : { background: "transparent", color: "var(--muted-foreground)", border: "1.5px solid var(--border)" }}
            >
              <Calendar size={16} strokeWidth={2.5} />
              <span className="text-xs font-bold text-center leading-tight">Sí, ya la tengo</span>
            </button>
            <button
              type="button"
              onClick={() => setTieneFecha(false)}
              className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-semibold transition-all"
              style={!tieneFecha
                ? { background: "#FFF3E0", color: "#e65100", border: "2px solid #e65100" }
                : { background: "transparent", color: "var(--muted-foreground)", border: "1.5px solid var(--border)" }}
            >
              <Clock size={16} strokeWidth={2.5} />
              <span className="text-xs font-bold text-center leading-tight">Pendiente por agendar</span>
            </button>
          </div>
          {!tieneFecha && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs leading-relaxed rounded-xl px-3 py-2.5"
              style={{ background: "#FFF3E0", color: "#e65100" }}
            >
              La cita quedará registrada como <strong>pendiente por agendar</strong>. Cuando tengas los resultados de los otros procedimientos, puedes asignarle la fecha.
            </motion.p>
          )}
        </div>

        {/* Especialidad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Especialidad</label>
          <Select
            value={otraEsp ? "Otra" : (form.especialidad ?? "")}
            onValueChange={v => {
              if (v === "Otra") { setOtraEsp(true); set("especialidad", ""); }
              else { setOtraEsp(false); set("especialidad", v); }
            }}
          >
            <SelectTrigger className="rounded-xl border-border bg-card h-12">
              <SelectValue placeholder="Selecciona especialidad" />
            </SelectTrigger>
            <SelectContent>
              {ESPECIALIDADES.map(e => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AnimatePresence>
            {otraEsp && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Input
                  autoFocus
                  placeholder="Ej: Reumatología, Genética, Hematología…"
                  value={form.especialidad}
                  onChange={e => set("especialidad", e.target.value)}
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
            value={form.medico}
            onChange={e => set("medico", e.target.value)}
            className="rounded-xl border-border bg-card h-12"
          />
        </div>

        {/* Fecha, hora y ubicación */}
        <AnimatePresence>
          {tieneFecha && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Fecha</label>
                  <Input
                    type="date"
                    value={form.fecha}
                    onChange={e => set("fecha", e.target.value)}
                    className="rounded-xl border-border bg-card h-12"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Hora</label>
                  <Input
                    type="time"
                    value={form.hora}
                    onChange={e => set("hora", e.target.value)}
                    className="rounded-xl border-border bg-card h-12"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Ubicación</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Clínica del Country, Cra 15 #98-42"
                    value={form.lugar}
                    onChange={e => set("lugar", e.target.value)}
                    className="rounded-xl border-border bg-card h-12 pl-9 pr-28"
                  />
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg"
                      style={{ background: "#E8F5E9", color: "#2e7d32" }}
                    >
                      <ExternalLink size={11} />
                      Ver en Maps
                    </a>
                  )}
                </div>
                <Input
                  placeholder="Consultorio, piso, torre… (opcional)"
                  value={form.lugar_detalle}
                  onChange={e => set("lugar_detalle", e.target.value)}
                  className="rounded-xl border-border bg-card h-11 text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acompañante */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">¿Quién la acompaña? (opcional)</label>
          <Select value={form.acompanante_id ?? ""} onValueChange={v => set("acompanante_id", v)}>
            <SelectTrigger className="rounded-xl border-border bg-card h-12">
              <SelectValue placeholder="Sin acompañante asignado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin acompañante</SelectItem>
              {acompanantes.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.emoji} {m.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orden médica */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Orden o referencia médica (opcional)</label>
          <label
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-4 py-3.5 cursor-pointer hover:border-primary transition-colors"
            style={archivoOrden ? { borderColor: "#C0546A", background: "#FDF2F4" } : {}}
          >
            <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png" className="hidden"
              onChange={e => setArchivoOrden(e.target.files?.[0] ?? null)} />
            {archivoOrden ? (
              <>
                <FileText size={18} color="#C0546A" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#C0546A" }}>{archivoOrden.name}</p>
                  <p className="text-xs text-muted-foreground">{(archivoOrden.size / 1024).toFixed(0)} KB</p>
                </div>
                <button type="button" onClick={e => { e.preventDefault(); setArchivoOrden(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">Quitar</button>
              </>
            ) : (
              <>
                <Upload size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Subir orden de la cita</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG o PNG · el acompañante podrá verla</p>
                </div>
              </>
            )}
          </label>
        </div>

        {/* Notas previas */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Notas (opcional)</label>
            <div className="flex rounded-lg overflow-hidden border border-border text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => { notasMode.current = "texto"; setAudioBlob(null); }}
                className="px-2.5 py-1 transition-colors"
                style={notasMode.current === "texto"
                  ? { background: "#9B8EC4", color: "#fff" }
                  : { background: "transparent", color: "var(--muted-foreground)" }}
              >
                ✍️ Texto
              </button>
              <button
                type="button"
                onClick={() => { notasMode.current = "voz"; set("notas_pre", ""); }}
                className="px-2.5 py-1 transition-colors"
                style={notasMode.current === "voz"
                  ? { background: "#9B8EC4", color: "#fff" }
                  : { background: "transparent", color: "var(--muted-foreground)" }}
              >
                🎙️ Voz
              </button>
            </div>
          </div>
          {notasMode.current === "texto" ? (
            <Textarea
              placeholder="Síntomas, preguntas para el médico, preparación, qué procedimientos faltan..."
              value={form.notas_pre}
              onChange={e => set("notas_pre", e.target.value)}
              className="rounded-xl border-border bg-card resize-none"
              rows={3}
            />
          ) : (
            <VoiceRecorder onAudio={setAudioBlob} />
          )}
        </div>

        {/* ── Autorización EPS ── */}
        <div
          className="rounded-2xl border-2 bg-card p-4 flex flex-col gap-3"
          style={{ borderColor: necesitaAuth ? "#C0546A" : "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} color="#C0546A" strokeWidth={2.5} />
              <p className="text-sm font-bold text-foreground">¿Necesita autorización de la EPS?</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setNecesitaAuth(false); setAuthConfirmada(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={!necesitaAuth
                  ? { background: "#F2C5CE", color: "#C0546A" }
                  : { background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => { setNecesitaAuth(true); setShowAuthModal(true); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={necesitaAuth
                  ? { background: "#C0546A", color: "#fff" }
                  : { background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                Sí
              </button>
            </div>
          </div>

          <AnimatePresence>
            {necesitaAuth && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {authConfirmada ? (
                  <div className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{ background: "#E8F5E9" }}>
                    <div className="flex items-center gap-2">
                      <Check size={14} color="#2e7d32" strokeWidth={2.5} />
                      <p className="text-xs font-semibold" style={{ color: "#2e7d32" }}>
                        Autorización lista — se crea junto con la cita
                      </p>
                    </div>
                    <button type="button" onClick={() => setShowAuthModal(true)}
                      className="text-xs font-bold underline ml-2 shrink-0" style={{ color: "#2e7d32" }}>
                      Editar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-all active:scale-[0.98]"
                    style={{ background: "#FDF2F4", color: "#C0546A", border: "1.5px dashed #C0546A" }}
                  >
                    Tocar aquí para completar los datos de la autorización →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          disabled={!valido || saving || done}
          className="w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          style={{
            background: done ? "#22c55e" : tieneFecha ? "#9B8EC4" : "#e65100",
            color: "#fff",
          }}
        >
          {done ? (
            <><Check size={20} strokeWidth={2.5} /> Guardado</>
          ) : saving ? (
            audioBlob ? "Subiendo audio…" : "Guardando…"
          ) : tieneFecha ? (
            <><Calendar size={18} /> Guardar cita</>
          ) : (
            <><Clock size={18} /> Guardar como pendiente</>
          )}
        </button>
      </motion.div>

      {/* ── Modal autorización EPS (bottom sheet) ── */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-md md:max-w-xl mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "90dvh", overflowY: "auto" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />

              {/* Cabecera modal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} color="#C0546A" strokeWidth={2.5} />
                  <h2 className="text-base font-extrabold text-foreground">Datos de la autorización</h2>
                </div>
                <button type="button" onClick={() => setShowAuthModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Qué se va a autorizar */}
              {form.especialidad && (
                <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                  style={{ background: "#FDF2F4" }}>
                  <Shield size={13} color="#C0546A" />
                  <p className="text-xs font-semibold" style={{ color: "#C0546A" }}>
                    Para: Cita de {form.especialidad}
                  </p>
                </div>
              )}

              {/* Fecha de la orden */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Fecha de la orden médica</label>
                <p className="text-xs text-muted-foreground -mt-0.5">El día que el médico escribió la orden.</p>
                <Input
                  type="date"
                  value={authForm.fecha_orden}
                  onChange={e => setAuth("fecha_orden", e.target.value)}
                  className="rounded-xl border-border bg-card h-12"
                />
                {venc && (
                  <p className="text-xs font-semibold" style={{ color: venc.color }}>{venc.txt}</p>
                )}
              </div>

              {/* Vigencia */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Vigencia de la orden (días)</label>
                <p className="text-xs text-muted-foreground -mt-0.5">Cuántos días tiene de validez según la orden. Lo más común es 120 días.</p>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={authForm.vigencia_dias}
                  onChange={e => setAuth("vigencia_dias", e.target.value)}
                  className="rounded-xl border-border bg-card h-12"
                />
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">¿En qué punto está?</label>
                {[
                  { value: "sin_gestionar", label: "Tengo la orden pero aún no la envié a la EPS" },
                  { value: "en_tramite",    label: "Ya la envié al módulo de autorizaciones de la EPS" },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setAuth("estado", opt.value)}
                    className="text-left rounded-xl border-2 px-3 py-2.5 text-sm transition-all"
                    style={authForm.estado === opt.value
                      ? { borderColor: "#C0546A", background: "#FDF2F4", color: "#C0546A", fontWeight: 600 }
                      : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className={`overflow-hidden transition-all duration-300 -mx-1 px-1 ${authForm.estado === "en_tramite" ? "max-h-28 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground">Fecha en que la enviaste</label>
                  <Input
                    type="date"
                    value={authForm.fecha_envio_eps}
                    onChange={e => setAuth("fecha_envio_eps", e.target.value)}
                    className="rounded-xl border-border bg-card h-12"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Notas (opcional)</label>
                <textarea
                  placeholder="Número de radicado, médico que firmó, observaciones..."
                  value={authForm.notas}
                  onChange={e => setAuth("notas", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={confirmarAuth}
                disabled={!authForm.fecha_orden}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#C0546A" }}
              >
                <Shield size={16} />
                Listo, agregar autorización
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NuevaCitaPage() {
  return (
    <Suspense>
      <NuevaCitaContent />
    </Suspense>
  );
}
