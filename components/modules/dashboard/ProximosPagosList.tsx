"use client";
import type { Compromiso } from "@/types";
import ProximoPagoCard from "./ProximoPagoCard";

interface ProximosPagosListProps {
    proximos: Compromiso[];
    onVerTodos: () => void;
    onClickCompromiso: (categoria: string) => void;
}

export default function ProximosPagosList({ proximos, onVerTodos, onClickCompromiso }: ProximosPagosListProps) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <p className="section-title">Próximos pagos</p>
                <button
                    className="btn btn-ghost"
                    style={{ fontSize: "var(--text-xs)", padding: "4px 10px", minHeight: 0 }}
                    onClick={onVerTodos}
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
                        onClick={onVerTodos}
                    >
                        + Agregar primer compromiso
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {proximos.map((c, i) => (
                        <ProximoPagoCard
                            key={c.id}
                            compromiso={c}
                            index={i}
                            onClick={() => onClickCompromiso(c.categoria)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
