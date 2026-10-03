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
  Edit3,
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

// Baharagora Central Hub Coordinates (Dadu Complex / Shitla Mandir)
const BAHARAGORA_HUB: [number, number] = [22.2815, 86.7198];
const EXPRESS_RADIUS_KM = 10;

export interface StructuredAddress {
  plusCode: string;   // e.g. "6PFP+W7H" or "J8R6+33R"
  road: string;       // e.g. "Domjuri road" or "Sakchi Main Road"
  locality: string;   // e.g. "Domjuri" or "Sakchi"
  city: string;       // e.g. "Baharagora" or "Jamshedpur"
  landmark: string;   // e.g. "Kolaram" or "Eye Hospital"
  state: string;      // e.g. "Jharkhand"
  pincode: string;    // e.g. "832101"
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
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

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
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  // Structured address state updated LIVE on every single pin drop / GPS
  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress>({
    plusCode: '6PFP+W7H',
    road: 'Baharagora Main Road',
    locality: 'Baharagora',
    city: 'Baharagora',
    landmark: 'Baharagora Central Market',
    state: 'Jharkhand',
    pincode: '832101',
    fullFormatted: '6PFP+W7H, Baharagora Main Road, Baharagora, Baharagora, Baharagora Central Market, Jharkhand 832101',
  });

  const [gpsStatusNotice, setGpsStatusNotice] = useState<string | null>(null);

  // Live Reverse Geocode via multi-engine endpoint on EVERY pin drop, click or GPS update
  const fetchLiveAddressForCoords = useCallback(async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const data = await api.reverseGeocode(lat, lon);
      if (data && data.fullFormatted) {
        setStructuredAddress({
          plusCode: data.plusCode || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          road: data.road || 'Main Road',
          locality: data.locality || data.city || 'Local Area',
          city: data.city || 'Local City',
          landmark: data.landmark || `Near ${data.locality || data.city || 'Hub'}`,
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

    // Dynamic Fallback without hardcoding
    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lon);
    const inside = dist <= EXPRESS_RADIUS_KM;
    setDistanceKm(dist);
    setIsInside10Km(inside);
  }, []);

  // Update coordinates from user interaction (pin drag, map click, suggestion pick)
  const updateCoordinates = useCallback((lat: number, lng: number) => {
    const newCoords: [number, number] = [lat, lng];
    setSelectedCoords(newCoords);
    const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lng);
    setDistanceKm(dist);
    setIsInside10Km(dist <= EXPRESS_RADIUS_KM);
    fetchLiveAddressForCoords(lat, lng);
  }, [fetchLiveAddressForCoords]);

  // Online Place Search with debouncing
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
        if (Array.isArray(results)) {
          setSuggestions(results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fast High-Reliability GPS Geolocation with Browser Permission Prompt
  const handleDetectGPS = useCallback(async () => {
    setGpsStatusNotice('📍 Requesting location from browser... Please click "Allow" on popup');
    setPermissionBlocked(false);
    setDetecting(true);

    const applyRealCoords = (latitude: number, longitude: number, sourceLabel: string) => {
      const coords: [number, number] = [latitude, longitude];
      setSelectedCoords(coords);

      const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], latitude, longitude);
      setDistanceKm(dist);
      const inside = dist <= EXPRESS_RADIUS_KM;
      setIsInside10Km(inside);

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng(coords);
        mapInstanceRef.current.setView(coords, inside ? 16 : 14, { animate: true });
      }

      fetchLiveAddressForCoords(latitude, longitude);
      setDetecting(false);
      setGpsStatusNotice(`✓ Real Live Location Detected (${sourceLabel})! [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`);
      setTimeout(() => setGpsStatusNotice(null), 5000);
    };

    // Helper promise for browser geolocation
    const requestBrowserGPS = (highAccuracy: boolean, timeoutMs: number): Promise<{ latitude: number; longitude: number }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: 30000 }
        );
      });
    };

    // Step 1: Try browser geolocation
    if (navigator.geolocation) {
      try {
        // Fast attempt with high accuracy
        const coords = await requestBrowserGPS(true, 7000);
        applyRealCoords(coords.latitude, coords.longitude, 'High-Accuracy Device GPS');
        return;
      } catch (err: any) {
        // If permission explicitly denied by user in browser
        if (err?.code === 1) {
          setPermissionBlocked(true);
          setDetecting(false);
          setGpsStatusNotice('⚠️ Location permission is blocked in browser settings. Please allow access or drag the pin on map.');
          return;
        }

        // If timeout or position unavailable, retry immediately with standard accuracy (cellular/WiFi)
        try {
          const fastCoords = await requestBrowserGPS(false, 5000);
          applyRealCoords(fastCoords.latitude, fastCoords.longitude, 'Network / WiFi Triangulation');
          return;
        } catch (err2: any) {
          console.warn('Standard geolocation retry failed:', err2?.message);
        }
      }
    }

    // Step 2: Try Server-side GeoIP Lookup
    try {
      const geoIpData = await api.getGeoIP();
      if (geoIpData && geoIpData.lat && geoIpData.lon) {
        applyRealCoords(geoIpData.lat, geoIpData.lon, `Network IP: ${geoIpData.city || 'Live Area'}`);
        return;
      }
    } catch {}

    // Step 3: Default to Baharagora Hub if device GPS is completely disabled
    applyRealCoords(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], 'Baharagora Central Hub');
    setGpsStatusNotice('GPS signal unavailable. Centered at Baharagora Hub. You can drag the pin anywhere on Google Map!');
  }, [fetchLiveAddressForCoords]);

  // Proactively trigger browser location prompt as soon as modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Immediately trigger location detection prompt so user gets the browser permission dialog
    handleDetectGPS();
  }, [isOpen, handleDetectGPS]);

  // Initialize Leaflet Map with Google Maps Tiles
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

      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 250);

      // Google Maps Tiles Layer:
      // lyrs=m : Standard Google Maps Roadmap with roads, buildings, shops, and labels
      // lyrs=y : Hybrid Satellite with high-res imagery + road overlays
      const tileUrl = mapType === 'satellite'
        ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      const googleLayer = L.tileLayer(tileUrl, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }).addTo(map);

      currentTileLayerRef.current = googleLayer;

      // 1. Apna Bazar Central Hub Marker
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

      // 2. 10 km Delivery Radius Circle
      L.circle(BAHARAGORA_HUB, {
        radius: EXPRESS_RADIUS_KM * 1000,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.10,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      // 3. User Draggable Pin Marker with House Icon & Delivery Point label
      const pinIcon = L.divIcon({
        className: 'delivery-point-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="width:42px; height:42px; background:#ea580c; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #ffffff; box-shadow:0 6px 20px rgba(234,88,12,0.5);">
              <span style="transform:rotate(45deg); color:#ffffff; font-size:18px;">📍</span>
            </div>
            <div style="background:#0f172a; color:#fb923c; font-size:10px; font-weight:900; padding:2px 8px; border-radius:10px; margin-top:3px; white-space:nowrap; border:1px solid #ea580c; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
              Drag Me Anywhere
            </div>
          </div>
        `,
        iconSize: [42, 60],
        iconAnchor: [21, 56],
      });

      const pinMarker = L.marker(selectedCoords, {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = pinMarker;

      // Pin drag listener -> Real Live Geocoding on EVERY drag!
      pinMarker.on('dragend', () => {
        const pos = pinMarker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
      });

      // Map click listener -> Drops pin anywhere user clicks on Google Map!
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

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const handleConfirmLocation = () => {
    onConfirmPincode(structuredAddress.pincode, structuredAddress.fullFormatted, isInside10Km);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Select Delivery Point</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Google Maps Live
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Live GPS &amp; Pin-Drop with real-time address detection
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

        {/* Search Bar & Action Controls */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 relative shrink-0 space-y-2">
          <form onSubmit={handleManualSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search area, colony, apartment, or road (Press Enter to locate)"
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
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-3 sm:left-4 right-3 sm:right-4 z-[1100] bg-white rounded-2xl shadow-xl border border-slate-200 mt-1 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
              {suggestions.map((loc, idx) => (
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
                      {loc.city ? `${loc.city}, ` : ''}{loc.state} • {loc.pincode}
                    </span>
                  </div>
                  {loc.distanceKm !== undefined && (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
                      loc.isInside10Km ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {loc.distanceKm} km
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Location Bar with "Use Current Location" + Map Style Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detecting}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center gap-2 border border-emerald-300 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 text-emerald-600 ${detecting ? 'animate-spin' : ''}`} />
              <span>{detecting ? 'Detecting Live GPS...' : 'Use My Current Location (Live GPS)'}</span>
            </button>

            <button
              type="button"
              onClick={toggleMapType}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs transition-all cursor-pointer"
              title="Toggle Google Satellite / Roadmap"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>
          </div>

          {/* Browser Permission Blocked Alert */}
          {permissionBlocked && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-medium space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-rose-950">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Location Access Blocked in Browser</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-snug">
                Click the <strong>🔒 Lock icon</strong> in your browser address bar &rarr; <strong>Site Settings</strong> &rarr; Set <strong>Location to Allow</strong>.
              </p>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="mt-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Permission</span>
              </button>
            </div>
          )}

          {/* GPS Status Notice */}
          {gpsStatusNotice && !permissionBlocked && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="flex-1">{gpsStatusNotice}</span>
            </div>
          )}
        </div>

        {/* Live Interactive Google Map View */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-100 shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Top Pill Status Badge */}
          <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex justify-center">
            {isInside10Km ? (
              <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-black animate-fadeIn">
                <ShieldCheck className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>15-Min Express Delivery Available ({distanceKm} km from Hub)</span>
              </div>
            ) : (
              <div className="bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-black animate-fadeIn">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Standard Delivery Zone ({distanceKm} km from Hub)</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-1 right-2 z-[1000] pointer-events-none text-right">
            <span className="text-[10px] text-slate-700 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs font-semibold">
              Google Maps © 2026
            </span>
          </div>

          <div className="absolute bottom-2 left-2 z-[1000] pointer-events-none">
            <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/10 flex items-center gap-1.5">
              <span>📍 Drag pin to your building or entrance</span>
              {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
            </span>
          </div>
        </div>

        {/* Detected Address Details with Live Pin Data */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-white overflow-y-auto flex-1 text-xs">
          
          <div className="bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-4 font-sans text-slate-900 space-y-1 shadow-2xs relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Live Pin-Dropped Full Address
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsManualEditing(!isManualEditing)}
                  className="text-[10px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isManualEditing ? 'Save Edit' : 'Manual Edit'}</span>
                </button>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isInside10Km ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isInside10Km ? '✓ 10-KM Express Zone' : 'Standard Delivery Zone'}
                </span>
              </div>
            </div>

            {/* Structured Address Display */}
            {!isManualEditing ? (
              <div className="pt-2 text-sm sm:text-base font-semibold text-slate-800 leading-snug space-y-0.5">
                <div className="font-mono font-bold text-amber-700">{structuredAddress.plusCode},</div>
                <div>{structuredAddress.road},</div>
                <div>{structuredAddress.locality},</div>
                <div>{structuredAddress.city},</div>
                <div>{structuredAddress.landmark},</div>
                <div>{structuredAddress.state}</div>
                <div className="font-bold text-slate-950 pt-0.5">{structuredAddress.pincode}</div>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Plus Code</label>
                  <input
                    type="text"
                    value={structuredAddress.plusCode}
                    onChange={(e) => setStructuredAddress(prev => ({ ...prev, plusCode: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Road / Street</label>
                  <input
                    type="text"
                    value={structuredAddress.road}
                    onChange={(e) => setStructuredAddress(prev => ({ ...prev, road: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Village / Locality</label>
                    <input
                      type="text"
                      value={structuredAddress.locality}
                      onChange={(e) => setStructuredAddress(prev => ({ ...prev, locality: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Town / City</label>
                    <input
                      type="text"
                      value={structuredAddress.city}
                      onChange={(e) => setStructuredAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Landmark / Area</label>
                    <input
                      type="text"
                      value={structuredAddress.landmark}
                      onChange={(e) => setStructuredAddress(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Pincode</label>
                    <input
                      type="text"
                      value={structuredAddress.pincode}
                      onChange={(e) => setStructuredAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{selectedCoords[0].toFixed(5)}, {selectedCoords[1].toFixed(5)}</span>
              <span className={`font-bold ${isInside10Km ? 'text-emerald-700' : 'text-slate-700'}`}>
                Distance: {distanceKm} km {isInside10Km ? '(15-Min Express)' : '(Standard Shipping)'}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
              isInside10Km
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/25'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/25'
            }`}
          >
            <span>
              {isInside10Km 
                ? 'Confirm This Delivery Address (15-Min Express)' 
                : 'Confirm This Delivery Address (Standard Delivery)'}
            </span>
            <Check className="w-5 h-5 stroke-[3]" />
          </button>

        </div>

      </div>
    </div>
  );
};
