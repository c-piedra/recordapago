import { Sheet, Select } from "@/components/ui";
import EmojiPicker from "./EmojiPicker";
import { CATEGORIA_OPTIONS, FRECUENCIA_OPTIONS, DIAS_OPTIONS } from "./constants";

export interface EditFormData {
    nombre: string;
    categoria: string;
    monto: string;
    moneda: "CRC" | "USD";
    frecuencia: string;
    proximaFecha: string;
    diasAntes: string;
    notas: string;
    icono: string;
}

interface CompromisoEditSheetProps {
    form: EditFormData;
    onFormChange: (patch: Partial<EditFormData>) => void;
    onGuardar: () => void;
    onClose: () => void;
}

export default function CompromisoEditSheet({ form, onFormChange, onGuardar, onClose }: CompromisoEditSheetProps) {
    return (
        <Sheet title="Editar Compromiso" onClose={onClose}>
            <div className="input-group">
                <label className="input-label">Nombre *</label>
                <input
                    className="input"
                    value={form.nombre}
                    onChange={(e) => onFormChange({ nombre: e.target.value })}
                />
            </div>

            <Select
                label="Categoría"
                value={form.categoria}
                onChange={(v) => onFormChange({ categoria: v })}
                options={CATEGORIA_OPTIONS}
            />

            <div className="input-group">
                <label className="input-label">Monto *</label>
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
                        style={{ paddingLeft: 28 }}
                        onChange={(e) => onFormChange({ monto: e.target.value })}
                    />
                </div>
            </div>

            <Select
                label="Frecuencia"
                value={form.frecuencia}
                onChange={(v) => onFormChange({ frecuencia: v })}
                options={FRECUENCIA_OPTIONS}
            />

            <div className="input-group">
                <label className="input-label">Próxima fecha de pago *</label>
                <input
                    className="input"
                    type="date"
                    value={form.proximaFecha}
                    onChange={(e) => onFormChange({ proximaFecha: e.target.value })}
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
                <label className="input-label">Notas</label>
                <input
                    className="input"
                    value={form.notas}
                    onChange={(e) => onFormChange({ notas: e.target.value })}
                    placeholder="Observaciones..."
                />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={onGuardar}>
                Guardar cambios
            </button>
        </Sheet>
    );
}
