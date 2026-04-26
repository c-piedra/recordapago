import { fmt } from "@/lib/utils";

interface FinanzasHeroProps {
    salarioMensual: number;
    totalCompromisos: number;
    disponible: number;
    porcentajeGastado: number;
    onEditar: () => void;
}

export default function FinanzasHero({ salarioMensual, totalCompromisos, disponible, porcentajeGastado, onEditar }: FinanzasHeroProps) {
    const porcentaje = Math.min(100, porcentajeGastado);
    const barColor = porcentaje > 70 ? "var(--color-danger)" : porcentaje > 50 ? "var(--color-warning)" : "var(--color-success)";

    return (
        <div style={{
            background: "linear-gradient(135deg, #1a1040 0%, #0f1627 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            position: "relative",
        }}>
            <div style={{
                position: "absolute", top: -30, right: -30,
                width: 150, height: 150,
                background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
                <div>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Salario mensual</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-text)" }}>
                        {fmt(salarioMensual)}
                    </p>
                </div>
                <button
                    className="btn btn-ghost"
                    style={{ fontSize: "var(--text-xs)", padding: "4px 10px", minHeight: 0, position: "relative", zIndex: 10 }}
                    onClick={onEditar}
                >
                    ✏️ Editar
                </button>
            </div>

            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                {fmt(totalCompromisos)} comprometidos · {fmt(Math.max(0, disponible))} disponibles
            </p>
            <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: "var(--space-4)" }}>
                <div style={{
                    height: "100%", width: `${porcentaje}%`,
                    background: barColor, borderRadius: 5,
                    transition: "width 0.8s ease",
                }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center" }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Comprometido</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: barColor }}>
                        {porcentajeGastado}%
                    </p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center" }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Disponible</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: disponible >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                        {fmt(Math.abs(disponible))}
                    </p>
                </div>
            </div>
        </div>
    );
}
