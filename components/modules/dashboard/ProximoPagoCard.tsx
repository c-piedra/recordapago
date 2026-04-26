"use client";
import { fmt, fmtDate, diasHasta, diasHastaNum, getUrgenciaColor, CATEGORIA_ICONO } from "@/lib/utils";
import type { Compromiso } from "@/types";

interface ProximoPagoCardProps {
    compromiso: Compromiso;
    index: number;
    onClick: () => void;
}

export default function ProximoPagoCard({ compromiso: c, index, onClick }: ProximoPagoCardProps) {
    const dias = diasHastaNum(c.proximaFecha);
    const color = getUrgenciaColor(dias);

    return (
        <div
            onClick={onClick}
            style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderLeft: `3px solid ${color}`,
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                cursor: "pointer",
                transition: "border-color 0.2s",
                animationDelay: `${index * 0.05}s`,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{
                        width: 42, height: 42,
                        borderRadius: "var(--radius-md)",
                        background: `${color}15`,
                        border: `1px solid ${color}30`,
                        display: "grid", placeItems: "center",
                        fontSize: 20,
                    }}>
                        {c.icono ?? CATEGORIA_ICONO[c.categoria]}
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                            {c.nombre}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color, marginTop: 2 }}>
                            {diasHasta(c.proximaFecha)}
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--color-text)", fontSize: "var(--text-base)" }}>
                        {fmt(c.monto)}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        {fmtDate(c.proximaFecha)}
                    </p>
                </div>
            </div>

            <div style={{
                height: 3, borderRadius: 2, marginTop: "var(--space-3)",
                background: `${color}20`, overflow: "hidden",
            }}>
                <div style={{
                    height: "100%",
                    width: dias <= 0 ? "100%" : `${Math.max(5, 100 - (dias / 30) * 100)}%`,
                    background: color, borderRadius: 2,
                    transition: "width 0.5s ease",
                }} />
            </div>
        </div>
    );
}
