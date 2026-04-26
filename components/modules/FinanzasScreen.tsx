"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { fmt, CATEGORIA_LABEL } from "@/lib/utils";
import type { FrecuenciaSalario } from "@/types";
import PerfilFinancieroForm from "./finanzas/PerfilFinancieroForm";
import FinanzasHero from "./finanzas/FinanzasHero";
import AlertasFinancieras from "./finanzas/AlertasFinancieras";
import GraficasSection from "./finanzas/GraficasSection";
import GastosPorCategoria from "./finanzas/GastosPorCategoria";
import ConsejoIA from "./finanzas/ConsejoIA";

const calcSalarioMensual = (salario: number, frecuencia: FrecuenciaSalario): number => {
    switch (frecuencia) {
        case "quincenal": return salario * 2;
        case "semanal": return salario * 4.33;
        default: return salario;
    }
};

type ChartTab = "distribucion" | "resumen" | "evolucion";

export default function FinanzasScreen() {
    const { settings, updatePerfil, compromisos, historial, getFinanzasStats } = useStore();
    const perfil = settings.perfil;
    const stats = getFinanzasStats();

    const [showPerfilForm, setShowPerfilForm] = useState(false);
    const [salarioInput, setSalarioInput] = useState("");
    const [frecuencia, setFrecuencia] = useState<FrecuenciaSalario>("mensual");
    const [loadingIA, setLoadingIA] = useState(false);
    const [consejoIA, setConsejoIA] = useState<string | null>(null);
    const [chartTab, setChartTab] = useState<ChartTab>("distribucion");

    useEffect(() => {
        if (!perfil) {
            setShowPerfilForm(true);
        } else {
            setSalarioInput(String(perfil.salario));
            setFrecuencia(perfil.frecuenciaSalario);
        }
    }, [perfil]);

    const handleGuardarPerfil = () => {
        if (!salarioInput) return;
        const salario = parseFloat(salarioInput);
        const salarioMensual = calcSalarioMensual(salario, frecuencia);
        updatePerfil({ salario, frecuenciaSalario: frecuencia, salarioMensual });
        setShowPerfilForm(false);
    };

    const handlePedirConsejo = async () => {
        setLoadingIA(true);
        setConsejoIA(null);
        try {
            const activos = compromisos.filter((c) => c.estado === "activo");
            const resumen = activos.map((c) =>
                `- ${c.nombre} (${CATEGORIA_LABEL[c.categoria]}): ₡${c.monto.toLocaleString("es-CR")} ${c.frecuencia}`
            ).join("\n");

            const prompt = `Sos un asesor financiero personal costarricense. El usuario tiene un salario mensual de ${fmt(stats.salarioMensual)} y los siguientes compromisos de pago recurrentes:\n\n${resumen}\n\nTotal compromisos: ${fmt(stats.totalCompromisos)} (${stats.porcentajeGastado}% del salario)\nDisponible: ${fmt(stats.disponible)}\n\nDá 3-4 consejos prácticos, concretos y personalizados para mejorar su situación financiera. Usá un tono amigable y costarricense. Sé directo y útil. Máximo 200 palabras.`;

            const res = await fetch("/api/ai/consejo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            setConsejoIA(data.text ?? "No se pudo obtener consejo.");
        } catch {
            setConsejoIA("Error al conectar con la IA. Intentá de nuevo.");
        } finally {
            setLoadingIA(false);
        }
    };

    // Datos para gráficas
    const distribucionData = Object.entries(stats.porCategoria).map(([cat, monto]) => ({
        name: CATEGORIA_LABEL[cat as keyof typeof CATEGORIA_LABEL] ?? cat,
        value: monto,
    }));

    const resumenData = [
        { name: "Salario", value: stats.salarioMensual, fill: "#6366f1" },
        { name: "Compromisos", value: stats.totalCompromisos, fill: "#ef4444" },
        { name: "Disponible", value: Math.max(0, stats.disponible), fill: "#22c55e" },
    ];

    const evolucionData = (() => {
        const porMes: Record<string, number> = {};
        historial.forEach((h) => {
            const mes = h.fecha.slice(0, 7);
            porMes[mes] = (porMes[mes] ?? 0) + h.monto;
        });
        return Object.entries(porMes)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([mes, total]) => ({
                mes: new Date(mes + "-01").toLocaleDateString("es-CR", { month: "short" }),
                total,
            }));
    })();

    if (showPerfilForm || !perfil) {
        return (
            <PerfilFinancieroForm
                salarioInput={salarioInput}
                frecuencia={frecuencia}
                tienePerfil={!!perfil}
                onSalarioChange={setSalarioInput}
                onFrecuenciaChange={setFrecuencia}
                onGuardar={handleGuardarPerfil}
                onCancelar={() => setShowPerfilForm(false)}
            />
        );
    }

    return (
        <div className="page fade-in">
            <FinanzasHero
                salarioMensual={stats.salarioMensual}
                totalCompromisos={stats.totalCompromisos}
                disponible={stats.disponible}
                porcentajeGastado={stats.porcentajeGastado}
                onEditar={() => {
                    setSalarioInput(String(perfil?.salario ?? ""));
                    setFrecuencia(perfil?.frecuenciaSalario ?? "mensual");
                    setShowPerfilForm(true);
                }}
            />

            <AlertasFinancieras alertas={stats.alertas} />

            <GraficasSection
                chartTab={chartTab}
                onTabChange={setChartTab}
                distribucionData={distribucionData}
                resumenData={resumenData}
                evolucionData={evolucionData}
            />

            <GastosPorCategoria
                porCategoria={stats.porCategoria}
                salarioMensual={stats.salarioMensual}
            />

            <ConsejoIA
                consejo={consejoIA}
                loading={loadingIA}
                onPedir={handlePedirConsejo}
                onReset={() => setConsejoIA(null)}
            />
        </div>
    );
}
