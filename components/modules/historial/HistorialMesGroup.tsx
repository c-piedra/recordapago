import { fmt } from "@/lib/utils";
import type { HistorialPago, Compromiso } from "@/types";
import HistorialItem from "./HistorialItem";

interface HistorialMesGroupProps {
    mes: string;
    pagos: HistorialPago[];
    getCompromiso: (id: string) => Compromiso | undefined;
    onClickPago: (pago: HistorialPago) => void;
}

export default function HistorialMesGroup({ mes, pagos, getCompromiso, onClickPago }: HistorialMesGroupProps) {
    const fecha = new Date(mes + "-01T00:00:00");
    const label = fecha.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
    const total = pagos.reduce((s, h) => s + h.monto, 0);

    return (
        <div>
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "var(--space-3)",
            }}>
                <p className="section-title" style={{ textTransform: "capitalize" }}>
                    {label}
                </p>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text-2)" }}>
                    {fmt(total)}
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
                {pagos.map((h) => (
                    <HistorialItem
                        key={h.id}
                        pago={h}
                        compromiso={getCompromiso(h.compromisoId)}
                        onClick={() => onClickPago(h)}
                    />
                ))}
            </div>
        </div>
    );
}
