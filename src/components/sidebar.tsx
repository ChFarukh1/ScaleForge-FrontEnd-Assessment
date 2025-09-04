'use client';

import { useState } from 'react';
import { UsersIcon, ChartBarIcon, Cog6ToothIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  activeSection?: 'members' | 'analytics' | 'settings';
  onSectionChange?: (section: 'members' | 'analytics' | 'settings') => void;
}

export function Sidebar({ activeSection = 'members', onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      id: 'members' as const,
      name: 'Members',
      icon: UsersIcon,
      description: 'Manage team members',
      href: '/dashboard'
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      icon: ChartBarIcon,
      description: 'View performance metrics',
      href: '/analytics'
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: Cog6ToothIcon,
      description: 'Configure preferences',
      href: '/settings'
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`hidden md:flex sticky top-16 h-[calc(100vh-4rem)] z-30 bg-white dark:bg-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col relative`}>
      {/* Toggle Button - kept inside the sidebar to avoid horizontal overflow */}
      <button
        onClick={toggleSidebar}
        className="absolute right-2 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:scale-110 transition-transform duration-200 shadow-md z-10"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <div className="h-full overflow-y-auto">
        <div className={`p-6 pb-8 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}> 
        {/* Logo/Title */}
        <div className={`mb-6 transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSectionChange?.(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:scale-105'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                        {item.name}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>

                {/* Active Page Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 blur-xl -z-10 animate-pulse"></div>
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        </div>
      </div>
      {/* Full-height divider to ensure the separation line reaches the bottom, outside scroll area */}
      <span aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
    </aside>
  );
}
