"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/store";
import DashboardHero from "./dashboard/DashboardHero";
import ProximosPagosList from "./dashboard/ProximosPagosList";
import SaludFinancieraCard from "./dashboard/SaludFinancieraCard";
import ResumenMesCard from "./dashboard/ResumenMesCard";
import MetasResumenCard from "./dashboard/MetasResumenCard";
import { ConfirmDialog } from "@/components/ui";
import { fmt } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import type { Compromiso, HistorialPago, CuentaAhorroAporte } from "@/types";

type StatFilter = "proximos" | "vencidos" | "pagados" | null;

// ─── Swipe-to-delete ──────────────────────────────────────────────────────────
function SwipeToDelete({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
    const [offsetX, setOffsetX] = useState(0);
    const startX = useRef(0);
    const isDragging = useRef(false);
    const REVEAL = -72;
    const THRESHOLD = -50;

    const onTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        isDragging.current = true;
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const dx = e.touches[0].clientX - startX.current;
        setOffsetX(Math.max(REVEAL, Math.min(0, dx)));
    };
    const onTouchEnd = () => {
        isDragging.current = false;
        setOffsetX(offsetX <= THRESHOLD ? REVEAL : 0);
    };

    return (
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-md)" }}>
            {/* Red delete strip */}
            <div
                onClick={onDelete}
                style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, width: Math.abs(REVEAL),
                    background: "#ef4444", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                }}
            >
                <Trash2 size={16} color="white" />
                <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>Eliminar</span>
            </div>
            {/* Item */}
            <div
                style={{
                    transform: `translateX(${offsetX}px)`,
                    transition: isDragging.current ? "none" : "transform 0.2s ease",
                    position: "relative", zIndex: 1,
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}

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

    const mesActual = hoy.toISOString().slice(0, 7);
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

            <DashboardHero
                saludo={saludo}
                nombre={nombre}
                totalMensual={stats.totalMensual}
                disponible={finanzas.disponible}
                porcentajeGastado={finanzas.porcentajeGastado}
                stats={heroStats}
            />

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

            <ResumenMesCard
                historial={historial}
                compromisos={compromisos}
                userId={userId}
                onVerHistorial={() => setActiveTab("mas")}
            />

            <MetasResumenCard
                metas={metas}
                ahorroMensual={Math.max(0, finanzas.disponible)}
                tipoCambio={tipoCambio}
                onVerMetas={() => setActiveTab("proyectos")}
            />

            <ProximosPagosList
                proximos={proximosList}
                onVerTodos={() => setActiveTab("compromisos")}
                onClickCompromiso={(categoria) => {
                    setCategoriaAbierta(categoria);
                    setActiveTab("compromisos");
                }}
            />

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
    const { deleteHistorial, deleteCuentaAhorroAporte } = useStore();
    const [confirmLimpiar, setConfirmLimpiar] = useState(false);

    // Bloquear scroll del body mientras el sheet está abierto
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    const hoy = new Date();
    const hoyMidnight = new Date(hoy); hoyMidnight.setHours(0, 0, 0, 0);

    const config = {
        proximos: { icon: "⏰", title: "Próximos a vencer", color: "#f59e0b", empty: "No hay pagos próximos" },
        vencidos: { icon: "🚨", title: "Vencidos", color: "#ef4444", empty: "¡Sin vencidos! 🎉" },
        pagados:  { icon: "✅", title: "Pagados este mes", color: "#22c55e", empty: "Aún no hay pagos este mes" },
    }[filter!];

    const handleLimpiarMes = async () => {
        for (const h of pagados) await deleteHistorial(h.id);
        for (const a of ahorros) await deleteCuentaAhorroAporte(a.id, a.cuentaId, a.monto);
        setConfirmLimpiar(false);
    };

    const hayPagados = pagados.length > 0 || ahorros.length > 0;

    if (typeof window === "undefined") return null;

    const content = (
        <>
            {/* Backdrop — toca para cerrar */}
            <div
                onClick={onClose}
                onTouchMove={(e) => e.preventDefault()}
                style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }}
            />

            {/* Panel */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 81,
                    background: "var(--color-bg-elevated)",
                    borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                    border: "1px solid var(--color-border)",
                    borderBottom: "none",
                    paddingTop: "var(--space-4)",
                    paddingLeft: "var(--space-4)",
                    paddingRight: "var(--space-4)",
                    paddingBottom: "calc(var(--space-8) + env(safe-area-inset-bottom, 0px))",
                    maxHeight: "88dvh",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
                }}
            >
                {/* Handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--color-border)", margin: "0 auto var(--space-4)", flexShrink: 0 }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                        {config.icon} {config.title}
                    </p>
                    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                        {filter === "pagados" && hayPagados && (
                            <button
                                onClick={() => setConfirmLimpiar(true)}
                                style={{
                                    background: "none", border: "1px solid var(--color-border)",
                                    borderRadius: "var(--radius-md)", cursor: "pointer",
                                    color: "var(--color-text-3)", padding: "4px 10px",
                                    display: "flex", alignItems: "center", gap: 5, fontSize: 11,
                                }}
                            >
                                <Trash2 size={12} /> Limpiar mes
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", fontSize: 20, padding: "0 4px" }}>✕</button>
                    </div>
                </div>

                {/* Hint swipe */}
                {filter === "pagados" && hayPagados && (
                    <p style={{ fontSize: 10, color: "var(--color-text-3)", marginBottom: "var(--space-2)", textAlign: "center", flexShrink: 0 }}>
                        ← Deslizá un ítem hacia la izquierda para eliminarlo
                    </p>
                )}

                {/* Lista — scroll contenido aquí */}
                <div style={{
                    overflowY: "auto",
                    flex: 1,
                    display: "flex", flexDirection: "column", gap: "var(--space-2)",
                    WebkitOverflowScrolling: "touch" as any,
                    overscrollBehavior: "contain",
                }}>
                    {filter === "pagados" ? (
                        !hayPagados ? (
                            <p style={{ textAlign: "center", color: "var(--color-text-3)", fontSize: "var(--text-sm)", padding: "var(--space-6) 0" }}>{config.empty}</p>
                        ) : (
                            <>
                                {pagados.map((h) => (
                                    <SwipeToDelete key={h.id} onDelete={() => deleteHistorial(h.id)}>
                                        <div style={{
                                            background: "var(--color-bg)", padding: "var(--space-3)",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{h.compromisoNombre}</p>
                                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                    {h.fecha}{h.pagadoPorNombre ? ` · ${h.pagadoPorNombre}` : ""}
                                                </p>
                                            </div>
                                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: config.color }}>
                                                {fmt(h.monto)}
                                            </p>
                                        </div>
                                    </SwipeToDelete>
                                ))}
                                {ahorros.map((a) => (
                                    <SwipeToDelete key={a.id} onDelete={() => deleteCuentaAhorroAporte(a.id, a.cuentaId, a.monto)}>
                                        <div style={{
                                            background: "var(--color-bg)", padding: "var(--space-3)",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            borderLeft: "3px solid #22c55e",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                <span style={{ fontSize: 18 }}>🐷</span>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{a.cuentaNombre}</p>
                                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                        {a.fecha}{a.nota ? ` · ${a.nota}` : ""} · Ahorro
                                                    </p>
                                                </div>
                                            </div>
                                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "#22c55e" }}>
                                                {fmt(a.monto)}
                                            </p>
                                        </div>
                                    </SwipeToDelete>
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
                                        background: "var(--color-bg)", borderRadius: "var(--radius-md)", padding: "var(--space-3)",
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
                        style={{ width: "100%", marginTop: "var(--space-3)", flexShrink: 0 }}
                        onClick={onIrACompromisos}
                    >
                        Ir a compromisos →
                    </button>
                )}
            </div>

            {confirmLimpiar && (
                <ConfirmDialog
                    message="¿Limpiar todos los registros de pagados este mes? Esta acción no se puede deshacer."
                    onConfirm={handleLimpiarMes}
                    onCancel={() => setConfirmLimpiar(false)}
                />
            )}
        </>
    );

    return createPortal(content, document.body);
}
