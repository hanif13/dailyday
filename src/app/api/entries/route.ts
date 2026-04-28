import { NextRequest, NextResponse } from 'next/server';
import { getAllEntries, createEntry, PaperStyle } from '@/lib/db';

export async function GET() {
  try {
    const entries = await getAllEntries();
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
