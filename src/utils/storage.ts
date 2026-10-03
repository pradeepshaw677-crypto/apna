import { CartItem, Order, DeliveryAddress } from '../types';

const CART_KEY = 'apnabazar_cart_v1';
const WISHLIST_KEY = 'apnabazar_wishlist_v1';
const ORDERS_KEY = 'apnabazar_orders_v1';
const ADDRESS_KEY = 'apnabazar_address_v1';

export const DEFAULT_ADDRESS: DeliveryAddress = {
  fullName: 'Bhabani Shit',
  phoneNumber: '9771762719',
  streetAddress: '6PFP+W7H, Domjuri road, Domjuri',
  landmark: 'Kolaram',
  area: 'Domjuri, Baharagora',
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
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
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

const ADDRESSES_LIST_KEY = 'apnabazar_addresses_list_v1';

export function getSavedAddress(): DeliveryAddress {
  if (typeof window === 'undefined') return DEFAULT_ADDRESS;
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (raw) return JSON.parse(raw);
    const listRaw = localStorage.getItem(ADDRESSES_LIST_KEY);
    if (listRaw) {
      const list: DeliveryAddress[] = JSON.parse(listRaw);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) return def;
    }
    return DEFAULT_ADDRESS;
  } catch (e) {
    return DEFAULT_ADDRESS;
  }
}

export function saveAddress(addr: DeliveryAddress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addr));
    // Also sync to address list
    const currentList = getSavedAddressesList();
    const existingIndex = currentList.findIndex(a => a.id === addr.id || (a.streetAddress === addr.streetAddress && a.pincode === addr.pincode));
    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...addr, isDefault: true };
    } else if (addr.fullName && addr.streetAddress) {
      currentList.push({ ...addr, id: addr.id || `addr-${Date.now()}`, isDefault: true });
    }
    saveAddressesList(currentList.map(a => ({ ...a, isDefault: a.streetAddress === addr.streetAddress })));
  } catch (e) {
    console.error('Failed to save address', e);
  }
}

export function getSavedAddressesList(): DeliveryAddress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ADDRESSES_LIST_KEY);
    if (raw) return JSON.parse(raw);
    const single = localStorage.getItem(ADDRESS_KEY);
    if (single) {
      const parsed = JSON.parse(single);
      if (parsed.fullName && parsed.streetAddress) {
        return [{ ...parsed, id: 'addr-default', isDefault: true }];
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveAddressesList(list: DeliveryAddress[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADDRESSES_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save addresses list', e);
  }
}
