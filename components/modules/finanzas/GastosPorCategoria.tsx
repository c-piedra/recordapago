"use client";
import { useState } from "react";
import { fmt, CATEGORIA_LABEL, CATEGORIA_ICONO } from "@/lib/utils";

interface GastosPorCategoriaProps {
    porCategoria: Record<string, number>;
    salarioMensual: number;
    disponible: number;
    metaAhorro?: number | null;
    onSetMetaAhorro: (pct: number | null) => void;
}

export default function GastosPorCategoria({
    porCategoria, salarioMensual, disponible, metaAhorro, onSetMetaAhorro,
}: GastosPorCategoriaProps) {
    const [editandoMeta, setEditandoMeta] = useState(false);
    const [metaInput, setMetaInput] = useState(String(metaAhorro ?? ""));

    const ahorroMonto = Math.max(0, disponible);
    const ahorroPct = salarioMensual > 0 ? Math.round((ahorroMonto / salarioMensual) * 100) : 0;

    // ¿Cuánto falta o sobra respecto a la meta?
    const tieneMeta = metaAhorro != null && metaAhorro > 0;
    const cumpleMeta = tieneMeta && ahorroPct >= metaAhorro!;
    const metaMonto = tieneMeta ? Math.round(salarioMensual * metaAhorro! / 100) : 0;

    // Progreso de la barra:
    // Con meta: llena según cuánto del objetivo se cumple (tope 100%)
    // Sin meta: llena según % del salario disponible
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

    const handleGuardarMeta = () => {
        const val = parseInt(metaInput);
        if (!metaInput || isNaN(val) || val < 1 || val > 100) return;
        onSetMetaAhorro(val);
        setEditandoMeta(false);
    };

    const handleQuitarMeta = () => {
        onSetMetaAhorro(null);
        setMetaInput("");
        setEditandoMeta(false);
    };

    const abrirEdicion = () => {
        setMetaInput(String(metaAhorro ?? ""));
        setEditandoMeta(true);
    };

    return (
        <div>
            <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Gastos por categoría</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-3)" }}>
                La barra muestra qué % de tu salario va a cada categoría.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>

                {/* Categorías de gastos */}
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

                {/* Fila de Ahorro */}
                <div style={{
                    background: "var(--color-bg-elevated)",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-3) var(--space-4)",
                }}>
                    {/* Fila principal */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                            <span style={{ fontSize: 20 }}>🏦</span>
                            <div>
                                <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                                    Ahorro
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: barColor }}>
                                    {ahorroPct}% disponible
                                    {tieneMeta && (
                                        <span style={{ color: "var(--color-text-3)" }}>
                                            {" · "}meta: {metaAhorro}% ({fmt(metaMonto)}){cumpleMeta ? " ✅" : " ⚠️"}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <p style={{
                            fontFamily: "var(--font-display)", fontWeight: 700,
                            color: disponible >= 0 ? "var(--color-success)" : "var(--color-danger)",
                            fontSize: "var(--text-sm)",
                        }}>
                            {disponible < 0 ? "−" : ""}{fmt(ahorroMonto)}
                        </p>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ height: 6, borderRadius: 3, background: "var(--color-bg)", overflow: "hidden", marginBottom: "var(--space-3)" }}>
                        <div style={{
                            height: "100%", width: `${barWidth}%`,
                            background: barColor, borderRadius: 3,
                            transition: "width 0.5s ease",
                        }} />
                    </div>

                    {/* Botón de meta o editor inline */}
                    {!editandoMeta ? (
                        <button
                            onClick={abrirEdicion}
                            style={{
                                width: "100%", minHeight: 38,
                                background: "var(--color-primary)", color: "#fff",
                                border: "none", borderRadius: "var(--radius-md)",
                                fontSize: "var(--text-sm)", fontWeight: 600,
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 6,
                            }}
                        >
                            {tieneMeta ? `✏️ Cambiar meta de ahorro · ${metaAhorro}%` : "🎯 Fijar mi meta de ahorro"}
                        </button>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                ¿Qué % de tu salario querés ahorrar cada mes?
                            </p>
                            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                                <input
                                    className="input"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={metaInput}
                                    onChange={(e) => setMetaInput(e.target.value)}
                                    placeholder="Ej: 20"
                                    style={{ flex: 1, minHeight: 40, fontSize: "var(--text-base)", fontWeight: 700, textAlign: "center" }}
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === "Enter") handleGuardarMeta(); if (e.key === "Escape") setEditandoMeta(false); }}
                                />
                                <span style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-3)" }}>%</span>
                            </div>
                            <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                <button className="btn btn-primary" style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }} onClick={handleGuardarMeta}>
                                    Guardar
                                </button>
                                <button className="btn btn-ghost" style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }} onClick={() => setEditandoMeta(false)}>
                                    Cancelar
                                </button>
                                {tieneMeta && (
                                    <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", minHeight: 36, color: "var(--color-danger)" }} onClick={handleQuitarMeta}>
                                        Quitar
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
