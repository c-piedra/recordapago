"use client";
import { useState } from "react";
import { Plus, Trash2, PenLine } from "lucide-react";
import { fmt, fmtMoneda, fmtDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui";
import type { GastoVariable, GastoVariableEntrada } from "@/types";
import GastoVariableFormSheet from "./GastoVariableFormSheet";
import RegistrarGastoSheet from "./RegistrarGastoSheet";

// Calcula el rango de fechas del período actual
function getRangoPeriodo(periodo: GastoVariable["periodo"]): { desde: string; hasta: string } {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    if (periodo === "mensual") {
        return {
            desde: new Date(año, mes, 1).toISOString().split("T")[0],
            hasta: new Date(año, mes + 1, 0).toISOString().split("T")[0],
        };
    }
    if (periodo === "quincenal") {
        const dia = hoy.getDate();
        const desde = dia <= 15
            ? new Date(año, mes, 1).toISOString().split("T")[0]
            : new Date(año, mes, 16).toISOString().split("T")[0];
        const hasta = dia <= 15
            ? new Date(año, mes, 15).toISOString().split("T")[0]
            : new Date(año, mes + 1, 0).toISOString().split("T")[0];
        return { desde, hasta };
    }
    // semanal
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { desde: lunes.toISOString().split("T")[0], hasta: domingo.toISOString().split("T")[0] };
}

interface GastosVariablesSectionProps {
    gastosVariables: GastoVariable[];
    gastosVariableEntradas: GastoVariableEntrada[];
    tipoCambio: number;
    userId: string | null;
    userName: string | null;
    onAdd: (g: Omit<GastoVariable, "id">) => void;
    onUpdate: (id: string, data: Partial<GastoVariable>) => void;
    onDelete: (id: string) => void;
    onAddEntrada: (e: Omit<GastoVariableEntrada, "id">) => void;
    onDeleteEntrada: (id: string) => void;
}

export default function GastosVariablesSection({
    gastosVariables, gastosVariableEntradas, tipoCambio,
    userId, userName, onAdd, onUpdate, onDelete, onAddEntrada, onDeleteEntrada,
}: GastosVariablesSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState<GastoVariable | null>(null);
    const [registrando, setRegistrando] = useState<GastoVariable | null>(null);
    const [expandido, setExpandido] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmDeleteEntrada, setConfirmDeleteEntrada] = useState<string | null>(null);

    return (
        <div style={{ marginTop: "var(--space-6)" }}>
            {/* Encabezado */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <div>
                    <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                        📊 Gastos Variables
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        Presupuestos para gastos que cambian cada período
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    style={{ minHeight: 36, fontSize: "var(--text-xs)", padding: "0 var(--space-3)", display: "flex", alignItems: "center", gap: 4 }}
                    onClick={() => setShowForm(true)}
                >
                    <Plus size={14} /> Nuevo
                </button>
            </div>

            {gastosVariables.length === 0 ? (
                <div style={{
                    border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)",
                    padding: "var(--space-6)", textAlign: "center",
                }}>
                    <p style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>📊</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                        Sin gastos variables aún
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 4 }}>
                        Agregá presupuestos para carro, comida, ocio...
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {gastosVariables.map((g) => {
                        const rango = getRangoPeriodo(g.periodo);
                        const entradas = gastosVariableEntradas.filter(
                            (e) => e.gastoVariableId === g.id && e.fecha >= rango.desde && e.fecha <= rango.hasta
                        );
                        const gastadoCRC = entradas.reduce((s, e) =>
                            s + (e.moneda === "USD" ? e.monto * tipoCambio : e.monto), 0
                        );
                        const presupuestoCRC = g.moneda === "USD" ? g.presupuesto * tipoCambio : g.presupuesto;
                        const porcentaje = presupuestoCRC > 0 ? Math.min(100, (gastadoCRC / presupuestoCRC) * 100) : 0;
                        const sobrePasado = gastadoCRC > presupuestoCRC;
                        const barColor = sobrePasado ? "var(--color-danger)" : porcentaje > 75 ? "var(--color-warning)" : "var(--color-success)";
                        const abierto = expandido === g.id;

                        return (
                            <div key={g.id} style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                                {/* Header */}
                                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--color-bg-elevated)", display: "grid", placeItems: "center", fontSize: 20, border: "1px solid var(--color-border)", flexShrink: 0 }}>
                                                {g.icono ?? "📊"}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{g.nombre}</p>
                                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                    Presupuesto {g.periodo}: {fmtMoneda(g.presupuesto, g.moneda)}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-base)", color: sobrePasado ? "var(--color-danger)" : "var(--color-text)" }}>
                                                {fmt(gastadoCRC)}
                                            </p>
                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                de {fmt(presupuestoCRC)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div style={{ height: 6, borderRadius: 3, background: "var(--color-bg-elevated)", overflow: "hidden", marginBottom: "var(--space-3)" }}>
                                        <div style={{ height: "100%", width: `${porcentaje}%`, background: barColor, borderRadius: 3, transition: "width 0.5s ease" }} />
                                    </div>

                                    {/* Acciones */}
                                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, fontSize: "var(--text-xs)", minHeight: 34 }}
                                            onClick={() => setRegistrando(g)}
                                        >
                                            + Registrar gasto
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ minHeight: 34, padding: "0 var(--space-3)" }}
                                            onClick={() => setExpandido(abierto ? null : g.id)}
                                        >
                                            {abierto ? "▲" : `▼ ${entradas.length}`}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ minHeight: 34, padding: "0 var(--space-2)" }}
                                            onClick={() => setEditando(g)}
                                        >
                                            <PenLine size={14} />
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            style={{ minHeight: 34, padding: "0 var(--space-2)", color: "var(--color-danger)" }}
                                            onClick={() => setConfirmDelete(g.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Lista de entradas */}
                                {abierto && (
                                    <div style={{ borderTop: "1px solid var(--color-border)" }}>
                                        {entradas.length === 0 ? (
                                            <p style={{ padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-3)", textAlign: "center" }}>
                                                Sin gastos registrados este período
                                            </p>
                                        ) : (
                                            entradas.map((e, i) => (
                                                <div key={e.id} style={{
                                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                                    padding: "var(--space-2) var(--space-4)",
                                                    borderBottom: i < entradas.length - 1 ? "1px solid var(--color-border)" : "none",
                                                    background: "var(--color-bg-elevated)",
                                                }}>
                                                    <div>
                                                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                                            {e.descripcion ?? g.nombre}
                                                        </p>
                                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                            {fmtDate(e.fecha)}{e.pagadoPorNombre ? ` · ${e.pagadoPorNombre}` : ""}
                                                        </p>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                                            {fmtMoneda(e.monto, e.moneda)}
                                                        </p>
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{ minHeight: 28, padding: "0 6px", color: "var(--color-danger)" }}
                                                            onClick={() => setConfirmDeleteEntrada(e.id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <GastoVariableFormSheet
                    onGuardar={onAdd}
                    onClose={() => setShowForm(false)}
                />
            )}

            {editando && (
                <GastoVariableFormSheet
                    inicial={editando}
                    onGuardar={(data) => { onUpdate(editando.id, data); setEditando(null); }}
                    onClose={() => setEditando(null)}
                />
            )}

            {registrando && (
                <RegistrarGastoSheet
                    gasto={registrando}
                    userId={userId}
                    userName={userName}
                    onConfirmar={onAddEntrada}
                    onClose={() => setRegistrando(null)}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este presupuesto y todos sus registros?"
                    onConfirm={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {confirmDeleteEntrada && (
                <ConfirmDialog
                    message="¿Eliminar este registro de gasto?"
                    onConfirm={() => { onDeleteEntrada(confirmDeleteEntrada); setConfirmDeleteEntrada(null); }}
                    onCancel={() => setConfirmDeleteEntrada(null)}
                />
            )}
        </div>
    );
}
