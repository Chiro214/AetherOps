'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Grid, Search, Plus, Settings, Bell } from 'lucide-react';

export default function GlobalHeader() {
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);

  return (
    <>
      {/* Salesforce Global Header */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-50 relative">
        
        {/* Left: App Launcher & Branding */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAppLauncherOpen(!isAppLauncherOpen)}
            className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 rounded transition-colors"
            title="App Launcher"
          >
            <Grid size={20} />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#0176D3] rounded flex items-center justify-center text-white font-bold text-xs tracking-tighter">
               AG
             </div>
             <span className="font-semibold text-gray-900 text-lg hidden sm:block">Antigravity Sales</span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#0176D3] transition-colors" />
            <input 
              type="text" 
              placeholder="Search Setup, Apps, and Items..." 
              className="w-full h-8 pl-9 pr-3 bg-gray-100 border border-transparent rounded-md text-sm text-gray-900 focus:bg-white focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none transition-all placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 rounded transition-colors" title="Global Actions">
            <Plus size={20} />
          </button>
          <Link href="/setup/home" className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 rounded transition-colors" title="Setup">
            <Settings size={20} />
          </Link>
          <button className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 rounded transition-colors" title="Notifications">
            <Bell size={20} />
          </button>
          <button className="ml-2 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-xs border-2 border-transparent hover:border-[#0176D3] transition-all">
            JS
          </button>
        </div>
      </header>

      {/* App Launcher Modal Overlay */}
      {isAppLauncherOpen && (
        <div className="absolute top-12 left-0 w-80 bg-white border border-gray-200 shadow-xl rounded-b-md z-40 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
           <h3 className="text-sm font-bold text-gray-900 mb-3">App Launcher</h3>
           <input 
             type="text" 
             placeholder="Search apps and items..." 
             className="w-full h-8 px-3 mb-4 border border-gray-300 rounded text-sm focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none"
             autoFocus
           />
           <div className="flex flex-col gap-1">
              <div className="p-2 hover:bg-gray-50 rounded cursor-pointer group">
                 <div className="text-sm font-semibold text-[#0176D3] group-hover:underline">Sales Console</div>
                 <div className="text-xs text-gray-500">Standard sales pipeline management</div>
              </div>
              <div className="p-2 hover:bg-gray-50 rounded cursor-pointer group">
                 <div className="text-sm font-semibold text-[#0176D3] group-hover:underline">Service Console</div>
                 <div className="text-xs text-gray-500">Ticketing and customer support</div>
              </div>
              <div className="p-2 hover:bg-gray-50 rounded cursor-pointer group">
                 <div className="text-sm font-semibold text-[#0176D3] group-hover:underline">Marketing Cloud</div>
                 <div className="text-xs text-gray-500">Campaigns and lead generation</div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
