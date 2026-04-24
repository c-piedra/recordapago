"use client";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
    const { loginWithGoogle, loading } = useAuth();

    return (
        <div style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg)",
            padding: "var(--space-6)",
            gap: "var(--space-6)",
        }}>
            {/* Glow */}
            <div style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 300,
                height: 300,
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Icon */}
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

            {/* Title */}
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

            {/* Features */}
            <div style={{
                width: "100%",
                maxWidth: 320,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
            }}>
                {[
                    { icon: "🔔", text: "Recordatorios automáticos antes de vencer" },
                    { icon: "💳", text: "Suscripciones, préstamos, tarjetas y más" },
                    { icon: "📊", text: "Control total de tus gastos recurrentes" },
                ].map(({ icon, text }) => (
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

            {/* Login button */}
            <button
                className="btn btn-primary"
                style={{ width: "100%", maxWidth: 320, gap: "var(--space-3)" }}
                onClick={loginWithGoogle}
                disabled={loading}
            >
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? "Cargando..." : "Continuar con Google"}
            </button>

            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", textAlign: "center" }}>
                Al continuar aceptás los términos de uso
            </p>
        </div>
    );
}