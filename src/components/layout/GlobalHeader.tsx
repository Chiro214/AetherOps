import React from 'react';
import Link from 'next/link';
import { Plus, Settings, Bell } from 'lucide-react';
import GlobalSearch from '@/components/crm/GlobalSearch';
import AppLauncherClient from './AppLauncherClient';
import { getApps, getActiveAppCookie } from '@/actions/apps';

export default async function GlobalHeader() {
  const apps = await getApps();
  const activeAppId = await getActiveAppCookie();
  
  const activeApp = apps.find((a: any) => a.id === activeAppId);
  const appName = activeApp ? (activeApp as any).name : 'AetherOps CRM';

  return (
    <>
      {/* Salesforce Global Header */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-50 relative">
        
        {/* Left: App Launcher & Branding */}
        <div className="flex items-center gap-4">
          <AppLauncherClient apps={apps} />
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
             <div className="w-8 h-8 bg-[#0176D3] rounded flex items-center justify-center text-white font-bold text-xs tracking-tighter">
               AO
             </div>
             <span className="font-semibold text-gray-900 text-lg hidden sm:block">{appName}</span>
          </div>
        </div>

        {/* Center: Global Search */}
        <GlobalSearch />

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
    </>
  );
}
