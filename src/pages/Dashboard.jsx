import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function Dashboard({ setCurrentPage }) {
  const [selectedState, setSelectedState] = useState('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState('Ludhiana');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Left Navigation Sidebar */}
      <Sidebar currentPage="dashboard" setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        
        {/* Top Bar Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              Good morning, Devang <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Understand the water story behind every crop.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer">
              🔔
            </button>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full py-1.5 px-3">
              <div className="w-7 h-7 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                D
              </div>
              <span className="text-sm font-semibold text-slate-800">Devang</span>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-500 mb-1">State</label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-500 mb-1">District</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Ludhiana">Ludhiana</option>
                <option value="Amritsar">Amritsar</option>
                <option value="Jalandhar">Jalandhar</option>
                <option value="Patiala">Patiala</option>
                <option value="Bathinda">Bathinda</option>
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-slate-500 mb-1">Crop</label>
              <select 
                value={selectedCrop} 
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Paddy">Paddy</option>
                <option value="Wheat">Wheat</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>
          </div>

          <button className="self-end px-6 py-2.5 rounded-xl bg-[#0d343a] hover:bg-[#082228] text-white font-bold text-sm transition-all shadow-md shadow-teal-950/20 active:scale-95 cursor-pointer">
            Analyze Region
          </button>
        </div>

        {/* Middle Grid Section: Map + Right Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Map Section (Span 2) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 h-[340px] flex items-center justify-center border border-slate-200 shadow-inner">
              
              {/* Map Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10 shadow-md border border-slate-700/50">
                Groundwater Risk Map
              </div>

              {/* Map Controls Icon (Top Right) */}
              <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-2 rounded-lg shadow-sm z-10 text-white cursor-pointer hover:bg-slate-700 transition text-xs">
                🛰️ Satellite View
              </div>

              {/* Custom Vector Heatmap Layer for Punjab */}
              <svg className="w-full h-full max-h-[300px] p-4 opacity-90" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Punjab Map Outline Shape */}
                <path 
                  d="M 120 80 L 220 50 L 340 90 L 410 160 L 380 280 L 290 350 L 180 320 L 110 240 L 90 150 Z" 
                  fill="#042f2e" 
                  stroke="#14b8a6" 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                />
                
                {/* Heatmap Over-Exploited Zones (Red/Orange Risk Clusters) */}
                <circle cx="260" cy="200" r="75" fill="#ef4444" fillOpacity="0.55" className="animate-pulse" />
                <circle cx="260" cy="200" r="45" fill="#dc2626" fillOpacity="0.75" />
                <circle cx="210" cy="160" r="50" fill="#f97316" fillOpacity="0.5" />
                <circle cx="310" cy="240" r="40" fill="#eab308" fillOpacity="0.4" />
                <circle cx="160" cy="230" r="35" fill="#22c55e" fillOpacity="0.3" />

                {/* District Labels */}
                <text x="245" y="195" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">Ludhiana</text>
                <text x="180" y="140" fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle">Amritsar</text>
                <text x="310" y="220" fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle">Patiala</text>
                <text x="210" y="270" fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle">Bathinda</text>
                <text x="280" y="120" fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle">Jalandhar</text>
              </svg>

              {/* Location Pin Indicator */}
              <div className="absolute top-[50%] left-[52%] -translate-x-1/2 -translate-y-1/2 z-20">
                <span className="bg-slate-900/95 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-2xl border border-rose-500/50 flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  📍 {selectedState} ({selectedDistrict})
                </span>
              </div>

            </div>

            {/* Map Risk Indicator Legend */}
            <div className="flex flex-wrap items-center justify-around gap-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Low</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> Moderate</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> High</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span> Critical</div>
            </div>
          </div>

          {/* Right Metrics Side Cards */}
          <div className="flex flex-col gap-4 justify-between">
            {/* Groundwater Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Groundwater Status</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">88</span>
                <span className="text-lg font-bold text-slate-400">/ 143</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {selectedState} blocks classified as <strong className="text-rose-600">over-exploited</strong>
              </p>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-rose-500 h-full w-[61.5%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1">
                <span>Critical Ratio</span>
                <span className="text-rose-600 font-bold">61.5%</span>
              </div>

              <div className="mt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold uppercase tracking-wide">
                  ⚠️ Over-Exploited
                </span>
              </div>
            </div>

            {/* Risk Score Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Risk Score</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">78</span>
                  <span className="text-lg font-bold text-slate-400">/ 100</span>
                </div>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold">
                  HIGH
                </span>
              </div>

              {/* Radial Donut Progress Indicator */}
              <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-rose-500 border-t-slate-200">
                <span className="text-xs font-black text-slate-800">78%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-700 text-xl font-bold">🏛️</div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Groundwater Extraction</p>
              <p className="text-lg font-extrabold text-slate-900">88 / 143</p>
              <span className="text-[11px] text-rose-600 font-bold">Over-exploited</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700 text-xl font-bold">💧</div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Crop Water Demand</p>
              <p className="text-lg font-extrabold text-slate-900">5.8 mm/day</p>
              <span className="text-[11px] text-amber-600 font-bold">{selectedCrop}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 text-xl font-bold">🛡️</div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Overall Risk Score</p>
              <p className="text-lg font-extrabold text-slate-900">78 / 100</p>
              <span className="text-[11px] text-rose-600 font-bold">High Severity</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Risk Factors & Smart Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Breakdown Bar List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Why is this region at risk?</h3>
              <a href="#calculator" className="text-xs font-bold text-teal-700 hover:underline">How is this calculated?</a>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Groundwater Extraction</span>
                  <span className="text-rose-600">85%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[85%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Crop Water Demand</span>
                  <span className="text-amber-600">72%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[72%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Water Stress Trend</span>
                  <span className="text-amber-500">61%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[61%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="bg-teal-50/50 rounded-2xl border border-teal-100 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-800 font-extrabold text-sm mb-2">
                🌱 Recommendation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Consider lower-water-demand crop alternatives for long-term soil health.
              </p>

              <div className="bg-white rounded-xl p-3 border border-teal-100 mt-4 shadow-2xs">
                <div className="text-sm font-bold text-slate-900">
                  {selectedCrop} → <span className="text-teal-700">Maize</span>
                </div>
                <div className="text-xs text-emerald-600 font-bold mt-1">
                  Estimated water demand: -32%
                </div>
              </div>
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl bg-[#0d343a] hover:bg-[#082228] text-white font-bold text-xs transition-all cursor-pointer">
              View Comparison
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}