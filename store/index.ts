"use client";
import { create } from "zustand";
import type { Compromiso, HistorialPago, AppSettings, Space, PerfilFinanciero, Moneda, GastoVariable, GastoVariableEntrada, PeriodoGastoVariable, InvitacionCompartir, MetaProyecto } from "@/types";
import { compromisosService, historialService, settingsService, spacesService, gastosVariablesService, gastosVariableEntradasService, invitacionesService, metasService } from "@/lib/firestore";
import { calcProximaFecha } from "@/lib/utils";

interface AppStore {
    compromisos: Compromiso[];
    historial: HistorialPago[];
    gastosVariables: GastoVariable[];
    gastosVariableEntradas: GastoVariableEntrada[];
    invitaciones: InvitacionCompartir[];
    metas: MetaProyecto[];
    addMeta: (m: Omit<MetaProyecto, "id">) => Promise<void>;
    updateMeta: (id: string, data: Partial<MetaProyecto>) => Promise<void>;
    deleteMeta: (id: string) => Promise<void>;
    settings: AppSettings;
    space: Space | null;
    activeTab: string;
    userId: string | null;
    userName: string | null;
    categoriaAbierta: string | null;
    tipoCambio: number;
    tipoCambioActualizado: string | null;
    fetchTipoCambio: () => Promise<void>;
    addGastoVariable: (g: Omit<GastoVariable, "id">) => Promise<void>;
    updateGastoVariable: (id: string, data: Partial<GastoVariable>) => Promise<void>;
    deleteGastoVariable: (id: string) => Promise<void>;
    addGastoVariableEntrada: (e: Omit<GastoVariableEntrada, "id">) => Promise<void>;
    deleteGastoVariableEntrada: (id: string) => Promise<void>;
    aceptarInvitacion: (invitacionId: string) => Promise<{ ok: boolean; error?: string }>;
    rechazarInvitacion: (invitacionId: string) => Promise<void>;

    updatePerfil: (perfil: PerfilFinanciero) => void;
    getFinanzasStats: () => {
        salarioMensual: number;
        totalCompromisos: number;
        totalVariablePresupuestado: number;
        totalVariableGastado: number;
        porcentajeGastado: number;
        disponible: number;
        capacidadAhorro: number;
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

// Convierte monto a CRC según moneda y tipo de cambio, luego normaliza a mensual
const calcMensualCRC = (monto: number, frecuencia: string, moneda: Moneda = "CRC", tipoCambio: number = 515): number => {
    const montoCRC = moneda === "USD" ? monto * tipoCambio : monto;
    switch (frecuencia) {
        case "semanal": return montoCRC * 4.33;
        case "quincenal": return montoCRC * 2;
        case "mensual": return montoCRC;
        case "bimestral": return montoCRC / 2;
        case "trimestral": return montoCRC / 3;
        case "semestral": return montoCRC / 6;
        case "anual": return montoCRC / 12;
        default: return montoCRC;
    }
};

const calcSalarioMensualCRC = (salario: number, frecuencia: string, moneda: Moneda = "CRC", tipoCambio: number = 515): number => {
    const base = moneda === "USD" ? salario * tipoCambio : salario;
    switch (frecuencia) {
        case "quincenal": return base * 2;
        case "semanal": return base * 4.33;
        default: return base;
    }
};
export const useStore = create<AppStore>()((set, get) => ({
    compromisos: [],
    historial: [],
    gastosVariables: [],
    gastosVariableEntradas: [],
    invitaciones: [],
    metas: [],
    space: null,
    activeTab: "dashboard",
    userId: null,
    userName: null,
    categoriaAbierta: null,
    tipoCambio: 515,
    tipoCambioActualizado: null,
    settings: {
        notificacionesPush: false,
        diasAntesPorDefecto: 3,
        nombreUsuario: "",
    },

    setUserId: (id) => set({ userId: id }),
    setUserName: (name) => set({ userName: name }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setCategoriaAbierta: (cat) => set({ categoriaAbierta: cat }),

    fetchTipoCambio: async () => {
        const { tipoCambioActualizado } = get();
        // Solo actualiza si no hay dato o tiene más de 1 hora
        if (tipoCambioActualizado) {
            const diff = Date.now() - new Date(tipoCambioActualizado).getTime();
            if (diff < 60 * 60 * 1000) return;
        }
        try {
            const res = await fetch("/api/tipo-cambio");
            const data = await res.json();
            if (data.crc) set({ tipoCambio: data.crc, tipoCambioActualizado: new Date().toISOString() });
        } catch {
            // Mantener el valor actual si falla
        }
    },

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
        const { space, userId } = get();
        if (!space) return () => { };
        const unsubCompromisos = compromisosService.subscribe(space.id, (compromisos) => set({ compromisos }));
        const unsubHistorial = historialService.subscribe(space.id, (historial) => set({ historial }));
        const unsubSpace = spacesService.subscribe(space.id, (space) => set({ space }));
        const unsubGastosVariables = gastosVariablesService.subscribe(space.id, (gastosVariables) => set({ gastosVariables }));
        const unsubGastosEntradas = gastosVariableEntradasService.subscribe(space.id, (gastosVariableEntradas) => set({ gastosVariableEntradas }));
        const unsubInvitaciones = userId
            ? invitacionesService.subscribe(userId, (invitaciones) => set({ invitaciones }))
            : () => { };
        const unsubMetas = metasService.subscribe(space.id, (metas) => set({ metas }));
        return () => { unsubCompromisos(); unsubHistorial(); unsubSpace(); unsubGastosVariables(); unsubGastosEntradas(); unsubInvitaciones(); unsubMetas(); };
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
        const compromiso = get().compromisos.find((c) => c.id === id);
        set((s) => ({ compromisos: s.compromisos.filter((c) => c.id !== id) }));
        compromisosService.delete(space.id, id).catch(console.error);
        // Si estaba compartido, borrar las copias vía API (Admin SDK, sin restricciones de rules)
        if (compromiso && (compromiso.compartidoCon?.length ?? 0) > 0) {
            fetch("/api/sharing/delete-copies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    compromisoId: id,
                    compartidoCon: compromiso.compartidoCon ?? [],
                    compartidoConSpaces: compromiso.compartidoConSpaces ?? {},
                    compartidoConDocIds: compromiso.compartidoConDocIds ?? {},
                }),
            }).catch(console.error);
        }
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

        // Si es un compromiso compartido (copia), también escribir en el space del dueño
        // con el compromisoOriginalId para que aparezca en el historial del dueño
        if (compromiso.esCompartido && compromiso.spaceOwnerId && compromiso.compromisoOriginalId) {
            historialService.add(compromiso.spaceOwnerId, {
                ...pago,
                compromisoId: compromiso.compromisoOriginalId,
            }).catch(console.error);
        }

        const nuevaFecha = calcProximaFecha(compromiso.proximaFecha, compromiso.frecuencia);
        set((s) => ({
            compromisos: s.compromisos.map((c) =>
                c.id === id ? { ...c, proximaFecha: nuevaFecha } : c
            ).sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha)),
        }));
        compromisosService.update(space.id, id, { proximaFecha: nuevaFecha }).catch(console.error);

        if (space.members.length > 1) {
            // Notificar pago
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

            // Notificar comprobante si hay foto
            if (comprobante) {
                fetch("/api/notifications/member-action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        spaceId: space.id,
                        fromUserId: userId,
                        action: "comprobante",
                        nombre: compromiso.nombre,
                        monto: compromiso.monto,
                    }),
                }).catch(console.error);
            }
        }
    },

    addGastoVariable: async (g) => {
        const { space } = get();
        if (!space) return;
        const tempId = uid();
        set((s) => ({ gastosVariables: [...s.gastosVariables, { ...g, id: tempId }] }));
        gastosVariablesService.add(space.id, g).catch(console.error);
    },

    updateGastoVariable: async (id, data) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ gastosVariables: s.gastosVariables.map((g) => g.id === id ? { ...g, ...data } : g) }));
        gastosVariablesService.update(space.id, id, data).catch(console.error);
    },

    deleteGastoVariable: async (id) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({
            gastosVariables: s.gastosVariables.filter((g) => g.id !== id),
            gastosVariableEntradas: s.gastosVariableEntradas.filter((e) => e.gastoVariableId !== id),
        }));
        gastosVariablesService.delete(space.id, id).catch(console.error);
    },

    addGastoVariableEntrada: async (e) => {
        const { space } = get();
        if (!space) return;
        const tempId = uid();
        set((s) => ({ gastosVariableEntradas: [{ ...e, id: tempId }, ...s.gastosVariableEntradas] }));
        gastosVariableEntradasService.add(space.id, e).catch(console.error);
    },

    deleteGastoVariableEntrada: async (id) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ gastosVariableEntradas: s.gastosVariableEntradas.filter((e) => e.id !== id) }));
        gastosVariableEntradasService.delete(space.id, id).catch(console.error);
    },

    aceptarInvitacion: async (invitacionId) => {
        const { userId, space } = get();
        if (!userId || !space) return { ok: false, error: "Sin sesión" };
        try {
            const res = await fetch("/api/sharing/accept-invitation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitacionId, toUserId: userId, toSpaceId: space.id }),
            });
            const data = await res.json();
            if (!res.ok) return { ok: false, error: data.error ?? "Error al aceptar" };
            return { ok: true };
        } catch {
            return { ok: false, error: "Error de conexión" };
        }
    },

    rechazarInvitacion: async (invitacionId) => {
        const { userId } = get();
        if (!userId) return;
        set((s) => ({ invitaciones: s.invitaciones.filter((i) => i.id !== invitacionId) }));
        invitacionesService.rechazar(userId, invitacionId).catch(console.error);
    },

    addMeta: async (m) => {
        const { space } = get();
        if (!space) return;
        const tempId = uid();
        set((s) => ({ metas: [...s.metas, { ...m, id: tempId }] }));
        metasService.add(space.id, m).catch(console.error);
    },

    updateMeta: async (id, data) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ metas: s.metas.map((m) => m.id === id ? { ...m, ...data } : m) }));
        metasService.update(space.id, id, data).catch(console.error);
    },

    deleteMeta: async (id) => {
        const { space } = get();
        if (!space) return;
        set((s) => ({ metas: s.metas.filter((m) => m.id !== id) }));
        metasService.delete(space.id, id).catch(console.error);
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
        const { compromisos, historial, tipoCambio } = get();
        const hoy = new Date();
        const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];
        const endOfMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split("T")[0];
        const activos = compromisos.filter((c) => c.estado === "activo");
        return {
            totalMensual: activos.reduce((s, c) => s + calcMensualCRC(c.monto, c.frecuencia, c.moneda, tipoCambio), 0),
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
        const { compromisos, settings, tipoCambio, gastosVariables, gastosVariableEntradas } = get();
        const activos = compromisos.filter((c) => c.estado === "activo");
        const perfil = settings.perfil;
        const salarioMensual = perfil
            ? calcSalarioMensualCRC(perfil.salario, perfil.frecuenciaSalario, perfil.monedaSalario ?? "CRC", tipoCambio)
            : 0;
        const totalCompromisos = activos.reduce((s, c) => s + calcMensualCRC(c.monto, c.frecuencia, c.moneda, tipoCambio), 0);

        // Presupuesto variable total normalizado a mensual
        const totalVariablePresupuestado = gastosVariables.reduce((s, g) => {
            const montoCRC = (g.moneda === "USD" ? g.presupuesto * tipoCambio : g.presupuesto);
            const mensual = g.periodo === "semanal" ? montoCRC * 4.33 : g.periodo === "quincenal" ? montoCRC * 2 : montoCRC;
            return s + mensual;
        }, 0);

        // Gasto variable real del período actual
        const hoy = new Date();
        const mesActual = hoy.toISOString().slice(0, 7);
        const totalVariableGastado = gastosVariableEntradas
            .filter((e) => e.fecha.startsWith(mesActual))
            .reduce((s, e) => s + (e.moneda === "USD" ? e.monto * tipoCambio : e.monto), 0);

        const totalTotal = totalCompromisos + totalVariablePresupuestado;
        const porcentajeGastado = salarioMensual > 0
            ? Math.round((totalTotal / salarioMensual) * 100)
            : 0;
        const disponible = salarioMensual - totalTotal;

        const porCategoria = activos.reduce<Record<string, number>>((acc, c) => {
            const montoCRC = calcMensualCRC(c.monto, c.frecuencia, c.moneda, tipoCambio);
            acc[c.categoria] = (acc[c.categoria] ?? 0) + montoCRC;
            return acc;
        }, {});

        const capacidadAhorro = salarioMensual > 0
            ? Math.round((disponible / salarioMensual) * 100)
            : 0;

        const metaAhorro = perfil?.metaAhorro ?? null;

        const alertas: string[] = [];
        if (porcentajeGastado > 70) alertas.push(`Tus compromisos consumen el ${porcentajeGastado}% de tu salario. Revisá si podés reducir gastos.`);
        if (porCategoria["suscripcion"] > salarioMensual * 0.1) alertas.push("Tus suscripciones superan el 10% de tu salario.");
        if (disponible < 0) alertas.push("Tus compromisos y gastos variables superan tu salario. Estás en números rojos.");
        if (metaAhorro !== null && capacidadAhorro < metaAhorro) {
            const faltante = Math.round(salarioMensual * (metaAhorro - capacidadAhorro) / 100);
            alertas.push(`Tu ahorro actual (${capacidadAhorro}%) está por debajo de tu meta (${metaAhorro}%). Te faltan ${new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(faltante)} para llegar.`);
        } else if (metaAhorro === null && capacidadAhorro > 0 && capacidadAhorro < 10) {
            alertas.push(`Tu capacidad de ahorro es del ${capacidadAhorro}%. Se recomienda al menos el 10% del salario.`);
        }

        return { salarioMensual, totalCompromisos, totalVariablePresupuestado, totalVariableGastado, porcentajeGastado, disponible, porCategoria, alertas, capacidadAhorro };
    },
}));