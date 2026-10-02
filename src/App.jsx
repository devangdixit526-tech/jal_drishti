import React, { useState } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {currentPage === 'home' ? (
        <Home onExplore={() => setCurrentPage('dashboard')} />
      ) : (
        <Dashboard setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;