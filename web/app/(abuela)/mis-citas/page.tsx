"use client";

import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Heart, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbuelaData } from "@/hooks/useSalud";
import { formatFechaHora } from "@/lib/utils/fecha";

export default function AbuelaCitasPage() {
  const { citas, loading } = useAbuelaData();

  return (
    <div className="min-h-dvh bg-background pb-10 px-4">
      {/* Header grande y cálido */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-pillar-salud flex items-center justify-center mx-auto mb-4 text-5xl">
          👵
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">Hola, Mamita Lucy</h1>
        <p className="text-lg text-muted-foreground mt-1 font-medium">Tu familia te cuida 💕</p>
      </motion.div>

      {/* Sección de citas — letra grande */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Heart size={20} fill="#C0546A" color="#C0546A" />
          <h2 className="text-xl font-bold text-foreground">Tus próximas citas</h2>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-36 rounded-3xl" />)}
          </div>
        ) : citas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-pillar-salud rounded-3xl p-8 text-center"
          >
            <Calendar size={48} color="#C0546A" className="mx-auto mb-3" />
            <p className="text-xl font-bold text-foreground">¡Sin citas por ahora!</p>
            <p className="text-base text-muted-foreground mt-1">Cuando tengas una cita, aparecerá aquí</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {citas.map((cita, i) => {
              const { fecha, hora } = cita.fecha_hora ? formatFechaHora(cita.fecha_hora) : { fecha: "Sin fecha", hora: "" };
              return (
                <motion.div
                  key={cita.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-3xl p-5 border-2 border-pillar-salud shadow-md"
                >
                  {/* Especialidad */}
                  <div className="bg-pillar-salud rounded-2xl px-4 py-2 inline-flex items-center gap-2 mb-4">
                    <Heart size={16} fill="#C0546A" color="#C0546A" />
                    <span className="text-base font-bold" style={{ color: "#C0546A" }}>
                      {cita.especialidad}
                    </span>
                  </div>

                  {/* Médico */}
                  {cita.medico && (
                    <p className="text-lg font-semibold text-foreground mb-3">{cita.medico}</p>
                  )}

                  {/* Fecha y hora — MUY GRANDE */}
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={24} color="#C0546A" />
                    <span className="text-2xl font-extrabold text-foreground">{fecha}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock size={24} color="#C0546A" />
                    <span className="text-2xl font-extrabold text-foreground">{hora}</span>
                  </div>

                  {/* Lugar */}
                  {cita.lugar && (
                    <div className="flex items-center gap-3 mb-3 pt-3 border-t border-border">
                      <MapPin size={20} className="text-muted-foreground shrink-0" />
                      <span className="text-base text-muted-foreground">{cita.lugar}</span>
                    </div>
                  )}

                  {/* Acompañante */}
                  {cita.acompanante && (
                    <div className="bg-accent rounded-2xl px-4 py-3 flex items-center gap-3 mt-2">
                      <User size={20} color="#6B5C9E" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Te acompaña</p>
                        <p className="text-lg font-extrabold text-primary">{cita.acompanante.nombre}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
