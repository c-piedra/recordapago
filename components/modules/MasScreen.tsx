"use client";
import { useState } from "react";
import HistorialScreen from "./HistorialScreen";
import AjustesScreen from "./AjustesScreen";

type MasTab = "historial" | "ajustes";

export default function MasScreen() {
    const [tab, setTab] = useState<MasTab>("historial");

    return (
        <>
            {/* Tab pills propios, fuera del scroll de las sub-pantallas */}
            <div className="tab-pills" style={{ padding: "var(--space-4) var(--space-4) 0" }}>
                <button
                    className={`tab-pill${tab === "historial" ? " active" : ""}`}
                    onClick={() => setTab("historial")}
                >
                    📋 Historial
                </button>
                <button
                    className={`tab-pill${tab === "ajustes" ? " active" : ""}`}
                    onClick={() => setTab("ajustes")}
                >
                    ⚙️ Ajustes
                </button>
            </div>

            {/* Las sub-pantallas manejan su propio padding/scroll */}
            {tab === "historial" ? <HistorialScreen /> : <AjustesScreen />}
        </>
    );
}
