import type { CategoriaCompromiso, FrecuenciaCompromiso } from "@/types";

// ─── Formato moneda ───────────────────────────────────────────────────────────
export const fmt = (n: number) =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n);

// ─── Formato fecha ────────────────────────────────────────────────────────────
export const fmtDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("es-CR", {
        day: "numeric", month: "short", year: "numeric",
    });

// ─── Días hasta fecha ─────────────────────────────────────────────────────────
export const diasHasta = (iso: string): string => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(iso + "T00:00:00");
    const diff = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Venció hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}`;
    if (diff === 0) return "¡Vence hoy!";
    if (diff === 1) return "Vence mañana";
    return `En ${diff} días`;
};

export const diasHastaNum = (iso: string): number => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(iso + "T00:00:00");
    return Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Calcular próxima fecha según frecuencia ──────────────────────────────────
export const calcProximaFecha = (desde: string, frecuencia: FrecuenciaCompromiso): string => {
    const fecha = new Date(desde + "T00:00:00");
    switch (frecuencia) {
        case "semanal": fecha.setDate(fecha.getDate() + 7); break;
        case "quincenal": fecha.setDate(fecha.getDate() + 15); break;
        case "mensual": fecha.setMonth(fecha.getMonth() + 1); break;
        case "bimestral": fecha.setMonth(fecha.getMonth() + 2); break;
        case "trimestral": fecha.setMonth(fecha.getMonth() + 3); break;
        case "semestral": fecha.setMonth(fecha.getMonth() + 6); break;
        case "anual": fecha.setFullYear(fecha.getFullYear() + 1); break;
    }
    return fecha.toISOString().split("T")[0];
};

// ─── Labels ───────────────────────────────────────────────────────────────────
export const CATEGORIA_LABEL: Record<CategoriaCompromiso, string> = {
    suscripcion: "Suscripción",
    prestamo: "Préstamo",
    tarjeta: "Tarjeta",
    servicio: "Servicio",
    alquiler: "Alquiler",
    salud: "Salud",
    mascotas: "Mascotas",
    educacion: "Educación",
    otro: "Otro",
};

export const FRECUENCIA_LABEL: Record<FrecuenciaCompromiso, string> = {
    semanal: "Semanal",
    quincenal: "Quincenal",
    mensual: "Mensual",
    bimestral: "Bimestral",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual",
};

// ─── Iconos por categoría ─────────────────────────────────────────────────────
export const CATEGORIA_ICONO: Record<CategoriaCompromiso, string> = {
    suscripcion: "📺",
    prestamo: "🏦",
    tarjeta: "💳",
    servicio: "⚡",
    alquiler: "🏠",
    salud: "🏥",
    mascotas: "🐾",
    educacion: "📚",
    otro: "📋",
};

// ─── Color urgencia ───────────────────────────────────────────────────────────
export const getUrgenciaColor = (dias: number): string => {
    if (dias < 0) return "#ef4444"; // vencido
    if (dias <= 2) return "#ef4444"; // urgente
    if (dias <= 5) return "#f59e0b"; // próximo
    return "#22c55e";                // ok
};

export const getUrgenciaLabel = (dias: number): string => {
    if (dias < 0) return "Vencido";
    if (dias <= 2) return "Urgente";
    if (dias <= 5) return "Próximo";
    return "Al día";
};