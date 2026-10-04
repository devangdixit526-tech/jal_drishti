import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

export default function Home({ onExplore, setCurrentPage }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar onExplore={onExplore} setCurrentPage={setCurrentPage} />
      <main>
        <Hero onExplore={onExplore} />
      </main>
    </div>
  );
}