import { fmt } from "@/lib/utils";

interface SaludFinancieraCardProps {
    salarioMensual: number;
    totalCompromisos: number;
    disponible: number;
    porcentajeGastado: number;
    capacidadAhorro: number;
    onVerFinanzas: () => void;
}

export default function SaludFinancieraCard({
    salarioMensual, totalCompromisos, disponible, porcentajeGastado, capacidadAhorro, onVerFinanzas,
}: SaludFinancieraCardProps) {
    if (salarioMensual <= 0) return null;

    const color = porcentajeGastado >= 80 ? "#ef4444"
        : porcentajeGastado >= 60 ? "#f59e0b"
        : "#22c55e";

    const estado = porcentajeGastado >= 80 ? "⚠️ Comprometido"
        : porcentajeGastado >= 60 ? "🟡 Cuidado"
        : "✅ Saludable";

    return (
        <div
            onClick={onVerFinanzas}
            style={{
                background: "var(--color-bg-elevated)",
                border: `1px solid ${color}40`,
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                cursor: "pointer",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                    💚 Salud financiera
                </p>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color }}>{estado}</span>
            </div>

            {/* Barra principal */}
            <div style={{ marginBottom: "var(--space-3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        Comprometido: <strong style={{ color }}>{porcentajeGastado}%</strong>
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        Libre: <strong style={{ color: "var(--color-text)" }}>{100 - porcentajeGastado}%</strong>
                    </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--color-bg)", overflow: "hidden" }}>
                    <div style={{
                        height: "100%",
                        width: `${Math.min(100, porcentajeGastado)}%`,
                        background: color,
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                    }} />
                </div>
            </div>

            {/* Cifras */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)" }}>
                {[
                    { label: "Salario", value: fmt(salarioMensual), c: "var(--color-text)" },
                    { label: "Gastos", value: fmt(totalCompromisos), c: color },
                    { label: "Disponible", value: fmt(Math.max(0, disponible)), c: disponible >= 0 ? "#22c55e" : "#ef4444" },
                ].map(({ label, value, c }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 10, color: "var(--color-text-3)", marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: c }}>{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
