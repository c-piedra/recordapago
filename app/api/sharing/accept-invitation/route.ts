import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/sharing/accept-invitation
 * Acepta una invitación de compartir un compromiso.
 * Usa Firebase Admin SDK para leer y escribir entre spaces distintos.
 *
 * Body: {
 *   invitacionId: string,
 *   toUserId: string,
 *   toSpaceId: string,
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const { invitacionId, toUserId, toSpaceId } = await req.json() as {
            invitacionId: string;
            toUserId: string;
            toSpaceId: string;
        };

        if (!invitacionId || !toUserId || !toSpaceId) {
            return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
        }

        // Leer la invitación
        const invRef = adminDb.collection("users").doc(toUserId).collection("invitaciones").doc(invitacionId);
        const invSnap = await invRef.get();
        if (!invSnap.exists) return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });

        const inv = invSnap.data()!;
        if (inv.estado !== "pendiente") {
            return NextResponse.json({ error: "La invitación ya fue procesada" }, { status: 409 });
        }

        const { fromSpaceId, compromisoId, fromUserId } = inv;

        // Leer el compromiso original
        const compRef = adminDb.collection("spaces").doc(fromSpaceId).collection("compromisos").doc(compromisoId);
        const compSnap = await compRef.get();
        if (!compSnap.exists) {
            // El compromiso original ya no existe — rechazar la invitación
            await invRef.update({ estado: "rechazada" });
            return NextResponse.json({ error: "El compromiso original ya no existe" }, { status: 404 });
        }

        const compData = compSnap.data()!;
        const compartidoCon: string[] = compData.compartidoCon ?? [];

        // Verificar que no esté ya compartido con este usuario
        if (compartidoCon.includes(toUserId)) {
            await invRef.update({ estado: "aceptada" });
            return NextResponse.json({ ok: true, already: true });
        }

        const compartidoConSpaces: Record<string, string> = compData.compartidoConSpaces ?? {};
        const compartidoConDocIds: Record<string, string> = compData.compartidoConDocIds ?? {};

        // Crear copia en el space del destinatario
        const copyRef = adminDb.collection("spaces").doc(toSpaceId).collection("compromisos").doc();
        await copyRef.set({
            ...compData,
            esCompartido: true,
            spaceOwner: fromUserId,
            spaceOwnerId: fromSpaceId,
            compromisoOriginalId: compromisoId,
            compartidoCon: [toUserId],
            compartidoConSpaces: null,
            compartidoConDocIds: null,
            creadoEn: FieldValue.serverTimestamp(),
        });

        // Actualizar el compromiso original con el nuevo destinatario
        await compRef.update({
            compartidoCon: [...compartidoCon, toUserId],
            [`compartidoConSpaces.${toUserId}`]: toSpaceId,
            [`compartidoConDocIds.${toUserId}`]: copyRef.id,
            spaceOwner: fromUserId,
        });

        // Marcar la invitación como aceptada
        await invRef.update({ estado: "aceptada" });

        return NextResponse.json({ ok: true, copyId: copyRef.id });
    } catch (error) {
        console.error("Error en accept-invitation:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
