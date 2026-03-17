'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid } from 'lucide-react';
import { setActiveAppCookie } from '@/actions/apps';

export default function AppLauncherClient({ apps }: { apps: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelectApp = async (appId: string) => {
    await setActiveAppCookie(appId);
    setIsOpen(false);
    // Hard refresh to re-run Server Components and fetch new Tabs for the selected App
    router.refresh(); 
  };

  return (
    <>
      <button 
         onClick={() => setIsOpen(!isOpen)}
         className={`p-1.5 rounded-lg transition-all transform active:scale-95 ${
           isOpen 
             ? 'text-aether-blue bg-blue-50 dark:bg-void-lighter ring-1 ring-aether-blue/20' 
             : 'text-gray-500 hover:text-aether-blue hover:bg-gray-100 dark:hover:bg-void-lighter'
         }`}
         title="App Launcher"
      >
         <Grid size={20} />
      </button>

      {/* App Launcher Modal Overlay */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-80 bg-white/90 dark:bg-void-light/90 backdrop-blur-md border border-gray-200 dark:border-void-lighter shadow-2xl rounded-xl z-[60] p-4 animate-in fade-in slide-in-from-top-4 duration-300">
           <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">App Launcher</h3>
           <input 
             type="text" 
             placeholder="Search apps and items..." 
             className="w-full h-8 px-3 mb-4 bg-gray-100 dark:bg-void border border-transparent dark:border-void-lighter rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-void focus:border-aether-blue focus:ring-1 focus:ring-aether-blue focus:outline-none transition-all placeholder:text-gray-500"
           />
           <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
             {apps.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-8">No Apps Available</div>
             ) : (
                apps.map((app) => (
                   <div 
                      key={app.id} 
                      onClick={() => handleSelectApp(app.id)}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-void-lighter cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-void-lighter transition-all group"
                   >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-md font-bold tracking-tight group-hover:scale-105 transition-transform duration-300">
                        {app.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none mb-1 group-hover:text-aether-blue transition-colors truncate">{app.name}</div>
                         <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight line-clamp-2">{app.description}</div>
                      </div>
                   </div>
                ))
             )}
           </div>
        </div>
      )}
    </>
  );
}
