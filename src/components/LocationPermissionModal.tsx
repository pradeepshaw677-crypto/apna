import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Search, 
  Check, 
  Loader2, 
  Layers,
  Ban,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../utils/api';
import {
  APNA_BAZAR_COORDS,
  DELIVERY_CIRCLE_RADIUS_KM,
  calculateDistanceFromApnaBazarKm,
  computePlusCodeFast,
  fastReverseGeocode,
  getFastRealCoordinates,
  getLatestCachedGpsFix,
  startLiveGpsWatcher,
} from '../utils/fastGps';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onConfirmPincode: (pin: string, fullAddress: string, isJharkhand: boolean) => void;
}

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

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onConfirmPincode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gpsDotRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  const [detecting, setDetecting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [gpsSuccessBanner, setGpsSuccessBanner] = useState<string | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<[number, number]>(() => {
    const cachedGps = getLatestCachedGpsFix();
    if (cachedGps) {
      return [cachedGps.lat, cachedGps.lng];
    }
    return APNA_BAZAR_COORDS;
  });

  const [distanceKm, setDistanceKm] = useState<number>(() =>
    calculateDistanceFromApnaBazarKm(selectedCoords[0], selectedCoords[1])
  );
  const [isInside10Km, setIsInside10Km] = useState<boolean>(() =>
    calculateDistanceFromApnaBazarKm(selectedCoords[0], selectedCoords[1]) <= DELIVERY_CIRCLE_RADIUS_KM
  );

  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress>(() => {
    const code = computePlusCodeFast(selectedCoords[0], selectedCoords[1]);
    return {
      plusCode: code,
      road: 'Baharagora Main Road',
      locality: 'Baharagora',
      village: 'Baharagora',
      city: 'Baharagora',
      landmark: 'Near Apna Bazar, Dadu Complex',
      nearby: 'Near Apna Bazar',
      state: 'Jharkhand',
      pincode: '832101',
      fullFormatted: `${code}, Baharagora Main Road, Baharagora, Jharkhand - 832101`,
    };
  });

  // Fast Reverse Geocode on every pin drag, drop, tap, or GPS click
  const fetchLiveAddressForCoords = useCallback(async (lat: number, lon: number) => {
    const dist = calculateDistanceFromApnaBazarKm(lat, lon);
    const inside = dist <= DELIVERY_CIRCLE_RADIUS_KM;
    setDistanceKm(dist);
    setIsInside10Km(inside);

    setIsGeocoding(true);
    try {
      const data = await fastReverseGeocode(lat, lon);
      setStructuredAddress({
        plusCode: data.plusCode,
        road: data.road,
        locality: data.locality,
        village: data.village,
        city: data.city,
        landmark: data.landmark,
        nearby: data.landmark,
        state: data.state,
        pincode: data.pincode,
        fullFormatted: data.fullFormatted,
      });
      setDistanceKm(data.distanceKm);
      setIsInside10Km(data.isInside10Km);
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Update coordinates and center directly on user's EXACT location at street level (zoom 17)
  const updateCoordinates = useCallback((lat: number, lng: number, panMap = false, isLiveGps = false) => {
    const newCoords: [number, number] = [lat, lng];
    setSelectedCoords(newCoords);
    const dist = calculateDistanceFromApnaBazarKm(lat, lng);
    const inside = dist <= DELIVERY_CIRCLE_RADIUS_KM;
    const instantPlusCode = computePlusCodeFast(lat, lng);
    setDistanceKm(dist);
    setIsInside10Km(inside);
    setStructuredAddress((prev) => ({
      ...prev,
      plusCode: instantPlusCode,
    }));

    try {
      localStorage.setItem('ab_is_inside_10km', inside ? 'true' : 'false');
      localStorage.setItem('ab_distance_km', String(dist));
    } catch {}

    if (markerRef.current) {
      markerRef.current.setLatLng(newCoords);
    }
    if (isLiveGps && gpsDotRef.current) {
      gpsDotRef.current.setLatLng(newCoords);
      gpsDotRef.current.setOpacity(1);
    }
    if (panMap && mapInstanceRef.current) {
      // Center directly on the exact coordinates at zoom 17 (street/house level, matching Google Maps)
      mapInstanceRef.current.setView(newCoords, 17, { animate: true });
    }

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([APNA_BAZAR_COORDS, newCoords]);
      routeLineRef.current.setStyle({
        color: inside ? '#2563eb' : '#dc2626',
      });
    }
    if (routeGlowRef.current) {
      routeGlowRef.current.setLatLngs([APNA_BAZAR_COORDS, newCoords]);
      routeGlowRef.current.setStyle({
        color: inside ? '#93c5fd' : '#fca5a5',
      });
    }

    fetchLiveAddressForCoords(lat, lng);
  }, [fetchLiveAddressForCoords]);

  // 1-Click Fast (< 2s) Exact Live GPS Fetch
  const handleDetectGPS = useCallback(async () => {
    setDetecting(true);
    setGpsSuccessBanner(null);

    try {
      const coords = await getFastRealCoordinates();
      setDetecting(false);
      updateCoordinates(coords.lat, coords.lng, true, true);
      setGpsSuccessBanner(
        `✓ Live GPS Locked (${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E)`
      );
      setTimeout(() => setGpsSuccessBanner(null), 4000);
    } catch {
      setDetecting(false);
      setGpsSuccessBanner('⚠️ Please allow GPS permission in browser or tap on map');
      setTimeout(() => setGpsSuccessBanner(null), 3500);
    }
  }, [updateCoordinates]);

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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize Map with Google Maps Tiles & Exact Live GPS Centering
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    startLiveGpsWatcher();

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let resizeObserver: ResizeObserver | null = null;

    try {
      const cachedFix = getLatestCachedGpsFix();
      const startCoords: [number, number] = cachedFix
        ? [cachedFix.lat, cachedFix.lng]
        : selectedCoords;

      const initDist = calculateDistanceFromApnaBazarKm(startCoords[0], startCoords[1]);
      const initInside = initDist <= DELIVERY_CIRCLE_RADIUS_KM;

      const map = L.map(mapContainerRef.current, {
        center: startCoords,
        zoom: 17,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      const tileUrl = mapType === 'satellite'
        ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      L.tileLayer(tileUrl, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        tileSize: 256,
        keepBuffer: 6,
        updateWhenIdle: false,
        updateWhenZooming: true,
      }).addTo(map);

      const syncSize = () => {
        try {
          map.invalidateSize({ animate: false });
        } catch {}
      };
      syncSize();
      setTimeout(syncSize, 80);
      setTimeout(syncSize, 250);
      setTimeout(syncSize, 500);

      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => syncSize());
        resizeObserver.observe(mapContainerRef.current);
      }

      // 1. Apna Bazar Store Marker ("🏬 APNA BAZAR")
      const storeIcon = L.divIcon({
        className: 'apna-bazar-pin',
        html: `
          <div style="background:#0f172a; color:#f59e0b; padding:3px 10px; border-radius:10px; border:2px solid #f59e0b; font-weight:900; font-size:10px; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.35); display:flex; align-items:center; gap:4px;">
            🏬 APNA BAZAR
          </div>
        `,
        iconSize: [104, 28],
        iconAnchor: [52, 28],
      });
      L.marker(APNA_BAZAR_COORDS, { icon: storeIcon }).addTo(map);

      // 2. 10 km Green Delivery Circle around Apna Bazar
      L.circle(APNA_BAZAR_COORDS, {
        radius: DELIVERY_CIRCLE_RADIUS_KM * 1000,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 2.5,
        dashArray: '6, 6',
      }).addTo(map);

      // 3. Shortest Distance Route Line from Apna Bazar to Dropped Pin
      const routeGlow = L.polyline([APNA_BAZAR_COORDS, startCoords], {
        color: initInside ? '#93c5fd' : '#fca5a5',
        weight: 10,
        opacity: 0.6,
        lineCap: 'round',
      }).addTo(map);
      routeGlowRef.current = routeGlow;

      const routeLine = L.polyline([APNA_BAZAR_COORDS, startCoords], {
        color: initInside ? '#2563eb' : '#dc2626',
        weight: 4.5,
        opacity: 0.98,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);
      routeLineRef.current = routeLine;

      // 4. Google Maps Style Pulsing Blue Live GPS Dot
      const blueDotIcon = L.divIcon({
        className: 'google-gps-blue-dot',
        html: `
          <div style="position:relative; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; inset:0; background:rgba(37,99,235,0.28); border-radius:9999px; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:14px; height:14px; background:#2563eb; border:2.5px solid #ffffff; border-radius:9999px; box-shadow:0 2px 6px rgba(37,99,235,0.6);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const gpsDot = L.marker(startCoords, {
        icon: blueDotIcon,
        interactive: false,
        opacity: cachedFix ? 1 : 0,
      }).addTo(map);
      gpsDotRef.current = gpsDot;

      // 5. Droppable / Draggable Customer Pin
      const pinIcon = L.divIcon({
        className: 'delivery-point-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="width:40px; height:40px; background:#ea580c; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #ffffff; box-shadow:0 6px 18px rgba(234,88,12,0.55);">
              <span style="transform:rotate(45deg); color:#ffffff; font-size:18px;">📍</span>
            </div>
            <div style="background:#0f172a; color:#fb923c; font-size:9px; font-weight:900; padding:2px 7px; border-radius:8px; margin-top:2px; white-space:nowrap; border:1px solid #ea580c; box-shadow:0 2px 6px rgba(0,0,0,0.35);">
              My Location
            </div>
          </div>
        `,
        iconSize: [40, 56],
        iconAnchor: [20, 52],
      });

      const pinMarker = L.marker(startCoords, {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = pinMarker;

      pinMarker.on('drag', () => {
        const pos = pinMarker.getLatLng();
        const d = calculateDistanceFromApnaBazarKm(pos.lat, pos.lng);
        const ok = d <= DELIVERY_CIRCLE_RADIUS_KM;
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([APNA_BAZAR_COORDS, pos]);
          routeLineRef.current.setStyle({ color: ok ? '#2563eb' : '#dc2626' });
        }
        if (routeGlowRef.current) {
          routeGlowRef.current.setLatLngs([APNA_BAZAR_COORDS, pos]);
          routeGlowRef.current.setStyle({ color: ok ? '#93c5fd' : '#fca5a5' });
        }
      });

      pinMarker.on('dragend', () => {
        const pos = pinMarker.getLatLng();
        updateCoordinates(pos.lat, pos.lng, false, false);
      });

      map.on('click', (e) => {
        pinMarker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng, false, false);
      });

      // Immediately fetch live hardware GPS when modal opens so it always shows user's real location
      updateCoordinates(startCoords[0], startCoords[1], true, Boolean(cachedFix));
      getFastRealCoordinates()
        .then((c) => {
          updateCoordinates(c.lat, c.lng, true, true);
        })
        .catch(() => {});
    } catch (e) {
      console.warn('Map initialization error:', e);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, mapType]);

  const toggleMapType = () => {
    setMapType((prev) => (prev === 'roadmap' ? 'satellite' : 'roadmap'));
  };

  const handleSelectSuggestion = (loc: PlaceSuggestion) => {
    setSearchQuery(loc.name);
    setShowSuggestions(false);
    updateCoordinates(loc.coords[0], loc.coords[1], true, false);
  };

  const handleConfirmLocation = () => {
    if (!isInside10Km) {
      return;
    }

    try {
      localStorage.setItem('ab_location_verified', 'true');
      localStorage.setItem('ab_delivery_location', structuredAddress.fullFormatted);
      localStorage.setItem('ab_selected_pincode', structuredAddress.pincode);
      localStorage.setItem('ab_user_coords', JSON.stringify({ lat: selectedCoords[0], lng: selectedCoords[1] }));
      localStorage.setItem('ab_is_inside_10km', 'true');
      localStorage.setItem('ab_distance_km', String(distanceKm));
    } catch {}

    onConfirmPincode(structuredAddress.pincode || '832101', structuredAddress.fullFormatted, true);
    onClose();
  };

  if (!isOpen) return null;

  const googleMapsExactUrl = `https://www.google.com/maps/search/?api=1&query=${selectedCoords[0]},${selectedCoords[1]}`;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-lg max-h-[92dvh] rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="px-3.5 py-3 bg-slate-950 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>Set Delivery Location (10-KM Circle)</span>
              </h3>
              <p className="text-[10px] text-amber-300 font-medium truncate">
                Apna Bazar • 10-KM Green Circle Doorstep Delivery
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Search & 1-Click Use Current Location Bar */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 relative shrink-0 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search village, road or area..."
                className="w-full pl-8 pr-6 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-amber-500"
              />
              {isSearchingOnline && (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-2 top-2" />
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detecting}
              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-75 shadow-sm"
            >
              <Navigation className={`w-3.5 h-3.5 fill-current ${detecting ? 'animate-spin' : ''}`} />
              <span>{detecting ? 'Fetching...' : 'Use Current Location'}</span>
            </button>

            <button
              type="button"
              onClick={toggleMapType}
              className="py-1.5 px-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              title="Toggle Map Style"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>

          {gpsSuccessBanner && (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-black text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{gpsSuccessBanner}</span>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-2.5 right-2.5 z-[1200] bg-white rounded-xl shadow-xl border border-slate-200 mt-1 max-h-44 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
              {suggestions.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full p-2 text-left hover:bg-amber-50 flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs text-slate-900 truncate">{loc.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">
                      {loc.city ? `${loc.city}, ` : ''}{loc.state} • {loc.pincode}
                    </span>
                  </div>
                  {loc.distanceKm !== undefined && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                        loc.distanceKm <= 10
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {loc.distanceKm} km
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Scrollable Middle Content (Map + Live Address & Circle Eligibility Card) */}
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-200">
          {/* Interactive Map */}
          <div className="relative w-full h-52 sm:h-60 bg-slate-100 overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Top Floating Zone Status Badge */}
            <div className="absolute top-2 left-2 right-2 z-[1000] pointer-events-none flex justify-center">
              {isInside10Km ? (
                <div className="bg-emerald-600/95 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center gap-1.5 text-[11px] font-black">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>✓ Inside 10-KM Circle ({distanceKm} km) • Delivery Available</span>
                </div>
              ) : (
                <div className="bg-red-600/95 backdrop-blur-xs text-white px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center gap-1.5 text-[11px] font-black animate-pulse">
                  <Ban className="w-3.5 h-3.5 shrink-0" />
                  <span>Outside 10-KM Circle ({distanceKm} km) • No Delivery</span>
                </div>
              )}
            </div>

            {/* Bottom Floating Hint */}
            <div className="absolute bottom-2 left-2 z-[1000] pointer-events-none">
              <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/10 flex items-center gap-1">
                <span>📍 Tap anywhere or drag pin</span>
                {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />}
              </span>
            </div>
          </div>

          {/* Selected Pin Address & Circle Area Verification */}
          <div className="p-3 bg-white space-y-2 text-left">
            {/* Strict Out-of-Circle Warning Banner */}
            {!isInside10Km && (
              <div className="p-2.5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-2 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-snug">
                    <p className="font-black text-red-700">
                      ❌ Delivery Not Available Outside 10-KM Circle ({distanceKm} km)
                    </p>
                    <p className="font-semibold text-red-800 mt-0.5 text-[11px]">
                      सर्कल एरिया (10 KM) से बाहर डिलीवरी नहीं होगी। कृपया मैप में ग्रीन सर्कल के अंदर पिन ड्रॉप करें।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateCoordinates(APNA_BAZAR_COORDS[0], APNA_BAZAR_COORDS[1], true, false)}
                  className="w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Move Pin Inside 10-KM Circle (Apna Bazar)</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Exact GPS Location</span>
              </span>
              <div className="flex items-center gap-1.5">
                <a
                  href={googleMapsExactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-[11px] font-black font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  PIN: {structuredAddress.pincode}
                </span>
              </div>
            </div>

            <p className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
              {structuredAddress.fullFormatted}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] font-black text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                  Code: {structuredAddress.plusCode}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  GPS: {selectedCoords[0].toFixed(5)}°N, {selectedCoords[1].toFixed(5)}°E
                </span>
              </div>
              <span className="text-slate-600 font-bold">
                Distance: <strong className="text-slate-950 font-black">{distanceKm} km</strong> from Apna Bazar
              </span>
            </div>
          </div>
        </div>

        {/* 4. STICKY BOTTOM CTA FOOTER — Always 100% Visible on Screen */}
        <div className="p-3 bg-slate-50 border-t-2 border-amber-400 shrink-0 z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!isInside10Km}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isInside10Km
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-slate-950 cursor-pointer border-2 border-white shadow-orange-500/25'
                : 'bg-red-100 text-red-700 border-2 border-red-300 cursor-not-allowed opacity-95'
            }`}
          >
            {isInside10Km ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm Delivery Location ({distanceKm} km) / लोकेशन सेट करें</span>
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 stroke-[2.5] text-red-600 shrink-0" />
                <span>Outside 10-KM Circle — Delivery Not Available</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
