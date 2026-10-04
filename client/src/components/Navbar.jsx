import React from 'react';

export default function Navbar({ onExplore, setCurrentPage }) {
  return (
    <header className="bg-[#0A2E30] text-white px-8 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
        <span className="font-bold text-xl tracking-wide">JalDrishti</span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-8">
        <button 
          onClick={() => setCurrentPage('home')}
          className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
        >
          Home
        </button>

        {/* 🌟 ABOUT BUTTON FIX */}
        <button 
          onClick={() => setCurrentPage('about')}
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          About
        </button>

        <button 
          onClick={() => setCurrentPage('about')}
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Data Sources
        </button>
      </nav>

      {/* CTA Button */}
      <button 
        onClick={onExplore}
        className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold px-5 py-2 rounded-full text-sm transition-all"
      >
        Get Started
      </button>
    </header>
  );
}