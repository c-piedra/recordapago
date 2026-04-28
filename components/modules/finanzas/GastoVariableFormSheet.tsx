"use client";
import { useState } from "react";
import { Sheet, Select } from "@/components/ui";
import EmojiPicker from "@/components/modules/compromisos/EmojiPicker";
import { CATEGORIA_OPTIONS } from "@/components/modules/compromisos/constants";
import type { GastoVariable, PeriodoGastoVariable, Moneda } from "@/types";

const PERIODO_OPTIONS = [
    { value: "mensual", label: "Mensual" },
    { value: "quincenal", label: "Quincenal" },
    { value: "semanal", label: "Semanal" },
];

interface GastoVariableFormSheetProps {
    inicial?: Partial<GastoVariable>;
    onGuardar: (data: Omit<GastoVariable, "id">) => void;
    onClose: () => void;
}

export default function GastoVariableFormSheet({ inicial, onGuardar, onClose }: GastoVariableFormSheetProps) {
    const [nombre, setNombre] = useState(inicial?.nombre ?? "");
    const [categoria, setCategoria] = useState<string>(inicial?.categoria ?? "otro");
    const [presupuesto, setPresupuesto] = useState(String(inicial?.presupuesto ?? ""));
    const [moneda, setMoneda] = useState<Moneda>(inicial?.moneda ?? "CRC");
    const [periodo, setPeriodo] = useState<PeriodoGastoVariable>(inicial?.periodo ?? "mensual");
    const [icono, setIcono] = useState(inicial?.icono ?? "");
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleGuardar = () => {
        const errs: Record<string, boolean> = {};
        if (!nombre.trim()) errs.nombre = true;
        if (!presupuesto || isNaN(parseFloat(presupuesto))) errs.presupuesto = true;
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        onGuardar({
            nombre: nombre.trim(),
            categoria: categoria as any,
            presupuesto: parseFloat(presupuesto),
            moneda,
            periodo,
            icono: icono || undefined,
        });
        onClose();
    };

    return (
        <Sheet title={inicial?.id ? "Editar presupuesto" : "Nuevo gasto variable"} onClose={onClose}>
            <div className="input-group">
                <label className="input-label" style={{ color: errors.nombre ? "var(--color-danger)" : "var(--color-primary)" }}>
                    Nombre {errors.nombre && "— requerido"} *
                </label>
                <input
                    className="input"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: false })); }}
                    placeholder="Ej: Carro, Almuerzo, Ocio..."
                />
            </div>

            <Select label="Categoría" value={categoria} onChange={setCategoria} options={CATEGORIA_OPTIONS} />

            <div className="input-group">
                <label className="input-label" style={{ color: errors.presupuesto ? "var(--color-danger)" : "var(--color-primary)" }}>
                    Presupuesto {errors.presupuesto && "— requerido"} *
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                    {(["CRC", "USD"] as Moneda[]).map((m) => (
                        <button key={m} type="button"
                            className={`btn ${moneda === m ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                            onClick={() => setMoneda(m)}
                        >
                            {m === "CRC" ? "₡ Colones" : "$ Dólares"}
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
                        value={presupuesto}
                        placeholder="0"
                        style={{ paddingLeft: 28, borderColor: errors.presupuesto ? "var(--color-danger)" : undefined }}
                        onChange={(e) => { setPresupuesto(e.target.value); setErrors((p) => ({ ...p, presupuesto: false })); }}
                    />
                </div>
            </div>

            <Select label="Período" value={periodo} onChange={(v) => setPeriodo(v as PeriodoGastoVariable)} options={PERIODO_OPTIONS} />

            <EmojiPicker value={icono} onChange={setIcono} />

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleGuardar}>
                {inicial?.id ? "Guardar cambios" : "Crear presupuesto"}
            </button>
        </Sheet>
    );
}
