"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
        }
    };

    return { user, loading, loginWithGoogle, logout };
}