"use client";
import { useState } from "react";
import { fmt } from "@/lib/utils";

interface AhorroCardProps {
    salarioMensual: number;
    disponible: number;
    metaAhorro?: number | null;
    onSetMetaAhorro: (pct: number | null) => void;
}

export default function AhorroCard({ salarioMensual, disponible, metaAhorro, onSetMetaAhorro }: AhorroCardProps) {
    const [editando, setEditando] = useState(false);
    const [metaInput, setMetaInput] = useState(String(metaAhorro ?? ""));

    const ahorroMonto = Math.max(0, disponible);
    const ahorroPct = salarioMensual > 0 ? Math.round((ahorroMonto / salarioMensual) * 100) : 0;

    const tieneMeta = metaAhorro != null && metaAhorro > 0;
    const metaMonto = tieneMeta ? Math.round(salarioMensual * metaAhorro! / 100) : 0;
    const cumpleMeta = tieneMeta && ahorroPct >= metaAhorro!;

    const barWidth = tieneMeta
        ? Math.min(100, Math.round((ahorroMonto / metaMonto) * 100))
        : Math.min(100, ahorroPct);

    const barColor = disponible < 0
        ? "var(--color-danger)"
        : tieneMeta
            ? cumpleMeta ? "var(--color-success)" : ahorroPct >= metaAhorro! * 0.7 ? "var(--color-warning)" : "var(--color-danger)"
            : ahorroPct >= 10 ? "var(--color-success)" : ahorroPct > 0 ? "var(--color-warning)" : "var(--color-danger)";

    const borderColor = disponible < 0
        ? "var(--color-danger)"
        : tieneMeta && cumpleMeta ? "var(--color-success)" : "var(--color-border)";

    const handleGuardar = () => {
        const val = parseInt(metaInput);
        if (!metaInput || isNaN(val) || val < 1 || val > 100) return;
        onSetMetaAhorro(val);
        setEditando(false);
    };

    const handleQuitar = () => {
        onSetMetaAhorro(null);
        setMetaInput("");
        setEditando(false);
    };

    // Quick picks
    const quickPcts = [5, 10, 15, 20, 25, 30];

    return (
        <div style={{
            background: "var(--color-bg-elevated)",
            border: `1px solid ${borderColor}`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
        }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <span style={{ fontSize: 22 }}>🏦</span>
                    <div>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                            Ahorro disponible
                        </p>
                        <p style={{ fontSize: 11, color: barColor }}>
                            {ahorroPct}% del salario
                            {tieneMeta && (
                                <span style={{ color: "var(--color-text-3)" }}>
                                    {" · "}meta {metaAhorro}% ({fmt(metaMonto)}) {cumpleMeta ? "✅" : "⚠️"}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)",
                    color: disponible >= 0 ? "var(--color-success)" : "var(--color-danger)",
                }}>
                    {disponible < 0 ? "−" : ""}{fmt(ahorroMonto)}
                </p>
            </div>

            {/* Barra */}
            <div style={{ height: 6, borderRadius: 3, background: "var(--color-bg)", overflow: "hidden", marginBottom: "var(--space-3)" }}>
                <div style={{ height: "100%", width: `${barWidth}%`, background: barColor, borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>

            {/* Botón / editor */}
            {!editando ? (
                <button
                    onClick={() => { setMetaInput(String(metaAhorro ?? "")); setEditando(true); }}
                    style={{
                        width: "100%", minHeight: 36,
                        background: tieneMeta ? "var(--color-bg)" : "var(--color-primary)",
                        color: tieneMeta ? "var(--color-text-2)" : "#fff",
                        border: tieneMeta ? "1px solid var(--color-border)" : "none",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                >
                    {tieneMeta ? `✏️ Meta de ahorro · ${metaAhorro}%` : "🎯 Fijar meta de ahorro"}
                </button>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
                        ¿Qué % de tu salario querés ahorrar?
                    </p>
                    {/* Quick picks */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {quickPcts.map((p) => (
                            <button
                                key={p}
                                onClick={() => setMetaInput(String(p))}
                                style={{
                                    padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    background: metaInput === String(p) ? "var(--color-primary)" : "var(--color-bg)",
                                    color: metaInput === String(p) ? "#fff" : "var(--color-text-3)",
                                    border: `1px solid ${metaInput === String(p) ? "var(--color-primary)" : "var(--color-border)"}`,
                                }}
                            >
                                {p}%
                            </button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                        <input
                            className="input"
                            type="number" min={1} max={100}
                            value={metaInput}
                            onChange={(e) => setMetaInput(e.target.value)}
                            placeholder="Ej: 20"
                            style={{ flex: 1, minHeight: 40, fontSize: "var(--text-base)", fontWeight: 700, textAlign: "center" }}
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") handleGuardar(); if (e.key === "Escape") setEditando(false); }}
                        />
                        <span style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-3)" }}>%</span>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <button className="btn btn-primary" style={{ flex: 1, fontSize: 13, minHeight: 36 }} onClick={handleGuardar}>
                            Guardar
                        </button>
                        <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13, minHeight: 36 }} onClick={() => setEditando(false)}>
                            Cancelar
                        </button>
                        {tieneMeta && (
                            <button className="btn btn-ghost" style={{ fontSize: 13, minHeight: 36, color: "var(--color-danger)" }} onClick={handleQuitar}>
                                Quitar
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
