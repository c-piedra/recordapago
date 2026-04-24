"use client";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getUrgenciaColor, getUrgenciaLabel } from "@/lib/utils";
import type { CategoriaCompromiso, EstadoCompromiso } from "@/types";

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
    activo: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
    pausado: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
    pagado: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
    suscripcion: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
    prestamo: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
    tarjeta: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
    servicio: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
    alquiler: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
    otro: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
};

export function Badge({ estado }: { estado: string }) {
    const s = BADGE_STYLES[estado] ?? BADGE_STYLES.otro;
    const labels: Record<string, string> = {
        activo: "Activo", pausado: "Pausado", pagado: "Pagado",
        suscripcion: "Suscripción", prestamo: "Préstamo",
        tarjeta: "Tarjeta", servicio: "Servicio",
        alquiler: "Alquiler", otro: "Otro",
    };
    return (
        <span className="badge" style={{ background: s.bg, color: s.color }}>
            {labels[estado] ?? estado}
        </span>
    );
}

// ─── UrgenciaBadge ────────────────────────────────────────────────────────────
export function UrgenciaBadge({ dias }: { dias: number }) {
    const color = getUrgenciaColor(dias);
    const label = getUrgenciaLabel(dias);
    return (
        <span className="badge" style={{
            background: `${color}22`,
            color,
        }}>
            {label}
        </span>
    );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
    label, value, onChange, type = "text",
    placeholder, required, min, max,
}: {
    label: string; value: string;
    onChange: (v: string) => void;
    type?: string; placeholder?: string;
    required?: boolean; min?: string; max?: string;
}) {
    return (
        <div className="input-group">
            <label className="input-label">{label}{required && " *"}</label>
            <input
                className="input"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
            />
        </div>
    );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({
    label, value, onChange, options, required,
}: {
    label: string; value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}) {
    return (
        <div className="input-group">
            <label className="input-label">{label}{required && " *"}</label>
            <div style={{ position: "relative" }}>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: "100%",
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "14px var(--space-4)",
                        color: value ? "var(--color-text)" : "var(--color-text-3)",
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-base)",
                        outline: "none",
                        appearance: "none",
                        cursor: "pointer",
                    }}
                >
                    <option value="" disabled>Seleccionar...</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value} style={{ background: "#1a2235" }}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <span style={{
                    position: "absolute", right: 16, top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-3)", pointerEvents: "none",
                    fontSize: 12,
                }}>▼</span>
            </div>
        </div>
    );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────
export function Sheet({
    title, onClose, children,
}: {
    title: string; onClose: () => void; children: React.ReactNode;
}) {
    if (typeof window === "undefined") return null;
    return createPortal(
        <div className="sheet-overlay" onClick={onClose}>
            <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
                <div className="sheet-handle" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
                    <p className="sheet-title" style={{ margin: 0 }}>{title}</p>
                    <button className="btn-icon btn" onClick={onClose}><X size={16} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({
    message, onConfirm, onCancel,
}: {
    message: string; onConfirm: () => void; onCancel: () => void;
}) {
    if (typeof window === "undefined") return null;
    return createPortal(
        <div className="confirm-overlay">
            <div className="confirm-box">
                <p style={{ fontSize: "var(--text-base)", color: "var(--color-text)", marginBottom: "var(--space-6)", lineHeight: 1.5 }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>Eliminar</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message, sub }: { icon?: string; message: string; sub?: string }) {
    return (
        <div className="empty-state">
            {icon && <span style={{ fontSize: 48 }}>{icon}</span>}
            <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-2)", fontWeight: 600 }}>{message}</p>
            {sub && <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{sub}</p>}
        </div>
    );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color }: { value: number; color?: string }) {
    return (
        <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: color ?? "var(--color-primary)" }} />
        </div>
    );
}