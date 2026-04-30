"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { EmptyState, ConfirmDialog } from "@/components/ui";
import HistorialHeroCard from "./historial/HistorialHeroCard";
import HistorialCategoriaGroup, { type EntradaHistorial } from "./historial/HistorialCategoriaGroup";
import HistorialDetailSheet from "./historial/HistorialDetailSheet";
import { fmt } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import type { HistorialPago, CuentaAhorroAporte } from "@/types";

export default function HistorialScreen() {
    const { historial, compromisos, deleteHistorial, userId, cuentaAhorroAportes, deleteCuentaAhorroAporte } = useStore();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [selectedHistorial, setSelectedHistorial] = useState<HistorialPago | null>(null);
    const [categoriasColapsadas, setCategoriasColapsadas] = useState<Record<string, boolean>>({});
    const [confirmLimpiar, setConfirmLimpiar] = useState(false);
    const [ahorrosColapsados, setAhorrosColapsados] = useState(true);

    const getCompromiso = (id: string) => compromisos.find((c) => c.id === id);

    // Total pagado este mes — solo mis pagos
    const mesActual = new Date().toISOString().slice(0, 7);
    const pagosEsteMes = historial.filter(
        (h) => h.fecha.startsWith(mesActual) && (!h.pagadoPor || h.pagadoPor === userId)
    );
    const totalEsteMes = pagosEsteMes.reduce((s, h) => s + h.monto, 0);

    // Aportes de ahorro este mes
    const ahorrosMes = [...cuentaAhorroAportes]
        .filter((a) => a.fecha.startsWith(mesActual))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const totalAhorrosMes = ahorrosMes.reduce((s, a) => s + a.monto, 0);

    // ── Identificar compromisos "grupales" ─────────────────────────────────────
    const idsGrupales = new Set(
        compromisos
            .filter(c => !c.esCompartido && (c.compartidoCon?.length ?? 0) > 0)
            .map(c => c.id)
    );

    const pagosGrupales = historial
        .filter(h => idsGrupales.has(h.compromisoId))
        .reduce<Record<string, HistorialPago[]>>((acc, h) => {
            if (!acc[h.compromisoId]) acc[h.compromisoId] = [];
            acc[h.compromisoId].push(h);
            return acc;
        }, {});

    const pagosIndividuales = historial.filter(
        h => !idsGrupales.has(h.compromisoId) &&
             (!h.pagadoPor || h.pagadoPor === userId)
    );

    // Construir entradas por categoría
    const porCategoria: Record<string, EntradaHistorial[]> = {};

    const addEntrada = (cat: string, entrada: EntradaHistorial) => {
        if (!porCategoria[cat]) porCategoria[cat] = [];
        porCategoria[cat].push(entrada);
    };

    Object.entries(pagosGrupales).forEach(([compromisoId, pagos]) => {
        const comp = getCompromiso(compromisoId);
        const cat = comp?.categoria ?? "otro";
        addEntrada(cat, {
            tipo: "grupal",
            compromisoId,
            compromisoNombre: pagos[0].compromisoNombre,
            pagos: [...pagos].sort((a, b) => b.fecha.localeCompare(a.fecha)),
        });
    });

    [...pagosIndividuales]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .forEach(pago => {
            const cat = getCompromiso(pago.compromisoId)?.categoria ?? "otro";
            addEntrada(cat, { tipo: "individual", pago });
        });

    const toggleCategoria = (cat: string) => {
        setCategoriasColapsadas(prev => ({
            ...prev,
            [cat]: prev[cat] === undefined ? false : !prev[cat],
        }));
    };

    const handleLimpiarMes = async () => {
        // Eliminar todos los pagos del mes actual del usuario
        for (const h of pagosEsteMes) {
            await deleteHistorial(h.id);
        }
        setConfirmLimpiar(false);
    };

    const hayContenido = Object.keys(porCategoria).length > 0 || ahorrosMes.length > 0;

    return (
        <div className="page fade-in">
            <HistorialHeroCard
                totalEsteMes={totalEsteMes}
                cantidadPagos={pagosEsteMes.length}
                totalAhorros={totalAhorrosMes}
                onLimpiar={hayContenido ? () => setConfirmLimpiar(true) : undefined}
            />

            {!hayContenido ? (
                <EmptyState
                    icon="📋"
                    message="Sin historial aún"
                    sub="Cuando marqués un compromiso como pagado aparecerá aquí"
                />
            ) : (
                <>
                    {Object.entries(porCategoria).map(([cat, entradas]) => (
                        <HistorialCategoriaGroup
                            key={cat}
                            categoria={cat}
                            entradas={entradas}
                            colapsado={categoriasColapsadas[cat] ?? true}
                            onToggle={() => toggleCategoria(cat)}
                            getCompromiso={getCompromiso}
                            onClickPago={setSelectedHistorial}
                        />
                    ))}

                    {/* Sección de ahorros del mes */}
                    {ahorrosMes.length > 0 && (
                        <div>
                            <button
                                onClick={() => setAhorrosColapsados((v) => !v)}
                                style={{
                                    width: "100%", display: "flex",
                                    justifyContent: "space-between", alignItems: "center",
                                    background: "var(--color-bg-elevated)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: ahorrosColapsados ? "var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) 0 0",
                                    padding: "var(--space-3) var(--space-4)",
                                    cursor: "pointer",
                                    transition: "border-radius 0.2s",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                    <span style={{ fontSize: 20 }}>🐷</span>
                                    <div style={{ textAlign: "left" }}>
                                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                            Ahorros
                                        </p>
                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                            {ahorrosMes.length} depósito{ahorrosMes.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "#22c55e" }}>
                                        {fmt(totalAhorrosMes)}
                                    </p>
                                    <span style={{
                                        fontSize: 12, color: "var(--color-text-3)",
                                        transform: ahorrosColapsados ? "rotate(0deg)" : "rotate(180deg)",
                                        transition: "transform 0.2s", display: "inline-block",
                                    }}>▼</span>
                                </div>
                            </button>

                            {!ahorrosColapsados && (
                                <div style={{
                                    border: "1px solid var(--color-border)",
                                    borderTop: "none",
                                    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                                    overflow: "hidden",
                                    marginBottom: "var(--space-3)",
                                }}>
                                    {ahorrosMes.map((a, i) => (
                                        <div key={a.id} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "var(--space-3) var(--space-4)",
                                            background: i % 2 === 0 ? "var(--color-bg)" : "var(--color-bg-elevated)",
                                            borderBottom: i < ahorrosMes.length - 1 ? "1px solid var(--color-border)" : "none",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                <span style={{ fontSize: 16 }}>🐷</span>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                                        {a.cuentaNombre}
                                                    </p>
                                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                        {a.fecha}{a.nota ? ` · ${a.nota}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "#22c55e" }}>
                                                    {fmt(a.monto)}
                                                </p>
                                                <button
                                                    onClick={() => deleteCuentaAhorroAporte(a.id, a.cuentaId, a.monto)}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", padding: 4 }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {confirmLimpiar && (
                <ConfirmDialog
                    message={`¿Limpiar los ${pagosEsteMes.length} registro${pagosEsteMes.length !== 1 ? "s" : ""} del historial de este mes? Esta acción no se puede deshacer.`}
                    onConfirm={handleLimpiarMes}
                    onCancel={() => setConfirmLimpiar(false)}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este registro del historial?"
                    onConfirm={() => { deleteHistorial(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {selectedHistorial && (
                <HistorialDetailSheet
                    pago={selectedHistorial}
                    compromiso={getCompromiso(selectedHistorial.compromisoId)}
                    onClose={() => setSelectedHistorial(null)}
                    onDelete={() => { setConfirmDelete(selectedHistorial.id); setSelectedHistorial(null); }}
                />
            )}
        </div>
    );
}
