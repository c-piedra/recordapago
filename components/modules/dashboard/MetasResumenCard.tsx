"use client";
import { useState } from "react";
import type { MetaProyecto } from "@/types";

interface MetasResumenCardProps {
    metas: MetaProyecto[];
    ahorroMensual: number;
    tipoCambio: number;
    onVerMetas: () => void;
}

function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function MetaRow({
    meta, ahorroMensual, tipoCambio, onVerMetas,
}: { meta: MetaProyecto; ahorroMensual: number; tipoCambio: number; onVerMetas: () => void }) {
    const objetivoCRC = meta.moneda === "USD" ? meta.montoObjetivo * tipoCambio : meta.montoObjetivo;
    const acumulado = meta.montoAcumulado ?? 0;
    const pct = objetivoCRC > 0 ? Math.min(100, Math.round((acumulado / objetivoCRC) * 100)) : 0;
    const restante = Math.max(0, objetivoCRC - acumulado);

    const ahorro = (meta.ahorroPersonalizado && meta.ahorroPersonalizado > 0)
        ? meta.ahorroPersonalizado
        : ahorroMensual;
    const meses = ahorro > 0 && restante > 0 ? Math.ceil(restante / ahorro) : restante === 0 ? 0 : null;
    const fecha = meses !== null && meses > 0 ? addMonths(new Date(), meses) : null;
    const fechaStr = fecha
        ? fecha.toLocaleDateString("es-CR", { month: "short", year: "numeric" })
        : meses === 0 ? "¡Cumplida!" : "—";

    const barColor = pct >= 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "var(--color-primary)";

    return (
        <div
            onClick={onVerMetas}
            style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                padding: "10px 0",
                cursor: "pointer",
            }}
        >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{meta.icono || "🎯"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <p style={{
                        fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {meta.nombre}
                    </p>
                    <span style={{ fontSize: 11, color: "var(--color-text-3)", flexShrink: 0, marginLeft: 8 }}>
                        {pct >= 100 ? "🎉 Completa" : `${pct}%`}
                    </span>
                </div>
                {/* Progress bar */}
                <div style={{
                    height: 4, borderRadius: 2,
                    background: "var(--color-border)",
                    marginBottom: 4,
                }}>
                    <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${pct}%`,
                        background: barColor,
                        transition: "width 0.3s ease",
                    }} />
                </div>
                <p style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                    {pct >= 100 ? "Meta alcanzada 🎉" : meses !== null
                        ? `${meses} mes${meses !== 1 ? "es" : ""} · ${fechaStr}`
                        : "Sin ahorro asignado"}
                </p>
            </div>
        </div>
    );
}

export default function MetasResumenCard({ metas, ahorroMensual, tipoCambio, onVerMetas }: MetasResumenCardProps) {
    const [expandido, setExpandido] = useState(false);

    if (metas.length === 0) return null;

    // La primera meta es la "principal" visible siempre
    const principal = metas[0];
    const resto = metas.slice(1);
    const hayMas = resto.length > 0;

    return (
        <div style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-1)" }}>
                <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                    🏆 Mis metas
                    {metas.length > 1 && (
                        <span style={{
                            marginLeft: 8, fontSize: 10,
                            background: "var(--color-bg)",
                            color: "var(--color-text-3)",
                            borderRadius: 99, padding: "1px 7px",
                            border: "1px solid var(--color-border)",
                        }}>
                            {metas.length}
                        </span>
                    )}
                </p>
                <button
                    className="btn btn-ghost"
                    style={{ fontSize: "var(--text-xs)", padding: "4px 10px", minHeight: 0 }}
                    onClick={onVerMetas}
                >
                    Ver todas →
                </button>
            </div>

            {/* Meta principal — siempre visible */}
            <MetaRow meta={principal} ahorroMensual={ahorroMensual} tipoCambio={tipoCambio} onVerMetas={onVerMetas} />

            {/* Resto — colapsable */}
            {hayMas && (
                <>
                    {expandido && (
                        <div style={{ borderTop: "1px solid var(--color-border)" }}>
                            {resto.map((m) => (
                                <div key={m.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <MetaRow meta={m} ahorroMensual={ahorroMensual} tipoCambio={tipoCambio} onVerMetas={onVerMetas} />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); setExpandido((v) => !v); }}
                        style={{
                            width: "100%",
                            marginTop: "var(--space-1)",
                            padding: "6px",
                            background: "var(--color-bg)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-3)",
                            fontSize: 11,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}
                    >
                        {expandido ? `▲ Ocultar` : `▼ Ver ${resto.length} meta${resto.length !== 1 ? "s" : ""} más`}
                    </button>
                </>
            )}
        </div>
    );
}
