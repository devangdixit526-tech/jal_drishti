import { useState } from 'react';
import { ChevronDown, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';

/**
 * Crop water demand, computed per district.
 *
 * This page previously held its own `cropsData` array - four crops with
 * invented mm/day figures, a `waterStressContribution` percentage and a
 * `satelliteConfidence` of "98%". Two problems with that:
 *
 *  1. Its wheat figure (4.2) disagreed with WaterRiskModal.jsx (3.4). Two
 *     copies of the same data in one app will always drift apart.
 *  2. Satellite confidence was fiction. Sentinel-2 crop classification is not
 *     implemented, so there is no confidence to report. A made-up accuracy
 *     figure is the most dangerous kind of placeholder, because it is the one
 *     a reader is least able to check.
 *
 * Both are gone. Every number here now comes from /water-demand, computed from
 * the selected district's own weather via FAO-56.
 */

const SEASONS = ['Kharif', 'Rabi', 'Annual'];

/**
 * Demand bands derived from the computed irrigation need, not stored on the
 * crop. A crop is not "HIGH demand" in the abstract - paddy in a wet district
 * needs less irrigation than cotton in a dry one, and the whole point of
 * computing per district is that the answer moves.
 */
function demandBand(irrigationNeedMm) {
  if (irrigationNeedMm === null || irrigationNeedMm === undefined) return null;
  if (irrigationNeedMm >= 500) return { label: 'HIGH', css: 'bg-red-100 text-red-600 border-red-200', bar: 'bg-red-500' };
  if (irrigationNeedMm >= 300) return { label: 'MEDIUM', css: 'bg-amber-100 text-amber-600 border-amber-200', bar: 'bg-amber-500' };
  return { label: 'LOW', css: 'bg-emerald-100 text-emerald-600 border-emerald-200', bar: 'bg-emerald-500' };
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400';

export default function CropIntelligence() {
  const [selectedStateId, setSelectedStateId] = useState('HR');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [selectedCropId, setSelectedCropId] = useState(null);

  const statesReq = useApi((opts) => api.listStates(opts), []);
  const districtsReq = useApi(
    (opts) => api.listDistricts(selectedStateId, opts),
    [selectedStateId],
    { skip: !selectedStateId },
  );
  const cropsReq = useApi((opts) => api.listCrops(season, opts), [season]);

  const states = statesReq.data ?? [];
  const districts = districtsReq.data ?? [];
  const crops = cropsReq.data ?? [];

  // Derived, not synced via an effect - see Dashboard.jsx for why.
  const effectiveDistrictId = districts.some((d) => d.id === selectedDistrictId)
    ? selectedDistrictId
    : (districts[0]?.id ?? '');
  const districtName = districts.find((d) => d.id === effectiveDistrictId)?.name;

  const isHaryana = selectedStateId === 'HR';
  const canAnalyse = isHaryana && Boolean(districtName);

  const compareReq = useApi(
    (opts) => api.compareWaterDemand({ district: districtName, season }, opts),
    [districtName, season],
    { skip: !canAnalyse },
  );
  const comparison = compareReq.data;
  const items = comparison?.items ?? [];

  // Default the selection to the season's thirstiest crop - the one worth
  // looking at - but only if the current selection is not in this season.
  const effectiveCropId = items.some((i) => i.cropId === selectedCropId)
    ? selectedCropId
    : (comparison?.thirstiestCropId ?? crops[0]?.id ?? null);

  const detailReq = useApi(
    (opts) =>
      api.getWaterDemand({ district: districtName, crop: effectiveCropId }, opts),
    [districtName, effectiveCropId],
    { skip: !canAnalyse || !effectiveCropId },
  );
  const detail = detailReq.data;

  const selectedCropMeta = crops.find((c) => c.id === effectiveCropId);
  const selectedItem = items.find((i) => i.cropId === effectiveCropId);
  const maxNeed = items.length > 0 ? Math.max(...items.map((i) => i.irrigationNeedMm)) : 0;

  const regionError = statesReq.error ?? districtsReq.error ?? cropsReq.error;
  const analysisError = compareReq.error ?? detailReq.error;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Crop Intelligence</h1>
        <p className="text-slate-500 text-sm mt-1">
          Compare crops, understand water demand and make informed choices.
        </p>
      </div>

      {regionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Could not load region data</p>
            <p className="text-xs mt-0.5">{regionError.message}</p>
            <p className="text-xs mt-1 text-red-500">
              Start the backend with <code className="font-mono">npm run dev</code> inside the{' '}
              <code className="font-mono">server/</code> folder.
            </p>
          </div>
        </div>
      )}

      {!isHaryana && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Water demand is computed for Haryana only</p>
            <p className="text-xs mt-0.5">
              Daily weather was collected for Haryana&apos;s 22 districts. Switch the state to
              Haryana to compute demand.
            </p>
          </div>
        </div>
      )}

      {analysisError && isHaryana && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Could not compute water demand</p>
            <p className="text-xs mt-0.5">{analysisError.message}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
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
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

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
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Season</label>
            <div className="relative">
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Crop cards - figures are this district's computed irrigation need */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {crops.map((crop) => {
          const item = items.find((i) => i.cropId === crop.id);
          const band = demandBand(item?.irrigationNeedMm);
          const isSelected = effectiveCropId === crop.id;

          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => setSelectedCropId(crop.id)}
              className={`text-left bg-white rounded-2xl p-3 border transition-all ${
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
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
              </div>
              <h3 className="font-bold text-slate-800 text-base">{crop.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-slate-800">
                  {item ? item.irrigationNeedMm : '—'}
                </span>
                <span className="text-xs text-slate-500 font-medium">mm/season</span>
              </div>
              <div className="mt-3">
                {band ? (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${band.css}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {band.label}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {compareReq.loading ? 'Computing...' : 'No data'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected crop detail */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <img
              src={selectedCropMeta?.image}
              alt={selectedCropMeta?.name ?? ''}
              className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-slate-100"
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedCropMeta?.name ?? '—'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                  {selectedCropMeta?.season ?? season}
                </span>
                {demandBand(selectedItem?.irrigationNeedMm) && (
                  <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {demandBand(selectedItem.irrigationNeedMm).label} Water Demand
                  </span>
                )}
                {districtName && (
                  <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                    {districtName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Irrigation Need</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {detail ? detail.totals.irrigationNeedMm : '—'}
                <span className="text-teal-600 text-sm font-semibold"> mm/season</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Crop Water Requirement</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {detail ? detail.totals.cropWaterRequirementMm : '—'}
                <span className="text-slate-500 text-sm font-semibold"> mm</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Average Demand</p>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                {detail ? `${detail.averages.etcMmPerDay} mm/day` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Peak Demand</p>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                {detail ? `${detail.peakDemand.etcMmPerDay} mm/day` : '—'}
                {detail && (
                  <span className="block text-[11px] font-normal text-slate-400">
                    {detail.peakDemand.date} ({detail.peakDemand.stage} stage)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Rainfall Covers</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {detail ? `${detail.totals.rainfallMetPct}%` : '—'}
                {detail && (
                  <span className="block text-[11px] font-normal text-slate-400">
                    {detail.totals.effectiveRainfallMm} of {detail.totals.cropWaterRequirementMm} mm
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Season</p>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                {detail ? `${detail.season.plannedDays} days` : '—'}
                {detail && (
                  <span className="block text-[11px] font-normal text-slate-400">
                    sown {detail.season.sowingDate}
                  </span>
                )}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 font-medium">Groundwater Dependence</p>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                {selectedCropMeta?.groundwaterDependence ?? '—'}
                <span className="text-[11px] font-normal text-slate-400"> (reference value)</span>
              </p>
            </div>
          </div>

          {detail && (
            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3 flex gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {detail.method}, using this district&apos;s daily weather. Paddy figures
                exclude percolation and seepage from puddled fields, so real field water use
                is higher.
              </span>
            </p>
          )}
        </div>

        {/* Comparison chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Crop Comparison</h3>
            <p className="text-xs text-slate-400 mb-6">
              {districtName ? `${districtName}, ${season}` : season} — least thirsty first
            </p>

            <div className="space-y-5">
              {items.length === 0 && (
                <p className="text-xs text-slate-400">
                  {compareReq.loading ? 'Computing...' : 'No comparison available.'}
                </p>
              )}

              {items.map((item) => {
                const band = demandBand(item.irrigationNeedMm);
                const percentage = maxNeed > 0 ? (item.irrigationNeedMm / maxNeed) * 100 : 0;

                return (
                  <button
                    key={item.cropId}
                    type="button"
                    onClick={() => setSelectedCropId(item.cropId)}
                    className="w-full text-left space-y-1.5 group"
                  >
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span className={effectiveCropId === item.cropId ? 'text-teal-700' : ''}>
                        {item.name}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {item.irrigationNeedMm} mm
                        {item.savingVsThirstiestPct > 0 && (
                          <span className="text-emerald-600 font-bold">
                            {' '}−{item.savingVsThirstiestPct}%
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${band?.bar ?? 'bg-slate-300'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-6">
            Irrigation need over the whole season (mm), computed per district.
            {comparison?.skipped?.length > 0 && (
              <span className="block mt-1 text-slate-400">
                {comparison.skipped.length} crop(s) skipped: season falls outside the
                available weather window.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
