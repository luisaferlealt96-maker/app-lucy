"use client";

import { use } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Calendar, Pill, FlaskConical, ChevronRight, Clock, Circle, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMiembros, useCitasMiembro, useMedicamentosMiembro, useExamenesMiembro } from "@/hooks/useSalud";
import { formatFechaHora, formatFechaCorta, calcularEdad } from "@/lib/utils/fecha";
import { cn } from "@/lib/utils";

const TIPO_LABEL: Record<string, string> = {
  laboratorio: "Laboratorio",
  examen: "Examen",
  procedimiento: "Procedimiento",
};

const ESTADO_EXAMEN_COLOR: Record<string, string> = {
  pendiente: "text-yellow-600 bg-yellow-50",
  en_proceso: "text-blue-600 bg-blue-50",
  listo: "text-green-600 bg-green-50",
};

export default function MiembroSaludPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { miembros, loading: loadingM } = useMiembros();
  const { citas, loading: loadingC } = useCitasMiembro(id);
  const { medicamentos, loading: loadingMed } = useMedicamentosMiembro(id);
  const { examenes, loading: loadingE } = useExamenesMiembro(id);

  const miembro = miembros.find(m => m.id === id);

  return (
    <div className="min-h-dvh bg-background pb-28 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-pillar-salud px-4 pt-12 pb-5"
      >
        <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-4">
          <ArrowLeft size={18} color="#C0546A" strokeWidth={2.5} />
          <span className="text-sm font-semibold" style={{ color: "#C0546A" }}>Salud</span>
        </button>

        {loadingM ? (
          <Skeleton className="h-16 rounded-xl bg-white/40" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center text-3xl">
              {miembro?.emoji ?? "👤"}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">{miembro?.nombre ?? "–"}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {miembro?.fecha_nacimiento ? `${calcularEdad(miembro.fecha_nacimiento)} años` : "–"}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="citas" className="px-4 pt-4">
        <TabsList className="w-full bg-secondary rounded-xl mb-4 h-10">
          <TabsTrigger value="citas" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Calendar size={13} className="mr-1" /> Citas
          </TabsTrigger>
          <TabsTrigger value="medicamentos" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Pill size={13} className="mr-1" /> Medicamentos
          </TabsTrigger>
          <TabsTrigger value="examenes" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <FlaskConical size={13} className="mr-1" /> Exámenes
          </TabsTrigger>
        </TabsList>

        {/* CITAS */}
        <TabsContent value="citas">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium">{citas.length} cita{citas.length !== 1 ? "s" : ""} registrada{citas.length !== 1 ? "s" : ""}</p>
            <Link href={`/salud/nueva-cita?paciente=${id}`}
              className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Plus size={13} /> Nueva cita
            </Link>
          </div>

          {loadingC ? (
            <div className="flex flex-col gap-2">{[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
          ) : citas.length === 0 ? (
            <EmptyState icon={Calendar} texto="Sin citas registradas" href={`/salud/nueva-cita?paciente=${id}`} cta="Agregar primera cita" />
          ) : (
            <div className="flex flex-col gap-2.5">
              {citas.map((cita, i) => {
                const { fecha, hora } = cita.fecha_hora ? formatFechaHora(cita.fecha_hora) : { fecha: "Sin fecha", hora: "" };
                return (
                  <motion.div key={cita.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link href={`/salud/cita/${cita.id}`}>
                      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition-transform">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm">{cita.especialidad}</p>
                            {cita.medico && <p className="text-xs text-muted-foreground">{cita.medico}</p>}
                          </div>
                          <span className={cn(
                            "text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                            cita.estado === "pendiente" ? "bg-pillar-salud text-[#C0546A]" :
                            cita.estado === "completada" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                          )}>
                            {cita.estado === "pendiente" ? fecha : cita.estado}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{hora}</span>
                          </div>
                          {cita.acompanante && (
                            <span className="text-xs text-muted-foreground">
                              Acomp: <span className="font-semibold text-foreground">{cita.acompanante.nombre}</span>
                            </span>
                          )}
                          {cita.notas_post && (
                            <span className="text-xs text-green-600 font-medium ml-auto">Con notas ✓</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* MEDICAMENTOS */}
        <TabsContent value="medicamentos">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium">{medicamentos.filter(m => m.activo).length} activo{medicamentos.filter(m => m.activo).length !== 1 ? "s" : ""}</p>
            <Link href={`/salud/nuevo-medicamento?paciente=${id}`}
              className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Plus size={13} /> Agregar
            </Link>
          </div>

          {loadingMed ? (
            <div className="flex flex-col gap-2">{[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
          ) : medicamentos.length === 0 ? (
            <EmptyState icon={Pill} texto="Sin medicamentos registrados" href={`/salud/nuevo-medicamento?paciente=${id}`} cta="Agregar medicamento" />
          ) : (
            <div className="flex flex-col gap-2">
              {medicamentos.map((med, i) => (
                <motion.div key={med.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/salud/medicamento/${med.id}`}>
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition-transform">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Circle size={8} fill={med.activo ? "#22c55e" : "#9ca3af"} color={med.activo ? "#22c55e" : "#9ca3af"} />
                          <div>
                            <p className="font-bold text-sm">{med.nombre}</p>
                            {med.dosis && <p className="text-xs text-muted-foreground">{med.dosis}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", med.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                            {med.activo ? "Activo" : "Inactivo"}
                          </span>
                          <ChevronRight size={13} className="text-muted-foreground" />
                        </div>
                      </div>
                      {med.frecuencia && (
                        <p className="text-xs text-muted-foreground mt-1.5 ml-4">{med.frecuencia}</p>
                      )}
                      {med.horas_toma && med.horas_toma.length > 0 && (
                        <div className="flex gap-1.5 mt-2 ml-4 flex-wrap">
                          {med.horas_toma.map(h => (
                            <span key={h} className="bg-pillar-salud text-[#C0546A] text-[11px] font-semibold px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* EXÁMENES */}
        <TabsContent value="examenes">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium">{examenes.length} examen{examenes.length !== 1 ? "es" : ""}</p>
            <Link href={`/salud/nuevo-examen?paciente=${id}`}
              className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Plus size={13} /> Agregar
            </Link>
          </div>

          {loadingE ? (
            <div className="flex flex-col gap-2">{[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
          ) : examenes.length === 0 ? (
            <EmptyState icon={FlaskConical} texto="Sin exámenes registrados" href={`/salud/nuevo-examen?paciente=${id}`} cta="Agregar examen" />
          ) : (
            <div className="flex flex-col gap-2">
              {examenes.map((ex, i) => (
                <motion.div key={ex.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/salud/examen/${ex.id}`}>
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition-transform">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{ex.nombre}</p>
                          <p className="text-xs text-muted-foreground">{TIPO_LABEL[ex.tipo]}{ex.especialidad ? ` · ${ex.especialidad}` : ""}</p>
                          {ex.lugar && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground line-clamp-1">{ex.lugar}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(ex.archivo_orden_url || ex.archivo_resultado_url) && (
                            <ChevronRight size={13} className="text-muted-foreground" />
                          )}
                          <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", ESTADO_EXAMEN_COLOR[ex.estado])}>
                            {ex.estado === "en_proceso" ? "En proceso" : ex.estado.charAt(0).toUpperCase() + ex.estado.slice(1)}
                          </span>
                        </div>
                      </div>
                      {(ex.fecha_solicitud || ex.fecha_resultado) && (
                        <div className="flex gap-3 mt-2 pt-2 border-t border-border">
                          {ex.fecha_solicitud && (
                            <span className="text-xs text-muted-foreground">Solicitado: {formatFechaCorta(ex.fecha_solicitud)}</span>
                          )}
                          {ex.fecha_resultado && (
                            <span className="text-xs text-green-600 font-medium">Resultado: {formatFechaCorta(ex.fecha_resultado)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, texto, href, cta }: { icon: React.ElementType; texto: string; href: string; cta: string }) {
  return (
    <div className="bg-pillar-salud/30 rounded-2xl p-6 text-center border border-pillar-salud">
      <Icon size={28} className="mx-auto mb-2" color="#C0546A" />
      <p className="text-sm font-semibold text-foreground">{texto}</p>
      <Link href={href}>
        <p className="text-xs text-primary font-semibold mt-1">+ {cta}</p>
      </Link>
    </div>
  );
}
