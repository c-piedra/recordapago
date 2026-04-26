const FEATURES = [
    { icon: "🔔", text: "Recordatorios antes de vencer" },
    { icon: "🤝", text: "Compartí gastos con otros" },
    { icon: "📊", text: "Control de finanzas con IA" },
    { icon: "📸", text: "Fotos de comprobantes" },
];

export default function FeaturesGrid() {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "var(--space-2)",
            width: "100%",
            maxWidth: 460,
            marginBottom: "var(--space-10)",
        }}>
            {FEATURES.map(({ icon, text }) => (
                <div key={text} style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-3)",
                    textAlign: "left",
                }}>
                    <p style={{ fontSize: 22, marginBottom: "var(--space-1)" }}>{icon}</p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-2)", lineHeight: 1.4 }}>{text}</p>
                </div>
            ))}
        </div>
    );
}
