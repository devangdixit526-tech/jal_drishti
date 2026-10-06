import React from 'react';
import { AlertTriangle, Droplets, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';

export default function Insights({ setCurrentPage }) {
  const cards = [
    {
      id: 1,
      icon: AlertTriangle,
      iconBg: 'bg-red-100 text-red-600',
      title: 'Groundwater extraction is high',
      titleColor: 'text-red-600',
      description:
        'The selected region has a high groundwater extraction ratio compared with the available resource.',
      actionText: 'View details',
      targetPage: 'dashboard',
    },
    {
      id: 2,
      icon: Droplets,
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'Paddy has high water demand',
      titleColor: 'text-amber-600',
      description: 'Current crop water demand: 5.8 mm/day',
      actionText: 'View comparison',
      targetPage: 'crop-intelligence',
    },
    {
      id: 3,
      icon: TrendingUp,
      iconBg: 'bg-sky-100 text-sky-600',
      title: 'Risk is increasing',
      titleColor: 'text-sky-600',
      description:
        'Groundwater stress has increased over the selected time period.',
      actionText: 'View dashboard metrics',
      targetPage: 'dashboard',
    },
    {
      id: 4,
      icon: Lightbulb,
      iconBg: 'bg-emerald-100 text-emerald-600',
      title: 'Explore lower-water-demand crops',
      titleColor: 'text-emerald-700',
      description:
        'Consider maize, millets or wheat as alternative options.',
      actionText: 'View crop intelligence',
      targetPage: 'crop-intelligence',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Insights for Ludhiana
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Key findings and actionable suggestions based on latest data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconBg}`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                <div>
                  <h3 className={`text-base font-bold ${card.titleColor} leading-tight mb-2`}>
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentPage && setCurrentPage(card.targetPage)}
                className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                <span>{card.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}