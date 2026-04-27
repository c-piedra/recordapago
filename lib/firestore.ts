import {
    collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc,
    getDocs, onSnapshot, query, orderBy, serverTimestamp, where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Compromiso, HistorialPago, AppSettings, Space } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cleanData = (data: object) =>
    Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

const spaceCol = (spaceId: string, name: string) =>
    collection(db, "spaces", spaceId, name);

const spaceDoc = (spaceId: string, name: string, id: string) =>
    doc(db, "spaces", spaceId, name, id);

// ─── Spaces ───────────────────────────────────────────────────────────────────
export const spacesService = {
    async create(userId: string, userName: string): Promise<string> {
        const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
        const ref = await addDoc(collection(db, "spaces"), cleanData({
            inviteCode,
            createdBy: userId,
            members: [userId],
            memberNames: { [userId]: userName },
            creadoEn: serverTimestamp(),
        }));
        return ref.id;
    },

    async getByInviteCode(code: string): Promise<Space | null> {
        const snap = await getDocs(
            query(collection(db, "spaces"), where("inviteCode", "==", code.toUpperCase()))
        );
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as Space;
    },

    async get(spaceId: string): Promise<Space | null> {
        const snap = await getDoc(doc(db, "spaces", spaceId));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as Space;
    },

    async join(spaceId: string, userId: string, userName: string): Promise<void> {
        await updateDoc(doc(db, "spaces", spaceId), {
            members: [...(await spacesService.get(spaceId))?.members ?? [], userId],
            [`memberNames.${userId}`]: userName,
        });
    },

    async leave(spaceId: string, userId: string): Promise<void> {
        const space = await spacesService.get(spaceId);
        if (!space) return;
        const members = space.members.filter((m) => m !== userId);
        await updateDoc(doc(db, "spaces", spaceId), { members });
    },

    subscribe(spaceId: string, callback: (space: Space) => void) {
        return onSnapshot(doc(db, "spaces", spaceId), (snap) => {
            if (snap.exists()) callback({ id: snap.id, ...snap.data() } as Space);
        });
    },
};

// ─── Compromisos ──────────────────────────────────────────────────────────────
export const compromisosService = {
    async add(spaceId: string, c: Omit<Compromiso, "id">): Promise<string> {
        const ref = await addDoc(spaceCol(spaceId, "compromisos"), cleanData({
            ...c, creadoEn: serverTimestamp(),
        }));
        return ref.id;
    },

    async update(spaceId: string, id: string, data: Partial<Compromiso>): Promise<void> {
        await updateDoc(spaceDoc(spaceId, "compromisos", id), cleanData({
            ...data, actualizadoEn: serverTimestamp(),
        }));
    },

    async delete(spaceId: string, id: string): Promise<void> {
        await deleteDoc(spaceDoc(spaceId, "compromisos", id));
    },

    subscribe(spaceId: string, callback: (compromisos: Compromiso[]) => void) {
        return onSnapshot(
            query(spaceCol(spaceId, "compromisos"), orderBy("proximaFecha", "asc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Compromiso)))
        );
    },
};

// ─── Historial ────────────────────────────────────────────────────────────────
export const historialService = {
    async add(spaceId: string, h: Omit<HistorialPago, "id">): Promise<string> {
        const ref = await addDoc(spaceCol(spaceId, "historial"), cleanData({
            ...h, creadoEn: serverTimestamp(),
        }));
        return ref.id;
    },

    async delete(spaceId: string, id: string): Promise<void> {
        await deleteDoc(spaceDoc(spaceId, "historial", id));
    },

    subscribe(spaceId: string, callback: (historial: HistorialPago[]) => void) {
        return onSnapshot(
            query(spaceCol(spaceId, "historial"), orderBy("fecha", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistorialPago)))
        );
    },
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsService = {
    async get(userId: string): Promise<Partial<AppSettings> | null> {
        try {
            const snap = await getDoc(doc(db, "users", userId, "settings", "main"));
            if (!snap.exists()) return null;
            return snap.data() as Partial<AppSettings>;
        } catch {
            return null;
        }
    },

    async save(userId: string, settings: Partial<AppSettings>): Promise<void> {
        try {
            await setDoc(
                doc(db, "users", userId, "settings", "main"),
                cleanData(settings),
                { merge: true }
            );
        } catch (err) {
            console.error("Error guardando settings:", err);
        }
    },
};

// ─── Push subscriptions ───────────────────────────────────────────────────────
export const pushService = {
    async save(userId: string, subscription: object): Promise<void> {
        await setDoc(doc(db, "pushSubscriptions", userId), {
            subscription, userId, creadoEn: new Date().toISOString(),
        });
    },

    async getBySpaceId(spaceId: string): Promise<{ userId: string; subscription: any }[]> {
        const space = await spacesService.get(spaceId);
        if (!space) return [];
        const results = await Promise.all(
            space.members.map(async (userId) => {
                const snap = await getDoc(doc(db, "pushSubscriptions", userId));
                if (!snap.exists()) return null;
                return { userId, subscription: snap.data().subscription };
            })
        );
        return results.filter(Boolean) as { userId: string; subscription: any }[];
    },

};
// ─── Sharing selectivo ────────────────────────────────────────────────────────
export const sharingService = {
    // Compartir un compromiso con otro usuario por código
    async compartirCompromiso(
        spaceId: string,
        compromisoId: string,
        fromUserId: string,
        fromUserName: string,
        toCode: string,
    ): Promise<{ ok: boolean; error?: string }> {
        try {
            // Buscar el space del destinatario por código
            const snap = await getDocs(
                query(collection(db, "spaces"), where("inviteCode", "==", toCode.toUpperCase()))
            );
            if (snap.empty) return { ok: false, error: "Código inválido" };

            const toSpace = snap.docs[0].data();
            const toMembers = toSpace.members as string[];
            if (toMembers.length === 0) return { ok: false, error: "No se encontró el usuario" };

            const toUserId = toMembers[0];
            if (toUserId === fromUserId) return { ok: false, error: "No podés compartir contigo mismo" };

            // Agregar fromUserId al compartidoCon del compromiso
            const compRef = spaceDoc(spaceId, "compromisos", compromisoId);
            const compSnap = await getDoc(compRef);
            if (!compSnap.exists()) return { ok: false, error: "Compromiso no encontrado" };

            const current = compSnap.data();
            const compartidoCon: string[] = current.compartidoCon ?? [];
            if (compartidoCon.includes(toUserId)) return { ok: false, error: "Ya está compartido con ese usuario" };

            const toSpaceId = snap.docs[0].id;
            const compartidoConSpaces: Record<string, string> = current.compartidoConSpaces ?? {};

            await updateDoc(compRef, {
                compartidoCon: [...compartidoCon, toUserId],
                compartidoConSpaces: { ...compartidoConSpaces, [toUserId]: toSpaceId },
                spaceOwner: fromUserId,
            });

            // Copiar el compromiso al space del destinatario como referencia
            const compData = compSnap.data();
            await addDoc(spaceCol(snap.docs[0].id, "compromisos"), cleanData({
                ...compData,
                esCompartido: true,
                spaceOwner: fromUserId,
                spaceOwnerId: spaceId,
                compromisoOriginalId: compromisoId,
                compartidoCon: [toUserId],
                creadoEn: serverTimestamp(),
            }));

            return { ok: true };
        } catch (err) {
            console.error(err);
            return { ok: false, error: "Error al compartir" };
        }
    },

    // Dejar de compartir
    async dejarCompartir(spaceId: string, compromisoId: string, toUserId: string): Promise<void> {
        const compRef = spaceDoc(spaceId, "compromisos", compromisoId);
        const compSnap = await getDoc(compRef);
        if (!compSnap.exists()) return;
        const current = compSnap.data();
        const compartidoCon = (current.compartidoCon ?? []).filter((id: string) => id !== toUserId);
        await updateDoc(compRef, { compartidoCon });
    },

    // Borrar las copias compartidas del compromiso en los spaces de los destinatarios.
    // compartidoConSpaces: { [userId]: spaceId } guardado al momento de compartir.
    // Como fallback también busca en settings del usuario por si el mapa no está.
    async deleteSharedCopies(
        compromisoId: string,
        compartidoCon: string[],
        compartidoConSpaces: Record<string, string> = {},
    ): Promise<void> {
        for (const userId of compartidoCon) {
            try {
                // Prioridad: spaceId guardado al compartir
                let spaceId: string | undefined = compartidoConSpaces[userId];

                // Fallback: buscar en settings del usuario
                if (!spaceId) {
                    const settingsSnap = await getDoc(doc(db, "users", userId, "settings", "main"));
                    spaceId = settingsSnap.exists() ? settingsSnap.data()?.spaceId : undefined;
                }
                if (!spaceId) continue;

                const copies = await getDocs(
                    query(
                        spaceCol(spaceId, "compromisos"),
                        where("compromisoOriginalId", "==", compromisoId)
                    )
                );
                for (const d of copies.docs) {
                    await deleteDoc(d.ref);
                }
            } catch (err) {
                console.error("Error borrando copia compartida para usuario", userId, err);
            }
        }
    },
};