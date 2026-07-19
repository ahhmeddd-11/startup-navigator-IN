import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/api";
import { toast } from "sonner";

export type UserProfile = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, fullName: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/auth/profile/");
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
      } else {
        clearTokens();
        setUser(null);
      }
    } catch (err) {
      clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const refresh = getRefreshToken();

      if (token || refresh) {
        await fetchProfile();
      }
      setIsCheckingAuth(false);

      // Show session expired toast if redirected here after token failure
      if (typeof window !== "undefined" && sessionStorage.getItem("session_expired")) {
        sessionStorage.removeItem("session_expired");
        toast.error("Your session has expired. Please sign in again.");
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login/", { email, password });
    if (res.data?.success && res.data?.data?.tokens) {
      const { access, refresh } = res.data.data.tokens;
      setTokens(access, refresh);
      setUser(res.data.data.user);
    }
    return res.data;
  };

  const register = async (email: string, fullName: string, password: string) => {
    const res = await api.post("/api/auth/register/", {
      email,
      full_name: fullName,
      password,
      confirm_password: password, // Satisfy backend password confirmation validation
    });
    if (res.data?.success && res.data?.data) {
      // If backend returns tokens directly on register (which users.views RegisterView does)
      const tokens = res.data.data.tokens;
      if (tokens) {
        setTokens(tokens.access, tokens.refresh);
      }
      setUser(res.data.data);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await api.post("/api/auth/logout/", { refresh });
      }
    } catch (err) {
      console.warn("Backend logout/blacklist failed", err);
    } finally {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        setUser(null);
      }
    }
  };

  const refetchProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isCheckingAuth,
        login,
        register,
        logout,
        refetchProfile,
      }}
    >
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
