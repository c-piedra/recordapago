interface NotificacionesCardProps {
    subscribed: boolean;
    permission: NotificationPermission | null;
    loading: boolean;
    onSubscribe: () => void;
    onUnsubscribe: () => void;
}

export default function NotificacionesCard({ subscribed, permission, loading, onSubscribe, onUnsubscribe }: NotificacionesCardProps) {
    return (
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
                    onClick={subscribed ? onUnsubscribe : onSubscribe}
                    disabled={loading}
                >
                    {loading ? "Procesando..." : subscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
                </button>
            )}
        </div>
    );
}
