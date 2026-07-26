"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [debug, setDebug] = useState("Iniciando...");

  useEffect(() => {
    const handle = async () => {
      try {
        const supabase = createClient();

        const ir = async (userId: string, email: string | null | undefined) => {
          setDebug(`Buscando miembro: ${email}`);
          let { data: miembro } = await supabase
            .from("miembros_familia")
            .select("id, rol")
            .eq("user_id", userId)
            .maybeSingle();

          if (!miembro && email) {
            const { data: porEmail } = await supabase
              .from("miembros_familia")
              .select("id, rol")
              .eq("email", email)
              .maybeSingle();

            if (porEmail) {
              await supabase.from("miembros_familia")
                .update({ user_id: userId })
                .eq("id", porEmail.id);
              miembro = porEmail;
            }
          }

          const dest = miembro?.rol === "abuela" ? "/abuela" : "/inicio";
          setDebug(`Redirigiendo a ${dest}...`);
          sessionStorage.setItem("__auth_nav", JSON.stringify({ dest, ts: Date.now() }));
          window.location.href = dest;
        };

        // Intento 1: tokens en el hash (flujo implícito)
        const hash = window.location.hash;
        // Limpiar el hash ANTES de async para que recargas por HMR no reintenten
        if (hash) window.history.replaceState(null, "", window.location.pathname);
        setDebug(`Hash: ${hash.substring(0, 30)}...`);

        if (hash.includes("access_token=")) {
          setDebug("Encontré access_token en el hash, llamando setSession...");
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get("access_token") ?? "";
          const refresh_token = params.get("refresh_token") ?? "";
          const type = params.get("type") ?? "";

          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
          setDebug(`setSession result: error=${error?.message ?? "none"} session=${data.session ? "ok" : "null"}`);

          if (!error && data.session) {
            if (type === "recovery") {
              setDebug("Flujo de recuperación, redirigiendo a cambiar contraseña...");
              window.location.href = "/reset-password";
              return;
            }
            await ir(data.session.user.id, data.session.user.email);
            return;
          }
          setDebug(`setSession falló: ${error?.message ?? "session es null"}`);
        }

        // Intento 2: code en la query string (flujo PKCE)
        const code = new URLSearchParams(window.location.search).get("code");
        const isReset = localStorage.getItem("__password_reset") === "1";
        if (code) {
          setDebug("Encontré code en la URL, intercambiando...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            if (isReset) {
              localStorage.removeItem("__password_reset");
              setDebug("Flujo de recuperación (PKCE), redirigiendo a cambiar contraseña...");
              window.location.href = "/reset-password";
              return;
            }
            await ir(data.session.user.id, data.session.user.email);
            return;
          }
          setDebug(`exchangeCode falló: ${error?.message ?? "session es null"}`);
        }

        // Intento 3: sesión ya guardada en localStorage
        setDebug("Intentando getSession desde localStorage...");
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await ir(data.session.user.id, data.session.user.email);
          return;
        }

        setDebug("Sin sesión. Volviendo al login...");
        router.replace("/login");
      } catch (e) {
        setDebug(`Error inesperado: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    handle();
  }, [router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background px-6">
      <div className="w-10 h-10 rounded-full border-2 border-[#9B8EC4] border-t-transparent animate-spin" />
      <p className="text-xs text-muted-foreground text-center max-w-xs break-words">{debug}</p>
    </div>
  );
}
