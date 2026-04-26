"use client";
import { useStore } from "@/store";
import { diasHastaNum } from "@/lib/utils";
import DashboardHero from "./dashboard/DashboardHero";
import ProximosPagosList from "./dashboard/ProximosPagosList";

export default function DashboardScreen() {
    const { compromisos, getDashboardStats, setActiveTab, setCategoriaAbierta, settings } = useStore();
    const stats = getDashboardStats();

    const hoy = new Date();
    const hora = hoy.getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    const nombre = settings.nombreUsuario || "usuario";

    const activos = compromisos.filter((c) => c.estado === "activo");
    hoy.setHours(0, 0, 0, 0);

    const proximos = activos
        .filter((c) => {
            const fecha = new Date(c.proximaFecha + "T00:00:00");
            const dias = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
            return dias <= (c.diasAntes ?? 3);
        })
        .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha));

    const heroStats = [
        { label: "Próximos", value: stats.proximosVencer, color: "#f59e0b", icon: "⏰" },
        { label: "Vencidos", value: stats.vencidos, color: "#ef4444", icon: "🚨" },
        { label: "Pagados", value: stats.pagadosEsteMes, color: "#22c55e", icon: "✅" },
    ];

    return (
        <div className="page fade-in" style={{ gap: "var(--space-5)" }}>
            <DashboardHero
                saludo={saludo}
                nombre={nombre}
                totalMensual={stats.totalMensual}
                stats={heroStats}
            />
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
