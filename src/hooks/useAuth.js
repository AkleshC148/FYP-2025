"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
// ✅ Import your helper
import { apiRequest } from "@/lib/api"; 

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Check Session on Load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use apiRequest (automatically handles headers/parsing)
        const userData = await apiRequest("/api/auth/me");
        setUser(userData);
      } catch (error) {
        // If it fails (401 Unauthorized), we just set user to null
        // We don't log it as an error because being logged out is normal
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 2. Login (Password Flow)
  const login = async (email, password) => {
    // Cleaner code using your helper
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // No need to check response.ok here; apiRequest throws if it fails
    return data;
  };

  // 3. Signup
  const signup = async (email, password, name, role) => {
    const data = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    });
    return data;
  };

  // 4. Logout
  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login"); 
      router.refresh(); // Refresh to ensure all server components update
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);