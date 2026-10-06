import React from 'react';
import { LayoutDashboard, Calculator, Shield, BarChart3, Award } from 'lucide-react';

export default function Hero({ onExplore, setCurrentPage, onOpenCalculator }) {
  const features = [
    { title: 'Better Decisions', subtitle: 'for Sustainable Agriculture', icon: Shield },
    { title: 'Satellite + Ground Data', subtitle: 'for Real Insights', icon: BarChart3 },
    { title: 'Higher Yields', subtitle: 'with Less Water', icon: Award },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 min-h-[calc(100vh-65px)] flex flex-col justify-between">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.avif"
          alt="Agriculture and water management"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-12 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Know Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
              Groundwater.
            </span> <br />
            Grow Smarter.
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
  Combine crop information, water demand and groundwater trends to identify agricultural water-stress hotspots.
</p>

          

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onExplore || (() => setCurrentPage && setCurrentPage('dashboard'))}
              className="flex items-center gap-2.5 bg-[#0A2E30] hover:bg-[#0f3d40] text-teal-300 border border-teal-500/30 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-lg hover:shadow-teal-900/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Explore Dashboard</span>
            </button>

            {/* Triggers Modal */}
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-2.5 bg-white/90 hover:bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md border border-slate-200"
            >
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>Check Water Risk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Feature Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, idx) => {
            const IconComp = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-md border border-white/40 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
              >
                <div className="p-3 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-slate-500">{feature.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}