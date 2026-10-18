import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';
import { ROLES, getDefaultRoute } from '@/lib/permissions';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Public paths - no auth required
  const publicPaths = ['/', '/about', '/contact', '/login', '/forgot-password'];
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith('/api/auth'));

  if (isPublicPath) {
    // Redirect logged-in users away from login page
    if (session && (pathname === '/login' || pathname === '/forgot-password')) {
      const redirectUrl = getDefaultRoute(session.user.role);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // Require authentication for all non-public paths
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = session.user;

  // Role-based route protection
  if (pathname.startsWith('/admin-manager') && role !== ROLES.ADMIN && role !== ROLES.MANAGER) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), req.url));
  }

  if (pathname.startsWith('/kitchen') && role !== ROLES.KITCHEN && role !== ROLES.ADMIN && role !== ROLES.MANAGER) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), req.url));
  }

  if (pathname.startsWith('/student') && role !== ROLES.STUDENT && role !== ROLES.ADMIN && role !== ROLES.MANAGER) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), req.url));
  }

  // Admin-only routes within admin-manager
  if (pathname === '/admin-manager/users' && role !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL('/admin-manager', req.url));
  }

  if (pathname === '/admin-manager/audit-logs' && role !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL('/admin-manager', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
