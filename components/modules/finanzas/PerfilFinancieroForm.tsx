"use client";
import { fmt } from "@/lib/utils";
import type { FrecuenciaSalario } from "@/types";

const FRECUENCIA_OPTIONS = [
    { value: "mensual", label: "Mensual" },
    { value: "quincenal", label: "Quincenal" },
    { value: "semanal", label: "Semanal" },
];

const calcSalarioMensual = (salario: number, frecuencia: FrecuenciaSalario): number => {
    switch (frecuencia) {
        case "quincenal": return salario * 2;
        case "semanal": return salario * 4.33;
        default: return salario;
    }
};

interface PerfilFinancieroFormProps {
    salarioInput: string;
    frecuencia: FrecuenciaSalario;
    tienePerfil: boolean;
    onSalarioChange: (v: string) => void;
    onFrecuenciaChange: (v: FrecuenciaSalario) => void;
    onGuardar: () => void;
    onCancelar: () => void;
}

export default function PerfilFinancieroForm({
    salarioInput, frecuencia, tienePerfil,
    onSalarioChange, onFrecuenciaChange, onGuardar, onCancelar,
}: PerfilFinancieroFormProps) {
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
                        className="input"
                        type="number"
                        value={salarioInput}
                        onChange={(e) => onSalarioChange(e.target.value)}
                        placeholder="Ej: 500000"
                    />
                </div>

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

                {salarioInput && (
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-3)" }}>
                        Equivale a {fmt(calcSalarioMensual(parseFloat(salarioInput), frecuencia))} mensuales
                    </p>
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
