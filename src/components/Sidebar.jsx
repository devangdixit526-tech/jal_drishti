import React from 'react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const mainNav = [
    { name: 'Dashboard', key: 'dashboard', icon: '📊' },
    { name: 'Explore Map', key: 'map', icon: '🗺️' },
    { name: 'Crop Intelligence', key: 'crops', icon: '🌾' },
    { name: 'Trends', key: 'trends', icon: '📈' },
    { name: 'Insights', key: 'insights', icon: '💡' },
  ];

  const subNav = [
    { name: 'About', key: 'about', icon: 'ℹ️' },
    { name: 'Data Sources', key: 'datasources', icon: '🗄️' },
  ];

  return (
    <aside className="w-64 bg-[#082228] text-slate-300 min-h-screen flex flex-col justify-between p-4 flex-shrink-0 border-r border-teal-900/40">
      <div className="space-y-6">
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
            💧
          </div>
          <span className="text-xl font-bold text-white tracking-wide">JalDrishti</span>
        </div>

        {/* Main Links */}
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-teal-700/50 text-white font-semibold border border-teal-500/30 shadow-inner'
                    : 'hover:bg-teal-900/30 text-slate-300'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary Links */}
      <div className="space-y-1 pt-6 border-t border-teal-900/50">
        {subNav.map((item) => (
          <button
            key={item.key}
            onClick={() => setCurrentPage(item.key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm hover:bg-teal-900/30 text-slate-400 transition-all text-left"
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </div>
    </aside>
  );
}