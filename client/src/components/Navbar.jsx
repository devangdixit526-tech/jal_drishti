import React from 'react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d343a] border-b border-teal-900/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18m0-18l-4 4m4-4l4 4M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">JalDrishti</span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-white font-medium text-sm border-b-2 border-teal-400 pb-1">
            Home
          </a>
          <a href="#about" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
            About
          </a>
          <a href="#data-sources" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
            Data Sources
          </a>
        </nav>

        {/* Action Button */}
        <div>
          <button className="px-5 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer">
            Get Started
          </button>
        </div>

      </div>
    </header>
  );
}