// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/security";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /admin and all sub-routes, except /admin/login
  if (path.startsWith("/admin")) {
    const isLoginPage = path === "/admin/login";
    const token = request.cookies.get("admin-session-token")?.value;

    let payload = null;
    if (token) {
      payload = await verifyJWT(token);
    }

    if (isLoginPage) {
      // If already logged in, redirect to dashboard
      if (payload) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // If not logged in, redirect to login page
    if (!payload) {
      const loginUrl = new URL("/admin/login", request.url);
      // Optional: keep track of the original page to redirect back after login
      // loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
