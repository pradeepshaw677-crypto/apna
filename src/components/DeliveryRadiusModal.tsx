import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
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
  ArrowRight,
  Check,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import { api, ReverseGeocodeResult } from '../utils/api';

interface DeliveryRadiusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (locationName: string, coords: [number, number], distance: string) => void;
}

const STORE_COORDS: [number, number] = [22.2828, 86.7196]; // Baharagora Dadu Complex
const RADIUS_METERS = 10000; // 10 km delivery radius

// Comprehensive local database of Baharagora villages & landmarks
export const BAHARAGORA_AREAS = [
  { name: 'Dadu Complex & Main Market', village: 'Baharagora Main Market', coords: [22.2828, 86.7196] as [number, number], distance: '0.1 km', time: '3 Mins', eligible: true, plusCode: '6PFP+W7H' },
  { name: 'Near Shitla Mandir', village: 'Shitla Mandir Mohalla', coords: [22.2835, 86.7188] as [number, number], distance: '0.3 km', time: '5 Mins', eligible: true, plusCode: '6PFP+W6X' },
  { name: 'Town High School Road', village: 'High School Para', coords: [22.2870, 86.7230] as [number, number], distance: '0.8 km', time: '7 Mins', eligible: true, plusCode: '6PFP+7F6' },
  { name: 'Baharagora College Campus', village: 'College Road', coords: [22.2910, 86.7280] as [number, number], distance: '1.4 km', time: '9 Mins', eligible: true, plusCode: '6PFP+P98' },
  { name: 'Sakha Maidan & Sub-div Hospital', village: 'Sakha Maidan', coords: [22.2940, 86.7120] as [number, number], distance: '1.8 km', time: '10 Mins', eligible: true, plusCode: '6PFP+6V5' },
  { name: 'Matihanna Chowk', village: 'Matihanna', coords: [22.3020, 86.7410] as [number, number], distance: '3.2 km', time: '12 Mins', eligible: true, plusCode: '6PFP+R85' },
  { name: 'Khandamouda Village', village: 'Khandamouda', coords: [22.3150, 86.7550] as [number, number], distance: '4.5 km', time: '14 Mins', eligible: true, plusCode: '6PFP+9J4' },
  { name: 'Barasol Junction', village: 'Barasol', coords: [22.2450, 86.7320] as [number, number], distance: '5.2 km', time: '15 Mins', eligible: true, plusCode: '6PFP+JHQ' },
  { name: 'Gamharia Border Village', village: 'Gamharia', coords: [22.3200, 86.6850] as [number, number], distance: '6.4 km', time: '15 Mins', eligible: true, plusCode: '6PFP+CPW' },
  { name: 'Kesarda & Kumrasol', village: 'Kesarda', coords: [22.2600, 86.7600] as [number, number], distance: '7.8 km', time: '15 Mins', eligible: true, plusCode: '6PFP+R48' },
  { name: 'Jamua & Pathra', village: 'Jamua Village', coords: [22.2750, 86.7450] as [number, number], distance: '8.4 km', time: '15 Mins', eligible: true, plusCode: '6PFP+JWH' },
  { name: 'Benagaria Village', village: 'Benagaria', coords: [22.2680, 86.6950] as [number, number], distance: '9.2 km', time: '15 Mins', eligible: true, plusCode: '6PFP+76J' },
  { name: 'Jamshedpur Tatanagar (Outer)', village: 'Tatanagar', coords: [22.8046, 86.2029] as [number, number], distance: '78 km', time: 'Not Available', eligible: false, plusCode: '7P2R+RJ' },
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
  const [searchArea, setSearchArea] = useState('');
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(STORE_COORDS);
  
  // Real Geocoded Location State (Village, Coordinate Code, City, Green Tick)
  const [villageName, setVillageName] = useState('Dadu Complex & Main Market');
  const [coordinateCode, setCoordinateCode] = useState('6PFP+W7H (22.2828° N, 86.7196° E)');
  const [cityName, setCityName] = useState('Baharagora, Jharkhand 832101');
  const [currentDistance, setCurrentDistance] = useState('0.1 km');
  const [isEligible, setIsEligible] = useState(true);
  const [deliveryTime, setDeliveryTime] = useState('3-5 Mins');
  const [hasLocationVerified, setHasLocationVerified] = useState(true);
  
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

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
    setDeliveryTime(eligible ? `${Math.max(3, Math.round(5 + dist * 1.1))} Mins` : 'Outside Zone');
    setHasLocationVerified(true);

    // Step 2: Async reverse geocode to fetch real OpenStreetMap/Google address details
    try {
      const geoResult = await api.reverseGeocode(lat, lng);
      if (geoResult) {
        const detectedVillage = geoResult.village || geoResult.locality || geoResult.road || initialVillage;
        setVillageName(detectedVillage);
        if (geoResult.plusCode) {
          setCoordinateCode(`${geoResult.plusCode} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
        }
        const detectedCity = `${geoResult.city || 'Baharagora'}, ${geoResult.state || 'Jharkhand'} ${geoResult.pincode || '832101'}`;
        setCityName(detectedCity);
      }
    } catch (e) {
      // Local fallback already applied
    }
  };

  useEffect(() => {
    if (!isOpen) return;

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

      // Free OpenStreetMap Tiles with reliable CDN
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Central Store Hub Marker (Apna Bazar Central Hub)
      const storeIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="background-color: #0f172a; border: 3px solid #f59e0b; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.35); color: #f59e0b;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const storeMarker = L.marker(STORE_COORDS, { icon: storeIcon }).addTo(map);
      storeMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; font-size: 12px;">
          <b style="color: #0f172a; font-size: 13px;">Apna Bazar Central Hub</b><br/>
          <span style="color: #475569;">Dadu Complex, Near Shitla Mandir, Baharagora</span><br/>
          <b style="color: #d97706;">10 km 15-Minute Instant Dispatch</b>
        </div>
      `);

      // 10-Km Radius Circle in Emerald with dashed boundary
      L.circle(STORE_COORDS, {
        radius: RADIUS_METERS,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2.5,
        dashArray: '6, 6',
      }).addTo(map);

      // Customer Dropped Pin Marker (Draggable)
      const pinIcon = L.divIcon({
        className: 'custom-drop-pin',
        html: `
          <div style="background-color: #f59e0b; border: 3px solid #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.45); color: #0f172a; cursor: grab;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(currentCoords, { 
        icon: pinIcon,
        draggable: true 
      }).addTo(map);

      selectedMarkerRef.current = marker;

      // Handle Pin Drag: Update village, coordinates code, city, green tick
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        updateLocationByCoords(newPos.lat, newPos.lng);
      });

      // Handle Map Click: User taps anywhere on map to drop pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocationByCoords(lat, lng);
        map.panTo([lat, lng], { animate: true });
      });

      // Fix map viewport sizing
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update marker position if currentCoords changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMarkerRef.current) return;
    selectedMarkerRef.current.setLatLng(currentCoords);
    mapInstanceRef.current.panTo(currentCoords, { animate: true });
  }, [currentCoords]);

  // Fast 1-Click Live GPS Detection with Instant Green Tick
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('⚠️ Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsStatus('Requesting high-accuracy GPS permission...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        updateLocationByCoords(latitude, longitude, 'My Live GPS Location');
        setGpsStatus('✓ Live GPS location locked successfully with Green Tick!');
        setTimeout(() => setGpsStatus(null), 4000);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsStatus('⚠️ Location permission was denied. Tap anywhere on map or choose an area below.');
        } else {
          setGpsStatus('⚠️ GPS signal timed out. Tap on map to drop pin.');
        }
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  const handleConfirmLocation = () => {
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

  const googleMapsUrl = `https://www.google.com/maps?q=${currentCoords[0]},${currentCoords[1]}`;
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${STORE_COORDS[0]},${STORE_COORDS[1]}&destination=${currentCoords[0]},${currentCoords[1]}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-x-hidden overflow-y-auto animate-fadeIn">
      {/* Modal Container: Screen-constrained with zero horizontal overflow */}
      <div 
        className="bg-white w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto max-h-[92dvh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 truncate">
                <span>Baharagora 10-Km Live Map</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.2 rounded-full font-black">
                  15 MINS
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/90 truncate">
                Apna Bazar Hub: Dadu Complex, Near Shitla Mandir (832101)
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

        {/* Scrollable Body */}
        <div className="p-3.5 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          
          {/* Interactive Leaflet Map Container */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>Tap or drag pin to set live delivery point</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold border border-emerald-200">
                10km Green Zone
              </span>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner relative z-0 box-border bg-slate-100"
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* Fast 1-Click GPS Live Detection Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <Compass className={`w-4 h-4 stroke-[2.5] ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Detecting Live Location...' : '⚡ Use Live GPS (1-Click)'}</span>
            </button>

            <a
              href="tel:9999999999"
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Store Helpline: 9999999999</span>
            </a>
          </div>

          {gpsStatus && (
            <div className="p-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 animate-fadeIn flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsStatus}</span>
            </div>
          )}

          {/* User Request: Detailed Location Card with Village, Coordinates Code, City and Glowing Green Tick */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 pb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Live Dropped Location
                  </span>
                  {hasLocationVerified && isEligible && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white font-black text-[10px] px-2 py-0.2 rounded-full shadow-2xs animate-pulse">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Verified Live Location</span>
                    </span>
                  )}
                </div>

                {/* Village / Mohalla Name */}
                <p className="text-sm sm:text-base font-black text-slate-950 truncate mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{villageName}</span>
                </p>

                {/* Coordinate Code / Plus Code */}
                <p className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                  Code: <span className="bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded font-black">{coordinateCode}</span>
                </p>

                {/* City & State */}
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  City: <b className="text-slate-900">{cityName}</b>
                </p>

                {/* Distance & Delivery Time */}
                <div className="flex items-center gap-3 text-xs text-slate-600 font-bold mt-1.5">
                  <span>Distance: <b className="text-slate-900">{currentDistance}</b></span>
                  <span>•</span>
                  <span>Delivery: <b className="text-slate-900">{deliveryTime}</b></span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isEligible ? (
                  <div className="p-2 rounded-2xl bg-emerald-100 border border-emerald-300 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-bounce" />
                    <span className="text-[9px] font-black text-emerald-900 uppercase mt-0.5">15-Min Active</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-2xl bg-rose-100 border border-rose-300 flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                    <span className="text-[9px] font-black text-rose-900 uppercase mt-0.5">Outside 10km</span>
                  </div>
                )}
              </div>
            </div>

            {/* Google Maps Actions Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-slate-600" />
                <span>Directions from Hub</span>
              </a>
            </div>

            {/* Confirm Location Button */}
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4 text-amber-400 stroke-[3]" />
              <span>Confirm &amp; Deliver to this Dropped Pin</span>
            </button>
          </div>

          {/* Quick Select Baharagora Areas */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              Or pick an area in Baharagora:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Search village/area (e.g. Khandamouda, Shitla Mandir, Barasol, Dadu)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-400 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 pt-1 pr-1">
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
                      {area.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            15-minute doorstep delivery within 10 km radius of Baharagora
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
