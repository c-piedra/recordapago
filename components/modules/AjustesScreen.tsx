"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ConfirmDialog } from "@/components/ui";
import PerfilCard from "./ajustes/PerfilCard";
import EspacioCompartidoCard from "./ajustes/EspacioCompartidoCard";
import NotificacionesCard from "./ajustes/NotificacionesCard";
import AppInfoCard from "./ajustes/AppInfoCard";

export default function AjustesScreen() {
    const { settings, updateSettings, space, joinSpace, leaveSpace, userId, userName } = useStore();
    const { user, logout } = useAuth();
    const { permission, subscribed, loading, subscribe, unsubscribe } = usePushNotifications();
    const [confirmLeave, setConfirmLeave] = useState(false);

    useEffect(() => {
        if (subscribed && !settings.notificacionesPush) {
            updateSettings({ notificacionesPush: true });
        }
    }, [subscribed]);

    const handleJoin = async (code: string): Promise<boolean> => {
        if (!userId || !userName) return false;
        return await joinSpace(code, userId, userName);
    };

    const isShared = (space?.members?.length ?? 0) > 1;

    return (
        <div className="page fade-in">
            <PerfilCard
                user={user}
                nombreUsuario={settings.nombreUsuario}
                onNombreChange={(nombre) => updateSettings({ nombreUsuario: nombre })}
            />

            <p className="section-title">Espacio compartido</p>
            <EspacioCompartidoCard
                space={space}
                userId={userId}
                isShared={isShared}
                onJoin={handleJoin}
                onLeave={() => setConfirmLeave(true)}
            />

            <p className="section-title">Notificaciones al celular</p>
            <NotificacionesCard
                subscribed={subscribed}
                permission={permission}
                loading={loading}
                onSubscribe={subscribe}
                onUnsubscribe={unsubscribe}
            />

            <AppInfoCard />

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
