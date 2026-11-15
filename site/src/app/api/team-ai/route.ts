import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    // Fetch live team context from Supabase
    const { data: updates } = await supabase
      .from('team_updates')
      .select('title, content, author_name')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: leaders } = await supabase
      .from('team_admins')
      .select('lichess_username');

    const leaderNames = leaders?.map((l) => l.lichess_username).join(', ') || 'Team Leaders';
    const recentNews = updates?.length
      ? updates.map((u) => `- ${u.title}: ${u.content} (by ${u.author_name})`).join('\n')
      : 'No announcements posted yet.';

    const teamKnowledge = `You are the official AI assistant for the Lichess chess team "attack-at-the-knightmares".
Rules & Info:
- Official Lichess Team: https://lichess.org
- Players can set their custom team display name ONLY ONCE at /name.
- Approved Team Leaders (max 15): ${leaderNames}.
- Recent Team Updates:\n${recentNews}
Answer player doubts clearly, concisely, and helpfully.`;

    // If GEMINI_API_KEY is set in .env.local, use live Gemini AI
    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://googleapis.com{process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${teamKnowledge}\n\nPlayer Question: ${question}` }] }],
          }),
        }
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return NextResponse.json({ answer: reply });
    }

    // Built-in smart fallback using live Supabase team data (works with zero API keys)
    const q = question.toLowerCase();
    let answer = `Welcome to attack-at-the-knightmares! Here is the latest team info:\n\n• Leaders: ${leaderNames}\n• Latest Updates:\n${recentNews}\n\nAsk me about leaders, updates, team chat, or how to lock in your nickname!`;

    if (q.includes('leader') || q.includes('admin') || q.includes('owner')) {
      answer = `Our approved team leaders (up to 15 max) are: ${leaderNames}. Only these leaders can broadcast announcements on the /updates page.`;
    } else if (q.includes('name') || q.includes('nickname') || q.includes('change')) {
      answer = `You can register your custom team name on the /name page. Choose carefully—once locked in, your nickname cannot be changed!`;
    } else if (q.includes('update') || q.includes('tournament') || q.includes('battle') || q.includes('news')) {
      answer = `Here are the latest announcements from our leaders:\n\n${recentNews}`;
    } else if (q.includes('chat') || q.includes('message')) {
      answer = `Head over to the /chat page to talk live with teammates and plan openings or arena strategies.`;
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: 'Sorry, I could not load team data right now. Please try again.' });
  }
}
