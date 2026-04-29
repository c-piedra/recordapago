"use client";
import { useStore } from "@/store";
import { LayoutDashboard, CreditCard, TrendingUp, Target, Menu } from "lucide-react";

const NAV_ITEMS = [
    { id: "dashboard",    label: "Inicio",     Icon: LayoutDashboard },
    { id: "compromisos",  label: "Gastos",     Icon: CreditCard },
    { id: "finanzas",     label: "Finanzas",   Icon: TrendingUp },
    { id: "proyectos",    label: "Proyectos",  Icon: Target },
    { id: "mas",          label: "Más",        Icon: Menu },
];

export default function BottomNav() {
    const { activeTab, setActiveTab } = useStore();
    return (
        <nav className="app-nav">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    className={`nav-item${activeTab === id ? " active" : ""}`}
                    onClick={() => setActiveTab(id)}
                    aria-label={label}
                >
                    <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.8} />
                    <span>{label}</span>
                </button>
            ))}
        </nav>
    );
}