"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ConfirmDialog } from "@/components/ui";
import Image from "next/image";

export default function AjustesScreen() {
    const { settings, updateSettings, space, joinSpace, leaveSpace, userId, userName } = useStore();
    const { user, logout } = useAuth();
    const { permission, subscribed, loading, subscribe, unsubscribe } = usePushNotifications();

    const [showInviteCode, setShowInviteCode] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (subscribed && !settings.notificacionesPush) {
            updateSettings({ notificacionesPush: true });
        }
    }, [subscribed]);

    const handleCopyCode = () => {
        if (!space?.inviteCode) return;
        navigator.clipboard.writeText(space.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoin = async () => {
        if (!joinCode.trim() || !userId || !userName) return;
        setJoinLoading(true);
        setJoinError("");
        const ok = await joinSpace(joinCode.trim(), userId, userName);
        if (ok) {
            setJoinSuccess(true);
            setJoinCode("");
        } else {
            setJoinError("Código inválido. Verificá y volvé a intentar.");
        }
        setJoinLoading(false);
    };

    const isShared = (space?.members?.length ?? 0) > 1;

    const Toggle = ({ value, onChange, label, sub }: {
        value: boolean; onChange: (v: boolean) => void;
        label: string; sub?: string;
    }) => (
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

    return (
        <div className="page fade-in">

            {/* Perfil */}
            <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                {user?.photoURL ? (
                    <Image src={user.photoURL} alt="Avatar" width={56} height={56}
                        style={{ borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "var(--color-primary-glow)",
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "var(--text-xl)", color: "var(--color-primary)",
                    }}>
                        {user?.displayName?.[0] ?? "U"}
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                        {user?.displayName ?? "Usuario"}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Nombre */}
            <div className="input-group">
                <label className="input-label">¿Cómo te llamás?</label>
                <input
                    className="input"
                    value={settings.nombreUsuario}
                    onChange={(e) => updateSettings({ nombreUsuario: e.target.value })}
                    onBlur={(e) => updateSettings({ nombreUsuario: e.target.value })}
                    placeholder="Tu nombre..."
                />
            </div>

            {/* Días por defecto */}
            <div className="input-group">
                <label className="input-label">Días de anticipación por defecto</label>
                <select
                    className="input"
                    value={settings.diasAntesPorDefecto}
                    onChange={(e) => updateSettings({ diasAntesPorDefecto: parseInt(e.target.value) })}
                    style={{ appearance: "none" }}
                >
                    {[1, 2, 3, 5, 7].map((d) => (
                        <option key={d} value={d} style={{ background: "#1a2235" }}>
                            {d} día{d !== 1 ? "s" : ""} antes
                        </option>
                    ))}
                </select>
            </div>

            {/* Espacio compartido */}
            <p className="section-title">Espacio compartido</p>
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
                            onClick={() => setConfirmLeave(true)}
                        >
                            Salir del espacio compartido
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                            Compartí tus compromisos con tu pareja o familiar. Ambos verán y podrán gestionar los mismos pagos.
                        </p>

                        {/* Mi código */}
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                            Mi código de invitación
                        </p>
                        <div style={{
                            display: "flex", alignItems: "center", gap: "var(--space-2)",
                            marginBottom: "var(--space-5)",
                        }}>
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

                        {/* Unirse */}
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

            {/* Notificaciones */}
            <p className="section-title">Notificaciones al celular</p>
            <div className="card">
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", marginBottom: "var(--space-3)" }}>
                    {subscribed
                        ? "✅ Notificaciones activas en este dispositivo."
                        : "Activá las notificaciones para que Gollo no llegue de sorpresa 😅"}
                </p>
                {permission === "denied" ? (
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
                        Bloqueaste las notificaciones. Activalas desde la configuración del navegador.
                    </p>
                ) : (
                    <button
                        className={`btn ${subscribed ? "btn-ghost" : "btn-primary"}`}
                        style={{ width: "100%" }}
                        onClick={subscribed ? unsubscribe : subscribe}
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : subscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
                    </button>
                )}
            </div>


            <div className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>💳</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
                    RecordaPago v1.0.0
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                    No te quedés sin luz, sin agua,<br />ni con Gollo en la puerta 😅
                </p>
            </div>

            {/* Cerrar sesión */}
            <button
                className="btn btn-danger"
                style={{ width: "100%", marginBottom: "var(--space-8)" }}
                onClick={logout}
            >
                Cerrar sesión
            </button>

            {confirmLeave && (
                <ConfirmDialog
                    message="¿Salir del espacio compartido? Se creará un espacio personal nuevo y perderás acceso a los compromisos compartidos."
                    onConfirm={() => { leaveSpace(); setConfirmLeave(false); }}
                    onCancel={() => setConfirmLeave(false)}
                />
            )}
        </div>
    );
}