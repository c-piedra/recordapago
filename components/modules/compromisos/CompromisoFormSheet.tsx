"use client";
import { useState } from "react";
import { Sheet, Select } from "@/components/ui";
import NombreInput from "./NombreInput";
import { CATEGORIA_OPTIONS, FRECUENCIA_OPTIONS, DIAS_OPTIONS, SUGERENCIAS } from "./constants";

type Sugerencia = typeof SUGERENCIAS[number];

export interface FormData {
    nombre: string;
    categoria: string;
    monto: string;
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
                    Monto (₡) {errors.monto && "— requerido"} *
                </label>
                <input
                    className="input"
                    type="number"
                    value={form.monto}
                    placeholder="0"
                    style={{ borderColor: errors.monto ? "var(--color-danger)" : undefined }}
                    onChange={(e) => { onFormChange({ monto: e.target.value }); if (errors.monto) onClearError("monto"); }}
                />
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

            <div className="input-group">
                <label className="input-label">Emoji personalizado (opcional)</label>
                <input
                    className="input"
                    value={form.icono}
                    onChange={(e) => onFormChange({ icono: e.target.value })}
                    placeholder="Ej: 🎵 💡 🏠"
                />
            </div>

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
