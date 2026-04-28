"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt, CATEGORIA_ICONO, FRECUENCIA_LABEL } from "@/lib/utils";
import type { InvitacionCompartir } from "@/types";

export default function InvitacionesBanner() {
    const { invitaciones, aceptarInvitacion, rechazarInvitacion } = useStore();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [mensajes, setMensajes] = useState<Record<string, { ok: boolean; text: string }>>({});

    if (invitaciones.length === 0) return null;

    const handleAceptar = async (inv: InvitacionCompartir) => {
        setLoadingId(inv.id);
        const result = await aceptarInvitacion(inv.id);
        setLoadingId(null);
        if (result.ok) {
            setMensajes((prev) => ({ ...prev, [inv.id]: { ok: true, text: "✅ Aceptado — ya aparece en tus compromisos" } }));
            // La invitación desaparece sola cuando el snapshot actualiza el estado
        } else {
            setMensajes((prev) => ({ ...prev, [inv.id]: { ok: false, text: `❌ ${result.error}` } }));
        }
    };

    const handleRechazar = (inv: InvitacionCompartir) => {
        rechazarInvitacion(inv.id);
    };

    return (
        <div style={{
            position: "fixed", top: 60, left: 0, right: 0, zIndex: 1000,
            padding: "0 var(--space-4)",
            pointerEvents: "none",
        }}>
            <div style={{ pointerEvents: "all", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {invitaciones.map((inv) => {
                    const msg = mensajes[inv.id];
                    const isLoading = loadingId === inv.id;
                    return (
                        <div key={inv.id} style={{
                            background: "var(--color-bg-elevated)",
                            border: "1px solid var(--color-primary)",
                            borderRadius: "var(--radius-lg)",
                            padding: "var(--space-3) var(--space-4)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                        }}>
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                                <span style={{ fontSize: 20 }}>
                                    {inv.compromisoIcono || CATEGORIA_ICONO[inv.compromisoCategoria as keyof typeof CATEGORIA_ICONO] || "📋"}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)", lineHeight: 1.2 }}>
                                        🤝 {inv.fromUserName} quiere compartir contigo
                                    </p>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                        <strong style={{ color: "var(--color-text)" }}>{inv.compromisoNombre}</strong>
                                        {" · "}
                                        {fmt(inv.compromisoMonto)}
                                        {" · "}
                                        {FRECUENCIA_LABEL[inv.compromisoFrecuencia as keyof typeof FRECUENCIA_LABEL] ?? inv.compromisoFrecuencia}
                                    </p>
                                </div>
                            </div>

                            {msg ? (
                                <p style={{ fontSize: "var(--text-xs)", color: msg.ok ? "var(--color-success)" : "var(--color-danger)" }}>
                                    {msg.text}
                                </p>
                            ) : (
                                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }}
                                        disabled={isLoading}
                                        onClick={() => handleAceptar(inv)}
                                    >
                                        {isLoading ? "Aceptando..." : "✅ Aceptar"}
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34, color: "var(--color-danger)" }}
                                        disabled={isLoading}
                                        onClick={() => handleRechazar(inv)}
                                    >
                                        ❌ Rechazar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
