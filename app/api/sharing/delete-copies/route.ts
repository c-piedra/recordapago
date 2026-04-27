import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Borra las copias de un compromiso compartido en los spaces de los destinatarios.
 * Usa Firebase Admin SDK para evitar restricciones de security rules del cliente.
 *
 * POST /api/sharing/delete-copies
 * Body: {
 *   compromisoId: string,
 *   compartidoCon: string[],                      // userIds (siempre disponible)
 *   compartidoConSpaces?: Record<string,string>,  // { [userId]: spaceId }
 *   compartidoConDocIds?: Record<string,string>,  // { [userId]: docId }
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const {
            compromisoId,
            compartidoCon = [],
            compartidoConSpaces = {},
            compartidoConDocIds = {},
        } = await req.json() as {
            compromisoId: string;
            compartidoCon: string[];
            compartidoConSpaces: Record<string, string>;
            compartidoConDocIds: Record<string, string>;
        };

        if (!compromisoId) {
            return NextResponse.json({ error: "compromisoId requerido" }, { status: 400 });
        }

        let deleted = 0;

        for (const userId of compartidoCon) {
            try {
                const docId = compartidoConDocIds[userId];
                let spaceId = compartidoConSpaces[userId];

                // ── Nivel 1: borrado directo por spaceId + docId (datos nuevos) ──
                if (spaceId && docId) {
                    const ref = adminDb
                        .collection("spaces").doc(spaceId)
                        .collection("compromisos").doc(docId);
                    await ref.delete();
                    deleted++;
                    continue;
                }

                // ── Nivel 2: tenemos spaceId pero no docId — buscar por compromisoOriginalId ──
                if (spaceId) {
                    const snap = await adminDb
                        .collection("spaces").doc(spaceId)
                        .collection("compromisos")
                        .where("compromisoOriginalId", "==", compromisoId)
                        .get();
                    for (const d of snap.docs) { await d.ref.delete(); deleted++; }
                    continue;
                }

                // ── Nivel 3: solo tenemos userId — buscar spaceId en settings ──
                const settingsSnap = await adminDb
                    .collection("users").doc(userId)
                    .collection("settings").doc("main")
                    .get();
                spaceId = settingsSnap.data()?.spaceId;
                if (!spaceId) continue;

                const snap = await adminDb
                    .collection("spaces").doc(spaceId)
                    .collection("compromisos")
                    .where("compromisoOriginalId", "==", compromisoId)
                    .get();
                for (const d of snap.docs) { await d.ref.delete(); deleted++; }

            } catch (err) {
                console.error(`Error borrando copia para usuario ${userId}:`, err);
            }
        }

        return NextResponse.json({ ok: true, deleted });
    } catch (error) {
        console.error("Error en delete-copies:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
