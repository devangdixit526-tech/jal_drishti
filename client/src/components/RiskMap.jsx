import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';

/**
 * Choropleth of groundwater risk across Haryana's 22 districts.
 *
 * Everything drawn here comes from GET /api/v1/risk/map. This component holds
 * no data of its own - it previously carried three hardcoded CircleMarkers for
 * Behal, Loharu and Tosham with invented risk levels, which is how a map ends
 * up disagreeing with the dashboard beside it.
 *
 * FOUR risk bands, not three. The old legend here offered HIGH/MEDIUM/LOW
 * while the dashboard's legend declared four; the backend settled it on CGWB's
 * official categorisation, so Low / Moderate / High / Critical it is.
 */

/**
 * Band colours, matched to the legend already rendered in Dashboard.jsx
 * (emerald-400 / amber-400 / orange-400 / red-500).
 *
 * Kept identical on purpose: a map and its legend using different shades of
 * "amber" is the kind of mismatch nobody notices until a presentation.
 */
const BAND_COLORS = {
  Low: '#34d399',
  Moderate: '#fbbf24',
  High: '#fb923c',
  Critical: '#ef4444',
};

const UNSCORED_COLOR = '#64748b';

function styleFor(feature, highlightDistrict) {
  const { riskBand, district } = feature.properties;
  const isHighlighted = Boolean(highlightDistrict) && district === highlightDistrict;

  return {
    fillColor: BAND_COLORS[riskBand] ?? UNSCORED_COLOR,
    fillOpacity: isHighlighted ? 0.9 : 0.65,
    // The selected district gets a white outline rather than a different fill,
    // so highlighting never changes what the colour is telling you.
    color: isHighlighted ? '#ffffff' : '#1e293b',
    weight: isHighlighted ? 3 : 1,
  };
}

function popupHtml(properties) {
  const {
    district,
    riskScore,
    riskBand,
    blocksCriticalOrWorse,
    blockCount,
    blocksWorsened,
    worstCategory,
    irrigationNeedMm,
  } = properties;

  if (riskScore === null || riskScore === undefined) {
    return `<strong>${district}</strong><div style="margin-top:4px">Not scored.</div>`;
  }

  const trendLine =
    blocksWorsened > 0
      ? `<div style="color:#b91c1c"><b>${blocksWorsened}</b> block(s) worsened since 2024</div>`
      : '<div style="color:#047857">No blocks worsened since 2024</div>';

  return `
    <div style="min-width:190px">
      <strong style="font-size:13px">${district}</strong>
      <div style="margin-top:6px"><b>Risk:</b> ${riskScore}/100 (${riskBand})</div>
      <div><b>Blocks Critical or worse:</b> ${blocksCriticalOrWorse}/${blockCount}</div>
      <div><b>Worst category:</b> ${worstCategory ?? 'n/a'}</div>
      <div><b>Irrigation need:</b> ${irrigationNeedMm ?? 'n/a'} mm/season</div>
      ${trendLine}
    </div>
  `;
}

/**
 * @param season            'Kharif' | 'Rabi' | 'Annual' - omit for all crops
 * @param year              sowing year; the API defaults to 2025
 * @param highlightDistrict district NAME (e.g. 'Karnal') to outline
 * @param onSelectDistrict  called with the district name when a polygon is clicked
 */
export default function RiskMap({
  season,
  year,
  highlightDistrict,
  onSelectDistrict,
}) {
  const { data: geojson, loading, error } = useApi(
    (opts) => api.getRiskMap({ season, year }, opts),
    [season, year],
  );

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3 max-w-md">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Could not load the risk map</p>
            <p className="text-xs mt-0.5">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[29.2, 76.3]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {geojson && (
          // react-leaflet's GeoJSON does not re-render when `data` changes, so
          // the key forces a remount whenever the filters do.
          <GeoJSON
            key={`${season ?? 'all'}-${year ?? 'default'}`}
            data={geojson}
            style={(feature) => styleFor(feature, highlightDistrict)}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(popupHtml(feature.properties));
              if (onSelectDistrict) {
                layer.on('click', () =>
                  onSelectDistrict(feature.properties.district),
                );
              }
            }}
          />
        )}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <span className="text-xs font-semibold text-white bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            Loading risk map...
          </span>
        </div>
      )}
    </div>
  );
}
