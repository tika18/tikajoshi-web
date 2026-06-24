"use client";
import {
  createContext, useContext, useState,
  useEffect, ReactNode
} from "react";
import {
  onAuthStateChanged, signOut,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile,
  sendEmailVerification, sendPasswordResetEmail, User
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !isFirebaseConfigured) throw new Error("Firebase auth is not configured");
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
    router.push("/chill-zone");
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) throw new Error("Firebase auth is not configured");
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    router.push("/chill-zone");
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (!auth || !isFirebaseConfigured) throw new Error("Firebase auth is not configured");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    setUser(cred.user);
  };

  const logout = async () => {
    if (!auth || !isFirebaseConfigured) throw new Error("Firebase auth is not configured");
    await signOut(auth);
    setUser(null);
    router.push("/login");
  };

  const resetPassword = async (email: string) => {
    if (!auth || !isFirebaseConfigured) throw new Error("Firebase auth is not configured");
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle, loginWithEmail,
      registerWithEmail, resetPassword, logout,
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