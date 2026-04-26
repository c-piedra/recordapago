import { fmt } from "@/lib/utils";

interface HistorialHeroCardProps {
    totalEsteMes: number;
    cantidadPagos: number;
}

export default function HistorialHeroCard({ totalEsteMes, cantidadPagos }: HistorialHeroCardProps) {
    return (
        <div className="hero-card">
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                Pagado este mes
            </p>
            <p style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "var(--text-3xl)", color: "var(--color-success)",
            }}>
                {fmt(totalEsteMes)}
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: "var(--space-2)" }}>
                {cantidadPagos} pagos registrados
            </p>
        </div>
    );
}
