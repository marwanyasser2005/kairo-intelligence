import React, { useEffect } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApp } from '../contexts/AppContext';
import type { WarningLevel } from '../services/earlyWarningEngine';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SatelliteMapProps {
  lat: number;
  lng: number;
  city: string;
  accuracyMeters?: number | null;
  riskLevel?: WarningLevel;
}

const MapUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 13));
  }, [lat, lng, map]);

  return null;
};

const riskColors: Record<WarningLevel, string> = {
  low: '#2bd4a7',
  moderate: '#f5b942',
  high: '#fb923c',
  critical: '#fb7185',
};

const SatelliteMap: React.FC<SatelliteMapProps> = ({
  lat,
  lng,
  city,
  accuracyMeters = null,
  riskLevel = 'low',
}) => {
  const { language, theme } = useApp();
  const isLight = theme === 'light';
  const tileUrl = isLight
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const riskColor = riskColors[riskLevel];

  return (
    <div
      className={`relative z-0 h-full min-h-[320px] w-full overflow-hidden rounded-[1.35rem] border ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <MapUpdater lat={lat} lng={lng} />
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {accuracyMeters !== null && (
          <Circle
            center={[lat, lng]}
            radius={Math.max(accuracyMeters, 15)}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.12,
              weight: 1.5,
            }}
          />
        )}

        <Circle
          center={[lat, lng]}
          radius={Math.max(accuracyMeters ?? 80, 80)}
          pathOptions={{
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.06,
            dashArray: '7 8',
            weight: 2,
          }}
        />

        <Marker position={[lat, lng]}>
          <Popup>
            <div className="min-w-44 font-sans text-sm">
              <strong>{language === 'ar' ? 'موقع التقييم' : 'Assessment location'}</strong>
              <div className="mt-1 text-emerald-600">{city}</div>
              <div className="mt-1 text-xs text-slate-500" dir="ltr">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </div>
              {accuracyMeters !== null && (
                <div className="mt-1 text-xs text-slate-500">
                  {language === 'ar'
                    ? `دقة الجهاز: ±${Math.round(accuracyMeters)} متر`
                    : `Device accuracy: ±${Math.round(accuracyMeters)} m`}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      <div
        className={`absolute bottom-4 end-4 z-[1000] rounded-xl border px-3 py-2 text-xs shadow-lg backdrop-blur-md ${
          isLight
            ? 'border-slate-200 bg-white/90 text-slate-700'
            : 'border-white/10 bg-[#08120f]/90 text-slate-200'
        }`}
      >
        <div className="mb-1.5 font-bold">
          {language === 'ar' ? 'طبقات موثقة فقط' : 'Verified layers only'}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-sky-400 bg-sky-400/20" />
          <span>{language === 'ar' ? 'نطاق دقة GPS' : 'GPS accuracy area'}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: riskColor }}
          />
          <span>{language === 'ar' ? 'مستوى مؤشر المخاطر' : 'Risk-index level'}</span>
        </div>
      </div>
    </div>
  );
};

export default SatelliteMap;
