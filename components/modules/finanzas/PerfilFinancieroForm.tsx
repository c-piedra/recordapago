"use client";
import { fmt, fmtUSD } from "@/lib/utils";
import type { FrecuenciaSalario, Moneda } from "@/types";

const FRECUENCIA_OPTIONS = [
    { value: "mensual", label: "Mensual" },
    { value: "quincenal", label: "Quincenal" },
    { value: "semanal", label: "Semanal" },
];

const calcBase = (salario: number, frecuencia: FrecuenciaSalario): number => {
    switch (frecuencia) {
        case "quincenal": return salario * 2;
        case "semanal": return salario * 4.33;
        default: return salario;
    }
};

interface PerfilFinancieroFormProps {
    salarioInput: string;
    frecuencia: FrecuenciaSalario;
    monedaSalario: Moneda;
    tipoCambio: number;
    tienePerfil: boolean;
    onSalarioChange: (v: string) => void;
    onFrecuenciaChange: (v: FrecuenciaSalario) => void;
    onMonedaChange: (v: Moneda) => void;
    onGuardar: () => void;
    onCancelar: () => void;
}

export default function PerfilFinancieroForm({
    salarioInput, frecuencia, monedaSalario, tipoCambio, tienePerfil,
    onSalarioChange, onFrecuenciaChange, onMonedaChange, onGuardar, onCancelar,
}: PerfilFinancieroFormProps) {
    const salario = parseFloat(salarioInput) || 0;
    const baseMensual = calcBase(salario, frecuencia);
    const baseMensualCRC = monedaSalario === "USD" ? baseMensual * tipoCambio : baseMensual;

    return (
        <div className="page fade-in">
            <div className="card">
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
                    💰 ¿Cuánto ganás?
                </p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", marginBottom: "var(--space-4)" }}>
                    Con tu salario calculamos qué porcentaje gastás en compromisos y te damos consejos personalizados.
                </p>

                {/* Selector de moneda */}
                <div className="input-group" style={{ marginBottom: "var(--space-3)" }}>
                    <label className="input-label">Moneda del salario</label>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        {(["CRC", "USD"] as Moneda[]).map((m) => (
                            <button
                                key={m}
                                className={`btn ${monedaSalario === m ? "btn-primary" : "btn-secondary"}`}
                                style={{ flex: 1, fontSize: "var(--text-sm)", minHeight: 44 }}
                                onClick={() => onMonedaChange(m)}
                            >
                                {m === "CRC" ? "₡ Colones" : "$ Dólares"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input de salario */}
                <div className="input-group" style={{ marginBottom: "var(--space-3)" }}>
                    <label className="input-label">Mi salario</label>
                    <div style={{ position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                            fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600,
                        }}>
                            {monedaSalario === "USD" ? "$" : "₡"}
                        </span>
                        <input
                            className="input"
                            type="number"
                            value={salarioInput}
                            onChange={(e) => onSalarioChange(e.target.value)}
                            placeholder={monedaSalario === "USD" ? "Ej: 1500" : "Ej: 500000"}
                            style={{ paddingLeft: 28 }}
                        />
                    </div>
                </div>

                {/* Frecuencia */}
                <div className="input-group" style={{ marginBottom: "var(--space-4)" }}>
                    <label className="input-label">Frecuencia</label>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        {FRECUENCIA_OPTIONS.map((o) => (
                            <button
                                key={o.value}
                                className={`btn ${frecuencia === o.value ? "btn-primary" : "btn-secondary"}`}
                                style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 40 }}
                                onClick={() => onFrecuenciaChange(o.value as FrecuenciaSalario)}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                {salario > 0 && (
                    <div style={{
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3)",
                        marginBottom: "var(--space-4)",
                    }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                            Equivale a mensual:
                        </p>
                        {monedaSalario === "USD" ? (
                            <>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                                    {fmtUSD(baseMensual)}
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                    ≈ {fmt(baseMensualCRC)} · tipo de cambio ₡{tipoCambio.toFixed(0)}
                                </p>
                            </>
                        ) : (
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                                {fmt(baseMensualCRC)}
                            </p>
                        )}
                    </div>
                )}

                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {tienePerfil && (
                        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancelar}>
                            Cancelar
                        </button>
                    )}
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={onGuardar}>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
