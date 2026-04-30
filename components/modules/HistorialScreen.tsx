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

function fmtMes(yyyymm: string) {
    const [y, m] = yyyymm.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("es-CR", { month: "short", year: "2-digit" })
        .replace(".", "").replace(" ", " '");
}

export default function HistorialScreen() {
    const { historial, compromisos, deleteHistorial, userId, cuentaAhorroAportes, deleteCuentaAhorroAporte } = useStore();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [selectedHistorial, setSelectedHistorial] = useState<HistorialPago | null>(null);
    const [categoriasColapsadas, setCategoriasColapsadas] = useState<Record<string, boolean>>({});
    const [confirmLimpiar, setConfirmLimpiar] = useState(false);
    const [ahorrosColapsados, setAhorrosColapsados] = useState(true);

    const mesActual = new Date().toISOString().slice(0, 7);
    const [selectedMes, setSelectedMes] = useState<string>(mesActual); // "YYYY-MM" | "todo"

    const getCompromiso = (id: string) => compromisos.find((c) => c.id === id);

    // ── Meses disponibles (union de historial + aportes) ──────────────────────
    const mesesSet = new Set<string>();
    historial.forEach((h) => mesesSet.add(h.fecha.slice(0, 7)));
    cuentaAhorroAportes.forEach((a) => mesesSet.add(a.fecha.slice(0, 7)));
    const mesesDisponibles = [...mesesSet].sort((a, b) => b.localeCompare(a)); // desc

    // ── Filtrar por mes seleccionado ──────────────────────────────────────────
    const historialFiltrado = selectedMes === "todo"
        ? historial
        : historial.filter((h) => h.fecha.startsWith(selectedMes));

    const ahorrosFiltrados = [...cuentaAhorroAportes]
        .filter((a) => selectedMes === "todo" || a.fecha.startsWith(selectedMes))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Hero totals
    const pagosFiltrados = historialFiltrado.filter(
        (h) => !h.pagadoPor || h.pagadoPor === userId
    );
    const totalFiltrado = pagosFiltrados.reduce((s, h) => s + h.monto, 0);
    const totalAhorrosFiltrado = ahorrosFiltrados.reduce((s, a) => s + a.monto, 0);

    // ── Compromisos grupales ──────────────────────────────────────────────────
    const idsGrupales = new Set(
        compromisos
            .filter(c => !c.esCompartido && (c.compartidoCon?.length ?? 0) > 0)
            .map(c => c.id)
    );

    const pagosGrupales = historialFiltrado
        .filter(h => idsGrupales.has(h.compromisoId))
        .reduce<Record<string, HistorialPago[]>>((acc, h) => {
            if (!acc[h.compromisoId]) acc[h.compromisoId] = [];
            acc[h.compromisoId].push(h);
            return acc;
        }, {});

    const pagosIndividuales = historialFiltrado.filter(
        h => !idsGrupales.has(h.compromisoId) &&
             (!h.pagadoPor || h.pagadoPor === userId)
    );

    // ── Por categoría ─────────────────────────────────────────────────────────
    const porCategoria: Record<string, EntradaHistorial[]> = {};
    const addEntrada = (cat: string, entrada: EntradaHistorial) => {
        if (!porCategoria[cat]) porCategoria[cat] = [];
        porCategoria[cat].push(entrada);
    };

    Object.entries(pagosGrupales).forEach(([compromisoId, pagos]) => {
        const cat = getCompromiso(compromisoId)?.categoria ?? "otro";
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

    // ── Limpiar mes ───────────────────────────────────────────────────────────
    const handleLimpiarMes = async () => {
        for (const h of pagosFiltrados) await deleteHistorial(h.id);
        setConfirmLimpiar(false);
    };

    const hayContenido = Object.keys(porCategoria).length > 0 || ahorrosFiltrados.length > 0;
    const puedeLimpiar = selectedMes !== "todo" && (pagosFiltrados.length > 0 || ahorrosFiltrados.length > 0);

    return (
        <div className="page fade-in">
            <HistorialHeroCard
                totalEsteMes={totalFiltrado}
                cantidadPagos={pagosFiltrados.length}
                totalAhorros={totalAhorrosFiltrado}
                onLimpiar={puedeLimpiar ? () => setConfirmLimpiar(true) : undefined}
            />

            {/* ── Selector de mes ── */}
            {mesesDisponibles.length > 0 && (
                <div style={{
                    display: "flex", gap: "var(--space-2)",
                    overflowX: "auto", paddingBottom: 4,
                    scrollbarWidth: "none",
                }}>
                    <button
                        onClick={() => setSelectedMes("todo")}
                        style={{
                            flexShrink: 0,
                            padding: "6px 14px",
                            borderRadius: 99,
                            border: selectedMes === "todo" ? "none" : "1px solid var(--color-border)",
                            background: selectedMes === "todo" ? "var(--color-primary)" : "var(--color-bg-elevated)",
                            color: selectedMes === "todo" ? "#fff" : "var(--color-text-3)",
                            fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                        }}
                    >
                        Todo
                    </button>
                    {mesesDisponibles.map((mes) => (
                        <button
                            key={mes}
                            onClick={() => { setSelectedMes(mes); setCategoriasColapsadas({}); }}
                            style={{
                                flexShrink: 0,
                                padding: "6px 14px",
                                borderRadius: 99,
                                border: selectedMes === mes ? "none" : "1px solid var(--color-border)",
                                background: selectedMes === mes ? "var(--color-primary)" : "var(--color-bg-elevated)",
                                color: selectedMes === mes ? "#fff" : "var(--color-text-3)",
                                fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                            }}
                        >
                            {fmtMes(mes)}
                            {mes === mesActual && (
                                <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.8 }}>●</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {!hayContenido ? (
                <EmptyState
                    icon="📋"
                    message={selectedMes === "todo" ? "Sin historial aún" : `Sin registros en ${fmtMes(selectedMes)}`}
                    sub={selectedMes === "todo" ? "Cuando marqués un compromiso como pagado aparecerá aquí" : "Seleccioná otro mes o marcá pagos"}
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

                    {/* Sección de ahorros */}
                    {ahorrosFiltrados.length > 0 && (
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
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                    <span style={{ fontSize: 20 }}>🐷</span>
                                    <div style={{ textAlign: "left" }}>
                                        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>Ahorros</p>
                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                            {ahorrosFiltrados.length} depósito{ahorrosFiltrados.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "#22c55e" }}>
                                        {fmt(totalAhorrosFiltrado)}
                                    </p>
                                    <span style={{ fontSize: 12, color: "var(--color-text-3)", transform: ahorrosColapsados ? "none" : "rotate(180deg)", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                                </div>
                            </button>

                            {!ahorrosColapsados && (
                                <div style={{ border: "1px solid var(--color-border)", borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", overflow: "hidden", marginBottom: "var(--space-3)" }}>
                                    {ahorrosFiltrados.map((a, i) => (
                                        <div key={a.id} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "var(--space-3) var(--space-4)",
                                            background: i % 2 === 0 ? "var(--color-bg)" : "var(--color-bg-elevated)",
                                            borderBottom: i < ahorrosFiltrados.length - 1 ? "1px solid var(--color-border)" : "none",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                <span style={{ fontSize: 16 }}>🐷</span>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{a.cuentaNombre}</p>
                                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>{a.fecha}{a.nota ? ` · ${a.nota}` : ""}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)", color: "#22c55e" }}>{fmt(a.monto)}</p>
                                                <button onClick={() => deleteCuentaAhorroAporte(a.id, a.cuentaId, a.monto)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-3)", padding: 4 }}>
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
                    message={`¿Limpiar los ${pagosFiltrados.length} registro${pagosFiltrados.length !== 1 ? "s" : ""} de ${fmtMes(selectedMes)}? Esta acción no se puede deshacer.`}
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
