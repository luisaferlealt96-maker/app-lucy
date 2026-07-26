import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sanitize = (s: string) => s.replace(/[^\x20-\x7E]/g, "").trim();

export async function DELETE(request: NextRequest) {
  try {
    const { miembro_id, auth_user_id } = await request.json();
    if (!miembro_id) {
      return NextResponse.json({ error: "miembro_id requerido" }, { status: 400 });
    }

    const supabaseUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const serviceKey  = sanitize(process.env.SUPABASE_SECRET_KEY ?? "");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Eliminar de miembros_familia
    const { error: dbError } = await supabase
      .from("miembros_familia")
      .delete()
      .eq("id", miembro_id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Eliminar cuenta de auth si existe
    if (auth_user_id) {
      await supabase.auth.admin.deleteUser(auth_user_id);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
