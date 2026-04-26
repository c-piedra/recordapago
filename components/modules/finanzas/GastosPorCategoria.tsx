import { fmt, CATEGORIA_LABEL, CATEGORIA_ICONO } from "@/lib/utils";

interface GastosPorCategoriaProps {
    porCategoria: Record<string, number>;
    salarioMensual: number;
}

export default function GastosPorCategoria({ porCategoria, salarioMensual }: GastosPorCategoriaProps) {
    return (
        <div>
            <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Gastos por categoría</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-3)" }}>
                La barra muestra qué % de tu salario va a cada categoría.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {Object.entries(porCategoria)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, monto]) => {
                        const pct = salarioMensual > 0
                            ? Math.round((monto / salarioMensual) * 100)
                            : 0;
                        const color = pct > 30 ? "var(--color-danger)" : pct > 15 ? "var(--color-warning)" : "var(--color-primary)";
                        return (
                            <div key={cat} className="list-item">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                        <span style={{ fontSize: 20 }}>
                                            {CATEGORIA_ICONO[cat as keyof typeof CATEGORIA_ICONO] ?? "📋"}
                                        </span>
                                        <div>
                                            <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                                                {CATEGORIA_LABEL[cat as keyof typeof CATEGORIA_LABEL] ?? cat}
                                            </p>
                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                {pct}% de tu salario
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)", fontSize: "var(--text-sm)" }}>
                                        {fmt(monto)}
                                    </p>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: "var(--color-bg-elevated)", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", width: `${Math.min(100, pct)}%`,
                                        background: color, borderRadius: 3,
                                        transition: "width 0.5s ease",
                                    }} />
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
