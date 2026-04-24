import {
    collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
    getDocs, onSnapshot, query, getDoc, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Compromiso, HistorialPago, AppSettings } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const col = (name: string) => collection(db, name);

const cleanData = (data: object) =>
    Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );

// ─── Compromisos ──────────────────────────────────────────────────────────────
export const compromisosService = {
    async getAll(): Promise<Compromiso[]> {
        const snap = await getDocs(query(col("compromisos"), orderBy("proximaFecha", "asc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Compromiso));
    },

    async add(c: Omit<Compromiso, "id">): Promise<string> {
        const ref = await addDoc(col("compromisos"), cleanData({ ...c, creadoEn: serverTimestamp() }));
        return ref.id;
    },

    async update(id: string, data: Partial<Compromiso>): Promise<void> {
        await updateDoc(doc(db, "compromisos", id), cleanData({ ...data, actualizadoEn: serverTimestamp() }));
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, "compromisos", id));
    },

    subscribe(callback: (compromisos: Compromiso[]) => void) {
        return onSnapshot(
            query(col("compromisos"), orderBy("proximaFecha", "asc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Compromiso)))
        );
    },
};

// ─── Historial ────────────────────────────────────────────────────────────────
export const historialService = {
    async getAll(): Promise<HistorialPago[]> {
        const snap = await getDocs(query(col("historial"), orderBy("fecha", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistorialPago));
    },

    async add(h: Omit<HistorialPago, "id">): Promise<string> {
        const ref = await addDoc(col("historial"), cleanData({ ...h, creadoEn: serverTimestamp() }));
        return ref.id;
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, "historial", id));
    },

    subscribe(callback: (historial: HistorialPago[]) => void) {
        return onSnapshot(
            query(col("historial"), orderBy("fecha", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistorialPago)))
        );
    },
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsService = {
    async get(userId: string): Promise<Partial<AppSettings> | null> {
        try {
            const ref = doc(db, "users", userId, "settings", "main");
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            return snap.data() as Partial<AppSettings>;
        } catch {
            return null;
        }
    },

    async save(userId: string, settings: Partial<AppSettings>): Promise<void> {
        try {
            const ref = doc(db, "users", userId, "settings", "main");
            await setDoc(ref, cleanData(settings), { merge: true });
        } catch (err) {
            console.error("Error guardando settings:", err);
        }
    },
};