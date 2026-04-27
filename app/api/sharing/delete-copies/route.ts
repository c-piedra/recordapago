import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Borra las copias de un compromiso compartido en los spaces de los destinatarios.
 * Usa Firebase Admin SDK para evitar restricciones de security rules del cliente.
 *
 * POST /api/sharing/delete-copies
 * Body: {
 *   compromisoId: string,
 *   compartidoConSpaces: Record<string, string>,  // { [userId]: spaceId }
 *   compartidoConDocIds: Record<string, string>,  // { [userId]: docId }  ← borrado directo
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const { compromisoId, compartidoConSpaces = {}, compartidoConDocIds = {} } = await req.json();
        if (!compromisoId) {
            return NextResponse.json({ error: "compromisoId requerido" }, { status: 400 });
        }

        const batch = adminDb.batch();
        let added = 0;

        // Borrado directo usando spaceId + docId guardados al compartir
        for (const [userId, docId] of Object.entries(compartidoConDocIds as Record<string, string>)) {
            const spaceId = (compartidoConSpaces as Record<string, string>)[userId];
            if (!spaceId || !docId) continue;
            const ref = adminDb
                .collection("spaces").doc(spaceId)
                .collection("compromisos").doc(docId);
            batch.delete(ref);
            added++;
        }

        // Fallback para compromisos compartidos antes de que se guardara el docId:
        // busca por userId en sus settings para obtener el spaceId y luego por compromisoOriginalId
        const userIdsWithoutDocId = Object.entries(compartidoConSpaces as Record<string, string>)
            .filter(([userId]) => !(compartidoConDocIds as Record<string, string>)[userId]);

        for (const [, spaceId] of userIdsWithoutDocId) {
            try {
                const snap = await adminDb
                    .collection("spaces").doc(spaceId)
                    .collection("compromisos")
                    .where("compromisoOriginalId", "==", compromisoId)
                    .get();
                snap.docs.forEach((d) => { batch.delete(d.ref); added++; });
            } catch {
                // ignorar errores por space individual
            }
        }

        if (added > 0) await batch.commit();

        return NextResponse.json({ ok: true, deleted: added });
    } catch (error) {
        console.error("Error borrando copias compartidas:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
