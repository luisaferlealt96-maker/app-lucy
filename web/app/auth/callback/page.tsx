"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Verificando tu acceso...");

  useEffect(() => {
    const handle = async () => {
      try {
        const supabase = createClient();
        const searchParams = new URLSearchParams(window.location.search);
        const isInvite = searchParams.get("invite") === "1";

        const ir = async (userId: string, email: string | null | undefined, forceSetPassword = false) => {
          setMsg("Buscando tu perfil...");
          let { data: miembro } = await supabase
            .from("miembros_familia")
            .select("id, rol")
            .eq("user_id", userId)
            .maybeSingle();

          if (!miembro && email) {
            // Búsqueda insensible a mayúsculas para tolerar pequeñas diferencias de capitalización
            const { data: porEmail } = await supabase
              .from("miembros_familia")
              .select("id, rol")
              .ilike("email", email)
              .maybeSingle();

            if (porEmail) {
              await supabase.from("miembros_familia")
                .update({ user_id: userId })
                .eq("id", porEmail.id);
              miembro = porEmail;
            }
          }

          // Invitaciones nuevas: ir primero a crear contraseña
          if (forceSetPassword || isInvite) {
            setMsg("Crea tu contraseña para entrar la próxima vez...");
            window.location.href = "/nueva-contrasena";
            return;
          }

          const dest = miembro?.rol === "abuela" ? "/abuela" : "/inicio";
          setMsg("¡Listo! Entrando a la app...");
          sessionStorage.setItem("__auth_nav", JSON.stringify({ dest, ts: Date.now() }));
          window.location.href = dest;
        };

        // Intento 1: tokens en el hash (flujo implícito)
        const hash = window.location.hash;
        if (hash) window.history.replaceState(null, "", window.location.pathname);

        if (hash.includes("access_token=")) {
          setMsg("Verificando tu acceso...");
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get("access_token") ?? "";
          const refresh_token = params.get("refresh_token") ?? "";
          const type = params.get("type") ?? "";

          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

          if (!error && data.session) {
            if (type === "recovery") {
              setMsg("Redirigiendo para cambiar contraseña...");
              window.location.href = "/reset-password";
              return;
            }
            // type === "invite" o "signup" = primera vez de un usuario invitado
            const esInvitacion = type === "invite" || type === "signup" || isInvite;
            await ir(data.session.user.id, data.session.user.email, esInvitacion);
            return;
          }
        }

        // Intento 2: code en la query string (flujo PKCE)
        const code = searchParams.get("code");
        const isReset = localStorage.getItem("__password_reset") === "1";
        if (code) {
          setMsg("Verificando tu acceso...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            if (isReset) {
              localStorage.removeItem("__password_reset");
              setMsg("Redirigiendo para cambiar contraseña...");
              window.location.href = "/reset-password";
              return;
            }
            await ir(data.session.user.id, data.session.user.email);
            return;
          }
        }

        // Intento 3: sesión ya guardada en localStorage
        setMsg("Verificando tu sesión...");
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await ir(data.session.user.id, data.session.user.email);
          return;
        }

        setMsg("No encontramos tu sesión. Volviendo al inicio de sesión...");
        setTimeout(() => router.replace("/login"), 1500);
      } catch {
        setMsg("Ocurrió un problema. Volviendo al inicio de sesión...");
        setTimeout(() => router.replace("/login"), 2000);
      }
    };

    handle();
  }, [router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background px-6">
      <div className="w-10 h-10 rounded-full border-2 border-[#9B8EC4] border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground text-center max-w-xs">{msg}</p>
    </div>
  );
}
