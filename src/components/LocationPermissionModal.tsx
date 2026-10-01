import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Search,
  Check,
  Building,
  Home
} from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onConfirmPincode: (pin: string, city: string, isJharkhand: boolean) => void;
}

// Baharagora Central Hub Coordinates (Dadu Complex / Shitla Mandir)
const BAHARAGORA_HUB: [number, number] = [22.2815, 86.7198];
const EXPRESS_RADIUS_KM = 10;

// Localities & Landmarks for Instant Autocomplete
const POPULAR_LOCALITIES = [
  { name: 'Dadu Complex, Main Market', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2828, 86.7196] as [number, number] },
  { name: 'Near Shitla Mandir', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2835, 86.7188] as [number, number] },
  { name: 'Town High School Road', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2870, 86.7230] as [number, number] },
  { name: 'Baharagora College Campus', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2910, 86.7280] as [number, number] },
  { name: 'Sakha Maidan & Sub-div Hospital', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2940, 86.7120] as [number, number] },
  { name: 'Matihanna Chowk', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.3020, 86.7410] as [number, number] },
  { name: 'Khandamouda Village Road', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.3150, 86.7550] as [number, number] },
  { name: 'Barasol Junction', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2450, 86.7320] as [number, number] },
  { name: 'Gamharia Border Village', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.3200, 86.6850] as [number, number] },
  { name: 'Jamshedpur Tatanagar (Direct Hub)', city: 'Jamshedpur', state: 'Jharkhand', pincode: '831001', coords: [22.8046, 86.2029] as [number, number] },
  { name: 'Ranchi Main Road', city: 'Ranchi', state: 'Jharkhand', pincode: '834001', coords: [23.3441, 85.3096] as [number, number] },
  { name: 'Kharagpur Station Road', city: 'Kharagpur', state: 'West Bengal', pincode: '721301', coords: [22.3361, 87.3247] as [number, number] },
  { name: 'Baripada Town Center', city: 'Baripada', state: 'Odisha', pincode: '757001', coords: [21.9322, 86.7584] as [number, number] },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  currentPincode,
  onConfirmPincode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([22.2828, 86.7196]);
  const [distanceKm, setDistanceKm] = useState<number>(0.9);
  const [isInside10Km, setIsInside10Km] = useState<boolean>(true);
  const [detectedAddress, setDetectedAddress] = useState<string>('Dadu Complex, Near Shitla Mandir, Baharagora (832101)');
  const [activePincode, setActivePincode] = useState<string>('832101');
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filter search results
  const filteredSuggestions = searchQuery.trim()
    ? POPULAR_LOCALITIES.filter(
        loc =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.pincode.includes(searchQuery)
      )
    : POPULAR_LOCALITIES.slice(0, 4);

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: selectedCoords,
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 250);

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // 1. Apna Bazar Central Hub Marker
      const hubIcon = L.divIcon({
        className: 'hub-pin',
        html: `
          <div style="background:#0f172a; color:#f59e0b; padding:4px 8px; border-radius:8px; border:2px solid #f59e0b; font-weight:900; font-size:10px; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            🏬 APNA BAZAR HUB
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 32],
      });
      L.marker(BAHARAGORA_HUB, { icon: hubIcon }).addTo(map);

      // 2. 10 km Delivery Radius Circle
      const radiusCircle = L.circle(BAHARAGORA_HUB, {
        radius: EXPRESS_RADIUS_KM * 1000,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      circleRef.current = radiusCircle;

      // 3. User Draggable Pin Marker (matching screenshot red pin style)
      const pinIcon = L.divIcon({
        className: 'delivery-point-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="width:36px; height:36px; background:#ef4444; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #ffffff; box-shadow:0 6px 16px rgba(239,68,68,0.5);">
              <span style="transform:rotate(45deg); color:#ffffff; font-size:16px;">🏠</span>
            </div>
            <span style="background:#0f172a; color:#ffffff; font-size:10px; font-weight:900; padding:2px 6px; border-radius:6px; margin-top:2px; white-space:nowrap; border:1px solid #f59e0b;">
              Delivery Point
            </span>
          </div>
        `,
        iconSize: [36, 52],
        iconAnchor: [18, 48],
      });

      const pinMarker = L.marker(selectedCoords, {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = pinMarker;

      const updateCoordinates = (lat: number, lng: number) => {
        setSelectedCoords([lat, lng]);
        const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lng);
        setDistanceKm(dist);
        const inside = dist <= EXPRESS_RADIUS_KM;
        setIsInside10Km(inside);

        if (dist <= 1.5) {
          setDetectedAddress(`Dadu Complex & Shitla Mandir Area, Baharagora (${dist} km)`);
          setActivePincode('832101');
        } else if (inside) {
          setDetectedAddress(`Baharagora Express Delivery Zone (${dist} km from Central Hub)`);
          setActivePincode('832101');
        } else {
          setDetectedAddress(`Outer District Area (${dist} km from Baharagora Hub)`);
          setActivePincode('832101');
        }
      };

      pinMarker.on('dragend', () => {
        const pos = pinMarker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        pinMarker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng);
      });

    } catch (e) {
      console.warn('Map initialization:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const handleSelectSuggestion = (loc: typeof POPULAR_LOCALITIES[0]) => {
    setSelectedCoords(loc.coords);
    setSearchQuery(loc.name);
    setShowSuggestions(false);
    setDetectedAddress(`${loc.name}, ${loc.city}, ${loc.state} - ${loc.pincode}`);
    setActivePincode(loc.pincode);

    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], loc.coords[0], loc.coords[1]);
    setDistanceKm(dist);
    setIsInside10Km(dist <= EXPRESS_RADIUS_KM);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(loc.coords);
      mapInstanceRef.current.setView(loc.coords, 15, { animate: true });
    }
  };

  const handleDetectGPS = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const { latitude, longitude } = pos.coords;
        const coords: [number, number] = [latitude, longitude];
        setSelectedCoords(coords);

        const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], latitude, longitude);
        setDistanceKm(dist);
        setIsInside10Km(dist <= EXPRESS_RADIUS_KM);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng(coords);
          mapInstanceRef.current.setView(coords, 15, { animate: true });
        }

        setDetectedAddress(`GPS Entrance Point (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Baharagora Hub`);
        setActivePincode('832101');
      },
      (err) => {
        setDetecting(false);
        setGpsError('Could not obtain a GPS reading. Please search for your area manually above.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleConfirmLocation = () => {
    onConfirmPincode(activePincode, detectedAddress, isInside10Km);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header matching Screenshot 11 */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Select Exact Delivery Point
              </h3>
              <p className="text-[11px] text-slate-300">
                Pinpoint your entrance for fastest delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar matching Screenshot 10 */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 relative shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search area, apartment, landmark or place"
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl border-2 border-amber-400/60 bg-amber-50/20 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-amber-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown matching Screenshot 10 */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-3 sm:left-4 right-3 sm:right-4 z-[1100] bg-white rounded-2xl shadow-xl border border-slate-200 mt-1 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
              {filteredSuggestions.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full p-3 text-left hover:bg-amber-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-xs text-slate-900">{loc.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {loc.city}, {loc.state} - {loc.pincode}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* "Use My Current Location" button matching Screenshot 11 */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detecting}
            className="w-full mt-2.5 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-all active:scale-98 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 text-emerald-600 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Locating GPS Entrance...' : 'Use My Current Location'}</span>
          </button>

          {gpsError && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Live Interactive Leaflet Map View */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-100 shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Top Pill Status Badge matching Screenshot 9 & 11 */}
          <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex justify-center">
            {isInside10Km ? (
              <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-black animate-fadeIn">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span>Delivery Available ({distanceKm} km)</span>
              </div>
            ) : (
              <div className="bg-rose-600 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-black animate-fadeIn">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Outside 10 KM Express Zone ({distanceKm} km)</span>
              </div>
            )}
          </div>

          {/* Bottom Hint */}
          <div className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none text-center">
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-white/10">
              Drag red pin to your building or entrance
            </span>
          </div>
        </div>

        {/* Detected Address Details & Confirm Button */}
        <div className="p-4 sm:p-5 space-y-4 bg-white overflow-y-auto flex-1 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                Detected Delivery Point
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                PIN: {activePincode}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
              {detectedAddress}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Coordinates: {selectedCoords[0].toFixed(4)}, {selectedCoords[1].toFixed(4)}
            </p>
          </div>

          {/* Big Confirm Button matching Screenshot 9 & 11 */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 transition-all active:scale-98 cursor-pointer"
          >
            <span>Confirm This Delivery Location</span>
            <Check className="w-5 h-5 stroke-[3]" />
          </button>

        </div>

      </div>
    </div>
  );
};
