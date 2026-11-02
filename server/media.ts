/**
 * Catalog image delivery through the configured Cloudinary account.
 * Unsplash is only the origin; production serves optimised WebP/AVIF via
 * Cloudinary Fetch. If Cloudinary is not configured (or fetch is disabled)
 * the original URL is returned untouched so the storefront never breaks.
 */

const CLOUD_NAME = (
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.VITE_CLOUDINARY_CLOUD_NAME ||
  parseCloudinaryUrl(process.env.CLOUDINARY_URL)?.cloudName ||
  ""
).trim();

/** Accepts the single-variable Cloudinary convention: cloudinary://key:secret@cloud */
export function parseCloudinaryUrl(value?: string): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "cloudinary:") return null;
    const cloudName = parsed.hostname.trim();
    const apiKey = decodeURIComponent(parsed.username || "").trim();
    const apiSecret = decodeURIComponent(parsed.password || "").trim();
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

const FETCH_ENABLED = process.env.CLOUDINARY_FETCH_ENABLED !== "false";

const FETCHABLE_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "res.cloudinary.com",
]);

export const CLOUDINARY_MEDIA_READY = Boolean(CLOUD_NAME && FETCH_ENABLED);

function cloudinaryTransform(width: number): string {
  return `f_auto,q_auto:good,w_${Math.max(64, Math.min(2000, Math.round(width)))},c_limit`;
}

/** Cloudinary transformation segments always contain comma-separated params. */
function isTransformSegment(segment: string): boolean {
  return segment.includes(",") && /^[a-z]{1,4}_/i.test(segment);
}

export function deliverCatalogImage(url: string, width = 800): string {
  if (!url) return "";
  if (!CLOUD_NAME || !FETCH_ENABLED) return url;

  try {
    if (url.includes("/image/fetch/")) {
      // Replace (or add) the transform so every breakpoint gets the right size.
      const [prefix, remainder] = url.split("/image/fetch/");
      const slash = remainder.indexOf("/");
      const first = slash >= 0 ? remainder.slice(0, slash) : remainder;
      const source = slash >= 0 && isTransformSegment(first) ? remainder.slice(slash + 1) : remainder;
      return `${prefix}/image/fetch/${cloudinaryTransform(width)}/${source}`;
    }

    const parsed = new URL(url);
    if (!FETCHABLE_HOSTS.has(parsed.hostname)) return url;

    if (parsed.hostname === "res.cloudinary.com") {
      const pieces = url.split("/image/upload/");
      if (pieces.length !== 2) return url;
      const slash = pieces[1].indexOf("/");
      const first = slash >= 0 ? pieces[1].slice(0, slash) : "";
      const tail = slash >= 0 && isTransformSegment(first) ? pieces[1].slice(slash + 1) : pieces[1];
      return `${pieces[0]}/image/upload/${cloudinaryTransform(width)}/${tail}`;
    }

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${cloudinaryTransform(width)}/${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

/**
 * Canonical Cloudinary URL persisted in the database (no width transform).
 * Delivery adds the transform per breakpoint so one row serves every size.
 */
export function canonicalCatalogImage(url: string): string {
  if (!url || !CLOUD_NAME || !FETCH_ENABLED) return url;

  try {
    if (url.includes("/image/fetch/")) return url;
    const parsed = new URL(url);
    if (!FETCHABLE_HOSTS.has(parsed.hostname)) return url;
    if (parsed.hostname === "res.cloudinary.com") return url;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

export function deliverCatalogImages(images: string[] | undefined, width = 800): string[] {
  return (images || []).map((image) => deliverCatalogImage(image, width));
}
