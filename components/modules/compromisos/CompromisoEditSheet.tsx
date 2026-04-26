import { Sheet, Select } from "@/components/ui";
import { CATEGORIA_OPTIONS, FRECUENCIA_OPTIONS, DIAS_OPTIONS } from "./constants";

export interface EditFormData {
    nombre: string;
    categoria: string;
    monto: string;
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
                <label className="input-label">Monto (₡) *</label>
                <input
                    className="input"
                    type="number"
                    value={form.monto}
                    onChange={(e) => onFormChange({ monto: e.target.value })}
                />
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

            <div className="input-group">
                <label className="input-label">Emoji personalizado</label>
                <input
                    className="input"
                    value={form.icono}
                    onChange={(e) => onFormChange({ icono: e.target.value })}
                    placeholder="Ej: 🎵 💡 🏠"
                />
            </div>

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
