import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import * as authApi from "@/lib/api/auth";
import { setAuthEventHandler, setToken, TOKEN_STORAGE_KEY } from "@/lib/api-client";
import { toAppUser } from "@/lib/adapters";
import type { AppUser, Role } from "@/mock/data";

interface AuthContextValue {
  currentUser: AppUser | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    district?: string;
  }) => Promise<AppUser>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  roleHome: (role: Role) => string;
}

const Ctx = createContext<AuthContextValue | null>(null);
const USER_ID_KEY = "haa.currentUserId";

function roleHome(role: Role) {
  return role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          const me = await authApi.getMe();
          if (!cancelled) {
            setCurrentUser(toAppUser(me));
            setMustChangePassword(Boolean(me.mustChangePassword));
          }
        }
      } catch {
        setToken(null);
        try {
          localStorage.removeItem(USER_ID_KEY);
        } catch {
          /* ignore */
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setAuthEventHandler((event) => {
      if (event === "unauthorized") {
        setToken(null);
        setCurrentUser(null);
        setMustChangePassword(false);
        router.navigate({ to: "/login" });
      } else if (event === "password_change_required") {
        setMustChangePassword(true);
        router.navigate({ to: "/set-password" });
      }
    });
    return () => setAuthEventHandler(null);
  }, [router]);

  const login: AuthContextValue["login"] = async (email, password) => {
    const result = await authApi.login({ email, password });
    setToken(result.token);
    const user = toAppUser(result.user);
    setCurrentUser(user);
    setMustChangePassword(result.mustChangePassword);
    return user;
  };

  const register: AuthContextValue["register"] = async (input) => {
    const result = await authApi.register(input);
    setToken(result.token);
    const user = toAppUser(result.user);
    setCurrentUser(user);
    setMustChangePassword(false);
    return user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setMustChangePassword(false);
  };

  const changePassword: AuthContextValue["changePassword"] = async (
    currentPassword,
    newPassword
  ) => {
    const result = await authApi.changePassword({ currentPassword, newPassword });
    setToken(result.token);
    setMustChangePassword(false);
  };

  // Prevent a hydration flash where SSR rendered "no user" and client just found one.
  if (!hydrated) {
    return (
      <Ctx.Provider
        value={{ currentUser: null, mustChangePassword: false, login, register, logout, changePassword, roleHome }}
      >
        <div className="min-h-screen bg-background" />
      </Ctx.Provider>
    );
  }

  return (
    <Ctx.Provider
      value={{ currentUser, mustChangePassword, login, register, logout, changePassword, roleHome }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
