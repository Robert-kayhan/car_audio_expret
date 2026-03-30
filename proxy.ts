import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const user = token ? verifyToken(token) : null;
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname.startsWith("/admin");
  const isUserPage = pathname.startsWith("/users");

  // If logged in, don't allow login/register
  if (isAuthPage && user) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/users", req.url));
  }

  // If not logged in, block admin and users pages
  if ((isAdminPage || isUserPage) && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If logged in but not admin, block admin pages
  if (isAdminPage && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/users", req.url));
  }

  // If admin tries to access users page, optional redirect
  if (isUserPage && user?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/users/:path*"],
};