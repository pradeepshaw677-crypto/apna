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
  Loader2, 
  Layers,
  RefreshCw
} from 'lucide-react';
import { api } from '../utils/api';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onConfirmPincode: (pin: string, fullAddress: string, isJharkhand: boolean) => void;
}

// Baharagora Central Hub Coordinates (Apna Bazar Center)
const BAHARAGORA_HUB: [number, number] = [22.2815, 86.7198];
const EXPRESS_RADIUS_KM = 10;

export interface StructuredAddress {
  plusCode: string;
  road: string;
  locality: string;
  village?: string;
  city: string;
  landmark: string;
  nearby?: string;
  state: string;
  pincode: string;
  fullFormatted: string;
}

interface PlaceSuggestion {
  name: string;
  city: string;
  state: string;
  pincode: string;
  coords: [number, number];
  distanceKm?: number;
  isInside10Km?: boolean;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  
  const [detecting, setDetecting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([22.2815, 86.7198]);
  const [distanceKm, setDistanceKm] = useState<number>(0.0);
  const [isInside10Km, setIsInside10Km] = useState<boolean>(true);
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress>({
    plusCode: '6PFP+W7H',
    road: 'Baharagora Main Road',
    locality: 'Baharagora',
    village: 'Baharagora',
    city: 'Baharagora',
    landmark: 'Baharagora Central Market',
    nearby: 'Near Central Market',
    state: 'Jharkhand',
    pincode: '832101',
    fullFormatted: 'Baharagora Main Road, Baharagora, Jharkhand 832101',
  });

  const [gpsStatusNotice, setGpsStatusNotice] = useState<string | null>(null);

  // Live Reverse Geocode on EVERY pin drag, drop or map tap
  const fetchLiveAddressForCoords = useCallback(async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const data = await api.reverseGeocode(lat, lon);
      if (data && data.fullFormatted) {
        setStructuredAddress({
          plusCode: data.plusCode || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          road: data.road || 'Main Road',
          locality: data.locality || data.city || 'Local Area',
          village: data.village || data.locality || '',
          city: data.city || 'Local City',
          landmark: data.landmark || `Near ${data.locality || data.city || 'Hub'}`,
          nearby: data.nearby || data.landmark || `Near ${data.village || data.locality || data.city || 'Hub'}`,
          state: data.state || 'India',
          pincode: data.pincode || '832101',
          fullFormatted: data.fullFormatted,
        });
        setDistanceKm(data.distanceKm ?? calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lon));
        setIsInside10Km(data.isInside10Km ?? (calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lon) <= EXPRESS_RADIUS_KM));
        return;
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setIsGeocoding(false);
    }

    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lon);
    setDistanceKm(dist);
    setIsInside10Km(dist <= EXPRESS_RADIUS_KM);
  }, []);

  // Update coordinates from pin drop, drag or map tap
  const updateCoordinates = useCallback((lat: number, lng: number) => {
    const newCoords: [number, number] = [lat, lng];
    setSelectedCoords(newCoords);
    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lng);
    setDistanceKm(dist);
    setIsInside10Km(dist <= EXPRESS_RADIUS_KM);

    // Live update real shortest blue route line
    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([BAHARAGORA_HUB, newCoords]);
    }
    if (routeGlowRef.current) {
      routeGlowRef.current.setLatLngs([BAHARAGORA_HUB, newCoords]);
    }

    fetchLiveAddressForCoords(lat, lng);
  }, [fetchLiveAddressForCoords]);

  // Online Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const results = await api.searchPlaces(searchQuery.trim());
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Live GPS Detect
  const handleDetectGPS = useCallback(async () => {
    setDetecting(true);
    setGpsStatusNotice(null);
    setPermissionBlocked(false);

    const applyRealCoords = (lat: number, lon: number) => {
      const coords: [number, number] = [lat, lon];
      setSelectedCoords(coords);
      setDetecting(false);

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng(coords);
        mapInstanceRef.current.setView(coords, 16, { animate: true });
      }

      updateCoordinates(lat, lon);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyRealCoords(pos.coords.latitude, pos.coords.longitude);
        },
        async (err) => {
          setDetecting(false);
          if (err.code === 1) {
            setPermissionBlocked(true);
          } else {
            // Server GeoIP fallback
            try {
              const geo = await api.getGeoIP();
              if (geo?.lat && geo?.lon) {
                applyRealCoords(geo.lat, geo.lon);
                return;
              }
            } catch {}
            applyRealCoords(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1]);
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
      return;
    }

    setDetecting(false);
    applyRealCoords(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1]);
  }, [updateCoordinates]);

  // Initialize Map with Screen Fit & Blue Navigation Line
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: selectedCoords,
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Invalidate size immediately and after delay to avoid screen overflow glitches
      map.invalidateSize();
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 150);
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 400);

      const tileUrl = mapType === 'satellite'
        ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      L.tileLayer(tileUrl, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }).addTo(map);

      // 1. Apna Bazar Central Hub Marker (Center)
      const hubIcon = L.divIcon({
        className: 'hub-pin',
        html: `
          <div style="background:#0f172a; color:#f59e0b; padding:4px 10px; border-radius:10px; border:2px solid #f59e0b; font-weight:900; font-size:11px; white-space:nowrap; box-shadow:0 4px 14px rgba(0,0,0,0.4); display:flex; align-items:center; gap:4px;">
            🏬 APNA BAZAR HUB
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 32],
      });
      L.marker(BAHARAGORA_HUB, { icon: hubIcon }).addTo(map);

      // 2. 10 km Radius Circle
      L.circle(BAHARAGORA_HUB, {
        radius: EXPRESS_RADIUS_KM * 1000,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      // 3. REAL SHORTEST DISTANCE BLUE NAVIGATION LINE FROM APNA BAZAR TO DROPPED PIN
      const routeGlow = L.polyline([BAHARAGORA_HUB, selectedCoords], {
        color: '#93c5fd',
        weight: 10,
        opacity: 0.6,
        lineCap: 'round',
      }).addTo(map);
      routeGlowRef.current = routeGlow;

      const routeLine = L.polyline([BAHARAGORA_HUB, selectedCoords], {
        color: '#2563eb', // Real Google Maps Navigation Blue
        weight: 5,
        opacity: 0.98,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);
      routeLineRef.current = routeLine;

      // 4. Droppable / Draggable Pin with Pulsing Drop Target
      const pinIcon = L.divIcon({
        className: 'delivery-point-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="width:44px; height:44px; background:#ea580c; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #ffffff; box-shadow:0 8px 24px rgba(234,88,12,0.6);">
              <span style="transform:rotate(45deg); color:#ffffff; font-size:20px;">📍</span>
            </div>
            <div style="background:#0f172a; color:#fb923c; font-size:10px; font-weight:900; padding:2px 8px; border-radius:10px; margin-top:3px; white-space:nowrap; border:1px solid #ea580c; box-shadow:0 2px 8px rgba(0,0,0,0.4);">
              Drop Pin Here
            </div>
          </div>
        `,
        iconSize: [44, 62],
        iconAnchor: [22, 58],
      });

      const pinMarker = L.marker(selectedCoords, {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = pinMarker;

      // Live stretch of blue route line while dragging pin
      pinMarker.on('drag', () => {
        const pos = pinMarker.getLatLng();
        if (routeLineRef.current) routeLineRef.current.setLatLngs([BAHARAGORA_HUB, pos]);
        if (routeGlowRef.current) routeGlowRef.current.setLatLngs([BAHARAGORA_HUB, pos]);
      });

      // Pin Drop Event -> Fetches location where pin is dropped
      pinMarker.on('dragend', () => {
        const pos = pinMarker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
      });

      // Map Tap/Click -> Moves pin directly to tapped point & recalculates location
      map.on('click', (e) => {
        pinMarker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng);
      });

    } catch (e) {
      console.warn('Map initialization error:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, mapType]);

  const toggleMapType = () => {
    setMapType(prev => (prev === 'roadmap' ? 'satellite' : 'roadmap'));
  };

  const handleSelectSuggestion = (loc: PlaceSuggestion) => {
    setSelectedCoords(loc.coords);
    setSearchQuery(loc.name);
    setShowSuggestions(false);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(loc.coords);
      mapInstanceRef.current.setView(loc.coords, 16, { animate: true });
    }

    updateCoordinates(loc.coords[0], loc.coords[1]);
  };

  const handleConfirmLocation = () => {
    try {
      localStorage.setItem('ab_location_verified', 'true');
      localStorage.setItem('ab_delivery_location', structuredAddress.fullFormatted);
      localStorage.setItem('ab_selected_pincode', structuredAddress.pincode);
      localStorage.setItem('ab_user_coords', JSON.stringify({ lat: selectedCoords[0], lng: selectedCoords[1] }));
    } catch {}

    onConfirmPincode(structuredAddress.pincode, structuredAddress.fullFormatted, isInside10Km);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      {/* Container: 100% Screen Fit, Responsive & Anti-Glitch */}
      <div 
        className="relative bg-white w-full max-w-lg h-[92dvh] max-h-[700px] rounded-3xl shadow-2xl border-2 border-amber-400/90 overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header (Compact & Fixed) */}
        <div className="p-3.5 sm:p-4 bg-slate-950 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-400 bg-slate-900 shrink-0">
              <img
                src="/assets/aistudio/IMG_20261102_120048_b98f504b.png"
                alt="Apna Bazar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
                <span>Set Delivery Location</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live GPS
                </span>
              </h3>
              <p className="text-[11px] text-amber-300 font-medium leading-tight">
                Drop pin anywhere on map to select delivery address
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Search & GPS Controls (Single Compact Strip) */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 relative shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search area, road, or city..."
                className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-amber-500"
              />
              {isSearchingOnline && (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-2.5 top-2.5" />
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detecting}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-75 shadow-xs"
            >
              <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
              <span>{detecting ? 'Detecting...' : 'Live GPS'}</span>
            </button>

            <button
              type="button"
              onClick={toggleMapType}
              className="py-2 px-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              title="Toggle Map Style"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-2.5 right-2.5 z-[1200] bg-white rounded-xl shadow-xl border border-slate-200 mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
              {suggestions.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full p-2.5 text-left hover:bg-amber-50 flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs text-slate-900 truncate">{loc.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">
                      {loc.city ? `${loc.city}, ` : ''}{loc.state} • {loc.pincode}
                    </span>
                  </div>
                  {loc.distanceKm !== undefined && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {loc.distanceKm} km
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Real-time Shortest Distance Route Strip */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <span className="font-bold text-blue-950 truncate">
                🏬 Apna Bazar Hub ➔ <span className="text-blue-700 font-black">Blue Navigation Line</span>
              </span>
            </div>
            <div className="flex items-center gap-1 font-black text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
              <span>{distanceKm} km</span>
              <span>•</span>
              <span className="text-emerald-700">Shortest Route</span>
            </div>
          </div>
        </div>

        {/* 3. Interactive Map (Fits Perfectly in Available Height) */}
        <div className="relative flex-1 w-full bg-slate-100 min-h-[200px] overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Top Floating Badge */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] pointer-events-none flex justify-center">
            {isInside10Km ? (
              <div className="bg-emerald-600/95 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center gap-1.5 text-[11px] font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Direct Express Delivery Available ({distanceKm} km)</span>
              </div>
            ) : (
              <div className="bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center gap-1.5 text-[11px] font-black">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Standard Delivery Zone ({distanceKm} km)</span>
              </div>
            )}
          </div>

          {/* Bottom Floating Hint on Map */}
          <div className="absolute bottom-2 left-2 z-[1000] pointer-events-none">
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/10 flex items-center gap-1">
              <span>📍 Drop pin or tap map to set location</span>
              {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />}
            </span>
          </div>

          <div className="absolute bottom-1 right-2 z-[1000] pointer-events-none text-right">
            <span className="text-[9px] text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs font-semibold">
              Google Maps
            </span>
          </div>
        </div>

        {/* 4. Dropped Pin Address Summary Box */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-1 text-left">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Selected Delivery Address
            </span>
            <span className="text-[10px] font-bold font-mono text-slate-500">
              PIN: {structuredAddress.pincode}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
            {structuredAddress.fullFormatted || `${structuredAddress.road}, ${structuredAddress.city}, Jharkhand ${structuredAddress.pincode}`}
          </p>

          <div className="flex items-center gap-2 pt-0.5 text-[11px]">
            <span className={`px-2 py-0.5 rounded-full font-black ${
              isInside10Km ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isInside10Km ? '✓ 10-KM Express Zone' : 'Standard Shipping'}
            </span>
            <span className="text-slate-500 font-medium">
              Shortest Distance: <strong className="text-slate-800">{distanceKm} km</strong> from Apna Bazar Hub
            </span>
          </div>
        </div>

        {/* 5. THE CONFIRM DELIVERY LOCATION CTA BUTTON (Massive, Sticky, Always 100% Visible) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t-2 border-amber-300 shrink-0">
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 cursor-pointer border-2 border-white transition-all"
          >
            <span>Confirm Delivery Location / डिलीवरी लोकेशन सेट करें</span>
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
};
