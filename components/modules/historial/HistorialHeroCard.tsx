import { fmt } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface HistorialHeroCardProps {
    totalEsteMes: number;
    cantidadPagos: number;
    totalAhorros?: number;
    onLimpiar?: () => void;
}

export default function HistorialHeroCard({ totalEsteMes, cantidadPagos, totalAhorros = 0, onLimpiar }: HistorialHeroCardProps) {
    return (
        <div className="hero-card" style={{ position: "relative" }}>
            {onLimpiar && (
                <button
                    onClick={onLimpiar}
                    title="Limpiar historial del mes"
                    style={{
                        position: "absolute", top: "var(--space-3)", right: "var(--space-3)",
                        background: "none", border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)", cursor: "pointer",
                        color: "var(--color-text-3)", padding: "4px 10px",
                        display: "flex", alignItems: "center", gap: 5,
                        fontSize: 11,
                    }}
                >
                    <Trash2 size={12} /> Limpiar mes
                </button>
            )}
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                Pagado este mes
            </p>
            <p style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "var(--text-3xl)", color: "var(--color-success)",
            }}>
                {fmt(totalEsteMes + totalAhorros)}
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: "var(--space-2)" }}>
                {cantidadPagos} pago{cantidadPagos !== 1 ? "s" : ""} registrados
                {totalAhorros > 0 && ` · ${fmt(totalAhorros)} en ahorros`}
            </p>
        </div>
    );
}
