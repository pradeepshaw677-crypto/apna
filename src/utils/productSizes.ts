import { Product } from '../types';

/**
 * Normalizes sizes for products based on category:
 * - Sarees: Strictly "Free Size"
 * - Kids apparel / toys / lil' ones: Age-based (1-2 Y, 2-3 Y, 3-4 Y, 4-5 Y, 5-6 Y, 7-8 Y)
 * - Adult Apparel: S, M, L, XL, XXL
 * - Footwear: 6, 7, 8, 9, 10
 */
export function getProductSizes(product: Partial<Product> | null | undefined): string[] {
  if (!product) return ['Standard'];

  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const sub = (product.subcategory || '').toLowerCase();
  const id = (product.id || '').toLowerCase();

  // 1. Sarees: Always Free Size
  if (cat === 'sarees' || name.includes('saree') || sub.includes('saree')) {
    return ['Free Size'];
  }

  // 2. Kids / Lil' Ones / Children items: Age-based sizes
  const isKids = 
    cat === 'toys' || 
    name.includes('kid') || 
    name.includes('boy') || 
    name.includes('girl') || 
    name.includes('baby') || 
    name.includes('child') || 
    name.includes('lil') ||
    name.includes('toddler') ||
    name.includes('trackpant') ||
    sub.includes('kid') ||
    id.startsWith('kid-') ||
    id.startsWith('toy-');

  if (isKids) {
    return ['1-2 Y', '2-3 Y', '3-4 Y', '4-5 Y', '5-6 Y', '7-8 Y'];
  }

  // 3. Fallback to existing product sizes if provided
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes;
  }

  return ['Standard'];
}
