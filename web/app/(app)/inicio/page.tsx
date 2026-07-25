"use client";

import { motion } from "motion/react";
import { Heart, Wallet, Building2, ChevronRight, Calendar, Clock, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pillars = [
  {
    id: "salud",
    label: "Salud",
    emoji: "💗",
    icon: Heart,
    href: "/salud",
    bg: "bg-pillar-salud",
    accentHex: "#C0546A",
    stat: "3 citas próximas",
    desc: "Citas, medicamentos y exámenes de Mamita Lucy",
  },
  {
    id: "finanzas",
    label: "Finanzas",
    emoji: "💰",
    icon: Wallet,
    href: "/finanzas",
    bg: "bg-pillar-finanzas",
    accentHex: "#3A917A",
    stat: "2 vencen esta semana",
    desc: "Créditos, pagos recurrentes y alertas del hogar",
  },
  {
    id: "administrativo",
    label: "Administrativo",
    emoji: "🏡",
    icon: Building2,
    href: "/administrativo",
    bg: "bg-pillar-admin",
    accentHex: "#C06B3A",
    stat: "2 tareas pendientes",
    desc: "Casas, mantenimiento y arriendos",
  },
];

const upcomingAppointments = [
  {
    id: 1,
    patient: "Mamita Lucy",
    specialty: "Cardiología",
    doctor: "Dr. Hernández",
    date: "Lun 14 jul",
    time: "10:00 am",
    companion: "Tío Jaime",
  },
  {
    id: 2,
    patient: "Mamita Lucy",
    specialty: "Odontología",
    doctor: "Dra. Martínez",
    date: "Mié 16 jul",
    time: "3:00 pm",
    companion: "Doralba",
  },
];

const familyMembers = [
  { nombre: "Mamita Lucy", emoji: "👵", rol: "Abuela" },
  { nombre: "Doralba", emoji: "👩", rol: "Mamá" },
  { nombre: "Tío Jaime", emoji: "👨", rol: "Familiar" },
  { nombre: "Tío Wilson", emoji: "👨", rol: "Familiar" },
  { nombre: "Tía Olga", emoji: "👩", rol: "Familiar" },
];

export default function InicioPage() {
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-dvh bg-background pb-28 lg:pb-10">

      {/* ── MOBILE header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden px-4 pt-14 pb-6 flex items-start justify-between"
      >
        <div>
          <p className="text-muted-foreground text-sm font-medium">{todayCapitalized}</p>
          <h1 className="text-2xl font-extrabold text-foreground mt-1">Hola, Luisa ☀️</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mt-1">
          <Bell size={18} className="text-muted-foreground" />
        </button>
      </motion.div>

      {/* ── DESKTOP header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:block px-8 pt-8 pb-6"
      >
        <h1 className="text-2xl font-extrabold text-foreground">Hola, Luisa ☀️</h1>
        <p className="text-muted-foreground text-sm mt-1">Esto es lo que tiene la familia hoy.</p>
      </motion.div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8">

        {/* LEFT: pillars + appointments */}
        <div className="flex flex-col gap-8">

          {/* Pillar cards — 3 cols on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-4"
          >
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07 }}
                >
                  <Link href={pillar.href}>
                    <div className={cn("rounded-2xl p-5 flex flex-col gap-4 hover:scale-[1.02] transition-transform cursor-pointer", pillar.bg)}>
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-white/50 flex items-center justify-center">
                          <Icon size={22} color={pillar.accentHex} strokeWidth={2.2} />
                        </div>
                        <ChevronRight size={16} color={pillar.accentHex} />
                      </div>
                      <div>
                        <p className="font-extrabold text-base" style={{ color: pillar.accentHex }}>{pillar.label}</p>
                        <p className="text-xs mt-1 text-foreground/60 font-medium leading-snug">{pillar.desc}</p>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: pillar.accentHex }}>{pillar.stat}</p>
                    </div>
                  </Link>
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
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-bold text-sm text-foreground">{appt.specialty}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{appt.doctor}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-pillar-salud rounded-full px-2.5 py-1 shrink-0">
                      <Calendar size={11} color="#C0546A" />
                      <span className="text-[11px] font-semibold" style={{ color: "#C0546A" }}>{appt.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2.5 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">{appt.time}</span>
                    </div>
                    {appt.companion && (
                      <span className="text-xs text-muted-foreground">
                        Acomp: <span className="font-semibold text-foreground">{appt.companion}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* RIGHT: family panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Familia</h3>
            <div className="flex flex-col gap-2">
              {familyMembers.map((m) => (
                <div key={m.nombre} className="flex items-center gap-3 py-1.5">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg shrink-0">
                    {m.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{m.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.rol}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Nueva cita médica", href: "/salud/nueva-cita", color: "#C0546A", bg: "#F2C5CE" },
                { label: "Nuevo medicamento", href: "/salud/nuevo-medicamento", color: "#C0546A", bg: "#F2C5CE" },
                { label: "Ver finanzas", href: "/finanzas", color: "#3A917A", bg: "#B8E2D4" },
              ].map((item) => (
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

      {/* ── MOBILE layout (sin cambios) ── */}
      <div className="lg:hidden px-4">
        <div className="grid grid-cols-2 gap-3 mb-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.08 }}
                className={cn(i === 2 ? "col-span-2" : "")}
              >
                <Link href={pillar.href}>
                  <div className={cn("rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.97] transition-transform", pillar.bg)}>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                        <Icon size={20} color={pillar.accentHex} strokeWidth={2.2} />
                      </div>
                      <ChevronRight size={16} color={pillar.accentHex} />
                    </div>
                    <div>
                      <p className="font-bold text-[15px]" style={{ color: pillar.accentHex }}>{pillar.label}</p>
                      <p className="text-[13px] mt-0.5 text-foreground/60 font-medium">{pillar.stat}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Próximas citas</h2>
          <Link href="/salud" className="text-sm font-semibold text-primary">Ver todas</Link>
        </div>
        <div className="flex flex-col gap-3">
          {upcomingAppointments.map((appt) => (
            <div key={appt.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{appt.specialty}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">{appt.doctor}</p>
                </div>
                <div className="flex items-center gap-1 bg-pillar-salud rounded-full px-2.5 py-1 shrink-0">
                  <Calendar size={11} color="#C0546A" />
                  <span className="text-[11px] font-semibold" style={{ color: "#C0546A" }}>{appt.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">{appt.time}</span>
                </div>
                {appt.companion && (
                  <span className="text-xs text-muted-foreground">
                    Acomp: <span className="font-semibold text-foreground">{appt.companion}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
