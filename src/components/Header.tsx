import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Bell, 
  Mic, 
  Phone, 
  Package, 
  Gift, 
  HelpCircle, 
  MapPin,
  Sparkles,
  ArrowRight,
  Truck,
  CheckCircle2,
  Share2
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
}

const PLACEHOLDER_TEXTS = [
  "Search for groceries...",
  "Search for beverages...",
  "Search for snacks...",
  "Search for personal care...",
  "Search for dry fruits & tea...",
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
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Animated placeholder text cycling
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Filtered live search autocomplete
  const searchResults = searchQuery.trim().length > 1
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.hindiName && p.hindiName.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    onNavigateView('home');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Categories';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 shadow-xs">
      
      {/* 1. Top Bar matching Apna Bazar:
          🎉 Apna Bazar Weekly Deals | 🚚 Free Delivery on Orders Above ₹499 | 📞 Customer Support: 6207462800 */}
      <div className="bg-[#0f172a] text-white py-1.5 px-4 text-xs font-semibold text-center tracking-wide flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1.5 shrink-0 text-amber-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Apna Bazar Weekly Bonanza</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">•</span>
        <span className="hidden md:inline-flex items-center gap-1 shrink-0 text-slate-200">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Free Express Delivery Above ₹499</span>
        </span>
        <span className="text-slate-500 hidden md:inline">•</span>
        <a 
          href="tel:6207462800"
          className="inline-flex items-center gap-1.5 shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Phone className="w-3 h-3 text-emerald-400" />
          <span>Apna Bazar Helpline: <strong>6207462800</strong></span>
        </a>
      </div>

      {/* 2. Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Hamburger Menu & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <BrandLogo onClick={() => onNavigateView('home')} />
          </div>

          {/* Desktop Search Bar with Animated Placeholder & Voice Search Button */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-full pl-11 pr-24 py-2.5 border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-3 focus:ring-emerald-500/20 transition-all font-medium"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
              
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {/* Voice Search Button */}
                <button
                  type="button"
                  onClick={onOpenVoiceSearch}
                  title="Search with Voice"
                  className="p-1.5 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Orange Circular Search Button matching screenshot */}
                <button
                  type="button"
                  onClick={() => setIsSearchFocused(true)}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Matching Groceries ({searchResults.length})
                    </div>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          onSelectProduct(product);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.unit} • <span className="text-emerald-700 font-semibold">{product.brand}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-slate-900">₹{product.price}</span>
                          <span className="text-[11px] text-emerald-600 font-bold ml-1.5">
                            {product.discountPercent}% OFF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-400">
                      Popular Searches in Baharagora
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Lipton Green Tea", "Godrej No.1 Soap", "Atta 5kg", "Fortune Sunflower Oil", "Kinley Water", "Dates"].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setSearchQuery(item);
                            setIsSearchFocused(false);
                          }}
                          className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1.5 rounded-full font-medium transition-colors border border-slate-200"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons: Notification Bell, Wishlist, Cart Bag, User Login */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {/* Notification Popup */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Store Notifications</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">New</span>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <p className="font-bold text-slate-800">🎉 15-Min Delivery Active</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Express grocery deliveries are now live across Baharagora!</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                      <p className="font-bold text-slate-800">⚡ Code GROCERY200</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Save flat ₹200 on all orders above ₹499 today.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button (Desktop) */}
            <button
              onClick={onOpenWishlist}
              className="hidden lg:flex p-2.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors relative cursor-pointer"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button with Badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile or Yellow Login Button matching the screenshot */}
            <div ref={userMenuRef} className="relative">
              {currentUser?.isLoggedIn ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80"}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>→] Login / Sign Up</span>
                </button>
              )}

              {/* User Dropdown Menu (No Admin Panel!) */}
              {isUserMenuOpen && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn divide-y divide-slate-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                    <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Baharagora Customer
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Account Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('orders');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('addresses');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Saved Addresses</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('refer');
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span>Refer &amp; Earn ₹200</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                        Bonus
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('support');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Lodge a Complaint</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Row matching the screenshot */}
        <div className="md:hidden pb-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
              className="w-full bg-slate-100 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-full pl-10 pr-20 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenVoiceSearch}
                className="p-1 text-slate-500 hover:text-emerald-700"
              >
                <Mic className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Sub-bar: "All Categories ˅" Mint Green Pill Button directly under search */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* "All Categories ˅" Pill Dropdown Trigger */}
          <div ref={categoryRef} className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>{currentCategoryName}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Clean Dropdown Modal matching screenshot */}
            {isCategoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn divide-y divide-slate-100">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'text-teal-800 bg-teal-50 font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <span className="text-teal-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick horizontal categories scroll on desktop */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
            {CATEGORIES.slice(1, 7).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Guarantee Pill */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>15-Min Express Delivery in Baharagora</span>
          </div>

        </div>
      </div>

      {/* 4. Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4 animate-slideDown shadow-2xl">
          <div className="text-xs font-black uppercase text-slate-400 tracking-wider">All Categories</div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left truncate ${
                  selectedCategory === cat.id 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigateView('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" /> Account Dashboard
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onNavigateView('orders');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" /> Track &amp; My Orders
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onNavigateView('support');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" /> Lodge a Complaint
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onNavigateView('refer');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-900"
            >
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600" /> Refer &amp; Earn ₹200
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
