import { fmt, fmtDate, CATEGORIA_ICONO } from "@/lib/utils";
import type { HistorialPago, Compromiso } from "@/types";

interface HistorialItemProps {
    pago: HistorialPago;
    compromiso?: Compromiso;
    onClick: () => void;
}

export default function HistorialItem({ pago: h, compromiso: comp, onClick }: HistorialItemProps) {
    return (
        <div
            style={{
                cursor: "pointer",
                padding: "var(--space-3) var(--space-4)",
                background: "var(--color-bg-card)",
                borderBottom: "1px solid var(--color-border)",
            }}
            onClick={onClick}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-bg-elevated)",
                        display: "grid", placeItems: "center",
                        fontSize: 20, border: "1px solid var(--color-border)",
                    }}>
                        {comp?.icono ?? (comp ? CATEGORIA_ICONO[comp.categoria] : "💳")}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                            {h.compromisoNombre}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                            {fmtDate(h.fecha)}{h.referencia ? ` · ${h.referencia}` : ""}
                        </p>
                        {h.notas && (
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 1, fontStyle: "italic" }}>
                                {h.notas}
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-success)" }}>
                        {fmt(h.monto)}
                    </p>
                    {h.comprobante && <span style={{ fontSize: 14 }}>📎</span>}
                </div>
            </div>
        </div>
    );
}
