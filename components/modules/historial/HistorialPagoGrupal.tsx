"use client";
import { useState } from "react";
import { fmt, fmtDate, CATEGORIA_ICONO } from "@/lib/utils";
import type { HistorialPago, Compromiso } from "@/types";

interface HistorialPagoGrupalProps {
    compromisoId: string;
    compromisoNombre: string;
    compromiso?: Compromiso;
    pagos: HistorialPago[];
}

export default function HistorialPagoGrupal({ compromisoNombre, compromiso, pagos }: HistorialPagoGrupalProps) {
    const [expandido, setExpandido] = useState(false);
    const total = pagos.reduce((s, h) => s + h.monto, 0);
    const icono = compromiso?.icono ?? (compromiso ? CATEGORIA_ICONO[compromiso.categoria] : "💳");

    return (
        <div style={{ background: "var(--color-bg-card)", borderBottom: "1px solid var(--color-border)" }}>
            {/* Header del grupo */}
            <button
                onClick={() => setExpandido((v) => !v)}
                style={{
                    width: "100%", display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "var(--space-3) var(--space-4)",
                    background: "transparent", border: "none", cursor: "pointer",
                    textAlign: "left",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: "var(--radius-md)",
                        background: "var(--color-bg-elevated)",
                        display: "grid", placeItems: "center",
                        fontSize: 20, border: "1px solid var(--color-border)",
                        flexShrink: 0,
                    }}>
                        {icono}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                            {compromisoNombre}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: 2 }}>
                            <span style={{
                                fontSize: "var(--text-xs)",
                                background: "rgba(99,102,241,0.15)",
                                color: "var(--color-primary)",
                                padding: "1px 6px", borderRadius: 99,
                            }}>
                                🤝 {pagos.length} pago{pagos.length > 1 ? "s" : ""} del grupo
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-success)" }}>
                        {fmt(total)}
                    </p>
                    <span style={{
                        fontSize: 12, color: "var(--color-text-3)",
                        transform: expandido ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s", display: "inline-block",
                    }}>▼</span>
                </div>
            </button>

            {/* Sublista de pagos individuales */}
            {expandido && (
                <div style={{ borderTop: "1px solid var(--color-border)" }}>
                    {pagos.map((h, i) => (
                        <div
                            key={h.id}
                            style={{
                                padding: "var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) + 52px)",
                                borderBottom: i < pagos.length - 1 ? "1px solid var(--color-border)" : "none",
                                background: "var(--color-bg-elevated)",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    {/* Nombre de quien pagó */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 4 }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: "50%",
                                            background: "var(--color-primary)",
                                            display: "grid", placeItems: "center",
                                            fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                                        }}>
                                            {(h.pagadoPorNombre ?? "?")[0].toUpperCase()}
                                        </div>
                                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                                            {h.pagadoPorNombre ?? "Desconocido"}
                                        </p>
                                    </div>
                                    {/* Fecha y referencia */}
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                        {fmtDate(h.fecha)}{h.referencia ? ` · ${h.referencia}` : ""}
                                    </p>
                                    {h.notas && (
                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", fontStyle: "italic", marginTop: 2 }}>
                                            {h.notas}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-1)" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-success)" }}>
                                        {fmt(h.monto)}
                                    </p>
                                    {/* Foto del comprobante */}
                                    {h.comprobante && (
                                        <img
                                            src={h.comprobante}
                                            alt="Comprobante"
                                            onClick={() => window.open(h.comprobante, "_blank")}
                                            style={{
                                                width: 52, height: 52, borderRadius: "var(--radius-md)",
                                                objectFit: "cover", cursor: "pointer",
                                                border: "1px solid var(--color-border)",
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
