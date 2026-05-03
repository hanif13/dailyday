import { NextRequest, NextResponse } from 'next/server';
import { createFeedback, getUserFromToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
    const userId = await getUserFromToken(token);

    const body = await req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const success = await createFeedback({
      user_id: userId || undefined,
      message: message.trim(),
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
