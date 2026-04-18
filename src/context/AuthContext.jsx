import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bloodconnect-token");
    if (!token) {
      setLoading(false);
      return;
    }

    api("/api/profile")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("bloodconnect-token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (payload) => {
    localStorage.setItem("bloodconnect-token", payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    saveSession(data);
    return data;
  };

  const register = async (formData) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("bloodconnect-token");
    setUser(null);
  };

  const refreshProfile = async () => {
    const data = await api("/api/profile");
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
