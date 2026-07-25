"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Heart, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { MiembroFamilia } from "@/lib/supabase/types";

const navItems = [
  { href: "/inicio", label: "Inicio", icon: Home,  color: "#9B8EC4", bg: "#9B8EC4" },
  { href: "/salud",  label: "Salud",  icon: Heart, color: "#C0546A", bg: "#C0546A" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [yo, setYo] = useState<MiembroFamilia | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("miembros_familia")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setYo(data);
    };
    cargar();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/api/logout";
  };

  const isConfig = pathname === "/configuracion";

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-dvh sticky top-0 bg-card border-r border-border overflow-hidden">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: "#EDE9F7" }}>
            🏠
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground leading-tight">Lucy Familia</p>
            <p className="text-[11px] text-muted-foreground font-medium">Panel familiar</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, bg }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              style={isActive ? { background: bg } : {}}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? "#fff" : "currentColor"} />
              <span className={cn("text-sm font-semibold", isActive ? "text-white" : "")}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Acciones + usuario */}
      <div className="px-3 pb-4 border-t border-border pt-3 flex flex-col gap-1">

        {/* Configuración */}
        <Link href="/configuracion"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full",
            isConfig ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          style={isConfig ? { background: "#9B8EC4" } : {}}
        >
          <Settings size={17} strokeWidth={isConfig ? 2.5 : 1.8} color={isConfig ? "#fff" : "currentColor"} />
          <span className={cn("text-sm font-semibold", isConfig ? "text-white" : "")}>Configuración</span>
        </Link>

        {/* Cerrar sesión */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all w-full text-left">
          <LogOut size={17} strokeWidth={1.8} />
          <span className="text-sm font-semibold">Cerrar sesión</span>
        </button>

        {/* Usuario */}
        <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-secondary/50">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ background: "#EDE9F7" }}>
            {yo?.emoji ?? "👤"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{yo?.nombre ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground">
              {yo?.rol === "admin" ? "Administradora" : yo?.rol === "abuela" ? "Vista especial" : "Familiar"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
