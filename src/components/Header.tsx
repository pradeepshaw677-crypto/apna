import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Percent, 
  ChevronDown, 
  User, 
  LogOut, 
  Package, 
  Gift, 
  HelpCircle, 
  Heart, 
  SlidersHorizontal, 
  CheckCircle2, 
  Phone, 
  Sparkles,
  Truck,
  Bell,
  Mic,
  Star,
  ArrowRight,
  Settings,
  Globe,
  RotateCcw,
  Tag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Product, CartItem, UserProfile } from '../types';
import { CATEGORIES } from '../data/products';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  cartItems: CartItem[];
  wishlistCount: number;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenVoiceSearch: () => void;
  onNavigateView: (view: 'home' | 'dashboard' | 'orders' | 'addresses' | 'refer' | 'support' | 'about' | 'shipping' | 'returns' | 'cancellation' | 'terms' | 'privacy' | 'disclaimer') => void;
  onOpenLocationModal?: () => void;
  deliveryLocation?: string;
}

const PLACEHOLDER_TEXTS = [
  "Search for oversized tees, denim & kurtas...",
  "Search for running sneakers & formal loafers...",
  "Search for RC drift cars & building blocks...",
  "Search for AMOLED smart watches & sunglasses...",
  "Search for 15-min fashion delivery in Jharkhand...",
];

const POPULAR_SEARCH_CHIPS = [
  'Oversized Graphic Tees',
  'Air Cushion Running Shoes',
  'Casual Sneakers',
  'RC Drift Racing Car',
  'AMOLED Smart Watch',
  'Aviator Sunglasses',
  'Cotton Kurta Set',
  'Denim Jeans',
];

export const Header: React.FC<HeaderProps> = ({
  cartItems,
  wishlistCount,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenCart,
  onOpenWishlist,
  onSelectProduct,
  allProducts,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onOpenVoiceSearch,
  onNavigateView,
  onOpenLocationModal,
  deliveryLocation = 'Baharagora 832101',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);

  // App Settings state inside slidebar
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [orderAlertsEnabled, setOrderAlertsEnabled] = useState(true);
  const [expressDeliveryActive, setExpressDeliveryActive] = useState(true);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Animated placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Filter search recommendations
  const searchResults = searchQuery.trim()
    ? allProducts
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setIsCategoryDropdownOpen(false);
    setIsSidebarOpen(false);
    onNavigateView('home');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleProductItemClick = (product: Product) => {
    onSelectProduct(product);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    onNavigateView('home');
    window.scrollTo({ top: 450, behavior: 'smooth' });
  };

  const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Collections';

  // Compact display of location ("deliver to ka area ghata dao")
  const compactLocationDisplay = deliveryLocation
    .replace(' (Jharkhand)', '')
    .replace(' (15m)', '')
    .trim();

  // Render Search Autocomplete Dropdown List with <li> Items
  const renderSearchResults = (isMobile = false) => {
    return (
      <div className={`bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fadeIn ${
        isMobile ? 'mt-2 border-amber-300' : 'absolute left-0 right-0 top-full mt-2'
      }`}>
        {searchQuery.trim() ? (
          searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
                <span>Matching Styles ({searchResults.length})</span>
                <span className="text-[10px] text-amber-700 font-bold">15-Min Delivery in Jharkhand</span>
              </div>
              
              <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductItemClick(product)}
                    className="px-4 py-2.5 hover:bg-amber-50/80 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          <span className="font-semibold text-slate-700">{product.brand}</span> • {product.subcategory || product.category}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-amber-900">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            {product.discountPercent}% OFF
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-700 text-[11px] font-bold shrink-0 transition-colors"
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center justify-center gap-1 mx-auto"
                >
                  <span>See all results for &ldquo;{searchQuery}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs font-bold text-slate-700">No styles found matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-[11px] text-slate-500">Try searching for tees, shirts, shoes, watches or toys.</p>
            </div>
          )
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Trending Searches in Jharkhand</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCH_CHIPS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item);
                    setIsSearchFocused(false);
                    setIsMobileSearchFocused(false);
                    onNavigateView('home');
                    window.scrollTo({ top: 450, behavior: 'smooth' });
                  }}
                  className="text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 px-3 py-1.5 rounded-full font-medium transition-colors border border-slate-200 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 shadow-xs">
      
      {/* 1. Top Bar */}
      <div className="bg-[#0f172a] text-white py-1 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold text-center tracking-wide flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 mx-auto">
          <span className="flex items-center gap-1.5 shrink-0 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Apna Bazar Fashion Bonanza</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="hidden md:inline-flex items-center gap-1 shrink-0 text-slate-200">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Free Express Delivery Above ₹499</span>
          </span>
          <span className="text-slate-500 hidden md:inline">•</span>
          <a 
            href="tel:6207462800"
            className="inline-flex items-center gap-1.5 shrink-0 text-amber-400 hover:text-amber-300 transition-colors font-bold"
          >
            <Phone className="w-3 h-3 text-amber-400" />
            <span>Jharkhand Helpline: 6207462800</span>
          </a>
        </div>
      </div>

      {/* 2. Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2 sm:gap-6">
          
          {/* Hamburger Menu & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-800 hover:bg-amber-100 hover:text-slate-950 transition-colors cursor-pointer"
              title="Open Navigation Menu & Settings"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            <BrandLogo onClick={() => onNavigateView('home')} />
          </div>

          {/* Desktop Search Bar with Voice Mic & Autocomplete Dropdown */}
          <div ref={desktopSearchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-full pl-11 pr-24 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none focus:ring-3 focus:ring-amber-500/20 transition-all font-medium"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
              
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {/* Voice Search Microphone Button */}
                <button
                  type="button"
                  onClick={onOpenVoiceSearch}
                  title="Search with Voice Microphone"
                  className="p-1.5 rounded-full text-slate-600 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-amber-600" />
                </button>

                {/* Circular Search Submit Button */}
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Desktop Autocomplete Dropdown */}
            {isSearchFocused && renderSearchResults(false)}
          </div>

          {/* Action Icons: Notifications, Wishlist, Bag, User Login */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              </button>

              {/* Notification Popup */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Store Notifications</span>
                    <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Live</span>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                      <p className="font-bold text-slate-900">🎉 Express Delivery Live in Jharkhand</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">15-minute doorstep fashion and footwear delivery active within 10 km!</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-bold text-slate-900">⚡ Promo Code FASHION100</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">Flat ₹100 discount on orders above ₹499 with free delivery.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button (Desktop) */}
            <button
              onClick={onOpenWishlist}
              className="hidden sm:flex items-center justify-center p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-950 text-amber-300 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-black">Bag</span>
            </button>

            {/* User Profile / Login */}
            <div ref={userMenuRef} className="relative">
              {currentUser?.isLoggedIn ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-amber-400"
                    />
                    <span className="hidden lg:inline text-xs font-bold text-slate-800 max-w-[85px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          {currentUser.membership || 'Apna Bazar VIP Plus'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateView('dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateView('orders');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders &amp; 5-Day Returns</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateView('addresses');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateView('refer');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span>Refer &amp; Earn ₹200</span>
                      </button>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Row with Microphone & Autocomplete Dropdown */}
        <div ref={mobileSearchRef} className="relative md:hidden pb-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsMobileSearchFocused(true);
              }}
              onFocus={() => setIsMobileSearchFocused(true)}
              placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
              className="w-full bg-slate-100 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-9 pr-20 py-2 border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            
            <div className="absolute right-1.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Mobile Microphone Button */}
              <button
                type="button"
                onClick={onOpenVoiceSearch}
                title="Search with Voice Microphone"
                className="p-1 text-slate-600 hover:text-amber-700 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-amber-600" />
              </button>
              
              <button
                type="submit"
                className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Mobile Search Autocomplete Dropdown */}
          {isMobileSearchFocused && renderSearchResults(true)}
        </div>

      </div>

      {/* 3. Sub-bar: "All Collections ˅" Pill Button and Horizontal Categories */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-3 sm:px-6 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* "All Collections ˅" Pill Dropdown Trigger */}
          <div ref={categoryRef} className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-300 text-slate-900 bg-amber-50 hover:bg-amber-100 text-xs font-black transition-all shadow-2xs cursor-pointer"
            >
              <span>{currentCategoryName}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Clean Dropdown Modal */}
            {isCategoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn divide-y divide-slate-100">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'text-amber-900 bg-amber-50 font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <span className="text-amber-600 font-black">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick horizontal categories scroll on desktop */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
            {CATEGORIES.slice(1, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Location / 10 km Radius Pill Button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 text-[11px] font-black text-amber-950 bg-amber-100/90 hover:bg-amber-200 px-2.5 py-1 rounded-full border border-amber-300 shrink-0 cursor-pointer transition-colors shadow-2xs"
            title="Interactive 10km Radius Map"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">
              {compactLocationDisplay} (10km)
            </span>
            <ChevronDown className="w-3 h-3 text-amber-800 shrink-0" />
          </button>

        </div>
      </div>

      {/* 4. User Request: Advanced Slidebar Drawer from Left with All Shortcuts & Settings */}
      {isSidebarOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex overflow-hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer animate-fadeIn"
          />

          {/* Slide-in Sidebar Panel */}
          <aside 
            className="relative w-80 sm:w-92 max-w-[85vw] bg-white h-screen min-h-screen shadow-2xl flex flex-col z-10 animate-slideRight overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header with User Profile or Sign In Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                  alt="User"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-400 shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <p className="font-black text-sm text-white truncate">
                    {currentUser?.name || 'Welcome, Guest'}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    {currentUser?.email || 'Sign in for VIP discounts & tracking'}
                  </p>
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full mt-1">
                    {currentUser?.membership || 'Apna Bazar VIP Plus'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Sidebar Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs divide-y divide-slate-100">
              
              {/* Section 1: Quick Shortcuts */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Quick Shortcuts
                </div>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onNavigateView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <span>Shop Home &amp; Deals</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onNavigateView('orders');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <span>Track Orders &amp; 5-Day Returns</span>
                  </div>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    Live Map
                  </span>
                </button>

                {onOpenLocationModal && (
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onOpenLocationModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-amber-600" />
                      </div>
                      <span>10 km Radius Delivery Map</span>
                    </div>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      Pin Drop
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-rose-500" />
                    </div>
                    <span>My Saved Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] font-black bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onNavigateView('refer');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-amber-900 font-bold transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-amber-600" />
                    </div>
                    <span>Refer &amp; Earn ₹200</span>
                  </div>
                  <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 px-2 py-0.5 rounded-full">
                    Free Cash
                  </span>
                </button>
              </div>

              {/* Section 2: Shop by Category */}
              <div className="pt-4 space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Shop Categories
                </div>

                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {selectedCategory === cat.id ? (
                      <span className="text-amber-400 font-black">✓</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">{cat.itemCount || 10} Items</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Section 3: User Request: Settings & Preferences */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  <Settings className="w-3.5 h-3.5 text-amber-600" />
                  <span>App Settings &amp; Preferences</span>
                </div>

                {/* Language Setting */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="font-bold text-slate-900">Language / भाषा</p>
                      <p className="text-[10px] text-slate-500">Select app interface language</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('en')}
                      className={`px-2 py-1 text-[11px] font-black rounded ${
                        selectedLanguage === 'en' ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('hi')}
                      className={`px-2 py-1 text-[11px] font-black rounded ${
                        selectedLanguage === 'hi' ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>

                {/* Order SMS Alerts Toggle */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="font-bold text-slate-900">SMS &amp; WhatsApp Alerts</p>
                      <p className="text-[10px] text-slate-500">Live order status updates</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderAlertsEnabled(!orderAlertsEnabled)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      orderAlertsEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        orderAlertsEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 15-Minute Fulfillment Mode */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-700" />
                    <div>
                      <p className="font-bold text-slate-900">15-Min Express Delivery</p>
                      <p className="text-[10px] text-amber-800">Baharagora 10 km Active Zone</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
              </div>

              {/* Section 4: Help, Helpline & Policies */}
              <div className="pt-4 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Help &amp; Policies
                </div>

                <a
                  href="tel:6207462800"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-amber-300 font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Call Helpline: 6207462800</span>
                  </div>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-black">
                    24/7
                  </span>
                </a>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onNavigateView('returns');
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>5-Day Return &amp; Exchange Policy</span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onNavigateView('shipping');
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Shipping &amp; Delivery Information</span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onNavigateView('terms');
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Terms of Service &amp; Privacy Policy</span>
                </button>
              </div>

            </div>

            {/* Sidebar Footer with Sign Out / Login */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
              {currentUser?.isLoggedIn ? (
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In to Apna Bazar</span>
                </button>
              )}
            </div>

          </aside>
        </div>,
        document.body
      )}

    </header>
  );
};
