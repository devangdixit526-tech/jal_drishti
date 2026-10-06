// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// function RiskMap() {
//   return (
//     <MapContainer
//       center={[28.8, 76.0]}
//       zoom={8}
//       style={{ height: '400px', width: '100%' }}
//     >
//       <TileLayer
//         attribution='&copy; OpenStreetMap contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       <Marker position={[28.8, 76.0]}>
//         <Popup>
//           <strong>Bhiwani, Haryana</strong>
//           <br />
//           Groundwater risk data will come from backend.
//         </Popup>
//       </Marker>
//     </MapContainer>
//   );
// }

// export default RiskMap;


import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

function RiskMap() {
  const riskLocations = [
    {
      name: 'Behal',
      position: [28.65, 75.95],
      risk: 'HIGH',
      groundwater: 'Declining',
      crop: 'Paddy',
    },
    {
      name: 'Loharu',
      position: [28.45, 75.80],
      risk: 'MEDIUM',
      groundwater: 'Stable',
      crop: 'Wheat',
    },
    {
      name: 'Tosham',
      position: [28.88, 75.92],
      risk: 'LOW',
      groundwater: 'Stable',
      crop: 'Millets',
    },
  ];

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#ef4444';
    if (risk === 'MEDIUM') return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[28.75, 75.90]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {riskLocations.map((location) => (
          <CircleMarker
            key={location.name}
            center={location.position}
            radius={10}
            pathOptions={{
              color: getRiskColor(location.risk),
              fillColor: getRiskColor(location.risk),
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div>
                <strong>{location.name}</strong>

                <div style={{ marginTop: '6px' }}>
                  <b>Risk:</b> {location.risk}
                </div>

                <div>
                  <b>Crop:</b> {location.crop}
                </div>

                <div>
                  <b>Groundwater:</b> {location.groundwater}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Risk Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 rounded-lg px-3 py-2 shadow-md text-xs">
        <div className="font-semibold mb-2">
          Groundwater Risk
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          High Risk
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          Medium Risk
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          Low Risk
        </div>
      </div>
    </div>
  );
}

export default RiskMap;