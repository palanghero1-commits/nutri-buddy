import { createContext, useContext, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/api";

interface UserSession {
  name: string;
  email: string;
  designation?: string;
  assignedArea?: string;
  residentAddress?: string;
  contactNumber?: string;
  residencyConfirmed?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
}

type StaffRole = "admin" | "bhw";

interface AuthContextType {
  isAdmin: boolean;
  staffRole: StaffRole | null;
  staffUser: UserSession | null;
  currentUser: UserSession | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginBhw: (email: string, password: string) => Promise<boolean>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    verification: { residentAddress: string; contactNumber?: string; residencyConfirmed: boolean; faceVerified: boolean; idDocument: { name: string; type: string; data: string; ocrText: string } },
  ) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (profile: { name: string; residentAddress: string; contactNumber?: string }) => Promise<{ success: boolean; message: string }>;
  updateStaffProfile: (profile: { name: string; contactNumber?: string }) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, currentPassword: string, newPassword: string, role: "bhw" | "user") => Promise<{ success: boolean; message: string }>;
  deleteAccount: (currentPassword: string, role: "bhw" | "user") => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const ADMIN_SESSION_KEY = "nutri-admin";
const STAFF_ROLE_SESSION_KEY = "nutri-staff-role";
const STAFF_USER_SESSION_KEY = "nutri-staff-user";
const USER_SESSION_KEY = "nutri-user";

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  staffRole: null,
  staffUser: null,
  currentUser: null,
  login: async () => false,
  loginBhw: async () => false,
  loginUser: async () => false,
  registerUser: async () => ({ success: false, message: "" }),
  updateUserProfile: async () => ({ success: false, message: "" }),
  updateStaffProfile: async () => ({ success: false, message: "" }),
  resetPassword: async () => ({ success: false, message: "" }),
  deleteAccount: async () => ({ success: false, message: "" }),
  logout: () => {},
});

type AuthResponse = {
  success: boolean;
  message?: string;
  user?: UserSession;
  token?: string;
};

function saveAuthToken(token?: string) {
  if (token) sessionStorage.setItem("nutri-auth-token", token);
}

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

function readStaffUserSession() {
  const stored = sessionStorage.getItem(STAFF_USER_SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as UserSession;
  } catch {
    sessionStorage.removeItem(STAFF_USER_SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staffRole, setStaffRole] = useState<StaffRole | null>(() => {
    const storedRole = sessionStorage.getItem(STAFF_ROLE_SESSION_KEY);
    if (storedRole === "admin" || storedRole === "bhw") return storedRole;
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true" ? "admin" : null;
  });
  const [staffUser, setStaffUser] = useState<UserSession | null>(() => readStaffUserSession());
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => readUserSession());
  const isAdmin = staffRole === "admin";

  const login = async (email: string, password: string) => {
    try {
      const result = await apiRequest<AuthResponse>("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setStaffRole("admin");
      saveAuthToken(result.token);
      setStaffUser(result.user ?? null);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      sessionStorage.setItem(STAFF_ROLE_SESSION_KEY, "admin");
      if (result.user) sessionStorage.setItem(STAFF_USER_SESSION_KEY, JSON.stringify(result.user));
      setCurrentUser(null);
      sessionStorage.removeItem(USER_SESSION_KEY);
      return true;
    } catch {
      return false;
    }
  };

  const loginBhw = async (email: string, password: string) => {
    try {
      const result = await apiRequest<AuthResponse>("/api/auth/bhw-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setStaffRole("bhw");
      saveAuthToken(result.token);
      setStaffUser(result.user ?? null);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.setItem(STAFF_ROLE_SESSION_KEY, "bhw");
      if (result.user) sessionStorage.setItem(STAFF_USER_SESSION_KEY, JSON.stringify(result.user));
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
      saveAuthToken(result.token);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(result.user));
      setStaffRole(null);
      setStaffUser(null);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(STAFF_ROLE_SESSION_KEY);
      sessionStorage.removeItem(STAFF_USER_SESSION_KEY);
      return true;
    } catch {
      return false;
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    verification: { residentAddress: string; contactNumber?: string; residencyConfirmed: boolean; faceVerified: boolean; idDocument: { name: string; type: string; data: string; ocrText: string } },
  ) => {
    try {
      const result = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, ...verification }),
      });

      if (!result.user) {
        return { success: false, message: result.message || "Registration failed." };
      }

      setCurrentUser(result.user);
      saveAuthToken(result.token);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(result.user));
      setStaffRole(null);
      setStaffUser(null);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(STAFF_ROLE_SESSION_KEY);
      sessionStorage.removeItem(STAFF_USER_SESSION_KEY);

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

  const updateUserProfile = async (profile: { name: string; residentAddress: string; contactNumber?: string }) => {
    if (!currentUser) {
      return { success: false, message: "Sign in before updating your profile." };
    }

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ email: currentUser.email, ...profile }),
      });

      if (!result.user) {
        return { success: false, message: result.message || "Profile update failed." };
      }

      setCurrentUser(result.user);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(result.user));

      return {
        success: true,
        message: result.message || "Profile updated successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Profile update failed.",
      };
    }
  };

  const updateStaffProfile = async (profile: { name: string; contactNumber?: string }) => {
    if (!staffUser || !staffRole) {
      return { success: false, message: "Sign in before updating your profile." };
    }

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/staff-profile", {
        method: "PUT",
        body: JSON.stringify({ email: staffUser.email, role: staffRole, ...profile }),
      });

      if (!result.user) {
        return { success: false, message: result.message || "Profile update failed." };
      }

      setStaffUser(result.user);
      sessionStorage.setItem(STAFF_USER_SESSION_KEY, JSON.stringify(result.user));

      return {
        success: true,
        message: result.message || "Profile updated successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Profile update failed.",
      };
    }
  };

  const resetPassword = async (email: string, currentPassword: string, newPassword: string, role: "bhw" | "user") => {
    if (role === "admin") {
      return {
        success: false,
        message: "Admin accounts cannot use the password reset flow.",
      };
    }

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, currentPassword, newPassword, role }),
      });

      return {
        success: result.success !== false,
        message: result.message || "Password reset successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Password reset failed.",
      };
    }
  };

  const deleteAccount = async (currentPassword: string, role: "bhw" | "user") => {
    const email = role === "bhw" ? staffUser?.email : currentUser?.email;
    if (!email) {
      return { success: false, message: "Sign in before deleting your profile." };
    }

    try {
      const result = await apiRequest<AuthResponse>("/api/auth/profile", {
        method: "DELETE",
        body: JSON.stringify({ email, currentPassword, role }),
      });

      logout();

      return {
        success: true,
        message: result.message || "Profile deleted successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Profile deletion failed.",
      };
    }
  };

  const logout = () => {
    setStaffRole(null);
    setStaffUser(null);
    setCurrentUser(null);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(STAFF_ROLE_SESSION_KEY);
    sessionStorage.removeItem(STAFF_USER_SESSION_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem("nutri-auth-token");
  };

  return <AuthContext.Provider value={{ isAdmin, staffRole, staffUser, currentUser, login, loginBhw, loginUser, registerUser, updateUserProfile, updateStaffProfile, resetPassword, deleteAccount, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
