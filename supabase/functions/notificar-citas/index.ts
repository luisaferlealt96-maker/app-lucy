import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WHATSAPP_TOKEN    = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Param = { name: string; value: string };

async function enviarWA(telefono: string, template: string, params: Param[], lugarUrl?: string, idioma = "es_CO") {
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
    template: { name: template, language: { code: idioma }, components },
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
function diasRestantes(fechaOrdenStr: string, vigenciaDias = 120): number {
  const venc = new Date(fechaOrdenStr + "T12:00:00");
  venc.setDate(venc.getDate() + vigenciaDias);
  return Math.ceil((venc.getTime() - Date.now()) / 86400000);
}
function diasDesde(fechaStr: string): number {
  const from = new Date(fechaStr + "T12:00:00");
  return Math.floor((Date.now() - from.getTime()) / 86400000);
}

// Plantilla WA: "Hola {{nombre}}, tienes pendiente por agendar: {{detalle}}. ..."
// con botón URL dinámico: https://app-lucy-family.vercel.app/{{1}}
const TEMPLATE_POR_AGENDAR = "pendiente_agendar_lucy";
const IDIOMA_POR_AGENDAR = "es"; // la plantilla se creó en "Español" (es), no "Español (Colombia)"

const SIN_PRESTADOR = "Aún no hay prestador registrado.";

// Los valores de variables de plantilla no admiten saltos de línea ni espacios repetidos
function limpiar(s: string, max: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
function textoPrestador(p?: { nombre_prestador: string | null; telefono_prestador: string | null } | null): string | null {
  if (!p) return null;
  const partes = [
    p.nombre_prestador ? limpiar(p.nombre_prestador, 50) : null,
    p.telefono_prestador ? `tel. ${limpiar(p.telefono_prestador, 20)}` : null,
  ].filter(Boolean);
  return partes.length ? partes.join(", ") : null;
}

function plural(n: number, singular: string, pluralStr: string) {
  return `${n} ${n === 1 ? singular : pluralStr}`;
}
function listaNatural(partes: string[]) {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

type NotifParams = {
  tipo: "recordatorio_wa" | "reporte_cita" | "autorizacion_aprobada" | "autorizacion_por_vencer" | "entrega_vencida";
  titulo: string;
  mensaje?: string;
  entidad_tipo?: "cita" | "examen" | "medicamento" | "autorizacion";
  entidad_id?: string;
  dedupe?: boolean; // si true, no inserta si ya existe una notificación igual para esa entidad
};

async function crearNotificacion(sb: ReturnType<typeof createClient>, p: NotifParams) {
  if (p.dedupe && p.entidad_id) {
    const { data: existente } = await sb.from("notificaciones")
      .select("id")
      .eq("tipo", p.tipo)
      .eq("entidad_id", p.entidad_id)
      .limit(1)
      .maybeSingle();
    if (existente) return;
  }
  await sb.from("notificaciones").insert({
    tipo: p.tipo,
    titulo: p.titulo,
    mensaje: p.mensaje ?? null,
    entidad_tipo: p.entidad_tipo ?? null,
    entidad_id: p.entidad_id ?? null,
  });
}

type Destino = { id?: string; nombre: string; telefono: string };

// La persona (si tiene teléfono) + sus personas de apoyo activas con teléfono
async function destinosConApoyos(
  sb: ReturnType<typeof createClient>,
  persona: { id: string; nombre: string; telefono: string | null; apoyos?: string[] | null },
): Promise<Destino[]> {
  const out: Destino[] = [];
  if (persona.telefono) out.push({ id: persona.id, nombre: persona.nombre, telefono: persona.telefono });
  const ids = persona.apoyos ?? [];
  if (ids.length) {
    const { data } = await sb.from("miembros_familia")
      .select("id, nombre, telefono")
      .in("id", ids)
      .eq("activo", true)
      .not("telefono", "is", null);
    for (const a of (data ?? []) as Destino[]) if (!out.some(o => o.id === a.id)) out.push(a);
  }
  return out;
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
      .select("id, nombre, telefono, apoyos")
      .eq("activo", true)
      .eq("user_id", createdBy)
      .neq("rol", "admin")
      .maybeSingle();
    if (creator) {
      for (const d of await destinosConApoyos(sb, creator)) {
        if (!recipientes.some(r => r.telefono === d.telefono)) recipientes.push(d);
      }
    }
  }

  return recipientes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { tipo, cita_id, examen_id, medicamento_id, forzar } = await req.json() as {
      tipo: string; cita_id?: string; examen_id?: string; medicamento_id?: string; forzar?: boolean;
    };
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

      // Fecha de mañana en Bogotá como string YYYY-MM-DD (para comparar con examenes.fecha_solicitud)
      const manaStr = `${mananaBogota.getUTCFullYear()}-${String(mananaBogota.getUTCMonth() + 1).padStart(2, "0")}-${String(mananaBogota.getUTCDate()).padStart(2, "0")}`;

      const [{ data: citas }, { data: examenes }, { data: todosLos }] = await Promise.all([
        sb.from("citas")
          .select("*, acompanante:acompanante_id(*)")
          .eq("estado", "pendiente")
          .eq("recordatorio_enviado", false)
          .gte("fecha_hora", inicio.toISOString())
          .lte("fecha_hora", fin.toISOString()),
        sb.from("examenes")
          .select("*, acompanante:acompanante_id(*)")
          .neq("estado", "listo")
          .eq("fecha_solicitud", manaStr),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      const todos  = todosLos ?? [];
      const lucy   = todos.find((m: { rol: string }) => m.rol === "abuela");
      let enviados = 0;

      // ── Recordatorios de CITAS ──
      for (const c of citas ?? []) {
        if (!c.fecha_hora) continue;
        const acomp      = c.acompanante;
        const lugar      = c.lugar ?? "por confirmar";
        const lugarUrl   = encodeURIComponent(lugar);
        const fecha      = fechaLarga(c.fecha_hora);
        const hora       = horaCorta(c.fecha_hora);
        const esp        = c.especialidad ?? "Consulta médica";
        const acompNom   = acomp?.nombre ?? "sin asignar";
        const acompDestinos = acomp ? await destinosConApoyos(sb, acomp) : [];
        const acompIds   = new Set(acompDestinos.map(d => d.id));
        const familia    = todos.filter((m: { rol: string; id: string; telefono: string | null }) =>
          m.rol !== "abuela" && !acompIds.has(m.id) && m.telefono);

        let citaOk = false;

        for (const d of acompDestinos) {
          const ok = await enviarWA(d.telefono, "cita_lucy_recordatorio", [
            { name: "nombre",       value: d.nombre },
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
          await crearNotificacion(sb, {
            tipo: "recordatorio_wa",
            titulo: "Recordatorio de WhatsApp enviado",
            mensaje: `${esp} · ${fecha}`,
            entidad_tipo: "cita",
            entidad_id: c.id,
          });
        }
      }

      // ── Recordatorios de EXÁMENES / LABORATORIOS / PROCEDIMIENTOS ──
      for (const e of examenes ?? []) {
        if (!e.fecha_solicitud) continue;
        const acomp    = e.acompanante;
        const lugar    = e.lugar ?? "por confirmar";
        const lugarUrl = encodeURIComponent(lugar);
        const fecha    = fechaCorta(e.fecha_solicitud);
        const hora     = e.hora ? formatHora(e.hora) : "por confirmar";
        const esp      = e.nombre;
        const acompNom = acomp?.nombre ?? "sin asignar";
        const destinos = todos.filter((m: { telefono: string | null }) => m.telefono);

        let examOk = false;
        for (const m of destinos) {
          const ok = await enviarWA(m.telefono!, "cita_lucy_recordatorio_manual", [
            { name: "nombre",       value: m.nombre },
            { name: "fecha",        value: fecha },
            { name: "hora",         value: hora },
            { name: "especialidad", value: esp },
            { name: "lugar",        value: lugar },
            { name: "acompanante",  value: acompNom },
          ], lugarUrl);
          if (ok) { enviados++; examOk = true; }
        }
        if (examOk) {
          await crearNotificacion(sb, {
            tipo: "recordatorio_wa",
            titulo: "Recordatorio de WhatsApp enviado",
            mensaje: `${esp} · ${fecha}`,
            entidad_tipo: "examen",
            entidad_id: e.id,
          });
        }
      }

      // ── Auto-completar citas cuya fecha ya pasó (más de 2h) ──
      const hace2h = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      await sb.from("citas")
        .update({ estado: "completada" })
        .eq("estado", "pendiente")
        .lt("fecha_hora", hace2h);

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

    // ── RECORDATORIO MANUAL DE CITA: una sola plantilla con fecha real ──
    if (tipo === "manual" && cita_id) {
      const [{ data: cita }, { data: todosLos }] = await Promise.all([
        sb.from("citas").select("*, acompanante:acompanante_id(*)").eq("id", cita_id).single(),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      if (!cita) return new Response(JSON.stringify({ error: "cita no encontrada" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });

      const todos    = todosLos ?? [];
      const lucy     = todos.find((m: { rol: string }) => m.rol === "abuela");
      const acomp    = cita.acompanante;
      const familia  = todos.filter((m: { rol: string; telefono: string | null }) => m.rol !== "abuela" && m.telefono);

      const lugar    = cita.lugar ?? "por confirmar";
      const lugarUrl = encodeURIComponent(lugar);
      const fecha    = cita.fecha_hora ? fechaLarga(cita.fecha_hora) : "por agendar";
      const hora     = cita.fecha_hora ? horaCorta(cita.fecha_hora) : "–";
      const esp      = cita.nombre ?? cita.especialidad ?? "Consulta médica";
      const acompNom = acomp?.nombre ?? "sin asignar";
      let enviados   = 0;

      // Lucy recibe su mensaje personalizado
      if (lucy?.telefono) {
        await enviarWA(lucy.telefono, "cita_lucy_paciente_manual", [
          { name: "fecha",        value: fecha },
          { name: "especialidad", value: esp },
          { name: "hora",         value: hora },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }

      // El resto recibe el recordatorio con su nombre
      for (const m of familia) {
        await enviarWA(m.telefono!, "cita_lucy_recordatorio_manual", [
          { name: "nombre",       value: m.nombre },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "especialidad", value: esp },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }

      await sb.from("citas").update({ recordatorio_enviado: true }).eq("id", cita_id);
      if (enviados > 0) {
        await crearNotificacion(sb, {
          tipo: "recordatorio_wa",
          titulo: "Recordatorio de WhatsApp enviado",
          mensaje: `${esp} · ${fecha}`,
          entidad_tipo: "cita",
          entidad_id: cita_id,
        });
      }
      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── MANUAL EXAMEN / PROCEDIMIENTO ────────────────────────────────────
    if (tipo === "manual_examen" && examen_id) {
      const [{ data: examen }, { data: todosLos }] = await Promise.all([
        sb.from("examenes").select("*, acompanante:acompanante_id(*)").eq("id", examen_id).single(),
        sb.from("miembros_familia").select("*").eq("activo", true),
      ]);

      if (!examen) return new Response(JSON.stringify({ error: "examen no encontrado" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });

      const acomp    = examen.acompanante;
      const destinatarios = (todosLos ?? []).filter((m: { telefono: string | null }) => m.telefono);
      const lugar    = examen.lugar ?? "por confirmar";
      const lugarUrl = encodeURIComponent(lugar);
      const fecha    = examen.fecha_solicitud ? fechaCorta(examen.fecha_solicitud) : "por confirmar";
      const hora     = examen.hora ? formatHora(examen.hora) : "por confirmar";
      const acompNom = acomp?.nombre ?? "sin asignar";
      let enviados   = 0;

      for (const m of destinatarios) {
        await enviarWA(m.telefono!, "cita_lucy_recordatorio_manual", [
          { name: "nombre",       value: m.nombre },
          { name: "fecha",        value: fecha },
          { name: "hora",         value: hora },
          { name: "especialidad", value: examen.nombre },
          { name: "lugar",        value: lugar },
          { name: "acompanante",  value: acompNom },
        ], lugarUrl) && enviados++;
      }

      if (enviados > 0) {
        await crearNotificacion(sb, {
          tipo: "recordatorio_wa",
          titulo: "Recordatorio de WhatsApp enviado",
          mensaje: `${examen.nombre} · ${fecha}`,
          entidad_tipo: "examen",
          entidad_id: examen_id,
        });
      }
      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── CRON: autorizaciones EPS ─────────────────────────────────────────
    if (tipo === "autorizaciones") {
      const [{ data: autorizaciones }, { data: admins }] = await Promise.all([
        sb.from("autorizaciones_eps").select("*").in("estado", ["sin_gestionar", "en_tramite"]),
        sb.from("miembros_familia").select("id, nombre, telefono, user_id, rol, apoyos").eq("activo", true).not("telefono", "is", null),
      ]);
      const adminsList = (admins ?? []).filter((m: { rol: string }) => m.rol === "admin") as { nombre: string; telefono: string; user_id: string | null }[];
      let enviados = 0;

      for (const a of autorizaciones ?? []) {
        const receptores: { nombre: string; telefono: string }[] = [...adminsList];
        if (a.created_by) {
          const creator = (admins ?? []).find((m: { user_id: string | null; rol: string }) => m.user_id === a.created_by && m.rol !== "admin") as { id: string; nombre: string; telefono: string; apoyos: string[] | null } | undefined;
          if (creator) {
            for (const d of await destinosConApoyos(sb, creator)) {
              if (!receptores.some(r => r.telefono === d.telefono)) receptores.push(d);
            }
          }
        }
        if (receptores.length === 0) continue;
        const diasRestant = diasRestantes(a.fecha_orden, a.vigencia_dias ?? 120);

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

        if (diasRestant > 0 && diasRestant <= 15) {
          await crearNotificacion(sb, {
            tipo: "autorizacion_por_vencer",
            titulo: "Autorización EPS por vencer",
            mensaje: `${a.descripcion} · vence en ${diasRestant}d`,
            entidad_tipo: "autorizacion",
            entidad_id: a.id,
            dedupe: true,
          });
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

    // ── CRON: pedir reporte automático 24h después de la cita ───────────
    if (tipo === "reporte_post_cita") {
      // Ventana: citas con fecha entre 48h y 20h atrás (captura citas de "ayer")
      const hace48h = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      const hace20h = new Date(Date.now() - 20 * 3600 * 1000).toISOString();

      const { data: citas } = await sb.from("citas")
        .select("*, acompanante:acompanante_id(*)")
        .not("acompanante_id", "is", null)
        .not("fecha_hora", "is", null)
        .gte("fecha_hora", hace48h)
        .lte("fecha_hora", hace20h)
        .eq("recordatorio_post_enviado", false)
        .in("estado", ["pendiente", "por_agendar"]);

      let enviados = 0;
      for (const c of citas ?? []) {
        const destinos = await destinosConApoyos(sb, c.acompanante);
        if (destinos.length === 0) continue;
        const esp = c.nombre ?? c.especialidad ?? "Consulta médica";
        let ok = false;
        for (const d of destinos) {
          ok = (await enviarWA(d.telefono, "cita_lucy_reporte", [
            { name: "nombre",       value: d.nombre },
            { name: "especialidad", value: esp },
          ], c.id)) || ok;
        }
        if (ok) {
          await sb.from("citas").update({ recordatorio_post_enviado: true }).eq("id", c.id);
          enviados++;
        }
      }
      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── MANUAL: pedir reporte de una cita específica ────────────────────
    if (tipo === "pedir_reporte" && cita_id) {
      const { data: cita } = await sb.from("citas")
        .select("*, acompanante:acompanante_id(*)")
        .eq("id", cita_id)
        .single();

      const destinosReporte = cita?.acompanante ? await destinosConApoyos(sb, cita.acompanante) : [];
      if (destinosReporte.length === 0) {
        return new Response(JSON.stringify({ ok: true, tipo, enviados: 0, razon: "sin acompañante con teléfono" }), { headers: { ...cors, "Content-Type": "application/json" } });
      }

      const esp = cita.nombre ?? cita.especialidad ?? "Consulta médica";
      let enviados = 0;
      for (const d of destinosReporte) {
        const ok = await enviarWA(d.telefono, "cita_lucy_reporte", [
          { name: "nombre",       value: d.nombre },
          { name: "especialidad", value: esp },
        ], cita_id);
        if (ok) enviados++;
      }

      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
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

    // ── CRON: recordatorio de entrega de medicamento en 2 días ──────────
    if (tipo === "recordatorio_entrega") {
      const OFFSET_MS = 5 * 60 * 60 * 1000;
      const ahoraBogota = new Date(Date.now() - OFFSET_MS);
      const en2Dias = new Date(ahoraBogota);
      en2Dias.setUTCDate(ahoraBogota.getUTCDate() + 2);
      const en2DiasStr = en2Dias.toISOString().split("T")[0];

      const { data: entregas } = await sb
        .from("entregas_medicamento")
        .select("*, medicamento:medicamento_id(nombre, total_entregas)")
        .eq("estado", "pendiente")
        .eq("fecha_programada", en2DiasStr);

      const { data: destinatarios } = await sb
        .from("miembros_familia")
        .select("nombre, telefono, rol")
        .eq("activo", true)
        .in("rol", ["admin", "familiar"])
        .not("telefono", "is", null);

      let enviados = 0;

      for (const entrega of entregas ?? []) {
        const med = entrega.medicamento as { nombre: string; total_entregas: number } | null;
        if (!med) continue;
        const fechaTexto = fechaCorta(en2DiasStr);
        const entregaLabel = `${entrega.numero_entrega} de ${med.total_entregas}`;

        for (const m of (destinatarios ?? []) as { nombre: string; telefono: string }[]) {
          const ok = await enviarWA(m.telefono, "medicamento_entrega_lucy", [
            { name: "nombre",         value: m.nombre },
            { name: "medicamento",    value: med.nombre },
            { name: "numero_entrega", value: entregaLabel },
            { name: "fecha",          value: fechaTexto },
          ]);
          if (ok) enviados++;
        }
      }

      // ── Entregas vencidas sin reclamar (notificación in-app, deduplicada) ──
      const hoyStr = new Date(ahoraBogota).toISOString().split("T")[0];
      const { data: entregasVencidas } = await sb
        .from("entregas_medicamento")
        .select("*, medicamento:medicamento_id(id, nombre)")
        .eq("estado", "pendiente")
        .not("fecha_programada", "is", null)
        .lt("fecha_programada", hoyStr);

      for (const entrega of entregasVencidas ?? []) {
        const med = entrega.medicamento as { id: string; nombre: string } | null;
        if (!med) continue;
        await crearNotificacion(sb, {
          tipo: "entrega_vencida",
          titulo: "Entrega de medicamento vencida sin reclamar",
          mensaje: `${med.nombre} · entrega ${entrega.numero_entrega} · ${fechaCorta(entrega.fecha_programada)}`,
          entidad_tipo: "medicamento",
          entidad_id: med.id,
          dedupe: true,
        });
      }

      return new Response(JSON.stringify({ ok: true, tipo, entregasNotificadas: enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── AL CREAR SIN FECHA: aviso inmediato de "pendiente por agendar" ──
    if (tipo === "por_agendar") {
      const json = (obj: unknown, status = 200) =>
        new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

      let detalle = "";
      let path = "salud";
      let createdBy: string | null = null;
      let acomp: { nombre: string; telefono: string | null } | null = null;
      let prestadorPropio: string | null = null;

      if (cita_id) {
        const { data: c } = await sb.from("citas")
          .select("*, acompanante:acompanante_id(nombre, telefono)")
          .eq("id", cita_id).single();
        if (!c || c.estado !== "por_agendar") return json({ ok: true, tipo, enviados: 0 });
        detalle = `la cita de ${c.nombre ?? c.especialidad ?? "consulta médica"}`;
        path = `salud/cita/${cita_id}`;
        createdBy = c.created_by ?? null;
        acomp = c.acompanante ?? null;
        prestadorPropio = textoPrestador(c);
      } else if (examen_id) {
        const { data: e } = await sb.from("examenes")
          .select("*, acompanante:acompanante_id(nombre, telefono)")
          .eq("id", examen_id).single();
        if (!e || e.fecha_solicitud || e.estado === "listo") return json({ ok: true, tipo, enviados: 0 });
        detalle = `el procedimiento ${e.nombre}`;
        path = `salud/examen/${examen_id}`;
        createdBy = e.created_by ?? null;
        acomp = e.acompanante ?? null;
        prestadorPropio = textoPrestador(e);
      } else if (medicamento_id) {
        const { data: m } = await sb.from("medicamentos")
          .select("nombre, entregas_medicamento(estado, fecha_programada)")
          .eq("id", medicamento_id).single();
        const entregas = (m?.entregas_medicamento ?? []) as { estado: string; fecha_programada: string | null }[];
        if (!m || !entregas.some(en => en.estado === "pendiente" && !en.fecha_programada)) {
          return json({ ok: true, tipo, enviados: 0 });
        }
        detalle = `la entrega del medicamento ${m.nombre}`;
        path = `salud/medicamento/${medicamento_id}`;
      } else {
        return json({ error: "falta cita_id, examen_id o medicamento_id" }, 400);
      }

      // Prestador al que se puede llamar para agendar (de la autorización aprobada vinculada)
      // 1) el que se registró en la propia cita/procedimiento; 2) respaldo: el de la autorización aprobada
      let contacto = SIN_PRESTADOR;
      let prest = prestadorPropio;
      if (!prest && (cita_id || examen_id)) {
        const { data: auths } = await sb.from("autorizaciones_eps")
          .select("nombre_prestador, telefono_prestador")
          .eq(cita_id ? "cita_id" : "examen_id", (cita_id ?? examen_id) as string)
          .eq("estado", "autorizada");
        prest = ((auths ?? []) as { nombre_prestador: string | null; telefono_prestador: string | null }[])
          .map(textoPrestador).find(Boolean) ?? null;
      }
      if (prest) contacto = `Para agendar: ${prest}.`;

      // Receptores: admins + quien lo creó + la persona asignada (sin repetir teléfonos)
      const receptores = await getRecipientes(sb, createdBy);
      if (acomp?.telefono) receptores.push({ nombre: acomp.nombre, telefono: acomp.telefono });

      const vistos = new Set<string>();
      let enviados = 0;
      for (const m of receptores) {
        const tel = m.telefono.replace(/\D/g, "");
        if (vistos.has(tel)) continue;
        vistos.add(tel);
        const ok = await enviarWA(m.telefono, TEMPLATE_POR_AGENDAR, [
          { name: "nombre",   value: m.nombre },
          { name: "detalle",  value: detalle },
          { name: "contacto", value: contacto },
        ], path, IDIOMA_POR_AGENDAR);
        if (ok) enviados++;
      }
      return json({ ok: true, tipo, enviados });
    }

    // ── CRON SEMANAL (lunes): resumen de todo lo que sigue sin agendar ──
    if (tipo === "recordatorio_por_agendar") {
      const OFFSET_MS = 5 * 60 * 60 * 1000;
      const ahoraBogota = new Date(Date.now() - OFFSET_MS);
      if (!forzar && ahoraBogota.getUTCDay() !== 1) {
        return new Response(JSON.stringify({ ok: true, tipo, omitido: "solo se envía los lunes" }), { headers: { ...cors, "Content-Type": "application/json" } });
      }

      // Solo lo creado hace más de 2 días (lo más nuevo ya recibió su aviso al crearse)
      const hace2d = new Date(Date.now() - 2 * 86400000).toISOString();
      const [{ data: citas }, { data: examenes }, { data: meds }, { data: miembros }, { data: auths }] = await Promise.all([
        sb.from("citas").select("id, nombre, especialidad, acompanante_id, nombre_prestador, telefono_prestador").eq("estado", "por_agendar").lt("created_at", hace2d),
        sb.from("examenes").select("id, nombre, acompanante_id, nombre_prestador, telefono_prestador").is("fecha_solicitud", null).neq("estado", "listo").lt("created_at", hace2d),
        sb.from("medicamentos").select("id, entregas_medicamento(estado, fecha_programada)").eq("activo", true).lt("created_at", hace2d),
        sb.from("miembros_familia").select("id, nombre, telefono, rol").eq("activo", true).not("telefono", "is", null),
        sb.from("autorizaciones_eps").select("cita_id, examen_id, nombre_prestador, telefono_prestador").eq("estado", "autorizada"),
      ]);

      type Miembro = { id: string; nombre: string; telefono: string; rol: string };
      type Item = { label: string; prestador: string | null };
      type Acum = { citas: number; examenes: number; meds: number; items: Item[] };
      const miembrosList = (miembros ?? []) as Miembro[];
      const porMiembro = new Map<string, Acum>();
      const acumDe = (id: string) => {
        if (!porMiembro.has(id)) porMiembro.set(id, { citas: 0, examenes: 0, meds: 0, items: [] });
        return porMiembro.get(id)!;
      };

      // Prestador (nombre + teléfono) de la autorización aprobada de cada cita/procedimiento
      const prestadorDe = new Map<string, string>();
      for (const a of (auths ?? []) as { cita_id: string | null; examen_id: string | null; nombre_prestador: string | null; telefono_prestador: string | null }[]) {
        const txt = textoPrestador(a);
        const key = a.cita_id ?? a.examen_id;
        if (txt && key && !prestadorDe.has(key)) prestadorDe.set(key, txt);
      }

      type PrestP = { nombre_prestador: string | null; telefono_prestador: string | null };
      type CitaP = PrestP & { id: string; nombre: string | null; especialidad: string | null; acompanante_id: string | null };
      type ExamP = PrestP & { id: string; nombre: string; acompanante_id: string | null };
      const citasPend = (citas ?? []) as CitaP[];
      const examPend  = (examenes ?? []) as ExamP[];
      const medsPend  = ((meds ?? []) as { entregas_medicamento: { estado: string; fecha_programada: string | null }[] }[])
        .filter(m => (m.entregas_medicamento ?? []).some(en => en.estado === "pendiente" && !en.fecha_programada));

      const itemsCitas: (Item & { acompId: string | null })[] = citasPend.map(c => ({
        label: limpiar(c.nombre ?? c.especialidad ?? "Cita", 30), prestador: textoPrestador(c) ?? prestadorDe.get(c.id) ?? null, acompId: c.acompanante_id,
      }));
      const itemsExam: (Item & { acompId: string | null })[] = examPend.map(e => ({
        label: limpiar(e.nombre, 30), prestador: textoPrestador(e) ?? prestadorDe.get(e.id) ?? null, acompId: e.acompanante_id,
      }));

      // Los admins ven todo (incluye medicamentos, que no tienen persona asignada)
      for (const a of miembrosList.filter(m => m.rol === "admin")) {
        const c = acumDe(a.id);
        c.citas = citasPend.length;
        c.examenes = examPend.length;
        c.meds = medsPend.length;
        c.items = [...itemsCitas, ...itemsExam];
      }
      // El resto solo ve lo que tiene asignado
      for (const it of itemsCitas) {
        const m = miembrosList.find(mm => mm.id === it.acompId);
        if (m && m.rol !== "admin" && m.rol !== "abuela") { const c = acumDe(m.id); c.citas++; c.items.push(it); }
      }
      for (const it of itemsExam) {
        const m = miembrosList.find(mm => mm.id === it.acompId);
        if (m && m.rol !== "admin" && m.rol !== "abuela") { const c = acumDe(m.id); c.examenes++; c.items.push(it); }
      }

      let enviados = 0;
      for (const [id, c] of porMiembro) {
        if (c.citas + c.examenes + c.meds === 0) continue;
        const m = miembrosList.find(mm => mm.id === id);
        if (!m) continue;
        const partes: string[] = [];
        if (c.citas)     partes.push(plural(c.citas, "cita", "citas"));
        if (c.examenes)  partes.push(plural(c.examenes, "procedimiento", "procedimientos"));
        if (c.meds)      partes.push(plural(c.meds, "medicamento", "medicamentos"));

        // Hasta 4 pendientes que ya tienen prestador al cual llamar
        const conPrestador = c.items.filter(i => i.prestador);
        let contacto = SIN_PRESTADOR;
        if (conPrestador.length) {
          const lista = conPrestador.slice(0, 4).map(i => `${i.label} (${i.prestador})`).join("; ");
          const resto = conPrestador.length - 4;
          contacto = `Para agendar: ${lista}${resto > 0 ? ` y ${resto} más en la app` : ""}.`;
        }

        const ok = await enviarWA(m.telefono, TEMPLATE_POR_AGENDAR, [
          { name: "nombre",   value: m.nombre },
          { name: "detalle",  value: listaNatural(partes) },
          { name: "contacto", value: contacto },
        ], "salud", IDIOMA_POR_AGENDAR);
        if (ok) enviados++;
      }

      return new Response(JSON.stringify({ ok: true, tipo, enviados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // ── CRON UNIFICADO: ejecuta todos los tipos en secuencia ────────────
    if (tipo === "todos") {
      const tipos = ["recordatorio", "autorizaciones", "resultados", "reporte_post_cita", "recordatorio_entrega", "recordatorio_por_agendar"];
      const resultados: Record<string, unknown> = {};
      for (const t of tipos) {
        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/notificar-citas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE}`,
            },
            body: JSON.stringify({ tipo: t }),
          });
          resultados[t] = await res.json();
        } catch (e) {
          resultados[t] = { error: String(e) };
        }
      }
      return new Response(JSON.stringify({ ok: true, tipo: "todos", resultados }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "tipo no reconocido" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
