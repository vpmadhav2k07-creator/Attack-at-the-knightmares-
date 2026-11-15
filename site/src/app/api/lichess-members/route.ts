import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://lichess.org/api/lichess-members', {
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ members: [] });
    const text = await res.text();
    const members = text.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
    return NextResponse.json({ members });
  } catch {
    return NextResponse.json({ members: [] });
  }
}
