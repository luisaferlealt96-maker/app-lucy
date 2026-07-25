import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, nombre, redirectTo } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email requerido" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { nombre },
      redirectTo: redirectTo ?? "https://hbbfdbdydrqqgkavijds.supabase.co/auth/v1/callback",
    });

    if (error) {
      const msg = error.message.toLowerCase().includes("already")
        ? "Este correo ya tiene cuenta. Puede iniciar sesión directamente."
        : error.message;
      return new Response(JSON.stringify({ error: msg }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
