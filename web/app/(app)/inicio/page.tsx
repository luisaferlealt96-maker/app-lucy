"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Wallet, Building2, ChevronRight, Calendar, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMiembros, useCitasProximas } from "@/hooks/useSalud";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

const ROL_LABEL: Record<string, string> = {
  admin:    "Administradora",
  abuela:   "Abuela",
  familiar: "Familiar",
};

export default function InicioPage() {
  const { citas, loading: citasLoading } = useCitasProximas(4);
  const { miembros, loading: miembrosLoading } = useMiembros();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail]   = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
      setCurrentEmail(data.user?.email ?? null);
    });
  }, []);

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const yo = miembros.find(m => m.user_id === currentUserId)
    ?? (currentEmail ? miembros.find(m => m.email?.toLowerCase() === currentEmail.toLowerCase()) : null);
  const salud = yo ?? miembros.find(m => m.rol === "admin");
  const saludStat = citasLoading ? "…" : `${citas.length} cita${citas.length !== 1 ? "s" : ""} próxima${citas.length !== 1 ? "s" : ""}`;

  const pillars = [
    {
      id: "salud",
      label: "Salud",
      icon: Heart,
      href: "/salud",
      bg: "bg-pillar-salud",
      accentHex: "#C0546A",
      stat: saludStat,
      desc: "Citas, medicamentos y exámenes de Mamita Lucy",
      proximamente: false,
    },
    {
      id: "finanzas",
      label: "Finanzas",
      icon: Wallet,
      href: "/finanzas",
      bg: "bg-pillar-finanzas",
      accentHex: "#3A917A",
      stat: "Próximamente",
      desc: "Créditos, pagos recurrentes y alertas del hogar",
      proximamente: true,
    },
    {
      id: "administrativo",
      label: "Administrativo",
      icon: Building2,
      href: "/administrativo",
      bg: "bg-pillar-admin",
      accentHex: "#C06B3A",
      stat: "Próximamente",
      desc: "Casas, mantenimiento y arriendos",
      proximamente: true,
    },
  ];

  return (
    <div className="min-h-dvh bg-background pb-28 lg:pb-10">

      {/* ── MOBILE header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden px-4 pt-14 pb-6"
      >
        <p className="text-muted-foreground text-sm font-medium">{todayCapitalized}</p>
        <h1 className="text-2xl font-extrabold text-foreground mt-1">
          Hola, {salud?.nombre ?? "Luisa"} ☀️
        </h1>
      </motion.div>

      {/* ── DESKTOP header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:block px-8 pt-8 pb-6"
      >
        <h1 className="text-2xl font-extrabold text-foreground">
          Hola, {salud?.nombre ?? "Luisa"} ☀️
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Esto es lo que tiene la familia hoy.</p>
      </motion.div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8">

        {/* LEFT */}
        <div className="flex flex-col gap-8">

          {/* Pillar cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-4"
          >
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              const card = (
                <div className={cn(
                  "rounded-2xl p-5 flex flex-col gap-4 transition-transform",
                  pillar.bg,
                  pillar.proximamente ? "opacity-60 cursor-default" : "hover:scale-[1.02] cursor-pointer",
                )}>
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-white/50 flex items-center justify-center">
                      <Icon size={22} color={pillar.accentHex} strokeWidth={2.2} />
                    </div>
                    {pillar.proximamente
                      ? <Sparkles size={14} color={pillar.accentHex} />
                      : <ChevronRight size={16} color={pillar.accentHex} />
                    }
                  </div>
                  <div>
                    <p className="font-extrabold text-base" style={{ color: pillar.accentHex }}>{pillar.label}</p>
                    <p className="text-xs mt-1 text-foreground/60 font-medium leading-snug">{pillar.desc}</p>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: pillar.accentHex }}>{pillar.stat}</p>
                </div>
              );
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07 }}
                >
                  {pillar.proximamente ? card : <Link href={pillar.href}>{card}</Link>}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Upcoming appointments */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Próximas citas de Mamita Lucy</h2>
              <Link href="/salud" className="text-sm font-semibold text-primary">Ver todas →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {citasLoading
                ? [1, 2].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
                : citas.length === 0
                  ? (
                    <div className="col-span-2 bg-card rounded-2xl p-6 border border-border text-center">
                      <p className="text-sm text-muted-foreground">Sin citas próximas agendadas</p>
                      <Link href="/salud/nueva-cita" className="text-sm font-semibold text-primary mt-2 inline-block">
                        + Agregar cita
                      </Link>
                    </div>
                  )
                  : citas.map(appt => {
                    const fh = appt.fecha_hora ? new Date(appt.fecha_hora) : null;
                    const fechaStr = fh?.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Bogota" }) ?? "";
                    const horaStr  = fh?.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }) ?? "";
                    const acomp = (appt as { acompanante?: { nombre: string } }).acompanante;
                    return (
                      <Link key={appt.id} href={`/salud/cita/${appt.id}`}>
                        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow h-full">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <p className="font-bold text-sm text-foreground">{appt.especialidad ?? "Consulta"}</p>
                              <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{appt.lugar ?? "–"}</p>
                            </div>
                            {fechaStr && (
                              <div className="flex items-center gap-1 bg-pillar-salud rounded-full px-2.5 py-1 shrink-0">
                                <Calendar size={11} color="#C0546A" />
                                <span className="text-[11px] font-semibold capitalize" style={{ color: "#C0546A" }}>{fechaStr}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 pt-2.5 border-t border-border">
                            {horaStr && (
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-medium">{horaStr}</span>
                              </div>
                            )}
                            {acomp?.nombre && (
                              <span className="text-xs text-muted-foreground">
                                Acomp: <span className="font-semibold text-foreground">{acomp.nombre}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
              }
            </div>
          </motion.section>
        </div>

        {/* RIGHT: family + quick actions */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Familia</h3>
            {miembrosLoading
              ? <div className="flex flex-col gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
              : (
                <div className="flex flex-col gap-2">
                  {miembros.filter(m => m.rol !== "admin").map(m => (
                    <div key={m.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg shrink-0">
                        {m.emoji ?? "👤"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-none">{m.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ROL_LABEL[m.rol] ?? m.rol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Nueva cita médica",  href: "/salud/nueva-cita",        color: "#C0546A", bg: "#F2C5CE" },
                { label: "Nuevo medicamento",  href: "/salud/nuevo-medicamento", color: "#C0546A", bg: "#F2C5CE" },
                { label: "Nuevo examen",       href: "/salud/nuevo-examen",      color: "#9B8EC4", bg: "#EDE9F7" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ background: item.bg }}
                  >
                    <span className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</span>
                    <ChevronRight size={13} color={item.color} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="lg:hidden px-4">
        <div className="grid grid-cols-2 gap-3 mb-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            const card = (
              <div className={cn(
                "rounded-2xl p-4 flex flex-col gap-3 transition-transform",
                pillar.bg,
                pillar.proximamente ? "opacity-60" : "active:scale-[0.97]",
              )}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                    <Icon size={20} color={pillar.accentHex} strokeWidth={2.2} />
                  </div>
                  {pillar.proximamente
                    ? <Sparkles size={13} color={pillar.accentHex} />
                    : <ChevronRight size={16} color={pillar.accentHex} />
                  }
                </div>
                <div>
                  <p className="font-bold text-[15px]" style={{ color: pillar.accentHex }}>{pillar.label}</p>
                  <p className="text-[13px] mt-0.5 font-semibold" style={{ color: pillar.accentHex }}>{pillar.stat}</p>
                </div>
              </div>
            );
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.08 }}
                className={cn(i === 2 ? "col-span-2" : "")}
              >
                {pillar.proximamente ? card : <Link href={pillar.href}>{card}</Link>}
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Próximas citas</h2>
          <Link href="/salud" className="text-sm font-semibold text-primary">Ver todas</Link>
        </div>

        <div className="flex flex-col gap-3">
          {citasLoading
            ? [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
            : citas.length === 0
              ? (
                <div className="bg-card rounded-2xl p-5 border border-border text-center">
                  <p className="text-sm text-muted-foreground">Sin citas próximas</p>
                  <Link href="/salud/nueva-cita" className="text-sm font-semibold text-primary mt-2 inline-block">
                    + Agregar cita
                  </Link>
                </div>
              )
              : citas.map(appt => {
                const fh = appt.fecha_hora ? new Date(appt.fecha_hora) : null;
                const fechaStr = fh?.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Bogota" }) ?? "";
                const horaStr  = fh?.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }) ?? "";
                const acomp = (appt as { acompanante?: { nombre: string } }).acompanante;
                return (
                  <Link key={appt.id} href={`/salud/cita/${appt.id}`}>
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-foreground">{appt.especialidad ?? "Consulta"}</p>
                          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{appt.lugar ?? "–"}</p>
                        </div>
                        {fechaStr && (
                          <div className="flex items-center gap-1 bg-pillar-salud rounded-full px-2.5 py-1 shrink-0">
                            <Calendar size={11} color="#C0546A" />
                            <span className="text-[11px] font-semibold capitalize" style={{ color: "#C0546A" }}>{fechaStr}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-border">
                        {horaStr && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">{horaStr}</span>
                          </div>
                        )}
                        {acomp?.nombre && (
                          <span className="text-xs text-muted-foreground">
                            Acomp: <span className="font-semibold text-foreground">{acomp.nombre}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}
