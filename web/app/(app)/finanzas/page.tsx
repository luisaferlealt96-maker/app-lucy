"use client";

import { motion } from "motion/react";
import { Wallet, Plus, CreditCard, RefreshCw, AlertCircle } from "lucide-react";

const categories = [
  { icon: CreditCard, label: "Créditos", value: "3 activos", color: "#3A917A" },
  { icon: RefreshCw, label: "Pagos recurrentes", value: "8 activos", color: "#9B8EC4" },
  { icon: AlertCircle, label: "Próximos a vencer", value: "2 esta semana", color: "#C06B3A" },
];

export default function FinanzasPage() {
  return (
    <div className="min-h-dvh bg-background pb-28 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-pillar-finanzas px-4 pt-14 pb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} color="#3A917A" strokeWidth={2.5} />
              <span className="text-sm font-bold" style={{ color: "#3A917A" }}>Finanzas</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Pagos y créditos</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={20} color="#3A917A" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="px-4 pt-6">
        <div className="flex flex-col gap-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-pillar-finanzas flex items-center justify-center">
                  <Icon size={22} color={cat.color} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{cat.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{cat.value}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-pillar-finanzas/30 rounded-2xl p-6 text-center border border-pillar-finanzas"
        >
          <Wallet size={32} className="mx-auto mb-2" color="#3A917A" />
          <p className="text-sm font-semibold text-foreground">Créditos y pagos</p>
          <p className="text-xs text-muted-foreground mt-1">Se conectan en la Sesión 3</p>
        </motion.div>
      </div>
    </div>
  );
}
