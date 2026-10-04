import React from 'react';
import { Check, Database, Droplets, Satellite, CloudSun } from 'lucide-react';

export default function About() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: About & Key Features */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">About JalDrishti</h1>
            <p className="text-slate-600 leading-relaxed text-sm">
              JalDrishti is a data-driven platform that combines groundwater data,
              crop water demand, and satellite imagery to help farmers, policymakers,
              and researchers make informed decisions for sustainable agriculture.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-800">Key Features</h2>
            <ul className="space-y-2.5">
              {[
                'Groundwater extraction analysis',
                'Crop water demand (FAO-56)',
                'Satellite-based crop classification',
                'Risk scoring with transparent methodology',
                'Trends and actionable insights',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Data Sources Card */}
        <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-800">Data Sources</h2>

          <div className="space-y-4">
            {/* Groundwater Data */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-teal-100/70 text-teal-700 rounded-xl shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Groundwater Data</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  CGWB (Central Ground Water Board)
                </p>
              </div>
            </div>

            {/* Crop Water Demand */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-teal-100/70 text-teal-700 rounded-xl shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Crop Water Demand</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  FAO-56 (Food and Agriculture Organization)
                </p>
              </div>
            </div>

            {/* Satellite Imagery */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-teal-100/70 text-teal-700 rounded-xl shrink-0">
                <Satellite className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Satellite Imagery</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Sentinel-2 (ESA)
                </p>
              </div>
            </div>

            {/* Weather & Climate */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-teal-100/70 text-teal-700 rounded-xl shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Weather & Climate</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  IMD (India Meteorological Department)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Divider */}
      <div className="pt-12 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-800">JalDrishti</span>
          <span>|</span>
          <span>Building a water-secure tomorrow</span>
        </div>
        <span className="font-medium text-slate-400">Version 1.0</span>
      </div>
    </div>
  );
}