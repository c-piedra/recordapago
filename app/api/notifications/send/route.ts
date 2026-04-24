import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { adminDb } from "@/lib/firebase-admin";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const subsSnap = await adminDb.collection("pushSubscriptions").get();
        if (subsSnap.empty) {
            return NextResponse.json({ ok: true, message: "Sin suscriptores" });
        }

        let sent = 0, failed = 0;

        for (const subDoc of subsSnap.docs) {
            const { subscription, userId } = subDoc.data();

            // Leer compromisos del usuario
            const compSnap = await adminDb
                .collection("compromisos")
                .where("estado", "==", "activo")
                .get();

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const proximos = compSnap.docs
                .map((d) => d.data())
                .filter((c) => {
                    const fecha = new Date(c.proximaFecha + "T00:00:00");
                    const diff = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                    return diff >= 0 && diff <= (c.diasAntes ?? 3);
                });

            const vencidos = compSnap.docs
                .map((d) => d.data())
                .filter((c) => c.proximaFecha < hoy.toISOString().split("T")[0]);

            const notifications: { title: string; body: string }[] = [];

            if (vencidos.length > 0) {
                notifications.push({
                    title: "⚠️ Pagos vencidos",
                    body: `Tenés ${vencidos.length} pago${vencidos.length > 1 ? "s" : ""} vencido${vencidos.length > 1 ? "s" : ""}. ¡Gollo ya está en camino! 😅`,
                });
            }

            if (proximos.length > 0) {
                const nombres = proximos.slice(0, 2).map((c) => c.nombre).join(", ");
                notifications.push({
                    title: "💳 Pagos próximos",
                    body: `${nombres}${proximos.length > 2 ? ` y ${proximos.length - 2} más` : ""} vencen pronto. No te quedés sin luz 💡`,
                });
            }

            for (const notif of notifications) {
                try {
                    await webpush.sendNotification(subscription, JSON.stringify(notif));
                    sent++;
                } catch {
                    failed++;
                }
            }
        }

        return NextResponse.json({ ok: true, sent, failed });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}   

export async function GET(req: NextRequest) {
    return POST(req);
}