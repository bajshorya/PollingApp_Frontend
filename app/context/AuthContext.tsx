"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getAuthToken } from "@/app/lib/jwt";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isAuthenticated = response.status !== 401;
      setIsLoggedIn(isAuthenticated);
    } catch (error) {
      console.warn("Auth check failed:", error);
      setIsLoggedIn(!!token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);

    if (token) {
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
