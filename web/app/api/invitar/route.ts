import { NextRequest, NextResponse } from "next/server";

const sanitize = (s: string) => s.replace(/[^\x20-\x7E]/g, "").trim();

export async function POST(req: NextRequest) {
  const { email, nombre } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const origin     = sanitize(req.headers.get("origin") ?? "https://app-lucy.vercel.app");
  const supabaseUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const serviceKey  = sanitize(process.env.SUPABASE_SECRET_KEY ?? "");

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  const res = await fetch(
    `${supabaseUrl}/functions/v1/invitar-usuario`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ email, nombre, redirectTo: `${origin}/auth/callback?invite=1` }),
    }
  );

  const json = await res.json();
  if (!res.ok) return NextResponse.json({ error: json.error ?? "Error al enviar" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
