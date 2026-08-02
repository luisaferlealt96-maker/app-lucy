"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings, User, Phone, Check, X, Plus, Pencil, Shield,
  ChevronRight, UserCheck, UserX, Mail, Send, Link2, Link2Off, LogOut, Trash2, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { MiembroFamilia, Rol } from "@/lib/supabase/types";

const EMOJIS = [
  "👩","👨","👵","👴","🧑","👧","👦",
  "👩‍🦳","👨‍🦳","🧓","👩‍🦰","👨‍🦰",
  "🌸","⭐","🌻","🦋","🐱","🏠","💜","🌿",
];

const ROL_LABELS: Record<Rol, { label: string; desc: string }> = {
  admin:    { label: "Administradora", desc: "Ve y controla todo" },
  familiar: { label: "Familiar",       desc: "Ve todo y colabora" },
  abuela:   { label: "Vista especial", desc: "Pantalla grande, solo sus citas" },
};

const ROL_COLORS: Record<Rol, { bg: string; color: string }> = {
  admin:    { bg: "#EDE9F7", color: "#9B8EC4" },
  familiar: { bg: "#E8F5E9", color: "#2e7d32" },
  abuela:   { bg: "#FFF3E0", color: "#e65100" },
};

const BLANK_FORM = { nombre: "", emoji: "🧑", telefono: "", email: "", rol: "familiar" as Rol, activo: true };

export default function ConfiguracionPage() {
  const [miembros, setMiembros] = useState<MiembroFamilia[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState<MiembroFamilia | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", emoji: "🧑", telefono: "", email: "", rol: "familiar" as Rol, activo: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [invitando, setInvitando] = useState(false);
  const [invitado, setInvitado] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showNuevo, setShowNuevo] = useState(false);
  const [nuevoForm, setNuevoForm] = useState(BLANK_FORM);
  const [savingNuevo, setSavingNuevo] = useState(false);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const [{ data: user }, { data: mbs }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("miembros_familia").select("*").order("created_at"),
    ]);
    const uid = user.user?.id ?? null;
    setCurrentUserId(uid);
    setMiembros(mbs ?? []);
    const yo = (mbs ?? []).find(m => m.user_id === uid);
    setIsAdmin(yo?.rol === "admin");
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirEdicion = (m: MiembroFamilia) => {
    setEditando(m);
    setEditForm({
      nombre: m.nombre,
      emoji: m.emoji,
      telefono: m.telefono ?? "",
      email: m.email ?? "",
      rol: m.rol,
      activo: m.activo,
    });
    setSaveError(null);
    setInviteError(null);
    setInvitado(false);
    setConfirmDelete(false);
  };

  const eliminarMiembro = async () => {
    if (!editando) return;
    setDeleting(true);
    const res = await fetch("/api/eliminar-miembro", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ miembro_id: editando.id, auth_user_id: editando.user_id }),
    });
    setDeleting(false);
    if (res.ok) {
      setEditando(null);
      setConfirmDelete(false);
      await cargar();
    }
  };

  const guardarEdicion = async () => {
    if (!editando || !editForm.nombre) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase.from("miembros_familia").update({
      nombre: editForm.nombre,
      emoji: editForm.emoji,
      telefono: editForm.telefono || null,
      email: editForm.email || null,
      rol: editForm.rol,
      activo: editForm.activo,
    }).eq("id", editando.id);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    setEditando(null);
    await cargar();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enviarInvitacion = async () => {
    if (!editando || !editForm.email) return;
    setInvitando(true);
    setInviteError(null);
    try {
      const supabase = createClient();
      await supabase.from("miembros_familia").update({ email: editForm.email || null }).eq("id", editando.id);

      const res = await fetch("/api/invitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editForm.email, nombre: editForm.nombre }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInviteError(json.error ?? "Error al enviar");
        return;
      }
      setInvitado(true);
      await cargar();
    } catch (e) {
      setInviteError("Error de conexión, intenta de nuevo");
    } finally {
      setInvitando(false);
    }
  };

  const guardarNuevo = async () => {
    if (!nuevoForm.nombre) return;
    setSavingNuevo(true);
    const supabase = createClient();
    const { error } = await supabase.from("miembros_familia").insert({
      nombre: nuevoForm.nombre,
      emoji: nuevoForm.emoji,
      telefono: nuevoForm.telefono || null,
      email: nuevoForm.email || null,
      rol: nuevoForm.rol,
      activo: true,
    });
    setSavingNuevo(false);
    if (error) return;
    setShowNuevo(false);
    setNuevoForm(BLANK_FORM);
    await cargar();
  };

  const miActual = miembros.find(m => m.user_id === currentUserId);
  const resto = miembros.filter(m => m.user_id !== currentUserId);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-dvh bg-background pb-20 max-w-2xl mx-auto px-4 pt-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EDE9F7" }}>
            <Settings size={18} color="#9B8EC4" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Configuración</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-12">Gestiona los miembros y perfiles de la familia</p>
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl px-4 py-3 flex items-center gap-2" style={{ background: "#E8F5E9" }}>
          <Check size={15} color="#2e7d32" strokeWidth={2.5} />
          <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Cambios guardados</p>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center pt-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#9B8EC4] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Mi perfil */}
          {miActual && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 px-1">Mi perfil</p>
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: "#EDE9F7" }}>
                  {miActual.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-extrabold text-foreground">{miActual.nombre}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: ROL_COLORS[miActual.rol].bg, color: ROL_COLORS[miActual.rol].color }}>
                      {ROL_LABELS[miActual.rol].label}
                    </span>
                    {miActual.email && (
                      <span className="text-xs text-muted-foreground truncate">{miActual.email}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => abrirEdicion(miActual)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0"
                  style={{ background: "#EDE9F7", color: "#9B8EC4" }}
                >
                  <Pencil size={12} strokeWidth={2.5} /> Editar
                </button>
              </div>
            </motion.section>
          )}

          {/* Colaboradores */}
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Colaboradores</p>
              {isAdmin && (
                <button
                  onClick={() => setShowNuevo(true)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                  style={{ background: "#EDE9F7", color: "#9B8EC4" }}
                >
                  <Plus size={13} strokeWidth={2.5} /> Agregar
                </button>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
              {resto.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay otros miembros aún
                </div>
              )}
              {resto.map((m, i) => {
                const rc = ROL_COLORS[m.rol];
                const vinculado = !!m.user_id;
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.04 }}
                    onClick={() => abrirEdicion(m)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: rc.bg }}>
                      {m.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{m.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] font-semibold" style={{ color: rc.color }}>
                          {ROL_LABELS[m.rol].label}
                        </span>
                        {/* Estado de vinculación */}
                        {vinculado ? (
                          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                            <Link2 size={10} strokeWidth={2.5} /> Vinculado
                          </span>
                        ) : m.email ? (
                          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                            <Mail size={10} strokeWidth={2.5} /> Invitación pendiente
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                            <Link2Off size={10} /> Sin cuenta
                          </span>
                        )}
                        {!m.activo && (
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        </>
      )}

      {/* ── Bottom sheet: Editar miembro ── */}
      <AnimatePresence>
        {editando && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setEditando(null); }}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">Editar perfil</h2>
                <button type="button" onClick={() => setEditando(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Estado de vinculación */}
              <div className="rounded-2xl border border-border px-4 py-3 flex items-center gap-3"
                style={editando.user_id
                  ? { background: "#F0FDF4", borderColor: "#bbf7d0" }
                  : { background: "var(--secondary)", borderColor: "var(--border)" }}>
                {editando.user_id ? (
                  <>
                    <Link2 size={15} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Cuenta vinculada</p>
                      <p className="text-[11px] text-emerald-600">Ya puede iniciar sesión en la app</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Link2Off size={15} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Sin cuenta todavía</p>
                      <p className="text-[11px] text-muted-foreground">Agrega su correo y envíale una invitación</p>
                    </div>
                  </>
                )}
              </div>

              {/* Emoji selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setEditForm(f => ({ ...f, emoji: e }))}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                      style={editForm.emoji === e
                        ? { background: "#EDE9F7", boxShadow: "0 0 0 2px #9B8EC4" }
                        : { background: "var(--secondary)" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Nombre</label>
                <Input value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre completo" className="rounded-xl border-border bg-card h-12" />
              </div>

              {/* Email + invitación */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="correo@gmail.com"
                    type="email"
                    className="rounded-xl border-border bg-card h-12 pl-9"
                  />
                </div>
                {/* Botón invitar — solo si hay email y no está vinculado */}
                {isAdmin && !editando.user_id && editForm.email && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      {invitado ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                          style={{ background: "#E8F5E9", color: "#2e7d32" }}>
                          <Check size={13} strokeWidth={2.5} /> Invitación enviada a {editForm.email}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={enviarInvitacion}
                          disabled={invitando}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                          style={{ background: "#EDE9F7", color: "#9B8EC4" }}
                        >
                          <Send size={12} strokeWidth={2.5} />
                          {invitando ? "Enviando…" : "Enviar invitación por correo"}
                        </button>
                      )}
                      {inviteError && (
                        <p className="text-xs text-red-500 font-medium mt-1">{inviteError}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">WhatsApp (opcional)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={editForm.telefono} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                    placeholder="+57 300 000 0000" className="rounded-xl border-border bg-card h-12 pl-9" />
                </div>
              </div>

              {/* Rol */}
              {isAdmin && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground">Rol</label>
                  <div className="flex flex-col gap-2">
                    {(Object.entries(ROL_LABELS) as [Rol, { label: string; desc: string }][]).map(([rol, { label, desc }]) => (
                      <button key={rol} type="button" onClick={() => setEditForm(f => ({ ...f, rol }))}
                        className="text-left rounded-xl border-2 px-3 py-2.5 transition-all"
                        style={editForm.rol === rol
                          ? { borderColor: "#9B8EC4", background: "#EDE9F7", color: "#9B8EC4" }
                          : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activo / Inactivo */}
              {isAdmin && (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Miembro activo</p>
                    <p className="text-xs text-muted-foreground">Los inactivos no reciben notificaciones</p>
                  </div>
                  <button type="button"
                    onClick={() => setEditForm(f => ({ ...f, activo: !f.activo }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
                    style={editForm.activo
                      ? { background: "#E8F5E9", color: "#2e7d32", borderColor: "#2e7d32" }
                      : { background: "#f3f4f6", color: "#6b7280", borderColor: "#d1d5db" }}>
                    {editForm.activo ? <><UserCheck size={13} /> Activo</> : <><UserX size={13} /> Inactivo</>}
                  </button>
                </div>
              )}

              {saveError && (
                <p className="text-xs font-semibold text-red-600 text-center -mt-1">{saveError}</p>
              )}

              <button type="button" onClick={guardarEdicion} disabled={!editForm.nombre || saving}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#9B8EC4" }}>
                {saving ? "Guardando…" : <><Check size={16} strokeWidth={2.5} /> Guardar cambios</>}
              </button>

              {/* Eliminar — solo admin, no a sí mismo */}
              {isAdmin && editando.user_id !== currentUserId && (
                <div className="border-t border-border pt-4">
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 active:scale-[0.97] transition-all"
                    >
                      <Trash2 size={15} strokeWidth={2} /> Eliminar colaborador
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border-2 border-red-200 p-4 flex flex-col gap-3"
                      style={{ background: "#FFF5F5" }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} color="#ef4444" />
                        <p className="text-sm font-bold text-red-600">¿Eliminar a {editando.nombre}?</p>
                      </div>
                      <p className="text-xs text-red-500">
                        Se borrará su perfil y su acceso a la app. Esta acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 h-10 rounded-xl border-2 border-border text-sm font-semibold text-foreground hover:bg-secondary transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={eliminarMiembro}
                          disabled={deleting}
                          className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-50"
                          style={{ background: "#ef4444" }}
                        >
                          {deleting ? "Eliminando…" : "Sí, eliminar"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom sheet: Nuevo colaborador ── */}
      <AnimatePresence>
        {showNuevo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowNuevo(false); }}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl mx-auto bg-background rounded-t-3xl md:rounded-3xl px-4 pt-4 pb-10 md:pb-6 flex flex-col gap-4"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-1" />
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">Nuevo colaborador</h2>
                <button type="button" onClick={() => setShowNuevo(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground -mt-2">
                Agrega su correo para enviarle una invitación después de guardarlo.
              </p>

              {/* Emoji */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setNuevoForm(f => ({ ...f, emoji: e }))}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                      style={nuevoForm.emoji === e
                        ? { background: "#EDE9F7", boxShadow: "0 0 0 2px #9B8EC4" }
                        : { background: "var(--secondary)" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Nombre</label>
                <Input value={nuevoForm.nombre} onChange={e => setNuevoForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre completo" className="rounded-xl border-border bg-card h-12" autoFocus />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={nuevoForm.email} onChange={e => setNuevoForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="correo@gmail.com" type="email"
                    className="rounded-xl border-border bg-card h-12 pl-9" />
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">WhatsApp (opcional)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={nuevoForm.telefono} onChange={e => setNuevoForm(f => ({ ...f, telefono: e.target.value }))}
                    placeholder="+57 300 000 0000" className="rounded-xl border-border bg-card h-12 pl-9" />
                </div>
              </div>

              {/* Rol */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">Rol</label>
                <div className="flex flex-col gap-2">
                  {(Object.entries(ROL_LABELS) as [Rol, { label: string; desc: string }][]).map(([rol, { label, desc }]) => (
                    <button key={rol} type="button" onClick={() => setNuevoForm(f => ({ ...f, rol }))}
                      className="text-left rounded-xl border-2 px-3 py-2.5 transition-all"
                      style={nuevoForm.rol === rol
                        ? { borderColor: "#9B8EC4", background: "#EDE9F7", color: "#9B8EC4" }
                        : { borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <p className="text-sm font-bold">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={guardarNuevo} disabled={!nuevoForm.nombre || savingNuevo}
                className="w-full h-13 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#9B8EC4" }}>
                {savingNuevo ? "Guardando…" : <><Plus size={16} strokeWidth={2.5} /> Agregar colaborador</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cerrar sesión */}
      <div className="mt-8 mb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 active:scale-[0.97] transition-all"
        >
          <LogOut size={16} strokeWidth={2} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
