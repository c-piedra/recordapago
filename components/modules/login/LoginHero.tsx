export default function LoginHero() {
    return (
        <>
            <div style={{
                width: 80, height: 80,
                borderRadius: "var(--radius-xl)",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                display: "grid", placeItems: "center",
                fontSize: 40,
                boxShadow: "0 0 40px rgba(99,102,241,0.3)",
            }}>
                💳
            </div>

            <div style={{ textAlign: "center" }}>
                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-3xl)",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    marginBottom: "var(--space-2)",
                }}>
                    Recorda<span style={{ color: "var(--color-primary)" }}>Pago</span>
                </h1>
                <p style={{
                    fontSize: "var(--text-base)",
                    color: "var(--color-text-3)",
                    maxWidth: 280,
                    lineHeight: 1.6,
                }}>
                    No te quedés sin luz, sin agua,<br />ni con Gollo en la puerta 😅
                </p>
            </div>
        </>
    );
}
