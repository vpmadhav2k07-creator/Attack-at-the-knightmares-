'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CustomProfile {
  lichess_username: string;
  custom_name: string;
  created_at: string;
}

interface LichessMember {
  id: string;
  username: string;
  title?: string;
}

interface Admin {
  lichess_username: string;
}

export default function MembersAndLeadersPage() {
  const [lichessMembers, setLichessMembers] = useState<LichessMember[]>([]);
  const [customProfiles, setCustomProfiles] = useState<Record<string, CustomProfile>>({});
  const [leaders, setLeaders] = useState<Admin[]>([]);
  const [myAdminUser, setMyAdminUser] = useState('');
  const [newFriendUser, setNewFriendUser] = useState('');
  const [status, setStatus] = useState('');
  const [loadingRoster, setLoadingRoster] = useState(true);

  const fetchData = async () => {
    const { data: memberData } = await supabase
      .from('team_profiles')
      .select('*');
    if (memberData) {
      const profileMap: Record<string, CustomProfile> = {};
      memberData.forEach((m: CustomProfile) => {
        profileMap[m.lichess_username.toLowerCase()] = m;
      });
      setCustomProfiles(profileMap);
    }

    const { data: leaderData } = await supabase
      .from('team_admins')
      .select('lichess_username');
    if (leaderData) setLeaders(leaderData);

    try {
      const res = await fetch('/api/lichess-members');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members)) {
          setLichessMembers(data.members);
        }
      }
    } catch {
      // Safely ignore if Lichess API is temporarily unavailable
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAdmin = myAdminUser.trim().toLowerCase();
    const cleanFriend = newFriendUser.trim().toLowerCase();
    if (!cleanAdmin || !cleanFriend) return;

    const isLeader = leaders.some((l) => l.lichess_username.toLowerCase() === cleanAdmin);
    if (!isLeader) {
      setStatus('Access Denied: Enter your own approved leader username first.');
      return;
    }

    if (leaders.length >= 15) {
      setStatus('Limit Reached: Maximum 15 leaders allowed.');
      return;
    }

    const { error } = await supabase
      .from('team_admins')
      .insert([{ lichess_username: cleanFriend }]);

    if (error) {
      setStatus('Error: ' + error.message);
    } else {
      setNewFriendUser('');
      setStatus(`Added "${cleanFriend}" as a team leader!`);
      fetchData();
    }
  };

  const handleRemoveLeader = async (targetUser: string) => {
    const cleanAdmin = myAdminUser.trim().toLowerCase();
    const isLeader = leaders.some((l) => l.lichess_username.toLowerCase() === cleanAdmin);
    if (!isLeader) {
      setStatus('Enter your approved leader username above before removing anyone.');
      return;
    }

    await supabase.from('team_admins').delete().eq('lichess_username', targetUser);
    setStatus(`Removed "${targetUser}" from leaders.`);
    fetchData();
  };

  const registeredList = Object.values(customProfiles);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-amber-500 uppercase">Roster & Leaders</h1>
          <p className="text-xs text-slate-400">ATTACK-AT-THE-KNIGHTMARES</p>
        </div>
        <Link href="/" className="text-xs text-amber-400 hover:underline">← Home</Link>
      </header>

      {/* Section 1: Manage 15 Leaders */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-amber-400 uppercase">Team Leaders ({leaders.length} / 15)</h2>
          <span className="text-xs text-slate-400">{15 - leaders.length} slots left</span>
        </div>

        <form onSubmit={handleAddLeader} className="space-y-3 mb-4">
          <input
            type="text"
            required
            value={myAdminUser}
            onChange={(e) => setMyAdminUser(e.target.value)}
            placeholder="Your Leader Username (to unlock)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              required
              disabled={leaders.length >= 15}
              value={newFriendUser}
              onChange={(e) => setNewFriendUser(e.target.value)}
              placeholder="Friend's Lichess Username"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={leaders.length >= 15}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>

        {status && <p className="mb-3 text-xs text-amber-400">{status}</p>}

        <div className="flex flex-wrap gap-2">
          {leaders.map((leader) => (
            <div key={leader.lichess_username} className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
              <span className="font-bold text-amber-300">👑 {leader.lichess_username}</span>
              <button
                onClick={() => handleRemoveLeader(leader.lichess_username)}
                className="text-slate-500 hover:text-rose-400 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Team Members Roster */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase">Team Roster</h2>
          <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            Total Members: {lichessMembers.length > 0 ? lichessMembers.length : registeredList.length}
          </span>
        </div>

        {loadingRoster ? (
          <p className="text-sm text-slate-400">Loading team roster...</p>
        ) : lichessMembers.length > 0 ? (
          <div className="space-y-2.5">
            {lichessMembers.map((m, index) => {
              const profile = customProfiles[m.id.toLowerCase()];
              return (
                <div key={m.id} className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-100">
                      <span className="text-slate-500 mr-2">#{index + 1}</span>
                      {profile ? profile.custom_name : m.username}
                      {m.title && <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">{m.title}</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      Lichess: @{m.username} {profile ? '• Custom Name Locked' : '• No Custom Name Yet'}
                    </p>
                  </div>
                  <div className="text-right">
                    {profile ? (
                      <>
                        <span className="text-[11px] text-slate-500 block">Site Joined</span>
                        <span className="text-xs text-slate-300">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500">Lichess Member</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : registeredList.length > 0 ? (
          <div className="space-y-2.5">
            {registeredList.map((m, index) => (
              <div key={m.lichess_username} className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    <span className="text-slate-500 mr-2">#{index + 1}</span>
                    {m.custom_name}
                  </p>
                  <p className="text-xs text-slate-400">Lichess: @{m.lichess_username}</p>
                </div>
                <span className="text-xs text-slate-300">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No members registered yet. Share your /name page with your squad!</p>
        )}
      </section>
    </div>
  );
}
