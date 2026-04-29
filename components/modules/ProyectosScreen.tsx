"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt } from "@/lib/utils";
import { Sheet, ConfirmDialog } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import EmojiPicker from "./compromisos/EmojiPicker";
import type { MetaProyecto, MetaAporte, Moneda } from "@/types";

type ProyectosTab = "metas" | "prestamos";

export default function ProyectosScreen() {
    const [tab, setTab] = useState<ProyectosTab>("metas");

    return (
        <div className="page fade-in">
            <div style={{ marginBottom: "var(--space-3)" }}>
                <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                    🎯 Proyectos
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                    Planificá tus metas y simulá préstamos
                </p>
            </div>

            <div className="tab-pills">
                <button className={`tab-pill${tab === "metas" ? " active" : ""}`} onClick={() => setTab("metas")}>
                    🏆 Metas
                </button>
                <button className={`tab-pill${tab === "prestamos" ? " active" : ""}`} onClick={() => setTab("prestamos")}>
                    🏦 Préstamos
                </button>
            </div>

            {tab === "metas" ? <MetasTab /> : <PrestamosTab />}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function fmtFecha(date: Date): string {
    return date.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
}

// ─── Tab Metas ────────────────────────────────────────────────────────────────
function MetasTab() {
    const { metas, metaAportes, addMeta, deleteMeta, updateMeta, addMetaAporte, deleteMetaAporte, getFinanzasStats, tipoCambio, settings } = useStore();
    const stats = getFinanzasStats();
    const ahorroDisponible = Math.max(0, stats.disponible);
    const perfil = settings.perfil;
    // Monto que corresponde a la meta de ahorro configurada (ej: 10% del salario)
    const montoMetaAhorro = perfil?.metaAhorro
        ? Math.round(stats.salarioMensual * perfil.metaAhorro / 100)
        : null;

    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    return (
        <>
            {/* Resumen */}
            <div style={{
                background: "var(--color-bg-elevated)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3) var(--space-4)",
                marginBottom: "var(--space-3)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>Ahorro mensual disponible</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xl)", color: ahorroDisponible > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                        {fmt(ahorroDisponible)}
                    </p>
                    {montoMetaAhorro && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            Meta de ahorro: {fmt(montoMetaAhorro)} ({perfil!.metaAhorro}%)
                        </p>
                    )}
                </div>
                <button
                    className="btn btn-secondary"
                    style={{ minHeight: 36, fontSize: "var(--text-xs)", padding: "0 var(--space-3)", display: "flex", alignItems: "center", gap: 4 }}
                    onClick={() => setShowForm(true)}
                >
                    <Plus size={14} /> Nueva meta
                </button>
            </div>

            {ahorroDisponible <= 0 && (
                <div style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid var(--color-danger)",
                    borderRadius: "var(--radius-md)", padding: "var(--space-3)",
                    fontSize: "var(--text-xs)", color: "var(--color-danger)", marginBottom: "var(--space-3)",
                }}>
                    ⚠️ Tu ahorro disponible es ₡0 o negativo. Ajustá tus gastos en Finanzas para poder proyectar metas.
                </div>
            )}

            {metas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-4)" }}>
                    <p style={{ fontSize: 48, marginBottom: "var(--space-3)" }}>🏆</p>
                    <p style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: "var(--space-1)" }}>Sin metas aún</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                        Creá tu primera meta — carro, viaje, fondo de emergencia — y la app te dice cuándo la lográs.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {metas.map((meta) => (
                        <MetaCard
                            key={meta.id}
                            meta={meta}
                            aportes={metaAportes.filter((a) => a.metaId === meta.id)}
                            ahorroDisponible={ahorroDisponible}
                            tipoCambio={tipoCambio}
                            onDelete={() => setConfirmDelete(meta.id)}
                            onUpdateAhorro={(val) => updateMeta(meta.id, { ahorroPersonalizado: val })}
                            onAddAporte={(monto, nota) => addMetaAporte({
                                metaId: meta.id,
                                metaNombre: meta.nombre,
                                monto,
                                nota,
                                fecha: new Date().toISOString().split("T")[0],
                            })}
                            onDeleteAporte={(id, monto) => deleteMetaAporte(id, meta.id, monto)}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <MetaFormSheet
                    ahorroDisponible={ahorroDisponible}
                    montoMetaAhorro={montoMetaAhorro}
                    onGuardar={(data) => { addMeta(data); setShowForm(false); }}
                    onClose={() => setShowForm(false)}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar esta meta? Esta acción no se puede deshacer."
                    onConfirm={() => { deleteMeta(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </>
    );
}

// ─── Tarjeta de meta ──────────────────────────────────────────────────────────
function MetaCard({ meta, aportes, ahorroDisponible, tipoCambio, onDelete, onUpdateAhorro, onAddAporte, onDeleteAporte }: {
    meta: MetaProyecto;
    aportes: MetaAporte[];
    ahorroDisponible: number;
    tipoCambio: number;
    onDelete: () => void;
    onUpdateAhorro: (val: number) => void;
    onAddAporte: (monto: number, nota?: string) => void;
    onDeleteAporte: (id: string, monto: number) => void;
}) {
    const [expandida, setExpandida] = useState(false);
    const [editandoAhorro, setEditandoAhorro] = useState(false);
    const [ahorroInput, setAhorroInput] = useState(String(meta.ahorroPersonalizado ?? ""));
    const [showAporte, setShowAporte] = useState(false);
    const [aporteInput, setAporteInput] = useState("");
    const [aporteNota, setAporteNota] = useState("");
    const [showAportes, setShowAportes] = useState(false);

    const ahorro = (meta.ahorroPersonalizado && meta.ahorroPersonalizado > 0) ? meta.ahorroPersonalizado : ahorroDisponible;
    const objetivoCRC = meta.moneda === "USD" ? meta.montoObjetivo * tipoCambio : meta.montoObjetivo;
    const acumulado = meta.montoAcumulado ?? 0;
    const restante = Math.max(0, objetivoCRC - acumulado);
    const progresoPct = objetivoCRC > 0 ? Math.min(100, Math.round((acumulado / objetivoCRC) * 100)) : 0;
    const meses = ahorro > 0 && restante > 0 ? Math.ceil(restante / ahorro) : restante === 0 ? 0 : null;
    const fechaEstimada = meses ? addMonths(new Date(), meses) : null;
    const completada = acumulado >= objetivoCRC;

    const años = meses ? Math.floor(meses / 12) : 0;
    const mesesRestantes = meses ? meses % 12 : 0;
    const tiempoStr = meses === null ? "—"
        : meses === 0 ? "¡Cumplida!"
        : años > 0 && mesesRestantes > 0 ? `${años} año${años > 1 ? "s" : ""} y ${mesesRestantes} mes${mesesRestantes > 1 ? "es" : ""}`
        : años > 0 ? `${años} año${años > 1 ? "s" : ""}`
        : `${meses} mes${meses > 1 ? "es" : ""}`;

    const urgencia = completada ? "#22c55e"
        : meses !== null && meses <= 6 ? "var(--color-success)"
        : meses !== null && meses <= 24 ? "var(--color-warning)"
        : "var(--color-primary)";

    const handleGuardarAhorro = () => {
        const val = parseFloat(ahorroInput);
        if (!ahorroInput || isNaN(val) || val <= 0) return;
        onUpdateAhorro(val);
        setEditandoAhorro(false);
    };

    return (
        <div style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
        }}>
            {/* ── Fila compacta (siempre visible) ── */}
            <div
                onClick={() => setExpandida((v) => !v)}
                style={{
                    padding: "var(--space-3) var(--space-4)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "var(--space-3)",
                }}
            >
                <span style={{ fontSize: 26, flexShrink: 0 }}>{meta.icono || "🎯"}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre + monto */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {meta.nombre}
                        </p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)", flexShrink: 0, marginLeft: 8 }}>
                            {meta.moneda === "USD" ? "$" : "₡"}{meta.montoObjetivo.toLocaleString("es-CR")}
                        </p>
                    </div>
                    {/* Mini barra */}
                    <div style={{ height: 5, borderRadius: 3, background: "var(--color-bg)", overflow: "hidden", marginBottom: 4 }}>
                        <div style={{
                            height: "100%", width: `${Math.max(progresoPct > 0 ? 2 : 0, progresoPct)}%`,
                            background: urgencia, borderRadius: 3, transition: "width 0.4s ease",
                        }} />
                    </div>
                    {/* % + tiempo */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                            {completada ? "🎉 ¡Meta cumplida!" : `${progresoPct}% · faltan ${fmt(restante)}`}
                        </span>
                        <span style={{ fontSize: 10, color: urgencia, fontWeight: 600 }}>
                            {tiempoStr}
                            {fechaEstimada && !completada && ` · ${fechaEstimada.toLocaleDateString("es-CR", { month: "short", year: "numeric" })}`}
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <span style={{ fontSize: 11, color: "var(--color-text-3)", flexShrink: 0, transition: "transform 0.2s", display: "inline-block", transform: expandida ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </div>

            {/* ── Detalle expandible ── */}
            {expandida && (
                <div style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-3) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>

                    {/* Monto en CRC equivalente si es USD */}
                    {meta.moneda === "USD" && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            ≈ {fmt(objetivoCRC)} al tipo de cambio actual
                        </p>
                    )}

                    {/* Proyección 2x2 */}
                    <div style={{
                        background: "var(--color-bg)", borderRadius: "var(--radius-md)",
                        padding: "var(--space-3)", display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: "var(--space-2)",
                    }}>
                        <div>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 2 }}>Tiempo estimado</p>
                            <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: urgencia }}>{tiempoStr}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 2 }}>Fecha estimada</p>
                            <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                {completada ? "¡Ya!" : fechaEstimada ? fmtFecha(fechaEstimada) : "Sin ahorro"}
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 2 }}>Ahorrado</p>
                            <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: completada ? "#22c55e" : "var(--color-text)" }}>{fmt(acumulado)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 2 }}>
                                {meta.ahorroPersonalizado ? "Aportás por mes" : "Usando todo tu ahorro"}
                            </p>
                            <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: meta.ahorroPersonalizado ? "var(--color-primary)" : "var(--color-text-3)" }}>
                                {fmt(ahorro)}
                            </p>
                        </div>
                    </div>

                    {/* Barra progreso detallada */}
                    <div>
                        <div style={{ height: 8, borderRadius: 4, background: "var(--color-bg)", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: `${Math.max(progresoPct > 0 ? 2 : 0, progresoPct)}%`,
                                background: completada ? "#22c55e" : urgencia,
                                borderRadius: 4, transition: "width 0.6s ease",
                            }} />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }}
                            onClick={() => setShowAporte(!showAporte)}
                            disabled={completada}
                        >
                            💰 Registrar aporte
                        </button>
                        {aportes.length > 0 && (
                            <button
                                className="btn btn-ghost"
                                style={{ fontSize: "var(--text-xs)", minHeight: 34, padding: "0 var(--space-3)" }}
                                onClick={() => setShowAportes(!showAportes)}
                            >
                                {showAportes ? "Ocultar" : `${aportes.length} aportes`}
                            </button>
                        )}
                        <button
                            onClick={onDelete}
                            style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--color-text-3)", padding: "0 10px", minHeight: 34 }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Formulario de aporte */}
                    {showAporte && (
                        <div style={{ background: "var(--color-bg)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>₡</span>
                                <input
                                    className="input"
                                    type="number"
                                    value={aporteInput}
                                    placeholder={String(Math.round(ahorro))}
                                    style={{ flex: 1, minHeight: 36 }}
                                    autoFocus
                                    onChange={(e) => setAporteInput(e.target.value)}
                                />
                            </div>
                            <input
                                className="input"
                                value={aporteNota}
                                placeholder="Nota opcional (ej: quincena de abril)"
                                style={{ minHeight: 36 }}
                                onChange={(e) => setAporteNota(e.target.value)}
                            />
                            <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                <button className="btn btn-primary" style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }}
                                    onClick={() => {
                                        const val = parseFloat(aporteInput);
                                        if (!val || val <= 0) return;
                                        onAddAporte(val, aporteNota || undefined);
                                        setAporteInput(""); setAporteNota(""); setShowAporte(false);
                                    }}>
                                    Guardar
                                </button>
                                <button className="btn btn-ghost" style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }} onClick={() => setShowAporte(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Historial de aportes */}
                    {showAportes && aportes.length > 0 && (
                        <div style={{ background: "var(--color-bg)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                            {aportes.map((a) => (
                                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-1) 0", borderBottom: "1px solid var(--color-border)" }}>
                                    <div>
                                        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text)" }}>{fmt(a.monto)}</p>
                                        <p style={{ fontSize: 10, color: "var(--color-text-3)" }}>{a.fecha}{a.nota ? ` · ${a.nota}` : ""}</p>
                                    </div>
                                    <button onClick={() => onDeleteAporte(a.id, a.monto)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", padding: 4 }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Editor aporte mensual */}
                    {!editandoAhorro ? (
                        <button
                            onClick={() => { setAhorroInput(String(meta.ahorroPersonalizado ?? "")); setEditandoAhorro(true); }}
                            style={{
                                width: "100%", minHeight: 34,
                                background: "var(--color-bg)", border: "1px dashed var(--color-border)",
                                borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)",
                                color: "var(--color-text-3)", cursor: "pointer",
                            }}
                        >
                            {meta.ahorroPersonalizado
                                ? `✏️ Aporte mensual: ${fmt(meta.ahorroPersonalizado)}`
                                : "💡 Personalizar aporte mensual"}
                        </button>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                Monto mensual para esta meta (disponible: {fmt(ahorroDisponible)})
                            </p>
                            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text-3)" }}>₡</span>
                                <input
                                    className="input" type="number"
                                    value={ahorroInput}
                                    placeholder={String(Math.round(ahorroDisponible))}
                                    style={{ flex: 1, minHeight: 38 }}
                                    autoFocus
                                    onChange={(e) => setAhorroInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleGuardarAhorro(); if (e.key === "Escape") setEditandoAhorro(false); }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                <button className="btn btn-primary" style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }} onClick={handleGuardarAhorro}>Guardar</button>
                                <button className="btn btn-ghost" style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }} onClick={() => setEditandoAhorro(false)}>Cancelar</button>
                                {meta.ahorroPersonalizado && (
                                    <button className="btn btn-ghost" style={{ fontSize: "var(--text-xs)", minHeight: 34, color: "var(--color-text-3)" }}
                                        onClick={() => { onUpdateAhorro(-1); setEditandoAhorro(false); }}>
                                        Usar todo
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Formulario nueva meta ─────────────────────────────────────────────────────
function MetaFormSheet({ onGuardar, onClose, ahorroDisponible, montoMetaAhorro }: {
    onGuardar: (data: Omit<MetaProyecto, "id">) => void;
    onClose: () => void;
    ahorroDisponible: number;
    montoMetaAhorro: number | null;
}) {
    // Default inteligente: meta de ahorro configurada, si no, todo el disponible
    const defaultAhorro = montoMetaAhorro ?? ahorroDisponible;

    const [nombre, setNombre] = useState("");
    const [monto, setMonto] = useState("");
    const [moneda, setMoneda] = useState<Moneda>("CRC");
    const [icono, setIcono] = useState("🎯");
    const [descripcion, setDescripcion] = useState("");
    const [aporteMensual, setAporteMensual] = useState(String(Math.round(defaultAhorro)));
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleGuardar = () => {
        const errs: Record<string, boolean> = {};
        if (!nombre.trim()) errs.nombre = true;
        if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) errs.monto = true;
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        const aporteVal = parseFloat(aporteMensual);
        onGuardar({
            nombre: nombre.trim(),
            montoObjetivo: parseFloat(monto),
            moneda,
            icono: icono || "🎯",
            descripcion: descripcion.trim() || undefined,
            ahorroPersonalizado: !isNaN(aporteVal) && aporteVal > 0 ? aporteVal : undefined,
        });
    };

    // Preview en vivo
    const montoVal = parseFloat(monto) || 0;
    const aporteVal = parseFloat(aporteMensual) || 0;
    const mesesPreview = montoVal > 0 && aporteVal > 0 ? Math.ceil(montoVal / aporteVal) : null;
    const fechaPreview = mesesPreview ? addMonths(new Date(), mesesPreview) : null;
    const añosP = mesesPreview ? Math.floor(mesesPreview / 12) : 0;
    const mesesP = mesesPreview ? mesesPreview % 12 : 0;
    const tiempoPreview = mesesPreview === null ? null
        : añosP > 0 && mesesP > 0 ? `${añosP} año${añosP > 1 ? "s" : ""} y ${mesesP} mes${mesesP > 1 ? "es" : ""}`
        : añosP > 0 ? `${añosP} año${añosP > 1 ? "s" : ""}`
        : `${mesesPreview} mes${mesesPreview > 1 ? "es" : ""}`;

    return (
        <Sheet title="Nueva meta" onClose={onClose}>
            <EmojiPicker value={icono} onChange={setIcono} />

            <div className="input-group">
                <label className="input-label" style={{ color: errors.nombre ? "var(--color-danger)" : "var(--color-primary)" }}>
                    Nombre {errors.nombre && "— requerido"} *
                </label>
                <input
                    className="input"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: false })); }}
                    placeholder="Ej: Carro, Viaje a Europa, Fondo de emergencia..."
                />
            </div>

            {/* ── Paso 1: ¿Cuánto necesitás? ── */}
            <div className="input-group">
                <label className="input-label" style={{ color: errors.monto ? "var(--color-danger)" : "var(--color-primary)" }}>
                    1️⃣ ¿Cuánto necesitás en total? {errors.monto && "— requerido"} *
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                    {(["CRC", "USD"] as Moneda[]).map((m) => (
                        <button key={m} type="button"
                            className={`btn ${moneda === m ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                            onClick={() => setMoneda(m)}
                        >
                            {m === "CRC" ? "₡ Colones" : "$ Dólares"}
                        </button>
                    ))}
                </div>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>
                        {moneda === "USD" ? "$" : "₡"}
                    </span>
                    <input
                        className="input"
                        type="number"
                        value={monto}
                        placeholder="0"
                        style={{ paddingLeft: 28, borderColor: errors.monto ? "var(--color-danger)" : undefined }}
                        onChange={(e) => { setMonto(e.target.value); setErrors((p) => ({ ...p, monto: false })); }}
                    />
                </div>
            </div>

            {/* ── Paso 2: ¿Cuánto ahorrás por mes para esto? ── */}
            <div className="input-group">
                <label className="input-label" style={{ color: "var(--color-primary)" }}>
                    2️⃣ ¿Cuánto ahorrás por mes para esto?
                </label>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                    Elegí cuánto de tu ahorro mensual querés dedicar a esta meta.
                    {montoMetaAhorro
                        ? ` Tu meta de ahorro configurada es ${fmt(montoMetaAhorro)}.`
                        : ` Tenés ${fmt(ahorroDisponible)} disponibles.`}
                </p>
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)", flexWrap: "wrap" }}>
                    {montoMetaAhorro && (
                        <button type="button"
                            className={`btn ${aporteMensual === String(Math.round(montoMetaAhorro)) ? "btn-primary" : "btn-secondary"}`}
                            style={{ fontSize: 11, minHeight: 32, padding: "0 var(--space-3)" }}
                            onClick={() => setAporteMensual(String(Math.round(montoMetaAhorro)))}
                        >
                            🎯 Mi meta ({fmt(montoMetaAhorro)})
                        </button>
                    )}
                    {[25, 50, 75, 100].map((pct) => {
                        const val = Math.round(ahorroDisponible * pct / 100);
                        return (
                            <button key={pct} type="button"
                                className={`btn ${aporteMensual === String(val) ? "btn-primary" : "btn-secondary"}`}
                                style={{ fontSize: 11, minHeight: 32, padding: "0 var(--space-2)" }}
                                onClick={() => setAporteMensual(String(val))}
                            >
                                {pct}%
                            </button>
                        );
                    })}
                </div>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>₡</span>
                    <input
                        className="input"
                        type="number"
                        value={aporteMensual}
                        placeholder={String(Math.round(defaultAhorro))}
                        style={{ paddingLeft: 28 }}
                        onChange={(e) => setAporteMensual(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Preview en vivo ── */}
            {tiempoPreview && (
                <div style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-primary)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                    textAlign: "center",
                    marginBottom: "var(--space-2)",
                }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                        📊 Con {fmt(aporteVal)}/mes llegás a tu meta en
                    </p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xl)", color: "var(--color-primary)" }}>
                        {tiempoPreview}
                    </p>
                    {fechaPreview && (
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 4 }}>
                            📅 {fmtFecha(fechaPreview)}
                        </p>
                    )}
                </div>
            )}

            <div className="input-group">
                <label className="input-label">Descripción (opcional)</label>
                <input
                    className="input"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Toyota Yaris 2025, viaje en diciembre..."
                />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleGuardar}>
                Crear meta
            </button>
        </Sheet>
    );
}

// ─── Tab Préstamos ────────────────────────────────────────────────────────────
function PrestamosTab() {
    const { tipoCambio } = useStore();
    const [moneda, setMoneda] = useState<Moneda>("CRC");
    const [monto, setMonto] = useState("");
    const [tasa, setTasa] = useState("");
    const [plazo, setPlazo] = useState("");

    const montoCRC = monto ? (moneda === "USD" ? parseFloat(monto) * tipoCambio : parseFloat(monto)) : 0;
    const tasaMensual = tasa ? parseFloat(tasa) / 12 / 100 : 0;
    const n = plazo ? parseInt(plazo) : 0;

    const cuota = montoCRC > 0 && n > 0
        ? tasaMensual === 0
            ? montoCRC / n
            : montoCRC * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1)
        : 0;

    const totalPagado = cuota * n;
    const totalIntereses = totalPagado - montoCRC;
    const calculado = cuota > 0;

    const PLAZOS_RAPIDOS = [12, 24, 36, 48, 60, 84];

    return (
        <>
            <div style={{
                background: "var(--color-bg-elevated)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                marginBottom: "var(--space-3)",
                display: "flex", flexDirection: "column", gap: "var(--space-3)",
            }}>
                {/* Moneda */}
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {(["CRC", "USD"] as Moneda[]).map((m) => (
                        <button key={m} type="button"
                            className={`btn ${moneda === m ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 36 }}
                            onClick={() => setMoneda(m)}
                        >
                            {m === "CRC" ? "₡ Colones" : "$ Dólares"}
                        </button>
                    ))}
                </div>

                {/* Monto */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Monto del préstamo</label>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>
                            {moneda === "USD" ? "$" : "₡"}
                        </span>
                        <input className="input" type="number" value={monto} placeholder="0"
                            style={{ paddingLeft: 28 }}
                            onChange={(e) => setMonto(e.target.value)} />
                    </div>
                </div>

                {/* Tasa */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Tasa de interés anual (%)</label>
                    <div style={{ position: "relative" }}>
                        <input className="input" type="number" value={tasa} placeholder="Ej: 15"
                            style={{ paddingRight: 36 }}
                            onChange={(e) => setTasa(e.target.value)} />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: "var(--text-sm)", color: "var(--color-text-3)", fontWeight: 600 }}>%</span>
                    </div>
                </div>

                {/* Plazo */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Plazo (meses)</label>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
                        {PLAZOS_RAPIDOS.map((p) => (
                            <button key={p} type="button"
                                className={`btn ${plazo === String(p) ? "btn-primary" : "btn-secondary"}`}
                                style={{ fontSize: 11, minHeight: 30, padding: "0 var(--space-2)" }}
                                onClick={() => setPlazo(String(p))}
                            >
                                {p >= 12 ? `${p / 12}a` : `${p}m`}
                            </button>
                        ))}
                    </div>
                    <input className="input" type="number" value={plazo} placeholder="Ej: 36"
                        onChange={(e) => setPlazo(e.target.value)} />
                </div>
            </div>

            {/* Resultado */}
            {calculado && (
                <div style={{
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-primary)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-4)",
                    display: "flex", flexDirection: "column", gap: "var(--space-3)",
                }}>
                    <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-primary)" }}>📊 Resultado</p>

                    {/* Cuota destacada */}
                    <div style={{ textAlign: "center", padding: "var(--space-3)", background: "var(--color-bg)", borderRadius: "var(--radius-md)" }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Cuota mensual</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-primary)" }}>
                            {fmt(cuota)}
                        </p>
                    </div>

                    {/* Desglose */}
                    {[
                        ["Préstamo original", fmt(montoCRC)],
                        ["Total a pagar", fmt(totalPagado)],
                        ["Total en intereses", fmt(totalIntereses)],
                        ["Duración", `${n} meses (${(n / 12).toFixed(1)} años)`],
                    ].map(([label, valor]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)" }}>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{label}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: label === "Total en intereses" ? "var(--color-warning)" : "var(--color-text)" }}>{valor}</span>
                        </div>
                    ))}

                    {/* Barra préstamo vs intereses */}
                    <div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-1)" }}>
                            Capital vs Intereses
                        </p>
                        <div style={{ height: 10, borderRadius: 5, background: "var(--color-bg)", overflow: "hidden", display: "flex" }}>
                            <div style={{ height: "100%", width: `${Math.round((montoCRC / totalPagado) * 100)}%`, background: "var(--color-primary)", transition: "width 0.5s" }} />
                            <div style={{ height: "100%", flex: 1, background: "var(--color-warning)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: "var(--color-primary)" }}>Capital {Math.round((montoCRC / totalPagado) * 100)}%</span>
                            <span style={{ fontSize: 10, color: "var(--color-warning)" }}>Intereses {Math.round((totalIntereses / totalPagado) * 100)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
