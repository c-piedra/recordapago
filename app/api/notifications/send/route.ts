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
        if (subsSnap.empty) return NextResponse.json({ ok: true, message: "Sin suscriptores" });

        let sent = 0, failed = 0;

        for (const subDoc of subsSnap.docs) {
            const { subscription, userId } = subDoc.data();

            const settingsSnap = await adminDb
                .collection("users").doc(userId)
                .collection("settings").doc("main").get();

            const spaceId = settingsSnap.exists ? settingsSnap.data()?.spaceId : null;
            if (!spaceId) continue;

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const hoyStr = hoy.toISOString().split("T")[0];

            const compSnap = await adminDb
                .collection("spaces").doc(spaceId)
                .collection("compromisos")
                .where("estado", "==", "activo")
                .get();

            const compromisos = compSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

            const notifications: { title: string; body: string }[] = [];

            for (const c of compromisos) {
                const fecha = new Date(c.proximaFecha + "T00:00:00");
                const dias = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                // Notificación el día exacto de pago
                if (dias === 0) {
                    notifications.push({
                        title: "📅 Hoy vence un pago",
                        body: `${c.nombre} vence hoy · ${c.monto ? `₡${Number(c.monto).toLocaleString("es-CR")}` : ""}`,
                    });
                }
                // Notificación de recordatorio X días antes
                else if (dias > 0 && c.diasAntes > 0 && dias <= c.diasAntes) {
                    notifications.push({
                        title: "💳 Pago próximo",
                        body: `${c.nombre} vence en ${dias} día${dias > 1 ? "s" : ""} · ${c.monto ? `₡${Number(c.monto).toLocaleString("es-CR")}` : ""}`,
                    });
                }
                // Vencido
                else if (dias < 0) {
                    notifications.push({
                        title: "⚠️ Pago vencido",
                        body: `${c.nombre} venció hace ${Math.abs(dias)} día${Math.abs(dias) > 1 ? "s" : ""}`,
                    });
                }
            }

            for (const notif of notifications) {
                try {
                    await webpush.sendNotification(subscription, JSON.stringify(notif));
                    sent++;
                } catch (err) {
                    console.error("Error enviando:", err);
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