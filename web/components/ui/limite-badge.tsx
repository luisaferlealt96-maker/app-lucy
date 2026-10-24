import { CalendarClock } from "lucide-react";
import { estadoLimite } from "@/lib/utils/limite";

export function LimiteBadge({ fecha }: { fecha: string | null | undefined }) {
  const e = estadoLimite(fecha);
  if (!e) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: e.bg, color: e.color }}
    >
      <CalendarClock size={11} strokeWidth={2.5} />
      {e.corto}
    </span>
  );
}
