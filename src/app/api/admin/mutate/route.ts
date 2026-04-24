import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const authCookie = request.cookies.get('admin_auth')?.value;
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'pyqbank_admin_2025';

    if (authCookie !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { action, table, payload, match, select } = body;

    if (!action || !table) {
      return NextResponse.json({ error: 'Missing action or table' }, { status: 400 });
    }

    // 3. Perform the requested operation using the Service Role Key
    let result;

    switch (action) {
      case 'insert':
        result = await (supabaseAdmin as any)
          .from(table)
          .insert(payload)
          .select(select || '*');
        break;

      case 'update':
        if (!match) {
          return NextResponse.json({ error: 'Update requires a match object' }, { status: 400 });
        }
        result = await (supabaseAdmin as any)
          .from(table)
          .update(payload)
          .match(match)
          .select(select || '*');
        break;

      case 'delete':
        if (!match) {
          return NextResponse.json({ error: 'Delete requires a match object' }, { status: 400 });
        }
        result = await (supabaseAdmin as any)
          .from(table)
          .delete()
          .match(match)
          .select(select || '*');
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = result;

    if (error) {
      console.error('Supabase Admin Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
