"use client";
import { SUGERENCIAS, CATEGORIA_LABELS_SUGERENCIAS } from "./constants";

type Sugerencia = typeof SUGERENCIAS[number];

interface NombreInputProps {
    value: string;
    error: boolean;
    sugerencias: Sugerencia[];
    onChange: (val: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    onSelectSugerencia: (s: Sugerencia) => void;
}

const ORDEN_CATEGORIAS = ["suscripcion", "prestamo", "tarjeta", "servicio", "alquiler", "salud", "mascotas", "educacion", "otro"];

export default function NombreInput({ value, error, sugerencias, onChange, onFocus, onBlur, onSelectSugerencia }: NombreInputProps) {
    return (
        <div className="input-group">
            <label className="input-label" style={{ color: error ? "var(--color-danger)" : "var(--color-primary)" }}>
                Nombre {error && "— requerido"} *
            </label>
            <div style={{ position: "relative" }}>
                <input
                    className="input"
                    value={value}
                    placeholder="Ej: Netflix, Gollo, CCSS..."
                    style={{ borderColor: error ? "var(--color-danger)" : undefined }}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                {sugerencias.length > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "calc(100% + 4px)", left: 0, right: 0,
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border-2)",
                        borderRadius: "var(--radius-md)",
                        zIndex: 100, maxHeight: 280, overflowY: "auto",
                    }}>
                        {ORDEN_CATEGORIAS.map((cat) => {
                            const items = sugerencias.filter((s) => s.categoria === cat);
                            if (items.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <p style={{
                                        padding: "6px var(--space-4) 2px",
                                        fontSize: "var(--text-xs)", color: "var(--color-primary)",
                                        fontWeight: 700, letterSpacing: "0.08em",
                                        textTransform: "uppercase", background: "var(--color-bg-card)",
                                    }}>
                                        {CATEGORIA_LABELS_SUGERENCIAS[cat]}
                                    </p>
                                    {items.map((s) => (
                                        <button
                                            key={s.nombre}
                                            style={{
                                                width: "100%", textAlign: "left",
                                                padding: "10px var(--space-4)",
                                                background: "transparent", border: "none",
                                                borderBottom: "1px solid var(--color-border)",
                                                color: "var(--color-text)", cursor: "pointer",
                                                display: "flex", alignItems: "center",
                                                gap: "var(--space-3)", fontSize: "var(--text-sm)",
                                            }}
                                            onMouseDown={() => onSelectSugerencia(s)}
                                        >
                                            <span style={{ fontSize: 20 }}>{s.icono}</span>
                                            {s.nombre}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
