import FeaturesGrid from "./FeaturesGrid";

interface LandingHeroProps {
    onLogin: () => void;
}

export default function LandingHero({ onLogin }: LandingHeroProps) {
    return (
        <div style={{
            flex: 1,
            background: "linear-gradient(135deg, #0a0f1e 0%, #1a1040 50%, #0f1627 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8) var(--space-6)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            minHeight: "100dvh",
        }}>
            {/* Glows */}
            <div style={{
                position: "absolute", top: -80, right: -80,
                width: 400, height: 400,
                background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", bottom: -60, left: -60,
                width: 300, height: 300,
                background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Contenido centrado con max-width para desktop */}
            <div style={{
                width: "100%",
                maxWidth: 480,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
            }}>
                <div style={{
                    width: 90, height: 90,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    borderRadius: 24,
                    display: "grid", placeItems: "center",
                    fontSize: 44,
                    boxShadow: "0 8px 40px rgba(99,102,241,0.4)",
                    marginBottom: "var(--space-6)",
                }}>
                    💳
                </div>

                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(32px, 5vw, 52px)",
                    color: "var(--color-text)",
                    marginBottom: "var(--space-3)",
                    lineHeight: 1.1,
                }}>
                    Recorda<span style={{ color: "#6366f1" }}>Pago</span>
                </h1>

                <p style={{
                    fontSize: "var(--text-base)",
                    color: "var(--color-text-2)",
                    marginBottom: "var(--space-6)",
                    lineHeight: 1.6,
                    maxWidth: 340,
                }}>
                    No te quedés sin luz, sin agua,<br />ni con Gollo en la puerta 😅
                </p>

                <FeaturesGrid />

                <button
                    onClick={onLogin}
                    style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff", border: "none",
                        borderRadius: 99, padding: "16px 40px",
                        fontSize: "var(--text-base)", fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 24px rgba(99,102,241,0.5)",
                        width: "100%", maxWidth: 360,
                        marginBottom: "var(--space-3)",
                    }}
                >
                    🚀 Empezar gratis con Google
                </button>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                    Gratis · Sin tarjeta · Instalable como app
                </p>
            </div>

            <div style={{
                position: "absolute", bottom: "var(--space-6)",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "var(--space-1)",
                opacity: 0.4,
            }}>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>¿Cómo instalarla?</p>
                <span style={{ fontSize: 16, color: "var(--color-text-3)" }}>↓</span>
            </div>
        </div>
    );
}
