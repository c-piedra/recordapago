interface ToggleProps {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    sub?: string;
}

export default function Toggle({ value, onChange, label, sub }: ToggleProps) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "var(--space-4) 0", borderBottom: "1px solid var(--color-border)",
        }}>
            <div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{label}</p>
                {sub && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>{sub}</p>}
            </div>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 44, height: 24, borderRadius: 12, border: "none",
                    cursor: "pointer", flexShrink: 0,
                    background: value ? "var(--color-primary)" : "var(--color-border-2)",
                    position: "relative", transition: "background 200ms",
                }}
            >
                <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, transition: "left 200ms",
                    left: value ? 23 : 3,
                }} />
            </button>
        </div>
    );
}
