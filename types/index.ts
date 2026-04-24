export type CategoriaCompromiso =
    | "suscripcion"
    | "prestamo"
    | "tarjeta"
    | "servicio"
    | "alquiler"
    | "otro";

export type FrecuenciaCompromiso =
    | "semanal"
    | "quincenal"
    | "mensual"
    | "bimestral"
    | "trimestral"
    | "semestral"
    | "anual";

export type EstadoCompromiso = "activo" | "pausado" | "pagado";

export interface Compromiso {
    id: string;
    nombre: string;
    categoria: CategoriaCompromiso;
    monto: number;
    frecuencia: FrecuenciaCompromiso;
    proximaFecha: string;
    diasAntes: number;
    estado: EstadoCompromiso;
    notas?: string;
    color?: string;
    icono?: string;
    creadoEn?: any;
    actualizadoEn?: any;
}

export interface HistorialPago {
    id: string;
    compromisoId: string;
    compromisoNombre: string;
    monto: number;
    fecha: string;
    notas?: string;
    referencia?: string;
    comprobante?: string;
    pagadoPor?: string;
    pagadoPorNombre?: string;
    creadoEn?: any;
}

export interface Space {
    id: string;
    inviteCode: string;
    createdBy: string;
    members: string[];
    memberNames: Record<string, string>;
    creadoEn?: any;
}

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    photoURL?: string;
}

export interface AppSettings {
    notificacionesPush: boolean;
    diasAntesPorDefecto: number;
    nombreUsuario: string;
    spaceId?: string;
}
export interface Compromiso {
    id: string;
    nombre: string;
    categoria: CategoriaCompromiso;
    monto: number;
    frecuencia: FrecuenciaCompromiso;
    proximaFecha: string;
    diasAntes: number;
    estado: EstadoCompromiso;
    notas?: string;
    color?: string;
    icono?: string;
    // ─── Tracker de deuda ─────────────────────────────────────
    esDeuda?: boolean;
    montoTotal?: number;
    cuotasTotales?: number;
    cuotasPagadas?: number;
    fechaFinEstimada?: string;
    // ──────────────────────────────────────────────────────────
    creadoEn?: any;
    actualizadoEn?: any;
}