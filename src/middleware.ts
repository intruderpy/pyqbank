import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const auth = request.cookies.get('admin_auth')?.value;
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'pyqbank_admin_2025';

    if (auth !== ADMIN_SECRET) {
      // Redirect to login page
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
