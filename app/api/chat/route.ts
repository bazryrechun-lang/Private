import { NextRequest, NextResponse } from 'next/server';
import { handleUserMessage } from '@/lib/coordinator';

export async function POST(req: NextRequest) {
  try {
    const { message, clientId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '缺少message字段' }, { status: 400 });
    }
    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json({ error: '缺少clientId字段' }, { status: 400 });
    }

    const reply = await handleUserMessage({
      message,
      source: 'web',
      chatKey: `web:${clientId}`,
    });

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || '服务器出错' },
      { status: 500 }
    );
  }
}
