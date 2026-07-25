import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, nombre } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const origin = req.headers.get("origin") ?? "http://localhost:3001";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invitar-usuario`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      },
      body: JSON.stringify({ email, nombre, redirectTo: `${origin}/auth/callback` }),
    }
  );

  const json = await res.json();
  if (!res.ok) return NextResponse.json({ error: json.error ?? "Error al enviar" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
