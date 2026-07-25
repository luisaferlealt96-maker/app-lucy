"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("El correo o la contraseña no son correctos.");
        setLoading(false);
        return;
      }

      const { data: miembro } = await supabase
        .from("miembros_familia")
        .select("rol")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const dest = miembro?.rol === "abuela" ? "/abuela" : "/inicio";
      window.location.href = dest;
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-5xl shadow-md"
            style={{ background: "#F2C5CE" }}
          >
            🏠
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Lucy Familia</h1>
          <p className="text-muted-foreground mt-1.5 text-sm font-medium">
            Tu familia organizada con amor
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 rounded-xl border-border bg-card h-12"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-11 rounded-xl border-border bg-card h-12"
                autoComplete="current-password"
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

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 font-medium bg-red-50 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={!email || !password || loading}
            className="w-full h-14 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            style={{ background: "#9B8EC4" }}
          >
            {loading
              ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Entrando...</>
              : <><LogIn size={18} /> Entrar</>
            }
          </button>
        </motion.form>

        <p className="text-xs text-muted-foreground text-center mt-8">
          ¿Problemas para entrar? Escríbele a Luisa 💜
        </p>
      </div>
    </div>
  );
}
