"use client";

import { motion } from "motion/react";
import { Building2, Plus, Home, TreePine, DoorOpen } from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Casa Principal",
    icon: Home,
    tasks: 2,
    color: "#C06B3A",
  },
  {
    id: 2,
    name: "Casa de Campo",
    icon: TreePine,
    tasks: 1,
    color: "#C06B3A",
  },
  {
    id: 3,
    name: "Arriendos",
    icon: DoorOpen,
    tasks: 0,
    color: "#C06B3A",
  },
];

export default function AdministrativoPage() {
  return (
    <div className="min-h-dvh bg-background pb-28 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-pillar-admin px-4 pt-14 pb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={18} color="#C06B3A" strokeWidth={2.5} />
              <span className="text-sm font-bold" style={{ color: "#C06B3A" }}>Administrativo</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Casas y arriendos</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={20} color="#C06B3A" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* Properties */}
      <div className="px-4 pt-6">
        <div className="flex flex-col gap-3">
          {properties.map((prop, i) => {
            const Icon = prop.icon;
            return (
              <motion.button
                key={prop.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-pillar-admin flex items-center justify-center">
                  <Icon size={22} color={prop.color} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{prop.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {prop.tasks > 0 ? `${prop.tasks} tarea${prop.tasks > 1 ? "s" : ""} pendiente${prop.tasks > 1 ? "s" : ""}` : "Al día"}
                  </p>
                </div>
                {prop.tasks > 0 && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">{prop.tasks}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-pillar-admin/30 rounded-2xl p-6 text-center border border-pillar-admin"
        >
          <Building2 size={32} className="mx-auto mb-2" color="#C06B3A" />
          <p className="text-sm font-semibold text-foreground">Mantenimiento y arriendos</p>
          <p className="text-xs text-muted-foreground mt-1">Se conectan en la Sesión 4</p>
        </motion.div>
      </div>
    </div>
  );
}
