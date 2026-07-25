import { BottomNav } from "@/components/app/BottomNav";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar — solo desktop */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar — solo desktop */}
        <TopBar />

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom nav — solo móvil, envuelto en div para asegurar ocultamiento */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
