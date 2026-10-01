import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, X, ShieldCheck, ArrowRight, Sparkles, Compass } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onConfirmPincode: (pin: string, city: string, isJharkhand: boolean) => void;
}

// Baharagora Central Hub Coordinates
const BAHARAGORA_HUB: [number, number] = [22.2815, 86.7198];
const EXPRESS_RADIUS_KM = 10;

// Haversine formula to compute km between two coordinates
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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

  const [detecting, setDetecting] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([22.2865, 86.7265]);
  const [distanceKm, setDistanceKm] = useState<number>(0.9);
  const [isInside10Km, setIsInside10Km] = useState<boolean>(true);
  const [locationLabel, setLocationLabel] = useState<string>('Baharagora (Near Shitla Mandir / Dadu Complex)');

  // Initialize interactive Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const initialPos = selectedCoords;
      const map = L.map(mapContainerRef.current, {
        center: BAHARAGORA_HUB,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Invalidate size to guarantee crisp tile render inside modal
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {}
      }, 250);

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // 1. Apna Bazar Central Hub Marker
      const hubIcon = L.divIcon({
        className: 'hub-pin-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="background:#0f172a; color:#f59e0b; padding:5px 8px; border-radius:10px; border:2px solid #f59e0b; box-shadow:0 4px 12px rgba(245,158,11,0.5); font-weight:900; font-size:10px;">
              🏬 APNA BAZAR HUB
            </div>
            <span style="width:2px; height:6px; background:#f59e0b;"></span>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 36],
      });
      L.marker(BAHARAGORA_HUB, { icon: hubIcon }).addTo(map);

      // 2. 10 km Radius Circle around Baharagora Hub (User Request)
      const radiusCircle = L.circle(BAHARAGORA_HUB, {
        radius: EXPRESS_RADIUS_KM * 1000, // 10,000 meters
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.16,
        weight: 2.5,
        dashArray: '6, 6',
      }).addTo(map);
      circleRef.current = radiusCircle;

      // 3. User Draggable Pin Marker (User Request)
      const pinIcon = L.divIcon({
        className: 'user-delivery-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="width:38px; height:38px; background:linear-gradient(135deg, #ef4444, #b91c1c); color:#ffffff; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(239,68,68,0.5); border:3px solid #ffffff;">
              <span style="transform:rotate(45deg); font-size:16px;">📍</span>
            </div>
            <span style="background:#0f172a; color:#ffffff; font-size:9px; font-weight:900; padding:2px 6px; border-radius:6px; margin-top:2px; white-space:nowrap; border:1px solid #f59e0b;">
              Drop Pin Here
            </span>
          </div>
        `,
        iconSize: [40, 52],
        iconAnchor: [20, 48],
      });

      const pinMarker = L.marker(initialPos, {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = pinMarker;

      // Update position on drag
      const updateLocationByCoords = (lat: number, lng: number) => {
        setSelectedCoords([lat, lng]);
        const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], lat, lng);
        setDistanceKm(dist);
        const inside = dist <= EXPRESS_RADIUS_KM;
        setIsInside10Km(inside);

        if (dist <= 3) {
          setLocationLabel(`Baharagora Hub (${dist} km - 15m Express)`);
        } else if (inside) {
          setLocationLabel(`Baharagora Zone (${dist} km - Inside 10km Radius)`);
        } else {
          setLocationLabel(`Jharkhand Delivery (${dist} km from Baharagora Hub)`);
        }
      };

      pinMarker.on('dragend', () => {
        const pos = pinMarker.getLatLng();
        updateLocationByCoords(pos.lat, pos.lng);
      });

      // User click on map moves pin to clicked location
      map.on('click', (e: L.LeafletMouseEvent) => {
        pinMarker.setLatLng(e.latlng);
        updateLocationByCoords(e.latlng.lat, e.latlng.lng);
      });

      // Initial distance calculation
      updateLocationByCoords(initialPos[0], initialPos[1]);

    } catch (err) {
      console.warn("Leaflet location modal error:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // GPS Auto-detect handler
  const handleDetectGPS = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const { latitude, longitude } = pos.coords;

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
        }

        setSelectedCoords([latitude, longitude]);
        const dist = calculateDistanceKm(BAHARAGORA_HUB[0], BAHARAGORA_HUB[1], latitude, longitude);
        setDistanceKm(dist);
        const inside = dist <= EXPRESS_RADIUS_KM;
        setIsInside10Km(inside);

        if (dist <= 3) {
          setLocationLabel(`GPS Location: Baharagora (${dist} km)`);
        } else if (inside) {
          setLocationLabel(`GPS Location: Inside 10 km Zone (${dist} km)`);
        } else {
          setLocationLabel(`GPS Location: ${dist} km from Baharagora Hub`);
        }
      },
      (err) => {
        setDetecting(false);
        console.warn("GPS lookup handled:", err.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleConfirmLocation = () => {
    const isJharkhand = distanceKm <= 120; // Within realistic state range
    const cityString = isInside10Km 
      ? `Baharagora (${distanceKm} km)` 
      : `Baharagora Hub Area (${distanceKm} km)`;

    onConfirmPincode('832101', cityString, isJharkhand);
    onClose();
  };

  const handleResetToBaharagora = () => {
    const hubPos: [number, number] = [22.2865, 86.7265];
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng(hubPos);
      mapInstanceRef.current.setView(BAHARAGORA_HUB, 13, { animate: true });
    }
    setSelectedCoords(hubPos);
    setDistanceKm(0.9);
    setIsInside10Km(true);
    setLocationLabel('Baharagora Town (Dadu Complex / Shitla Mandir Area)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Set Delivery Location</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.2 rounded-full uppercase">
                  10 km Radius
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Drag the pin or click on map to set your doorstep delivery point
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

        {/* Live Interactive Map with 10 km Radius Circle */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-100 shrink-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Instructions & Radius Tag */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-amber-500/50 flex items-center gap-1.5 pointer-events-auto text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>10 km Baharagora Hub Circle</span>
            </div>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detecting}
              className="bg-white/95 hover:bg-amber-50 text-slate-900 border border-slate-300 px-3 py-1.5 rounded-full shadow-md text-xs font-black flex items-center gap-1.5 pointer-events-auto cursor-pointer active:scale-95 transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 text-amber-600 ${detecting ? 'animate-spin' : ''}`} />
              <span>{detecting ? 'Locating...' : '📍 My GPS'}</span>
            </button>
          </div>

          {/* Bottom Map Hint */}
          <div className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none text-center">
            <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-white/10">
              💡 Tip: Tap anywhere on map or drag red pin to set doorstep
            </span>
          </div>
        </div>

        {/* Details & Confirmation Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Distance and Service Zone Status Card */}
          <div className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition-colors ${
            isInside10Km 
              ? 'bg-amber-50/90 border-amber-400 text-slate-900' 
              : 'bg-slate-50 border-slate-300 text-slate-700'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${isInside10Km ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'}`}>
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wide">
                  {isInside10Km ? '✓ Inside Express 15-Min Delivery Zone' : 'Standard Delivery Zone'}
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                  {distanceKm} km from Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium truncate">
                Selected Location: <strong className="text-slate-900">{locationLabel}</strong>
              </p>
              <p className="text-[10px] text-amber-800 font-bold mt-0.5">
                {isInside10Km 
                  ? '⚡ 15-Minute Guaranteed Doorstep Delivery • 100% Cash on Delivery & 5-Day Returns'
                  : 'Delivered from Baharagora Central Hub (PIN 832101)'}
              </p>
            </div>
          </div>

          {/* Quick Hub Reset & GPS Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detecting}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              <span>Use Current GPS</span>
            </button>

            <button
              type="button"
              onClick={handleResetToBaharagora}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-slate-600" />
              <span>Center Baharagora</span>
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 transition-all active:scale-98 cursor-pointer"
          >
            <span>Confirm &amp; Deliver Here ({distanceKm} km)</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <p className="text-center text-[10px] text-slate-400 font-medium">
            Apna Bazar Central Superstore, Dadu Complex, Near Shitla Mandir, Baharagora (Jharkhand - 832101)
          </p>

        </div>

      </div>
    </div>
  );
};
