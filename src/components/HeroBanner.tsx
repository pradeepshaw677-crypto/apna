import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Clock, 
  Banknote, 
  Tag, 
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  Flame,
  Zap
} from 'lucide-react';
import { CategoryId } from '../types';

interface HeroBannerProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onExploreShop?: () => void;
  onOpenCouponModal?: () => void;
  onSelectProductById?: (productId: string) => void;
}

// 1. Clean Top Image Banners (User explicit instruction: "upar se text and overlap colour hata do and link vi samjha")
// NO text on top, NO overlap color/gradient tint, and NO redirect link. Pure high-res fashion banner imagery!
const CLEAN_TOP_BANNER_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', // Banarasi Saree & Traditional Fashion
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=85', // Gen-Z Streetwear & Sneaker Drop
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85', // Festive Chikankari Ethnic Edit
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85', // Luxury Watches & Accessories
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85', // Contemporary High-Street Collection
];

// 2. Promotional Carousel Banners (User explicit instruction: "and cupon and offer ke baad jo banner tha use bapas lao ok")
interface PromoBannerSlide {
  id: string;
  badge: string;
  badgeIcon: string;
  title: string;
  subtitle: string;
  highlightOffer: string;
  imageUrl: string;
  gradientClass: string;
  glowColor: string;
  ctaText: string;
  categoryId?: CategoryId;
  targetProductId?: string;
  isCouponAction?: boolean;
}

const PROMO_CAROUSEL_BANNERS: PromoBannerSlide[] = [
  {
    id: 'saree-promo',
    badge: '100% PURE BANARASI SILK',
    badgeIcon: '✨',
    title: 'Royal Banarasi Katan Silk Zari Saree',
    subtitle: 'Handcrafted Varanasi antique zari pallu with unstitched contrast brocade blouse.',
    highlightOffer: 'FLAT 62% OFF • ₹1,899 (MRP ₹4,999)',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    gradientClass: 'from-amber-600 via-rose-600 to-purple-800',
    glowColor: 'bg-rose-500/25',
    ctaText: 'Explore Sarees Collection',
    categoryId: 'sarees',
    targetProductId: 'sar-001',
  },
  {
    id: 'sneaker-promo',
    badge: 'GEN-Z STREET DROP 2026',
    badgeIcon: '🔥',
    title: 'Air Cushion Urban Streetwear Sneakers',
    subtitle: 'Shock-absorbing ergonomic air sole, breathable mesh upper & high-traction grip.',
    highlightOffer: 'FLAT 60% OFF • ₹1,199 (MRP ₹2,999)',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    gradientClass: 'from-slate-900 via-indigo-900 to-purple-900',
    glowColor: 'bg-indigo-500/25',
    ctaText: 'Shop Sneaker Drop',
    categoryId: 'footwear',
    targetProductId: 'ftw-001',
  },
  {
    id: 'kurti-promo',
    badge: 'FESTIVE ETHNIC EDIT',
    badgeIcon: '🌸',
    title: 'Pure Chikankari Anarkali Kurta Set',
    subtitle: 'Authentic Lucknowi hand embroidery with matching organza dupatta & trousers.',
    highlightOffer: 'BUY 1 GET 1 FREE • ₹999 (MRP ₹2,499)',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    gradientClass: 'from-rose-600 via-pink-700 to-purple-800',
    glowColor: 'bg-fuchsia-500/25',
    ctaText: 'View Ethnic Kurtis',
    categoryId: 'fashion',
    targetProductId: 'fsh-004',
  },
  {
    id: 'watch-promo',
    badge: 'PREMIUM LUXURY ACCESSORIES',
    badgeIcon: '💎',
    title: 'Waterproof Chronograph Smart Watch',
    subtitle: 'Stainless steel bezel, health tracking, waterproof 5ATM & complimentary gift box.',
    highlightOffer: 'UNDER ₹999 • 1-YEAR WARRANTY',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    gradientClass: 'from-emerald-800 via-teal-900 to-slate-950',
    glowColor: 'bg-emerald-500/25',
    ctaText: 'View Luxury Accessories',
    categoryId: 'accessories',
    targetProductId: 'acc-001',
  },
  {
    id: 'launch-offer-promo',
    badge: 'APNA BAZAR WELCOME GIFT',
    badgeIcon: '🎉',
    title: 'Flat ₹100 OFF + Free Express Shipping',
    subtitle: 'Apply Coupon APNAFIRST at checkout. 100% Cash on Delivery & 5-Day Hassle-Free Returns with OTP.',
    highlightOffer: 'CODE: APNAFIRST • ZERO DELIVERY CHARGE',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    gradientClass: 'from-amber-500 via-orange-600 to-rose-600',
    glowColor: 'bg-amber-500/25',
    ctaText: 'Claim ₹100 Off Coupon',
    isCouponAction: true,
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  onExploreShop = () => {},
  onOpenCouponModal,
  onSelectProductById,
}) => {
  // Psychological Countdown Timer (2 hrs 45 mins countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  // 1. Clean Top Image Banner State
  const [topBannerIndex, setTopBannerIndex] = useState(0);
  const [isTopBannerPaused, setIsTopBannerPaused] = useState(false);
  const topTouchStartX = useRef<number | null>(null);

  // 2. Promotional Carousel Banner State (After Coupons & Offers)
  const [promoSlideIndex, setPromoSlideIndex] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);
  const promoTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => String(n).padStart(2, '0');

  // Auto-scroll Clean Top Banner every 3.5s
  useEffect(() => {
    if (isTopBannerPaused) return;
    const interval = setInterval(() => {
      setTopBannerIndex((prev) => (prev + 1) % CLEAN_TOP_BANNER_IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isTopBannerPaused]);

  // Auto-scroll Promotional Carousel Banner every 4.2s
  useEffect(() => {
    if (isPromoPaused) return;
    const interval = setInterval(() => {
      setPromoSlideIndex((prev) => (prev + 1) % PROMO_CAROUSEL_BANNERS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPromoPaused]);

  // Top Clean Banner Handlers
  const handleNextTopBanner = useCallback(() => {
    setTopBannerIndex((prev) => (prev + 1) % CLEAN_TOP_BANNER_IMAGES.length);
  }, []);

  const handlePrevTopBanner = useCallback(() => {
    setTopBannerIndex((prev) => (prev - 1 + CLEAN_TOP_BANNER_IMAGES.length) % CLEAN_TOP_BANNER_IMAGES.length);
  }, []);

  // Promo Carousel Handlers
  const handleNextPromoSlide = useCallback(() => {
    setPromoSlideIndex((prev) => (prev + 1) % PROMO_CAROUSEL_BANNERS.length);
  }, []);

  const handlePrevPromoSlide = useCallback(() => {
    setPromoSlideIndex((prev) => (prev - 1 + PROMO_CAROUSEL_BANNERS.length) % PROMO_CAROUSEL_BANNERS.length);
  }, []);

  // Handle promo banner redirection
  const handlePromoSlideClick = (slide: PromoBannerSlide) => {
    if (slide.isCouponAction && onOpenCouponModal) {
      onOpenCouponModal();
      return;
    }

    if (slide.targetProductId && onSelectProductById) {
      onSelectProductById(slide.targetProductId);
      if (slide.categoryId) {
        onSelectCategory(slide.categoryId);
      }
      onExploreShop();
      return;
    }

    if (slide.categoryId) {
      onSelectCategory(slide.categoryId);
      onExploreShop();
    }
  };

  const currentPromoSlide = PROMO_CAROUSEL_BANNERS[promoSlideIndex];

  return (
    <div className="w-full space-y-4">
      {/* 1. Festive Fashion & Footwear Top Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-emerald-50/50 border-b border-amber-200/60 py-6 sm:py-9 px-3 sm:px-6 lg:px-8">
        
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3.5 max-w-xl text-center md:text-left w-full">
            
            {/* Header Title with Enhanced Contrast */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Trending Sarees, Fashion &amp; Footwear <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent drop-shadow-xs">
                Apka Apna Bazar
              </span> Superstore!
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
              Discover viral streetwear, luxury sneakers, high-speed toys &amp; designer accessories at wholesale prices. 
              <strong className="text-slate-950 ml-1">100% Cash on Delivery &amp; 5-Day Hassle-Free Returns with OTP verification!</strong>
            </p>

            {/* Countdown Flash Deal Pill */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-amber-300 shadow-xs flex flex-wrap items-center justify-between gap-2.5 max-w-md mx-auto md:mx-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-4 h-4 text-orange-600 animate-pulse shrink-0" />
                <span className="text-xs font-black text-slate-950">Flash Deals End In:</span>
              </div>
              
              <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-950">
                <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                  {formatNum(timeLeft.hours)}h
                </span>
                <span>:</span>
                <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                  {formatNum(timeLeft.minutes)}m
                </span>
                <span>:</span>
                <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                  {formatNum(timeLeft.seconds)}s
                </span>
              </div>
            </div>

            {/* USER INSTRUCTION: "jaha pe abhi banner hai uske upar se text and overlap colour hata do and link vi samjha" */}
            {/* PURE IMAGE BANNER: No text on top, No overlap color/gradient overlay, No link/click redirection. Full length & width cover with +20px height! */}
            <div 
              className="w-full my-3"
              onMouseEnter={() => setIsTopBannerPaused(true)}
              onMouseLeave={() => setIsTopBannerPaused(false)}
            >
              <div 
                onTouchStart={(e) => {
                  topTouchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (topTouchStartX.current === null) return;
                  const diff = topTouchStartX.current - e.changedTouches[0].clientX;
                  if (diff > 40) {
                    handleNextTopBanner();
                  } else if (diff < -40) {
                    handlePrevTopBanner();
                  }
                  topTouchStartX.current = null;
                }}
                className="relative w-full h-48 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-amber-300/80 bg-slate-900 group select-none"
              >
                {/* 1. Full Image Covering Entire Banner without any text or color overlay */}
                <img
                  src={CLEAN_TOP_BANNER_IMAGES[topBannerIndex]}
                  alt="Apna Bazar Banner"
                  className="w-full h-full object-cover object-center transition-all duration-700"
                />

                {/* Left & Right Subtle Navigation Controls */}
                <button
                  type="button"
                  onClick={handlePrevTopBanner}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-75 z-20 border border-white/20 cursor-pointer"
                  title="Previous banner image"
                  aria-label="Previous banner image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNextTopBanner}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 sm:opacity-75 z-20 border border-white/20 cursor-pointer"
                  title="Next banner image"
                  aria-label="Next banner image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Slide Indicator Dots (Bottom Centered) */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full z-20">
                  {CLEAN_TOP_BANNER_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTopBannerIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        topBannerIndex === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons: Shop Trending & Coupons & Offers */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3 pt-1 w-full">
              <button
                onClick={() => {
                  onSelectCategory('sarees');
                  onExploreShop();
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Shop Trending Sarees &amp; Fashion 🔥</span>
              </button>

              <button
                onClick={onOpenCouponModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white hover:bg-slate-50 border border-amber-300 text-slate-800 text-xs font-bold shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Coupons &amp; Offers (Code: APNAFIRST)</span>
              </button>
            </div>

          </div>

          {/* Desktop Only Right Visual Image Card with Badge (hidden on mobile preview) */}
          <div className="relative shrink-0 w-full max-w-sm sm:max-w-md hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
                alt="Apna Bazar Fashion & Lifestyle"
                className="w-full h-64 sm:h-80 object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <span className="text-[10px] uppercase font-black bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 rounded-full text-slate-950 shadow-xs">
                    ⚡ New Season Drop
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-1">Sarees, Footwear, Apparel &amp; Accessories</h3>
                  <p className="text-xs text-slate-200">Dispatched directly from Baharagora Central Hub</p>
                  <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1 pt-1">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Pay Cash on Delivery • 5-Day Hassle-Free Returns</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* USER INSTRUCTION: "and cupon and offer ke baad jo banner tha use bapas lao ok" */}
      {/* 2. PROMOTIONAL CAROUSEL BANNER (Placed right after Coupons & Offers section before categories) */}
      <section 
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 w-full"
        onMouseEnter={() => setIsPromoPaused(true)}
        onMouseLeave={() => setIsPromoPaused(false)}
      >
        <div 
          onClick={() => handlePromoSlideClick(currentPromoSlide)}
          onTouchStart={(e) => {
            promoTouchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (promoTouchStartX.current === null) return;
            const diff = promoTouchStartX.current - e.changedTouches[0].clientX;
            if (diff > 40) {
              handleNextPromoSlide();
            } else if (diff < -40) {
              handlePrevPromoSlide();
            }
            promoTouchStartX.current = null;
          }}
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-amber-400/40 bg-gradient-to-r ${currentPromoSlide.gradientClass} text-white cursor-pointer group active:scale-99 transition-all p-4 sm:p-7 min-h-[170px] sm:min-h-[210px] flex flex-col justify-between`}
        >
          {/* Ambient Glow Orb */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40 ${currentPromoSlide.glowColor}`} />

          {/* Background Card Graphic Image (Right Aligned, Elegant Fade) */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/3 pointer-events-none overflow-hidden hidden xs:block">
            <img 
              src={currentPromoSlide.imageUrl} 
              alt={currentPromoSlide.title} 
              className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 mask-radial"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/30 to-black/90" />
          </div>

          {/* Top Row: Badge & Action Indicator */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
              <span>{currentPromoSlide.badgeIcon}</span>
              <span>{currentPromoSlide.badge}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow-md">
                <span>{currentPromoSlide.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              
              {/* Slide Counter */}
              <span className="text-[10px] font-mono font-bold bg-black/40 text-amber-300 px-2 py-0.5 rounded-md">
                {promoSlideIndex + 1}/{PROMO_CAROUSEL_BANNERS.length}
              </span>
            </div>
          </div>

          {/* Center Content: Title, Subtitle & Highlight */}
          <div className="relative z-10 space-y-1.5 sm:space-y-2 max-w-xl my-2">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
              {currentPromoSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 font-medium line-clamp-2 max-w-lg">
              {currentPromoSlide.subtitle}
            </p>
            <div className="inline-block bg-amber-400 text-slate-950 text-xs sm:text-sm font-black px-3 py-1 rounded-lg shadow-sm">
              {currentPromoSlide.highlightOffer}
            </div>
          </div>

          {/* Bottom Bar: Action Pill & Slide Navigation Dots */}
          <div className="relative z-10 flex items-center justify-between pt-1">
            <div className="sm:hidden">
              <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white text-slate-950 px-3 py-1 rounded-full shadow-md">
                <span>{currentPromoSlide.ctaText}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full ml-auto">
              {PROMO_CAROUSEL_BANNERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPromoSlideIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    promoSlideIndex === i ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Arrow Controls */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPromoSlide();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-all z-20 border border-white/20 cursor-pointer"
            title="Previous slide"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextPromoSlide();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-all z-20 border border-white/20 cursor-pointer"
            title="Next slide"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
