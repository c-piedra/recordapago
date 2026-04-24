"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt, fmtDate, CATEGORIA_ICONO } from "@/lib/utils";
import { EmptyState, ConfirmDialog, Sheet } from "@/components/ui";
import { Trash2 } from "lucide-react";

export default function HistorialScreen() {
    const { historial, compromisos, deleteHistorial } = useStore();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [selectedHistorial, setSelectedHistorial] = useState<typeof historial[0] | null>(null);

    const getCompromiso = (id: string) => compromisos.find((c) => c.id === id);

    const porMes = historial.reduce<Record<string, typeof historial>>((acc, h) => {
        const mes = h.fecha.slice(0, 7);
        if (!acc[mes]) acc[mes] = [];
        acc[mes].push(h);
        return acc;
    }, {});

    const totalEsteMes = () => {
        const hoy = new Date();
        const key = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
        return (porMes[key] ?? []).reduce((s, h) => s + h.monto, 0);
    };

    return (
        <div className="page fade-in">

            {/* Resumen mes */}
            <div className="hero-card">
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                    Pagado este mes
                </p>
                <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: "var(--text-3xl)", color: "var(--color-success)",
                }}>
                    {fmt(totalEsteMes())}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: "var(--space-2)" }}>
                    {(porMes[new Date().toISOString().slice(0, 7)] ?? []).length} pagos registrados
                </p>
            </div>

            {/* Lista por mes */}
            {historial.length === 0 ? (
                <EmptyState
                    icon="📋"
                    message="Sin historial aún"
                    sub="Cuando marqués un compromiso como pagado aparecerá aquí"
                />
            ) : (
                Object.entries(porMes)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([mes, pagos]) => {
                        const fecha = new Date(mes + "-01T00:00:00");
                        const label = fecha.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
                        const total = pagos.reduce((s, h) => s + h.monto, 0);

                        return (
                            <div key={mes}>
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "center", marginBottom: "var(--space-3)",
                                }}>
                                    <p className="section-title" style={{ textTransform: "capitalize" }}>
                                        {label}
                                    </p>
                                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text-2)" }}>
                                        {fmt(total)}
                                    </p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
                                    {pagos.map((h) => {
                                        const comp = getCompromiso(h.compromisoId);
                                        return (
                                            <div
                                                key={h.id}
                                                className="list-item"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setSelectedHistorial(h)}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                                        <div style={{
                                                            width: 40, height: 40,
                                                            borderRadius: "var(--radius-md)",
                                                            background: "var(--color-bg-elevated)",
                                                            display: "grid", placeItems: "center",
                                                            fontSize: 20, border: "1px solid var(--color-border)",
                                                        }}>
                                                            {comp?.icono ?? (comp ? CATEGORIA_ICONO[comp.categoria] : "💳")}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                                                {h.compromisoNombre}
                                                            </p>
                                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                                                {fmtDate(h.fecha)}{h.referencia ? ` · ${h.referencia}` : ""}
                                                            </p>
                                                            {h.notas && (
                                                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 1, fontStyle: "italic" }}>
                                                                    {h.notas}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-success)" }}>
                                                            {fmt(h.monto)}
                                                        </p>
                                                        {h.comprobante && (
                                                            <span style={{ fontSize: 14 }}>📎</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
            )}

            {/* Confirm delete */}
            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este registro del historial?"
                    onConfirm={() => { deleteHistorial(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* Detail Sheet */}
            {selectedHistorial && (
                <Sheet title="Detalle de pago" onClose={() => setSelectedHistorial(null)}>
                    <div style={{
                        background: "var(--color-bg-elevated)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-5)", textAlign: "center",
                    }}>
                        <p style={{ fontSize: 40, marginBottom: "var(--space-2)" }}>
                            {(() => {
                                const comp = getCompromiso(selectedHistorial.compromisoId);
                                return comp?.icono ?? (comp ? CATEGORIA_ICONO[comp.categoria] : "💳");
                            })()}
                        </p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--color-text)" }}>
                            {selectedHistorial.compromisoNombre}
                        </p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-3xl)", color: "var(--color-success)", marginTop: 4 }}>
                            {fmt(selectedHistorial.monto)}
                        </p>
                    </div>

                    {[
                        ["Fecha de pago", fmtDate(selectedHistorial.fecha)],
                        ["Referencia", selectedHistorial.referencia ?? "—"],
                        ["Notas", selectedHistorial.notas ?? "—"],
                    ].map(([l, v]) => (
                        <div key={l as string} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "var(--space-2) 0",
                            borderBottom: "1px solid var(--color-border)",
                        }}>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{l}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                        </div>
                    ))}

                    {/* Comprobante */}
                    {selectedHistorial.comprobante && (
                        <div style={{ marginTop: "var(--space-3)" }}>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: "var(--space-2)" }}>
                                Comprobante
                            </p>
                            <img
                                src={selectedHistorial.comprobante}
                                alt="Comprobante"
                                style={{
                                    width: "100%", borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--color-border)",
                                    maxHeight: 300, objectFit: "cover",
                                    cursor: "pointer",
                                }}
                                onClick={() => window.open(selectedHistorial.comprobante, "_blank")}
                            />
                        </div>
                    )}

                    <button
                        className="btn btn-ghost"
                        style={{ width: "100%", color: "var(--color-danger)", marginTop: "var(--space-2)" }}
                        onClick={() => { setConfirmDelete(selectedHistorial.id); setSelectedHistorial(null); }}
                    >
                        <Trash2 size={14} /> Eliminar registro
                    </button>
                </Sheet>
            )}
        </div>
    );
}