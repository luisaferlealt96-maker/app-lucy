"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type View = "login" | "forgot" | "forgot-sent";

export default function LoginPage() {
  const [view, setView]             = useState<View>("login");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Mensaje que deja el callback cuando rechaza una cuenta de Google no registrada
  useEffect(() => {
    const msg = sessionStorage.getItem("__login_error");
    if (msg) {
      setError(msg);
      sessionStorage.removeItem("__login_error");
    }
  }, []);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    sessionStorage.setItem("__google_login", "1");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      sessionStorage.removeItem("__google_login");
      setError("No se pudo iniciar con Google. Intenta de nuevo o entra con tu correo y contraseña.");
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError("El correo o la contraseña no son correctos.");
        setLoading(false);
        return;
      }

      let { data: miembro } = await supabase
        .from("miembros_familia")
        .select("id, rol")
        .eq("user_id", data.user.id)
        .maybeSingle();

      // Si no tiene user_id vinculado aún, buscarlo por email y vincularlo
      if (!miembro && email) {
        const { data: porEmail } = await supabase
          .from("miembros_familia")
          .select("id, rol")
          .eq("email", email)
          .maybeSingle();
        if (porEmail) {
          await supabase.from("miembros_familia")
            .update({ user_id: data.user.id })
            .eq("id", porEmail.id);
          miembro = porEmail;
        }
      }

      const dest = miembro?.rol === "abuela" ? "/abuela" : "/inicio";
      window.location.href = dest;
    } catch {
      setError("Algo salió mal. Intenta de nuevo en un momento.");
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(`Error: ${data.error ?? "No se pudo enviar el correo."}`);
        setLoading(false);
        return;
      }

      // Si el servidor devuelve el link directo, navegar sin esperar el email
      if (data.action_link) {
        window.location.href = data.action_link;
        return;
      }

      setView("forgot-sent");
    } catch {
      setError("Algo salió mal. Intenta de nuevo en un momento.");
    } finally {
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
          <h1 className="text-3xl font-extrabold text-foreground">App Lucy</h1>
          <p className="text-muted-foreground mt-1.5 text-sm font-medium">
            Tu familia organizada con amor
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── LOGIN ── */}
          {view === "login" && (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
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
                disabled={!email || !password || loading}
                className="w-full h-14 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: "#9B8EC4" }}
              >
                {loading
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Entrando...</>
                  : <><LogIn size={18} /> Entrar</>
                }
              </button>

              <div className="flex items-center gap-3 my-1">
                <span className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="w-full h-14 rounded-2xl font-semibold text-base text-foreground bg-card border border-border transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {googleLoading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                {googleLoading ? "Conectando con Google..." : "Continuar con Google"}
              </button>

              <button
                type="button"
                onClick={() => { setView("forgot"); setError(""); setForgotEmail(email); }}
                className="text-sm text-muted-foreground text-center mt-1 hover:text-foreground transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </motion.form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === "forgot" && (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleForgot}
              className="flex flex-col gap-4"
            >
              <button
                type="button"
                onClick={() => { setView("login"); setError(""); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit -mt-2 mb-1"
              >
                <ArrowLeft size={15} /> Volver
              </button>

              <div>
                <p className="text-base font-bold text-foreground mb-1">Recuperar contraseña</p>
                <p className="text-sm text-muted-foreground">
                  Te enviamos un enlace para crear una nueva contraseña.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Tu correo electrónico
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="pl-10 rounded-xl border-border bg-card h-12"
                    autoComplete="email"
                    autoFocus
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
                disabled={!forgotEmail || loading}
                className="w-full h-14 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: "#9B8EC4" }}
              >
                {loading
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Enviando...</>
                  : "Enviar enlace"
                }
              </button>
            </motion.form>
          )}

          {/* ── EMAIL ENVIADO ── */}
          {view === "forgot-sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <CheckCircle size={52} className="text-green-500" />
              <div>
                <p className="text-base font-bold text-foreground mb-1">¡Correo enviado!</p>
                <p className="text-sm text-muted-foreground">
                  Revisa tu bandeja de entrada en <span className="font-semibold text-foreground">{forgotEmail}</span> y haz clic en el enlace para crear tu nueva contraseña.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setView("login"); setError(""); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                Volver al inicio de sesión
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {view === "login" && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            ¿Problemas para entrar? Escríbele a Luisa 💜
          </p>
        )}
      </div>
    </div>
  );
}
