import { fmt, CATEGORIA_LABEL, CATEGORIA_ICONO } from "@/lib/utils";
import type { Compromiso } from "@/types";
import CompromisoCard from "./CompromisoCard";

interface CategoriaGroupProps {
    categoria: string;
    items: Compromiso[];
    colapsado: boolean;
    onToggle: () => void;
    onClickItem: (c: Compromiso) => void;
}

export default function CategoriaGroup({ categoria: cat, items, colapsado, onToggle, onClickItem }: CategoriaGroupProps) {
    const totalCat = items.reduce((s, c) => s + c.monto, 0);

    return (
        <div>
            <button
                onClick={onToggle}
                style={{
                    width: "100%", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: colapsado ? "var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) 0 0",
                    padding: "var(--space-3) var(--space-4)",
                    cursor: "pointer",
                    transition: "border-radius 0.2s",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span style={{ fontSize: 20 }}>
                        {CATEGORIA_ICONO[cat as keyof typeof CATEGORIA_ICONO] ?? "📋"}
                    </span>
                    <div style={{ textAlign: "left" }}>
                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                            {CATEGORIA_LABEL[cat as keyof typeof CATEGORIA_LABEL] ?? cat}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            {items.length} compromiso{items.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                        {fmt(totalCat)}
                    </p>
                    <span style={{
                        fontSize: 12, color: "var(--color-text-3)",
                        transform: colapsado ? "rotate(0deg)" : "rotate(180deg)",
                        transition: "transform 0.2s", display: "inline-block",
                    }}>▼</span>
                </div>
            </button>

            {!colapsado && (
                <div style={{
                    border: "1px solid var(--color-border)",
                    borderTop: "none",
                    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                    overflow: "hidden",
                    marginBottom: "var(--space-3)",
                }}>
                    {items.map((c, idx) => (
                        <CompromisoCard
                            key={c.id}
                            compromiso={c}
                            index={idx}
                            totalItems={items.length}
                            onClick={() => onClickItem(c)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
