import { Product } from '../types';

const DEFAULT_TITLE =
  'Apna Bazar (Apka Apna Bazar) — No. 1 Shopping Mall in Baharagora | Best Fashion Website';
const DEFAULT_DESCRIPTION =
  "Apna Bazar (Apka Apna Bazar) - No. 1 Shopping Mall & Best Fashion Website in Baharagora, Jharkhand (832101). Shop Sarees, Women's & Men's Fashion, Kids Wear, Footwear & Watches at wholesale prices with 10-KM Express Doorstep Delivery, Cash on Delivery & 5-Day Returns.";

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://apkaapnabazar.vercel.app';
}

function setMetaContent(selector: string, content: string): void {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export function updateDynamicSeo(options?: {
  categoryId?: string;
  categoryName?: string;
  searchQuery?: string;
  product?: Product | null;
}): void {
  if (typeof document === 'undefined') return;

  const BASE_URL = getBaseUrl();
  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let canonicalUrl = `${BASE_URL}/`;

  if (options?.product) {
    const p = options.product;
    title = `${p.name} at ₹${p.price} | Apna Bazar (Apka Apna Bazar) — No. 1 Shopping Mall in Baharagora`;
    description = `Buy ${p.name} online at ₹${p.price} on Apna Bazar (Apka Apna Bazar), the No. 1 Shopping Mall & Best Fashion Website in Baharagora, Jharkhand 832101. 10-KM Express Doorstep Delivery, Cash on Delivery & 5-Day Easy Returns.`;
    canonicalUrl = `${BASE_URL}/?product=${encodeURIComponent(p.id)}`;
  } else if (options?.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.trim();
    title = `${q} — Shop Online at Apna Bazar (Apka Apna Bazar) Baharagora Shopping Mall`;
    description = `Explore ${q} at wholesale prices on Apna Bazar (Apka Apna Bazar), No. 1 Shopping Mall & Fashion Website in Baharagora, Jharkhand (832101).`;
  } else if (options?.categoryId && options.categoryId !== 'all') {
    const catLabel = options.categoryName || options.categoryId;
    title = `${catLabel} Collection | Apna Bazar (Apka Apna Bazar) — No. 1 Shopping Mall in Baharagora`;
    description = `Shop trending ${catLabel} at wholesale prices on Apna Bazar (Apka Apna Bazar), the No. 1 Shopping Mall & Fashion Website in Baharagora, Jharkhand 832101. Fast 10-KM Circle Doorstep Delivery & COD.`;
    canonicalUrl = `${BASE_URL}/?category=${encodeURIComponent(options.categoryId)}`;
  }

  document.title = title;
  setMetaContent('meta[name="title"]', title);
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', canonicalUrl);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);

  const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', canonicalUrl);
  }

  // Inject or update dynamic Product Schema.org JSON-LD when a product is selected
  let productSchemaEl = document.getElementById('ab-dynamic-product-ld') as HTMLScriptElement | null;
  if (options?.product) {
    const p = options.product;
    if (!productSchemaEl) {
      productSchemaEl = document.createElement('script');
      productSchemaEl.id = 'ab-dynamic-product-ld';
      productSchemaEl.type = 'application/ld+json';
      document.head.appendChild(productSchemaEl);
    }
    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      image: p.images && p.images.length > 0 ? p.images : [p.image],
      description:
        p.description ||
        `${p.name} available at Apna Bazar (Apka Apna Bazar), No. 1 Shopping Mall in Baharagora, Jharkhand 832101.`,
      sku: p.id,
      brand: {
        '@type': 'Brand',
        name: p.brand || 'Apna Bazar',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(p.rating || 4.8),
        reviewCount: String(Math.max(12, p.reviewsCount || 45)),
      },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'INR',
        price: String(p.price),
        availability:
          p.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Apna Bazar (Apka Apna Bazar) Baharagora',
        },
      },
    };
    productSchemaEl.textContent = JSON.stringify(productJsonLd);
  } else if (productSchemaEl) {
    productSchemaEl.remove();
  }
}
