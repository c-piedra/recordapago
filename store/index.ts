"use client";
import { create } from "zustand";
import type { Compromiso, HistorialPago, AppSettings } from "@/types";
import { compromisosService, historialService, settingsService } from "@/lib/firestore";
import { calcProximaFecha } from "@/lib/utils";

interface AppStore {
    compromisos: Compromiso[];
    historial: HistorialPago[];
    settings: AppSettings;
    activeTab: string;
    userId: string | null;

    // Init
    initSubscriptions: () => () => void;
    setUserId: (id: string | null) => void;
    loadSettings: (userId: string) => Promise<void>;

    // Compromisos
    addCompromiso: (c: Omit<Compromiso, "id">) => Promise<void>;
    updateCompromiso: (id: string, data: Partial<Compromiso>) => Promise<void>;
    deleteCompromiso: (id: string) => Promise<void>;
    marcarPagado: (id: string, notas?: string, referencia?: string, comprobante?: string) => Promise<void>;    // Historial
    addHistorial: (h: Omit<HistorialPago, "id">) => Promise<void>;
    deleteHistorial: (id: string) => Promise<void>;

    // Settings
    updateSettings: (s: Partial<AppSettings>) => void;
    setActiveTab: (tab: string) => void;

    // Stats
    getDashboardStats: () => {
        totalMensual: number;
        proximosVencer: number;
        vencidos: number;
        pagadosEsteMes: number;
    };
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppStore>()((set, get) => ({
    compromisos: [],
    historial: [],
    activeTab: "dashboard",
    userId: null,
    settings: {
        notificacionesPush: false,
        diasAntesPorDefecto: 3,
        nombreUsuario: "",
    },

    setUserId: (id) => set({ userId: id }),

    loadSettings: async (userId) => {
        const saved = await settingsService.get(userId);
        if (saved) set((s) => ({ settings: { ...s.settings, ...saved } }));
    },

    initSubscriptions: () => {
        const unsubCompromisos = compromisosService.subscribe((compromisos) => set({ compromisos }));
        const unsubHistorial = historialService.subscribe((historial) => set({ historial }));
        return () => {
            unsubCompromisos();
            unsubHistorial();
        };
    },

    // ─── Compromisos ──────────────────────────────────────────────────────────
    addCompromiso: async (c) => {
        const tempId = uid();
        set((s) => ({ compromisos: [...s.compromisos, { ...c, id: tempId }].sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha)) }));
        compromisosService.add(c).catch(console.error);
    },

    updateCompromiso: async (id, data) => {
        set((s) => ({ compromisos: s.compromisos.map((c) => c.id === id ? { ...c, ...data } : c) }));
        compromisosService.update(id, data).catch(console.error);
    },

    deleteCompromiso: async (id) => {
        set((s) => ({ compromisos: s.compromisos.filter((c) => c.id !== id) }));
        compromisosService.delete(id).catch(console.error);
    },

    marcarPagado: async (id, notas?, referencia?, comprobante?) => {
        const compromiso = get().compromisos.find((c) => c.id === id);
        if (!compromiso) return;

        const pago: Omit<HistorialPago, "id"> = {
            compromisoId: compromiso.id,
            compromisoNombre: compromiso.nombre,
            monto: compromiso.monto,
            fecha: new Date().toISOString().split("T")[0],
            notas: notas || undefined,
            referencia: referencia || undefined,
            comprobante: comprobante || undefined,
        };
        const tempHistId = uid();
        set((s) => ({ historial: [{ ...pago, id: tempHistId }, ...s.historial] }));
        historialService.add(pago).catch(console.error);

        const nuevaFecha = calcProximaFecha(compromiso.proximaFecha, compromiso.frecuencia);
        set((s) => ({
            compromisos: s.compromisos.map((c) =>
                c.id === id ? { ...c, proximaFecha: nuevaFecha } : c
            ).sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha)),
        }));
        compromisosService.update(id, { proximaFecha: nuevaFecha }).catch(console.error);
    },

    // ─── Historial ────────────────────────────────────────────────────────────
    addHistorial: async (h) => {
        const tempId = uid();
        set((s) => ({ historial: [{ ...h, id: tempId }, ...s.historial] }));
        historialService.add(h).catch(console.error);
    },

    deleteHistorial: async (id) => {
        set((s) => ({ historial: s.historial.filter((h) => h.id !== id) }));
        historialService.delete(id).catch(console.error);
    },

    // ─── Settings ─────────────────────────────────────────────────────────────
    updateSettings: (s) => {
        set((state) => {
            const newSettings = { ...state.settings, ...s };
            if (state.userId) settingsService.save(state.userId, s);
            return { settings: newSettings };
        });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    // ─── Stats ────────────────────────────────────────────────────────────────
    getDashboardStats: () => {
        const { compromisos, historial } = get();
        const hoy = new Date();
        const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];
        const endOfMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split("T")[0];

        const activos = compromisos.filter((c) => c.estado === "activo");

        return {
            totalMensual: activos.reduce((s, c) => s + c.monto, 0),
            proximosVencer: activos.filter((c) => {
                const dias = Math.round((new Date(c.proximaFecha + "T00:00:00").getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                return dias >= 0 && dias <= 5;
            }).length,
            vencidos: activos.filter((c) => c.proximaFecha < hoy.toISOString().split("T")[0]).length,
            pagadosEsteMes: historial.filter((h) => h.fecha >= startOfMonth && h.fecha <= endOfMonth).length,
        };
    },
}));