import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WaterRiskModal from '../components/WaterRiskModal';

export default function Home({ setCurrentPage, onExplore }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar currentPage="home" setCurrentPage={setCurrentPage} />
      
      <Hero
        setCurrentPage={setCurrentPage}
        onExplore={onExplore}
        onOpenCalculator={() => setIsModalOpen(true)}
      />

      <WaterRiskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}