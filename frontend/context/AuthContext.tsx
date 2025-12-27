"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthType {
  user: any;
  login: (name: string) => void;
  logout: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Check Local Storage on Load
  useEffect(() => {
    const storedUser = localStorage.getItem("tikajoshi_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (name: string) => {
    const userData = { name, role: "user", joined: new Date() };
    setUser(userData);
    localStorage.setItem("tikajoshi_user", JSON.stringify(userData));
    router.push("/chill-zone");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tikajoshi_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isGuest: !user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};