"use client";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { fmt } from "@/lib/utils";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#3b82f6", "#ec4899", "#14b8a6"];

interface DistribucionEntry { name: string; value: number }
interface ResumenEntry { name: string; value: number; fill: string }
interface EvolucionEntry { mes: string; total: number }

type ChartTab = "distribucion" | "resumen" | "evolucion";

interface GraficasSectionProps {
    chartTab: ChartTab;
    onTabChange: (tab: ChartTab) => void;
    distribucionData: DistribucionEntry[];
    resumenData: ResumenEntry[];
    evolucionData: EvolucionEntry[];
}

export default function GraficasSection({ chartTab, onTabChange, distribucionData, resumenData, evolucionData }: GraficasSectionProps) {
    return (
        <div>
            <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Gráficas</p>

            <div className="tab-pills" style={{ marginBottom: "var(--space-4)" }}>
                {(["distribucion", "resumen", "evolucion"] as ChartTab[]).map((tab) => (
                    <button
                        key={tab}
                        className={`tab-pill${chartTab === tab ? " active" : ""}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab === "distribucion" ? "Distribución" : tab === "resumen" ? "Resumen" : "Evolución"}
                    </button>
                ))}
            </div>

            <div className="card">
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
                                        <Tooltip formatter={(v) => fmt(Number(v))} />
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
    );
}
