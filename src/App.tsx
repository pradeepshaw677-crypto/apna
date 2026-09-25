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
  Banknote
} from 'lucide-react';
import { 
  CategoryId, 
  Product, 
  CartItem, 
  Coupon, 
  DeliveryAddress, 
  Order, 
  UserProfile 
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
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { AddressesView } from './components/AddressesView';
import { ReferView } from './components/ReferView';
import { SupportView } from './components/SupportView';
import { PolicyView } from './components/PolicyView';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardOptionsModal } from './components/DashboardOptionsModal';
import { DeliveryRadiusModal } from './components/DeliveryRadiusModal';
import { InvoiceModal } from './components/InvoiceModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
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
      return saved ? JSON.parse(saved) : {
        id: 'usr-bhabani-2026',
        name: 'Bhabani Shit',
        email: 'thegroceryhub2025@gmail.com',
        phone: '6207462800',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        isLoggedIn: true,
        membership: 'Grocery Hub Gold Member',
        referralCode: 'BHABANI2026',
        totalOrders: 6,
        totalSpent: 2203,
      };
    } catch {
      return null;
    }
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
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
  const [visibleCount, setVisibleCount] = useState(16);

  const productSectionRef = useRef<HTMLDivElement>(null);

  // Test Firebase connection on boot (Mandatory Skill requirement)
  useEffect(() => {
    testConnection().then(() => {
      console.log("Firebase connection verified for The Grocery Hub.");
    });
  }, []);

  // Fetch live products from backend
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

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, searchQuery, filterType, sortBy]);

  // Set latest order to tracked
  useEffect(() => {
    if (orders.length > 0 && !activeTrackedOrder) {
      setActiveTrackedOrder(orders[0]);
    }
  }, [orders, activeTrackedOrder]);

  // Cart actions
  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    setCartItems((prev) => {
      const matchIndex = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === size
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
          selectedSize: size || product.unit || (product.sizes?.[0]),
          selectedColor: color,
        },
      ];
    });
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

  const handleBuyNow = (product: Product, size?: string, color?: string) => {
    handleAddToCart(product, size, color);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setActiveTrackedOrder(order);
    setOrderSuccessBanner(order);
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
          (p.hindiName && p.hindiName.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'deals') {
        result = result.filter((p) => p.isFlashDeal || p.discountPercent >= 10);
      } else if (selectedCategory === 'bestseller') {
        result = result.filter((p) => p.isBestSeller);
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    // Secondary filter chips
    if (filterType === 'deals') {
      result = result.filter((p) => p.discountPercent >= 10 || p.isFlashDeal);
    } else if (filterType === 'bestsellers') {
      result = result.filter((p) => p.isBestSeller);
    } else if (filterType === 'rating4plus') {
      result = result.filter((p) => p.rating >= 4.5);
    } else if (filterType === 'under999') {
      result = result.filter((p) => p.price <= 200);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort(
        (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.reviewsCount - a.reviewsCount
      );
    }

    return result;
  }, [productsList, selectedCategory, searchQuery, filterType, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const wishlistedProducts = useMemo(() => {
    return productsList.filter((p) => wishlistIds.includes(p.id));
  }, [productsList, wishlistIds]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Bottom Nav active tab computation
  const currentBottomTab = useMemo<'dashboard' | 'home' | 'orders' | 'profile' | 'more'>(() => {
    if (activeView === 'home') return 'home';
    if (activeView === 'orders') return 'orders';
    if (activeView === 'dashboard') return 'dashboard';
    return 'more';
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 pb-20 md:pb-0">
      
      {/* 1. Header Navigation - Light Theme with Glowing Gradients & Voice Search */}
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
      />

      {/* Top Image Category Carousel matching modern shopping apps */}
      <TopCategoryStrip
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setActiveView('home');
          productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Order Success Top Banner (if recently ordered) */}
      {orderSuccessBanner && (
        <div className="bg-emerald-600 text-white py-3 px-4 shadow-md animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <span>
                Order Placed! <strong>{orderSuccessBanner.id}</strong> confirmed via Cash on Delivery. Share OTP <strong className="font-mono bg-emerald-800 px-2 py-0.5 rounded tracking-wider">{orderSuccessBanner.otp}</strong> with delivery associate.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTrackedOrder(orderSuccessBanner);
                  setIsTrackOrderOpen(true);
                }}
                className="px-3.5 py-1 bg-white text-emerald-900 text-xs font-black rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Track Live
              </button>
              <button
                onClick={() => setOrderSuccessBanner(null)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
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

      {/* Policy Pages (About Us, Cancellation, Refund/Returns, Shipping, Terms, Privacy, Disclaimer) */}
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
          {/* Hero Banner with Countdown & Spotlight Deals */}
          <HeroBanner
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreShop={() => {
              productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCouponModal={() => setIsOffersOpen(true)}
          />

          {/* Catalog Section with Filter & Sort Controls */}
          <main ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
            
            {/* Section Title & Live Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {selectedCategory === 'all'
                      ? 'All Fresh Groceries & Essentials'
                      : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Catalog'}
                  </h2>
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {filteredProducts.length} Items Available
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  100% Genuine Quality • 15-Minute Doorstep Express in Baharagora • Cash on Delivery Available
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
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
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
                { id: 'deals', label: '⚡ Big Deals & Offers' },
                { id: 'bestsellers', label: '⭐ Bestsellers' },
                { id: 'rating4plus', label: '★ 4.5+ Rated' },
                { id: 'under999', label: '🏷️ Under ₹200' },
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
                  Try adjusting your search query, selecting &quot;All Categories&quot;, or clearing active filters.
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

            {/* Load More Button if more available */}
            {visibleProducts.length < filteredProducts.length && (
              <div className="text-center pt-6 pb-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Load More Products ({filteredProducts.length - visibleProducts.length} remaining)
                </button>
              </div>
            )}

          </main>

          {/* Customer Reviews Section matching screenshot */}
          <CustomerReviewsSection />
        </>
      )}

      {/* 3. Floating Quick Actions (WhatsApp, Call, Bag, Scroll to Top) */}
      <FloatingActions
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
      />

      {/* 4. Footer matching screenshot layout */}
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

      {/* 5. Mobile Bottom Navigation matching screenshot */}
      <MobileBottomNav
        activeTab={currentBottomTab}
        onSelectTab={(tab) => {
          if (tab === 'home') {
            setActiveView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'orders') {
            setActiveView('orders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'dashboard') {
            if (currentUser?.isLoggedIn) {
              setActiveView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setIsLoginOpen(true);
            }
          } else if (tab === 'profile') {
            if (currentUser?.isLoggedIn) {
              setActiveView('dashboard');
            } else {
              setIsLoginOpen(true);
            }
          } else if (tab === 'more') {
            setIsDashboardOptionsOpen(true);
          }
        }}
        cartCount={totalCartCount}
      />

      {/* 6. Dashboard Options Modal (Triggered by 'More' on mobile or header) */}
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

      {/* 7. Modals & Drawers */}
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
