"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/salud", label: "Salud", icon: Heart },
  { href: "/configuracion", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 pb-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 px-4 min-w-[60px] rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-transform duration-200"
              />
              <span className="text-[11px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
