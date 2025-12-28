import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth cookie and verify
  const cookie = request.cookies.get("auth")?.value;
  let isAuthenticated = false;

  if (cookie) {
    try {
      await decrypt(cookie);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.includes(pathname);

  // Scenario 1: User is authenticated and tries to access public auth pages (login/signup)
  // Redirect them to home page
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Scenario 2: User is NOT authenticated and tries to access protected pages
  // Redirect them to login page
  if (!isAuthenticated && !isPublicPath) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (cookie) {
      response.cookies.delete("auth");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public images/assets (if any extensions need to be ignored)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
