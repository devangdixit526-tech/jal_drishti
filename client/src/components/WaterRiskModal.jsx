import React, { useState } from 'react';
import { X, Calculator, Droplet, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function WaterRiskModal({ isOpen, onClose, setCurrentPage }) {
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Rice)');

  if (!isOpen) return null;

  const cropData = {
    'Paddy (Rice)': {
      demand: '5.8 mm/day',
      stress: 'High Risk',
      stressColor: 'bg-red-500/10 text-red-600 border-red-200',
      alt: 'Maize / Millets',
      savings: '35% Water Reduction',
    },
    'Sugarcane': {
      demand: '6.2 mm/day',
      stress: 'Severe Risk',
      stressColor: 'bg-red-500/10 text-red-600 border-red-200',
      alt: 'Cotton / Pulses',
      savings: '40% Water Reduction',
    },
    'Wheat': {
      demand: '3.4 mm/day',
      stress: 'Moderate Risk',
      stressColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
      alt: 'Mustard / Gram',
      savings: '22% Water Reduction',
    },
    'Maize': {
      demand: '3.9 mm/day',
      stress: 'Optimal',
      stressColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      alt: 'Sustainable Choice',
      savings: 'Recommended baseline',
    },
  };

  const current = cropData[selectedCrop];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Check Water Risk</h3>
              <p className="text-slate-500 text-xs">
                     Understand crop water demand and its potential impact on groundwater
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            Select Crop Type
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            {Object.keys(cropData).map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>

        {/* Calculated Results Box */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
              <Droplet className="w-4 h-4 text-teal-600" />
              <span>Water Demand:</span>
            </div>
            <span className="font-bold text-slate-900 text-sm">{current.demand}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Aquifer Impact:</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${current.stressColor}`}>
              {current.stress}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Recommended Alternative</p>
              <p className="text-xs font-bold text-teal-700">{current.alt}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {current.savings}
            </span>
          </div>
        </div>

        {/* Action Button to Full Dashboard */}
        <button
          onClick={() => {
            onClose();
            if (setCurrentPage) setCurrentPage('crop-intelligence');
          }}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>View Detailed Crop Intelligence Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}