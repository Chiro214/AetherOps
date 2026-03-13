import CustomerProfile from '@/components/CustomerProfile';

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Simplified Header for MVP */}
        <header className="h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur top-0 z-50 flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold tracking-tighter">
              AG
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Antigravity B2C</h1>
          </div>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 w-96 relative shadow-inner">
             <input 
               type="text" 
               placeholder="Omni-Search: phone, email, name..." 
               className="bg-transparent border-none text-sm text-zinc-200 w-full outline-none px-2 placeholder:text-zinc-600"
             />
             <div className="absolute right-2 top-1.5 flex gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono text-[10px] border border-zinc-700">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono text-[10px] border border-zinc-700">K</kbd>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-medium text-sm">
              JS
            </div>
          </div>
        </header>
        
        {/* Main Workspace - Rendering the 3-column view */}
        <div className="flex-1 overflow-hidden">
          <CustomerProfile customer={null} />
        </div>
      </div>
    </main>
  );
}
