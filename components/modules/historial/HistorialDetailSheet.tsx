import { fmt, fmtDate, CATEGORIA_ICONO } from "@/lib/utils";
import { Sheet } from "@/components/ui";
import { Trash2 } from "lucide-react";
import type { HistorialPago, Compromiso } from "@/types";

interface HistorialDetailSheetProps {
    pago: HistorialPago;
    compromiso?: Compromiso;
    onClose: () => void;
    onDelete: () => void;
}

export default function HistorialDetailSheet({ pago: h, compromiso: comp, onClose, onDelete }: HistorialDetailSheetProps) {
    const icono = comp?.icono ?? (comp ? CATEGORIA_ICONO[comp.categoria] : "💳");

    return (
        <Sheet title="Detalle de pago" onClose={onClose}>
            <div style={{
                background: "var(--color-bg-elevated)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-5)", textAlign: "center",
            }}>
                <p style={{ fontSize: 40, marginBottom: "var(--space-2)" }}>{icono}</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--color-text)" }}>
                    {h.compromisoNombre}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-success)", marginTop: 4 }}>
                    {fmt(h.monto)}
                </p>
            </div>

            {[
                ["Fecha de pago", fmtDate(h.fecha)],
                ["Referencia", h.referencia ?? "—"],
                ["Notas", h.notas ?? "—"],
            ].map(([l, v]) => (
                <div key={l as string} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "var(--space-2) 0",
                    borderBottom: "1px solid var(--color-border)",
                }}>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{l}</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                </div>
            ))}

            {h.comprobante && (
                <div style={{ marginTop: "var(--space-3)" }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                        Comprobante
                    </p>
                    <img
                        src={h.comprobante}
                        alt="Comprobante"
                        style={{
                            width: "100%", borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                            maxHeight: 300, objectFit: "cover",
                            cursor: "pointer",
                        }}
                        onClick={() => window.open(h.comprobante, "_blank")}
                    />
                </div>
            )}

            <button
                className="btn btn-ghost"
                style={{ width: "100%", color: "var(--color-danger)", marginTop: "var(--space-2)" }}
                onClick={onDelete}
            >
                <Trash2 size={14} /> Eliminar registro
            </button>
        </Sheet>
    );
}
