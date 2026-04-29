"use client";
import { fmt } from "@/lib/utils";

interface StatItem {
    label: string;
    value: number;
    color: string;
    icon: string;
}

interface DashboardHeroProps {
    saludo: string;
    nombre: string;
    totalMensual: number;
    disponible: number;
    porcentajeGastado: number;
    stats: StatItem[];
}

export default function DashboardHero({ saludo, nombre, totalMensual, disponible, porcentajeGastado, stats }: DashboardHeroProps) {
    const barColor = porcentajeGastado >= 80 ? "#ef4444"
        : porcentajeGastado >= 60 ? "#f59e0b"
        : "#22c55e";

    return (
        <div style={{
            background: "linear-gradient(135deg, #1a1040 0%, #0f1627 60%, #0a0f1e 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Decos */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 2 }}>
                {saludo}, <span style={{ color: "var(--color-text-2)", fontWeight: 600 }}>{nombre}</span> 👋
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xs)", color: "var(--color-text-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "var(--space-2)" }}>
                Comprometido este mes
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 44, color: "var(--color-text)", lineHeight: 1, marginBottom: "var(--space-2)" }}>
                <span style={{ color: "var(--color-primary)" }}>{fmt(totalMensual)}</span>
            </p>

            {/* Disponible */}
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-3)" }}>
                Disponible:{" "}
                <span style={{ fontWeight: 700, color: disponible >= 0 ? "#22c55e" : "#ef4444" }}>
                    {fmt(Math.abs(disponible))}{disponible < 0 ? " (negativo)" : ""}
                </span>
            </p>

            {/* Barra de salud */}
            {porcentajeGastado > 0 && (
                <div style={{ marginBottom: "var(--space-5)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>0%</span>
                        <span style={{ fontSize: 10, color: barColor, fontWeight: 700 }}>{porcentajeGastado}% comprometido</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>100%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, porcentajeGastado)}%`, background: barColor, borderRadius: 3, transition: "width 0.6s ease" }} />
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)" }}>
                {stats.map(({ label, value, color, icon }) => (
                    <div key={label} style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3)",
                        textAlign: "center",
                        border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                        <p style={{ fontSize: 18, marginBottom: 2 }}>{icon}</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-2xl)", color }}>
                            {value}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
