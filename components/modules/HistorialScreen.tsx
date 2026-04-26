"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { EmptyState, ConfirmDialog } from "@/components/ui";
import HistorialHeroCard from "./historial/HistorialHeroCard";
import HistorialMesGroup from "./historial/HistorialMesGroup";
import HistorialDetailSheet from "./historial/HistorialDetailSheet";
import type { HistorialPago } from "@/types";

export default function HistorialScreen() {
    const { historial, compromisos, deleteHistorial } = useStore();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [selectedHistorial, setSelectedHistorial] = useState<HistorialPago | null>(null);

    const getCompromiso = (id: string) => compromisos.find((c) => c.id === id);

    const porMes = historial.reduce<Record<string, HistorialPago[]>>((acc, h) => {
        const mes = h.fecha.slice(0, 7);
        if (!acc[mes]) acc[mes] = [];
        acc[mes].push(h);
        return acc;
    }, {});

    const mesActual = new Date().toISOString().slice(0, 7);
    const pagosEsteMes = porMes[mesActual] ?? [];
    const totalEsteMes = pagosEsteMes.reduce((s, h) => s + h.monto, 0);

    return (
        <div className="page fade-in">
            <HistorialHeroCard
                totalEsteMes={totalEsteMes}
                cantidadPagos={pagosEsteMes.length}
            />

            {historial.length === 0 ? (
                <EmptyState
                    icon="📋"
                    message="Sin historial aún"
                    sub="Cuando marqués un compromiso como pagado aparecerá aquí"
                />
            ) : (
                Object.entries(porMes)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([mes, pagos]) => (
                        <HistorialMesGroup
                            key={mes}
                            mes={mes}
                            pagos={pagos}
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
