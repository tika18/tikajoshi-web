"use client";
import {
  createContext, useContext, useState,
  useEffect, ReactNode
} from "react";
import {
  onAuthStateChanged, signOut,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile,
  User
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    router.push("/chill-zone");
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/chill-zone");
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    router.push("/chill-zone");
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle, loginWithEmail,
      registerWithEmail, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};