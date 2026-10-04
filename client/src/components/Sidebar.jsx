import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Sprout, 
  TrendingUp, 
  Lightbulb, 
  Info, 
  Database,
  Droplets
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore-map', label: 'Explore Map', icon: Map },
    { id: 'crop-intelligence', label: 'Crop Intelligence', icon: Sprout },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const secondaryNavItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'data-sources', label: 'Data Sources', icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#022c2e] text-slate-300 min-h-screen flex flex-col justify-between p-4 shrink-0 select-none">
      <div className="space-y-8">
        {/* Logo Section */}
        <div 
          onClick={() => setCurrentPage('home')} 
          className="flex items-center gap-3 px-3 py-2 cursor-pointer group"
        >
          <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400 group-hover:bg-teal-500/30 transition-colors">
            <Droplets className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">JalDrishti</span>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#005f60] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Info Navigation */}
      <div className="pt-6 border-t border-slate-800/60 space-y-1.5">
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}