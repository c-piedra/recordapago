"use client";
import { useStore } from "@/store";
import { fmt, fmtDate, diasHasta, diasHastaNum, getUrgenciaColor, CATEGORIA_ICONO, FRECUENCIA_LABEL } from "@/lib/utils";
import { UrgenciaBadge } from "@/components/ui";

export default function DashboardScreen() {
    const { compromisos, getDashboardStats, setActiveTab, settings } = useStore();
    const stats = getDashboardStats();

    const hoy = new Date();
    const hora = hoy.getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    const nombre = settings.nombreUsuario || "usuario";

    const activos = compromisos.filter((c) => c.estado === "activo");
    const proximos = activos
        .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha))
        .slice(0, 5);

    const urgentes = activos.filter((c) => diasHastaNum(c.proximaFecha) <= 5);

    return (
        <div className="page fade-in" style={{ gap: "var(--space-5)" }}>

            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #1a1040 0%, #0f1627 60%, #0a0f1e 100%)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-6)",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Glow */}
                <div style={{
                    position: "absolute", top: -40, right: -40,
                    width: 180, height: 180,
                    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: -20, left: -20,
                    width: 120, height: 120,
                    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 2 }}>
                    {saludo}, <span style={{ color: "var(--color-text-2)", fontWeight: 600 }}>{nombre}</span> 👋
                </p>
                <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: "var(--text-xs)", color: "var(--color-text-3)",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    marginBottom: "var(--space-3)",
                }}>
                    Total compromisos / mes
                </p>
                <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: 44, color: "var(--color-text)",
                    lineHeight: 1, marginBottom: "var(--space-5)",
                }}>
                    <span style={{ color: "var(--color-primary)" }}>{fmt(stats.totalMensual)}</span>
                </p>

                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "var(--space-2)",
                }}>
                    {[
                        { label: "Próximos", value: stats.proximosVencer, color: "#f59e0b", icon: "⏰" },
                        { label: "Vencidos", value: stats.vencidos, color: "#ef4444", icon: "🚨" },
                        { label: "Pagados", value: stats.pagadosEsteMes, color: "#22c55e", icon: "✅" },
                    ].map(({ label, value, color, icon }) => (
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
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerta urgentes */}
            {urgentes.length > 0 && (
                <div style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--space-4) var(--space-5)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                        <span style={{ fontSize: 18 }}>🚨</span>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#ef4444" }}>
                            {urgentes.length} pago{urgentes.length > 1 ? "s" : ""} requiere{urgentes.length > 1 ? "n" : ""} atención
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {urgentes.map((c) => {
                            const dias = diasHastaNum(c.proximaFecha);
                            const color = getUrgenciaColor(dias);
                            return (
                                <div key={c.id} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    background: "rgba(0,0,0,0.2)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "var(--space-2) var(--space-3)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                        <span style={{ fontSize: 16 }}>{c.icono ?? CATEGORIA_ICONO[c.categoria]}</span>
                                        <div>
                                            <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                                                {c.nombre}
                                            </p>
                                            <p style={{ fontSize: "var(--text-xs)", color }}>
                                                {diasHasta(c.proximaFecha)}
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)", fontSize: "var(--text-sm)" }}>
                                        {fmt(c.monto)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Próximos pagos */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                    <p className="section-title">Próximos pagos</p>
                    <button
                        className="btn btn-ghost"
                        style={{ fontSize: "var(--text-xs)", padding: "4px 10px", minHeight: 0 }}
                        onClick={() => setActiveTab("compromisos")}
                    >
                        Ver todos →
                    </button>
                </div>

                {proximos.length === 0 ? (
                    <div style={{
                        background: "var(--color-bg-card)",
                        border: "1px dashed var(--color-border-2)",
                        borderRadius: "var(--radius-xl)",
                        padding: "var(--space-8)",
                        textAlign: "center",
                    }}>
                        <p style={{ fontSize: 40, marginBottom: "var(--space-3)" }}>💳</p>
                        <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-2)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                            Sin compromisos aún
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-5)" }}>
                            Registrá tus pagos recurrentes y nunca más olvidés una fecha
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            onClick={() => setActiveTab("compromisos")}
                        >
                            + Agregar primer compromiso
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {proximos.map((c, i) => {
                            const dias = diasHastaNum(c.proximaFecha);
                            const color = getUrgenciaColor(dias);
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => setActiveTab("compromisos")}
                                    style={{
                                        background: "var(--color-bg-card)",
                                        border: "1px solid var(--color-border)",
                                        borderLeft: `3px solid ${color}`,
                                        borderRadius: "var(--radius-lg)",
                                        padding: "var(--space-4)",
                                        cursor: "pointer",
                                        transition: "border-color 0.2s",
                                        animationDelay: `${i * 0.05}s`,
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

                                    {/* Urgency bar */}
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
                        })}
                    </div>
                )}
            </div>



        </div>
    );
}