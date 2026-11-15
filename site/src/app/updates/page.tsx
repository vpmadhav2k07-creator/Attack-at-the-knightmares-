'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Update {
  id: number;
  author_name: string;
  title: string;
  content: string;
  created_at: string;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [adminUser, setAdminUser] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }

    const fetchUpdates = async () => {
      const { data } = await supabase
        .from('team_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setUpdates(data);
    };
    fetchUpdates();

    // Listen for new team updates in real-time and trigger a notification
    const channel = supabase
      .channel('public:team_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_updates' },
        (payload) => {
          const newUpdate = payload.new as Update;
          setUpdates((prev) => {
            if (prev.some((u) => u.id === newUpdate.id)) return prev;
            return [newUpdate, ...prev];
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`Knightmares Update: ${newUpdate.title}`, {
              body: newUpdate.content,
            });
          } else {
            alert(`NEW TEAM UPDATE: ${newUpdate.title}\n\n${newUpdate.content}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support system notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifEnabled(permission === 'granted');
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUser.trim();
    if (!cleanUser || !title.trim() || !content.trim()) return;

    setStatus('Verifying leader access...');

    // Case-insensitive check against your approved team_admins list
    const { data: adminRecord } = await supabase
      .from('team_admins')
      .select('lichess_username')
      .ilike('lichess_username', cleanUser)
      .maybeSingle();

    if (!adminRecord) {
      setStatus('Access Denied: Only approved team leaders can post updates.');
      return;
    }

    const { data, error } = await supabase
      .from('team_updates')
      .insert([
        {
          author_name: adminRecord.lichess_username,
          title: title.trim(),
          content: content.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      setStatus('Error: ' + error.message);
    } else if (data) {
      setUpdates((prev) => {
        if (prev.some((u) => u.id === data.id)) return prev;
        return [data as Update, ...prev];
      });
      setTitle('');
      setContent('');
      setStatus('Update published and sent to players!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-amber-500 uppercase">Team Updates</h1>
          <p className="text-xs text-slate-400">ATTACK-AT-THE-KNIGHTMARES</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={requestNotifications}
            className={`text-xs font-bold px-3 py-2 rounded-xl ${
              notifEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            {notifEnabled ? '🔔 Alerts Active' : '🔔 Enable Alerts'}
          </button>
          <Link href="/" className="text-xs text-amber-400 hover:underline">← Home</Link>
        </div>
      </header>

      {/* Leader-Only Post Box */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
        <h2 className="text-sm font-bold text-amber-400 uppercase mb-3">Post Leader Announcement</h2>
        <form onSubmit={handlePostUpdate} className="space-y-3">
          <input
            type="text"
            required
            value={adminUser}
            onChange={(e) => setAdminUser(e.target.value)}
            placeholder="Leader Lichess Username (e.g. Mahadevvp-2012)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update Headline (e.g. Sunday Arena Battle)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm py-3 rounded-xl"
          >
            Broadcast Update
          </button>
        </form>
        {status && <p className="mt-3 text-xs text-amber-400">{status}</p>}
      </section>

      {/* Feed of Announcements */}
      <section className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-sm text-slate-400 text-center">No announcements yet. Post the first update above!</p>
        ) : (
          updates.map((u) => (
            <div key={u.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-amber-400">{u.title}</h3>
                <span className="text-xs text-slate-500">By {u.author_name}</span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{u.content}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
