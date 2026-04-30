"use client";
import { useState } from "react";
import { fmt, fmtUSD } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";
import type { FuenteIngreso, FrecuenciaSalario, Moneda } from "@/types";

const FRECUENCIA_LABEL: Record<FrecuenciaSalario, string> = {
    mensual: "Mensual",
    quincenal: "Quincenal",
    semanal: "Semanal",
};

const ICONOS_FUENTE = ["💼", "🏢", "💻", "🎨", "🔧", "📦", "🚗", "📊", "🏪", "🎓", "💰", "🏠"];

interface FuentesIngresoSectionProps {
    fuentes: FuenteIngreso[];
    salarioMensual: number;
    tipoCambio: number;
    onAdd: (f: Omit<FuenteIngreso, "id" | "mensualCRC">) => void;
    onUpdate: (id: string, data: Omit<FuenteIngreso, "id" | "mensualCRC">) => void;
    onDelete: (id: string) => void;
}

// Formulario inline reutilizable
function FuenteForm({
    initial,
    tipoCambio,
    onGuardar,
    onCancelar,
    isEdit,
}: {
    initial?: Partial<FuenteIngreso>;
    tipoCambio: number;
    onGuardar: (data: Omit<FuenteIngreso, "id" | "mensualCRC">) => void;
    onCancelar: () => void;
    isEdit?: boolean;
}) {
    const [nombre, setNombre] = useState(initial?.nombre ?? "");
    const [monto, setMonto] = useState(String(initial?.monto ?? ""));
    const [frecuencia, setFrecuencia] = useState<FrecuenciaSalario>(initial?.frecuencia ?? "mensual");
    const [moneda, setMoneda] = useState<Moneda>(initial?.moneda ?? "CRC");
    const [icono, setIcono] = useState(initial?.icono ?? "💼");
    const [showIconos, setShowIconos] = useState(false);
    const [error, setError] = useState("");

    const montoVal = parseFloat(monto) || 0;
    const baseMensual = frecuencia === "quincenal" ? montoVal * 2 : frecuencia === "semanal" ? montoVal * 4.33 : montoVal;
    const mensualCRC = moneda === "USD" ? baseMensual * tipoCambio : baseMensual;

    const handleGuardar = () => {
        if (!nombre.trim()) { setError("Poné un nombre para esta fuente"); return; }
        if (!montoVal || montoVal <= 0) { setError("El monto debe ser mayor a cero"); return; }
        onGuardar({ nombre: nombre.trim(), monto: montoVal, frecuencia, moneda, icono });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {/* Icono + nombre */}
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowIconos((v) => !v)}
                        style={{
                            width: 44, height: 44, fontSize: 22,
                            background: "var(--color-bg)", border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >{icono}</button>
                    {showIconos && (
                        <div style={{
                            position: "absolute", top: 48, left: 0, zIndex: 10,
                            background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)", padding: "var(--space-2)",
                            display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, width: 180,
                        }}>
                            {ICONOS_FUENTE.map((e) => (
                                <button key={e} onClick={() => { setIcono(e); setShowIconos(false); }}
                                    style={{ fontSize: 20, padding: 4, background: icono === e ? "var(--color-primary)" : "none", border: "none", borderRadius: 4, cursor: "pointer" }}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    className="input"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value); setError(""); }}
                    placeholder="Ej: Trabajo principal, Freelance, Negocio..."
                    style={{ flex: 1, minHeight: 44 }}
                />
            </div>

            {/* Moneda */}
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
                {(["CRC", "USD"] as Moneda[]).map((m) => (
                    <button key={m}
                        className={`btn ${moneda === m ? "btn-primary" : "btn-secondary"}`}
                        style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                        onClick={() => setMoneda(m)}
                    >
                        {m === "CRC" ? "₡ Colones" : "$ Dólares"}
                    </button>
                ))}
            </div>

            {/* Monto */}
            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>
                    {moneda === "USD" ? "$" : "₡"}
                </span>
                <input
                    className="input"
                    type="number"
                    value={monto}
                    onChange={(e) => { setMonto(e.target.value); setError(""); }}
                    placeholder={moneda === "USD" ? "Ej: 1 500" : "Ej: 500 000"}
                    style={{ paddingLeft: 28 }}
                />
            </div>

            {/* Frecuencia */}
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
                {(Object.entries(FRECUENCIA_LABEL) as [FrecuenciaSalario, string][]).map(([val, label]) => (
                    <button key={val}
                        className={`btn ${frecuencia === val ? "btn-primary" : "btn-secondary"}`}
                        style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                        onClick={() => setFrecuencia(val)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Preview mensual */}
            {montoVal > 0 && (
                <div style={{ background: "var(--color-bg)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--color-text-3)", marginBottom: 2 }}>Equivale a mensual</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-primary)" }}>
                        {fmt(Math.round(mensualCRC))}
                    </p>
                    {moneda === "USD" && (
                        <p style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                            {fmtUSD(baseMensual)} · ₡{tipoCambio.toFixed(0)} × $
                        </p>
                    )}
                </div>
            )}

            {error && <p style={{ fontSize: 12, color: "var(--color-danger)" }}>{error}</p>}

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGuardar}>
                    {isEdit ? "Guardar cambios" : "Agregar fuente"}
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancelar}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default function FuentesIngresoSection({
    fuentes, salarioMensual, tipoCambio, onAdd, onUpdate, onDelete,
}: FuentesIngresoSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fuenteEditando = fuentes.find((f) => f.id === editingId);

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <div>
                    <p className="section-title">Mis ingresos</p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        {fuentes.length} fuente{fuentes.length !== 1 ? "s" : ""} · Total: {fmt(salarioMensual)}/mes
                    </p>
                </div>
                {!showForm && !editingId && (
                    <button
                        className="btn btn-secondary"
                        style={{ minHeight: 34, fontSize: "var(--text-xs)", padding: "0 var(--space-3)", display: "flex", alignItems: "center", gap: 4 }}
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={13} /> Agregar
                    </button>
                )}
            </div>

            {/* Lista de fuentes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: showForm || editingId ? "var(--space-3)" : 0 }}>
                {fuentes.map((f) => {
                    const pct = salarioMensual > 0 ? Math.round((f.mensualCRC / salarioMensual) * 100) : 0;
                    const isEditing = editingId === f.id;

                    return (
                        <div key={f.id} style={{
                            background: "var(--color-bg-elevated)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-lg)",
                            overflow: "hidden",
                        }}>
                            {/* Fila compacta */}
                            {!isEditing && (
                                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                        <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icono || "💼"}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                                                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {f.nombre}
                                                </p>
                                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)", flexShrink: 0, marginLeft: 8 }}>
                                                    {fmt(Math.round(f.mensualCRC))}<span style={{ fontSize: 10, fontWeight: 400, color: "var(--color-text-3)" }}>/mes</span>
                                                </p>
                                            </div>
                                            {/* Barra */}
                                            <div style={{ height: 4, borderRadius: 2, background: "var(--color-bg)", overflow: "hidden", marginBottom: 4 }}>
                                                <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-primary)", borderRadius: 2 }} />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                                                    {f.moneda === "USD" ? fmtUSD(f.monto) : fmt(f.monto)} · {FRECUENCIA_LABEL[f.frecuencia].toLowerCase()}
                                                </span>
                                                <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>{pct}% del total</span>
                                            </div>
                                        </div>
                                        {/* Botones editar/borrar */}
                                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                            <button
                                                onClick={() => { setEditingId(f.id); setShowForm(false); }}
                                                style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-text-3)", padding: "4px 8px", fontSize: 11 }}
                                            >
                                                ✏️
                                            </button>
                                            {fuentes.length > 1 && (
                                                <button
                                                    onClick={() => onDelete(f.id)}
                                                    style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-danger)", padding: "4px 8px" }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form de edición inline */}
                            {isEditing && fuenteEditando && (
                                <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
                                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-primary)", marginBottom: "var(--space-3)" }}>
                                        ✏️ Editando: {fuenteEditando.nombre}
                                    </p>
                                    <FuenteForm
                                        initial={fuenteEditando}
                                        tipoCambio={tipoCambio}
                                        isEdit
                                        onGuardar={(data) => { onUpdate(f.id, data); setEditingId(null); }}
                                        onCancelar={() => setEditingId(null)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Form nueva fuente */}
            {showForm && (
                <div style={{
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-primary)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-4)",
                }}>
                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-primary)", marginBottom: "var(--space-3)" }}>
                        ➕ Nueva fuente de ingreso
                    </p>
                    <FuenteForm
                        tipoCambio={tipoCambio}
                        onGuardar={(data) => { onAdd(data); setShowForm(false); }}
                        onCancelar={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Total */}
            {fuentes.length > 1 && (
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    marginTop: "var(--space-2)",
                }}>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-3)" }}>
                        💰 Total mensual
                    </p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--color-success)" }}>
                        {fmt(salarioMensual)}
                    </p>
                </div>
            )}
        </div>
    );
}
