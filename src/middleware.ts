import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Processing:', pathname);

  // Check for auth cookie and verify
  const cookie = request.cookies.get("auth")?.value;
  let isAuthenticated = false;

  if (cookie) {
    try {
      await decrypt(cookie);
      isAuthenticated = true;
      console.log('[Middleware] User authenticated');
    } catch {
      isAuthenticated = false;
      console.log('[Middleware] Invalid auth cookie');
    }
  } else {
    console.log('[Middleware] No auth cookie');
  }

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.includes(pathname);

  console.log('[Middleware] isPublicPath:', isPublicPath, 'isAuthenticated:', isAuthenticated);

  // Scenario 1: User is authenticated and tries to access public auth pages (login/signup)
  // Redirect them to home page
  if (isAuthenticated && isPublicPath) {
    console.log('[Middleware] Scenario 1: Redirect authenticated user to home');
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Scenario 2: User is NOT authenticated and tries to access protected pages
  // Redirect them to login page
  if (!isAuthenticated && !isPublicPath) {
    console.log('[Middleware] Scenario 2: Redirect unauthenticated user to login');
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (cookie) {
      response.cookies.delete("auth");
    }
    return response;
  }

  console.log('[Middleware] Allowing access to:', pathname);
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
