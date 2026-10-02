import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

export default function Home({ onExplore }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar onExplore={onExplore} />
      <main>
        <Hero onExplore={onExplore} />
      </main>
    </div>
  );
}