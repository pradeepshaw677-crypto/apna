import { CartItem, Order, DeliveryAddress } from '../types';

const CART_KEY = 'apnabazar_cart_v1';
const WISHLIST_KEY = 'apnabazar_wishlist_v1';
const ORDERS_KEY = 'apnabazar_orders_v1';
const ADDRESS_KEY = 'apnabazar_address_v1';

export const DEFAULT_ADDRESS: DeliveryAddress = {
  fullName: 'Bhabani Shit',
  phoneNumber: '9876543210',
  streetAddress: 'Plot 42, Green Avenue, Sector 14',
  landmark: 'Near City Center Mall',
  area: 'Sector 14',
  city: 'Baharagora',
  state: 'Jharkhand',
  pincode: '832101',
  addressType: 'home',
  isDefault: true,
};

export function getSavedCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load cart', e);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cart', e);
  }
}

export function getSavedWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : ['prod-fsh-01', 'prod-ftw-01'];
  } catch (e) {
    return ['prod-fsh-01', 'prod-ftw-01'];
  }
}

export function saveWishlist(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
}

export function getSavedOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
}

export function getSavedAddress(): DeliveryAddress {
  if (typeof window === 'undefined') return DEFAULT_ADDRESS;
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ADDRESS;
  } catch (e) {
    return DEFAULT_ADDRESS;
  }
}

export function saveAddress(addr: DeliveryAddress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addr));
  } catch (e) {
    console.error('Failed to save address', e);
  }
}
