import { Product, Coupon, Order, DeliveryAddress, UserProfile, CartItem, ProductReview } from '../types';

export const api = {
  // Store info
  async getStoreInfo() {
    try {
      const res = await fetch('/api/store-info');
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

      const res = await fetch(url.toString());
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
        body: JSON.stringify({ pincode }),
      });
      return await res.json();
    } catch {
      return { eligible: false, message: 'Network error checking pincode' };
    }
  },

  // Reviews
  async getReviews(productId: string): Promise<ProductReview[]> {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
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
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return await res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) return await res.json();
    } catch {
      // fallback handled by caller
    }
    return [];
  },

  async createOrder(orderPayload: {
    items: CartItem[];
    address: DeliveryAddress;
    paymentMethod: 'cod' | 'upi' | 'card';
    appliedCoupon?: Coupon | null;
    tipAmount?: number;
    userId?: string;
  }): Promise<{ success: boolean; order: Order; message?: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return await res.json();
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return null;
  },

  async cancelOrder(id: string): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: 'PATCH',
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
      const res = await fetch('/api/user/profile');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return null;
  },

  // Addresses
  async getAddresses(): Promise<DeliveryAddress[]> {
    try {
      const res = await fetch('/api/user/addresses');
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
      body: JSON.stringify(addr),
    });
    return await res.json();
  },

  // Admin APIs
  async getAdminMetrics() {
    try {
      const res = await fetch('/api/admin/metrics');
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
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  async createAdminProduct(product: Partial<Product>) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return await res.json();
  },
};
