import { NextRequest, NextResponse } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/docs',
  '/features',
  '/pricing',
  '/about',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/changelog',
  '/careers',
  '/api/auth/login',
  '/api/auth/signup',
];

// Static assets and API routes that should be allowed
const allowedPatterns = [
  '/assets/',
  '/_next/',
  '/favicon.ico',
  '/api/auth/',
  '/api/mock/',
];

// Check if the path is public or allowed
const isPublicPath = (path: string) => {
  // Check exact matches
  if (publicPaths.includes(path)) {
    return true;
  }

  // Check pattern matches
  return allowedPatterns.some(pattern => path.startsWith(pattern));
};

// Check if user has valid authentication
const isAuthenticated = (request: NextRequest): boolean => {
  // Check for auth token in cookies
  const authToken = request.cookies.get('auth-token')?.value;

  // Check for session cookie (if using next-auth)
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value;

  return !!(authToken || sessionToken);
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuth = isAuthenticated(request);

  // Allow public paths and static assets
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  // Auth routes handling (login/signup)
  const isAuthRoute = path === "/login" || path === "/signup";

  // If user is authenticated and trying to access auth routes, redirect to app
  if (isAuth && isAuthRoute) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Protected routes - anything starting with /app
  if (path.startsWith('/app')) {
    if (!isAuth) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For any other protected routes, redirect to login if not authenticated
  if (!isAuth && !isPublicPath(path) && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
