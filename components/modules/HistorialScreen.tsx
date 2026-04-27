"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { EmptyState, ConfirmDialog } from "@/components/ui";
import HistorialHeroCard from "./historial/HistorialHeroCard";
import HistorialCategoriaGroup from "./historial/HistorialCategoriaGroup";
import HistorialDetailSheet from "./historial/HistorialDetailSheet";
import type { HistorialPago } from "@/types";

export default function HistorialScreen() {
    const { historial, compromisos, deleteHistorial } = useStore();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [selectedHistorial, setSelectedHistorial] = useState<HistorialPago | null>(null);
    const [categoriasColapsadas, setCategoriasColapsadas] = useState<Record<string, boolean>>({});

    const getCompromiso = (id: string) => compromisos.find((c) => c.id === id);

    // Total pagado este mes
    const mesActual = new Date().toISOString().slice(0, 7);
    const pagosEsteMes = historial.filter((h) => h.fecha.startsWith(mesActual));
    const totalEsteMes = pagosEsteMes.reduce((s, h) => s + h.monto, 0);

    // Agrupar por categoría del compromiso (fallback: "otro")
    const porCategoria = historial.reduce<Record<string, HistorialPago[]>>((acc, h) => {
        const cat = getCompromiso(h.compromisoId)?.categoria ?? "otro";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(h);
        return acc;
    }, {});

    // Ordenar pagos dentro de cada categoría por fecha descendente
    Object.values(porCategoria).forEach((pagos) =>
        pagos.sort((a, b) => b.fecha.localeCompare(a.fecha))
    );

    const toggleCategoria = (cat: string) => {
        setCategoriasColapsadas((prev) => ({
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

            {historial.length === 0 ? (
                <EmptyState
                    icon="📋"
                    message="Sin historial aún"
                    sub="Cuando marqués un compromiso como pagado aparecerá aquí"
                />
            ) : (
                Object.entries(porCategoria).map(([cat, pagos]) => (
                    <HistorialCategoriaGroup
                        key={cat}
                        categoria={cat}
                        pagos={pagos}
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
