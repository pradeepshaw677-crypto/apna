import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Navigation, 
  Zap, 
  Phone,
  Compass,
  ArrowRight
} from 'lucide-react';
import L from 'leaflet';

interface DeliveryRadiusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORE_COORDS: [number, number] = [22.2828, 86.7196]; // Baharagora Dadu Complex
const RADIUS_METERS = 7000; // 7 km radius

const BAHARAGORA_AREAS = [
  { name: 'Dadu Complex & Main Market', coords: [22.2828, 86.7196] as [number, number], distance: '0.1 km', time: '3 Mins', eligible: true },
  { name: 'Near Shitla Mandir', coords: [22.2835, 86.7188] as [number, number], distance: '0.3 km', time: '5 Mins', eligible: true },
  { name: 'Town High School Road', coords: [22.2870, 86.7230] as [number, number], distance: '0.8 km', time: '7 Mins', eligible: true },
  { name: 'Baharagora College Campus', coords: [22.2910, 86.7280] as [number, number], distance: '1.4 km', time: '9 Mins', eligible: true },
  { name: 'Sakha Maidan & Sub-div Hospital', coords: [22.2940, 86.7120] as [number, number], distance: '1.8 km', time: '10 Mins', eligible: true },
  { name: 'Matihanna Chowk', coords: [22.3020, 86.7410] as [number, number], distance: '3.2 km', time: '12 Mins', eligible: true },
  { name: 'Khandamouda Village', coords: [22.3150, 86.7550] as [number, number], distance: '4.5 km', time: '14 Mins', eligible: true },
  { name: 'Barasol Junction', coords: [22.2450, 86.7320] as [number, number], distance: '5.2 km', time: '15 Mins', eligible: true },
  { name: 'Gamharia Border Village', coords: [22.3200, 86.6850] as [number, number], distance: '6.4 km', time: '15 Mins', eligible: true },
  { name: 'Jamshedpur Tatanagar (Outer)', coords: [22.8046, 86.2029] as [number, number], distance: '78 km', time: 'Not Available', eligible: false },
];

export const DeliveryRadiusModal: React.FC<DeliveryRadiusModalProps> = ({ isOpen, onClose }) => {
  const [searchArea, setSearchArea] = useState('');
  const [selectedArea, setSelectedArea] = useState(BAHARAGORA_AREAS[0]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize Leaflet map with a slight delay so modal DOM is fully rendered
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // If map already exists, remove it
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: STORE_COORDS,
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Free OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Store central pin
      const storeIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="background-color: #fbbf24; border: 3px solid #0f172a; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); color: #0f172a;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const storeMarker = L.marker(STORE_COORDS, { icon: storeIcon }).addTo(map);
      storeMarker.bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; padding: 4px;">
          <b style="font-size: 13px; color: #064e3b;">The Grocery Hub</b><br/>
          <span style="font-size: 11px; color: #475569;">Central Store: Dadu Complex, Near Shitla Mandir, Baharagora</span><br/>
          <span style="color: #059669; font-size: 11px; font-weight: bold;">15-Min Express Delivery Hub</span>
        </div>
      `).openPopup();

      // 7-Km Radius circle in Emerald
      const circle = L.circle(STORE_COORDS, {
        radius: RADIUS_METERS,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      circleRef.current = circle;

      // Invalidate size after rendering in dialog
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update selected area marker on map
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedArea) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
    }

    const pinColor = selectedArea.eligible ? '#10b981' : '#ef4444';
    const pinIcon = L.divIcon({
      className: 'custom-area-pin',
      html: `
        <div style="background-color: ${pinColor}; border: 2px solid white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const marker = L.marker(selectedArea.coords, { icon: pinIcon }).addTo(mapInstanceRef.current);
    selectedMarkerRef.current = marker;

    marker.bindPopup(`
      <div style="font-family: 'Outfit', sans-serif; padding: 4px;">
        <b style="font-size: 12px;">${selectedArea.name}</b><br/>
        <span style="font-size: 11px; color: #475569;">Distance: ${selectedArea.distance}</span><br/>
        <span style="font-size: 11px; font-weight: 800; color: ${selectedArea.eligible ? '#059669' : '#dc2626'};">
          ${selectedArea.eligible ? 'Inside 7-km 15-Min Delivery Zone' : 'Outside 7-km Delivery Zone'}
        </span>
      </div>
    `).openPopup();

    mapInstanceRef.current.panTo(selectedArea.coords, { animate: true });
  }, [selectedArea]);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;

        // Calculate Haversine distance to central store in km
        const R = 6371; // km
        const dLat = ((latitude - STORE_COORDS[0]) * Math.PI) / 180;
        const dLon = ((longitude - STORE_COORDS[1]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((STORE_COORDS[0] * Math.PI) / 180) *
            Math.cos((latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = R * c;

        const isEligible = distKm <= 7.0;
        const gpsArea = {
          name: 'Your Current Location (GPS)',
          coords: [latitude, longitude] as [number, number],
          distance: `${distKm.toFixed(1)} km`,
          time: isEligible ? `${Math.round(8 + distKm * 1.2)} Mins` : 'N/A',
          eligible: isEligible,
        };

        setSelectedArea(gpsArea);
        setGpsStatus(
          isEligible
            ? `Great news! You are ${distKm.toFixed(1)} km from our store and eligible for 15-min delivery!`
            : `Notice: You are ${distKm.toFixed(1)} km away, which is outside our standard 7-km instant radius.`
        );
      },
      (err) => {
        setGpsLoading(false);
        setGpsStatus('Could not detect location. Please select an area from the list below.');
      },
      { timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  const filteredAreas = searchArea.trim()
    ? BAHARAGORA_AREAS.filter((a) =>
        a.name.toLowerCase().includes(searchArea.toLowerCase())
      )
    : BAHARAGORA_AREAS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl shadow-xs">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Outfit'] flex items-center gap-2">
                <span>7-Km Delivery Zone Map</span>
                <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full font-black border border-emerald-500/40">
                  15 MINS
                </span>
              </h3>
              <p className="text-xs text-emerald-100 font-semibold">
                Central Store: Dadu Complex, Near Shitla Mandir, Baharagora (832101)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Interactive Leaflet Map Container */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Live Coverage Map (Baharagora Central)
              </span>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Green Circle = 7km Free Delivery Zone
              </span>
            </div>
            <div
              ref={mapContainerRef}
              className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner z-0"
              style={{ minHeight: '220px' }}
            />
          </div>

          {/* GPS Auto-detect Button */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-300/30 transition-all cursor-pointer active:scale-98"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>{gpsLoading ? 'Detecting your GPS...' : 'Check My Current GPS Location'}</span>
            </button>

            <a
              href="tel:6207462800"
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Helpline: 6207462800</span>
            </a>
          </div>

          {gpsStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                selectedArea.eligible
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {gpsStatus}
            </div>
          )}

          {/* Selected Area Status Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Selected Area:
                </span>
                <span className="text-sm font-black text-slate-900">
                  {selectedArea.name}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 font-semibold">
                <span>Distance: <b className="text-slate-900">{selectedArea.distance}</b></span>
                <span>•</span>
                <span>Delivery: <b className="text-slate-900">{selectedArea.time}</b></span>
              </div>
            </div>

            <div>
              {selectedArea.eligible ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>15-Min Delivery Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 font-black text-xs border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Outside 7km Radius</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Area Search & List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Or pick an area in Baharagora to check coverage:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Search area (e.g., Dadu Complex, Shitla Mandir, Barasol, High School)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-400 outline-none transition-all"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 pt-1 pr-1">
              {filteredAreas.map((area, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer text-xs ${
                    selectedArea.name === area.name
                      ? 'bg-amber-100/70 border border-amber-300 font-black text-slate-950'
                      : 'bg-white hover:bg-slate-50 border border-slate-100 font-semibold text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`w-3.5 h-3.5 ${
                        area.eligible ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{area.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 font-bold">{area.distance}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                        area.eligible
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {area.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">
            Fast delivery dispatched from Baharagora hub within 3 minutes of order placement.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
