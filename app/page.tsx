"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import LandingScreen from "@/components/modules/LandingScreen";
import DashboardScreen from "@/components/modules/DashboardScreen";
import CompromisosScreen from "@/components/modules/CompromisosScreen";
import HistorialScreen from "@/components/modules/HistorialScreen";
import AjustesScreen from "@/components/modules/AjustesScreen";
import FinanzasScreen from "@/components/modules/FinanzasScreen";
import ProyectosScreen from "@/components/modules/ProyectosScreen";
import MasScreen from "@/components/modules/MasScreen";
import LoginScreen from "@/components/modules/LoginScreen";
import InvitacionesBanner from "@/components/modules/InvitacionesBanner";
const SCREENS: Record<string, React.ComponentType> = {
  dashboard:   DashboardScreen,
  compromisos: CompromisosScreen,
  finanzas:    FinanzasScreen,
  proyectos:   ProyectosScreen,
  mas:         MasScreen,
  // Mantenidos para compatibilidad con links internos
  historial:   HistorialScreen,
  ajustes:     AjustesScreen,
};
export default function AppPage() {
  const { activeTab, setUserId, setUserName, loadSettings, initSpace, initSubscriptions } = useStore();
  const { user, loading, loginWithGoogle } = useAuth();
  const Screen = SCREENS[activeTab] ?? DashboardScreen;
  const unsubRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    const userName = user.displayName ?? "Usuario";
    setUserId(user.uid);
    setUserName(userName);

    const init = async () => {
      await loadSettings(user.uid);
      await initSpace(user.uid, userName);

      // Limpiar subscripciones anteriores
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = initSubscriptions();
    };

    init();

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        gap: "var(--space-4)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          fontWeight: 800,
          color: "var(--color-text)",
        }}>
          Recorda<span style={{ color: "var(--color-primary)" }}>Pago</span>
        </div>
        <div style={{
          width: 32, height: 32,
          border: "3px solid var(--color-border)",
          borderTop: "3px solid var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return showLogin
    ? <LoginScreen />
    : <LandingScreen onStart={() => setShowLogin(true)} onLogin={loginWithGoogle} />;
  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <AppHeader />
      <InvitacionesBanner />
      <main className="app-content" key={activeTab}>
        <Screen />
      </main>
      <BottomNav />
    </div>
  );
}