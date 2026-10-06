import React from 'react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <header className="w-full bg-[#072225] text-white px-8 py-4 flex items-center justify-between border-b border-teal-900/40 sticky top-0 z-50">
      {/* Brand Logo */}
      <div 
        onClick={() => setCurrentPage('home')}
        className="text-xl font-bold tracking-wide cursor-pointer flex items-center gap-2"
      >
        <span>JalDrishti</span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = currentPage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentPage(link.id)}
              className={`text-sm font-medium transition-colors ${
                isActive
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Action Button */}
      <button
        onClick={() => setCurrentPage('dashboard')}
        className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs"
      >
        Open Dashboard
      </button>
    </header>
  );
}