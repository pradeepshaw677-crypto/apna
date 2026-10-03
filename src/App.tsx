import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { testConnection } from './firebase';
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
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { WishlistModal } from './components/WishlistModal';
import { OffersModal } from './components/OffersModal';
import { PincodeModal } from './components/PincodeModal';
import { LocationPermissionModal } from './components/LocationPermissionModal';
import { PromoNotificationToast } from './components/PromoNotificationToast';
import { CartToast, CartToastItem } from './components/CartToast';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { AddressesView } from './components/AddressesView';
import { ReferView } from './components/ReferView';
import { SupportView } from './components/SupportView';
import { PolicyView } from './components/PolicyView';
import { WhyShopSection } from './components/WhyShopSection';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { DashboardOptionsModal } from './components/DashboardOptionsModal';
import { DeliveryRadiusModal } from './components/DeliveryRadiusModal';
import { InvoiceModal } from './components/InvoiceModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { ReturnRequestModal } from './components/ReturnRequestModal';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';

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

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ab_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Bottom Navigation tab state
  const [activeBottomTab, setActiveBottomTab] = useState<MobileTab>('home');

  // Delivery Location & Verification State
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return localStorage.getItem('ab_delivery_location') || 'Baharagora 832101 (Jharkhand)';
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(() => {
    return !localStorage.getItem('ab_location_verified');
  });

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
  const [isDashboardOptionsOpen, setIsDashboardOptionsOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);
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

  // Catalog, Filter & Search
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deals' | 'bestsellers' | 'rating4plus' | 'under999'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'discount' | 'rating'>('popular');
  
  // 8 Products per batch pagination & infinite scroll
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('home');

  const productSectionRef = useRef<HTMLDivElement>(null);
  const categorySectionRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Auto-clear cart toast after 3.5s
  useEffect(() => {
    if (cartToastItem) {
      const timer = setTimeout(() => {
        setCartToastItem(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [cartToastItem]);

  // Test Firebase connection on boot (Mandatory Skill requirement)
  useEffect(() => {
    testConnection().then(() => {
      console.log("Firebase connection verified for Apna Bazar.");
    });
  }, []);

  // Fetch live products from backend with fallback
  useEffect(() => {
    let isMounted = true;
    api.getProducts().then((res) => {
      if (isMounted && res.products && res.products.length > 0) {
        setProductsList(res.products);
      }
    }).catch(() => {
      // Fallback to static PRODUCTS
    });
    return () => { isMounted = false; };
  }, []);

  // Sync orders from server
  useEffect(() => {
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
  }, []);

  // Persist storage
  useEffect(() => { saveCart(cartItems); }, [cartItems]);
  useEffect(() => { saveWishlist(wishlistIds); }, [wishlistIds]);
  useEffect(() => { saveOrders(orders); }, [orders]);
  useEffect(() => { saveAddress(savedAddress); }, [savedAddress]);

  // Reset pagination to 8 on filter change
  useEffect(() => {
    setVisibleCount(8);
  }, [selectedCategory, searchQuery, filterType, sortBy]);

  // Set latest order to tracked
  useEffect(() => {
    if (orders.length > 0 && !activeTrackedOrder) {
      setActiveTrackedOrder(orders[0]);
    }
  }, [orders, activeTrackedOrder]);

  // Dynamic Add to Cart with size adjustment & animation
  const handleAddToCart = (product: Product, size?: string, color?: string, priceOverride?: number) => {
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

  const handleBuyNow = (product: Product, size?: string, color?: string, priceOverride?: number) => {
    handleAddToCart(product, size, color, priceOverride);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
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

  // Return Request & AB Coin Wallet Credit Flow
  const handleOpenReturnModal = (order: Order) => {
    setSelectedReturnOrder(order);
    setIsReturnModalOpen(true);
  };

  const handleReturnProcessed = (updatedOrder: Order, refundedCoins: number) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (currentUser) {
      const newBalance = (currentUser.walletBalance || 0) + refundedCoins;
      const newTx: WalletTransaction = {
        id: `tx-return-${Date.now()}`,
        type: 'credit',
        amount: refundedCoins,
        title: `Return Refund - Order #${updatedOrder.id}`,
        description: `Full product value credited in AB Coins for shopping`,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        orderId: updatedOrder.id,
      };
      const updatedUser: UserProfile = {
        ...currentUser,
        walletBalance: newBalance,
        walletTransactions: [newTx, ...(currentUser.walletTransactions || [])],
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('ab_user', JSON.stringify(updatedUser));
    }
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
      localStorage.setItem('ab_user', JSON.stringify(updatedUser));
    }
  };

  // Location verified callback & auto-fill
  const handleLocationConfirmed = (pin: string, addressStr: string, isExpressZone: boolean) => {
    localStorage.setItem('ab_location_verified', 'true');
    setDeliveryLocation(addressStr);
    localStorage.setItem('ab_delivery_location', addressStr);
    setSelectedPincode(pin);

    // Auto-fill savedAddress for seamless checkout
    setSavedAddress((prev) => {
      const updated: DeliveryAddress = {
        ...prev,
        streetAddress: addressStr,
        pincode: pin,
        city: addressStr.includes('Baharagora') ? 'Baharagora' : (prev.city || 'Baharagora'),
        state: 'Jharkhand',
        area: isExpressZone ? 'Baharagora 10-KM Hub Zone' : (prev.area || 'Baharagora Central Area'),
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
  }, [productsList, selectedCategory, searchQuery, filterType, sortBy]);

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
        onLogout={() => {
          localStorage.removeItem('ab_user');
          setCurrentUser(null);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onSelectProduct={(p) => setSelectedProduct(p)}
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
          referralCode={currentUser?.referralCode || 'BHABANI2026'}
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

      {activeView === 'home' && (
        <>
          {/* 1. Hero Banner with Countdown & Spotlight Deals */}
          <HeroBanner
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreShop={() => {
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCouponModal={() => setIsOffersOpen(true)}
            onSelectProductById={(prodId) => {
              const p = productsList.find((x) => x.id === prodId);
              if (p) {
                setSelectedProduct(p);
              }
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 2. User Explicit Request: "isme banner ke baad shop by category do" */}
          <div ref={categorySectionRef} id="shop-by-category" className="scroll-mt-16">
            <TopCategoryStrip
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          {/* 3. Catalog Section with Filter & Sort Controls */}
          <main ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
            
            {/* Section Title & Live Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {selectedCategory === 'all'
                      ? 'Trending Fashion, Footwear, Toys & Accessories'
                      : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Collections'}
                  </h2>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {filteredProducts.length} Styles Available
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  100% Genuine Branded Quality • 15-Minute Express in Jharkhand • Cash on Delivery &amp; 5-Day Returns
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" /> Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                >
                  <option value="popular">Popularity &amp; Bestsellers</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Biggest Discount %</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" /> Filter:
              </span>

              {[
                { id: 'all', label: 'All Items' },
                { id: 'deals', label: '⚡ Flash Deals (60%+ OFF)' },
                { id: 'bestsellers', label: '⭐ Bestsellers' },
                { id: 'rating4plus', label: '★ 4.7+ Rated' },
                { id: 'under999', label: '🏷️ Under ₹799' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFilterType(chip.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    filterType === chip.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
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
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectProduct={(p) => setSelectedProduct(p)}
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
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset Filters
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
            setActiveView('home');
            setActiveMobileTab('categories');
            setTimeout(() => {
              categorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
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
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleWishlist={handleToggleWishlist}
        onBuyNow={handleBuyNow}
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

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        activeOrder={activeTrackedOrder}
        allOrders={orders}
        onOrderUpdated={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />

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

      {/* User Request: Visual Card Location Permission Check Modal */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentPincode={selectedPincode}
        onConfirmPincode={handleLocationConfirmed}
      />

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
        onLoginSuccess={(u) => setCurrentUser(u)}
      />

      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearch={(q) => {
          setSearchQuery(q);
          setActiveView('home');
          setSelectedCategory('all');
        }}
      />

      <DeliveryRadiusModal
        isOpen={isDeliveryRadiusOpen}
        onClose={() => setIsDeliveryRadiusOpen(false)}
      />

      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

    </div>
  );
}
