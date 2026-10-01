/**
 * Apna Bazar Fashion & Lifestyle Pricing Engine
 * Calculates dynamic size-based price adjustments in INR (₹)
 */

export function getSizePriceDelta(size?: string): number {
  if (!size) return 0;
  const s = size.trim().toUpperCase();

  // Plus size apparel
  if (s.includes('XXL') || s.includes('3XL') || s.includes('44')) {
    return 150;
  }
  if (s.includes('XL') || s.includes('42')) {
    return 100;
  }
  if (s.includes('L') || s.includes('40')) {
    return 50;
  }

  // Shoe sizes (larger sizes require more materials)
  if (s.includes('UK 10') || s.includes('UK 11')) {
    return 120;
  }
  if (s.includes('UK 9')) {
    return 80;
  }
  if (s.includes('UK 8')) {
    return 40;
  }

  // Toys & Giant Plush / Cases
  if (s.includes('4 FEET') || s.includes('120 CM')) {
    return 250;
  }
  if (s.includes('150 PIECE')) {
    return 100;
  }

  // Jewelry & Accessories length
  if (s.includes('24 INCH')) {
    return 80;
  }

  return 0;
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
