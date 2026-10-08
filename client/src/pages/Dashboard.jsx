import 'leaflet/dist/leaflet.css';
import RiskMap from '../components/RiskMap';
import React, { useState } from 'react';
import { ChevronDown, Bell, AlertTriangle, Droplets, ShieldAlert, Leaf, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';

export default function Dashboard({ setCurrentPage }) {
  // Selections hold IDs ('HR', 'PB-LDH', 'paddy') rather than display labels
  // ('Haryana', 'Bhiwani', 'Paddy') - IDs are what the API understands.
  const [selectedStateId, setSelectedStateId] = useState('HR');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('paddy');

  // --- live reference data from the backend ----------------------------
  const statesReq = useApi((opts) => api.listStates(opts), []);
  const districtsReq = useApi(
    (opts) => api.listDistricts(selectedStateId, opts),
    [selectedStateId],
    { skip: !selectedStateId },
  );
  const cropsReq = useApi((opts) => api.listCrops(undefined, opts), []);

  const states = statesReq.data ?? [];
  const districts = districtsReq.data ?? [];
  const crops = cropsReq.data ?? [];

  // Changing the state swaps the district list underneath us, so the stored
  // selection may no longer exist in it.
  //
  // This is DERIVED rather than synced with an effect: an effect that calls
  // setState here would render once with an invalid selection, then again to
  // correct it. Computing it inline is always consistent and never flickers.
  const effectiveDistrictId = districts.some((d) => d.id === selectedDistrictId)
    ? selectedDistrictId
    : (districts[0]?.id ?? '');

  // The map and the demand endpoints key on district NAME, not id.
  const selectedDistrict = districts.find((d) => d.id === effectiveDistrictId);

  const apiError = statesReq.error ?? districtsReq.error ?? cropsReq.error;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            HELLO! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Understand the water story behind every crop.
          </p>
        </div>

        {/* User Badge & Notifications */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 pl-2 pr-4 py-1.5 rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#005f60] text-white flex items-center justify-center font-bold text-sm">
              D
            </div>
            {/* <span className="text-sm font-semibold text-slate-700">Devang</span> */}
          </div>
        </div>
      </div>

      {/* API error banner - shown only when the backend is unreachable or errored */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Could not load region data</p>
            <p className="text-xs mt-0.5">{apiError.message}</p>
            <p className="text-xs mt-1 text-red-500">
              Start the backend with <code className="font-mono">npm run dev</code> inside the{' '}
              <code className="font-mono">server/</code> folder.
            </p>
          </div>
        </div>
      )}

      {/* Region Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto flex-1 max-w-3xl">
          {/* State Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
            <div className="relative">
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                disabled={statesReq.loading}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
              >
                {statesReq.loading && <option>Loading...</option>}
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* District Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
            <div className="relative">
              <select
                value={effectiveDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                disabled={districtsReq.loading || districts.length === 0}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
              >
                {districtsReq.loading && <option>Loading...</option>}
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Crop Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Crop</label>
            <div className="relative">
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                disabled={cropsReq.loading}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
              >
                {cropsReq.loading && <option>Loading...</option>}
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <button className="w-full md:w-auto bg-[#005f60] hover:bg-[#004b4c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm self-end">
          Analyze Region
        </button>
      </div>

      {/* Map & Groundwater Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Groundwater Map Visualization */}
        <div className="lg:col-span-8 bg-[#0b1928] rounded-2xl p-5 relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="flex justify-between items-center z-10">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700">
              Groundwater Risk Map
            </span>
            <button className="bg-slate-800/80 backdrop-blur-md text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700">
              📡 Satellite View
            </button>
          </div>

          {/* Leaflet Map */}
          <div className="absolute inset-0 pt-14">
            {/* RiskMap matches on district NAME, which is what the GeoJSON
                carries; the selects hold ids like 'HR-KNL'. Clicking a
                polygon selects that district, so map and dropdown stay in
                step in both directions. */}
            <RiskMap
              highlightDistrict={selectedDistrict?.name}
              onSelectDistrict={(name) => {
                const match = districts.find((d) => d.name === name);
                if (match) setSelectedDistrictId(match.id);
              }}
            />
          </div>
          {/* Map Legend */}
          <div className="flex items-center justify-center gap-6 z-10 bg-slate-900/60 backdrop-blur-md py-2 px-4 rounded-xl border border-slate-800 self-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Low
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> High
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical
            </div>
          </div>
        </div>

        {/* Right Status Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Groundwater Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Groundwater Status</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">88</span>
              <span className="text-slate-400 font-medium">/ 143</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Punjab blocks classified as <span className="text-red-600 font-bold">over-exploited</span>.
            </p>

            <div className="space-y-1">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full w-[61.5%]" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
                <span>Critical Ratio</span>
                <span className="text-red-600 font-bold">61.5%</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                OVER-EXPLOITED
              </span>
            </div>
          </div>

          {/* Risk Score Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Risk Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-800">78</span>
                <span className="text-slate-400 text-sm font-medium">/ 100</span>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                HIGH
              </span>
            </div>

            {/* Gauge Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800">78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Groundwater Extraction</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">88</span>
              <span className="text-slate-400 text-sm font-medium">/ 143</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              • Over-exploited
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Crop Water Demand</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">5.8</span>
              <span className="text-slate-500 text-xs font-semibold">mm/day</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              • Paddy
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Risk Score</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-800">78</span>
              <span className="text-slate-400 text-sm font-medium">/ 100</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              • High
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Why is this region at risk? */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Why is this region at risk?</h2>
            <button className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              How is this calculated?
            </button>
          </div>

          <div className="space-y-4">
            {/* Row 1 */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Groundwater Extraction</span>
                <span className="font-bold text-slate-800">85%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-[85%]" />
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Crop Water Demand</span>
                <span className="font-bold text-slate-800">72%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-[72%]" />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Water Stress Trend</span>
                <span className="font-bold text-slate-800">61%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-[61%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="lg:col-span-4 bg-teal-50/50 border border-teal-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm mb-2">
              <Leaf className="w-4 h-4 text-teal-600" />
              Recommendation
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consider lower-water-demand crop alternatives.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span>Paddy</span>
              <ArrowRight className="w-4 h-4 text-teal-600" />
              <span>Maize</span>
            </div>
            <p className="text-xs text-teal-700 font-medium">
              Estimated water demand: <span className="font-bold text-teal-800">-32%</span>
            </p>
          </div>

          <button
            onClick={() => setCurrentPage && setCurrentPage('crop-intelligence')}
            className="w-full bg-[#005f60] hover:bg-[#004b4c] text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs text-center"
          >
            View Comparison
          </button>
        </div>
      </div>
    </div>
  );
}