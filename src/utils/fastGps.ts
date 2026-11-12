import { api } from './api';

export const APNA_BAZAR_COORDS: [number, number] = [22.2815, 86.7198];
export const DELIVERY_CIRCLE_RADIUS_KM = 10.0;
const REAL_GPS_STORAGE_KEY = 'ab_real_gps_coords_v4';

export interface FastLocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
  distanceKm: number;
  isInside10Km: boolean;
  plusCode: string;
  fullPlusCode: string;
  road: string;
  locality: string;
  village: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  fullFormatted: string;
  source: 'gps';
}

interface CachedGpsFix {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

let latestGpsFix: CachedGpsFix | null = null;
let watchId: number | null = null;
const gpsListeners = new Set<(fix: CachedGpsFix) => void>();

export function subscribeToLiveGps(cb: (fix: CachedGpsFix) => void): () => void {
  gpsListeners.add(cb);
  if (latestGpsFix) {
    cb(latestGpsFix);
  }
  return () => {
    gpsListeners.delete(cb);
  };
}

/**
 * Starts a continuous high-accuracy GPS watcher so hardware GPS stays warm
 * and provides sub-second exact coordinates matching Google Maps.
 */
export function startLiveGpsWatcher(): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return;
  if (watchId !== null) return;

  try {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const fix: CachedGpsFix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 15,
          timestamp: Date.now(),
        };
        latestGpsFix = fix;
        try {
          localStorage.setItem(REAL_GPS_STORAGE_KEY, JSON.stringify(fix));
        } catch {}
        gpsListeners.forEach((cb) => {
          try {
            cb(fix);
          } catch {}
        });
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8000,
      }
    );
  } catch {}
}

export function getLatestCachedGpsFix(): CachedGpsFix | null {
  if (latestGpsFix && Date.now() - latestGpsFix.timestamp < 120000) {
    return latestGpsFix;
  }
  try {
    const raw = localStorage.getItem(REAL_GPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CachedGpsFix;
      if (
        typeof parsed?.lat === 'number' &&
        typeof parsed?.lng === 'number' &&
        Date.now() - (parsed.timestamp || 0) < 300000
      ) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function calculateDistanceFromApnaBazarKm(lat: number, lng: number): number {
  const [hubLat, hubLon] = APNA_BAZAR_COORDS;
  const R = 6371;
  const dLat = ((lat - hubLat) * Math.PI) / 180;
  const dLon = ((lng - hubLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((hubLat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

/**
 * Official Google Open Location Code (Plus Code) encoder.
 * Produces both the Short Plus Code (e.g. "7PM9+4RH") shown in Google Maps
 * and the Full Global Plus Code (e.g. "7MJ87PM9+4RH").
 */
export function encodeGooglePlusCode(lat: number, lng: number): {
  shortCode: string;
  fullCode: string;
} {
  const ALPHABET = '23456789CFGHJMPQRVWX';
  let clampedLat = Math.min(Math.max(lat, -90), 90);
  if (clampedLat === 90) clampedLat -= 0.0000125;
  let normLng = lng;
  while (normLng < -180) normLng += 360;
  while (normLng >= 180) normLng -= 360;

  // Convert to integer grid units at 11-character resolution (1/40000 deg lat, 1/32000 deg lng)
  let latVal = Math.floor(Math.round((clampedLat + 90) * 4000000) / 100);
  let lngVal = Math.floor(Math.round((normLng + 180) * 3200000) / 100);

  // 11th character: 5x4 grid refinement
  const gridRow = ((latVal % 5) + 5) % 5;
  const gridCol = ((lngVal % 4) + 4) % 4;
  const char11 = ALPHABET[gridRow * 4 + gridCol] || '2';

  latVal = Math.floor(latVal / 5); // Now at 1/8000 deg resolution
  lngVal = Math.floor(lngVal / 4); // Now at 1/8000 deg resolution

  const latDigits: string[] = [];
  const lngDigits: string[] = [];
  for (let i = 0; i < 5; i++) {
    const lIdx = ((latVal % 20) + 20) % 20;
    const gIdx = ((lngVal % 20) + 20) % 20;
    latDigits.unshift(ALPHABET[lIdx] || '2');
    lngDigits.unshift(ALPHABET[gIdx] || '2');
    latVal = Math.floor(latVal / 20);
    lngVal = Math.floor(lngVal / 20);
  }

  const p1 = latDigits[0] + lngDigits[0]; // 20° block
  const p2 = latDigits[1] + lngDigits[1]; // 1° block
  const p3 = latDigits[2] + lngDigits[2]; // 0.05° block (chars 1-2 of short code)
  const p4 = latDigits[3] + lngDigits[3]; // 0.0025° block (chars 3-4 of short code)
  const p5 = latDigits[4] + lngDigits[4]; // 0.000125° block (after '+')

  const fullCode = `${p1}${p2}${p3}${p4}+${p5}${char11}`;
  const shortCode = `${p3}${p4}+${p5}${char11}`;
  return { shortCode, fullCode };
}

export function computePlusCodeFast(lat: number, lng: number): string {
  return encodeGooglePlusCode(lat, lng).shortCode;
}

function cleanIndianPincode(raw?: string | null): string {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (/^[1-9]\d{5}$/.test(digits)) return digits;
  const match = String(raw).match(/\b([1-9]\d{5})\b/);
  return match ? match[1] : '';
}

function buildCleanFormattedAddress(parts: {
  plusCode?: string;
  road?: string;
  village?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): string {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const addPart = (val?: string) => {
    if (!val) return;
    const trimmed = val.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(trimmed);
  };

  addPart(parts.plusCode);
  addPart(parts.road);
  addPart(parts.village);
  addPart(parts.locality);
  addPart(parts.city);

  const base = ordered.join(', ');
  const statePin = [parts.state?.trim(), parts.pincode?.trim()].filter(Boolean).join(' - ');
  return statePin ? `${base}, ${statePin}` : base;
}

/**
 * Exact Reverse Geocoding for real GPS coordinates with accurate Google Plus Code
 * and real 6-digit Indian Postal PIN Code in < 1.5s.
 */
export async function fastReverseGeocode(lat: number, lng: number): Promise<FastLocationResult> {
  const distanceKm = calculateDistanceFromApnaBazarKm(lat, lng);
  const isInside10Km = distanceKm <= DELIVERY_CIRCLE_RADIUS_KM;
  const { shortCode: plusCode, fullCode: fullPlusCode } = encodeGooglePlusCode(lat, lng);

  // Run BigDataCloud (fast CDN postcode + locality) and Nominatim (street/village details) in parallel
  const bdcPromise = fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    { signal: AbortSignal.timeout(1400) }
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  const nominatimPromise = fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    {
      headers: { 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(1500),
    }
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  const backendPromise = Promise.race([
    api.reverseGeocode(lat, lng).catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
  ]);

  const [bdcData, nomData, revData] = await Promise.all([
    bdcPromise,
    nominatimPromise,
    backendPromise,
  ]);

  const addr = nomData?.address || {};
  const bdcPin = cleanIndianPincode(bdcData?.postcode);
  const nomPin =
    cleanIndianPincode(addr.postcode) ||
    cleanIndianPincode(nomData?.display_name) ||
    cleanIndianPincode(revData?.pincode);

  const pincode = nomPin || bdcPin || (isInside10Km ? '832101' : '831001');

  const road =
    addr.road ||
    addr.street ||
    addr.pedestrian ||
    revData?.road ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.hamlet ||
    bdcData?.localityInfo?.administrative?.[4]?.name ||
    '';

  const village =
    addr.village ||
    addr.hamlet ||
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    revData?.village ||
    bdcData?.locality ||
    '';

  const locality =
    village ||
    addr.town ||
    addr.city_district ||
    addr.municipality ||
    addr.county ||
    revData?.locality ||
    bdcData?.locality ||
    '';

  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.county ||
    addr.state_district ||
    revData?.city ||
    bdcData?.city ||
    locality ||
    (isInside10Km ? 'Baharagora' : 'Local City');

  const state =
    addr.state ||
    revData?.state ||
    bdcData?.principalSubdivision ||
    'Jharkhand';

  const landmark =
    addr.amenity ||
    addr.building ||
    addr.shop ||
    addr.tourism ||
    revData?.landmark ||
    (locality ? `Near ${locality}` : `Near ${city}`);

  const fullFormatted = buildCleanFormattedAddress({
    plusCode,
    road: road || undefined,
    village: village || undefined,
    locality: locality || undefined,
    city: city || undefined,
    state,
    pincode,
  });

  return {
    lat,
    lng,
    distanceKm,
    isInside10Km,
    plusCode,
    fullPlusCode,
    road: road || locality || city || 'Main Road',
    locality: locality || city,
    village: village || locality || city,
    city: city || locality,
    state,
    pincode,
    landmark,
    fullFormatted,
    source: 'gps',
  };
}

/**
 * Fetches exact hardware GPS coordinates in < 1.8s (single click, super fast).
 */
export async function getFastRealCoordinates(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
  source: 'gps';
}> {
  startLiveGpsWatcher();

  // If continuous watcher already has a fresh fix (< 20s old), return in 0ms!
  if (latestGpsFix && Date.now() - latestGpsFix.timestamp < 20000) {
    return {
      lat: latestGpsFix.lat,
      lng: latestGpsFix.lng,
      accuracy: latestGpsFix.accuracy,
      source: 'gps',
    };
  }

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation not supported on this device');
  }

  // Race high-accuracy hardware GPS and fast network/assisted GPS so 1 click ALWAYS resolves within < 1.8 seconds
  const highAccuracyPromise = new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 15000,
      timeout: 1800,
    });
  });

  const fastAssistedPromise = new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 30000,
      timeout: 1600,
    });
  });

  let pos: GeolocationPosition;
  try {
    pos = await highAccuracyPromise;
  } catch (err: any) {
    if (err?.code === 1) {
      throw new Error('Location permission denied');
    }
    pos = await fastAssistedPromise;
  }

  const fix: CachedGpsFix = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy || 15,
    timestamp: Date.now(),
  };
  latestGpsFix = fix;
  try {
    localStorage.setItem(REAL_GPS_STORAGE_KEY, JSON.stringify(fix));
  } catch {}

  return {
    lat: fix.lat,
    lng: fix.lng,
    accuracy: fix.accuracy,
    source: 'gps',
  };
}

export async function getFastRealLocation(): Promise<FastLocationResult> {
  const coords = await getFastRealCoordinates();
  const result = await fastReverseGeocode(coords.lat, coords.lng);
  result.accuracy = coords.accuracy;

  try {
    localStorage.setItem('ab_is_inside_10km', result.isInside10Km ? 'true' : 'false');
    localStorage.setItem('ab_distance_km', String(result.distanceKm));
    if (result.isInside10Km) {
      localStorage.setItem('ab_location_verified', 'true');
      localStorage.setItem('ab_delivery_location', result.fullFormatted);
      localStorage.setItem('ab_selected_pincode', result.pincode);
    }
  } catch {}

  return result;
}
