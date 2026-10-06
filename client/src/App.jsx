import React, { useState } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CropIntelligence from './pages/CropIntelligence';
import About from './pages/About';
import Insights from './pages/Insights';
import Sidebar from './components/Sidebar';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const isHomePage = currentPage === 'home';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Render Sidebar on all interior pages */}
      {!isHomePage && (
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'home' && (
          <Home
            setCurrentPage={setCurrentPage}
            onExplore={() => setCurrentPage('dashboard')}
          />
        )}
        {currentPage === 'dashboard' && (
          <Dashboard setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'crop-intelligence' && (
          <CropIntelligence />
        )}
        {currentPage === 'insights' && (
          <Insights setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'about' && (
          <About />
        )}
      </main>
    </div>
  );
}

export default App;