import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password', '/verify-email', '/signup'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/partner'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res;
  }

  // Check if using mock data (skip auth in dev mode)
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // If user is authenticated and trying to access public routes (login, etc.)
    // Redirect them to the dashboard
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL('/partner', req.url));
    }

    // If user is not authenticated and trying to access protected routes
    // Redirect them to login
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has partner role for protected routes
    if (session && isProtectedRoute) {
      const role = session.user?.app_metadata?.role || session.user?.user_metadata?.role;
      
      if (role !== 'partner_staff' && role !== 'partner_manager') {
        // User doesn't have partner role, sign them out and redirect
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=access_denied', req.url));
      }
    }

    return res;
  } catch (error) {
    // If there's an error, allow the request to continue
    // The page-level auth will handle it
    console.error('Middleware auth error:', error);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
