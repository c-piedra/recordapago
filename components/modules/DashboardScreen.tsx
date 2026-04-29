"use client";
import { useStore } from "@/store";
import DashboardHero from "./dashboard/DashboardHero";
import ProximosPagosList from "./dashboard/ProximosPagosList";
import SaludFinancieraCard from "./dashboard/SaludFinancieraCard";
import ResumenMesCard from "./dashboard/ResumenMesCard";
import MetasResumenCard from "./dashboard/MetasResumenCard";

export default function DashboardScreen() {
    const {
        compromisos, historial, metas,
        getDashboardStats, getFinanzasStats,
        setActiveTab, setCategoriaAbierta,
        settings, userId, tipoCambio,
    } = useStore();

    const stats = getDashboardStats();
    const finanzas = getFinanzasStats();

    const hoy = new Date();
    const hora = hoy.getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    const nombre = settings.nombreUsuario || "usuario";

    const activos = compromisos.filter((c) => c.estado === "activo");
    const hoyMidnight = new Date(hoy); hoyMidnight.setHours(0, 0, 0, 0);

    // Próximos según diasAntes de cada uno
    const proximos = activos
        .filter((c) => {
            const fecha = new Date(c.proximaFecha + "T00:00:00");
            const dias = Math.round((fecha.getTime() - hoyMidnight.getTime()) / (1000 * 60 * 60 * 24));
            return dias <= (c.diasAntes ?? 3);
        })
        .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha));

    // Alerta urgente si hay vencidos
    const vencidos = activos.filter((c) => c.proximaFecha < hoyMidnight.toISOString().split("T")[0]);

    const heroStats = [
        { label: "Próximos", value: stats.proximosVencer, color: "#f59e0b", icon: "⏰" },
        { label: "Vencidos",  value: stats.vencidos,       color: "#ef4444", icon: "🚨" },
        { label: "Pagados",   value: stats.pagadosEsteMes, color: "#22c55e", icon: "✅" },
    ];

    return (
        <div className="page fade-in" style={{ gap: "var(--space-4)" }}>

            {/* Alerta urgente — solo si hay vencidos */}
            {vencidos.length > 0 && (
                <div
                    onClick={() => setActiveTab("compromisos")}
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
                            {vencidos.length === 1
                                ? `${vencidos[0].nombre} está vencido`
                                : `${vencidos.length} compromisos vencidos`}
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
                proximos={proximos}
                onVerTodos={() => setActiveTab("compromisos")}
                onClickCompromiso={(categoria) => {
                    setCategoriaAbierta(categoria);
                    setActiveTab("compromisos");
                }}
            />
        </div>
    );
}
