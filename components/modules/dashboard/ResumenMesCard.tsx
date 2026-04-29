import { fmt } from "@/lib/utils";
import type { HistorialPago, Compromiso } from "@/types";

interface ResumenMesCardProps {
    historial: HistorialPago[];
    compromisos: Compromiso[];
    userId: string | null;
    onVerHistorial: () => void;
}

export default function ResumenMesCard({ historial, compromisos, userId, onVerHistorial }: ResumenMesCardProps) {
    const hoy = new Date();
    const mesActual = hoy.toISOString().slice(0, 7);

    const pagosEsteMes = historial.filter(
        (h) => h.fecha.startsWith(mesActual) && (!h.pagadoPor || h.pagadoPor === userId)
    );
    const montosPagados = pagosEsteMes.reduce((s, h) => s + h.monto, 0);

    const activos = compromisos.filter((c) => c.estado === "activo");
    const totalPendiente = activos.reduce((s, c) => s + c.monto, 0);
    const totalMes = montosPagados + totalPendiente;
    const pct = totalMes > 0 ? Math.round((montosPagados / totalMes) * 100) : 0;

    if (activos.length === 0 && pagosEsteMes.length === 0) return null;

    const mes = hoy.toLocaleDateString("es-CR", { month: "long" });

    return (
        <div
            onClick={onVerHistorial}
            style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                cursor: "pointer",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                    📅 Resumen de {mes}
                </p>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                    {pagosEsteMes.length} pagos
                </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-2)" }}>
                <div>
                    <p style={{ fontSize: 10, color: "var(--color-text-3)", marginBottom: 2 }}>Pagado</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: "#22c55e" }}>
                        {fmt(montosPagados)}
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "var(--color-text-3)", marginBottom: 2 }}>Pendiente</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--color-text)" }}>
                        {fmt(totalPendiente)}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: 6 }}>
                <div style={{ height: 8, borderRadius: 4, background: "var(--color-bg)", overflow: "hidden" }}>
                    <div style={{
                        height: "100%", width: `${pct}%`,
                        background: "linear-gradient(90deg, #22c55e, #16a34a)",
                        borderRadius: 4, transition: "width 0.6s ease",
                    }} />
                </div>
            </div>
            <p style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                {pct}% del mes cubierto · ver historial →
            </p>
        </div>
    );
}
