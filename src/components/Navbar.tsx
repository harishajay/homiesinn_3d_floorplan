import React from 'react';
import { Search, ChevronDown, User } from 'lucide-react';

interface NavbarProps {
  onSearch?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              H
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
                HomiesInn
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                URBAN CO-LIVING
              </span>
            </div>
          </div>

          {/* City Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Chennai</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hostels, clusters, amenities, or room"
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Nav Links & Resident Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <a href="#find-a-bed" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Find a Bed
            </a>
            <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold whitespace-nowrap">
              My Bookings
            </span>
            <a href="#community" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Community Hub
            </a>
          </nav>

          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">Harish Aravind</span>
              <span className="text-[10px] text-slate-500 font-medium block">Resident • #529</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
