import React from 'react';
import { CheckCircle2, ShieldCheck, Target, Zap, Layers } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Target,
      title: 'Data-Driven Insights',
      desc: 'Combining groundwater analytics with crop demand metrics for precision agriculture.',
    },
    {
      icon: ShieldCheck,
      title: 'Resource Sustainability',
      desc: 'Helping mitigate over-extraction risks in critical and over-exploited zones.',
    },
    {
      icon: Zap,
      title: 'Actionable Guidance',
      desc: 'Providing clear recommendations for low-water-demand alternative crops.',
    },
    {
      icon: Layers,
      title: 'Scalable Architecture',
      desc: 'Designed for multi-region expansion across agricultural belts.',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Platform Mission & Features */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">About JalDrishti</h1>
            <p className="text-slate-600 mt-3 text-base leading-relaxed">
              JalDrishti is an intelligent water risk management platform designed to help farmers, researchers, and policymakers monitor groundwater stress and optimize crop selection for sustainable agriculture.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-slate-900">Key Features</h2>
            <ul className="space-y-3">
              {[
                'Groundwater extraction & stress level analysis',
                'Crop-specific water demand evaluation',
                'Transparent risk scoring methodology',
                'Actionable crop intelligence & recommendations',
                'Interactive regional dashboard visualization',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Platform Pillars (Replaced Data Sources) */}
        <div className="lg:col-span-5 bg-slate-100/80 border border-slate-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform Pillars</h2>
            <p className="text-xs text-slate-500 mt-0.5">Core principles behind the JalDrishti architecture</p>
          </div>

          <div className="space-y-4">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{pillar.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
        <p><span className="font-semibold text-slate-600">JalDrishti</span> | Building a water-secure tomorrow</p>
        <p>Version 1.0</p>
      </div>
    </div>
  );
}