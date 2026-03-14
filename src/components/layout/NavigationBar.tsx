import React from 'react';
import { getActiveAppCookie, getTabsForApp } from '@/actions/apps';
import MainNavClient from './MainNavClient';

export default async function NavigationBar() {
  const activeAppId = await getActiveAppCookie();
  const tabs = await getTabsForApp(activeAppId);

  // We explicitly combine static required tabs with the dynamic App tabs. 
  // Next.js Link paths to dynamic objects use the [resource] catch-all (e.g., /accounts).
  const dynamicNavItems = tabs.map((tab: any) => ({
     label: tab.label,
     href: `/${tab.api_name.toLowerCase()}`
  }));

  const NAV_ITEMS = [
    { label: 'Home', href: '/home' },
    ...dynamicNavItems,
    { label: 'Reports', href: '/reports' },
    { label: 'Dashboards', href: '/dashboards' },
  ];

  return (
    <nav className="h-10 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0 z-40 relative shadow-sm">
      <MainNavClient navItems={NAV_ITEMS} />
    </nav>
  );
}
