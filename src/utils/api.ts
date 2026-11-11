import { Product, Coupon, Order, DeliveryAddress, UserProfile, CartItem, ProductReview } from '../types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new ApiError(data?.error || 'Request failed. Please try again.', response.status);
  }
  return data as T;
}

export interface ReverseGeocodeResult {
  plusCode: string;
  road: string;
  locality: string;
  village?: string;
  city: string;
  landmark: string;
  nearby?: string;
  state: string;
  pincode: string;
  fullFormatted: string;
  distanceKm?: number;
  isInside10Km?: boolean;
  displayName?: string;
}

export interface PlaceSuggestionResult {
  name: string;
  city: string;
  state: string;
  pincode: string;
  coords: [number, number];
  distanceKm?: number;
  isInside10Km?: boolean;
  displayName?: string;
}

export interface GeoIpResult {
  lat: number;
  lon: number;
  city: string;
  state: string;
  pincode: string;
  distanceKm?: number;
  isInside10Km?: boolean;
}

export interface PincodeResult {
  eligible: boolean;
  pincode?: string;
  estimatedDays?: number;
  deliveryDate?: string;
  freeDelivery?: boolean;
  cashOnDelivery?: boolean;
  message?: string;
}

export interface StoreInfoResult {
  name: string;
  phone: string;
  address: string;
  isOrderingActive: boolean;
  freeDeliveryThreshold: number;
}

export interface CouponPreviewResult {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}

export interface AdminMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
}

export const api = {
  // Authentication & session (HttpOnly cookie based — no tokens in JS)
  async getSession(): Promise<{ authenticated: boolean; user: UserProfile | null }> {
    try {
      return await requestJson('/api/v1/customer/auth/session');
    } catch (error) {
      console.warn('Failed to fetch session:', error);
      return { authenticated: false, user: null };
    }
  },

  async getGoogleConfig(): Promise<{ clientId: string | null; enabled: boolean }> {
    return requestJson('/api/auth/google/config');
  },

  async sendWhatsAppOtp(phone: string): Promise<{ success: boolean; message: string }> {
    return requestJson('/api/v1/customer/auth/whatsapp/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyWhatsAppOtp(phone: string, otp: string): Promise<{ success: boolean; user: UserProfile; message?: string }> {
    return requestJson('/api/v1/customer/auth/whatsapp/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },

  async syncGoogleSession(input: { credential?: string; accessToken?: string }): Promise<{
    success: boolean;
    user: UserProfile;
    message?: string;
  }> {
    return requestJson('/api/v1/customer/auth/google', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      return await requestJson('/api/v1/customer/auth/logout', { method: 'POST' });
    } catch {
      return { success: false };
    }
  },

  // Store info
  async getStoreInfo(): Promise<StoreInfoResult> {
    try {
      return await requestJson<StoreInfoResult>('/api/store-info');
    } catch {
      return {
        name: 'Apna Bazar',
        phone: '+91 9999999999',
        address: 'Apna Bazar Fulfillment Center, Baharagora, Jharkhand',
        isOrderingActive: true,
        freeDeliveryThreshold: 499,
      };
    }
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    filter?: string;
    sort?: string;
    limit?: number;
    page?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    try {
      const url = new URL('/api/products', window.location.origin);
      if (params?.category) url.searchParams.set('category', params.category);
      if (params?.search) url.searchParams.set('search', params.search);
      if (params?.filter) url.searchParams.set('filter', params.filter);
      if (params?.sort) url.searchParams.set('sort', params.sort);
      if (params?.limit) url.searchParams.set('limit', String(params.limit));
      if (params?.page) url.searchParams.set('page', String(params.page));

      const data = await requestJson<{ products: Product[]; total: number }>(url.toString());
      return {
        products: data.products || [],
        total: data.total || 0,
        page: 1,
        totalPages: 1,
      };
    } catch {
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  async getRunway3DAssets(): Promise<Record<string, string>> {
    try {
      const data = await requestJson<{ assets?: Record<string, string> }>('/api/runway-3d-assets');
      return data.assets || {};
    } catch {
      return {};
    }
  },

  async checkPincode(pincode: string): Promise<PincodeResult> {
    try {
      return await requestJson<PincodeResult>('/api/check-pincode', {
        method: 'POST',
        body: JSON.stringify({ pincode }),
      });
    } catch {
      return { eligible: false, message: 'Network error checking pincode' };
    }
  },

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      return await requestJson<ReverseGeocodeResult>(
        `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      );
    } catch (error) {
      console.error('Reverse geocode API error:', error);
      return null;
    }
  },

  async searchPlaces(query: string): Promise<PlaceSuggestionResult[]> {
    try {
      const data = await requestJson<{ suggestions: PlaceSuggestionResult[] }>(
        `/api/geocode/search?q=${encodeURIComponent(query)}`,
      );
      return data.suggestions || [];
    } catch (error) {
      console.error('Search places API error:', error);
      return [];
    }
  },

  async getGeoIP(): Promise<GeoIpResult | null> {
    try {
      return await requestJson<GeoIpResult>('/api/geoip');
    } catch {
      return null;
    }
  },

  // Reviews
  async getReviews(productId: string): Promise<ProductReview[]> {
    try {
      return await requestJson(`/api/products/${encodeURIComponent(productId)}/reviews`);
    } catch {
      return [];
    }
  },

  async submitReview(productId: string, payload: {
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<ProductReview> {
    return requestJson(`/api/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Orders (prices and totals are always computed by the server)
  async getOrders(): Promise<Order[]> {
    try {
      return await requestJson('/api/orders');
    } catch {
      return [];
    }
  },

  async createOrder(orderPayload: {
    items: CartItem[];
    address: DeliveryAddress;
    paymentMethod: 'cod' | 'upi' | 'card' | 'ab_coins' | string;
    appliedCoupon?: Coupon | null;
    tipAmount?: number;
    abCoinsUsed?: number;
  }): Promise<{ success: boolean; order: Order; message?: string }> {
    const sanitizedItems = orderPayload.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    }));

    return requestJson('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: sanitizedItems,
        address: orderPayload.address,
        paymentMethod: orderPayload.paymentMethod,
        appliedCouponCode: orderPayload.appliedCoupon?.code,
        tipAmount: orderPayload.tipAmount || 0,
        abCoinsUsed: orderPayload.abCoinsUsed || 0,
      }),
    });
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await requestJson(`/api/orders/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },

  async cancelOrder(id: string): Promise<{ success: boolean; message: string; order: Order }> {
    return requestJson(`/api/orders/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
  },

  async requestReturn(
    id: string,
    reason: string,
    comments: string,
  ): Promise<{ success: boolean; message: string; order: Order }> {
    return requestJson(`/api/orders/${encodeURIComponent(id)}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason, comments }),
    });
  },

  // Coupons
  async applyCoupon(code: string, orderTotal: number): Promise<CouponPreviewResult> {
    return requestJson<CouponPreviewResult>('/api/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
    });
  },

  // Profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      return await requestJson('/api/user/profile');
    } catch {
      return null;
    }
  },

  async getAddresses(): Promise<DeliveryAddress[]> {
    try {
      return await requestJson('/api/user/addresses');
    } catch {
      return [];
    }
  },

  async saveAddress(addr: Partial<DeliveryAddress>): Promise<DeliveryAddress> {
    return requestJson('/api/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addr),
    });
  },

  // Admin
  async getAdminMetrics(): Promise<AdminMetrics | null> {
    try {
      return await requestJson<AdminMetrics>('/api/admin/metrics');
    } catch {
      return null;
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    return requestJson(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async createAdminProduct(product: Partial<Product>) {
    return requestJson('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
};
