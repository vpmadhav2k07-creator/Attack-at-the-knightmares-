'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: number;
  sender_name: string;
  message: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('knightmare_name');
    if (savedName) setPlayerName(savedName);

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('team_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setMessages(data);
    };
    fetchMessages();

    const chatChannel = supabase
      .channel('public:team_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_chat' },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !playerName || sending) return;

    setSending(true);
    const textToSend = newMessage.trim();
    setNewMessage('');

    const { data, error } = await supabase
      .from('team_chat')
      .insert([{ sender_name: playerName, message: textToSend }])
      .select()
      .single();

    setSending(false);

    if (error) {
      alert('Error sending message: ' + error.message);
      setNewMessage(textToSend);
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data as Message];
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col max-w-xl mx-auto border-x border-slate-900 shadow-2xl">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-amber-500 tracking-wide uppercase">Team Strategy Chat</h1>
          <p className="text-xs text-slate-400">
            {playerName ? `Chatting as: ${playerName}` : 'ATTACK-AT-THE-KNIGHTMARES'}
          </p>
        </div>
        <Link href="/" className="text-xs text-amber-400 hover:underline">← Home</Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[60vh]">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col bg-slate-900/60 border border-slate-900 rounded-xl p-3 max-w-[85%] self-start">
            <span className="text-xs font-bold text-amber-400 mb-1">{msg.sender_name}</span>
            <p className="text-sm text-slate-200 break-words">{msg.message}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-slate-900/50 border-t border-slate-900 sticky bottom-0 backdrop-blur-md">
        {!playerName ? (
          <div className="text-center py-2">
            <p className="text-xs text-slate-300 mb-2">You must lock in your one-time team name before chatting.</p>
            <Link href="/name" className="inline-block bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl">
              Set Your Name Once →
            </Link>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 placeholder-slate-600 text-slate-100"
              placeholder="Type a team tactic..."
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-amber-500 text-slate-950 font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-50"
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}
