'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
}

export default function TeamAiPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'ai',
      text: 'Hello! I am the Knightmare AI Tactician. Ask me any doubts about attack-at-the-knightmares, our leaders, updates, or how to set your nickname!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const askAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const res = await fetch('/api/team-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col max-w-xl mx-auto border-x border-slate-900">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-emerald-400 uppercase">Knightmare AI Tactician</h1>
          <p className="text-xs text-slate-400">ATTACK-AT-THE-KNIGHTMARES</p>
        </div>
        <Link href="/" className="text-xs text-amber-400 hover:underline">← Home</Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-3.5 text-sm whitespace-pre-wrap max-w-[85%] ${
              m.role === 'user'
                ? 'bg-amber-500 text-slate-950 font-medium self-end ml-auto'
                : 'bg-slate-900 border border-slate-800 text-slate-200 self-start'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <p className="text-xs text-emerald-400 animate-pulse">Thinking...</p>}
      </main>

      <footer className="p-4 bg-slate-900/60 border-t border-slate-800 sticky bottom-0">
        <form onSubmit={askAi} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a doubt about our team..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </footer>
    </div>
  );
}
