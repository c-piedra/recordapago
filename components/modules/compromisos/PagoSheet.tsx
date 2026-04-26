"use client";
import { useState } from "react";
import { fmt, CATEGORIA_ICONO } from "@/lib/utils";
import { Sheet } from "@/components/ui";
import { uploadComprobante } from "@/lib/cloudinary";
import type { Compromiso } from "@/types";

export interface PagoFormData {
    notas: string;
    referencia: string;
    comprobante: string;
}

interface PagoSheetProps {
    compromiso: Compromiso;
    form: PagoFormData;
    onFormChange: (patch: Partial<PagoFormData>) => void;
    onConfirmar: () => void;
    onMarcarSinNotas: () => void;
    onClose: () => void;
}

export default function PagoSheet({ compromiso: c, form, onFormChange, onConfirmar, onMarcarSinNotas, onClose }: PagoSheetProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadComprobante(file);
            onFormChange({ comprobante: url });
        } catch {
            console.error("Error subiendo imagen");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Sheet title="Registrar pago" onClose={onClose}>
            <div style={{
                background: "var(--color-bg-elevated)", borderRadius: "var(--radius-md)",
                padding: "var(--space-4)", textAlign: "center", marginBottom: "var(--space-2)",
            }}>
                <p style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>
                    {c.icono ?? CATEGORIA_ICONO[c.categoria]}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)" }}>{c.nombre}</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-2xl)", color: "var(--color-primary)", marginTop: 4 }}>
                    {fmt(c.monto)}
                </p>
            </div>

            <div className="input-group">
                <label className="input-label">Referencia / comprobante (opcional)</label>
                <input
                    className="input"
                    value={form.referencia}
                    onChange={(e) => onFormChange({ referencia: e.target.value })}
                    placeholder="Ej: #123456, transferencia SINPE..."
                />
            </div>

            <div className="input-group">
                <label className="input-label">Notas (opcional)</label>
                <input
                    className="input"
                    value={form.notas}
                    onChange={(e) => onFormChange({ notas: e.target.value })}
                    placeholder="Observaciones del pago..."
                />
            </div>

            <div className="input-group">
                <label className="input-label">Foto del comprobante (opcional)</label>
                {form.comprobante ? (
                    <div style={{ position: "relative" }}>
                        <img
                            src={form.comprobante}
                            alt="Comprobante"
                            style={{
                                width: "100%", borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-border)",
                                maxHeight: 200, objectFit: "cover",
                            }}
                        />
                        <button
                            className="btn btn-ghost"
                            style={{
                                position: "absolute", top: 8, right: 8, padding: "4px 8px",
                                minHeight: 0, background: "rgba(0,0,0,0.6)", color: "var(--color-danger)",
                            }}
                            onClick={() => onFormChange({ comprobante: "" })}
                        >✕</button>
                    </div>
                ) : (
                    <label style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: "var(--space-2)",
                        border: "2px dashed var(--color-border-2)", borderRadius: "var(--radius-md)",
                        padding: "var(--space-6)", cursor: uploading ? "not-allowed" : "pointer",
                        opacity: uploading ? 0.6 : 1,
                    }}>
                        <span style={{ fontSize: 32 }}>{uploading ? "⏳" : "📷"}</span>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                            {uploading ? "Subiendo..." : "Tocá para subir foto"}
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            disabled={uploading}
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} disabled={uploading} onClick={onConfirmar}>
                ✅ Confirmar pago
            </button>
            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onMarcarSinNotas}>
                Marcar pagado sin notas
            </button>
        </Sheet>
    );
}
