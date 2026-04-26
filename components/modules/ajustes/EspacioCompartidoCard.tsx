"use client";
import { useState } from "react";
import type { Space } from "@/types";

interface EspacioCompartidoCardProps {
    space: Space | null;
    userId: string | null;
    isShared: boolean;
    onJoin: (code: string) => Promise<boolean>;
    onLeave: () => void;
}

export default function EspacioCompartidoCard({ space, userId, isShared, onJoin, onLeave }: EspacioCompartidoCardProps) {
    const [joinCode, setJoinCode] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (!space?.inviteCode) return;
        navigator.clipboard.writeText(space.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoinLoading(true);
        setJoinError("");
        const ok = await onJoin(joinCode.trim());
        if (ok) {
            setJoinSuccess(true);
            setJoinCode("");
        } else {
            setJoinError("Código inválido. Verificá y volvé a intentar.");
        }
        setJoinLoading(false);
    };

    return (
        <div className="card">
            {isShared ? (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                        <span style={{ fontSize: 20 }}>👥</span>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                            Espacio compartido activo
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                        {Object.entries(space?.memberNames ?? {}).map(([uid, name]) => (
                            <div key={uid} style={{
                                display: "flex", alignItems: "center", gap: "var(--space-2)",
                                padding: "var(--space-2) var(--space-3)",
                                background: "var(--color-bg-elevated)",
                                borderRadius: "var(--radius-md)",
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: uid === userId ? "var(--color-primary)" : "var(--color-border-2)",
                                    display: "grid", placeItems: "center",
                                    fontSize: 12, fontWeight: 700, color: "#fff",
                                }}>
                                    {(name as string)[0]?.toUpperCase()}
                                </div>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                    {name as string} {uid === userId ? "(vos)" : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn btn-ghost"
                        style={{ width: "100%", color: "var(--color-danger)" }}
                        onClick={onLeave}
                    >
                        Salir del espacio compartido
                    </button>
                </>
            ) : (
                <>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                        Compartí tus compromisos con tu pareja o familiar. Ambos verán y podrán gestionar los mismos pagos.
                    </p>

                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                        Mi código de invitación
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
                        <div style={{
                            flex: 1, padding: "var(--space-3) var(--space-4)",
                            background: "var(--color-bg-elevated)",
                            border: "1px solid var(--color-border-2)",
                            borderRadius: "var(--radius-md)",
                            fontFamily: "monospace", fontSize: "var(--text-xl)",
                            fontWeight: 700, color: "var(--color-primary)",
                            letterSpacing: "0.2em", textAlign: "center",
                        }}>
                            {space?.inviteCode ?? "------"}
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ minHeight: 48, padding: "0 var(--space-4)" }}
                            onClick={handleCopyCode}
                        >
                            {copied ? "✅" : "📋"}
                        </button>
                    </div>

                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                        Unirme al espacio de alguien
                    </p>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <input
                            className="input"
                            value={joinCode}
                            onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                            placeholder="Código..."
                            maxLength={6}
                            style={{ flex: 1, letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase" }}
                        />
                        <button
                            className="btn btn-primary"
                            style={{ minHeight: 48, padding: "0 var(--space-4)" }}
                            onClick={handleJoin}
                            disabled={joinLoading || joinCode.length < 6}
                        >
                            {joinLoading ? "..." : "Unirme"}
                        </button>
                    </div>

                    {joinError && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", marginTop: "var(--space-2)" }}>
                            {joinError}
                        </p>
                    )}
                    {joinSuccess && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-success)", marginTop: "var(--space-2)" }}>
                            ✅ ¡Te uniste exitosamente!
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
