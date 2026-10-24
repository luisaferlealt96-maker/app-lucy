export type NivelLimite = "vencido" | "urgente" | "pronto" | "ok";

export interface EstadoLimite {
  dias: number;
  nivel: NivelLimite;
  color: string;
  bg: string;
  corto: string;
  largo: string;
}

/** Estado visual de una fecha límite (formato YYYY-MM-DD). */
export function estadoLimite(fecha: string | null | undefined): EstadoLimite | null {
  if (!fecha) return null;
  const limite = new Date(fecha + "T23:59:59");
  const dias = Math.ceil((limite.getTime() - Date.now()) / 86400000);
  const fechaStr = limite.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  if (dias <= 0 && limite.getTime() < Date.now())
    return { dias, nivel: "vencido", color: "#c62828", bg: "#FFEBEE", corto: "Plazo vencido", largo: `El plazo venció el ${fechaStr}` };
  if (dias <= 7)
    return { dias, nivel: "urgente", color: "#c62828", bg: "#FFEBEE", corto: dias <= 1 ? "Último día" : `${dias}d para el plazo`, largo: `Quedan ${dias} días (hasta el ${fechaStr}) — ¡urgente!` };
  if (dias <= 30)
    return { dias, nivel: "pronto", color: "#e65100", bg: "#FFF3E0", corto: `${dias}d para el plazo`, largo: `Quedan ${dias} días (hasta el ${fechaStr})` };
  return { dias, nivel: "ok", color: "#2e7d32", bg: "#E8F5E9", corto: `${dias}d para el plazo`, largo: `Quedan ${dias} días (hasta el ${fechaStr})` };
}
