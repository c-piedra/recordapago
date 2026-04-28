"use client";
import { useState } from "react";

const EMOJI_GRUPOS = [
    {
        label: "Finanzas",
        emojis: ["💳", "💰", "🏦", "💵", "💴", "💸", "🏧", "📈", "📉", "🪙"],
    },
    {
        label: "Hogar",
        emojis: ["🏠", "🏡", "💡", "🌊", "🔑", "🛋️", "🛁", "🧹", "🔧", "📦"],
    },
    {
        label: "Transporte",
        emojis: ["🚗", "⛽", "🚌", "✈️", "🚂", "🛵", "🚲", "🚕", "🅿️", "🛣️"],
    },
    {
        label: "Comida",
        emojis: ["🍔", "🍕", "🥗", "🍣", "☕", "🛒", "🥤", "🍱", "🍜", "🥩"],
    },
    {
        label: "Salud",
        emojis: ["💊", "🏥", "🦷", "👓", "🧘", "💆", "🏋️", "🩺", "🩹", "❤️"],
    },
    {
        label: "Entretenimiento",
        emojis: ["📺", "🎮", "🎬", "🎵", "🎧", "🎭", "🎪", "🎠", "🎯", "🎲"],
    },
    {
        label: "Educación",
        emojis: ["📚", "🎓", "✏️", "📝", "🖥️", "📐", "🔬", "🗣️", "📖", "🏫"],
    },
    {
        label: "Personal",
        emojis: ["💅", "💄", "👗", "👟", "🪒", "🧴", "💇", "🛍️", "🎁", "👔"],
    },
    {
        label: "Mascotas",
        emojis: ["🐕", "🐈", "🦮", "🐾", "🦴", "🐠", "🌿", "🏡", "💉", "🛁"],
    },
    {
        label: "Suscripciones",
        emojis: ["📱", "💻", "🖥️", "☁️", "🎙️", "📡", "🔐", "📧", "🌐", "🔔"],
    },
];

interface EmojiPickerProps {
    value: string;
    onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
    const [open, setOpen] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const todosEmojis = EMOJI_GRUPOS.flatMap((g) => g.emojis);
    const emojisFiltrados = busqueda
        ? todosEmojis.filter((e) => e.includes(busqueda))
        : null;

    return (
        <div className="input-group">
            <label className="input-label">Emoji personalizado (opcional)</label>

            {/* Botón disparador */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: "var(--space-3)", padding: "var(--space-3)",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)", cursor: "pointer",
                    color: "var(--color-text)",
                }}
            >
                <span style={{ fontSize: 24, minWidth: 32, textAlign: "center" }}>
                    {value || "➕"}
                </span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                    {value ? "Cambiar emoji" : "Elegir emoji"}
                </span>
                <span style={{
                    marginLeft: "auto", fontSize: 12, color: "var(--color-text-3)",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                }}>▼</span>
            </button>

            {/* Panel de emojis */}
            {open && (
                <div style={{
                    marginTop: "var(--space-2)",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                    maxHeight: 320, overflowY: "auto",
                }}>
                    {/* Borrar selección */}
                    {value && (
                        <button
                            type="button"
                            onClick={() => { onChange(""); setOpen(false); }}
                            style={{
                                width: "100%", marginBottom: "var(--space-2)",
                                padding: "var(--space-2)", fontSize: "var(--text-xs)",
                                color: "var(--color-danger)", background: "transparent",
                                border: "1px dashed var(--color-danger)",
                                borderRadius: "var(--radius-sm)", cursor: "pointer",
                            }}
                        >
                            ✕ Quitar emoji
                        </button>
                    )}

                    {/* Grupos */}
                    {EMOJI_GRUPOS.map((grupo) => (
                        <div key={grupo.label} style={{ marginBottom: "var(--space-3)" }}>
                            <p style={{
                                fontSize: "var(--text-xs)", color: "var(--color-text-3)",
                                fontWeight: 600, marginBottom: "var(--space-2)",
                                textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>
                                {grupo.label}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {grupo.emojis.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => { onChange(emoji); setOpen(false); }}
                                        style={{
                                            width: 38, height: 38, fontSize: 20,
                                            background: value === emoji
                                                ? "rgba(99,102,241,0.25)"
                                                : "var(--color-bg-card)",
                                            border: value === emoji
                                                ? "1px solid var(--color-primary)"
                                                : "1px solid var(--color-border)",
                                            borderRadius: "var(--radius-sm)",
                                            cursor: "pointer", display: "grid", placeItems: "center",
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
