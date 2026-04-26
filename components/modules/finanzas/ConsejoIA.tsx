"use client";

interface ConsejoIAProps {
    consejo: string | null;
    loading: boolean;
    onPedir: () => void;
    onReset: () => void;
}

export default function ConsejoIA({ consejo, loading, onPedir, onReset }: ConsejoIAProps) {
    return (
        <div>
            <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Consejo financiero IA</p>
            <div className="card">
                {consejo ? (
                    <>
                        <div style={{
                            fontSize: "var(--text-sm)", color: "var(--color-text-2)",
                            lineHeight: 1.7, whiteSpace: "pre-wrap",
                            marginBottom: "var(--space-4)",
                        }}>
                            {consejo}
                        </div>
                        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onReset}>
                            Pedir otro consejo
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                            🤖 La IA analiza tus compromisos y salario para darte consejos personalizados para mejorar tu situación financiera.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            onClick={onPedir}
                            disabled={loading}
                        >
                            {loading ? "Analizando... 🤔" : "✨ Pedirle consejo a la IA"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
