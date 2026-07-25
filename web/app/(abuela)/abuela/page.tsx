"use client";

import { motion } from "motion/react";
import { Calendar, Clock, MapPin, User, Pill, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAbuelaData } from "@/hooks/useSalud";
import { formatFechaHora } from "@/lib/utils/fecha";

export default function AbuelaHomePage() {
  const { citas, medicamentos, loading } = useAbuelaData();

  return (
    <div className="min-h-dvh bg-background pb-16 px-4">
      {/* Saludo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-8 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-pillar-salud flex items-center justify-center mx-auto mb-4 text-6xl shadow-md">
          👵
        </div>
        <h1 className="text-4xl font-extrabold text-foreground">Hola, Mamita Lucy</h1>
        <p className="text-xl text-muted-foreground mt-2 font-medium">Tu familia te cuida con amor 💕</p>
      </motion.div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* PRÓXIMAS CITAS */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={22} color="#C0546A" strokeWidth={2.5} />
              <h2 className="text-2xl font-extrabold text-foreground">Mis citas</h2>
            </div>

            {citas.length === 0 ? (
              <div className="bg-pillar-salud rounded-3xl p-8 text-center">
                <Calendar size={40} color="#C0546A" className="mx-auto mb-3" />
                <p className="text-xl font-bold text-foreground">¡Sin citas próximas!</p>
                <p className="text-base text-muted-foreground mt-1">Cuando haya una, aparecerá aquí</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {citas.map((cita, i) => {
                  const { fecha, hora } = cita.fecha_hora ? formatFechaHora(cita.fecha_hora) : { fecha: "Sin fecha", hora: "" };
                  return (
                    <motion.div
                      key={cita.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="bg-card rounded-3xl p-5 border-2 border-pillar-salud shadow-md"
                    >
                      {/* Especialidad */}
                      <div className="bg-pillar-salud rounded-2xl px-4 py-2 inline-block mb-4">
                        <span className="text-lg font-extrabold" style={{ color: "#C0546A" }}>
                          {cita.especialidad}
                        </span>
                      </div>

                      {cita.medico && (
                        <p className="text-xl font-bold text-foreground mb-3">{cita.medico}</p>
                      )}

                      {/* Fecha — MUY GRANDE para que Rose la lea bien */}
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar size={28} color="#C0546A" />
                        <span className="text-3xl font-extrabold text-foreground">{fecha}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <Clock size={28} color="#C0546A" />
                        <span className="text-3xl font-extrabold text-foreground">{hora}</span>
                      </div>

                      {cita.lugar && (
                        <div className="flex items-center gap-3 pt-3 border-t border-border mb-3">
                          <MapPin size={22} className="text-muted-foreground shrink-0" />
                          <span className="text-lg text-muted-foreground">{cita.lugar}</span>
                        </div>
                      )}

                      {cita.acompanante && (
                        <div className="bg-accent rounded-2xl px-5 py-4 flex items-center gap-3">
                          <User size={24} color="#6B5C9E" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Te acompaña</p>
                            <p className="text-2xl font-extrabold text-primary">{cita.acompanante.nombre}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* MEDICAMENTOS ACTIVOS */}
          {medicamentos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center gap-2 mb-3">
                <Pill size={22} color="#C0546A" strokeWidth={2.5} />
                <h2 className="text-2xl font-extrabold text-foreground">Mis medicamentos</h2>
              </div>

              <div className="flex flex-col gap-3">
                {medicamentos.map((med, i) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="bg-card rounded-3xl p-5 border border-border shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-pillar-salud flex items-center justify-center shrink-0">
                        <Pill size={22} color="#C0546A" />
                      </div>
                      <div>
                        <p className="text-xl font-extrabold text-foreground">{med.nombre}</p>
                        {med.dosis && <p className="text-base text-muted-foreground">{med.dosis}</p>}
                        {med.frecuencia && <p className="text-sm text-muted-foreground">{med.frecuencia}</p>}
                      </div>
                    </div>
                    {med.horas_toma && med.horas_toma.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {med.horas_toma.map(h => (
                          <span key={h} className="bg-pillar-salud text-[#C0546A] text-base font-bold px-4 py-1.5 rounded-full">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Link discreto para ver todas las citas */}
          <Link href="/mis-citas" className="flex items-center justify-center gap-1.5 py-4 text-muted-foreground">
            <ChevronRight size={16} />
            <span className="text-sm font-medium">Ver todas las citas</span>
          </Link>
        </div>
      )}
    </div>
  );
}
