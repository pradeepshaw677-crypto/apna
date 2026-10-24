import { Product, Coupon, Order, DeliveryAddress, UserProfile, CartItem, ProductReview } from '../types';

export const api = {
  // Authentication & Session (HttpOnly cookie secured, credentials: 'include')
  async getSession(): Promise<{ authenticated: boolean; user: UserProfile | null }> {
    try {
      const res = await fetch('/api/v1/customer/auth/session', {
        credentials: 'include',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch session:', e);
    }
    return { authenticated: false, user: null };
  },

  async sendWhatsAppOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/customer/auth/whatsapp/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send WhatsApp verification code');
    }
    return data;
  },

  async verifyWhatsAppOtp(phone: string, otp: string): Promise<{ success: boolean; user: UserProfile; message?: string }> {
    const res = await fetch('/api/v1/customer/auth/whatsapp/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid OTP code');
    }
    return data;
  },

  async syncGoogleSession(credentialOrPayload: string | { credential?: string }): Promise<{ success: boolean; user: UserProfile; message?: string }> {
    const credential = typeof credentialOrPayload === 'string' ? credentialOrPayload : credentialOrPayload.credential;
    const res = await fetch('/api/v1/customer/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to verify Google ID token');
    }
    return data;
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/v1/customer/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // Store info
  async getStoreInfo() {
    try {
      const res = await fetch('/api/store-info', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      name: 'Apna Bazar',
      phone: '+91 98765 43210',
      address: 'Apna Bazar Fulfillment Center, Nationwide Delivery',
      isOrderingActive: true,
      freeDeliveryThreshold: 499,
    };
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
      if (params?.limit) url.searchParams.set('limit', params.limit.toString());
      if (params?.page) url.searchParams.set('page', params.page.toString());

      const res = await fetch(url.toString(), { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback handled by caller
    }
    return { products: [], total: 0, page: 1, totalPages: 1 };
  },

  // Check Pincode for delivery
  async checkPincode(pincode: string) {
    try {
      const res = await fetch('/api/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pincode }),
      });
      return await res.json();
    } catch {
      return { eligible: false, message: 'Network error checking pincode' };
    }
  },

  // Live Geocoding & GPS Reverse Geocode
  async reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Reverse geocode API error:', e);
    }
    return null;
  },

  async searchPlaces(query: string) {
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.suggestions || [];
      }
    } catch (e) {
      console.error('Search places API error:', e);
    }
    return [];
  },

  async getGeoIP() {
    try {
      const res = await fetch('/api/geoip', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // Reviews
  async getReviews(productId: string): Promise<ProductReview[]> {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [];
  },

  async submitReview(productId: string, payload: {
    rating: number;
    title: string;
    comment: string;
    userName: string;
    userId?: string;
    images?: string[];
  }): Promise<ProductReview> {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return await res.json();
  },

  // Orders (Anti-Tampering: Backend validates all prices, fees, and calculations)
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback handled by caller
    }
    return [];
  },

  async createOrder(orderPayload: {
    items: CartItem[];
    address: DeliveryAddress;
    paymentMethod: 'cod' | 'upi' | 'card' | 'ab_coins' | string;
    appliedCoupon?: Coupon | null;
    tipAmount?: number;
    userId?: string;
    abCoinsUsed?: number;
    coinsDiscount?: number;
  }): Promise<{ success: boolean; order: Order; message?: string }> {
    // Sanitize item payload: Send only productId, quantity, selectedSize, selectedColor
    // Backend computes prices authoritatively from server catalog to eliminate price tampering
    const sanitizedItems = orderPayload.items.map((it) => ({
      productId: it.product.id,
      quantity: it.quantity,
      selectedSize: it.selectedSize,
      selectedColor: it.selectedColor,
    }));

    const securePayload = {
      items: sanitizedItems,
      address: orderPayload.address,
      paymentMethod: orderPayload.paymentMethod,
      appliedCouponCode: orderPayload.appliedCoupon?.code,
      tipAmount: orderPayload.tipAmount || 0,
      userId: orderPayload.userId,
      abCoinsUsed: orderPayload.abCoinsUsed || 0,
    };

    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(securePayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return await res.json();
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return null;
  },

  async cancelOrder(id: string): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel order');
    }
    return await res.json();
  },

  // Coupons
  async applyCoupon(code: string, orderTotal: number) {
    const res = await fetch('/api/apply-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, orderTotal }),
    });
    const data = await res.json();
    if (!res.ok || !data.valid) {
      throw new Error(data.error || 'Invalid coupon');
    }
    return data;
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return null;
  },

  // Addresses
  async getAddresses(): Promise<DeliveryAddress[]> {
    try {
      const res = await fetch('/api/user/addresses', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [];
  },

  async saveAddress(addr: Partial<DeliveryAddress>): Promise<DeliveryAddress> {
    const res = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(addr),
    });
    return await res.json();
  },

  // Admin APIs
  async getAdminMetrics() {
    try {
      const res = await fetch('/api/admin/metrics', { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return null;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  async createAdminProduct(product: Partial<Product>) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return await res.json();
  },
};
