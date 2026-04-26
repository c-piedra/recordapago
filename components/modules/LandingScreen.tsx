"use client";
import LandingHero from "./landing/LandingHero";
import InstallSteps from "./landing/InstallSteps";

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
            <LandingHero onLogin={onLogin} />

            <div style={{
                background: "var(--color-bg)",
                padding: "var(--space-8) var(--space-5) var(--space-10)",
            }}>
                {/* Contenedor centrado para desktop */}
                <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <h2 style={{
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "var(--text-xl)", color: "var(--color-text)",
                        textAlign: "center", marginBottom: "var(--space-6)",
                    }}>
                        📲 Instalala en tu celular
                    </h2>

                    {/* Grid: 1 col en móvil, 2 col en desktop */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "var(--space-4)",
                    }}>
                        <InstallSteps platform="ios" />
                        <InstallSteps platform="android" />
                    </div>

                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", textAlign: "center", marginTop: "var(--space-6)" }}>
                        RecordaPago · Hecho con ❤️ en Costa Rica 🇨🇷
                    </p>
                </div>
            </div>
        </div>
    );
}
