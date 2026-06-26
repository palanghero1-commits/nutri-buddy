import { createContext, useContext, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/api";

interface UserSession {
  name: string;
  email: string;
}

interface AuthContextType {
  isAdmin: boolean;
  currentUser: UserSession | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const ADMIN_SESSION_KEY = "nutri-admin";
const USER_SESSION_KEY = "nutri-user";

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  currentUser: null,
  login: async () => false,
  loginUser: async () => false,
  registerUser: async () => ({ success: false, message: "" }),
  logout: () => {},
});

type AuthResponse = {
  success: boolean;
  message?: string;
  user?: UserSession;
};

function readUserSession() {
  const stored = sessionStorage.getItem(USER_SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as UserSession;
  } catch {
    sessionStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => readUserSession());

  const login = async (email: string, password: string) => {
    try {
      await apiRequest<AuthResponse>("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setCurrentUser(null);
      sessionStorage.removeItem(USER_SESSION_KEY);
      return true;
    } catch {
      return false;
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const result = await apiRequest<AuthResponse>("/api/auth/user-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!result.user) return false;

      setCurrentUser(result.user);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(result.user));
      setIsAdmin(false);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return true;
    } catch {
      return false;
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    try {
      const result = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (!result.user) {
        return { success: false, message: result.message || "Registration failed." };
      }

      setCurrentUser(result.user);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(result.user));
      setIsAdmin(false);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);

      return {
        success: true,
        message: "Account created successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed.",
      };
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
  };

  return <AuthContext.Provider value={{ isAdmin, currentUser, login, loginUser, registerUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
