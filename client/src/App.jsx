import React, { useState } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CropIntelligence from './pages/CropIntelligence';
import Sidebar from './components/Sidebar';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Check if current page is the Home landing page
  const isHomePage = currentPage === 'home';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar rendered ONCE globally for non-home pages */}
      {!isHomePage && (
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'home' && (
          <Home onExplore={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'dashboard' && (
          <Dashboard setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'crop-intelligence' && (
          <CropIntelligence />
        )}
      </main>
    </div>
  );
}

export default App;