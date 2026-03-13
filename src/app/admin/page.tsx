import AdminSettings from '@/components/AdminSettings';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Simplified Header for MVP */}
        <header className="h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur top-0 z-50 flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold tracking-tighter">
              AG
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Antigravity B2C - Admin Control Plane</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              Exit Setup
            </Link>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-medium text-sm">
              JS
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 overflow-auto">
          <AdminSettings />
        </div>
      </div>
    </main>
  );
}
