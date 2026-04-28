"use client";
import { useState } from "react";
import { Sheet, Select } from "@/components/ui";
import NombreInput from "./NombreInput";
import EmojiPicker from "./EmojiPicker";
import { CATEGORIA_OPTIONS, FRECUENCIA_OPTIONS, DIAS_OPTIONS, SUGERENCIAS } from "./constants";

type Sugerencia = typeof SUGERENCIAS[number];

export interface FormData {
    nombre: string;
    categoria: string;
    monto: string;
    moneda: "CRC" | "USD";
    frecuencia: string;
    proximaFecha: string;
    diasAntes: string;
    notas: string;
    icono: string;
    categoriaPersonalizada: string;
}

interface CompromisoFormSheetProps {
    form: FormData;
    onFormChange: (patch: Partial<FormData>) => void;
    onSubmit: () => void;
    onClose: () => void;
    errors: Record<string, boolean>;
    onClearError: (field: string) => void;
}

export default function CompromisoFormSheet({ form, onFormChange, onSubmit, onClose, errors, onClearError }: CompromisoFormSheetProps) {
    const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);

    const handleNombreChange = (val: string) => {
        onFormChange({ nombre: val });
        if (errors.nombre) onClearError("nombre");
        setSugerencias(
            val.length > 0
                ? SUGERENCIAS.filter((s) => s.nombre.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
                : SUGERENCIAS
        );
    };

    const handleSelectSugerencia = (s: Sugerencia) => {
        onFormChange({ nombre: s.nombre, icono: s.icono, categoria: s.categoria });
        setSugerencias([]);
    };

    return (
        <Sheet title="Nuevo Compromiso" onClose={onClose}>
            <NombreInput
                value={form.nombre}
                error={!!errors.nombre}
                sugerencias={sugerencias}
                onChange={handleNombreChange}
                onFocus={() => setSugerencias(SUGERENCIAS)}
                onBlur={() => setTimeout(() => setSugerencias([]), 150)}
                onSelectSugerencia={handleSelectSugerencia}
            />

            <Select
                label="Categoría"
                value={form.categoria}
                onChange={(v) => onFormChange({ categoria: v })}
                options={CATEGORIA_OPTIONS}
                required
            />

            {form.categoria === "otro" && (
                <div className="input-group">
                    <label className="input-label">¿Qué tipo de gasto es?</label>
                    <input
                        className="input"
                        value={form.categoriaPersonalizada}
                        onChange={(e) => onFormChange({ categoriaPersonalizada: e.target.value })}
                        placeholder="Ej: Hobby, Deporte, Religión..."
                    />
                </div>
            )}

            <div className="input-group">
                <label className="input-label" style={{ color: errors.monto ? "var(--color-danger)" : "var(--color-primary)" }}>
                    Monto {errors.monto && "— requerido"} *
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                    {(["CRC", "USD"] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            className={`btn ${form.moneda === m ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                            onClick={() => onFormChange({ moneda: m })}
                        >
                            {m === "CRC" ? "₡ Colones" : "$ Dólares"}
                        </button>
                    ))}
                </div>
                <div style={{ position: "relative" }}>
                    <span style={{
                        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                        fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600,
                    }}>
                        {form.moneda === "USD" ? "$" : "₡"}
                    </span>
                    <input
                        className="input"
                        type="number"
                        value={form.monto}
                        placeholder="0"
                        style={{ paddingLeft: 28, borderColor: errors.monto ? "var(--color-danger)" : undefined }}
                        onChange={(e) => { onFormChange({ monto: e.target.value }); if (errors.monto) onClearError("monto"); }}
                    />
                </div>
            </div>

            <Select
                label="Frecuencia"
                value={form.frecuencia}
                onChange={(v) => onFormChange({ frecuencia: v })}
                options={FRECUENCIA_OPTIONS}
                required
            />

            <div className="input-group">
                <label className="input-label" style={{ color: errors.proximaFecha ? "var(--color-danger)" : "var(--color-primary)" }}>
                    Próxima fecha de pago {errors.proximaFecha && "— requerida"} *
                </label>
                <input
                    className="input"
                    type="date"
                    value={form.proximaFecha}
                    style={{ borderColor: errors.proximaFecha ? "var(--color-danger)" : undefined }}
                    onChange={(e) => { onFormChange({ proximaFecha: e.target.value }); if (errors.proximaFecha) onClearError("proximaFecha"); }}
                />
            </div>

            <Select
                label="Recordarme"
                value={form.diasAntes}
                onChange={(v) => onFormChange({ diasAntes: v })}
                options={DIAS_OPTIONS}
            />

            <EmojiPicker
                value={form.icono}
                onChange={(emoji) => onFormChange({ icono: emoji })}
            />

            <div className="input-group">
                <label className="input-label">Notas (opcional)</label>
                <input
                    className="input"
                    value={form.notas}
                    onChange={(e) => onFormChange({ notas: e.target.value })}
                    placeholder="Observaciones..."
                />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={onSubmit}>
                Guardar compromiso
            </button>
        </Sheet>
    );
}
