"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/app/NotificationBell";

const PAGE_TITLES: Record<string, string> = {
  "/inicio": "Inicio",
  "/salud": "Salud",
  "/finanzas": "Finanzas",
  "/administrativo": "Administrativo",
};

export function TopBar() {
  const pathname = usePathname();
  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? "App Lucy";

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="hidden lg:flex items-center justify-between px-8 h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 shrink-0">
      <h1 className="text-base font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{todayCapitalized}</span>
        <NotificationBell />
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: "#9B8EC4" }}
        >
          L
        </div>
      </div>
    </header>
  );
}
