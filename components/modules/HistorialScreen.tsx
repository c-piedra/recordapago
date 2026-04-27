"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { EmptyState, ConfirmDialog } from "@/components/ui";
import HistorialHeroCard from "./historial/HistorialHeroCard";
import HistorialCategoriaGroup, { type EntradaHistorial } from "./historial/HistorialCategoriaGroup";
import HistorialDetailSheet from "./historial/HistorialDetailSheet";
import type { HistorialPago } from "@/types";

export default function HistorialScreen() {
    const { historial, compromisos, deleteHistorial, userId } = useStore();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [selectedHistorial, setSelectedHistorial] = useState<HistorialPago | null>(null);
    const [categoriasColapsadas, setCategoriasColapsadas] = useState<Record<string, boolean>>({});

    const getCompromiso = (id: string) => compromisos.find((c) => c.id === id);

    // Total pagado este mes — solo mis pagos
    const mesActual = new Date().toISOString().slice(0, 7);
    const pagosEsteMes = historial.filter(
        (h) => h.fecha.startsWith(mesActual) && (!h.pagadoPor || h.pagadoPor === userId)
    );
    const totalEsteMes = pagosEsteMes.reduce((s, h) => s + h.monto, 0);

    // ── Identificar compromisos "grupales" (los que yo compartí) ─────────────
    // Son los que: !esCompartido && compartidoCon.length > 0
    const idsGrupales = new Set(
        compromisos
            .filter(c => !c.esCompartido && (c.compartidoCon?.length ?? 0) > 0)
            .map(c => c.id)
    );

    // Agrupar historial: grupales → 1 entrada por compromisoId con sublista
    //                   individuales → solo los pagos míos
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

    // Entradas grupales (dueño ve todos los pagos del grupo)
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

    // Entradas individuales
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

    return (
        <div className="page fade-in">
            <HistorialHeroCard
                totalEsteMes={totalEsteMes}
                cantidadPagos={pagosEsteMes.length}
            />

            {Object.keys(porCategoria).length === 0 ? (
                <EmptyState
                    icon="📋"
                    message="Sin historial aún"
                    sub="Cuando marqués un compromiso como pagado aparecerá aquí"
                />
            ) : (
                Object.entries(porCategoria).map(([cat, entradas]) => (
                    <HistorialCategoriaGroup
                        key={cat}
                        categoria={cat}
                        entradas={entradas}
                        colapsado={categoriasColapsadas[cat] ?? true}
                        onToggle={() => toggleCategoria(cat)}
                        getCompromiso={getCompromiso}
                        onClickPago={setSelectedHistorial}
                    />
                ))
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
