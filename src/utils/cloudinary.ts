/**
 * Cloudinary Media Integration Utility for Apna Bazar
 * Handles ultra-fast image transformations (f_auto, q_auto), CDN URL creation, and upload handling.
 */

// Cloudinary default demo cloud or configured environment cloud
export const CLOUDINARY_CLOUD_NAME = "apnabazar-cdn";

/**
 * Transforms an image URL to a high-speed Cloudinary CDN URL with auto-WebP formatting,
 * responsive width scaling, and intelligent compression.
 */
export function getCloudinaryUrl(
  urlOrPublicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb" | "limit";
    quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | number;
    format?: "auto" | "webp" | "avif" | "jpg";
  } = {}
): string {
  if (!urlOrPublicId) return "";

  const {
    width = 800,
    height,
    crop = "limit",
    quality = "auto:good",
    format = "auto",
  } = options;

  // If already a Cloudinary delivery URL, inject transformations
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    const parts = urlOrPublicId.split("/upload/");
    if (parts.length === 2) {
      const transform = `f_${format},q_${quality},w_${width}${height ? `,h_${height}` : ""},c_${crop}`;
      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
    return urlOrPublicId;
  }

  // If external URL (e.g. Unsplash or CDN), route through Cloudinary fetch endpoint for auto-format and edge caching
  if (urlOrPublicId.startsWith("http://") || urlOrPublicId.startsWith("https://")) {
    // Cloudinary fetch CDN URL pattern:
    // https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_800/<encoded-url>
    const encodedUrl = encodeURIComponent(urlOrPublicId);
    return `https://res.cloudinary.com/demo/image/fetch/f_${format},q_${quality},w_${width}${
      height ? `,h_${height}` : ""
    },c_${crop}/${encodedUrl}`;
  }

  // Otherwise treat as public_id in Cloudinary
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_${format},q_${quality},w_${width}${
    height ? `,h_${height}` : ""
  },c_${crop}/${urlOrPublicId}`;
}

/**
 * Uploads an image file or base64 data to Cloudinary via server proxy
 */
export async function uploadToCloudinary(
  fileOrBase64: File | string,
  folder: string = "apnabazar_products"
): Promise<{ url: string; publicId: string }> {
  try {
    let payload: { data: string; folder: string; filename?: string };

    if (fileOrBase64 instanceof File) {
      const base64 = await fileToBase64(fileOrBase64);
      payload = {
        data: base64,
        folder,
        filename: fileOrBase64.name,
      };
    } else {
      payload = {
        data: fileOrBase64,
        folder,
      };
    }

    const response = await fetch("/api/cloudinary/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id || `upload_${Date.now()}`,
    };
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to local base64/placeholder:", error);
    // Graceful fallback to inline data or CDN fallback
    if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
      return { url: fileOrBase64, publicId: `fallback_${Date.now()}` };
    }
    return {
      url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
      publicId: `fallback_${Date.now()}`,
    };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
