import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Borra las copias de un compromiso compartido en los spaces de los destinatarios.
 * Usa Firebase Admin SDK para evitar restricciones de security rules del cliente.
 *
 * POST /api/sharing/delete-copies
 * Body: { compromisoId: string }
 */
export async function POST(req: NextRequest) {
    try {
        const { compromisoId } = await req.json();
        if (!compromisoId) {
            return NextResponse.json({ error: "compromisoId requerido" }, { status: 400 });
        }

        // Collection group query: busca TODOS los compromisos en cualquier space
        // que sean copia del original (compromisoOriginalId === compromisoId)
        const snap = await adminDb
            .collectionGroup("compromisos")
            .where("compromisoOriginalId", "==", compromisoId)
            .get();

        if (snap.empty) {
            return NextResponse.json({ ok: true, deleted: 0 });
        }

        const batch = adminDb.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();

        return NextResponse.json({ ok: true, deleted: snap.size });
    } catch (error) {
        console.error("Error borrando copias compartidas:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
