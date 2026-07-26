"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetCallbackPage() {
  const [debug, setDebug] = useState("Verificando enlace...");

  useEffect(() => {
    const handle = async () => {
      try {
        const supabase = createClient();

        // Flujo PKCE: code en la query string
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          setDebug("Verificando código...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            window.location.href = "/reset-password";
            return;
          }
          setDebug(`Error: ${error.message}`);
          setTimeout(() => { window.location.href = "/login"; }, 3000);
          return;
        }

        // Flujo implícito: tokens en el hash
        const hash = window.location.hash;
        if (hash) window.history.replaceState(null, "", window.location.pathname);
        if (hash.includes("access_token=")) {
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get("access_token") ?? "";
          const refresh_token = params.get("refresh_token") ?? "";
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!error) {
            window.location.href = "/reset-password";
            return;
          }
          setDebug(`Error: ${error.message}`);
          setTimeout(() => { window.location.href = "/login"; }, 3000);
          return;
        }

        setDebug("Enlace inválido o expirado. Volviendo al login...");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
      } catch (e) {
        setDebug(`Error inesperado: ${e instanceof Error ? e.message : String(e)}`);
        setTimeout(() => { window.location.href = "/login"; }, 3000);
      }
    };

    handle();
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background px-6">
      <div className="w-10 h-10 rounded-full border-2 border-[#9B8EC4] border-t-transparent animate-spin" />
      <p className="text-xs text-muted-foreground text-center max-w-xs break-words">{debug}</p>
    </div>
  );
}
