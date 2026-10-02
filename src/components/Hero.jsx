export default function Hero({ onExplore }) {
  const features = [
    {
      title: "Better Decisions",
      subtitle: "for Sustainable Agriculture",
      icon: (
        <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "Satellite + Ground Data",
      subtitle: "for Real Insights",
      icon: (
        <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Higher Yields",
      subtitle: "with Less Water",
      icon: (
        <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative w-full overflow-hidden min-h-[85vh] flex flex-col justify-between pt-8 pb-12">
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.avif" 
          alt="Agriculture and water management background" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-12">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Know Your <br />
            Groundwater. <br />
            <span className="text-[#0d343a]">Grow Smarter.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
            Satellite-derived crop information + groundwater data + crop water demand in one decision layer.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={onExplore}
              className="px-6 py-3 rounded-full bg-[#0d343a] hover:bg-[#082228] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-teal-950/20 active:scale-95 cursor-pointer"
            >
              Explore Dashboard
            </button>
            <button className="px-6 py-3 rounded-full border-2 border-teal-800/40 bg-white/60 backdrop-blur-xs text-[#0d343a] hover:bg-teal-50 font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer">
              View How It Works
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200/80 pt-6">
          {features.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
            >
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-100 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}