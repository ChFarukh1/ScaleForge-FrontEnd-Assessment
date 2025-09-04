'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from './navigation';
import { Sidebar } from './sidebar';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<'members' | 'analytics' | 'settings'>('members');

  // Update active section based on current pathname
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveSection('members');
    } else if (pathname === '/analytics') {
      setActiveSection('analytics');
    } else if (pathname === '/settings') {
      setActiveSection('settings');
    }
  }, [pathname]);

  const handleSearch = (query: string) => {
    // This will be handled by the specific page components
    console.log('Global search:', query);
  };

  const handleSectionChange = (section: 'members' | 'analytics' | 'settings') => {
    setActiveSection(section);
    // Navigate to the appropriate page
    const routes = {
      members: '/dashboard',
      analytics: '/analytics',
      settings: '/settings'
    };
    window.location.href = routes[section];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Navigation onSearch={handleSearch} />
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        <main className="flex-1 min-w-0 w-full p-4 md:p-6 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
}
