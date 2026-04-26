import Image from "next/image";
import type { User } from "firebase/auth";

interface PerfilCardProps {
    user: User | null;
    nombreUsuario: string;
    onNombreChange: (nombre: string) => void;
}

export default function PerfilCard({ user, nombreUsuario, onNombreChange }: PerfilCardProps) {
    return (
        <>
            <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                {user?.photoURL ? (
                    <Image
                        src={user.photoURL}
                        alt="Avatar"
                        width={56}
                        height={56}
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "var(--color-primary-glow)",
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "var(--text-xl)", color: "var(--color-primary)",
                    }}>
                        {user?.displayName?.[0] ?? "U"}
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                        {user?.displayName ?? "Usuario"}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        {user?.email}
                    </p>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">¿Cómo te llamás?</label>
                <input
                    className="input"
                    value={nombreUsuario}
                    onChange={(e) => onNombreChange(e.target.value)}
                    onBlur={(e) => onNombreChange(e.target.value)}
                    placeholder="Tu nombre..."
                />
            </div>
        </>
    );
}
