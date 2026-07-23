import React, { createContext, useContext, useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = unknown, false = not-auth, object = admin
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (_) {
        setUser(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.token) localStorage.setItem("arif_admin_token", data.token);
      setUser(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e.response?.data?.detail) };
    }
  }

  async function logout() {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("arif_admin_token");
    setUser(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
