interface InstallStepsProps {
    platform: "ios" | "android";
}

const IOS_STEPS = [
    "Abrí recordapago.vercel.app en Safari",
    "Tocá el botón compartir ↑ abajo",
    'Elegí "Agregar a pantalla de inicio"',
    "Dale un nombre y tocá Agregar ✅",
];

const ANDROID_STEPS = [
    "Abrí recordapago.vercel.app en Chrome",
    "Tocá el menú ⋮ arriba a la derecha",
    'Elegí "Agregar a pantalla de inicio"',
    "Confirmá y listo ✅",
];

const CONFIG = {
    ios: { label: "🍎 iPhone (Safari)", steps: IOS_STEPS, color: "#6366f1" },
    android: { label: "🤖 Android (Chrome)", steps: ANDROID_STEPS, color: "#22c55e" },
};

export default function InstallSteps({ platform }: InstallStepsProps) {
    const { label, steps, color } = CONFIG[platform];

    return (
        <div style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-5)",
        }}>
            <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-4)" }}>
                {label}
            </p>
            {steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)", alignItems: "flex-start" }}>
                    <div style={{
                        width: 24, height: 24, flexShrink: 0,
                        background: color, borderRadius: "50%",
                        display: "grid", placeItems: "center",
                        fontSize: 11, fontWeight: 800, color: "#fff",
                    }}>
                        {i + 1}
                    </div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", lineHeight: 1.5, paddingTop: 2 }}>{step}</p>
                </div>
            ))}
        </div>
    );
}
