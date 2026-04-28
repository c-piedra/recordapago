"use client";
import { useState } from "react";
import { fmt, CATEGORIA_ICONO } from "@/lib/utils";
import { Sheet } from "@/components/ui";
import { sharingService } from "@/lib/firestore";
import type { Compromiso, Space } from "@/types";

interface CompartirSheetProps {
    compromiso: Compromiso;
    space: Space | null;
    userId: string | null;
    userName: string | null;
    onClose: () => void;
}

export default function CompartirSheet({ compromiso: c, space, userId, userName, onClose }: CompartirSheetProps) {
    const [compartirCode, setCompartirCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const handleCompartir = async () => {
        if (!space || !userId || !userName) return;
        setLoading(true);
        const result = await sharingService.compartirCompromiso(
            space.id,
            c.id,
            userId,
            userName,
            compartirCode,
        );
        setMsg({ ok: result.ok, text: result.error ?? "¡Invitación enviada! La otra persona debe aceptarla." });
        setLoading(false);
        if (result.ok) {
            setCompartirCode("");
            setTimeout(() => { onClose(); setMsg(null); }, 2000);
        }
    };

    return (
        <Sheet title="Compartir compromiso" onClose={() => { onClose(); setCompartirCode(""); setMsg(null); }}>
            <div style={{
                background: "var(--color-bg-elevated)", borderRadius: "var(--radius-md)",
                padding: "var(--space-4)", textAlign: "center", marginBottom: "var(--space-4)",
            }}>
                <p style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>
                    {c.icono ?? CATEGORIA_ICONO[c.categoria]}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)" }}>
                    {c.nombre}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-2xl)", color: "var(--color-primary)", marginTop: 4 }}>
                    {fmt(c.monto)}
                </p>
            </div>

            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                Ingresá el código de la persona con quien querés compartir. Le llegará una notificación para aceptar o rechazar el compromiso.
            </p>

            <div className="input-group">
                <label className="input-label">Código de la otra persona</label>
                <input
                    className="input"
                    value={compartirCode}
                    onChange={(e) => { setCompartirCode(e.target.value.toUpperCase()); setMsg(null); }}
                    placeholder="Ej: ABC123"
                    maxLength={6}
                    style={{ letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase" }}
                />
            </div>

            {msg && (
                <p style={{
                    fontSize: "var(--text-sm)",
                    color: msg.ok ? "var(--color-success)" : "var(--color-danger)",
                    marginBottom: "var(--space-2)",
                }}>
                    {msg.ok ? "✅" : "❌"} {msg.text}
                </p>
            )}

            <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={loading || compartirCode.length < 6}
                onClick={handleCompartir}
            >
                {loading ? "Compartiendo..." : "Compartir"}
            </button>
        </Sheet>
    );
}
