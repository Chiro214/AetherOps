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
         className={`p-1.5 rounded transition-colors ${isOpen ? 'text-[#0176D3] bg-blue-50' : 'text-gray-500 hover:text-[#0176D3] hover:bg-gray-100'}`}
         title="App Launcher"
      >
         <Grid size={20} />
      </button>

      {/* App Launcher Modal Overlay */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-80 bg-white border border-gray-200 shadow-xl rounded-b-md z-40 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
           <h3 className="text-sm font-bold text-gray-900 mb-3">App Launcher</h3>
           <input 
             type="text" 
             placeholder="Search apps and items..." 
             className="w-full h-8 px-3 mb-4 border border-gray-300 rounded text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
           />
           <div className="flex flex-col gap-2">
             {apps.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">No Apps Available</div>
             ) : (
                apps.map((app) => (
                   <div 
                      key={app.id} 
                      onClick={() => handleSelectApp(app.id)}
                      className="flex items-start gap-3 p-2 rounded hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-colors"
                   >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center flex-shrink-0 text-white shadow-sm font-bold tracking-tight">
                        {app.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                         <div className="text-sm font-semibold text-gray-900 leading-none mb-1">{app.name}</div>
                         <div className="text-[11px] text-gray-500 leading-tight">{app.description}</div>
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
