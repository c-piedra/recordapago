"use client";
import { create } from "zustand";
import type { Compromiso, HistorialPago, AppSettings, Space, PerfilFinanciero } from "@/types";
import { compromisosService, historialService, settingsService, spacesService } from "@/lib/firestore";
import { calcProximaFecha } from "@/lib/utils";

interface AppStore {
    compromisos: Compromiso[];
    historial: HistorialPago[];
    settings: AppSettings;
    space: Space | null;
    activeTab: string;
    userId: string | null;
    userName: string | null;
    categoriaAbierta: string | null;

    updatePerfil: (perfil: PerfilFinanciero) => void;
    getFinanzasStats: () => {
        salarioMensual: number;
        totalCompromisos: number;
        porcentajeGastado: number;
        disponible: number;
        porCategoria: Record<string, number>;
        alertas: string[];
    };
    initSubscriptions: () => () => void;
    setUserId: (id: string | null) => void;
    setUserName: (name: string | null) => void;
    loadSettings: (userId: string) => Promise<void>;
    initSpace: (userId: string, userName: string) => Promise<void>;
    createSpace: (userId: string, userName: string) => Promise<string>;
    joinSpace: (code: string, userId: string, userName: string) => Promise<boolean>;
    leaveSpace: () => Promise<void>;
    addCompromiso: (c: Omit<Compromiso, "id">) => Promise<void>;
    updateCompromiso: (id: string, data: Partial<Compromiso>) => Promise<void>;
    deleteCompromiso: (id: string) => Promise<void>;
    marcarPagado: (id: string, notas?: string, referencia?: string, comprobante?: string) => Promise<void>;
    deleteHistorial: (id: string) => Promise<void>;
    updateSettings: (s: Partial<AppSettings>) => void;
    setActiveTab: (tab: string) => void;
    setCategoriaAbierta: (cat: string | null) => void;
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
    space: null,
    activeTab: "dashboard",
    userId: null,
    userName: null,
    categoriaAbierta: null,
    settings: {
        notificacionesPush: false,
        diasAntesPorDefecto: 3,
        nombreUsuario: "",
    },

    setUserId: (id) => set({ userId: id }),
    setUserName: (name) => set({ userName: name }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setCategoriaAbierta: (cat) => set({ categoriaAbierta: cat }),

    loadSettings: async (userId) => {
        const saved = await settingsService.get(userId);
        if (saved) set((s) => ({ settings: { ...s.settings, ...saved } }));
    },

    initSpace: async (userId, userName) => {
        const settings = await settingsService.get(userId);
        let spaceId = settings?.spaceId;
        if (!spaceId) {
            spaceId = await spacesService.create(userId, userName);
            await settingsService.save(userId, { spaceId });
            set((s) => ({ settings: { ...s.settings, spaceId } }));
        }
        const space = await spacesService.get(spaceId);
        set({ space });
    },

    initSubscriptions: () => {
        const { space } = get();
        if (!space) return () => { };
        const unsubCompromisos = compromisosService.subscribe(space.id, (compromisos) => set({ compromisos }));
        const unsubHistorial = historialService.subscribe(space.id, (historial) => set({ historial }));
        const unsubSpace = spacesService.subscribe(space.id, (space) => set({ space }));
        return () => { unsubCompromisos(); unsubHistorial(); unsubSpace(); };
    },

    createSpace: async (userId, userName) => {
        const spaceId = await spacesService.create(userId, userName);
        await settingsService.save(userId, { spaceId });
        const space = await spacesService.get(spaceId);
        set((s) => ({ space, settings: { ...s.settings, spaceId } }));
        return spaceId;
    },

    joinSpace: async (code, userId, userName) => {
        const space = await spacesService.getByInviteCode(code);
        if (!space) return false;
        const { settings } = get();
        if (settings.spaceId && settings.spaceId !== space.id) {
            await spacesService.leave(settings.spaceId, userId);
        }
        await spacesService.join(space.id, userId, userName);
        await settingsService.save(userId, { spaceId: space.id });
        const updatedSpace = await spacesService.get(space.id);
        set((s) => ({ space: updatedSpace, settings: { ...s.settings, spaceId: space.id } }));
        return true;
    },

    leaveSpace: async () => {
        const { space, userId, userName } = get();
        if (!space || !userId) return;
        await spacesService.leave(space.id, userId);
        const newSpaceId = await spacesService.create(userId, userName ?? "");
        await settingsService.save(userId, { spaceId: newSpaceId });
        const newSpace = await spacesService.get(newSpaceId);
        set((s) => ({ space: newSpace, compromisos: [], historial: [], settings: { ...s.settings, spaceId: newSpaceId } }));
    },

    addCompromiso: async (c) => {
        const { space } = get();
        if (!space) return;
        const tempId = uid();
        set((s) => ({
            compromisos: [...s.compromisos, { ...c, id: tempId }]
                .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha)),
        }));
        compromisosService.add(space.id, c).catch(console.error);
    },

    updateCompromiso: async (id, data) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ compromisos: s.compromisos.map((c) => c.id === id ? { ...c, ...data } : c) }));
        compromisosService.update(space.id, id, data).catch(console.error);
    },

    deleteCompromiso: async (id) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ compromisos: s.compromisos.filter((c) => c.id !== id) }));
        compromisosService.delete(space.id, id).catch(console.error);
    },

    marcarPagado: async (id, notas?, referencia?, comprobante?) => {
        const { space, userId, userName } = get();
        if (!space) return;
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
            pagadoPor: userId || undefined,
            pagadoPorNombre: userName || undefined,
        };

        const tempHistId = uid();
        set((s) => ({ historial: [{ ...pago, id: tempHistId }, ...s.historial] }));
        historialService.add(space.id, pago).catch(console.error);

        const nuevaFecha = calcProximaFecha(compromiso.proximaFecha, compromiso.frecuencia);
        set((s) => ({
            compromisos: s.compromisos.map((c) =>
                c.id === id ? { ...c, proximaFecha: nuevaFecha } : c
            ).sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha)),
        }));
        compromisosService.update(space.id, id, { proximaFecha: nuevaFecha }).catch(console.error);

        if (space.members.length > 1) {
            fetch("/api/notifications/member-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spaceId: space.id,
                    fromUserId: userId,
                    action: "pago",
                    nombre: compromiso.nombre,
                    monto: compromiso.monto,
                }),
            }).catch(console.error);
        }
    },

    deleteHistorial: async (id) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ historial: s.historial.filter((h) => h.id !== id) }));
        historialService.delete(space.id, id).catch(console.error);
    },

    updateSettings: (s) => {
        set((state) => {
            const newSettings = { ...state.settings, ...s };
            if (state.userId) settingsService.save(state.userId, s);
            return { settings: newSettings };
        });
    },

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

    updatePerfil: (perfil) => {
        set((state) => {
            const newSettings = { ...state.settings, perfil };
            if (state.userId) settingsService.save(state.userId, { perfil });
            return { settings: newSettings };
        });
    },

    getFinanzasStats: () => {
        const { compromisos, settings } = get();
        const activos = compromisos.filter((c) => c.estado === "activo");
        const salarioMensual = settings.perfil?.salarioMensual ?? 0;
        const totalCompromisos = activos.reduce((s, c) => s + c.monto, 0);
        const porcentajeGastado = salarioMensual > 0
            ? Math.round((totalCompromisos / salarioMensual) * 100)
            : 0;
        const disponible = salarioMensual - totalCompromisos;

        const porCategoria = activos.reduce<Record<string, number>>((acc, c) => {
            acc[c.categoria] = (acc[c.categoria] ?? 0) + c.monto;
            return acc;
        }, {});

        const alertas: string[] = [];
        if (porcentajeGastado > 70) alertas.push(`Tus compromisos consumen el ${porcentajeGastado}% de tu salario. Revisá si podés reducir gastos.`);
        if (porCategoria["suscripcion"] > salarioMensual * 0.1) alertas.push("Tus suscripciones superan el 10% de tu salario.");
        if (disponible < 0) alertas.push("Tus compromisos superan tu salario mensual. Estás en números rojos.");

        return { salarioMensual, totalCompromisos, porcentajeGastado, disponible, porCategoria, alertas };
    },
}));