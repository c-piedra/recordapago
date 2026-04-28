"use client";
import { useState } from "react";
import { Sheet } from "@/components/ui";
import { fmtMoneda } from "@/lib/utils";
import type { GastoVariable, GastoVariableEntrada, Moneda } from "@/types";

interface RegistrarGastoSheetProps {
    gasto: GastoVariable;
    userId: string | null;
    userName: string | null;
    onConfirmar: (entrada: Omit<GastoVariableEntrada, "id">) => void;
    onClose: () => void;
}

export default function RegistrarGastoSheet({ gasto, userId, userName, onConfirmar, onClose }: RegistrarGastoSheetProps) {
    const [monto, setMonto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [moneda, setMoneda] = useState<Moneda>(gasto.moneda ?? "CRC");
    const [error, setError] = useState(false);

    const handleConfirmar = () => {
        if (!monto || isNaN(parseFloat(monto))) { setError(true); return; }
        onConfirmar({
            gastoVariableId: gasto.id,
            gastoVariableNombre: gasto.nombre,
            monto: parseFloat(monto),
            moneda,
            descripcion: descripcion || undefined,
            fecha: new Date().toISOString().split("T")[0],
            pagadoPor: userId || undefined,
            pagadoPorNombre: userName || undefined,
        });
        onClose();
    };

    return (
        <Sheet title={`Registrar gasto · ${gasto.icono ?? ""} ${gasto.nombre}`} onClose={onClose}>
            <div style={{
                background: "var(--color-bg-elevated)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
                marginBottom: "var(--space-4)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>Presupuesto {gasto.periodo}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)" }}>
                    {fmtMoneda(gasto.presupuesto, gasto.moneda)}
                </span>
            </div>

            <div className="input-group">
                <label className="input-label" style={{ color: error ? "var(--color-danger)" : "var(--color-primary)" }}>
                    ¿Cuánto gastaste? {error && "— requerido"} *
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                    {(["CRC", "USD"] as Moneda[]).map((m) => (
                        <button key={m} type="button"
                            className={`btn ${moneda === m ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                            onClick={() => setMoneda(m)}
                        >
                            {m === "CRC" ? "₡" : "$"}
                        </button>
                    ))}
                </div>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>
                        {moneda === "USD" ? "$" : "₡"}
                    </span>
                    <input
                        className="input"
                        type="number"
                        value={monto}
                        placeholder="0"
                        style={{ paddingLeft: 28, borderColor: error ? "var(--color-danger)" : undefined }}
                        autoFocus
                        onChange={(e) => { setMonto(e.target.value); setError(false); }}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">¿En qué? (opcional)</label>
                <input
                    className="input"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Gasolina, Lavado, Almuerzo..."
                />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleConfirmar}>
                ✅ Registrar gasto
            </button>
        </Sheet>
    );
}
