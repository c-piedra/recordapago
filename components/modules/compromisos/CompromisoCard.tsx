import { fmt, fmtDate, diasHasta, diasHastaNum, getUrgenciaColor, CATEGORIA_ICONO, FRECUENCIA_LABEL } from "@/lib/utils";
import { UrgenciaBadge } from "@/components/ui";
import type { Compromiso } from "@/types";

interface CompromisoCardProps {
    compromiso: Compromiso;
    index: number;
    totalItems: number;
    onClick: () => void;
}

export default function CompromisoCard({ compromiso: c, index, totalItems, onClick }: CompromisoCardProps) {
    const dias = diasHastaNum(c.proximaFecha);
    const color = getUrgenciaColor(dias);

    return (
        <div
            style={{
                cursor: "pointer",
                borderLeft: `3px solid ${color}`,
                borderBottom: index < totalItems - 1 ? "1px solid var(--color-border)" : "none",
                padding: "var(--space-3) var(--space-4)",
                background: "var(--color-bg-card)",
            }}
            onClick={onClick}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-bg-elevated)",
                        display: "grid", placeItems: "center",
                        fontSize: 20, border: "1px solid var(--color-border)",
                    }}>
                        {c.icono ?? CATEGORIA_ICONO[c.categoria]}
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                            {c.nombre}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: 2 }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                {FRECUENCIA_LABEL[c.frecuencia]}
                            </p>
                            {c.esCompartido && (
                                <span style={{
                                    fontSize: "var(--text-xs)",
                                    background: "rgba(99,102,241,0.15)",
                                    color: "var(--color-primary)",
                                    padding: "1px 6px",
                                    borderRadius: 99,
                                }}>🤝 Compartido</span>
                            )}
                            {c.compartidoCon && c.compartidoCon.length > 0 && !c.esCompartido && (
                                <span style={{
                                    fontSize: "var(--text-xs)",
                                    background: "rgba(34,197,94,0.15)",
                                    color: "var(--color-success)",
                                    padding: "1px 6px",
                                    borderRadius: 99,
                                }}>👥 {c.compartidoCon.length}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                        {fmt(c.monto)}
                    </p>
                    <UrgenciaBadge dias={dias} />
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "var(--text-xs)", color }}>
                    {diasHasta(c.proximaFecha)} · {fmtDate(c.proximaFecha)}
                </p>
            </div>

            <div style={{
                height: 3, borderRadius: 2, marginTop: "var(--space-2)",
                background: `${color}22`, overflow: "hidden",
            }}>
                <div style={{
                    height: "100%",
                    width: dias <= 0 ? "100%" : `${Math.max(5, 100 - (dias / 30) * 100)}%`,
                    background: color, borderRadius: 2,
                }} />
            </div>
        </div>
    );
}
