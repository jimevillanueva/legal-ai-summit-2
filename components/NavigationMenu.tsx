import React, { useState } from 'react';

interface NavigationMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'agenda', label: 'Agenda' },
    { id: 'ponentes', label: 'Ponentes' },
    { id: 'información', label: 'Información' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NavigationMenu;