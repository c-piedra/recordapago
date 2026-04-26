import { fmt } from "@/lib/utils";

interface CustomTooltipProps {
    active?: boolean;
    payload?: { dataKey: string; name: string; value: number; color: string }[];
    label?: string;
}

export default function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
        }}>
            {label && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>{label}</p>}
            {payload.map((p) => (
                <p key={p.dataKey} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: p.color }}>
                    {p.name}: {fmt(p.value)}
                </p>
            ))}
        </div>
    );
}
