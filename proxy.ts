import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // Protect dashboard routes - require seller role
  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/dashboard", nextUrl));
    }
    // Profile completion is encouraged via banners, not enforced via redirect
  }

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || session?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
