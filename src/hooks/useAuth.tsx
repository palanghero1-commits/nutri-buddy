import { createContext, useContext, useState, ReactNode } from "react";

interface UserAccount {
  name: string;
  email: string;
  password: string;
}

interface UserSession {
  name: string;
  email: string;
}

interface AuthContextType {
  isAdmin: boolean;
  currentUser: UserSession | null;
  login: (email: string, password: string) => boolean;
  loginUser: (email: string, password: string) => boolean;
  registerUser: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

const ADMIN_SESSION_KEY = "nutri-admin";
const USER_SESSION_KEY = "nutri-user";
const USERS_STORAGE_KEY = "nutri-users";

const defaultUsers: UserAccount[] = [
  {
    name: "Maria Santos",
    email: "user@nutritrack.app",
    password: "user12345",
  },
];

function loadUsers() {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const parsed = JSON.parse(stored) as UserAccount[];
    return parsed.length > 0 ? parsed : defaultUsers;
  } catch {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  currentUser: null,
  login: () => false,
  loginUser: () => false,
  registerUser: () => ({ success: false, message: "" }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const stored = sessionStorage.getItem(USER_SESSION_KEY);
    return stored ? (JSON.parse(stored) as UserSession) : null;
  });

  const login = (email: string, password: string) => {
    // Demo credentials - replace with real auth later
    if (email === "admin@nutritrack.gov.ph" && password === "admin123") {
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setCurrentUser(null);
      sessionStorage.removeItem(USER_SESSION_KEY);
      return true;
    }
    return false;
  };

  const loginUser = (email: string, password: string) => {
    const users = loadUsers();
    const match = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
    );

    if (!match) {
      return false;
    }

    const sessionUser = { name: match.name, email: match.email };
    setCurrentUser(sessionUser);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return true;
  };

  const registerUser = (name: string, email: string, password: string) => {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    const nextUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
    };

    saveUsers([...users, nextUser]);

    const sessionUser = { name: nextUser.name, email: nextUser.email };
    setCurrentUser(sessionUser);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);

    return {
      success: true,
      message: "Account created successfully.",
    };
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
