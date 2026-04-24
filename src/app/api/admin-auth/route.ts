import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'pyqbank_admin_2025';

  if (password === ADMIN_SECRET) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_auth', ADMIN_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
