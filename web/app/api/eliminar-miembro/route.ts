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

    // Leer el email del miembro ANTES de borrarlo (necesario si user_id es null)
    let memberEmail: string | null = null;
    if (!auth_user_id) {
      const { data: mb } = await supabase
        .from("miembros_familia")
        .select("email")
        .eq("id", miembro_id)
        .maybeSingle();
      memberEmail = mb?.email ?? null;
    }

    // Eliminar de miembros_familia
    const { error: dbError } = await supabase
      .from("miembros_familia")
      .delete()
      .eq("id", miembro_id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Eliminar cuenta de auth
    if (auth_user_id) {
      await supabase.auth.admin.deleteUser(auth_user_id);
    } else if (memberEmail) {
      // El miembro nunca ingresó: buscar la cuenta en Auth por email y borrarla
      // para que se pueda volver a invitar sin conflictos
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUser = users.find(u => u.email?.toLowerCase() === memberEmail!.toLowerCase());
      if (authUser) {
        await supabase.auth.admin.deleteUser(authUser.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
