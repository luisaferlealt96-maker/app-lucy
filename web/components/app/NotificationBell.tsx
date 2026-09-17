"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell, MessageSquare, FileText, Shield, Clock, Pill, Check, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Notificacion, EntidadNotificacion } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const TIPO_ICON: Record<string, React.ElementType> = {
  recordatorio_wa: MessageSquare,
  reporte_cita: FileText,
  autorizacion_aprobada: Shield,
  autorizacion_por_vencer: Clock,
  entrega_vencida: Pill,
};

const TIPO_COLOR: Record<string, string> = {
  recordatorio_wa: "#25D366",
  reporte_cita: "#9B8EC4",
  autorizacion_aprobada: "#2e7d32",
  autorizacion_por_vencer: "#e65100",
  entrega_vencida: "#c62828",
};

const ENTIDAD_HREF: Record<EntidadNotificacion, string> = {
  cita: "/salud/cita",
  examen: "/salud/examen",
  medicamento: "/salud/medicamento",
  autorizacion: "/salud/autorizacion",
};

function tiempoRelativo(fecha: string): string {
  const diffMs = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const dias = Math.floor(hr / 24);
  return `hace ${dias} d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notificaciones")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotificaciones(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 60000);
    return () => clearInterval(interval);
  }, [cargar]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const noLeidas = notificaciones.filter(n => !n.leida);

  const marcarLeida = async (id: string) => {
    setNotificaciones(list => list.map(n => n.id === id ? { ...n, leida: true } : n));
    const supabase = createClient();
    await supabase.from("notificaciones").update({ leida: true }).eq("id", id);
  };

  const marcarTodasLeidas = async () => {
    if (noLeidas.length === 0) return;
    setNotificaciones(list => list.map(n => ({ ...n, leida: true })));
    const supabase = createClient();
    await supabase.from("notificaciones").update({ leida: true }).in("id", noLeidas.map(n => n.id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
      >
        <Bell size={16} className="text-muted-foreground" />
        {noLeidas.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">Notificaciones</p>
              {noLeidas.length > 0 ? (
                <button
                  onClick={marcarTodasLeidas}
                  className="flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  <Check size={12} />Marcar todas
                </button>
              ) : (
                <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted">
                  <X size={13} className="text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Cargando…</p>
              ) : notificaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin notificaciones aún</p>
              ) : (
                notificaciones.map(n => {
                  const Icon = TIPO_ICON[n.tipo] ?? Bell;
                  const color = TIPO_COLOR[n.tipo] ?? "#9B8EC4";
                  const href = n.entidad_tipo && n.entidad_id
                    ? `${ENTIDAD_HREF[n.entidad_tipo]}/${n.entidad_id}`
                    : null;
                  const content = (
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-muted/40",
                        !n.leida && "bg-muted/30"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: color + "1F" }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm leading-tight", !n.leida ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                          {n.titulo}
                        </p>
                        {n.mensaje && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensaje}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 mt-1">{tiempoRelativo(n.created_at)}</p>
                      </div>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                  return href ? (
                    <Link key={n.id} href={href} onClick={() => { setOpen(false); if (!n.leida) marcarLeida(n.id); }}>
                      {content}
                    </Link>
                  ) : (
                    <button key={n.id} onClick={() => !n.leida && marcarLeida(n.id)} className="w-full text-left">
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
