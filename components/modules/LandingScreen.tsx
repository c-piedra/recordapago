"use client";

export default function LandingScreen({ onStart, onLogin }: {
    onStart: () => void;
    onLogin: () => void;
}) {
    return (
        <div style={{
            minHeight: "100dvh",
            background: "var(--color-bg)",
            display: "flex",
            flexDirection: "column",
        }}>

            {/* Hero — toda la pantalla */}
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
                    width: 300, height: 300,
                    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: -60, left: -60,
                    width: 250, height: 250,
                    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                {/* Logo */}
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
                    fontSize: 38,
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
                    maxWidth: 300,
                }}>
                    No te quedés sin luz, sin agua,<br />ni con Gollo en la puerta 😅
                </p>

                {/* Features en grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-2)",
                    width: "100%",
                    maxWidth: 340,
                    marginBottom: "var(--space-10)"
                }}>
                    {[
                        { icon: "🔔", text: "Recordatorios antes de vencer" },
                        { icon: "🤝", text: "Compartí gastos con otros" },
                        { icon: "📊", text: "Control de finanzas con IA" },
                        { icon: "📸", text: "Fotos de comprobantes" },
                    ].map(({ icon, text }) => (
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

                {/* CTA */}
                <button
                    onClick={onLogin}
                    style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff", border: "none",
                        borderRadius: 99, padding: "16px 40px",
                        fontSize: "var(--text-base)", fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 24px rgba(99,102,241,0.5)",
                        width: "100%", maxWidth: 320,
                        marginBottom: "var(--space-3)",
                    }}
                >
                    🚀 Empezar gratis con Google
                </button>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                    Gratis · Sin tarjeta · Instalable como app
                </p>

                {/* Scroll indicator */}
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

            {/* Sección 2 — Cómo instalar */}
            <div style={{
                background: "var(--color-bg)",
                padding: "var(--space-8) var(--space-5) var(--space-10)",
            }}>
                <h2 style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: "var(--text-xl)", color: "var(--color-text)",
                    textAlign: "center", marginBottom: "var(--space-6)",
                }}>
                    📲 Instalala en tu celular
                </h2>

                {/* iOS */}
                <div style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--space-5)",
                    marginBottom: "var(--space-4)",
                }}>
                    <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-4)" }}>
                        🍎 iPhone (Safari)
                    </p>
                    {[
                        "Abrí recordapago.vercel.app en Safari",
                        "Tocá el botón compartir ↑ abajo",
                        'Elegí "Agregar a pantalla de inicio"',
                        "Dale un nombre y tocá Agregar ✅",
                    ].map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)", alignItems: "flex-start" }}>
                            <div style={{
                                width: 24, height: 24, flexShrink: 0,
                                background: "#6366f1", borderRadius: "50%",
                                display: "grid", placeItems: "center",
                                fontSize: 11, fontWeight: 800, color: "#fff",
                            }}>
                                {i + 1}
                            </div>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", lineHeight: 1.5, paddingTop: 2 }}>{step}</p>
                        </div>
                    ))}
                </div>

                {/* Android */}
                <div style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--space-5)",
                    marginBottom: "var(--space-6)",
                }}>
                    <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-4)" }}>
                        🤖 Android (Chrome)
                    </p>
                    {[
                        "Abrí recordapago.vercel.app en Chrome",
                        "Tocá el menú ⋮ arriba a la derecha",
                        'Elegí "Agregar a pantalla de inicio"',
                        "Confirmá y listo ✅",
                    ].map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)", alignItems: "flex-start" }}>
                            <div style={{
                                width: 24, height: 24, flexShrink: 0,
                                background: "#22c55e", borderRadius: "50%",
                                display: "grid", placeItems: "center",
                                fontSize: 11, fontWeight: 800, color: "#fff",
                            }}>
                                {i + 1}
                            </div>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", lineHeight: 1.5, paddingTop: 2 }}>{step}</p>
                        </div>
                    ))}
                </div>

                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", textAlign: "center", marginTop: "var(--space-4)" }}>
                    RecordaPago · Hecho con ❤️ en Costa Rica 🇨🇷
                </p>
            </div>
        </div>
    );
}