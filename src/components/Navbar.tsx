import React from 'react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  favoriteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoriteCount
}) => {
  return (
    <nav className="bg-surface-container-lowest sticky top-0 w-full z-50 border-b border-outline-variant shadow-sm transition-all duration-300 ease-in-out">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center h-20">
        
        {/* Brand */}
        <a 
          className="text-headline-md font-headline-md text-primary tracking-tight cursor-pointer" 
          onClick={() => setActiveTab('search')}
        >
          EstateVantage
        </a>
        
        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-gutter items-center">
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md text-label-md font-label-md transition-colors ${
              activeTab === 'search' 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-secondary hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            Properties
          </button>
          
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-md text-label-md font-label-md transition-colors flex items-center gap-2 ${
              activeTab === 'favorites' 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-secondary hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            Saved ({favoriteCount})
          </button>
        </div>
        
        {/* Search and Action */}
        <div className="flex items-center space-x-4">
          <button aria-label="Search" className="text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button aria-label="Menu" className="md:hidden text-secondary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        
      </div>
    </nav>
  );
};
