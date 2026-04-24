"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useStore } from "@/store";

export function usePushNotifications() {
    const { user } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const checked = useRef(false);

    useEffect(() => {
        if (checked.current) return;
        checked.current = true;
        if (typeof window === "undefined" || !("Notification" in window)) return;
        setPermission(Notification.permission);
        if (Notification.permission === "granted") {
            navigator.serviceWorker.ready
                .then((reg) => reg.pushManager.getSubscription())
                .then((sub) => setSubscribed(!!sub))
                .catch(() => setSubscribed(false));
        }
    }, []);

    const subscribe = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm !== "granted") return;

            const reg = await navigator.serviceWorker.register("/sw-notifications.js");
            await navigator.serviceWorker.ready;

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: sub, userId: user.uid }),
            });

            const { updateSettings } = useStore.getState();
            updateSettings({ notificacionesPush: true });

            setSubscribed(true);
        } catch (err) {
            console.error("Error suscribiendo:", err);
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
            setSubscribed(false);
        } catch (err) {
            console.error("Error desuscribiendo:", err);
        } finally {
            setLoading(false);
        }
    };

    return { permission, subscribed, loading, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}