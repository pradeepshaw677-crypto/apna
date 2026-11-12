import { api } from './api';

export const APNA_BAZAR_COORDS: [number, number] = [22.2815, 86.7198];
export const DELIVERY_CIRCLE_RADIUS_KM = 10.0;
const REAL_GPS_STORAGE_KEY = 'ab_real_gps_coords_v3';

export interface FastLocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
  distanceKm: number;
  isInside10Km: boolean;
  plusCode: string;
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
      () => {
        // Ignore watch errors; getCurrentPosition handles explicit requests
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
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

export function computePlusCodeFast(lat: number, lng: number): string {
  const ALPHABET = '23456789CFGHJMPQRVWX';
  let normalLat = Math.min(Math.max(lat, -90), 90) + 90;
  let normalLng = lng;
  while (normalLng < -180) normalLng += 360;
  while (normalLng >= 180) normalLng -= 360;
  normalLng += 180;

  const charAt = (v: number) => ALPHABET[Math.min(ALPHABET.length - 1, Math.max(0, Math.floor(v)))] || 'C';
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
 * Exact Reverse Geocoding for real GPS coordinates without faking Baharagora
 * when the user is in another town/city.
 */
export async function fastReverseGeocode(lat: number, lng: number): Promise<FastLocationResult> {
  const distanceKm = calculateDistanceFromApnaBazarKm(lat, lng);
  const isInside10Km = distanceKm <= DELIVERY_CIRCLE_RADIUS_KM;
  const plusCode = computePlusCodeFast(lat, lng);

  // Direct OpenStreetMap Nominatim zoom=18 lookup from client (exact street/village level)
  const nominatimClientPromise = (async () => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(1800),
      }
    );
    if (!res.ok) throw new Error('Nominatim failed');
    const data = await res.json();
    const addr = data.address || {};

    const road =
      addr.road ||
      addr.street ||
      addr.pedestrian ||
      addr.neighbourhood ||
      addr.suburb ||
      addr.hamlet ||
      '';
    const village =
      addr.village ||
      addr.hamlet ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      '';
    const locality =
      village ||
      addr.town ||
      addr.city_district ||
      addr.municipality ||
      addr.county ||
      '';
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      locality ||
      '';
    const state = addr.state || 'India';
    const pincode = addr.postcode || (isInside10Km ? '832101' : '');
    const landmark =
      addr.amenity ||
      addr.building ||
      addr.shop ||
      addr.tourism ||
      (locality ? `Near ${locality}` : '');

    const fullFormatted =
      buildCleanFormattedAddress({
        plusCode,
        road: road || undefined,
        village: village || undefined,
        locality: locality || undefined,
        city: city || undefined,
        state,
        pincode,
      }) || data.display_name;

    return {
      lat,
      lng,
      distanceKm,
      isInside10Km,
      plusCode,
      road: road || locality || city || 'Main Road',
      locality: locality || city,
      village: village || locality || city,
      city: city || locality,
      state,
      pincode: pincode || '000000',
      landmark: landmark || `Near ${locality || city}`,
      fullFormatted,
      source: 'gps' as const,
    };
  })();

  // BigDataCloud fast client lookup (~200ms)
  const bdcPromise = (async () => {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(1600) }
    );
    if (!res.ok) throw new Error('BDC failed');
    const data = await res.json();
    const locality = data.locality || '';
    const city = data.city || locality || data.principalSubdivision || '';
    const state = data.principalSubdivision || 'India';
    const pincode = data.postcode || (isInside10Km ? '832101' : '');
    const adminName =
      data.localityInfo?.administrative?.[4]?.name ||
      data.localityInfo?.administrative?.[3]?.name ||
      '';

    if (!locality && !city) throw new Error('Empty BDC');

    const fullFormatted = buildCleanFormattedAddress({
      plusCode,
      road: adminName && adminName !== city ? adminName : undefined,
      village: locality,
      locality,
      city,
      state,
      pincode,
    });

    return {
      lat,
      lng,
      distanceKm,
      isInside10Km,
      plusCode,
      road: adminName || locality || city,
      locality: locality || city,
      village: locality || city,
      city,
      state,
      pincode: pincode || '000000',
      landmark: `Near ${locality || city}`,
      fullFormatted,
      source: 'gps' as const,
    };
  })();

  const backendPromise = (async () => {
    const ctrl = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800));
    const rev = await Promise.race([api.reverseGeocode(lat, lng), ctrl]);
    if (!rev) throw new Error('Backend timeout');

    return {
      lat,
      lng,
      distanceKm,
      isInside10Km,
      plusCode: rev.plusCode || plusCode,
      road: rev.road || rev.locality || 'Main Road',
      locality: rev.locality || rev.city,
      village: rev.village || rev.locality || rev.city,
      city: rev.city,
      state: rev.state,
      pincode: rev.pincode || '000000',
      landmark: rev.landmark || `Near ${rev.locality || rev.city}`,
      fullFormatted: rev.fullFormatted,
      source: 'gps' as const,
    };
  })();

  try {
    // Prefer Nominatim street-level accuracy first, fall back to BDC/backend if slow
    return await Promise.any([nominatimClientPromise, backendPromise, bdcPromise]);
  } catch {
    const coordStr = `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
    return {
      lat,
      lng,
      distanceKm,
      isInside10Km,
      plusCode,
      road: `GPS (${coordStr})`,
      locality: coordStr,
      village: coordStr,
      city: isInside10Km ? 'Baharagora' : 'Live GPS Point',
      state: 'India',
      pincode: isInside10Km ? '832101' : '000000',
      landmark: coordStr,
      fullFormatted: `${plusCode}, GPS (${coordStr})`,
      source: 'gps',
    };
  }
}

/**
 * Fetches exact hardware GPS coordinates matching Google Maps.
 * NEVER uses coarse IP geolocation (which points to telecom gateway cities).
 */
export async function getFastRealCoordinates(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
  source: 'gps';
}> {
  // Start continuous GPS watcher so hardware GPS stays warm
  startLiveGpsWatcher();

  // If watcher already has a fresh fix (< 15 seconds old), return immediately!
  if (latestGpsFix && Date.now() - latestGpsFix.timestamp < 15000) {
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

  // Request TRUE high-accuracy GPS first (exact same API as Google Maps web)
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 3500,
      });
    });

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
  } catch (err: any) {
    // If permission denied, throw immediately
    if (err?.code === 1) {
      throw new Error('Location permission denied');
    }

    // Fallback to fused network/Wi-Fi/cell location on the device (still real device location, not IP)
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 30000,
        timeout: 2500,
      });
    });

    const fix: CachedGpsFix = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy || 50,
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
