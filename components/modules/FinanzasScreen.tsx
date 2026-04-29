"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { fmt, CATEGORIA_LABEL } from "@/lib/utils";
import type { FrecuenciaSalario, Moneda } from "@/types";
import PerfilFinancieroForm from "./finanzas/PerfilFinancieroForm";
import FinanzasHero from "./finanzas/FinanzasHero";
import AlertasFinancieras from "./finanzas/AlertasFinancieras";
import GraficasSection from "./finanzas/GraficasSection";
import GastosPorCategoria from "./finanzas/GastosPorCategoria";
import AhorroCard from "./finanzas/AhorroCard";
import ConsejoIA from "./finanzas/ConsejoIA";

type ChartTab = "distribucion" | "resumen" | "evolucion";

export default function FinanzasScreen() {
    const { settings, updatePerfil, compromisos, historial, getFinanzasStats, tipoCambio, fetchTipoCambio } = useStore();
    const perfil = settings.perfil;
    const stats = getFinanzasStats();

    const [showPerfilForm, setShowPerfilForm] = useState(false);
    const [salarioInput, setSalarioInput] = useState("");
    const [frecuencia, setFrecuencia] = useState<FrecuenciaSalario>("mensual");
    const [monedaSalario, setMonedaSalario] = useState<Moneda>("CRC");
    const [loadingIA, setLoadingIA] = useState(false);
    const [consejoIA, setConsejoIA] = useState<string | null>(null);
    const [chartTab, setChartTab] = useState<ChartTab>("distribucion");

    useEffect(() => {
        fetchTipoCambio();
    }, []);

    useEffect(() => {
        if (!perfil) {
            setShowPerfilForm(true);
        } else {
            setSalarioInput(String(perfil.salario));
            setFrecuencia(perfil.frecuenciaSalario);
            setMonedaSalario(perfil.monedaSalario ?? "CRC");
        }
    }, [perfil]);

    const handleGuardarPerfil = () => {
        if (!salarioInput) return;
        const salario = parseFloat(salarioInput);
        // salarioMensual siempre en CRC con el tipo de cambio actual
        const base = monedaSalario === "USD" ? salario * tipoCambio : salario;
        const salarioMensual = frecuencia === "quincenal" ? base * 2 : frecuencia === "semanal" ? base * 4.33 : base;
        // Preservar metaAhorro si ya existía
        updatePerfil({ salario, frecuenciaSalario: frecuencia, monedaSalario, salarioMensual, metaAhorro: perfil?.metaAhorro });
        setShowPerfilForm(false);
    };

    const handleSetMetaAhorro = (pct: number | null) => {
        if (!perfil) return;
        updatePerfil({ ...perfil, metaAhorro: pct ?? undefined });
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
                monedaSalario={monedaSalario}
                tipoCambio={tipoCambio}
                tienePerfil={!!perfil}
                onSalarioChange={setSalarioInput}
                onFrecuenciaChange={setFrecuencia}
                onMonedaChange={setMonedaSalario}
                onGuardar={handleGuardarPerfil}
                onCancelar={() => setShowPerfilForm(false)}
            />
        );
    }

    return (
        <div className="page fade-in">
            <FinanzasHero
                salarioMensual={stats.salarioMensual}
                salarioOriginal={perfil?.salario ?? 0}
                monedaSalario={perfil?.monedaSalario ?? "CRC"}
                tipoCambio={tipoCambio}
                totalCompromisos={stats.totalCompromisos}
                disponible={stats.disponible}
                porcentajeGastado={stats.porcentajeGastado}
                capacidadAhorro={stats.capacidadAhorro}
                onEditar={() => {
                    setSalarioInput(String(perfil?.salario ?? ""));
                    setFrecuencia(perfil?.frecuenciaSalario ?? "mensual");
                    setMonedaSalario(perfil?.monedaSalario ?? "CRC");
                    setShowPerfilForm(true);
                }}
            />

            <AlertasFinancieras alertas={stats.alertas} />

            {/* Ahorro — siempre visible antes de gráficas */}
            <AhorroCard
                salarioMensual={stats.salarioMensual}
                disponible={stats.disponible}
                metaAhorro={perfil?.metaAhorro ?? null}
                onSetMetaAhorro={handleSetMetaAhorro}
            />

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
