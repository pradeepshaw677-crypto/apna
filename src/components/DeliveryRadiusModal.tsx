import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Navigation, 
  Phone,
  Compass,
  ArrowRight,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Route
} from 'lucide-react';
import L from 'leaflet';
import { getFastRealCoordinates, fastReverseGeocode } from '../utils/fastGps';

interface DeliveryRadiusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (locationName: string, coords: [number, number], distance: string) => void;
}

// Apna Bazar Center verified Google Maps location:
// https://maps.app.goo.gl/tWAwLEFvWePRQNSC8?g_st=ac
// Apka Apna Bazar, Dadu Complex, Baharagora Main Rd, Market, Baharagora, Jharkhand 832101
export const APNA_BAZAR_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/tWAwLEFvWePRQNSC8?g_st=ac';
const STORE_COORDS: [number, number] = [22.2828, 86.7196]; // Baharagora Dadu Complex
const RADIUS_METERS = 10000; // 10 km delivery radius

// Comprehensive local database of Baharagora villages & landmarks
export const BAHARAGORA_AREAS = [
  { name: 'Dadu Complex & Main Market', village: 'Baharagora Main Market', coords: [22.2828, 86.7196] as [number, number], distance: '0.1 km', badge: 'Apna Bazar', eligible: true, plusCode: '6PFP+W7H' },
  { name: 'Near Shitla Mandir', village: 'Shitla Mandir Mohalla', coords: [22.2835, 86.7188] as [number, number], distance: '0.3 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+W6X' },
  { name: 'Town High School Road', village: 'High School Para', coords: [22.2870, 86.7230] as [number, number], distance: '0.8 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+7F6' },
  { name: 'Baharagora College Campus', village: 'College Road', coords: [22.2910, 86.7280] as [number, number], distance: '1.4 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+P98' },
  { name: 'Sakha Maidan & Sub-div Hospital', village: 'Sakha Maidan', coords: [22.2940, 86.7120] as [number, number], distance: '1.8 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+6V5' },
  { name: 'Matihanna Chowk', village: 'Matihanna', coords: [22.3020, 86.7410] as [number, number], distance: '3.2 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+R85' },
  { name: 'Khandamouda Village', village: 'Khandamouda', coords: [22.3150, 86.7550] as [number, number], distance: '4.5 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+9J4' },
  { name: 'Barasol Junction', village: 'Barasol', coords: [22.2450, 86.7320] as [number, number], distance: '5.2 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+JHQ' },
  { name: 'Gamharia Border Village', village: 'Gamharia', coords: [22.3200, 86.6850] as [number, number], distance: '6.4 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+CPW' },
  { name: 'Kesarda & Kumrasol', village: 'Kesarda', coords: [22.2600, 86.7600] as [number, number], distance: '7.8 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+R48' },
  { name: 'Jamua & Pathra', village: 'Jamua Village', coords: [22.2750, 86.7450] as [number, number], distance: '8.4 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+JWH' },
  { name: 'Benagaria Village', village: 'Benagaria', coords: [22.2680, 86.6950] as [number, number], distance: '9.2 km', badge: 'Fast Delivery', eligible: true, plusCode: '6PFP+76J' },
  { name: 'Jamshedpur Tatanagar (Outer)', village: 'Tatanagar', coords: [22.8046, 86.2029] as [number, number], distance: '78 km', badge: 'Outside 10km', eligible: false, plusCode: '7P2R+RJ' },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute Plus Code algorithmically
function computePlusCode(lat: number, lng: number): string {
  const ALPHABET = "23456789CFGHJMPQRVWX";
  let normalLat = Math.min(Math.max(lat, -90), 90) + 90;
  let normalLng = lng;
  while (normalLng < -180) normalLng += 360;
  while (normalLng >= 180) normalLng -= 360;
  normalLng += 180;

  const charAt = (v: number) => ALPHABET[Math.min(ALPHABET.length - 1, Math.max(0, Math.floor(v)))] || "C";
  normalLat %= 20;
  normalLng %= 20;
  const d1 = charAt(normalLat);
  const d2 = charAt(normalLng);
  normalLat %= 1;
  normalLng %= 1;
  const d3 = charAt(normalLat / 0.05);
  const d4 = charAt(normalLng / 0.05);
  normalLat %= 0.05;
  normalLng %= 0.05;
  const d5 = charAt(normalLat / 0.0025);
  const d6 = charAt(normalLng / 0.0025);
  return `${d1}${d2}${d3}${d4}+${d5}${d6}`;
}

export const DeliveryRadiusModal: React.FC<DeliveryRadiusModalProps> = ({ 
  isOpen, 
  onClose,
  onSelectLocation 
}) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'google-iframe'>('interactive');
  const [searchArea, setSearchArea] = useState('');
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(STORE_COORDS);
  
  // Real Geocoded Location State (Village, Coordinate Code, City, Green Tick)
  const [villageName, setVillageName] = useState('Dadu Complex & Main Market');
  const [coordinateCode, setCoordinateCode] = useState('6PFP+W7H (22.2828° N, 86.7196° E)');
  const [cityName, setCityName] = useState('Baharagora, Jharkhand 832101');
  const [currentDistance, setCurrentDistance] = useState('0.1 km');
  const [isEligible, setIsEligible] = useState(true);
  const [hasLocationVerified, setHasLocationVerified] = useState(true);
  
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Instant local lookup + Async backend reverse geocode
  const updateLocationByCoords = async (lat: number, lng: number, customVillage?: string) => {
    const dist = calculateDistanceKm(STORE_COORDS[0], STORE_COORDS[1], lat, lng);
    const eligible = dist <= 10.0;
    const computedCode = computePlusCode(lat, lng);
    const coordString = `${computedCode} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;

    // Step 1: Immediate local lookup (0ms instantaneous feedback)
    let initialVillage = customVillage;
    if (!initialVillage) {
      let nearestDist = Infinity;
      let nearestName = `Pin Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      for (const area of BAHARAGORA_AREAS) {
        const d = calculateDistanceKm(lat, lng, area.coords[0], area.coords[1]);
        if (d < nearestDist && d < 1.2) {
          nearestDist = d;
          nearestName = area.name;
        }
      }
      initialVillage = nearestName;
    }

    setCurrentCoords([lat, lng]);
    setVillageName(initialVillage);
    setCoordinateCode(coordString);
    setCityName(dist <= 10 ? 'Baharagora, Jharkhand 832101' : 'Outer Region (Jharkhand)');
    setCurrentDistance(`${dist.toFixed(1)} km`);
    setIsEligible(eligible);
    setHasLocationVerified(true);

    // Step 2: Fast <1.5s reverse geocode
    try {
      const geoResult = await fastReverseGeocode(lat, lng);
      if (geoResult) {
        const detectedVillage = geoResult.village || geoResult.locality || geoResult.road || initialVillage;
        setVillageName(detectedVillage);
        if (geoResult.plusCode) {
          setCoordinateCode(`${geoResult.plusCode} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
        }
        const detectedCity = `${geoResult.city || 'Baharagora'}, ${geoResult.state || 'Jharkhand'} ${geoResult.pincode || '832101'}`;
        setCityName(detectedCity);
      }
    } catch {
      // Local fallback already applied
    }
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'interactive') return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map bounded cleanly inside container
      const map = L.map(mapContainerRef.current, {
        center: currentCoords,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // High-Res Google Maps Roadmap Layer
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        keepBuffer: 6,
      }).addTo(map);

      // Central Store Hub Marker (Apna Bazar Central Hub)
      const storeIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="background-color: #0f172a; border: 3px solid #f59e0b; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.45); color: #f59e0b;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const storeMarker = L.marker(STORE_COORDS, { icon: storeIcon }).addTo(map);
      storeMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; font-size: 12px;">
          <b style="color: #0f172a; font-size: 13px;">Apna Bazar</b><br/>
          <span style="color: #475569;">Dadu Complex, Baharagora Main Rd (832101)</span><br/>
          <b style="color: #2563eb;">Official Store &amp; Fulfillment Center</b>
        </div>
      `);

      // 10-Km Radius Circle in Emerald with dashed boundary
      L.circle(STORE_COORDS, {
        radius: RADIUS_METERS,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 2.5,
        dashArray: '6, 6',
      }).addTo(map);

      // User Request: Direction Blue Line connecting Apna Bazar Hub and Customer Location
      const blueLine = L.polyline([STORE_COORDS, currentCoords], {
        color: '#2563eb', // Royal Blue direction line
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = blueLine;

      // Customer Dropped Pin Marker (Draggable)
      const pinIcon = L.divIcon({
        className: 'custom-drop-pin',
        html: `
          <div style="background-color: #2563eb; border: 3px solid #ffffff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(37,99,235,0.6); color: #ffffff; cursor: grab;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker(currentCoords, { 
        icon: pinIcon,
        draggable: true 
      }).addTo(map);

      selectedMarkerRef.current = marker;

      // Handle Pin Drag: Update village, coordinates code, city, green tick, and blue route line
      marker.on('drag', (e) => {
        const newPos = e.target.getLatLng();
        if (routePolylineRef.current) {
          routePolylineRef.current.setLatLngs([STORE_COORDS, [newPos.lat, newPos.lng]]);
        }
      });

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        updateLocationByCoords(newPos.lat, newPos.lng);
        if (routePolylineRef.current) {
          routePolylineRef.current.setLatLngs([STORE_COORDS, [newPos.lat, newPos.lng]]);
        }
      });

      // Handle Map Click: User taps anywhere on map to drop pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        if (routePolylineRef.current) {
          routePolylineRef.current.setLatLngs([STORE_COORDS, [lat, lng]]);
        }
        updateLocationByCoords(lat, lng);
        map.panTo([lat, lng], { animate: true });
      });

      // Center directly on the customer's exact coordinates at street level (zoom 17)
      map.setView(currentCoords, 17, { animate: false });

      // Fix map viewport sizing
      map.invalidateSize();

      // Auto-fetch live hardware GPS when modal opens
      getFastRealCoordinates()
        .then((c) => {
          updateLocationByCoords(c.lat, c.lng);
        })
        .catch(() => {});
    }, 120);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, activeTab]);

  // Update marker position and zoom to street level (zoom 17) if currentCoords changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMarkerRef.current) return;
    selectedMarkerRef.current.setLatLng(currentCoords);
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs([STORE_COORDS, currentCoords]);
    }
    mapInstanceRef.current.setView(currentCoords, 17, { animate: true });
  }, [currentCoords]);

  // Fast <2s 1-Click Live GPS Detection
  const handleUseGps = async () => {
    setGpsLoading(true);
    setGpsStatus('Fetching your real location...');

    try {
      const coords = await getFastRealCoordinates();
      setGpsLoading(false);
      await updateLocationByCoords(coords.lat, coords.lng);
      setGpsStatus('✓ Real Current Location Fetched!');
      setTimeout(() => setGpsStatus(null), 3500);
    } catch {
      setGpsLoading(false);
      setGpsStatus('⚠️ Tap anywhere on the map to drop your pin.');
      setTimeout(() => setGpsStatus(null), 3500);
    }
  };

  const handleConfirmLocation = () => {
    if (!isEligible) {
      return;
    }
    try {
      localStorage.setItem('ab_location_verified', 'true');
      localStorage.setItem('ab_delivery_location', `${villageName}, ${cityName}`);
      localStorage.setItem('ab_user_coords', JSON.stringify({ lat: currentCoords[0], lng: currentCoords[1] }));
      localStorage.setItem('ab_is_inside_10km', 'true');
    } catch {}
    if (onSelectLocation) {
      onSelectLocation(`${villageName}, ${cityName}`, currentCoords, currentDistance);
    }
    onClose();
  };

  if (!isOpen) return null;

  const filteredAreas = searchArea.trim()
    ? BAHARAGORA_AREAS.filter((a) =>
        a.name.toLowerCase().includes(searchArea.toLowerCase()) ||
        a.village.toLowerCase().includes(searchArea.toLowerCase())
      )
    : BAHARAGORA_AREAS;

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${STORE_COORDS[0]},${STORE_COORDS[1]}&destination=${currentCoords[0]},${currentCoords[1]}`;
  
  // Google Maps Iframe Embed with Dadu Complex Baharagora Hub
  const googleMapsIframeUrl = `https://maps.google.com/maps?q=Apka+Apna+Bazar,+Dadu+Complex,+Baharagora+Main+Rd,+Market,+Baharagora,+Jharkhand+832101&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-x-hidden overflow-y-auto animate-fadeIn">
      {/* Modal Container: Screen-constrained with zero horizontal overflow */}
      <div 
        className="bg-white w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400 flex flex-col my-auto max-h-[92dvh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 truncate">
                <span>Set Delivery Location (10-KM Circle)</span>
              </h3>
              <p className="text-[11px] text-amber-200/90 truncate">
                Apna Bazar, Dadu Complex, Baharagora Main Rd (832101)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close delivery map modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Interactive Map with Blue Route vs Official Google Maps Iframe */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 py-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('interactive')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive 10-KM Circle Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google-iframe')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'google-iframe'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Apna Bazar Map</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto min-h-0 flex-1">
          
          {/* TAB 1: Interactive Leaflet Map with Blue Direction Line */}
          {activeTab === 'interactive' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-blue-600 rounded-full inline-block"></span>
                  <span className="text-blue-900 font-black">Tap map or drag pin inside 10-KM Circle</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border ${
                  isEligible
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}>
                  {isEligible ? `✓ Inside 10km (${currentDistance})` : `✕ Outside 10km (${currentDistance})`}
                </span>
              </div>

              <div
                ref={mapContainerRef}
                className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner relative z-0 box-border bg-slate-100"
                style={{ minHeight: '210px' }}
              />
            </div>
          )}

          {/* TAB 2: Google Maps Official Screen (iframe) Embed */}
          {activeTab === 'google-iframe' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-900 font-black">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Apna Bazar Store Center (Google Maps Screen)</span>
                </span>
                <a
                  href={APNA_BAZAR_GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-700 hover:text-blue-800 font-extrabold flex items-center gap-1 underline"
                >
                  <span>Open in App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md relative bg-slate-100">
                <iframe
                  title="Apna Bazar Google Maps Center"
                  src={googleMapsIframeUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Out-of-Circle Strict Warning Banner */}
          {!isEligible && (
            <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <p className="font-black text-red-700">
                    ❌ Outside 10-KM Circle Area ({currentDistance}) — Delivery Not Available!
                  </p>
                  <p className="font-semibold text-red-800 mt-0.5 text-[11px]">
                    सर्कल एरिया (10 KM) से बाहर डिलीवरी उपलब्ध नहीं है। कृपया ग्रीन सर्कल के अंदर पिन ड्रॉप करें।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateLocationByCoords(STORE_COORDS[0], STORE_COORDS[1], 'Apna Bazar, Baharagora Main Market')}
                className="w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Move Pin Inside 10-KM Circle (Apna Bazar)</span>
              </button>
            </div>
          )}

          {/* Fast 1-Click GPS Live Detection Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Compass className={`w-4 h-4 stroke-[2.5] ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Fetching Location...' : '⚡ Use Current Location'}</span>
            </button>

            <a
              href={googleDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Directions from Apna Bazar</span>
            </a>
          </div>

          {gpsStatus && (
            <div className="p-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 animate-fadeIn flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsStatus}</span>
            </div>
          )}

          {/* Detailed Location Card */}
          <div className={`p-3 rounded-2xl border-2 shadow-xs space-y-2 ${
            isEligible ? 'bg-slate-50 border-emerald-200/80' : 'bg-red-50/40 border-red-200'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Dropped Pin Location
                  </span>
                  {hasLocationVerified && isEligible && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white font-black text-[10px] px-2 py-0.2 rounded-full shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Eligible</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-black text-slate-950 truncate mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{villageName}, {cityName}</span>
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-600 font-bold mt-1">
                  <span>Distance: <b className="text-slate-900">{currentDistance}</b></span>
                  <span>•</span>
                  <span className={isEligible ? 'text-emerald-700 font-black' : 'text-red-600 font-black'}>
                    {isEligible ? '✓ Doorstep Delivery Available' : '✕ Outside 10-KM Circle (No Delivery)'}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {isEligible ? (
                  <div className="p-2 rounded-2xl bg-emerald-100 border border-emerald-300 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-900 uppercase mt-0.5">Inside 10km</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-2xl bg-rose-100 border border-rose-300 flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span className="text-[9px] font-black text-rose-900 uppercase mt-0.5">Outside 10km</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Select Baharagora Areas */}
          <div className="space-y-1.5 pt-0.5">
            <label className="text-[11px] font-bold text-slate-600 block">
              Or pick a verified area inside 10-KM Baharagora Circle:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Search village/area (e.g. Khandamouda, Shitla Mandir, Barasol)..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-400 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 pt-1 pr-1">
              {filteredAreas.map((area, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    updateLocationByCoords(area.coords[0], area.coords[1], area.name);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer text-xs ${
                    villageName === area.name
                      ? 'bg-amber-100 border border-amber-300 font-black text-slate-950'
                      : 'bg-white hover:bg-slate-50 border border-slate-100 font-semibold text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${area.eligible ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="truncate">{area.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] shrink-0">
                    <span className="text-slate-500 font-bold">{area.distance}</span>
                    <span className={`px-1.5 py-0.2 rounded font-black ${area.eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {area.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Sticky Bottom Footer with Prominent Confirm Location CTA */}
        <div className="px-4 py-3 bg-slate-50 border-t-2 border-amber-400 shrink-0 z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!isEligible}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isEligible
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 cursor-pointer active:scale-98 border-2 border-white shadow-orange-500/25'
                : 'bg-red-100 text-red-700 border-2 border-red-300 cursor-not-allowed'
            }`}
          >
            {isEligible ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm Delivery Location ({currentDistance}) / लोकेशन सेट करें</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Outside 10-KM Circle — Delivery Not Available</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
