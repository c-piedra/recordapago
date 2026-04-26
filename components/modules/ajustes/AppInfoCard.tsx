export default function AppInfoCard() {
    return (
        <div className="card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>💳</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
                RecordaPago v1.0.0
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                No te quedés sin luz, sin agua,<br />ni con Gollo en la puerta 😅
            </p>
        </div>
    );
}
