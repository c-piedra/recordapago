"use client";
import { useState } from "react";
import { useStore } from "@/store";
import DashboardHero from "./dashboard/DashboardHero";
import ProximosPagosList from "./dashboard/ProximosPagosList";
import SaludFinancieraCard from "./dashboard/SaludFinancieraCard";
import ResumenMesCard from "./dashboard/ResumenMesCard";
import MetasResumenCard from "./dashboard/MetasResumenCard";
import { fmt } from "@/lib/utils";
import type { Compromiso, HistorialPago, CuentaAhorroAporte } from "@/types";

type StatFilter = "proximos" | "vencidos" | "pagados" | null;

export default function DashboardScreen() {
    const {
        compromisos, historial, metas, cuentaAhorroAportes,
        getDashboardStats, getFinanzasStats,
        setActiveTab, setCategoriaAbierta,
        settings, userId, tipoCambio,
    } = useStore();

    const [statFilter, setStatFilter] = useState<StatFilter>(null);

    const stats = getDashboardStats();
    const finanzas = getFinanzasStats();

    const hoy = new Date();
    const hora = hoy.getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    const nombre = settings.nombreUsuario || "usuario";

    const activos = compromisos.filter((c) => c.estado === "activo");
    const hoyMidnight = new Date(hoy); hoyMidnight.setHours(0, 0, 0, 0);
    const hoyStr = hoyMidnight.toISOString().split("T")[0];

    const proximosList = activos
        .filter((c) => {
            const fecha = new Date(c.proximaFecha + "T00:00:00");
            const dias = Math.round((fecha.getTime() - hoyMidnight.getTime()) / (1000 * 60 * 60 * 24));
            return dias >= 0 && dias <= (c.diasAntes ?? 3);
        })
        .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha));

    const vencidosList = activos
        .filter((c) => c.proximaFecha < hoyStr)
        .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha));

    const mesActual = hoy.toISOString().slice(0, 7); // YYYY-MM
    const pagadosList = historial.filter((h) => h.fecha.startsWith(mesActual));
    const ahorrosMes = cuentaAhorroAportes.filter((a) => a.fecha.startsWith(mesActual));

    const heroStats = [
        {
            label: "Próximos", value: stats.proximosVencer, color: "#f59e0b", icon: "⏰",
            onClick: () => setStatFilter("proximos"),
        },
        {
            label: "Vencidos", value: stats.vencidos, color: "#ef4444", icon: "🚨",
            onClick: () => setStatFilter("vencidos"),
        },
        {
            label: "Pagados", value: stats.pagadosEsteMes, color: "#22c55e", icon: "✅",
            onClick: () => setStatFilter("pagados"),
        },
    ];

    return (
        <div className="page fade-in" style={{ gap: "var(--space-4)" }}>

            {/* Alerta urgente — solo si hay vencidos */}
            {vencidosList.length > 0 && (
                <div
                    onClick={() => setStatFilter("vencidos")}
                    style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid #ef4444",
                        borderRadius: "var(--radius-lg)",
                        padding: "var(--space-3) var(--space-4)",
                        display: "flex", alignItems: "center", gap: "var(--space-3)",
                        cursor: "pointer",
                    }}
                >
                    <span style={{ fontSize: 22 }}>🚨</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "#ef4444" }}>
                            {vencidosList.length === 1
                                ? `${vencidosList[0].nombre} está vencido`
                                : `${vencidosList.length} compromisos vencidos`}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            Tocá para ver y marcar como pagado
                        </p>
                    </div>
                    <span style={{ color: "#ef4444", fontSize: "var(--text-lg)" }}>→</span>
                </div>
            )}

            {/* Hero */}
            <DashboardHero
                saludo={saludo}
                nombre={nombre}
                totalMensual={stats.totalMensual}
                disponible={finanzas.disponible}
                porcentajeGastado={finanzas.porcentajeGastado}
                stats={heroStats}
            />

            {/* Salud financiera — solo si tiene salario configurado */}
            {finanzas.salarioMensual > 0 && (
                <SaludFinancieraCard
                    salarioMensual={finanzas.salarioMensual}
                    totalCompromisos={finanzas.totalCompromisos}
                    disponible={finanzas.disponible}
                    porcentajeGastado={finanzas.porcentajeGastado}
                    capacidadAhorro={finanzas.capacidadAhorro}
                    onVerFinanzas={() => setActiveTab("finanzas")}
                />
            )}

            {/* Resumen del mes */}
            <ResumenMesCard
                historial={historial}
                compromisos={compromisos}
                userId={userId}
                onVerHistorial={() => setActiveTab("mas")}
            />

            {/* Metas activas */}
            <MetasResumenCard
                metas={metas}
                ahorroMensual={Math.max(0, finanzas.disponible)}
                tipoCambio={tipoCambio}
                onVerMetas={() => setActiveTab("proyectos")}
            />

            {/* Próximos pagos */}
            <ProximosPagosList
                proximos={proximosList}
                onVerTodos={() => setActiveTab("compromisos")}
                onClickCompromiso={(categoria) => {
                    setCategoriaAbierta(categoria);
                    setActiveTab("compromisos");
                }}
            />

            {/* Sheet de stats */}
            {statFilter && (
                <StatSheet
                    filter={statFilter}
                    proximos={proximosList}
                    vencidos={vencidosList}
                    pagados={pagadosList}
                    ahorros={ahorrosMes}
                    onClose={() => setStatFilter(null)}
                    onIrACompromisos={() => { setStatFilter(null); setActiveTab("compromisos"); }}
                />
            )}
        </div>
    );
}

// ─── Sheet de detalle de stat ──────────────────────────────────────────────────
function StatSheet({
    filter, proximos, vencidos, pagados, ahorros, onClose, onIrACompromisos,
}: {
    filter: StatFilter;
    proximos: Compromiso[];
    vencidos: Compromiso[];
    pagados: HistorialPago[];
    ahorros: CuentaAhorroAporte[];
    onClose: () => void;
    onIrACompromisos: () => void;
}) {
    const hoy = new Date();
    const hoyMidnight = new Date(hoy); hoyMidnight.setHours(0, 0, 0, 0);

    const config = {
        proximos: { icon: "⏰", title: "Próximos a vencer", color: "#f59e0b", empty: "No hay pagos próximos" },
        vencidos: { icon: "🚨", title: "Vencidos", color: "#ef4444", empty: "¡Sin vencidos! 🎉" },
        pagados:  { icon: "✅", title: "Pagados este mes", color: "#22c55e", empty: "Aún no hay pagos este mes" },
    }[filter!];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
                }}
            />
            {/* Panel */}
            <div style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 51,
                background: "var(--color-bg-elevated)",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                padding: "var(--space-5) var(--space-4) var(--space-8)",
                maxHeight: "75vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
            }}>
                {/* Handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--color-border)", margin: "0 auto var(--space-4)" }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                        {config.icon} {config.title}
                    </p>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", fontSize: 20 }}>✕</button>
                </div>

                {/* Lista */}
                <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {filter === "pagados" ? (
                        pagados.length === 0 && ahorros.length === 0 ? (
                            <p style={{ textAlign: "center", color: "var(--color-text-3)", fontSize: "var(--text-sm)", padding: "var(--space-6) 0" }}>{config.empty}</p>
                        ) : (
                            <>
                                {pagados.map((h) => (
                                    <div key={h.id} style={{
                                        background: "var(--color-bg)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "var(--space-3)",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{h.compromisoNombre}</p>
                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                {h.fecha}
                                                {h.pagadoPorNombre ? ` · ${h.pagadoPorNombre}` : ""}
                                            </p>
                                        </div>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: config.color }}>
                                            {fmt(h.monto)}
                                        </p>
                                    </div>
                                ))}
                                {ahorros.map((a) => (
                                    <div key={a.id} style={{
                                        background: "var(--color-bg)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "var(--space-3)",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        borderLeft: "3px solid #22c55e",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                            <span style={{ fontSize: 18 }}>🐷</span>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                                    {a.cuentaNombre}
                                                </p>
                                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                    {a.fecha}{a.nota ? ` · ${a.nota}` : ""} · Ahorro
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "#22c55e" }}>
                                            {fmt(a.monto)}
                                        </p>
                                    </div>
                                ))}
                            </>
                        )
                    ) : (
                        (() => {
                            const list = filter === "proximos" ? proximos : vencidos;
                            if (list.length === 0) return (
                                <p style={{ textAlign: "center", color: "var(--color-text-3)", fontSize: "var(--text-sm)", padding: "var(--space-6) 0" }}>{config.empty}</p>
                            );
                            return list.map((c) => {
                                const fecha = new Date(c.proximaFecha + "T00:00:00");
                                const dias = Math.round((fecha.getTime() - hoyMidnight.getTime()) / (1000 * 60 * 60 * 24));
                                const diasStr = dias < 0 ? `hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`
                                    : dias === 0 ? "hoy"
                                    : `en ${dias} día${dias !== 1 ? "s" : ""}`;
                                return (
                                    <div key={c.id} style={{
                                        background: "var(--color-bg)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "var(--space-3)",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        borderLeft: `3px solid ${config.color}`,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                            <span style={{ fontSize: 20 }}>{c.icono || "📋"}</span>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{c.nombre}</p>
                                                <p style={{ fontSize: "var(--text-xs)", color: config.color, fontWeight: 600 }}>{diasStr}</p>
                                            </div>
                                        </div>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                            {fmt(c.monto)}
                                        </p>
                                    </div>
                                );
                            });
                        })()
                    )}
                </div>

                {/* CTA */}
                {filter !== "pagados" && (
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "var(--space-3)" }}
                        onClick={onIrACompromisos}
                    >
                        Ir a compromisos →
                    </button>
                )}
            </div>
        </>
    );
}
