"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { EmptyState, ConfirmDialog } from "@/components/ui";
import { Plus } from "lucide-react";
import type { Compromiso } from "@/types";
import CategoriaGroup from "./compromisos/CategoriaGroup";
import CompromisoDetailSheet from "./compromisos/CompromisoDetailSheet";
import CompromisoFormSheet, { type FormData } from "./compromisos/CompromisoFormSheet";
import CompromisoEditSheet, { type EditFormData } from "./compromisos/CompromisoEditSheet";
import PagoSheet, { type PagoFormData } from "./compromisos/PagoSheet";
import CompartirSheet from "./compromisos/CompartirSheet";
import GastosVariablesSection from "./finanzas/GastosVariablesSection";

const FORM_INICIAL: FormData = {
    nombre: "", categoria: "suscripcion", monto: "", moneda: "CRC",
    frecuencia: "mensual", proximaFecha: "",
    diasAntes: "", notas: "", icono: "", categoriaPersonalizada: "",
};

const EDIT_FORM_INICIAL: EditFormData = {
    nombre: "", categoria: "suscripcion", monto: "", moneda: "CRC",
    frecuencia: "mensual", proximaFecha: "",
    diasAntes: "", notas: "", icono: "",
};

export default function CompromisosScreen() {
    const {
        compromisos, addCompromiso, updateCompromiso, deleteCompromiso,
        marcarPagado, categoriaAbierta, setCategoriaAbierta,
        gastosVariables, gastosVariableEntradas,
        addGastoVariable, updateGastoVariable, deleteGastoVariable,
        addGastoVariableEntrada, deleteGastoVariableEntrada,
        tipoCambio,
        space, userId, userName,
    } = useStore();

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [tab, setTab] = useState<"activos" | "pausados" | "variables">("activos");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormData>(FORM_INICIAL);
    const [selected, setSelected] = useState<Compromiso | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [editando, setEditando] = useState<Compromiso | null>(null);
    const [editForm, setEditForm] = useState<EditFormData>(EDIT_FORM_INICIAL);
    const [showPago, setShowPago] = useState<Compromiso | null>(null);
    const [pagoForm, setPagoForm] = useState<PagoFormData>({ notas: "", referencia: "", comprobante: "" });
    const [showCompartir, setShowCompartir] = useState<Compromiso | null>(null);
    const [categoriasColapsadas, setCategoriasColapsadas] = useState<Record<string, boolean>>({});

    const activos = compromisos.filter((c) => c.estado === "activo");
    const pausados = compromisos.filter((c) => c.estado === "pausado");
    const shown = tab === "activos" ? activos : tab === "pausados" ? pausados : [];

    useEffect(() => {
        if (categoriaAbierta) {
            setCategoriasColapsadas((prev) => ({ ...prev, [categoriaAbierta]: false }));
            setCategoriaAbierta(null);
        }
    }, [categoriaAbierta]);

    const toggleCategoria = (cat: string) => {
        setCategoriasColapsadas((prev) => ({
            ...prev,
            [cat]: prev[cat] === undefined ? false : !prev[cat],
        }));
    };

    const resetForm = () => {
        setErrors({});
        setForm(FORM_INICIAL);
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
            moneda: form.moneda,
            frecuencia: form.frecuencia as any,
            proximaFecha: form.proximaFecha,
            diasAntes: form.diasAntes ? parseInt(form.diasAntes) : 0,
            estado: "activo",
            notas: form.categoriaPersonalizada || form.notas || undefined,
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
            moneda: c.moneda ?? "CRC",
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
            moneda: editForm.moneda,
            frecuencia: editForm.frecuencia as any,
            proximaFecha: editForm.proximaFecha,
            diasAntes: editForm.diasAntes ? parseInt(editForm.diasAntes) : 0,
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

    const porCategoria = shown.reduce<Record<string, Compromiso[]>>((acc, c) => {
        if (!acc[c.categoria]) acc[c.categoria] = [];
        acc[c.categoria].push(c);
        return acc;
    }, {});

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
                <button className={`tab-pill${tab === "variables" ? " active" : ""}`} onClick={() => setTab("variables")}>
                    Variables ({gastosVariables.length})
                </button>
            </div>

            {/* Tab: Variables */}
            {tab === "variables" ? (
                <GastosVariablesSection
                    gastosVariables={gastosVariables}
                    gastosVariableEntradas={gastosVariableEntradas}
                    tipoCambio={tipoCambio}
                    userId={userId}
                    userName={userName}
                    onAdd={addGastoVariable}
                    onUpdate={updateGastoVariable}
                    onDelete={deleteGastoVariable}
                    onAddEntrada={addGastoVariableEntrada}
                    onDeleteEntrada={deleteGastoVariableEntrada}
                />
            ) : (
                <>
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowForm(true)}>
                        <Plus size={16} /> Nuevo compromiso
                    </button>

                    {shown.length === 0 ? (
                        <EmptyState
                            icon={tab === "activos" ? "💳" : "⏸️"}
                            message={tab === "activos" ? "Sin compromisos activos" : "Sin compromisos pausados"}
                            sub={tab === "activos" ? "Agregá tus pagos recurrentes" : ""}
                        />
                    ) : (
                        Object.entries(porCategoria).map(([cat, items]) => (
                            <CategoriaGroup
                                key={cat}
                                categoria={cat}
                                items={items}
                                colapsado={categoriasColapsadas[cat] ?? true}
                                onToggle={() => toggleCategoria(cat)}
                                onClickItem={setSelected}
                            />
                        ))
                    )}
                </>
            )}

            {/* Detail Sheet */}
            {selected && (
                <CompromisoDetailSheet
                    compromiso={selected}
                    onClose={() => setSelected(null)}
                    onMarcarPagado={() => { setShowPago(selected); setSelected(null); }}
                    onToggleEstado={() => {
                        updateCompromiso(selected.id, { estado: selected.estado === "activo" ? "pausado" : "activo" });
                        setSelected(null);
                    }}
                    onEditar={() => handleEditar(selected)}
                    onCompartir={() => { setShowCompartir(selected); setSelected(null); }}
                    onEliminar={() => { setConfirmDelete(selected.id); setSelected(null); }}
                />
            )}

            {/* Form Sheet */}
            {showForm && (
                <CompromisoFormSheet
                    form={form}
                    onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                    onSubmit={handleSubmit}
                    onClose={() => { setShowForm(false); resetForm(); }}
                    errors={errors}
                    onClearError={(field) => setErrors((prev) => ({ ...prev, [field]: false }))}
                />
            )}

            {/* Confirm delete */}
            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este compromiso? Esta acción no se puede deshacer."
                    onConfirm={() => { deleteCompromiso(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* Edit Sheet */}
            {editando && (
                <CompromisoEditSheet
                    form={editForm}
                    onFormChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                    onGuardar={handleGuardarEdicion}
                    onClose={() => setEditando(null)}
                />
            )}

            {/* Pago Sheet */}
            {showPago && (
                <PagoSheet
                    compromiso={showPago}
                    form={pagoForm}
                    onFormChange={(patch) => setPagoForm((prev) => ({ ...prev, ...patch }))}
                    onConfirmar={handleConfirmarPago}
                    onMarcarSinNotas={() => { marcarPagado(showPago.id); setShowPago(null); }}
                    onClose={() => setShowPago(null)}
                />
            )}

            {/* Compartir Sheet */}
            {showCompartir && (
                <CompartirSheet
                    compromiso={showCompartir}
                    space={space}
                    userId={userId}
                    userName={userName}
                    onClose={() => setShowCompartir(null)}
                />
            )}
        </div>
    );
}
