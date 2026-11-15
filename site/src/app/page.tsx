import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
      {/* Team Header */}
      <header className="text-center max-w-2xl mb-10 mt-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-amber-500 uppercase mb-3">
          AATK Enquires
        </h1>
        <p className="text-slate-400 text-base">
          Official Team Portal for ATTACK-AT-THE-KNIGHTMARES on Lichess.
        </p>
      </header>

      {/* Clickable 5-Feature Navigation Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl">
        {/* 1. Team Chat */}
        <Link href="/chat" className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/60 active:scale-[0.98] transition-all">
          <h2 className="text-xl font-bold text-amber-400 mb-2">💬 Team Strategy Chat</h2>
          <p className="text-slate-400 text-sm mb-4">
            Discuss openings, plan internal arena tournaments, and chat live with teammates.
          </p>
          <span className="inline-block text-xs font-semibold bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full">
            Open Chat →
          </span>
        </Link>

        {/* 2. Admin Updates & Notifications */}
        <Link href="/updates" className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-blue-500/60 active:scale-[0.98] transition-all">
          <h2 className="text-xl font-bold text-amber-400 mb-2">📢 Leadership Announcements</h2>
          <p className="text-slate-400 text-sm mb-4">
            Enable alerts and read or broadcast official team updates from approved leaders.
          </p>
          <span className="inline-block text-xs font-semibold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
            Open Updates →
          </span>
        </Link>

        {/* 3. AI Assistant */}
        <Link href="/ai" className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-emerald-500/60 active:scale-[0.98] transition-all">
          <h2 className="text-xl font-bold text-amber-400 mb-2">🤖 Knightmare AI Tactician</h2>
          <p className="text-slate-400 text-sm mb-4">
            Have doubts about team rules, schedules, or how to join battles? Ask our team AI anytime.
          </p>
          <span className="inline-block text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
            Ask AI Assistant →
          </span>
        </Link>

        {/* 4. Custom Single-use Naming */}
        <Link href="/name" className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-rose-500/60 active:scale-[0.98] transition-all">
          <h2 className="text-xl font-bold text-amber-400 mb-2">🛡️ Player Nickname Registry</h2>
          <p className="text-slate-400 text-sm mb-4">
            Lock in your permanent team display name. One-time registration only.
          </p>
          <span className="inline-block text-xs font-semibold bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full">
            Set Name Once →
          </span>
        </Link>

        {/* 5. Roster & 15 Leaders Manager */}
        <Link href="/members" className="block md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-purple-500/60 active:scale-[0.98] transition-all">
          <h2 className="text-xl font-bold text-amber-400 mb-2">👑 Roster & 15 Leaders</h2>
          <p className="text-slate-400 text-sm mb-4">
            View all joined team members and manage up to 15 approved team leaders.
          </p>
          <span className="inline-block text-xs font-semibold bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full">
            Manage Squad →
          </span>
        </Link>
      </main>

      <footer className="mt-14 mb-6 text-xs text-slate-600 tracking-wider">
        ATTACK-AT-THE-KNIGHTMARES &copy; 2026
      </footer>
    </div>
  );
}
