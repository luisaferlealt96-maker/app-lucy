import { createClient } from "@/lib/supabase/client";
import type { TipoNotificacion, EntidadNotificacion } from "@/lib/supabase/types";

export async function crearNotificacion(params: {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje?: string | null;
  entidad_tipo?: EntidadNotificacion;
  entidad_id?: string;
}) {
  const supabase = createClient();
  await supabase.from("notificaciones").insert({
    tipo: params.tipo,
    titulo: params.titulo,
    mensaje: params.mensaje ?? null,
    entidad_tipo: params.entidad_tipo ?? null,
    entidad_id: params.entidad_id ?? null,
  });
}
