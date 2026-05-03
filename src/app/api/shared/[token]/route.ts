import { NextRequest, NextResponse } from 'next/server';
import { getEntryByShareToken } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const entry = await getEntryByShareToken(params.token);
    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch shared entry' }, { status: 500 });
  }
}
