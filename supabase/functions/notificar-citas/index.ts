import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WHATSAPP_TOKEN    = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const ALLOWED_ORIGIN = Deno.env.get("APP_URL") ?? "https://app-lucy.vercel.app";
const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Param = { name: string; value: string };

async function enviarWA(telefono: string, template: string, params: Param[], lugarUrl?: string) {
  const cleaned = telefono.replace(/\s/g, "").replace(/^\+/, "");
  const components: object[] = [{
    type: "body",
    parameters: params.map(({ name, value }) => ({ type: "text", parameter_name: name, text: value })),
  }];
  if (lugarUrl) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: lugarUrl }],
    });
  }
  const body = {
    messaging_product: "whatsapp",
    to: cleaned,
    type: "template",
    template: { name: template, language: { code: "es_CO" }, components },
  };
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    console.error(`WA error para ${cleaned} [${template}]:`, err);
  }
  return res.ok;
}

function fechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Bogota" });
}
function horaCorta(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });
}
function fechaCorta(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}
function formatHora(horaStr: string) {
  const [h, m] = horaStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "p.m." : "a.m.";
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}
function diasHabilesDesde(fechaStr: string): number {
  const from = new Date(fechaStr + "T12:00:00");
  const now  = new Date();
  let days = 0;
  const cur = new Date(from);
  while (cur < now) {
    cur.setDate(cur.getDate() + 1);
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days++;
  }
  return days;
}
function diasRestantes(fechaOrdenStr: string): number {
  const venc = new Date(fechaOrdenStr + "T12:00:00");
  venc.setDate(venc.getDate() + 120);
  return Math.ceil((venc.getTime() - Date.now()) / 86400000);
}
function diasDesde(fechaStr: string): number {
  const from = new Date(fechaStr + "T12:00:00");
  return Math.floor((Date.now() - from.getTime()) / 86400000);
}

async function getRecipientes(sb: ReturnType<typeof createClient>, createdBy?: string | null) {
  const { data: admins } = await sb.from("miembros_familia")
    .select("nombre, telefono")
    .eq("activo", true)
    .eq("rol", "admin")
    .not("telefono", "is", null);

  const recipientes: { nombre: string; telefono: string }[] = (admins ?? []) as { nombre: string; telefono: string }[];

  if (createdBy) {
    const { data: creator } = await sb.from("miembros_familia")
      .select("nombre, telefono")
      .eq("activo", true)
      .eq("user_id", createdBy)
      .neq("rol", "admin")
      .not("telefono", "is", null)
      .maybeSingle();
    if (creator) recipientes.push(creator as { nombre: string; telefono: string });
  }

  return recipientes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { tipo, cita_id, examen_id } = await req.json() as { tipo: string; cita_id?: string; examen_id?: string };
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // ── CRON: recordatorio automático 24h antes de citas ────────────────
    if (tipo === "recordatorio") {
      // Colombia = UTC−5. Calcular "mañana en Bogotá" y convertir a UTC para el query.
      const OFFSET_MS = 5 * 60 * 60 * 1000;
      const ahoraBogota = new Date(Date.now() - OFFSET_MS);
      const mananaBogota = new Date(ahoraBogota);
      mananaBogota.setUTCDate(ahoraBogota.getUTCDate() + 1);
      // Inicio de mañana en Bogotá (medianoche Bogotá = 05:00 UTC)
      const inicio = new Date(Date.UTC(mananaBogota.getUTCFullYear(), mananaBogota.getUTCMonth(), mananaBogota.getUTCDate(), 5, 0, 0, 0));
      // Fin de mañana en Bogotá (23:59 Bogotá = 04:59:59 UTC del día siguiente)
      const fin    = new Date(Date.UTC(mananaBogota.getUTCFullYear(), mananaBogota.getUTCMonth(), mananaBogota.getUTCDate() + 1, 4, 59, 59, 999));

      const [{ data: citas }, { data: todosLos }] = await Promise.all([
        sb.from("citas")
          .select("*, acompanante:acompanante_id(*)")
          .eq("estado", "pendiente")
          .eq("recordatorio_enviado", false)
          .gte("fecha_hora", inicio.toISOString())
          .lte("fecha_hora", fin.toISOString()),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      const todos  = todosLos ?? [];
      const lucy   = todos.find((m: { rol: string }) => m.rol === "abuela");
      let enviados = 0;

      for (const c of citas ?? []) {
        if (!c.fecha_hora) continue;
        const acomp      = c.acompanante;
        const lugar      = c.lugar ?? "por confirmar";
        const lugarUrl   = encodeURIComponent(lugar);
        const fecha      = fechaLarga(c.fecha_hora);
        const hora       = horaCorta(c.fecha_hora);
        const esp        = c.especialidad ?? "Consulta médica";
        const acompNom   = acomp?.nombre ?? "sin asignar";
        const familia    = todos.filter((m: { rol: string; id: string; telefono: string | null }) =>
          m.rol !== "abuela" && m.id !== c.acompanante_id && m.telefono);

        let citaOk = false;

        if (acomp?.telefono) {
          const ok = await enviarWA(acomp.telefono, "cita_lucy_recordatorio", [
            { name: "nombre",       value: acomp.nombre },
            { name: "especialidad", value: esp },
            { name: "fecha",        value: fecha },
            { name: "hora",         value: hora },
            { name: "lugar",        value: lugar },
          ], lugarUrl);
          if (ok) { enviados++; citaOk = true; }
        }

        if (lucy?.telefono) {
          const ok = await enviarWA(lucy.telefono, "cita_lucy_paciente", [
            { name: "especialidad", value: esp },
            { name: "hora",         value: hora },
            { name: "lugar",        value: lugar },
            { name: "acompanante",  value: acompNom },
          ], lugarUrl);
          if (ok) { enviados++; citaOk = true; }
        }

        for (const m of familia) {
          const ok = await enviarWA(m.telefono!, "cita_lucy_familia", [
            { name: "nombre",       value: m.nombre },
            { name: "especialidad", value: esp },
            { name: "fecha",        value: fecha },
            { name: "hora",         value: hora },
            { name: "lugar",        value: lugar },
            { name: "acompanante",  value: acompNom },
          ], lugarUrl);
          if (ok) { enviados++; citaOk = true; }
        }

        if (citaOk) {
          await sb.from("citas").update({ recordatorio_enviado: true }).eq("id", c.id);
        }
      }
      return new Response(JSON.stringify({ ok: true, tipo, citasNotificadas: enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── NUEVA CITA / NUEVO PROCEDIMIENTO: aviso inmediato con cita_lucy_nueva ──
    if (tipo === "nueva_cita") {
      let esp: string, fecha: string, hora: string, lugar: string;

      if (cita_id) {
        const { data: cita } = await sb.from("citas").select("*").eq("id", cita_id).single();
        if (!cita?.fecha_hora) {
          return new Response(JSON.stringify({ ok: true, tipo, enviados: 0 }), { headers: { ...cors, "Content-Type": "application/json" } });
        }
        esp   = cita.especialidad ?? "Consulta médica";
        fecha = fechaLarga(cita.fecha_hora);
        hora  = horaCorta(cita.fecha_hora);
        lugar = cita.lugar ?? "por confirmar";
      } else if (examen_id) {
        const { data: examen } = await sb.from("examenes").select("*").eq("id", examen_id).single();
        if (!examen?.fecha_solicitud) {
          return new Response(JSON.stringify({ ok: true, tipo, enviados: 0 }), { headers: { ...cors, "Content-Type": "application/json" } });
        }
        esp   = examen.nombre;
        fecha = fechaCorta(examen.fecha_solicitud);
        hora  = examen.hora ? formatHora(examen.hora) : "por confirmar";
        lugar = examen.lugar ?? "por confirmar";
      } else {
        return new Response(JSON.stringify({ error: "falta cita_id o examen_id" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
      }

      let acompNom = "sin asignar";
      if (cita_id) {
        const { data: citaAcomp } = await sb.from("citas").select("acompanante:acompanante_id(nombre)").eq("id", cita_id).single();
        acompNom = (citaAcomp?.acompanante as { nombre: string } | null)?.nombre ?? "sin asignar";
      } else if (examen_id) {
        const { data: examAcomp } = await sb.from("examenes").select("acompanante:acompanante_id(nombre)").eq("id", examen_id).single();
        acompNom = (examAcomp?.acompanante as { nombre: string } | null)?.nombre ?? "sin asignar";
      }

      const { data: miembros } = await sb.from("miembros_familia").select("*").eq("activo", true);
      let enviados = 0;
      for (const m of (miembros ?? [])) {
        if (!m.telefono) continue;
        await enviarWA(m.telefono, "cita_lucy_nueva", [
          { name: "nombre",       value: m.nombre },
          { name: "especialidad", value: esp },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ]) && enviados++;
      }
      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── RECORDATORIO MANUAL DE CITA: 3 mensajes diferenciados (plantillas en revisión) ──
    if (tipo === "manual" && cita_id) {
      const [{ data: cita }, { data: todosLos }] = await Promise.all([
        sb.from("citas").select("*, acompanante:acompanante_id(*)").eq("id", cita_id).single(),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      if (!cita) return new Response(JSON.stringify({ error: "cita no encontrada" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });

      const todos    = todosLos ?? [];
      const lucy     = todos.find((m: { rol: string }) => m.rol === "abuela");
      const acomp    = cita.acompanante;
      const familia  = todos.filter((m: { rol: string; id: string; telefono: string | null }) =>
        m.rol !== "abuela" && m.id !== cita.acompanante_id && m.telefono);

      const lugar    = cita.lugar ?? "por confirmar";
      const lugarUrl = encodeURIComponent(lugar);
      const fecha    = cita.fecha_hora ? fechaLarga(cita.fecha_hora) : "por agendar";
      const hora     = cita.fecha_hora ? horaCorta(cita.fecha_hora) : "–";
      const esp      = cita.especialidad ?? "Consulta médica";
      const acompNom = acomp?.nombre ?? "sin asignar";
      let enviados   = 0;

      if (acomp?.telefono) {
        await enviarWA(acomp.telefono, "cita_lucy_recordatorio", [
          { name: "nombre",       value: acomp.nombre },
          { name: "especialidad", value: esp },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
        ], lugarUrl) && enviados++;
      }
      if (lucy?.telefono) {
        await enviarWA(lucy.telefono, "cita_lucy_paciente", [
          { name: "especialidad", value: esp },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }
      for (const m of familia) {
        await enviarWA(m.telefono!, "cita_lucy_familia", [
          { name: "nombre",       value: m.nombre },
          { name: "especialidad", value: esp },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }
      await sb.from("citas").update({ recordatorio_enviado: true }).eq("id", cita_id);
      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── MANUAL EXAMEN / PROCEDIMIENTO: 3 mensajes reutilizando plantillas de cita ──
    if (tipo === "manual_examen" && examen_id) {
      const [{ data: examen }, { data: todosLos }] = await Promise.all([
        sb.from("examenes").select("*, acompanante:acompanante_id(*)").eq("id", examen_id).single(),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      if (!examen) return new Response(JSON.stringify({ error: "examen no encontrado" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });

      const todos    = todosLos ?? [];
      const lucy     = todos.find((m: { rol: string }) => m.rol === "abuela");
      const acomp    = examen.acompanante;
      const familia  = todos.filter((m: { rol: string; id: string; telefono: string | null }) =>
        m.rol !== "abuela" && m.id !== examen.acompanante_id && m.telefono);

      const lugar    = examen.lugar ?? "por confirmar";
      const lugarUrl = encodeURIComponent(lugar);
      const fecha    = examen.fecha_solicitud ? fechaCorta(examen.fecha_solicitud) : "por confirmar";
      const hora     = examen.hora ? formatHora(examen.hora) : "por confirmar";
      const nombre   = examen.nombre;
      const acompNom = acomp?.nombre ?? "sin asignar";
      let enviados   = 0;

      if (acomp?.telefono) {
        await enviarWA(acomp.telefono, "cita_lucy_recordatorio", [
          { name: "nombre",       value: acomp.nombre },
          { name: "especialidad", value: nombre },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
        ], lugarUrl) && enviados++;
      }

      if (lucy?.telefono) {
        await enviarWA(lucy.telefono, "cita_lucy_paciente", [
          { name: "especialidad", value: nombre },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }

      for (const m of familia) {
        await enviarWA(m.telefono!, "cita_lucy_familia", [
          { name: "nombre",       value: m.nombre },
          { name: "especialidad", value: nombre },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }

      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── CRON: autorizaciones EPS ─────────────────────────────────────────
    if (tipo === "autorizaciones") {
      const [{ data: autorizaciones }, { data: admins }] = await Promise.all([
        sb.from("autorizaciones_eps").select("*").in("estado", ["sin_gestionar", "en_tramite"]),
        sb.from("miembros_familia").select("nombre, telefono, user_id, rol").eq("activo", true).not("telefono", "is", null),
      ]);
      const adminsList = (admins ?? []).filter((m: { rol: string }) => m.rol === "admin") as { nombre: string; telefono: string; user_id: string | null }[];
      let enviados = 0;

      for (const a of autorizaciones ?? []) {
        const receptores: { nombre: string; telefono: string }[] = [...adminsList];
        if (a.created_by) {
          const creator = (admins ?? []).find((m: { user_id: string | null; rol: string }) => m.user_id === a.created_by && m.rol !== "admin") as { nombre: string; telefono: string } | undefined;
          if (creator) receptores.push(creator);
        }
        if (receptores.length === 0) continue;
        const diasRestant = diasRestantes(a.fecha_orden);

        if (a.estado === "sin_gestionar" && diasRestant > 0 && diasRestant <= 30) {
          for (const m of receptores) {
            const ok = await enviarWA(m.telefono!, "orden_lucy_por_vencer", [
              { name: "nombre",      value: m.nombre },
              { name: "descripcion", value: a.descripcion },
              { name: "dias",        value: diasRestant.toString() },
              { name: "fecha_orden", value: fechaCorta(a.fecha_orden) },
            ]);
            if (ok) enviados++;
          }
        }

        if (a.estado === "en_tramite" && a.fecha_envio_eps) {
          const diasHab = diasHabilesDesde(a.fecha_envio_eps);
          if (diasHab >= 5) {
            for (const m of receptores) {
              const ok = await enviarWA(m.telefono!, "orden_lucy_tramite_demorado", [
                { name: "nombre",       value: m.nombre },
                { name: "dias_habiles", value: diasHab.toString() },
                { name: "descripcion",  value: a.descripcion },
              ]);
              if (ok) enviados++;
            }
          }
        }
      }

      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── CRON: resultados de exámenes pendientes ──────────────────────────
    if (tipo === "resultados") {

      const cincoAtras = new Date();
      cincoAtras.setDate(cincoAtras.getDate() - 5);
      const cincoAtrasStr = cincoAtras.toISOString().split("T")[0];

      const { data: examenes } = await sb.from("examenes")
        .select("*")
        .eq("estado", "listo")
        .not("fecha_solicitud", "is", null)
        .lte("fecha_solicitud", cincoAtrasStr)
        .is("archivo_resultado_url", null)
        .eq("recordatorio_resultado_enviado", false);

      let enviados = 0;

      for (const e of examenes ?? []) {
        const receptores = await getRecipientes(sb, e.created_by);
        if (receptores.length === 0) continue;
        const diasTranscurridos = diasDesde(e.fecha_solicitud);
        for (const m of receptores) {
          const ok = await enviarWA(m.telefono!, "resultado_lucy_pendiente", [
            { name: "nombre",        value: m.nombre },
            { name: "dias",          value: diasTranscurridos.toString() },
            { name: "nombre_examen", value: e.nombre },
          ]);
          if (ok) enviados++;
        }
        if (enviados > 0) {
          await sb.from("examenes").update({ recordatorio_resultado_enviado: true }).eq("id", e.id);
        }
      }

      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── RESUMEN SEMANAL: domingo → citas de la semana a Mamita Lucy ─────
    if (tipo === "resumen_semanal") {
      const hoy = new Date();
      const fin = new Date(hoy);
      fin.setDate(hoy.getDate() + 7);

      const [{ data: citas }, { data: todosLos }] = await Promise.all([
        sb.from("citas")
          .select("*, acompanante:acompanante_id(*)")
          .eq("estado", "pendiente")
          .not("fecha_hora", "is", null)
          .gte("fecha_hora", hoy.toISOString())
          .lte("fecha_hora", fin.toISOString())
          .order("fecha_hora"),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      const lucy = (todosLos ?? []).find((m: { rol: string }) => m.rol === "abuela");

      if (!lucy?.telefono || !(citas ?? []).length) {
        return new Response(
          JSON.stringify({ ok: true, tipo, citasEncontradas: citas?.length ?? 0, enviados: 0 }),
          { headers: { ...cors, "Content-Type": "application/json" } },
        );
      }

      let enviados = 0;
      for (const c of citas ?? []) {
        const esp      = c.especialidad ?? "Consulta médica";
        const fecha    = fechaLarga(c.fecha_hora);
        const hora     = horaCorta(c.fecha_hora);
        const lugar    = c.lugar ?? "por confirmar";
        const lugarUrl = encodeURIComponent(lugar);
        const acompNom = (c.acompanante as { nombre: string } | null)?.nombre ?? "sin asignar";

        const ok = await enviarWA(lucy.telefono, "cita_lucy_recordatorio", [
          { name: "nombre",       value: "Lucy" },
          { name: "especialidad", value: esp },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
        ], lugarUrl);
        if (ok) enviados++;

        // pequeña pausa entre mensajes para no saturar la API
        await new Promise(r => setTimeout(r, 500));
      }

      return new Response(
        JSON.stringify({ ok: true, tipo, enviados }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── RECORDATORIO MANUAL: pedir estado del trámite de autorización ────
    if (tipo === "recordatorio_tramite" && cita_id) {
      const [{ data: cita }, { data: auths }, { data: admins }] = await Promise.all([
        sb.from("citas").select("especialidad, nombre").eq("id", cita_id).single(),
        sb.from("autorizaciones_eps").select("*").eq("cita_id", cita_id).eq("estado", "en_tramite"),
        sb.from("miembros_familia").select("nombre, telefono, rol").eq("activo", true).not("telefono", "is", null),
      ]);

      if (!cita || !(auths ?? []).length) {
        return new Response(JSON.stringify({ ok: true, tipo, enviados: 0 }), { headers: { ...cors, "Content-Type": "application/json" } });
      }

      const receptores = ((admins ?? []) as { nombre: string; telefono: string; rol: string }[])
        .filter(m => m.rol === "admin");
      const descripcion = (auths![0].descripcion) || (cita.nombre ?? cita.especialidad ?? "la cita");
      const diasHab = auths![0].fecha_envio_eps ? diasHabilesDesde(auths![0].fecha_envio_eps) : 0;

      let enviados = 0;
      for (const m of receptores) {
        const ok = await enviarWA(m.telefono, "orden_lucy_tramite_demorado", [
          { name: "nombre",       value: m.nombre },
          { name: "dias_habiles", value: diasHab.toString() },
          { name: "descripcion",  value: descripcion },
        ]);
        if (ok) enviados++;
      }
      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "tipo no reconocido" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
