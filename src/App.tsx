import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Star, 
  ArrowUpDown, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  Percent, 
  ChevronRight, 
  Filter, 
  Tag, 
  Truck, 
  RotateCcw, 
  Clock, 
  Heart, 
  ArrowRight, 
  SlidersHorizontal, 
  LayoutDashboard, 
  Check, 
  Package,
  Banknote,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CategoryId, 
  Product, 
  CartItem, 
  Coupon, 
  DeliveryAddress, 
  Order, 
  UserProfile,
  WalletTransaction 
} from './types';
import { CATEGORIES, PRODUCTS, AVAILABLE_COUPONS } from './data/products';
import { api } from './utils/api';
import { 
  getSavedCart, 
  saveCart, 
  getSavedWishlist, 
  saveWishlist, 
  getSavedOrders, 
  saveOrders, 
  getSavedAddress, 
  saveAddress 
} from './utils/storage';
import { getSizePriceDelta, formatINR } from './utils/pricing';

import { Header } from './components/Header';
import { TopCategoryStrip } from './components/TopCategoryStrip';
import { HeroBanner } from './components/HeroBanner';

import { preloadCriticalAssets } from './utils/imagePreloader';

export interface FabricMaterial {
  id: string;
  name: string;
  hindi: string;
  icon: string;
  image: string;
  keywords: string[];
}

export const FABRIC_MATERIALS: FabricMaterial[] = [
  {
    id: 'all',
    name: 'All Fabrics',
    hindi: 'सभी फैब्रिक',
    icon: '✨',
    image: '/assets/aistudio/Screenshot_2026_1106_205708_8a333b8c.png',
    keywords: [],
  },
  {
    id: 'cotton',
    name: 'Cotton',
    hindi: 'कॉटन / सूती',
    icon: '☁️',
    image: '/assets/aistudio/Screenshot_2026_1106_205750_2f8b4a8b.png',
    keywords: ['cotton', 'mulmul', 'oxford', 'khadi', 'twill', 'pique', 'combed'],
  },
  {
    id: 'silk',
    name: 'Silk',
    hindi: 'सिल्क / रेशम',
    icon: '🧵',
    image: '/assets/aistudio/Screenshot_2026_1106_210033_52aac3d0.png',
    keywords: ['silk', 'banarasi', 'katan', 'tussar', 'pattu', 'chanderi', 'zari', 'jacquard'],
  },
  {
    id: 'wool',
    name: 'Wool & Fleece',
    hindi: 'ऊन / फ्लीस',
    icon: '🧶',
    image: '/assets/aistudio/Screenshot_2026_1106_210111_cc73a541.png',
    keywords: ['wool', 'fleece', 'terry', 'knit', 'sweater', 'hoodie', 'winter', 'jacket', 'puffer', 'sweatshirt'],
  },
  {
    id: 'polyester',
    name: 'Polyester',
    hindi: 'पॉलिएस्टर / जॉर्जेट',
    icon: '⚡',
    image: '/assets/aistudio/Screenshot_2026_1106_210152_55383cbe.png',
    keywords: ['polyester', 'poly', 'georgette', 'chiffon', 'organza', 'drycell', 'dri-fit', 'lycra', 'spandex', 'nylon'],
  },
  {
    id: 'denim',
    name: 'Denim',
    hindi: 'डेनिम / जींस',
    icon: '👖',
    image: '/assets/aistudio/Screenshot_2026_1106_210218_95587bac.png',
    keywords: ['denim', 'jeans', 'trucker', 'chambray', 'wide leg'],
  },
  {
    id: 'linen',
    name: 'Linen',
    hindi: 'लिनन / फ्लैक्स',
    icon: '🌿',
    image: '/assets/aistudio/Screenshot_2026_1106_210253_da7d626d.png',
    keywords: ['linen', 'flax', 'woven', 'slub'],
  },
  {
    id: 'velvet-satin',
    name: 'Velvet & Satin',
    hindi: 'वेलवेट / सैटिन',
    icon: '✨',
    image: '/assets/aistudio/Screenshot_2026_1106_210327_7e2a0625.png',
    keywords: ['velvet', 'satin', 'cowl', 'crepe'],
  },
  {
    id: 'rayon',
    name: 'Rayon & Viscose',
    hindi: 'रेयॉन / विस्कोस',
    icon: '🌸',
    image: '/assets/aistudio/Screenshot_2026_1106_210352_31dcf9b6.png',
    keywords: ['rayon', 'viscose', 'modal'],
  },
  {
    id: 'leather',
    name: 'Leather & EVA',
    hindi: 'लेदर / ईवा',
    icon: '👞',
    image: '/assets/aistudio/Screenshot_2026_1106_210417_36af62fb.png',
    keywords: ['leather', 'pu', 'suede', 'eva', 'rubber', 'canvas'],
  },
];
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistModal } from './components/WishlistModal';
import { OffersModal } from './components/OffersModal';
import { PincodeModal } from './components/PincodeModal';
import { PromoNotificationToast } from './components/PromoNotificationToast';
import { CartToast, CartToastItem } from './components/CartToast';
import { LoginModal } from './components/LoginModal';
import { WhyShopSection } from './components/WhyShopSection';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { MeeshoCategoryDrawer } from './components/MeeshoCategoryDrawer';
import { DashboardOptionsModal } from './components/DashboardOptionsModal';
import { FloatingActions } from './components/FloatingActions';
import { AIAssistant } from './components/AIAssistant';
import { Footer } from './components/Footer';
import { recoverImage } from './utils/cloudinary';
import { TurnOnLocationPopup } from './components/TurnOnLocationPopup';
import { startLiveGpsWatcher } from './utils/fastGps';
import { updateDynamicSeo } from './utils/seo';

const CheckoutModal = lazy(() =>
  import('./components/CheckoutModal').then((module) => ({ default: module.CheckoutModal })),
);
const TrackOrderModal = lazy(() =>
  import('./components/TrackOrderModal').then((module) => ({ default: module.TrackOrderModal })),
);
const LocationPermissionModal = lazy(() =>
  import('./components/LocationPermissionModal').then((module) => ({ default: module.LocationPermissionModal })),
);
const DeliveryRadiusModal = lazy(() =>
  import('./components/DeliveryRadiusModal').then((module) => ({ default: module.DeliveryRadiusModal })),
);
const InvoiceModal = lazy(() =>
  import('./components/InvoiceModal').then((module) => ({ default: module.InvoiceModal })),
);
const VoiceSearchModal = lazy(() =>
  import('./components/VoiceSearchModal').then((module) => ({ default: module.VoiceSearchModal })),
);
const DashboardView = lazy(() =>
  import('./components/DashboardView').then((module) => ({ default: module.DashboardView })),
);
const OrdersView = lazy(() =>
  import('./components/OrdersView').then((module) => ({ default: module.OrdersView })),
);
const AddressesView = lazy(() =>
  import('./components/AddressesView').then((module) => ({ default: module.AddressesView })),
);
const ReferView = lazy(() =>
  import('./components/ReferView').then((module) => ({ default: module.ReferView })),
);
const SupportView = lazy(() =>
  import('./components/SupportView').then((module) => ({ default: module.SupportView })),
);
const PolicyView = lazy(() =>
  import('./components/PolicyView').then((module) => ({ default: module.PolicyView })),
);

const ViewLoading = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-rose-200 border-t-red-600 animate-spin" />
  </div>
);

export type ViewType = 
  | 'home' 
  | 'dashboard' 
  | 'orders' 
  | 'addresses' 
  | 'refer' 
  | 'support' 
  | 'about' 
  | 'shipping' 
  | 'returns' 
  | 'cancellation' 
  | 'terms' 
  | 'privacy' 
  | 'disclaimer';

export default function App() {
  // Navigation View State ('home' is the main ecommerce catalog)
  const [activeView, setActiveView] = useState<ViewType>('home');

  // User Authentication State (Secured via HttpOnly session cookies)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Delivery Location & Verification State
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return localStorage.getItem('ab_delivery_location') || 'Baharagora 832101 (Jharkhand)';
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isTurnOnLocationPopupOpen, setIsTurnOnLocationPopupOpen] = useState(true);

  // Modals & Drawers
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isDeliveryRadiusOpen, setIsDeliveryRadiusOpen] = useState(false);
  const [isMeeshoDrawerOpen, setIsMeeshoDrawerOpen] = useState(false);
  const [isDashboardOptionsOpen, setIsDashboardOptionsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart animation toast
  const [cartToastItem, setCartToastItem] = useState<CartToastItem | null>(null);

  // Cart, Wishlist, Orders & Address
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getSavedCart());
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => getSavedWishlist());
  const [orders, setOrders] = useState<Order[]>(() => getSavedOrders());
  const [savedAddress, setSavedAddress] = useState<DeliveryAddress>(() => getSavedAddress());
  const [selectedPincode, setSelectedPincode] = useState('832101');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => AVAILABLE_COUPONS[0]);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<Order | null>(null);
  const [orderSuccessBanner, setOrderSuccessBanner] = useState<Order | null>(null);

  // Catalog, Filter & Search with High-Speed Local Caching
  const [productsList, setProductsList] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('ab_cached_products_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PRODUCTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deals' | 'bestsellers' | 'rating4plus' | 'under999'>('all');
  const [customMaxPrice, setCustomMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'discount' | 'rating'>('popular');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  
  // 8 Products per batch pagination & persistence across refresh (fixes "refresh fir se suru se load ho raha hai")
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    try {
      const savedCount = sessionStorage.getItem('ab_visible_count');
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!isNaN(parsed) && parsed >= 8) return parsed;
      }
    } catch {}
    return 8;
  });

  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('home');
  const isFirstMountFilter = useRef(true);

  const productSectionRef = useRef<HTMLDivElement>(null);
  const categorySectionRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Auto-save visibleCount to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ab_visible_count', visibleCount.toString());
    } catch {}
  }, [visibleCount]);

  // Auto-clear cart toast after 3.5s
  useEffect(() => {
    if (cartToastItem) {
      const timer = setTimeout(() => {
        setCartToastItem(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [cartToastItem]);


  // Fetch active HttpOnly session from backend on app boot
  useEffect(() => {
    let isMounted = true;
    api.getSession().then((res) => {
      if (isMounted && res.authenticated && res.user) {
        setCurrentUser(res.user);
      }
    }).catch((err) => {
      console.warn("Session check failed:", err);
    });
    return () => { isMounted = false; };
  }, []);

  // Recover any Cloudinary/CDN image that fails, then show a safe placeholder.
  useEffect(() => {
    const handleImageError = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) recoverImage(target);
    };
    document.addEventListener('error', handleImageError, true);
    return () => document.removeEventListener('error', handleImageError, true);
  }, []);

  // Preload all 30 brand logos and 10 fabric material textures for instantaneous 0ms display
  useEffect(() => {
    preloadCriticalAssets();
  }, []);

  // User explicit instruction: "jab first time web open ho tab bola tha location on karne bolaga and bas bo hat jayaga 2 sec me and mobile ka location on ho jayaga"
  useEffect(() => {
    setIsTurnOnLocationPopupOpen(true);
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (perm.state === 'granted') {
            startLiveGpsWatcher();
          }
        })
        .catch(() => {});
    }
  }, []);

  // Capture referral invite code from URL like /?ref=AB1234
  useEffect(() => {
    try {
      const refParam = new URLSearchParams(window.location.search).get('ref');
      if (refParam && refParam.trim().length >= 4) {
        const cleanRef = refParam.trim().toUpperCase();
        sessionStorage.setItem('ab_referral_code', cleanRef);
        sessionStorage.setItem('ab_referral_time', Date.now().toString());
      }
    } catch {}
  }, []);

  // Deep links like /?product=fsh-001, /?category=sarees, or /?search=... from Sitemap & Google Search
  useEffect(() => {
    const syncStateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      const categoryParam = params.get('category');
      const searchParam = params.get('search');

      if (categoryParam && CATEGORIES.some((c) => c.id === categoryParam)) {
        setSelectedCategory(categoryParam);
      }
      if (searchParam) {
        setSearchQuery(searchParam);
      }
      if (productId) {
        const product =
          productsList.find((item) => item.id === productId) ||
          PRODUCTS.find((item) => item.id === productId);
        if (product) setSelectedProduct(product);
      }
    };

    syncStateFromUrl();
    window.addEventListener('popstate', syncStateFromUrl);
    return () => window.removeEventListener('popstate', syncStateFromUrl);
  }, [productsList]);

  // Dynamic SEO Title, Meta Description, OpenGraph & Product JSON-LD
  useEffect(() => {
    const matchedCat = CATEGORIES.find((c) => c.id === selectedCategory);
    updateDynamicSeo({
      categoryId: selectedCategory,
      categoryName: matchedCat?.name,
      searchQuery,
      product: selectedProduct,
    });
  }, [selectedCategory, searchQuery, selectedProduct]);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.id);
    window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('product')) {
      url.searchParams.delete('product');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  // Fetch live products from backend with high-speed local caching
  useEffect(() => {
    let isMounted = true;
    api.getProducts().then((res) => {
      if (isMounted && res.products && res.products.length > 0) {
        setProductsList((prev) => {
          if (
            prev.length === res.products.length &&
            prev[0]?.id === res.products[0]?.id &&
            prev[0]?.price === res.products[0]?.price
          ) {
            return prev;
          }
          return res.products;
        });
        try {
          localStorage.setItem('ab_cached_products_v2', JSON.stringify(res.products));
        } catch {}
      }
    }).catch(() => {
      // Fallback to static PRODUCTS
    });
    return () => { isMounted = false; };
  }, []);

  // Sync orders from server once the customer is signed in
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    api.getOrders().then((serverOrders) => {
      if (isMounted && serverOrders && serverOrders.length > 0) {
        setOrders((prev) => {
          const merged = [...prev];
          serverOrders.forEach((so) => {
            if (!merged.some((o) => o.id === so.id)) {
              merged.push(so);
            }
          });
          return merged;
        });
      }
    }).catch(() => {
      // Local fallback
    });
    return () => { isMounted = false; };
  }, [currentUser]);

  // Persist storage
  useEffect(() => { saveCart(cartItems); }, [cartItems]);
  useEffect(() => { saveWishlist(wishlistIds); }, [wishlistIds]);
  useEffect(() => { saveOrders(orders); }, [orders]);
  useEffect(() => { saveAddress(savedAddress); }, [savedAddress]);

  // Reset pagination to 8 ONLY when user explicitly changes category, search or filters (prevents reset on refresh)
  useEffect(() => {
    if (isFirstMountFilter.current) {
      isFirstMountFilter.current = false;
      return;
    }
    setVisibleCount(8);
    try {
      sessionStorage.setItem('ab_visible_count', '8');
    } catch {}
  }, [selectedCategory, searchQuery, filterType, sortBy, selectedBrand, selectedMaterial, selectedVibe]);

  // Set latest order to tracked
  useEffect(() => {
    if (orders.length > 0 && !activeTrackedOrder) {
      setActiveTrackedOrder(orders[0]);
    }
  }, [orders, activeTrackedOrder]);

  // Core Add to Cart executor with size adjustment, cart animation & confetti
  const executeAddToCart = (product: Product, size?: string, color?: string, priceOverride?: number) => {
    const targetSize = size || (product.sizes?.[0]) || 'Standard';
    const targetColor = color || (product.colors?.[0]?.name);
    const sizeDelta = getSizePriceDelta(targetSize);
    const finalUnitPrice = priceOverride ?? (product.price + sizeDelta);
    const finalOriginalUnitPrice = product.originalPrice + sizeDelta;

    setCartItems((prev) => {
      const matchIndex = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === targetSize && it.selectedColor === targetColor
      );
      if (matchIndex > -1) {
        const next = [...prev];
        next[matchIndex].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedSize: targetSize,
          selectedColor: targetColor,
          unitPrice: finalUnitPrice,
          originalUnitPrice: finalOriginalUnitPrice,
        },
      ];
    });

    // Cart animation toast & celebration confetti
    setCartToastItem({
      product,
      size: targetSize,
      color: targetColor,
      price: finalUnitPrice,
    });

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#fb923c', '#e11d48']
      });
    } catch {}
  };

  // Enterprise Security Requirement: Force-Login on Add to Cart
  // Intercepts unauthenticated customer, stores pending item in sessionStorage, prompts login modal
  const handleAddToCart = (product: Product, size?: string, color?: string, priceOverride?: number) => {
    const targetSize = size || (product.sizes?.[0]) || 'Standard';
    const targetColor = color || (product.colors?.[0]?.name);

    if (!currentUser || !currentUser.isLoggedIn) {
      try {
        sessionStorage.setItem('ab_pending_cart_action', JSON.stringify({
          productId: product.id,
          productObject: product,
          size: targetSize,
          color: targetColor,
          quantity: 1,
          isBuyNow: false,
          priceOverride,
        }));
      } catch (e) {
        console.warn('Failed to store pending cart action:', e);
      }
      setIsLoginOpen(true);
      return;
    }

    executeAddToCart(product, targetSize, targetColor, priceOverride);
  };

  // Force-Login on Buy Now: Intercepts unauthenticated customer, stores action in sessionStorage
  const handleBuyNow = (product: Product, size?: string, color?: string, priceOverride?: number) => {
    const targetSize = size || (product.sizes?.[0]) || 'Standard';
    const targetColor = color || (product.colors?.[0]?.name);

    if (!currentUser || !currentUser.isLoggedIn) {
      try {
        sessionStorage.setItem('ab_pending_cart_action', JSON.stringify({
          productId: product.id,
          productObject: product,
          size: targetSize,
          color: targetColor,
          quantity: 1,
          isBuyNow: true,
          priceOverride,
        }));
      } catch (e) {
        console.warn('Failed to store pending buy-now action:', e);
      }
      setIsLoginOpen(true);
      return;
    }

    executeAddToCart(product, targetSize, targetColor, priceOverride);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (product: Product, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(product.id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === product.id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Handle successful login: update user session & automatically resume pending cart action
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginOpen(false);

    try {
      const rawPending = sessionStorage.getItem('ab_pending_cart_action');
      if (rawPending) {
        sessionStorage.removeItem('ab_pending_cart_action');
        const pending = JSON.parse(rawPending);
        const targetProd = productsList.find((p) => p.id === pending.productId) || pending.productObject;
        if (targetProd) {
          executeAddToCart(targetProd, pending.size, pending.color, pending.priceOverride);
          if (pending.isBuyNow) {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          } else {
            setIsCartOpen(true);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to resume pending cart action:', err);
    }
  };

  // Handle Logout: Clears server-side HttpOnly session cookie & frontend state
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setCurrentUser(null);
    try {
      localStorage.removeItem('ab_user');
      sessionStorage.removeItem('ab_pending_cart_action');
    } catch {}
    setActiveView('home');
  };

  const handleOrderPlaced = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setActiveTrackedOrder(order);
    setOrderSuccessBanner(order);
    // Real-time map & delivery OTP auto open on COD confirmation
    setIsTrackOrderOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (items: CartItem[]) => {
    setCartItems((prev) => {
      const merged = [...prev];
      items.forEach((newItem) => {
        const idx = merged.findIndex((m) => m.product.id === newItem.product.id);
        if (idx > -1) {
          merged[idx].quantity += newItem.quantity;
        } else {
          merged.push(newItem);
        }
      });
      return merged;
    });
    setIsCartOpen(true);
  };

  const handleDeductWalletCoins = (coins: number) => {
    if (currentUser) {
      const newBalance = Math.max(0, (currentUser.walletBalance || 0) - coins);
      const debitTx: WalletTransaction = {
        id: `tx-checkout-${Date.now()}`,
        type: 'debit',
        amount: coins,
        title: 'AB Coins Used at Checkout',
        description: 'Store currency applied to order',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      };
      const updatedUser: UserProfile = {
        ...currentUser,
        walletBalance: newBalance,
        walletTransactions: [debitTx, ...(currentUser.walletTransactions || [])],
      };
      setCurrentUser(updatedUser);
    }
  };

  // Location verified callback & auto-fill
  const handleLocationConfirmed = (pin: string, addressStr: string, isExpressZone: boolean) => {
    try {
      localStorage.setItem('ab_location_verified', 'true');
      localStorage.setItem('ab_is_inside_10km', isExpressZone ? 'true' : 'false');
    } catch {}

    if (!isExpressZone) {
      const outDisplay = `Outside 10km Circle (No Delivery) - ${pin}`;
      setDeliveryLocation(outDisplay);
      try {
        localStorage.setItem('ab_delivery_location', outDisplay);
      } catch {}
      setSelectedPincode(pin);
      return;
    }

    setDeliveryLocation(addressStr);
    try {
      localStorage.setItem('ab_delivery_location', addressStr);
    } catch {}
    setSelectedPincode(pin);

    // Auto-fill savedAddress for seamless checkout
    setSavedAddress((prev) => {
      const parts = addressStr.split(',').map(s => s.trim());
      const detectedCity = parts[3] || (addressStr.includes('Baharagora') ? 'Baharagora' : (prev.city || 'Baharagora'));
      const detectedArea = parts[2] || 'Baharagora 10-KM Hub Zone';
      const detectedLandmark = parts[4] || prev.landmark || '';

      const updated: DeliveryAddress = {
        ...prev,
        streetAddress: addressStr,
        pincode: pin || prev.pincode,
        city: detectedCity,
        state: prev.state || 'Jharkhand',
        landmark: detectedLandmark,
        area: detectedArea,
      };
      saveAddress(updated);
      return updated;
    });
  };

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Brand filter (from Iconic Brands section)
    if (selectedBrand) {
      const b = selectedBrand.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.brand?.toLowerCase() === b ||
          p.brand?.toLowerCase().includes(b) ||
          p.name.toLowerCase().includes(b)
      );
    }

    // Vibe / Color Mood filter (from Shop with Vibe section - strict color matching)
    if (selectedVibe) {
      const v = selectedVibe.toLowerCase().trim();
      const colorSynonyms: Record<string, string[]> = {
        blue: ['blue', 'navy', 'cyan', 'sapphire', 'sky', 'indigo', 'denim'],
        green: ['green', 'emerald', 'olive', 'mint', 'sage'],
        pink: ['pink', 'rose', 'magenta', 'blush', 'peach'],
        gold: ['gold', 'golden', 'yellow', 'mustard', 'zari'],
        white: ['white', 'ivory', 'cream', 'off-white', 'pearl'],
        black: ['black', 'noir', 'charcoal'],
        red: ['red', 'crimson', 'maroon', 'ruby', 'scarlet'],
      };
      const syns = colorSynonyms[v] || [v];
      result = result.filter((p) =>
        Boolean(p.colors && p.colors.some((c) => syns.some((syn) => c.name.toLowerCase().includes(syn))))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Chips filter
    if (filterType === 'deals') {
      result = result.filter((p) => p.discountPercent >= 50 || p.isFlashDeal);
    } else if (filterType === 'bestsellers') {
      result = result.filter((p) => p.isBestSeller);
    } else if (filterType === 'rating4plus') {
      result = result.filter((p) => p.rating >= 4.5);
    } else if (filterType === 'under999') {
      result = result.filter((p) => p.price <= 999);
    }

    // Price drop filter from HeroBanner (e.g. Under ₹299, ₹399, ₹499, ₹599)
    if (customMaxPrice !== null) {
      result = result.filter((p) => p.price <= customMaxPrice);
    }

    // Material / Fabric filter (Silk, Cotton, Wool, Polyester, Denim, etc.)
    if (selectedMaterial && selectedMaterial !== 'all') {
      const mat = FABRIC_MATERIALS.find((m) => m.id === selectedMaterial);
      if (mat && mat.keywords.length > 0) {
        result = result.filter((p) => {
          const combined = [
            p.name,
            p.description,
            p.subcategory || '',
            ...(p.highlights || []),
            ...(p.specifications || []).map((s) => `${s.label} ${s.value}`),
          ]
            .join(' ')
            .toLowerCase();
          return mat.keywords.some((k) => combined.includes(k));
        });
      }
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return result;
  }, [productsList, selectedCategory, selectedBrand, selectedVibe, searchQuery, filterType, customMaxPrice, sortBy, selectedMaterial]);

  // Compute live product counts for each fabric material
  const materialCounts = useMemo(() => {
    const counts: Record<string, number> = { all: productsList.length };
    FABRIC_MATERIALS.forEach((mat) => {
      if (mat.id === 'all') return;
      counts[mat.id] = productsList.filter((p) => {
        const combined = [
          p.name,
          p.description,
          p.subcategory || '',
          ...(p.highlights || []),
          ...(p.specifications || []).map((s) => `${s.label} ${s.value}`),
        ]
          .join(' ')
          .toLowerCase();
        return mat.keywords.some((k) => combined.includes(k));
      }).length;
    });
    return counts;
  }, [productsList]);

  // Paginated visible products
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Infinite scroll observer: Automatically load next 8 products
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < filteredProducts.length) {
              return prev + 8;
            }
            return prev;
          });
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredProducts.length]);

  const wishlistedProducts = useMemo(() => {
    return productsList.filter((p) => wishlistIds.includes(p.id));
  }, [productsList, wishlistIds]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.quantity, 0);
  }, [cartItems]);

  const currentBottomTab = useMemo(() => {
    if (activeView === 'orders') return 'orders';
    if (activeView === 'dashboard') return 'profile';
    return activeMobileTab;
  }, [activeView, activeMobileTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 pb-16 md:pb-0">
      
      {/* 1. Header with Search, Category Dropdown, Location & Auth */}
      <Header
        cartItems={cartItems}
        wishlistCount={wishlistIds.length}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onSelectProduct={(p) => openProduct(p)}
        allProducts={productsList}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveView('home');
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q) setActiveView('home');
        }}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        onNavigateView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        deliveryLocation={deliveryLocation}
        onOpenMeeshoDrawer={() => setIsMeeshoDrawerOpen(true)}
      />

      {/* Order Success Top Banner (if recently ordered) */}
      {orderSuccessBanner && (
        <div className="bg-slate-900 border-b border-amber-500/40 text-white py-3 px-4 shadow-md animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Order Placed! <strong>{orderSuccessBanner.id}</strong> confirmed via Cash on Delivery. Share OTP <strong className="font-mono bg-amber-400 text-slate-950 px-2 py-0.5 rounded tracking-wider">{orderSuccessBanner.otp}</strong> with delivery associate.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTrackedOrder(orderSuccessBanner);
                  setIsTrackOrderOpen(true);
                }}
                className="px-3.5 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-lg hover:bg-amber-500 transition-colors cursor-pointer"
              >
                Track Live
              </button>
              <button
                onClick={() => setOrderSuccessBanner(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Views Routing */}
      <Suspense fallback={<ViewLoading />}>
        {activeView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            wishlistCount={wishlistIds.length}
            orders={orders}
            onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
            onOpenWishlist={() => setIsWishlistOpen(true)}
            onOpenOrders={() => setActiveView('orders')}
            onOpenRefer={() => setActiveView('refer')}
            onOpenCatalogue={() => setActiveView('home')}
            onViewInvoice={(order) => setInvoiceOrder(order)}
            onOpenAddresses={() => setActiveView('addresses')}
            onOpenSupport={() => setActiveView('support')}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            onOpenTrackOrder={(o) => {
              if (o) setActiveTrackedOrder(o);
              setIsTrackOrderOpen(true);
            }}
            onViewInvoice={(order) => setInvoiceOrder(order)}
            onReorder={handleReorder}
            onBackToShop={() => setActiveView('home')}
          />
        )}

        {activeView === 'addresses' && (
          <AddressesView
            onSelectAddress={(addr) => setSavedAddress(addr)}
            onBackToShop={() => setActiveView('home')}
          />
        )}

        {activeView === 'refer' && (
          <ReferView
            referralCode={currentUser?.referralCode || 'APNABAZAR'}
            onExploreProducts={() => setActiveView('home')}
          />
        )}

        {activeView === 'support' && (
          <SupportView
            onBackToShop={() => setActiveView('home')}
          />
        )}

        {/* Policy Pages */}
        {(activeView === 'about' || 
          activeView === 'shipping' || 
          activeView === 'returns' || 
          activeView === 'cancellation' || 
          activeView === 'terms' || 
          activeView === 'privacy' || 
          activeView === 'disclaimer') && (
          <PolicyView
            policyType={activeView}
            onBackToShop={() => setActiveView('home')}
          />
        )}
      </Suspense>

      {activeView === 'home' && (
        <>
          {/* 1. Hero Banner with Countdown & Spotlight Deals */}
          <HeroBanner
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setCustomMaxPrice(null);
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreShop={() => {
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCouponModal={() => setIsOffersOpen(true)}
            onSelectProductById={(prodId) => {
              const p = productsList.find((x) => x.id === prodId);
              if (p) {
                openProduct(p);
              }
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onAddToCartDirect={(deal) => {
              const matched = productsList.find((x) => x.id === deal.targetProductId) || PRODUCTS.find((x) => x.id === deal.targetProductId);
              if (matched) {
                handleAddToCart(matched, undefined, undefined, deal.dealPrice);
              }
            }}
            onFilterByPrice={(maxPrice) => {
              setCustomMaxPrice(maxPrice);
              setSelectedCategory('all');
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectBrand={(brandName) => {
              setSelectedBrand(brandName);
              setSelectedVibe(null);
              setSelectedCategory('all');
              setSelectedMaterial('all');
              setCustomMaxPrice(null);
              setSearchQuery('');
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectVibe={(vibeName) => {
              setSelectedVibe(vibeName);
              setSelectedBrand(null);
              setSelectedCategory('all');
              setSelectedMaterial('all');
              setCustomMaxPrice(null);
              setSearchQuery('');
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onAddToCartProduct={handleAddToCart}
            onBuyNowProduct={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            cartCount={cartItems.reduce((sum, it) => sum + it.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            pincode={selectedPincode}
          />

          {/* 2. User Explicit Request: "isme banner ke baad shop by category do" */}
          <div ref={categorySectionRef} id="shop-by-category" className="scroll-mt-16">
            <TopCategoryStrip
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setCustomMaxPrice(null);
                productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenMeeshoDrawer={() => setIsMeeshoDrawerOpen(true)}
            />
          </div>



          {/* 3. Catalog Section with Integrated Filter & Sort Controls */}
          <main ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
            
            {/* Section Title & Live Stats */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedBrand
                    ? `${selectedBrand} Brand Store`
                    : selectedVibe
                    ? `✨ ${selectedVibe} Vibe Collection`
                    : selectedCategory === 'all'
                    ? (searchQuery ? `Results for "${searchQuery}"` : 'Trending Collections')
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Collections'}
                </h2>
                <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {filteredProducts.length} Styles Available
                </span>
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black shadow-xs">
                    <span>Brand: {selectedBrand}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand(null);
                        setSearchQuery('');
                      }}
                      className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedVibe && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 text-xs font-black shadow-xs">
                    <span>✨ Vibe: {selectedVibe}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedVibe(null)}
                      className="w-4 h-4 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 ml-1 underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>

            {/* Unified Filter & Sort Bar (Sort integrated inside filter as requested) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/80 p-2.5 rounded-2xl border border-slate-200">
              
              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" /> Filter:
                </span>

                {/* Custom price drop active chip */}
                {customMaxPrice !== null && (
                  <button
                    type="button"
                    onClick={() => setCustomMaxPrice(null)}
                    className="px-3 py-1 rounded-full text-xs font-black whitespace-nowrap border border-amber-500 bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-2xs cursor-pointer animate-fadeIn"
                  >
                    <span>Under ₹{customMaxPrice}</span>
                    <span className="font-mono text-xs">✕</span>
                  </button>
                )}

                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'deals', label: '⚡ Flash Deals (60%+ OFF)' },
                  { id: 'bestsellers', label: '⭐ Bestsellers' },
                  { id: 'rating4plus', label: '★ 4.7+ Rated' },
                  { id: 'under999', label: '🏷️ Under ₹799' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setFilterType(chip.id as any);
                      if (chip.id !== 'all') setCustomMaxPrice(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      filterType === chip.id && customMaxPrice === null
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Integrated Sort By (Inside filter bar) */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Biggest Discount %</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>

            </div>

            {/* Material & Fabric Filter Section (Silk, Wool, Cotton, Polyester, Denim, Linen, etc.) */}
            <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-sm font-black shadow-2xs">
                    🧵
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      Shop by Material / फैब्रिक व मटेरियल
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                      (Touch any fabric swatch to explore 100% genuine weaves)
                    </span>
                  </div>

                  {selectedMaterial !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black border border-amber-500 shadow-2xs">
                      <span>{FABRIC_MATERIALS.find((m) => m.id === selectedMaterial)?.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedMaterial('all')}
                        className="w-4 h-4 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] hover:bg-slate-800 cursor-pointer"
                        title="Remove material filter"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>

                {selectedMaterial !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial('all')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Clear Material Filter</span>
                    <span className="text-[10px]">✕</span>
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Visual Material Swatch Cards with Images on Top & Names Clearly Written Underneath */}
              <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth py-1">
                {FABRIC_MATERIALS.map((mat) => {
                  const isSelected = selectedMaterial === mat.id;
                  const count = materialCounts[mat.id] ?? 0;

                  return (
                    <div
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterial(isSelected && mat.id !== 'all' ? 'all' : mat.id);
                      }}
                      className={`w-28 sm:w-32 shrink-0 p-2.5 rounded-2xl cursor-pointer text-center group active:scale-95 snap-start flex flex-col items-center justify-between border-2 transition-all duration-300 select-none ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300/80 scale-[1.02]'
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-sm'
                      }`}
                    >
                      {/* Fabric Texture Swatch Image */}
                      <div
                        className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden relative border transition-transform duration-300 group-hover:scale-105 shadow-inner ${
                          isSelected ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200/90 bg-slate-100'
                        }`}
                      >
                        <img
                          src={mat.image}
                          alt={mat.name}
                          loading="eager"
                          decoding="async"
                          onError={(e) => recoverImage(e.currentTarget)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs border border-white">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Material Name Written Prominently & Cleanly Underneath Image */}
                      <div className="mt-2.5 w-full space-y-0.5 text-center">
                        <p
                          className={`text-xs sm:text-[13px] font-black tracking-tight leading-tight ${
                            isSelected ? 'text-amber-700' : 'text-slate-900 group-hover:text-amber-600'
                          }`}
                        >
                          {mat.name}
                        </p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 leading-tight">
                          {mat.hindi}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-amber-100 group-hover:text-amber-900'
                          }`}
                        >
                          {count} {mat.id === 'all' ? 'Total' : 'Styles'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Grid */}
            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {visibleProducts.map((product) => {
                  const inCart = cartItems.find((it) => it.product.id === product.id);
                  const qty = inCart ? inCart.quantity : 0;
                  const isWish = wishlistIds.includes(product.id);

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantityInCart={qty}
                      isWishlisted={isWish}
                      activeVibeColor={selectedVibe}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectProduct={(p) => openProduct(p)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search query, selecting &quot;All Collections&quot;, or clearing active filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedMaterial('all');
                    setSelectedBrand(null);
                    setSelectedVibe(null);
                    setCustomMaxPrice(null);
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Sentinel for Infinite Scroll (loads 8 products on scroll) */}
            <div ref={sentinelRef} className="h-6 w-full" />

            {/* 8-Product Increment Button ("product load 8per produch scroll pri se load 8 product") */}
            {visibleProducts.length < filteredProducts.length && (
              <div className="text-center pt-4 pb-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="px-8 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Load Next 8 Styles ({filteredProducts.length - visibleProducts.length} remaining)
                </button>
              </div>
            )}

          </main>

          {/* User Explicit Request: "Why Shop From Apna Bazar" placed AFTER products & Load More */}
          <WhyShopSection
            onExploreShop={() => {
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Customer Reviews Section */}
          <CustomerReviewsSection />
        </>
      )}

      {/* Floating Quick Actions (WhatsApp, Bag, Scroll to Top) */}
      <FloatingActions
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        cartCount={totalCartCount}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(catId) => {
          setActiveView('home');
          setSelectedCategory(catId);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onNavigateView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onExploreShop={() => {
          setActiveView('home');
          productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={currentBottomTab}
        onSelectTab={(tab) => {
          if (tab === 'home') {
            setActiveView('home');
            setActiveMobileTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'categories') {
            setIsMeeshoDrawerOpen(true);
          } else if (tab === 'cart') {
            setIsCartOpen(true);
          } else if (tab === 'orders') {
            setActiveView('orders');
            setActiveMobileTab('orders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'profile') {
            setActiveMobileTab('profile');
            if (currentUser?.isLoggedIn) {
              setActiveView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setIsLoginOpen(true);
            }
          }
        }}
        cartCount={totalCartCount}
      />

      {/* Dashboard Options Modal */}
      <DashboardOptionsModal
        isOpen={isDashboardOptionsOpen}
        onClose={() => setIsDashboardOptionsOpen(false)}
        onSelectOption={(opt) => {
          if (opt === 'refer') setActiveView('refer');
          else if (opt === 'complaints' || opt === 'support') setActiveView('support');
          else if (opt === 'wishlist') setIsWishlistOpen(true);
          else if (opt === 'addresses') setActiveView('addresses');
          else if (opt === 'logout') {
            localStorage.removeItem('ab_user');
            setCurrentUser(null);
          }
        }}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        quantityInCart={
          selectedProduct
            ? (cartItems.find((it) => it.product.id === selectedProduct.id)?.quantity || 0)
            : 0
        }
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        initialVibeColor={selectedVibe}
        onClose={closeProduct}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleWishlist={handleToggleWishlist}
        onBuyNow={handleBuyNow}
        onRequireLogin={() => setIsLoginOpen(true)}
        pincode={selectedPincode}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        riderTip={0}
        onSetRiderTip={() => {}}
      />

      <Suspense fallback={null}>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            appliedCoupon={appliedCoupon}
            savedAddress={savedAddress}
            onSaveAddress={setSavedAddress}
            onOrderPlaced={handleOrderPlaced}
            userId={currentUser?.id}
            walletBalance={currentUser?.walletBalance ?? 0}
            onDeductWalletCoins={handleDeductWalletCoins}
          />
        )}

        {isTrackOrderOpen && (
          <TrackOrderModal
            isOpen={isTrackOrderOpen}
            onClose={() => setIsTrackOrderOpen(false)}
            activeOrder={activeTrackedOrder}
            allOrders={orders}
            onOrderUpdated={(updated) => {
              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            }}
          />
        )}
      </Suspense>

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistedProducts={wishlistedProducts}
        onAddToCart={(p) => handleAddToCart(p)}
        onRemoveFromWishlist={handleToggleWishlist}
      />

      <OffersModal
        isOpen={isOffersOpen}
        onClose={() => setIsOffersOpen(false)}
        onApplyCoupon={(c) => {
          setAppliedCoupon(c);
          setIsCartOpen(true);
        }}
        appliedCoupon={appliedCoupon}
      />

      <PincodeModal
        isOpen={isPincodeOpen}
        onClose={() => setIsPincodeOpen(false)}
        currentPincode={selectedPincode}
        onPincodeSelected={setSelectedPincode}
      />

      {/* User Request: Lightweight Turn On Location Startup Popup (No map overload on start) */}
      <TurnOnLocationPopup
        isOpen={isTurnOnLocationPopupOpen}
        onClose={() => setIsTurnOnLocationPopupOpen(false)}
        onLocationConfirmed={handleLocationConfirmed}
        onOpenFullMap={() => setIsLocationModalOpen(true)}
      />

      {/* User Request: Visual Card Location Permission Check Modal (Full map on demand) */}
      <Suspense fallback={null}>
        {isLocationModalOpen && (
          <LocationPermissionModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            currentPincode={selectedPincode}
            onConfirmPincode={handleLocationConfirmed}
          />
        )}
      </Suspense>

      {/* User Request: Subtle Floating Promo Code Notification Toast */}
      <PromoNotificationToast
        onApplyCoupon={(c) => {
          setAppliedCoupon(c);
        }}
        appliedCoupon={appliedCoupon}
      />

      {/* User Request: Cart Added Animation Toast */}
      <CartToast
        item={cartToastItem}
        onClose={() => setCartToastItem(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Suspense fallback={null}>
        {isVoiceSearchOpen && (
          <VoiceSearchModal
            isOpen={isVoiceSearchOpen}
            onClose={() => setIsVoiceSearchOpen(false)}
            onSearch={(q) => {
              setSearchQuery(q);
              setActiveView('home');
              setSelectedCategory('all');
            }}
          />
        )}

        {isDeliveryRadiusOpen && (
          <DeliveryRadiusModal
            isOpen={isDeliveryRadiusOpen}
            onClose={() => setIsDeliveryRadiusOpen(false)}
            onSelectLocation={(locationName, coords, distance) => {
              const locDisplay = `${locationName} (${distance})`;
              setDeliveryLocation(locDisplay);
              try {
                localStorage.setItem('ab_delivery_location', locDisplay);
              } catch {}
              setSavedAddress((prev) => ({
                ...prev,
                streetAddress: locationName,
                landmark: prev.landmark || 'Near Shitla Mandir / Central Hub',
                city: 'Baharagora',
                state: 'Jharkhand',
                pincode: '832101',
              }));
            }}
          />
        )}

        {/* Meesho-Style 2-Pane Dual-Column Category Drawer */}
        <MeeshoCategoryDrawer
          isOpen={isMeeshoDrawerOpen}
          onClose={() => setIsMeeshoDrawerOpen(false)}
          onSelectCategory={(categoryId, filterKeyword) => {
            setSelectedCategory(categoryId);
            setSearchQuery(filterKeyword || '');
            setActiveView('home');
            setIsMeeshoDrawerOpen(false);
            setTimeout(() => {
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          selectedCategory={selectedCategory}
        />

        {invoiceOrder && (
          <InvoiceModal
            order={invoiceOrder}
            onClose={() => setInvoiceOrder(null)}
          />
        )}
      </Suspense>

      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        products={productsList}
        orders={orders}
        cartItems={cartItems}
        user={currentUser}
        onSelectProduct={openProduct}
      />

    </div>
  );
}
