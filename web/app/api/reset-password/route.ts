import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sanitize = (s: string) => s.replace(/[^\x20-\x7E]/g, "").trim();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const supabaseUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const serviceKey  = sanitize(process.env.SUPABASE_SECRET_KEY ?? "");

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
    }

    const origin     = sanitize(request.headers.get("origin") ?? request.nextUrl.origin);
    const redirectTo = `${origin}/auth/reset-callback`;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Genera el link de recovery (OTP, sin PKCE) y lo devuelve directo al cliente
    // para navegar sin depender del email
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const action_link = data?.properties?.action_link;
    if (!action_link) {
      return NextResponse.json({
        error: `generateLink no devolvió action_link. keys en data: ${Object.keys(data ?? {}).join(",")}. keys en properties: ${Object.keys(data?.properties ?? {}).join(",")}`,
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action_link });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
