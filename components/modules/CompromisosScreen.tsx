"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt, fmtDate, diasHasta, diasHastaNum, getUrgenciaColor, CATEGORIA_LABEL, CATEGORIA_ICONO, FRECUENCIA_LABEL } from "@/lib/utils";
import { Badge, UrgenciaBadge, Sheet, Select, EmptyState, ConfirmDialog } from "@/components/ui";
import { Plus, Trash2, CheckCircle, Pause, Play } from "lucide-react";
import type { Compromiso } from "@/types";
import { uploadComprobante } from "@/lib/cloudinary";
const CATEGORIA_OPTIONS = [
    { value: "suscripcion", label: "📺 Suscripción" },
    { value: "prestamo", label: "🏦 Préstamo" },
    { value: "tarjeta", label: "💳 Tarjeta" },
    { value: "servicio", label: "⚡ Servicio" },
    { value: "alquiler", label: "🏠 Alquiler" },
    { value: "otro", label: "📋 Otro" },
];

const FRECUENCIA_OPTIONS = [
    { value: "semanal", label: "Semanal" },
    { value: "quincenal", label: "Quincenal" },
    { value: "mensual", label: "Mensual" },
    { value: "bimestral", label: "Bimestral" },
    { value: "trimestral", label: "Trimestral" },
    { value: "semestral", label: "Semestral" },
    { value: "anual", label: "Anual" },
];

const DIAS_OPTIONS = [
    { value: "1", label: "1 día antes" },
    { value: "2", label: "2 días antes" },
    { value: "3", label: "3 días antes" },
    { value: "5", label: "5 días antes" },
    { value: "7", label: "1 semana antes" },
];

const SUGERENCIAS: { nombre: string; icono: string; categoria: string }[] = [
    { nombre: "Netflix", icono: "🎬", categoria: "suscripcion" },
    { nombre: "Spotify", icono: "🎵", categoria: "suscripcion" },
    { nombre: "Disney+", icono: "🏰", categoria: "suscripcion" },
    { nombre: "HBO Max", icono: "📺", categoria: "suscripcion" },
    { nombre: "Amazon Prime", icono: "📦", categoria: "suscripcion" },
    { nombre: "YouTube Premium", icono: "▶️", categoria: "suscripcion" },
    { nombre: "Apple Music", icono: "🍎", categoria: "suscripcion" },
    { nombre: "iCloud", icono: "☁️", categoria: "suscripcion" },
    { nombre: "ChatGPT", icono: "🤖", categoria: "suscripcion" },
    { nombre: "Gimnasio", icono: "💪", categoria: "suscripcion" },
    { nombre: "Gollo", icono: "🏪", categoria: "prestamo" },
    { nombre: "Mexpress",        icono: "🛒", categoria: "prestamo" },
    { nombre: "Importadora", icono: "🏬", categoria: "prestamo" },
    { nombre: "Banco Nacional", icono: "🏦", categoria: "prestamo" },
    { nombre: "BAC", icono: "💳", categoria: "tarjeta" },
    { nombre: "BCR", icono: "💳", categoria: "tarjeta" },
    { nombre: "Scotiabank", icono: "💳", categoria: "tarjeta" },
    { nombre: "Tarjeta Visa", icono: "💳", categoria: "tarjeta" },
    { nombre: "CCSS", icono: "🏥", categoria: "servicio" },
    { nombre: "INS", icono: "🛡️", categoria: "servicio" },
    { nombre: "AyA", icono: "💧", categoria: "servicio" },
    { nombre: "ICE", icono: "⚡", categoria: "servicio" },
    { nombre: "Internet", icono: "🌐", categoria: "servicio" },
    { nombre: "Teléfono", icono: "📱", categoria: "servicio" },
    { nombre: "Alquiler", icono: "🏠", categoria: "alquiler" },
    { nombre: "Condominio", icono: "🏢", categoria: "alquiler" },
    { nombre: "Seguro", icono: "🛡️", categoria: "otro" },
];


export default function CompromisosScreen() {
    const { compromisos, addCompromiso, updateCompromiso, deleteCompromiso, marcarPagado, settings } = useStore();
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [sugerencias, setSugerencias] = useState<typeof SUGERENCIAS>([]);
    const [tab, setTab] = useState<"activos" | "pausados">("activos");
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<Compromiso | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [editando, setEditando] = useState<Compromiso | null>(null);
    const [editForm, setEditForm] = useState({
        nombre: "", categoria: "suscripcion", monto: "",
        frecuencia: "mensual", proximaFecha: "",
        diasAntes: "3", notas: "", icono: "",
    });
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        nombre: "", categoria: "suscripcion", monto: "",
        frecuencia: "mensual", proximaFecha: "",
        diasAntes: String(settings.diasAntesPorDefecto ?? 3),
        notas: "", icono: "",
    });

    const activos = compromisos.filter((c) => c.estado === "activo");
    const pausados = compromisos.filter((c) => c.estado === "pausado");
    const shown = tab === "activos" ? activos : pausados;
    const [showPago, setShowPago] = useState<Compromiso | null>(null);
const [pagoForm, setPagoForm] = useState({ notas: "", referencia: "", comprobante: "" });
    const resetForm = () => {
        setErrors({});
        setForm({
            nombre: "", categoria: "suscripcion", monto: "",
            frecuencia: "mensual", proximaFecha: "",
            diasAntes: String(settings.diasAntesPorDefecto ?? 3),
            notas: "", icono: "",
        });
    };

    const handleSubmit = () => {
        const newErrors: Record<string, boolean> = {};
        if (!form.nombre) newErrors.nombre = true;
        if (!form.monto) newErrors.monto = true;
        if (!form.proximaFecha) newErrors.proximaFecha = true;
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        addCompromiso({
            nombre: form.nombre,
            categoria: form.categoria as any,
            monto: parseFloat(form.monto),
            frecuencia: form.frecuencia as any,
            proximaFecha: form.proximaFecha,
            diasAntes: parseInt(form.diasAntes),
            estado: "activo",
            notas: form.notas || undefined,
            icono: form.icono || undefined,
        });
        resetForm();
        setShowForm(false);
    };
    const handleEditar = (c: Compromiso) => {
        setEditando(c);
        setEditForm({
            nombre: c.nombre,
            categoria: c.categoria,
            monto: String(c.monto),
            frecuencia: c.frecuencia,
            proximaFecha: c.proximaFecha,
            diasAntes: String(c.diasAntes),
            notas: c.notas ?? "",
            icono: c.icono ?? "",
        });
        setSelected(null);
    };

    const handleGuardarEdicion = () => {
        if (!editando || !editForm.nombre || !editForm.monto || !editForm.proximaFecha) return;
        updateCompromiso(editando.id, {
            nombre: editForm.nombre,
            categoria: editForm.categoria as any,
            monto: parseFloat(editForm.monto),
            frecuencia: editForm.frecuencia as any,
            proximaFecha: editForm.proximaFecha,
            diasAntes: parseInt(editForm.diasAntes),
            notas: editForm.notas || undefined,
            icono: editForm.icono || undefined,
        });
        setEditando(null);
    };
    const handleConfirmarPago = () => {
        if (!showPago) return;
        marcarPagado(
            showPago.id,
            pagoForm.notas || undefined,
            pagoForm.referencia || undefined,
            pagoForm.comprobante || undefined,
        );
        setPagoForm({ notas: "", referencia: "", comprobante: "" });
        setShowPago(null);
    };
    return (
        <div className="page fade-in">

            {/* Tabs */}
            <div className="tab-pills">
                <button className={`tab-pill${tab === "activos" ? " active" : ""}`} onClick={() => setTab("activos")}>
                    Activos ({activos.length})
                </button>
                <button className={`tab-pill${tab === "pausados" ? " active" : ""}`} onClick={() => setTab("pausados")}>
                    Pausados ({pausados.length})
                </button>
            </div>

            {/* Botón agregar */}
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowForm(true)}>
                <Plus size={16} /> Nuevo compromiso
            </button>

            {/* Lista */}
            {shown.length === 0 ? (
                <EmptyState
                    icon={tab === "activos" ? "💳" : "⏸️"}
                    message={tab === "activos" ? "Sin compromisos activos" : "Sin compromisos pausados"}
                    sub={tab === "activos" ? "Agregá tus pagos recurrentes" : ""}
                />
            ) : (
                shown.map((c) => {
                    const dias = diasHastaNum(c.proximaFecha);
                    const color = getUrgenciaColor(dias);
                    return (
                        <div
                            key={c.id}
                            className="card"
                            style={{ cursor: "pointer", borderLeft: `3px solid ${color}` }}
                            onClick={() => setSelected(c)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                    <div style={{
                                        width: 48, height: 48,
                                        borderRadius: "var(--radius-md)",
                                        background: "var(--color-bg-elevated)",
                                        display: "grid", placeItems: "center",
                                        fontSize: 24, border: "1px solid var(--color-border)",
                                    }}>
                                        {c.icono ?? CATEGORIA_ICONO[c.categoria]}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                                            {c.nombre}
                                        </p>
                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                            {CATEGORIA_LABEL[c.categoria]} · {FRECUENCIA_LABEL[c.frecuencia]}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--color-text)" }}>
                                        {fmt(c.monto)}
                                    </p>
                                    <UrgenciaBadge dias={dias} />
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ fontSize: "var(--text-xs)", color }}>
                                    {diasHasta(c.proximaFecha)} · {fmtDate(c.proximaFecha)}
                                </p>
                            </div>

                            <div style={{
                                height: 3, borderRadius: 2, marginTop: "var(--space-3)",
                                background: `${color}22`, overflow: "hidden",
                            }}>
                                <div style={{
                                    height: "100%",
                                    width: dias <= 0 ? "100%" : `${Math.max(5, 100 - (dias / 30) * 100)}%`,
                                    background: color, borderRadius: 2,
                                }} />
                            </div>
                        </div>
                    );
                })
            )}

            {/* Detail Sheet */}
            {selected && (
                <Sheet title={selected.nombre} onClose={() => setSelected(null)}>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <Badge estado={selected.estado} />
                        <Badge estado={selected.categoria} />
                        <UrgenciaBadge dias={diasHastaNum(selected.proximaFecha)} />
                    </div>

                    <div style={{
                        background: "var(--color-bg-elevated)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4)", textAlign: "center",
                    }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>Monto</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-primary)" }}>
                            {fmt(selected.monto)}
                        </p>
                    </div>

                    {[
                        ["Frecuencia", FRECUENCIA_LABEL[selected.frecuencia]],
                        ["Próximo pago", fmtDate(selected.proximaFecha)],
                        ["Vence", diasHasta(selected.proximaFecha)],
                        ["Recordatorio", `${selected.diasAntes} día${selected.diasAntes !== 1 ? "s" : ""} antes`],
                        ["Notas", selected.notas ?? "-"],
                    ].map(([l, v]) => (
                        <div key={l as string} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)",
                        }}>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{l}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                        </div>
                    ))}

                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                        {selected.estado === "activo" && (
                            <button
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                                onClick={() => { setShowPago(selected); setSelected(null); }}
                            >
                                <CheckCircle size={16} /> ✅ Marcar como pagado
                            </button>
                        )}
                        <button
                            className="btn btn-secondary"
                            style={{ width: "100%" }}
                            onClick={() => {
                                updateCompromiso(selected.id, { estado: selected.estado === "activo" ? "pausado" : "activo" });
                                setSelected(null);
                            }}
                        >
                            {selected.estado === "activo" ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Reactivar</>}
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: "100%" }}
                            onClick={() => handleEditar(selected)}
                        >
                            ✏️ Editar
                        </button>
                        <button
                            className="btn btn-ghost"
                            style={{ width: "100%", color: "var(--color-danger)" }}
                            onClick={() => { setConfirmDelete(selected.id); setSelected(null); }}
                        >
                            <Trash2 size={14} /> Eliminar
                        </button>
                    </div>
                </Sheet>
            )}

            {/* Form Sheet */}
            {showForm && (
                <Sheet title="Nuevo Compromiso" onClose={() => { setShowForm(false); resetForm(); }}>

                    {/* Nombre con autocompletado */}
                    <div className="input-group">
                        <label className="input-label" style={{ color: errors.nombre ? "var(--color-danger)" : "var(--color-primary)" }}>
                            Nombre {errors.nombre && "— requerido"} *
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                className="input"
                                value={form.nombre}
                                placeholder="Ej: Netflix, Gollo, CCSS..."
                                style={{ borderColor: errors.nombre ? "var(--color-danger)" : undefined }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm({ ...form, nombre: val });
                                    if (errors.nombre) setErrors({ ...errors, nombre: false });
                                    setSugerencias(
                                        val.length > 0
                                            ? SUGERENCIAS.filter((s) => s.nombre.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
                                            : SUGERENCIAS.slice(0, 6)
                                    );
                                }}
                                onFocus={() => setSugerencias(SUGERENCIAS.slice(0, 6))}
                                onBlur={() => setTimeout(() => setSugerencias([]), 150)}
                            />
                            {sugerencias.length > 0 && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 4px)", left: 0, right: 0,
                                    background: "var(--color-bg-elevated)",
                                    border: "1px solid var(--color-border-2)",
                                    borderRadius: "var(--radius-md)",
                                    zIndex: 100, overflow: "hidden",
                                }}>
                                    {sugerencias.map((s) => (
                                        <button
                                            key={s.nombre}
                                            style={{
                                                width: "100%", textAlign: "left",
                                                padding: "10px var(--space-4)",
                                                background: "transparent", border: "none",
                                                borderBottom: "1px solid var(--color-border)",
                                                color: "var(--color-text)", cursor: "pointer",
                                                display: "flex", alignItems: "center",
                                                gap: "var(--space-3)", fontSize: "var(--text-sm)",
                                            }}
                                            onMouseDown={() => {
                                                setForm({ ...form, nombre: s.nombre, icono: s.icono, categoria: s.categoria });
                                                setSugerencias([]);
                                            }}
                                        >
                                            <span style={{ fontSize: 20 }}>{s.icono}</span>
                                            {s.nombre}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Select
                        label="Categoría" value={form.categoria}
                        onChange={(v) => setForm({ ...form, categoria: v })}
                        options={CATEGORIA_OPTIONS} required
                    />

                    <div className="input-group">
                        <label className="input-label" style={{ color: errors.monto ? "var(--color-danger)" : "var(--color-primary)" }}>
                            Monto (₡) {errors.monto && "— requerido"} *
                        </label>
                        <input
                            className="input" type="number"
                            value={form.monto}
                            placeholder="0"
                            style={{ borderColor: errors.monto ? "var(--color-danger)" : undefined }}
                            onChange={(e) => {
                                setForm({ ...form, monto: e.target.value });
                                if (errors.monto) setErrors({ ...errors, monto: false });
                            }}
                        />
                    </div>

                    <Select
                        label="Frecuencia" value={form.frecuencia}
                        onChange={(v) => setForm({ ...form, frecuencia: v })}
                        options={FRECUENCIA_OPTIONS} required
                    />
                    <div className="input-group">
                        <label className="input-label" style={{ color: errors.proximaFecha ? "var(--color-danger)" : "var(--color-primary)" }}>
                            Próxima fecha de pago {errors.proximaFecha && "— requerida"} *
                        </label>
                        <input
                            className="input" type="date"
                            value={form.proximaFecha}
                            style={{ borderColor: errors.proximaFecha ? "var(--color-danger)" : undefined }}
                            onChange={(e) => {
                                setForm({ ...form, proximaFecha: e.target.value });
                                if (errors.proximaFecha) setErrors({ ...errors, proximaFecha: false });
                            }}
                        />
                    </div>

                    <Select
                        label="Recordarme" value={form.diasAntes}
                        onChange={(v) => setForm({ ...form, diasAntes: v })}
                        options={DIAS_OPTIONS}
                    />

                    <div className="input-group">
                        <label className="input-label">Emoji personalizado (opcional)</label>
                        <input
                            className="input"
                            value={form.icono}
                            onChange={(e) => setForm({ ...form, icono: e.target.value })}
                            placeholder="Ej: 🎵 💡 🏠"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Notas (opcional)</label>
                        <input
                            className="input"
                            value={form.notas}
                            onChange={(e) => setForm({ ...form, notas: e.target.value })}
                            placeholder="Observaciones..."
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleSubmit}
                    >
                        Guardar compromiso
                    </button>
                </Sheet>
            )}

            {/* Confirm delete */}
            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este compromiso? Esta acción no se puede deshacer."
                    onConfirm={() => { deleteCompromiso(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
            {editando && (
                <Sheet title="Editar Compromiso" onClose={() => setEditando(null)}>
                    <div className="input-group">
                        <label className="input-label">Nombre *</label>
                        <input
                            className="input"
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Categoría" value={editForm.categoria}
                        onChange={(v) => setEditForm({ ...editForm, categoria: v })}
                        options={CATEGORIA_OPTIONS}
                    />
                    <div className="input-group">
                        <label className="input-label">Monto (₡) *</label>
                        <input
                            className="input" type="number"
                            value={editForm.monto}
                            onChange={(e) => setEditForm({ ...editForm, monto: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Frecuencia" value={editForm.frecuencia}
                        onChange={(v) => setEditForm({ ...editForm, frecuencia: v })}
                        options={FRECUENCIA_OPTIONS}
                    />
                    <div className="input-group">
                        <label className="input-label">Próxima fecha de pago *</label>
                        <input
                            className="input" type="date"
                            value={editForm.proximaFecha}
                            onChange={(e) => setEditForm({ ...editForm, proximaFecha: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Recordarme" value={editForm.diasAntes}
                        onChange={(v) => setEditForm({ ...editForm, diasAntes: v })}
                        options={DIAS_OPTIONS}
                    />
                    <div className="input-group">
                        <label className="input-label">Emoji personalizado</label>
                        <input
                            className="input"
                            value={editForm.icono}
                            onChange={(e) => setEditForm({ ...editForm, icono: e.target.value })}
                            placeholder="Ej: 🎵 💡 🏠"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Notas</label>
                        <input
                            className="input"
                            value={editForm.notas}
                            onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                            placeholder="Observaciones..."
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleGuardarEdicion}
                    >
                        Guardar cambios
                    </button>
                </Sheet>
            )}
            {showPago && (
                <Sheet title="Registrar pago" onClose={() => setShowPago(null)}>
                    <div style={{
                        background: "var(--color-bg-elevated)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4)", textAlign: "center",
                        marginBottom: "var(--space-2)",
                    }}>
                        <p style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>
                            {showPago.icono ?? CATEGORIA_ICONO[showPago.categoria]}
                        </p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text)" }}>
                            {showPago.nombre}
                        </p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-2xl)", color: "var(--color-primary)", marginTop: 4 }}>
                            {fmt(showPago.monto)}
                        </p>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Referencia / comprobante (opcional)</label>
                        <input
                            className="input"
                            value={pagoForm.referencia}
                            onChange={(e) => setPagoForm({ ...pagoForm, referencia: e.target.value })}
                            placeholder="Ej: #123456, transferencia SINPE..."
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Notas (opcional)</label>
                        <input
                            className="input"
                            value={pagoForm.notas}
                            onChange={(e) => setPagoForm({ ...pagoForm, notas: e.target.value })}
                            placeholder="Observaciones del pago..."
                        />
                    </div>

                    {/* Upload comprobante */}
                    <div className="input-group">
                        <label className="input-label">Foto del comprobante (opcional)</label>
                        {pagoForm.comprobante ? (
                            <div style={{ position: "relative" }}>
                                <img
                                    src={pagoForm.comprobante}
                                    alt="Comprobante"
                                    style={{
                                        width: "100%", borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--color-border)",
                                        maxHeight: 200, objectFit: "cover",
                                    }}
                                />
                                <button
                                    className="btn btn-ghost"
                                    style={{
                                        position: "absolute", top: 8, right: 8,
                                        padding: "4px 8px", minHeight: 0,
                                        background: "rgba(0,0,0,0.6)",
                                        color: "var(--color-danger)",
                                    }}
                                    onClick={() => setPagoForm({ ...pagoForm, comprobante: "" })}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label style={{
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                gap: "var(--space-2)",
                                border: "2px dashed var(--color-border-2)",
                                borderRadius: "var(--radius-md)",
                                padding: "var(--space-6)",
                                cursor: uploading ? "not-allowed" : "pointer",
                                opacity: uploading ? 0.6 : 1,
                                transition: "border-color 0.2s",
                            }}>
                                <span style={{ fontSize: 32 }}>{uploading ? "⏳" : "📷"}</span>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                                    {uploading ? "Subiendo..." : "Tocá para subir foto"}
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    disabled={uploading}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setUploading(true);
                                        try {
                                            const url = await uploadComprobante(file);
                                            setPagoForm({ ...pagoForm, comprobante: url });
                                        } catch {
                                            console.error("Error subiendo imagen");
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={uploading}
                        onClick={handleConfirmarPago}
                    >
                        ✅ Confirmar pago
                    </button>
                    <button
                        className="btn btn-ghost"
                        style={{ width: "100%" }}
                        onClick={() => { marcarPagado(showPago.id); setShowPago(null); }}
                    >
                        Marcar pagado sin notas
                    </button>
                </Sheet>
            )}
        </div>

    );
}