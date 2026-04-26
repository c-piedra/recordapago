const FEATURES = [
    { icon: "🔔", text: "Recordatorios automáticos antes de vencer" },
    { icon: "💳", text: "Suscripciones, préstamos, tarjetas y más" },
    { icon: "📊", text: "Control total de tus gastos recurrentes" },
];

export default function LoginFeatures() {
    return (
        <div style={{
            width: "100%",
            maxWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
        }}>
            {FEATURES.map(({ icon, text }) => (
                <div key={text} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3) var(--space-4)",
                }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>{text}</p>
                </div>
            ))}
        </div>
    );
}
