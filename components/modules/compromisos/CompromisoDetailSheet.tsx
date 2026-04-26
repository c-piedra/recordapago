import { fmt, fmtDate, diasHasta, diasHastaNum, FRECUENCIA_LABEL } from "@/lib/utils";
import { Badge, UrgenciaBadge, Sheet } from "@/components/ui";
import { Trash2, CheckCircle, Pause, Play } from "lucide-react";
import type { Compromiso } from "@/types";

interface CompromisoDetailSheetProps {
    compromiso: Compromiso;
    onClose: () => void;
    onMarcarPagado: () => void;
    onToggleEstado: () => void;
    onEditar: () => void;
    onCompartir: () => void;
    onEliminar: () => void;
}

export default function CompromisoDetailSheet({
    compromiso: c, onClose, onMarcarPagado, onToggleEstado, onEditar, onCompartir, onEliminar,
}: CompromisoDetailSheetProps) {
    const dias = diasHastaNum(c.proximaFecha);

    return (
        <Sheet title={c.nombre} onClose={onClose}>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <Badge estado={c.estado} />
                <Badge estado={c.categoria} />
                <UrgenciaBadge dias={dias} />
            </div>

            <div style={{
                background: "var(--color-bg-elevated)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)", textAlign: "center",
            }}>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Monto</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-primary)" }}>
                    {fmt(c.monto)}
                </p>
            </div>

            {[
                ["Frecuencia", FRECUENCIA_LABEL[c.frecuencia]],
                ["Próximo pago", fmtDate(c.proximaFecha)],
                ["Vence", diasHasta(c.proximaFecha)],
                ["Recordatorio", c.diasAntes ? `${c.diasAntes} día${c.diasAntes !== 1 ? "s" : ""} antes` : "Sin recordatorio"],
                ["Notas", c.notas ?? "-"],
            ].map(([l, v]) => (
                <div key={l as string} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)",
                }}>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{l}</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                {c.estado === "activo" && (
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={onMarcarPagado}>
                        <CheckCircle size={16} /> ✅ Marcar como pagado
                    </button>
                )}
                <button className="btn btn-secondary" style={{ width: "100%" }} onClick={onToggleEstado}>
                    {c.estado === "activo" ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Reactivar</>}
                </button>
                <button className="btn btn-secondary" style={{ width: "100%" }} onClick={onEditar}>
                    ✏️ Editar
                </button>
                {c.estado === "activo" && !c.esCompartido && (
                    <button className="btn btn-secondary" style={{ width: "100%" }} onClick={onCompartir}>
                        🤝 Compartir con alguien
                    </button>
                )}
                <button
                    className="btn btn-ghost"
                    style={{ width: "100%", color: "var(--color-danger)" }}
                    onClick={onEliminar}
                >
                    <Trash2 size={14} /> Eliminar
                </button>
            </div>
        </Sheet>
    );
}
