interface AlertasFinancierasProps {
    alertas: string[];
}

export default function AlertasFinancieras({ alertas }: AlertasFinancierasProps) {
    if (alertas.length === 0) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {alertas.map((a, i) => (
                <div key={i} style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3) var(--space-4)",
                    display: "flex", gap: "var(--space-2)", alignItems: "flex-start",
                }}>
                    <span>⚠️</span>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)", lineHeight: 1.5 }}>{a}</p>
                </div>
            ))}
        </div>
    );
}
