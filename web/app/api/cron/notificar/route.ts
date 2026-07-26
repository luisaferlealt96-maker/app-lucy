import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sanitize = (s: string) => s.replace(/[^\x20-\x7E]/g, "").trim();

const TIPOS_VALIDOS = ["recordatorio", "autorizaciones", "resultados", "resumen_semanal"];

export async function GET(request: NextRequest) {
  const tipo = request.nextUrl.searchParams.get("tipo");

  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
  }

  const supabaseUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const serviceKey  = sanitize(process.env.SUPABASE_SECRET_KEY ?? "");

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.functions.invoke("notificar-citas", {
    body: { tipo },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tipo, result: data });
}
