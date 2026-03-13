'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Search, Bell, Grid } from 'lucide-react';

export default function SetupHeader() {
  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-50 relative shadow-sm">
      
      {/* Left: Setup Branding */}
      <div className="flex items-center gap-4">
        <Link 
          href="/home"
          className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 rounded transition-colors"
          title="Back to App"
        >
          <Grid size={20} />
        </Link>
        <div className="flex items-center gap-2">
           <Settings size={22} className="text-gray-600" />
           <span className="font-semibold text-gray-900 text-lg">Setup</span>
        </div>
      </div>

      {/* Center: Global Setup Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#0176D3] transition-colors" />
          <input 
            type="text" 
            placeholder="Search Setup (e.g. Users, Profiles, Objects)..." 
            className="w-full h-8 pl-9 pr-3 bg-gray-100 border border-transparent rounded-md text-sm text-gray-900 focus:bg-white focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] focus:outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2">
         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:block mr-2">Admin Portal</span>
        <button className="p-1.5 text-gray-500 hover:text-[#0176D3] hover:bg-gray-100 rounded transition-colors" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="ml-2 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-xs border-2 border-transparent hover:border-[#0176D3] transition-all">
          JS
        </button>
      </div>
    </header>
  );
}
