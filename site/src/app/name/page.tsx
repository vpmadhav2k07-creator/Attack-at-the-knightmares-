'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NameRegistryPage() {
  const [lichessUser, setLichessUser] = useState('');
  const [customName, setCustomName] = useState('');
  const [status, setStatus] = useState('');
  const [lockedName, setLockedName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('knightmare_name');
    if (saved) {
      setLockedName(saved);
      setCustomName(saved);
      setStatus(`Your permanent team name is locked as "${saved}".`);
    }
  }, []);

  const handleLockName = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLichess = lichessUser.trim().toLowerCase();
    const cleanCustom = customName.trim();
    if (!cleanLichess || !cleanCustom) return;

    setStatus('Checking availability...');

    // 1. Check if this Lichess username is already registered
    const { data: existingLichess } = await supabase
      .from('team_profiles')
      .select('custom_name')
      .ilike('lichess_username', cleanLichess)
      .maybeSingle();

    if (existingLichess) {
      setStatus(`Taken: Lichess username "@${cleanLichess}" is already registered and cannot be used again.`);
      return;
    }

    // 2. Check if another player already claimed this custom team name
    const { data: existingCustom } = await supabase
      .from('team_profiles')
      .select('custom_name')
      .ilike('custom_name', cleanCustom)
      .maybeSingle();

    if (existingCustom) {
      setStatus(`Taken: The team name "${existingCustom.custom_name}" is already claimed by another player. Choose a different one!`);
      return;
    }

    // 3. Save permanently to Supabase
    const { error } = await supabase.from('team_profiles').insert([
      { lichess_username: cleanLichess, custom_name: cleanCustom },
    ]);

    if (error) {
      if (error.code === '23505') {
        setStatus('Taken: That Lichess username or custom team name is already registered!');
      } else {
        setStatus('Error: ' + error.message);
      }
    } else {
      setLockedName(cleanCustom);
      localStorage.setItem('knightmare_name', cleanCustom);
      setStatus(`Success! "${cleanCustom}" is now permanently locked to @${cleanLichess}.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-black text-amber-500 uppercase mb-2">Player Nickname Registry</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter your Lichess username and choose a unique permanent team name. Duplicate names are blocked.
        </p>

        <form onSubmit={handleLockName} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Lichess Username</label>
            <input
              type="text"
              required
              disabled={!!lockedName}
              value={lichessUser}
              onChange={(e) => setLichessUser(e.target.value)}
              placeholder="e.g. Mahadevvp-2012"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Permanent Team Name</label>
            <input
              type="text"
              required
              disabled={!!lockedName}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Choose a unique name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!!lockedName}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm py-3 rounded-xl disabled:opacity-50"
          >
            {lockedName ? 'Name Permanently Locked' : 'Lock In Name Forever'}
          </button>
        </form>

        {status && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400">
            {status}
          </div>
        )}

        <div className="mt-6 flex justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-amber-400">← Back Home</Link>
          <Link href="/chat" className="hover:text-amber-400">Go to Team Chat →</Link>
        </div>
      </div>
    </div>
  );
}
