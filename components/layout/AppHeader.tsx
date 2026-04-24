"use client";
import { useState } from "react";
import { Bell, Settings } from "lucide-react";
import { useStore } from "@/store";
import { fmt, diasHastaNum } from "@/lib/utils";

export default function AppHeader() {
    const { activeTab, setActiveTab, compromisos, settings } = useStore();

    const vencidos = compromisos.filter((c) =>
        c.estado === "activo" && c.proximaFecha < new Date().toISOString().split("T")[0]
    ).length;

    const proximos = compromisos.filter((c) => {
        if (c.estado !== "activo") return false;
        const dias = diasHastaNum(c.proximaFecha);
        return dias >= 0 && dias <= 3;
    }).length;

    const alertas = vencidos + proximos;
    const [showAlerts, setShowAlerts] = useState(false);

    if (activeTab === "dashboard") {
        return (
            <>
                <header className="app-header">
                    <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            Hola, {settings.nombreUsuario || "usuario"} 👋
                        </div>
                        <div style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "var(--text-xl)",
                            color: "var(--color-text)",
                            lineHeight: 1.2,
                        }}>
                            Recorda<span style={{ color: "var(--color-primary)" }}>Pago</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <button
                            className="btn-icon btn"
                            style={{ position: "relative" }}
                            onClick={() => setShowAlerts(true)}
                            aria-label="Alertas"
                        >
                            <Bell size={18} />
                            {alertas > 0 && (
                                <span style={{
                                    position: "absolute", top: -4, right: -4,
                                    background: "var(--color-danger)",
                                    borderRadius: "var(--radius-full)",
                                    width: 16, height: 16,
                                    fontSize: 9, color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800,
                                }}>
                                    {alertas}
                                </span>
                            )}
                        </button>
                        <button
                            className="btn-icon btn"
                            onClick={() => setActiveTab("ajustes")}
                            aria-label="Ajustes"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {showAlerts && (
                    <div
                        onClick={() => setShowAlerts(false)}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(0,0,0,0.8)",
                            zIndex: 80, display: "flex",
                            alignItems: "flex-end", justifyContent: "center",
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "var(--color-bg-card)",
                                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                                border: "1px solid var(--color-border)",
                                width: "100%", maxWidth: 430,
                                padding: "var(--space-5) var(--space-4) var(--space-8)",
                            }}
                        >
                            <div style={{ width: 36, height: 4, background: "var(--color-border-2)", borderRadius: 99, margin: "0 auto var(--space-4)" }} />
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-4)" }}>
                                Alertas
                            </p>

                            {alertas === 0 ? (
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", textAlign: "center", padding: "var(--space-5) 0" }}>
                                    ✅ Todo al día, sin pagos urgentes.
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                                    {vencidos > 0 && (
                                        <div style={{
                                            background: "rgba(239,68,68,0.1)",
                                            border: "1px solid rgba(239,68,68,0.3)",
                                            borderRadius: "var(--radius-md)",
                                            padding: "var(--space-3) var(--space-4)",
                                        }}>
                                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)", fontWeight: 600 }}>
                                                ⚠️ {vencidos} pago{vencidos > 1 ? "s" : ""} vencido{vencidos > 1 ? "s" : ""}
                                            </p>
                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 4 }}>
                                                Gollo ya está en camino 😅
                                            </p>
                                        </div>
                                    )}
                                    {proximos > 0 && (
                                        <div style={{
                                            background: "rgba(245,158,11,0.1)",
                                            border: "1px solid rgba(245,158,11,0.3)",
                                            borderRadius: "var(--radius-md)",
                                            padding: "var(--space-3) var(--space-4)",
                                        }}>
                                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-warning)", fontWeight: 600 }}>
                                                💳 {proximos} pago{proximos > 1 ? "s" : ""} próximo{proximos > 1 ? "s" : ""}
                                            </p>
                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 4 }}>
                                                Vencen en los próximos 3 días
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className="btn btn-ghost"
                                style={{ width: "100%", marginTop: "var(--space-4)" }}
                                onClick={() => setShowAlerts(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    const PAGE_TITLES: Record<string, string> = {
        compromisos: "Mis Compromisos",
        historial: "Historial",
        ajustes: "Ajustes",
    };

    return (
        <header className="app-header">
            <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-lg)",
                color: "var(--color-text)",
            }}>
                {PAGE_TITLES[activeTab] ?? activeTab}
            </div>
            <button
                className="btn-icon btn"
                onClick={() => setActiveTab("ajustes")}
                aria-label="Ajustes"
            >
                <Settings size={18} />
            </button>
        </header>
    );
}