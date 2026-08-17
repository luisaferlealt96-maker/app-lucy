"use client";

import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import * as Popover from "@radix-ui/react-popover";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mini calendar ─────────────────────────────────────────────── */

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function MiniCalendar({
  selected,
  onSelect,
  onClose,
  accentColor = "#C0546A",
  accentBg = "#FDF2F4",
}: {
  selected?: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
  accentColor?: string;
  accentBg?: string;
}) {
  const [viewYear, setViewYear]   = useState(selected?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth()    ?? new Date().getMonth());

  const today      = new Date(); today.setHours(0, 0, 0, 0);
  const firstDay   = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const cells: (number | null)[] = [...Array(startOffset).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstDay.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const prev = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const next = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const isSel   = (d: number) => !!selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === d;
  const isTod   = (d: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  return (
    <div style={{ width: 280 }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prev}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-extrabold text-gray-900 capitalize">{monthLabel}</span>
        <button type="button" onClick={next}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-extrabold text-gray-400 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`n-${i}`} className="h-9" />;
          const sel = isSel(day);
          const tod = isTod(day);
          return (
            <button
              key={i}
              type="button"
              onClick={() => { onSelect(new Date(viewYear, viewMonth, day)); onClose(); }}
              className={cn(
                "h-9 w-full rounded-xl text-sm flex items-center justify-center transition-all font-medium",
                sel ? "text-white font-bold shadow-md"
                  : tod ? "font-extrabold"
                  : "text-gray-700 hover:bg-gray-100",
              )}
              style={sel
                ? { background: accentColor, boxShadow: `0 2px 10px ${accentColor}55` }
                : tod
                ? { background: accentBg, color: accentColor }
                : undefined}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Hoy shortcut */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          onClick={() => { onSelect(new Date()); onClose(); }}
          className="text-xs font-bold px-3 py-1.5 rounded-xl transition-colors hover:bg-gray-100"
          style={{ color: accentColor }}>
          Hoy
        </button>
      </div>
    </div>
  );
}

/* ─── DatePicker ─────────────────────────────────────────────────── */

export interface DatePickerProps {
  value?: string;                 // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  accentColor?: string;
  accentBg?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled,
  accentColor = "#C0546A",
  accentBg = "#FDF2F4",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed    = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const validDate = parsed && isValid(parsed) ? parsed : undefined;
  const display   = validDate
    ? format(validDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    : null;

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center gap-2.5 h-12 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-left transition-all",
            "hover:border-[#C0546A55] disabled:opacity-50 disabled:cursor-not-allowed",
            open && "ring-2 ring-[#C0546A22] border-[#C0546A88]",
            className,
          )}
        >
          <Calendar size={15} className="shrink-0 text-muted-foreground" />
          <span className={cn("flex-1 truncate", !display && "text-muted-foreground")}>
            {display ?? placeholder}
          </span>
          {display && !disabled && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(""); }}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={11} className="text-muted-foreground" />
            </button>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          style={{
            zIndex: 9999,
            background: "white",
            borderRadius: "20px",
            padding: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <MiniCalendar
            selected={validDate}
            onSelect={d => onChange(format(d, "yyyy-MM-dd"))}
            onClose={() => setOpen(false)}
            accentColor={accentColor}
            accentBg={accentBg}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
