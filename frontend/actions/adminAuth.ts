// frontend/actions/adminAuth.ts
"use server";

import { cookies } from "next/headers";
import { verifyPassword, signJWT, verifyJWT } from "@/lib/security";

export async function loginAdmin(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Please enter both username and password." };
  }

  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedPasswordHash) {
    return {
      success: false,
      error: "Server configuration error: ADMIN_PASSWORD_HASH is not defined in the environment.",
    };
  }

  if (username !== expectedUsername) {
    return { success: false, error: "Invalid username or password." };
  }

  const isPasswordCorrect = await verifyPassword(password, expectedPasswordHash);
  if (!isPasswordCorrect) {
    return { success: false, error: "Invalid username or password." };
  }

  // Sign JWT
  const token = await signJWT({ username });

  // Set secure HTTP-only cookie
  cookies().set({
    name: "admin-session-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });

  return { success: true };
}

export async function logoutAdmin() {
  cookies().delete("admin-session-token");
  return { success: true };
}

export async function checkAdminSession() {
  const token = cookies().get("admin-session-token")?.value;
  if (!token) return false;
  
  const payload = await verifyJWT(token);
  return !!payload;
}

export async function generatePasswordHash(password: string) {
  const { hashPassword } = await import("@/lib/security");
  return await hashPassword(password);
}

