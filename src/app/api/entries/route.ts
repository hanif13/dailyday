import { NextRequest, NextResponse } from 'next/server';
import { getAllEntries, createEntry, getUserFromToken, PaperStyle } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    const userId = await getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await getAllEntries(userId);
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    const userId = await getUserFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, mood, paper_style, tags } = body;

    if (!title && !content) {
      return NextResponse.json({ error: 'Title or content required' }, { status: 400 });
    }

    const entry = await createEntry({
      title: title || 'Untitled',
      content: content || '',
      mood: mood || '📝',
      paper_style: (paper_style as PaperStyle) || 'plain',
      tags: tags || [],
      user_id: userId,
    });

    if (!entry) {
      return NextResponse.json({ error: 'Failed to create entry in database' }, { status: 500 });
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
