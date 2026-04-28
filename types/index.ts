export type CategoriaCompromiso =
    | "suscripcion"
    | "prestamo"
    | "tarjeta"
    | "servicio"
    | "alquiler"
    | "salud"
    | "mascotas"
    | "educacion"
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
    nombreUsuario: string;
    spaceId?: string;
    perfil?: PerfilFinanciero;
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
    moneda?: Moneda;              // ₡ CRC por defecto
    notas?: string;
    color?: string;
    icono?: string;
    esDeuda?: boolean;
    montoTotal?: number;
    cuotasTotales?: number;
    cuotasPagadas?: number;
    fechaFinEstimada?: string;
    // Sharing selectivo
    spaceOwner?: string;           // userId del dueño original
    spaceOwnerId?: string;         // spaceId del dueño original
    compromisoOriginalId?: string; // id del compromiso en el space del dueño
    compartidoCon?: string[];                    // userIds con quienes está compartido
    compartidoConSpaces?: Record<string, string>; // { [userId]: spaceId } del destinatario
    // docId de la copia en el space del destinatario — permite borrado directo
    compartidoConDocIds?: Record<string, string>; // { [userId]: docId }
    esCompartido?: boolean;                      // true si es un compromiso compartido con este usuario
    creadoEn?: any;
    actualizadoEn?: any;
}

export type FrecuenciaSalario = "semanal" | "quincenal" | "mensual";
export type Moneda = "CRC" | "USD";

export interface PerfilFinanciero {
    salario: number;
    frecuenciaSalario: FrecuenciaSalario;
    monedaSalario: Moneda;        // ₡ o $
    salarioMensual: number;       // siempre en CRC (calculado con tipo de cambio del momento)
    meta?: number;                // % máximo a gastar en compromisos
}

export interface AppSettings {
    notificacionesPush: boolean;
    diasAntesPorDefecto: number;
    nombreUsuario: string;
    spaceId?: string;
    perfil?: PerfilFinanciero;
}
export type PeriodoGastoVariable = "mensual" | "quincenal" | "semanal";

export interface GastoVariable {
    id: string;
    nombre: string;
    categoria: CategoriaCompromiso;
    presupuesto: number;
    moneda?: Moneda;
    icono?: string;
    periodo: PeriodoGastoVariable;
    creadoEn?: any;
}

export interface GastoVariableEntrada {
    id: string;
    gastoVariableId: string;
    gastoVariableNombre: string;
    monto: number;
    moneda?: Moneda;
    descripcion?: string;
    fecha: string;           // YYYY-MM-DD
    pagadoPor?: string;
    pagadoPorNombre?: string;
    creadoEn?: any;
}

export interface InvitacionCompartir {
    id: string;
    compromisoId: string;
    compromisoNombre: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    estado: "pendiente" | "aceptada" | "rechazada";
    creadoEn?: any;
}