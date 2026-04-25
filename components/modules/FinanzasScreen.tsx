"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { fmt, CATEGORIA_LABEL, CATEGORIA_ICONO } from "@/lib/utils";
import type { FrecuenciaSalario } from "@/types";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const FRECUENCIA_SALARIO_OPTIONS = [
    { value: "mensual", label: "Mensual" },
    { value: "quincenal", label: "Quincenal" },
    { value: "semanal", label: "Semanal" },
];

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#3b82f6", "#ec4899", "#14b8a6"];

const calcSalarioMensual = (salario: number, frecuencia: FrecuenciaSalario): number => {
    switch (frecuencia) {
        case "quincenal": return salario * 2;
        case "semanal": return salario * 4.33;
        default: return salario;
    }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
        }}>
            {label && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>{label}</p>}
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: p.color }}>
                    {p.name}: {fmt(p.value)}
                </p>
            ))}
        </div>
    );
};

export default function FinanzasScreen() {
    const { settings, updatePerfil, compromisos, historial, getFinanzasStats } = useStore();
    const perfil = settings.perfil;
    const stats = getFinanzasStats();

    const [showPerfilForm, setShowPerfilForm] = useState(false);
    const [salarioInput, setSalarioInput] = useState("");
    const [frecuencia, setFrecuencia] = useState<FrecuenciaSalario>("mensual");
    const [loadingIA, setLoadingIA] = useState(false);
    const [consejoIA, setConsejoIA] = useState<string | null>(null);
    const [chartTab, setChartTab] = useState<"distribucion" | "evolucion" | "resumen">("distribucion");

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

    const handleEditar = () => {
        setSalarioInput(String(perfil?.salario ?? ""));
        setFrecuencia(perfil?.frecuenciaSalario ?? "mensual");
        setShowPerfilForm(true);
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

    // ─── Datos para gráficas ──────────────────────────────────────────────────
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

    const porcentaje = Math.min(100, stats.porcentajeGastado);
    const barColor = porcentaje > 70 ? "var(--color-danger)" : porcentaje > 50 ? "var(--color-warning)" : "var(--color-success)";

    if (showPerfilForm || !perfil) {
        return (
            <div className="page fade-in">
                <div className="card">
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
                        💰 ¿Cuánto ganás?
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", marginBottom: "var(--space-4)" }}>
                        Con tu salario podemos calcular qué porcentaje gastás en compromisos y darte consejos personalizados.
                    </p>

                    <div className="input-group" style={{ marginBottom: "var(--space-3)" }}>
                        <label className="input-label">Mi salario</label>
                        <input
                            className="input" type="number"
                            value={salarioInput}
                            onChange={(e) => setSalarioInput(e.target.value)}
                            placeholder="Ej: 500000"
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: "var(--space-4)" }}>
                        <label className="input-label">Frecuencia</label>
                        <div style={{ display: "flex", gap: "var(--space-2)" }}>
                            {FRECUENCIA_SALARIO_OPTIONS.map((o) => (
                                <button
                                    key={o.value}
                                    className={`btn ${frecuencia === o.value ? "btn-primary" : "btn-secondary"}`}
                                    style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 40 }}
                                    onClick={() => setFrecuencia(o.value as FrecuenciaSalario)}
                                >
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {salarioInput && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-3)" }}>
                            Equivale a {fmt(calcSalarioMensual(parseFloat(salarioInput), frecuencia))} mensuales
                        </p>
                    )}

                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        {perfil && (
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowPerfilForm(false)}>
                                Cancelar
                            </button>
                        )}
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGuardarPerfil}>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page fade-in">

            {/* Hero salario */}
            <div style={{
                background: "linear-gradient(135deg, #1a1040 0%, #0f1627 100%)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-6)",
                position: "relative",
            }}>
                <div style={{
                    position: "absolute", top: -30, right: -30,
                    width: 150, height: 150,
                    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
                    <div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Salario mensual</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-text)" }}>
                            {fmt(stats.salarioMensual)}
                        </p>
                    </div>
                    <button
                        className="btn btn-ghost"
                        style={{ fontSize: "var(--text-xs)", padding: "4px 10px", minHeight: 0, position: "relative", zIndex: 10 }}
                        onClick={handleEditar}
                    >
                        ✏️ Editar
                    </button>
                </div>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                    {fmt(stats.totalCompromisos)} comprometidos · {fmt(Math.max(0, stats.disponible))} disponibles
                </p>
                <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: "var(--space-4)" }}>
                    <div style={{
                        height: "100%", width: `${porcentaje}%`,
                        background: barColor, borderRadius: 5,
                        transition: "width 0.8s ease",
                    }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center" }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Comprometido</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: barColor }}>
                            {stats.porcentajeGastado}%
                        </p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center" }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Disponible</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: stats.disponible >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                            {fmt(Math.abs(stats.disponible))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {stats.alertas.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {stats.alertas.map((a, i) => (
                        <div key={i} style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--space-3) var(--space-4)",
                            display: "flex", gap: "var(--space-2)", alignItems: "flex-start",
                        }}>
                            <span>⚠️</span>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)", lineHeight: 1.5 }}>{a}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Gráficas */}
            <div>
                <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Gráficas</p>

                <div className="tab-pills" style={{ marginBottom: "var(--space-4)" }}>
                    <button className={`tab-pill${chartTab === "distribucion" ? " active" : ""}`} onClick={() => setChartTab("distribucion")}>
                        Distribución
                    </button>
                    <button className={`tab-pill${chartTab === "resumen" ? " active" : ""}`} onClick={() => setChartTab("resumen")}>
                        Resumen
                    </button>
                    <button className={`tab-pill${chartTab === "evolucion" ? " active" : ""}`} onClick={() => setChartTab("evolucion")}>
                        Evolución
                    </button>
                </div>

                <div className="card">
                    {/* Distribución por categoría — Donut */}
                    {chartTab === "distribucion" && (
                        <>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-1)" }}>
                                ¿En qué gastás más?
                            </p>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-4)" }}>
                                Cada porción representa el peso de esa categoría en tus compromisos totales.
                            </p>
                            {distribucionData.length === 0 ? (
                                <p style={{ textAlign: "center", color: "var(--color-text-3)", padding: "var(--space-8) 0" }}>Sin compromisos aún</p>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={distribucionData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%" cy="50%"
                                                innerRadius={55}
                                                outerRadius={90}
                                            >
                                                {distribucionData.map((_, i) => (
                                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v: any) => fmt(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                                        {distribucionData.map((d, i) => (
                                            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                                                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* Resumen salario vs compromisos vs disponible */}
                    {chartTab === "resumen" && (
                        <>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-1)" }}>
                                Tu dinero de un vistazo
                            </p>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-4)" }}>
                                🟣 Salario total · 🔴 Lo comprometido · 🟢 Lo que te queda libre
                            </p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={resumenData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Monto" radius={[6, 6, 0, 0]}>
                                        {resumenData.map((d, i) => (
                                            <Cell key={i} fill={d.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    )}

                    {/* Evolución de pagos por mes */}
                    {chartTab === "evolucion" && (
                        <>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-1)" }}>
                                Evolución de pagos
                            </p>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-4)" }}>
                                Cuánto pagaste cada mes según tu historial. Si sube, estás pagando más compromisos.
                            </p>
                            {evolucionData.length === 0 ? (
                                <p style={{ textAlign: "center", color: "var(--color-text-3)", padding: "var(--space-8) 0" }}>Sin historial aún</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={evolucionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            name="Pagado"
                                            stroke="#6366f1"
                                            strokeWidth={2.5}
                                            dot={{ fill: "#6366f1", r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Por categoría con barras */}
            <div>
                <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Gastos por categoría</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-3)" }}>
                    La barra muestra qué % de tu salario va a cada categoría.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {Object.entries(stats.porCategoria)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, monto]) => {
                            const pct = stats.salarioMensual > 0
                                ? Math.round((monto / stats.salarioMensual) * 100)
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
                </div>
            </div>

            {/* IA Consejos */}
            <div>
                <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Consejo financiero IA</p>
                <div className="card">
                    {consejoIA ? (
                        <>
                            <div style={{
                                fontSize: "var(--text-sm)", color: "var(--color-text-2)",
                                lineHeight: 1.7, whiteSpace: "pre-wrap",
                                marginBottom: "var(--space-4)",
                            }}>
                                {consejoIA}
                            </div>
                            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setConsejoIA(null)}>
                                Pedir otro consejo
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                                🤖 La IA analiza tus compromisos y salario para darte consejos personalizados para mejorar tu situación financiera.
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={handlePedirConsejo}
                                disabled={loadingIA}
                            >
                                {loadingIA ? "Analizando... 🤔" : "✨ Pedirle consejo a la IA"}
                            </button>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}