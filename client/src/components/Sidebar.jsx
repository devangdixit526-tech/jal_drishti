import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Lightbulb,
  Info,
  Droplets
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'crop-intelligence', label: 'Crop Intelligence', icon: Sprout },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const secondaryNavItems = [
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-64 bg-[#0A2E30] text-slate-300 min-h-screen p-4 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-8">
        {/* Logo / Brand Header */}
        <div 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-3 px-3 pt-2 cursor-pointer text-white"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Droplets className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wide">JalDrishti</span>
        </div>

        {/* Main Navigation Group */}
        <nav className="space-y-1.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-700/50 text-white font-semibold shadow-xs'
                    : 'hover:bg-teal-900/40 hover:text-white text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom / Secondary Navigation Group */}
      <div className="pt-4 border-t border-teal-900/60 space-y-1.5">
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-700/50 text-white font-semibold shadow-xs'
                  : 'hover:bg-teal-900/40 hover:text-white text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}