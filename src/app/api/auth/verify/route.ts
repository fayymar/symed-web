import { createHmac, createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('BOT_TOKEN is not set');
      return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });
    }

    const { hash, ...data } = body;

    if (!hash) {
      return NextResponse.json({ ok: false, error: 'Missing hash' }, { status: 400 });
    }

    // Telegram Login Widget verification:
    // 1. Sort all fields (except hash) alphabetically and join as "key=value\n"
    // 2. Secret key = SHA-256 of bot token (raw bytes)
    // 3. Compute HMAC-SHA256 of data string using secret key
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    const secretKey = createHash('sha256').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      return NextResponse.json({ ok: false, error: 'Invalid hash' }, { status: 401 });
    }

    // Check auth_date is not older than 24 hours
    const authDate = Number(data.auth_date);
    const age = Math.floor(Date.now() / 1000) - authDate;
    if (age > 86400) {
      return NextResponse.json({ ok: false, error: 'Auth data expired' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
