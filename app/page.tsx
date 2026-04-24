"use client";
import { useEffect } from "react";
import { useStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import LoginScreen from "@/components/modules/LoginScreen";
import DashboardScreen from "@/components/modules/DashboardScreen";
import CompromisosScreen from "@/components/modules/CompromisosScreen";
import HistorialScreen from "@/components/modules/HistorialScreen";
import AjustesScreen from "@/components/modules/AjustesScreen";

const SCREENS: Record<string, React.ComponentType> = {
  dashboard: DashboardScreen,
  compromisos: CompromisosScreen,
  historial: HistorialScreen,
  ajustes: AjustesScreen,
};

export default function AppPage() {
  const { activeTab, setUserId, setUserName, loadSettings, initSpace, initSubscriptions } = useStore();
  const { user, loading } = useAuth();
  const Screen = SCREENS[activeTab] ?? DashboardScreen;
  const { space } = useStore();

  useEffect(() => {
    if (!space) return;
    const unsubscribe = initSubscriptions();
    return () => unsubscribe();
  }, [space?.id]);
  useEffect(() => {
    if (!user) return;

    const userName = user.displayName ?? "Usuario";
    setUserId(user.uid);
    setUserName(userName);
    loadSettings(user.uid);

    let unsubscribe: (() => void) | undefined;

    initSpace(user.uid, userName).then(() => {
      unsubscribe = initSubscriptions();
    });

    return () => {
      if (unsubscribe) unsubscribe();
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

  if (!user) return <LoginScreen />;

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <AppHeader />
      <main className="app-content" key={activeTab}>
        <Screen />
      </main>
      <BottomNav />
    </div>
  );
}