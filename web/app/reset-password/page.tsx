"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) return;

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(`Error: ${updateError.message}`);
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => { window.location.href = "/inicio"; }, 2500);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <CheckCircle size={56} className="text-green-500" />
          <h2 className="text-xl font-bold text-foreground">¡Contraseña actualizada!</h2>
          <p className="text-sm text-muted-foreground">Entrando a la app...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-5xl shadow-md"
            style={{ background: "#F2C5CE" }}
          >
            🔐
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Nueva contraseña</h1>
          <p className="text-muted-foreground mt-1.5 text-sm font-medium">
            Elige una contraseña segura para tu cuenta
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-11 rounded-xl border-border bg-card h-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="pl-10 rounded-xl border-border bg-card h-12"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 font-medium bg-red-50 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!password || !confirm || loading}
            className="w-full h-14 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            style={{ background: "#9B8EC4" }}
          >
            {loading
              ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Guardando...</>
              : "Guardar contraseña"
            }
          </button>
        </motion.form>
      </div>
    </div>
  );
}
