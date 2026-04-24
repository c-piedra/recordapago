import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { adminDb } from "@/lib/firebase-admin";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { spaceId, fromUserId, action, nombre, monto } = await req.json();

        // Obtener miembros del space
        const spaceSnap = await adminDb.collection("spaces").doc(spaceId).get();
        if (!spaceSnap.exists) return NextResponse.json({ ok: false });

        const space = spaceSnap.data()!;
        const otherMembers = (space.members as string[]).filter((m) => m !== fromUserId);
        const fromName = space.memberNames?.[fromUserId] ?? "Alguien";

        const messages: Record<string, { title: string; body: string }> = {
            pago: {
                title: "✅ Pago registrado",
                body: `${fromName} marcó ${nombre} como pagado`,
            },
            nuevo: {
                title: "💳 Nuevo compromiso",
                body: `${fromName} agregó ${nombre}`,
            },
            eliminado: {
                title: "🗑️ Compromiso eliminado",
                body: `${fromName} eliminó ${nombre}`,
            },
        };

        const notif = messages[action] ?? messages.pago;

        let sent = 0;
        for (const userId of otherMembers) {
            const subSnap = await adminDb.collection("pushSubscriptions").doc(userId).get();
            if (!subSnap.exists) continue;
            try {
                await webpush.sendNotification(
                    subSnap.data()!.subscription,
                    JSON.stringify(notif)
                );
                sent++;
            } catch {
                // Suscripción expirada
            }
        }

        return NextResponse.json({ ok: true, sent });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}