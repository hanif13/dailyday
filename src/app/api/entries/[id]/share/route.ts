import { NextRequest, NextResponse } from 'next/server';
import { getEntryById, createShareToken, revokeShareToken, getUserFromToken } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    const userId = await getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const entry = await getEntryById(Number(params.id));
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (entry.user_id && entry.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If already has share token, return existing
    if (entry.share_token && entry.is_public) {
      return NextResponse.json({ share_token: entry.share_token });
    }

    const shareToken = await createShareToken(Number(params.id));
    if (!shareToken) {
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }

    return NextResponse.json({ share_token: shareToken }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to share entry' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    const userId = await getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const entry = await getEntryById(Number(params.id));
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (entry.user_id && entry.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await revokeShareToken(Number(params.id));
    if (!success) {
      return NextResponse.json({ error: 'Failed to revoke share' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to revoke share' }, { status: 500 });
  }
}
