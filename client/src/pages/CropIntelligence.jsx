import React, { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const cropsData = [
  {
    id: 'paddy',
    name: 'Paddy',
    waterDemand: 5.8,
    unit: 'mm/day',
    level: 'HIGH',
    season: 'Kharif',
    groundwaterDependence: 'High',
    waterStressContribution: '72%',
    satelliteConfidence: '98%',
    levelColor: 'bg-red-100 text-red-600 border-red-200',
    image: '/crops/paddy.jpg'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    waterDemand: 4.2,
    unit: 'mm/day',
    level: 'MEDIUM',
    season: 'Rabi',
    groundwaterDependence: 'Medium',
    waterStressContribution: '48%',
    satelliteConfidence: '95%',
    levelColor: 'bg-amber-100 text-amber-600 border-amber-200',
    image: '/crops/wheat.jpg'
  },
  {
    id: 'maize',
    name: 'Maize',
    waterDemand: 3.5,
    unit: 'mm/day',
    level: 'LOW',
    season: 'Kharif',
    groundwaterDependence: 'Low-Medium',
    waterStressContribution: '30%',
    satelliteConfidence: '92%',
    levelColor: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    image: '/crops/maize.jpg'
  },
  {
    id: 'millets',
    name: 'Millets',
    waterDemand: 2.8,
    unit: 'mm/day',
    level: 'LOW',
    season: 'Kharif',
    groundwaterDependence: 'Low',
    waterStressContribution: '18%',
    satelliteConfidence: '94%',
    levelColor: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    image: '/crops/millets.jpg'
  }
];

export default function CropIntelligence() {
  const [selectedState, setSelectedState] = useState('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState('Ludhiana');
  const [selectedCrop, setSelectedCrop] = useState(cropsData[0]);

  const maxWaterDemand = Math.max(...cropsData.map(c => c.waterDemand));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Crop Intelligence</h1>
        <p className="text-slate-500 text-sm mt-1">
          Compare crops, understand water demand and make informed choices.
        </p>
      </div>

      {/* Filter & Action Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* State Select */}
          <div className="flex-1 md:w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* District Select */}
          <div className="flex-1 md:w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Ludhiana">Ludhiana</option>
                <option value="Amritsar">Amritsar</option>
                <option value="Jalandhar">Jalandhar</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <button className="w-full md:w-auto bg-[#005f60] hover:bg-[#004b4c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm self-end">
          Compare Crops
        </button>
      </div>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cropsData.map((crop) => {
          const isSelected = selectedCrop.id === crop.id;
          return (
            <div
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className={`bg-white rounded-2xl p-3 border cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-teal-600 border-transparent shadow-md'
                  : 'border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="h-28 rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if local image filename case sensitivity differs
                    e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              </div>
              <h3 className="font-bold text-slate-800 text-base">{crop.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-slate-800">{crop.waterDemand}</span>
                <span className="text-xs text-slate-500 font-medium">{crop.unit}</span>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${crop.levelColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {crop.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Selected Crop Detail */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <img
              src={selectedCrop.image}
              alt={selectedCrop.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-slate-100"
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedCrop.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                  {selectedCrop.season}
                </span>
                <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {selectedCrop.level} Water Demand
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Water Demand</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {selectedCrop.waterDemand} <span className="text-teal-600 text-base font-semibold">{selectedCrop.unit}</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Groundwater Dependence</p>
              <p className="text-base font-bold text-slate-700 mt-0.5">{selectedCrop.groundwaterDependence}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Water Stress Contribution</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedCrop.waterStressContribution}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Satellite Classification</p>
              <p className="text-base font-bold text-slate-700 mt-0.5">{selectedCrop.satelliteConfidence} confidence</p>
            </div>
          </div>
        </div>

        {/* Right Card: Crop Comparison Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-6">Crop Comparison</h3>
            
            <div className="space-y-5">
              {cropsData.map((crop) => {
                const percentage = (crop.waterDemand / maxWaterDemand) * 100;
                let barColor = 'bg-teal-600';
                if (crop.level === 'MEDIUM') barColor = 'bg-amber-500';
                if (crop.level === 'LOW') barColor = 'bg-emerald-500';

                return (
                  <div key={crop.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>{crop.name}</span>
                      <span className="text-slate-500 font-medium">{crop.waterDemand}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-6">
            Water demand (mm/day)
          </p>
        </div>
      </div>
    </div>
  );
}