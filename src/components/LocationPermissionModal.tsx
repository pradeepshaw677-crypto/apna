import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Search,
  Check,
  Building,
  Home,
  Loader2,
  Info
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

interface PlaceSuggestion {
  name: string;
  city: string;
  state: string;
  pincode: string;
  coords: [number, number];
  isLocal?: boolean;
}

// Built-in Indian Locations & Landmarks matching screenshots (e.g. Haridwar, Harihar Fort, etc.)
const POPULAR_LOCALITIES: PlaceSuggestion[] = [
  // Local Baharagora Service Zone (Inside 10 km)
  { name: 'Dadu Complex, Main Market', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2828, 86.7196], isLocal: true },
  { name: 'Near Shitla Mandir', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2835, 86.7188], isLocal: true },
  { name: 'Town High School Road', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2870, 86.7230], isLocal: true },
  { name: 'Baharagora College Campus', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2910, 86.7280], isLocal: true },
  { name: 'Sakha Maidan & Sub-div Hospital', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2940, 86.7120], isLocal: true },
  { name: 'Matihanna Chowk', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.3020, 86.7410], isLocal: true },
  { name: 'Khandamouda Village Road', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.3150, 86.7550], isLocal: true },
  { name: 'Barasol Junction', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2450, 86.7320], isLocal: true },
  { name: 'Gamharia Border Village', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.3200, 86.6850], isLocal: true },
  { name: 'Darkhuli Village', city: 'Baharagora', state: 'Jharkhand', pincode: '832101', coords: [22.2740, 86.7080], isLocal: true },
  
  // Specific Searches matching Screenshot 4 ("Hari...")
  { name: 'Haridwar', city: 'Haridwar', state: 'Uttarakhand, India', pincode: '249401', coords: [29.9457, 78.1642], isLocal: false },
  { name: 'Harihar Fort', city: 'Harshewadi', state: 'Maharashtra', pincode: '422212', coords: [19.9056, 73.5015], isLocal: false },
  { name: 'Harishchandragad', city: 'Thitabi Tarf Vaishakhare', state: 'Maharashtra', pincode: '421401', coords: [19.3872, 73.7788], isLocal: false },
  { name: 'Hari Nagar', city: 'West Delhi', state: 'Delhi', pincode: '110064', coords: [28.6253, 77.1082], isLocal: false },
  { name: 'Haripad', city: 'Alappuzha', state: 'Kerala', pincode: '690514', coords: [9.2882, 76.4589], isLocal: false },

  // Surrounding Hubs & Cities
  { name: 'Jamshedpur Tatanagar (Direct Hub)', city: 'Jamshedpur', state: 'Jharkhand', pincode: '831001', coords: [22.8046, 86.2029], isLocal: false },
  { name: 'Ranchi Main Road', city: 'Ranchi', state: 'Jharkhand', pincode: '834001', coords: [23.3441, 85.3096], isLocal: false },
  { name: 'Kharagpur Station Road', city: 'Kharagpur', state: 'West Bengal', pincode: '721301', coords: [22.3361, 87.3247], isLocal: false },
  { name: 'Baripada Town Center', city: 'Baripada', state: 'Odisha', pincode: '757001', coords: [21.9322, 86.7584], isLocal: false },
  { name: 'Kolkata Central Market', city: 'Kolkata', state: 'West Bengal', pincode: '700001', coords: [22.5726, 88.3639], isLocal: false },
  { name: 'Patna Junction Area', city: 'Patna', state: 'Bihar', pincode: '800001', coords: [25.5941, 85.1376], isLocal: false },
  { name: 'Bhubaneswar Master Canteen', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001', coords: [20.2961, 85.8245], isLocal: false }
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
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
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineSuggestions, setOnlineSuggestions] = useState<PlaceSuggestion[]>([]);
  
  const [detecting, setDetecting] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([22.2828, 86.7196]);
  const [distanceKm, setDistanceKm] = useState<number>(0.9);
  const [isInside10Km, setIsInside10Km] = useState<boolean>(true);
  const [detectedAddress, setDetectedAddress] = useState<string>('Dadu Complex, Near Shitla Mandir, Baharagora (832101)');
  const [activePincode, setActivePincode] = useState<string>('832101');
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Debounce online search for places using Nominatim / OpenStreetMap Google-compatible geocoding
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setOnlineSuggestions([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const query = searchQuery.trim();
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped: PlaceSuggestion[] = data.map((item: any) => {
              const addr = item.address || {};
              const city = addr.city || addr.town || addr.village || addr.county || item.name;
              const state = addr.state || 'India';
              const pincode = addr.postcode || '832101';
              return {
                name: item.name || item.display_name.split(',')[0],
                city: city,
                state: state,
                pincode: pincode,
                coords: [parseFloat(item.lat), parseFloat(item.lon)],
                isLocal: false
              };
            });
            setOnlineSuggestions(mapped);
          }
        }
      } catch (err) {
        // Fallback gracefully to offline list if network fails
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combined suggestions: local matches + online matches
  const localMatches = searchQuery.trim()
    ? POPULAR_LOCALITIES.filter(
        loc =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.pincode.includes(searchQuery)
      )
    : POPULAR_LOCALITIES.slice(0, 5);

  // Merge and deduplicate by name
  const combinedSuggestions: PlaceSuggestion[] = (() => {
    const list = [...localMatches];
    for (const item of onlineSuggestions) {
      if (!list.some(l => l.name.toLowerCase() === item.name.toLowerCase())) {
        list.push(item);
      }
    }
    return list.slice(0, 7);
  })();

  // Reverse geocode helper when user moves the pin on the map
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
          const locality = addr.suburb || addr.village || addr.town || addr.city_district || '';
          const city = addr.city || addr.town || addr.village || addr.county || 'Baharagora';
          const state = addr.state || 'Jharkhand';
          const pin = addr.postcode || '832101';

          const parts = [road, locality, city, state].filter(Boolean);
          const fullFormatted = `${parts.join(', ')} - ${pin}`;
          setDetectedAddress(fullFormatted);
          setActivePincode(pin);

          try {
            localStorage.setItem('ab_auto_detected_address', fullFormatted);
            localStorage.setItem('ab_auto_detected_pincode', pin);
          } catch {}
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default fallback based on distance
    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lon);
    if (dist <= 1.5) {
      const addr = `Dadu Complex & Shitla Mandir Area, Baharagora (832101)`;
      setDetectedAddress(addr);
      setActivePincode('832101');
    } else if (dist <= EXPRESS_RADIUS_KM) {
      const addr = `Baharagora 10-KM Delivery Zone (${dist} km from Hub) - 832101`;
      setDetectedAddress(addr);
      setActivePincode('832101');
    } else {
      const addr = `Outer Location (${lat.toFixed(4)}, ${lon.toFixed(4)}) - ${dist} km away`;
      setDetectedAddress(addr);
    }
  }, []);

  // Update pin and distance
  const updateCoordinates = useCallback((lat: number, lng: number, shouldReverse = true) => {
    const newCoords: [number, number] = [lat, lng];
    setSelectedCoords(newCoords);
    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lng);
    setDistanceKm(dist);
    const inside = dist <= EXPRESS_RADIUS_KM;
    setIsInside10Km(inside);

    if (shouldReverse) {
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

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

      // OpenStreetMap Tiles matching Screenshot 2
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // 1. Apna Bazar Central Hub Marker (Store point)
      const hubIcon = L.divIcon({
        className: 'hub-pin',
        html: `
          <div style="background:#0f172a; color:#f59e0b; padding:4px 8px; border-radius:8px; border:2px solid #f59e0b; font-weight:900; font-size:10px; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.35);">
            🏬 APNA BAZAR HUB
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 32],
      });
      L.marker(BAHARAGORA_HUB, { icon: hubIcon }).addTo(map);

      // 2. 10 km Delivery Radius Circle in Emerald with dashed stroke
      const radiusCircle = L.circle(BAHARAGORA_HUB, {
        radius: EXPRESS_RADIUS_KM * 1000,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2.5,
        dashArray: '6, 6',
      }).addTo(map);
      circleRef.current = radiusCircle;

      // 3. User Draggable Pin Marker (matching Screenshot 2 green pin with house circle)
      const pinIcon = L.divIcon({
        className: 'delivery-point-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="width:38px; height:38px; background:#059669; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #ffffff; box-shadow:0 6px 18px rgba(5,150,105,0.45);">
              <span style="transform:rotate(45deg); color:#ffffff; font-size:17px;">🏠</span>
            </div>
            <div style="background:#0f172a; color:#10b981; font-size:10px; font-weight:900; padding:2px 8px; border-radius:10px; margin-top:3px; white-space:nowrap; border:1px solid #10b981; box-shadow:0 2px 8px rgba(0,0,0,0.25);">
              Delivery Point
            </div>
          </div>
        `,
        iconSize: [38, 54],
        iconAnchor: [19, 50],
      });

      const pinMarker = L.marker(selectedCoords, {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = pinMarker;

      pinMarker.on('dragend', () => {
        const pos = pinMarker.getLatLng();
        updateCoordinates(pos.lat, pos.lng, true);
      });

      map.on('click', (e) => {
        pinMarker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng, true);
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

  const handleSelectSuggestion = (loc: PlaceSuggestion) => {
    setSelectedCoords(loc.coords);
    setSearchQuery(loc.name);
    setShowSuggestions(false);
    setDetectedAddress(`${loc.name}, ${loc.city}, ${loc.state} - ${loc.pincode}`);
    setActivePincode(loc.pincode);

    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], loc.coords[0], loc.coords[1]);
    setDistanceKm(dist);
    const inside = dist <= EXPRESS_RADIUS_KM;
    setIsInside10Km(inside);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(loc.coords);
      mapInstanceRef.current.setView(loc.coords, inside ? 14 : 11, { animate: true });
    }
  };

  const handleDetectGPS = async () => {
    setGpsError(null);
    setDetecting(true);

    const applyCoordinates = async (latitude: number, longitude: number) => {
      const coords: [number, number] = [latitude, longitude];
      setSelectedCoords(coords);

      const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], latitude, longitude);
      setDistanceKm(dist);
      const inside = dist <= EXPRESS_RADIUS_KM;
      setIsInside10Km(inside);

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng(coords);
        mapInstanceRef.current.setView(coords, inside ? 15 : 12, { animate: true });
      }

      await reverseGeocode(latitude, longitude);
      setDetecting(false);
    };

    // Tier 1: Fast Browser Geolocation (timeout 3.5s, enableHighAccuracy: false to prevent satellite freeze)
    if (navigator.geolocation) {
      try {
        const coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err),
            { timeout: 3500, enableHighAccuracy: false, maximumAge: 60000 }
          );
        });
        await applyCoordinates(coords.latitude, coords.longitude);
        return;
      } catch {
        // Fall through to IP geolocation
      }
    }

    // Tier 2: Real-time IP Geolocation API (instant fallback)
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          const lat = parseFloat(ipData.latitude);
          const lon = parseFloat(ipData.longitude);
          await applyCoordinates(lat, lon);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Tier 3: Secondary IP API
    try {
      const whoRes = await fetch('https://ipwho.is/');
      if (whoRes.ok) {
        const whoData = await whoRes.json();
        if (whoData && whoData.success && whoData.latitude && whoData.longitude) {
          await applyCoordinates(whoData.latitude, whoData.longitude);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Final Fallback: Baharagora Hub Entrance
    setDetecting(false);
    setGpsError('Could not obtain a GPS reading. Please try again or search for your address manually.');
  };

  const handleConfirmLocation = () => {
    // User constraint: "agar adress 10 se bahar ho delivery nahi milaga ok"
    if (!isInside10Km) {
      return;
    }
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
        
        {/* Header matching Screenshot 2 */}
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

        {/* Search Bar matching Screenshot 2 & 4 */}
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
            {isSearchingOnline && (
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-9 top-3.5" />
            )}
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

          {/* Autocomplete Suggestions Dropdown matching Screenshot 4 */}
          {showSuggestions && combinedSuggestions.length > 0 && (
            <div className="absolute top-full left-3 sm:left-4 right-3 sm:right-4 z-[1100] bg-white rounded-2xl shadow-xl border border-slate-200 mt-1 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
              {combinedSuggestions.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full p-3 text-left hover:bg-amber-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs text-slate-900 truncate">{loc.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium block truncate">
                      {loc.city ? `${loc.city}, ` : ''}{loc.state}
                    </span>
                  </div>
                  {loc.isLocal && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      Within 10 km
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* "Use My Current Location" button matching Screenshot 2 & 4 */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detecting}
            className="w-full mt-2.5 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-all active:scale-98 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 text-emerald-600 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Locating GPS Entrance...' : 'Use My Current Location'}</span>
          </button>

          {/* GPS Error matching Screenshot 4 */}
          {gpsError && (
            <div className="mt-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 font-medium animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Live Interactive Leaflet Map View */}
        <div className="relative w-full h-60 sm:h-72 bg-slate-100 shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Top Pill Status Badge matching Screenshot 2 & 4 */}
          <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex justify-center">
            {isInside10Km ? (
              <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-black animate-fadeIn">
                <ShieldCheck className="w-4 h-4" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>Delivery Available ({distanceKm} km)</span>
              </div>
            ) : (
              <div className="bg-rose-600 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-black animate-fadeIn">
                <AlertTriangle className="w-4 h-4" />
                <span>Delivery Not Available ({distanceKm} km) • Outside 10 km</span>
              </div>
            )}
          </div>

          {/* Bottom attribution overlay matching Screenshot 2 */}
          <div className="absolute bottom-1 right-2 z-[1000] pointer-events-none text-right">
            <span className="text-[10px] text-slate-700 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs">
              Leaflet | © Google Maps
            </span>
          </div>

          {/* Bottom Hint */}
          <div className="absolute bottom-2 left-2 z-[1000] pointer-events-none">
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/10">
              Drag green pin to your building
            </span>
          </div>
        </div>

        {/* Detected Address Details & Confirm Button */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-white overflow-y-auto flex-1 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                DETECTED ADDRESS
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                PIN: {activePincode}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
              {detectedAddress}
            </p>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 font-mono">
                {selectedCoords[0].toFixed(4)}, {selectedCoords[1].toFixed(4)}
              </p>
              <span className={`text-[11px] font-bold ${isInside10Km ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isInside10Km ? `✓ Within 10 km Express Zone (${distanceKm} km)` : `✕ ${distanceKm} km (Exceeds 10 km limit)`}
              </span>
            </div>
          </div>

          {/* Outside 10 km Rule Warning Banner */}
          {!isInside10Km && (
            <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Delivery Not Available at This Address</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Apna Bazar delivers exclusively within a <strong>10 km radius</strong> of our Baharagora Central Hub. Your selected location is <strong>{distanceKm} km</strong> away. Please drag the pin or choose an address within 10 km to place an order.
              </p>
            </div>
          )}

          {/* Confirm Button matching Screenshot 2 & 4 */}
          {isInside10Km ? (
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 transition-all active:scale-98 cursor-pointer"
            >
              <span>Confirm This Delivery Location</span>
              <Check className="w-5 h-5 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-200 text-slate-400 font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
            >
              <span>Delivery Not Available (Outside 10 km)</span>
              <AlertTriangle className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
