import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Flame,
  Zap,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { CategoryId } from '../types';
import { DiwaliTopDealsSection, DiwaliDealItem } from './DiwaliTopDealsSection';
import { recoverImage } from '../utils/cloudinary';

interface HeroBannerProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onExploreShop?: () => void;
  onOpenCouponModal?: () => void;
  onSelectProductById?: (productId: string) => void;
  onAddToCartDirect?: (deal: DiwaliDealItem) => void;
  onFilterByPrice?: (maxPrice: number) => void;
  onSelectBrand?: (brandName: string) => void;
  onSelectVibe?: (vibeName: string) => void;
}

// =========================================================================
// 1. TOP CAROUSEL SLIDES (10 PRO SLIDES MATCHING FLIPKART BIG BANG FESTIVE STYLE)
// =========================================================================
interface TopCarouselSlide {
  id: string;
  brand: string;
  brandLogoText?: string;
  title: string;
  offerTag: string;
  subtitle: string;
  bankOffer: string;
  bgGradient: string;
  accentColor: string;
  image: string;
  localAsset?: string;
  targetProductId?: string;
  categoryId?: CategoryId;
}

const TOP_CAROUSEL_SLIDES: TopCarouselSlide[] = [
  {
    id: 'slide-1-safari',
    brand: 'Safari, Aristocrat..',
    title: 'Safari, Aristocrat...',
    offerTag: 'Min. 80% Off',
    subtitle: 'Trolley bags & travel luggage',
    bankOffer: '10% Instant Discount* on SBI Debit/Credit Cards & EMI',
    bgGradient: 'from-[#e11d48] via-[#ea580c] to-[#f59e0b]',
    accentColor: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=1200&q=85',
    localAsset: '/assets/aistudio/Screenshot_2026_1103_082600_2840b9c7.png',
    targetProductId: 'acc-001',
    categoryId: 'accessories',
  },
  {
    id: 'slide-2-action',
    brand: 'ACTION',
    title: 'Step out sharp',
    offerTag: 'Min. 75% Off',
    subtitle: 'Made for all your plans',
    bankOffer: '10% Instant Discount* on SBI Debit/Credit Cards & EMI',
    bgGradient: 'from-[#090d16] via-[#1a2233] to-[#2d3748]',
    accentColor: '#38bdf8',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
    localAsset: '/assets/aistudio/Screenshot_2026_1103_082608_9bba3c93.png',
    targetProductId: 'ftw-002',
    categoryId: 'footwear',
  },
  {
    id: 'slide-3-adidas',
    brand: 'adidas',
    title: 'Power every step',
    offerTag: 'Min. 50% Off',
    subtitle: 'Limited-time deal on performance running',
    bankOffer: '10% Instant Discount* on SBI Debit/Credit Cards & EMI',
    bgGradient: 'from-[#064e3b] via-[#047857] to-[#10b981]',
    accentColor: '#84cc16',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
    localAsset: '/assets/aistudio/Screenshot_2026_1103_082613_0737f95d.png',
    targetProductId: 'ftw-001',
    categoryId: 'footwear',
  },
  {
    id: 'slide-4-bear-house',
    brand: 'The Bear House, Snitch..',
    title: 'The Bear House, Snitch..',
    offerTag: 'Under ₹599',
    subtitle: 'Shirts, jeans & casual wear',
    bankOffer: '10% Instant Discount* on SBI Debit/Credit Cards & EMI',
    bgGradient: 'from-[#c2410c] via-[#ea580c] to-[#f59e0b]',
    accentColor: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
    localAsset: '/assets/aistudio/Screenshot_2026_1103_082622_9516b5a4.png',
    targetProductId: 'fsh-002',
    categoryId: 'fashion',
  },
  {
    id: 'slide-5-banarasi',
    brand: 'Varanasi Royal Silks',
    title: 'Royal Banarasi Silk Sarees',
    offerTag: 'Flat 62% Off',
    subtitle: 'Handcrafted zari pallu with unstitched blouse',
    bankOffer: '10% Savings* Apna Bazar Plus Member Privilege',
    bgGradient: 'from-[#831843] via-[#9d174d] to-[#be185d]',
    accentColor: '#f43f5e',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    targetProductId: 'sar-001',
    categoryId: 'sarees',
  },
  {
    id: 'slide-6-puma',
    brand: 'PUMA',
    title: 'High-Impact Street Kicks',
    offerTag: 'Min. 65% Off',
    subtitle: 'Shock absorbing air cushion & responsive grip',
    bankOffer: '10% Instant Discount* on SBI Debit/Credit Cards & EMI',
    bgGradient: 'from-[#1e1b4b] via-[#312e81] to-[#4338ca]',
    accentColor: '#a5b4fc',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85',
    targetProductId: 'ftw-003',
    categoryId: 'footwear',
  },
  {
    id: 'slide-7-velvet',
    brand: 'Libas, Biba',
    title: 'Winter Velvet Kurta Sets',
    offerTag: 'Min. 70% Off',
    subtitle: 'Royal embroidered sets with organza dupattas',
    bankOffer: '10% Instant Discount* on All Cards',
    bgGradient: 'from-[#172554] via-[#1e3a8a] to-[#2563eb]',
    accentColor: '#60a5fa',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    targetProductId: 'fsh-004',
    categoryId: 'fashion',
  },
  {
    id: 'slide-8-watches',
    brand: 'Fastrack, Timex',
    title: 'Chronograph Luxury Watches',
    offerTag: 'Under ₹999',
    subtitle: 'Waterproof 5ATM steel bezel & smart health monitoring',
    bankOffer: '1-Year Warranty & Free Gift Case Included',
    bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    accentColor: '#38bdf8',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
    targetProductId: 'acc-002',
    categoryId: 'accessories',
  },
  {
    id: 'slide-9-kids',
    brand: 'Little Champs',
    title: "Fit for the Lil' Ones",
    offerTag: 'Under ₹299',
    subtitle: 'Character t-shirts, trackpants & cozy innerwear',
    bankOffer: '100% Cash on Delivery & 5-Day Hassle-Free Returns',
    bgGradient: 'from-[#b91c1c] via-[#dc2626] to-[#ef4444]',
    accentColor: '#fca5a5',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=85',
    targetProductId: 'toy-001',
    categoryId: 'toys',
  },
  {
    id: 'slide-10-streetwear',
    brand: 'Apna Trends',
    title: 'Urban Heavyweight Drop',
    offerTag: 'From ₹149',
    subtitle: '240 GSM French terry oversized streetwear',
    bankOffer: 'Doorstep Delivery with 6-Digit OTP Verification',
    bgGradient: 'from-[#7c2d12] via-[#9a3412] to-[#c2410c]',
    accentColor: '#fdba74',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    targetProductId: 'fsh-001',
    categoryId: 'fashion',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  onExploreShop,
  onOpenCouponModal,
  onSelectProductById,
  onAddToCartDirect,
  onFilterByPrice,
  onSelectBrand,
  onSelectVibe,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % TOP_CAROUSEL_SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % TOP_CAROUSEL_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + TOP_CAROUSEL_SLIDES.length) % TOP_CAROUSEL_SLIDES.length);
  }, []);

  const handleSlideClick = (slide: TopCarouselSlide) => {
    if (slide.targetProductId && onSelectProductById) {
      onSelectProductById(slide.targetProductId);
      return;
    }
    if (slide.categoryId) {
      onSelectCategory(slide.categoryId);
      onExploreShop?.();
    }
  };

  const handlePriceClick = (price: number) => {
    if (onFilterByPrice) {
      onFilterByPrice(price);
    } else {
      onExploreShop?.();
    }
  };

  const currentSlide = TOP_CAROUSEL_SLIDES[currentSlideIndex];

  return (
    <div className="w-full space-y-6 pt-1 pb-4">

      {/* ========================================================================= */}
      {/* 1. TOP CAROUSEL: 10 HIGH-IMPACT FESTIVE BANNERS WITH SLIDING PILLS        */}
      {/* ========================================================================= */}
      <section 
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative">
          
          {/* Main Slide Card with Touch & Swipe (Full Screen width + Glowing Thick Border + Pure Full Image) */}
          <div
            onClick={() => handleSlideClick(currentSlide)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (diff > 40) handleNext();
              else if (diff < -40) handlePrev();
              touchStartX.current = null;
            }}
            className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(251,191,36,0.65)] border-4 sm:border-[5px] border-amber-400 ring-2 sm:ring-4 ring-yellow-300/50 bg-slate-950 cursor-pointer select-none transition-all duration-500 aspect-[2.2/1] sm:aspect-[2.45/1] md:aspect-[2.85/1] min-h-[170px] sm:min-h-[230px] md:min-h-[290px] group flex items-center justify-center"
          >
            {/* Full Slide Banner Image (Fills Edge-to-Edge Without Obstructing Text) */}
            <img
              src={currentSlide.localAsset || currentSlide.image}
              alt={currentSlide.title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Top Festive Golden Ambient Arch Overlay */}
            <div className="absolute top-0 left-0 right-0 h-4 sm:h-6 bg-gradient-to-b from-amber-300/40 via-yellow-200/20 to-transparent pointer-events-none" />

            {/* Left & Right Subtle Arrow Controls (Desktop) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 border border-white/30 cursor-pointer shadow-lg"
              title="Previous slide"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 border border-white/30 cursor-pointer shadow-lg"
              title="Next slide"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>

          {/* 10 Indicator Pills (Matching Screenshot with 1 Active Long Pill) */}
          <div className="flex items-center justify-center gap-1.5 pt-3 pb-1">
            {TOP_CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlideIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlideIndex === i 
                    ? 'w-7 sm:w-8 bg-slate-900 shadow-xs' 
                    : 'w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE BEAR HOUSE FESTIVE SPOTLIGHT BANNER                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div 
          onClick={() => {
            if (onSelectProductById) onSelectProductById('fsh-002');
            else onSelectCategory('fashion');
          }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-4 sm:p-5 text-white flex items-center justify-between border border-amber-400/50 shadow-md cursor-pointer group hover:border-amber-400 transition-all"
        >
          <div className="space-y-1 max-w-[65%]">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">THE BEAR HOUSE</span>
            <h4 className="text-sm sm:text-lg font-black text-white leading-tight">
              Be on point, always • Stitched to leave an impression
            </h4>
            <div className="inline-block bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-md mt-1">
              Min. 75% Off
            </div>
          </div>
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/20">
            <img 
              src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80" 
              alt="The Bear House" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DIWALI SPECIAL OFFER: TOP DEALS (MEN & WOMEN FASHION UP TO 70% OFF)     */}
      {/* ========================================================================= */}
      <DiwaliTopDealsSection
        onSelectProductById={onSelectProductById}
        onExploreShop={onExploreShop}
        onAddToCartDirect={onAddToCartDirect}
      />

      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Winter fashion essentials</span>
            <span>❄️</span>
          </h3>
          <span className="text-xs font-bold text-blue-700">Explore Collection &rarr;</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'velvet-kurta',
              title: 'Velvet kurta sets',
              offer: 'Min. 70% Off',
              brand: 'KASHEEDA',
              image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
              productId: 'fsh-004',
            },
            {
              id: 'puma-shoes',
              title: 'Sports shoes',
              offer: 'Min. 65% Off',
              brand: 'PUMA',
              image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
              productId: 'ftw-003',
            },
            {
              id: 'winter-jackets',
              title: 'Winter jackets',
              offer: 'Min. 60% Off',
              brand: 'FORT COLLINS',
              image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
              productId: 'fsh-002',
            },
            {
              id: 'shawls-stoles',
              title: 'Shawls & Stoles',
              offer: 'Min. 75% Off',
              brand: 'PASHMINA',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
              productId: 'sar-001',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProductById ? onSelectProductById(item.productId) : onSelectCategory('fashion')}
              className="rounded-3xl bg-[#003893] p-2.5 sm:p-3 text-white shadow-lg border-2 border-blue-400/40 relative overflow-hidden cursor-pointer hover:scale-102 active:scale-98 transition-all group"
            >
              {/* Snowflake Corner Motifs */}
              <div className="absolute top-1.5 right-1.5 text-xs text-blue-200 pointer-events-none opacity-80">❄</div>
              <div className="absolute bottom-10 left-1.5 text-xs text-blue-200 pointer-events-none opacity-80">❄</div>

              {/* Inner Gold Framed Photo */}
              <div className="aspect-4/5 w-full rounded-2xl overflow-hidden border-2 border-amber-300 relative bg-slate-900 shadow-inner">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.brand && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded shadow-xs tracking-wider">
                    {item.brand}
                  </span>
                )}
              </div>

              {/* Blue Card Footer */}
              <div className="pt-2 text-center space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-white truncate">{item.title}</h4>
                <p className="text-[11px] sm:text-xs font-black text-amber-300">{item.offer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SHOWCASE D: ELEGANT STYLES FOR HER (RED BADGE SHOWCASE)                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Elegant styles for her
          </h3>
          <span className="text-xs font-bold text-rose-600">View All &rarr;</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            {
              id: 'her-1',
              title: 'Zuya Wide Leg Denim',
              subtitle: 'Zuya',
              badge: 'Min. 60% Off',
              image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-003',
            },
            {
              id: 'her-2',
              title: 'Embellished Red Silk Saree',
              subtitle: 'Embellished',
              badge: 'Under ₹599',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
              productId: 'sar-001',
            },
            {
              id: 'her-3',
              title: 'Ribbed Knit Collared Top',
              subtitle: 'V-Mart',
              badge: 'Under ₹299',
              image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-001',
            },
            {
              id: 'her-4',
              title: 'Chikankari Organza Kurta',
              subtitle: 'Libas',
              badge: 'Min. 65% Off',
              image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-004',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProductById ? onSelectProductById(item.productId) : onSelectCategory('fashion')}
              className="w-36 sm:w-44 shrink-0 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all active:scale-95 snap-start group"
            >
              <div className="aspect-3/4 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Red Badge */}
              <div className="bg-[#e11d48] text-white py-1 px-2 text-center text-xs font-black">
                {item.badge}
              </div>
              <div className="p-2 text-center">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SHOWCASE E: FESTIVE DEALS FOR HIM (CASUALS & JACKETS)                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Festive deals for him
          </h3>
          <span className="text-xs font-bold text-amber-700">Shop Men &rarr;</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            {
              id: 'him-1',
              title: 'Fort Collins Winter Bomber',
              subtitle: 'Fort Collins...',
              badge: 'Min. 65% Off',
              image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-002',
            },
            {
              id: 'him-2',
              title: 'Trendy Graphic Tee',
              subtitle: 'T-shirts & more',
              badge: 'From ₹149',
              image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-001',
            },
            {
              id: 'him-3',
              title: 'Checked Flannel Casual Shirt',
              subtitle: 'Metronaut',
              badge: 'Under ₹499',
              image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-002',
            },
            {
              id: 'him-4',
              title: 'Korean Pleated Trousers',
              subtitle: 'Snitch',
              badge: 'Min. 50% Off',
              image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80',
              productId: 'fsh-004',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProductById ? onSelectProductById(item.productId) : onSelectCategory('fashion')}
              className="w-36 sm:w-44 shrink-0 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all active:scale-95 snap-start group"
            >
              <div className="aspect-3/4 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#ea580c] text-white py-1 px-2 text-center text-xs font-black">
                {item.badge}
              </div>
              <div className="p-2 text-center">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SHOWCASE F: COOL KICKS, CRAZY DEALS (SNEAKERS & HEELS)                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Cool kicks, crazy deals
          </h3>
          <span className="text-xs font-bold text-blue-700">All Footwear &rarr;</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            {
              id: 'kick-1',
              title: 'Cantabil Suede Street Sneakers',
              subtitle: 'Cantabil...',
              badge: 'Min. 65% Off',
              image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
              productId: 'ftw-001',
            },
            {
              id: 'kick-2',
              title: 'Metro Mochi Clear Block Heels',
              subtitle: 'Metro, Mochi...',
              badge: 'Min. 55% Off',
              image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
              productId: 'ftw-002',
            },
            {
              id: 'kick-3',
              title: 'LED Light Up Kids Sneakers',
              subtitle: 'LED sneakers',
              badge: 'Under ₹499',
              image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=400&q=80',
              productId: 'ftw-003',
            },
            {
              id: 'kick-4',
              title: 'Action High-Traction Trainers',
              subtitle: 'Action Sports',
              badge: 'From ₹399',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
              productId: 'ftw-002',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProductById ? onSelectProductById(item.productId) : onSelectCategory('footwear')}
              className="w-36 sm:w-44 shrink-0 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all active:scale-95 snap-start group"
            >
              <div className="aspect-3/4 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#b91c1c] text-white py-1 px-2 text-center text-xs font-black">
                {item.badge}
              </div>
              <div className="p-2 text-center">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SHOWCASE G: FIT FOR THE LIL' ONES (KIDS COLLECTION)                    */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 8. SHOWCASE G: FIT FOR THE LIL' ONES (SLIDING ROW WITH KIDS STORE LINK)   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Fit for the lil&apos; ones
          </h3>
          <button 
            type="button"
            onClick={() => onSelectCategory('toys')} 
            className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
          >
            Kids Store &rarr;
          </button>
        </div>

        {/* Sliding Row for Kids Items as requested */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {[
            {
              id: 'kids-1',
              title: "Kids' trackpants",
              badge: 'Under ₹299',
              image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=400&q=80',
              productId: 'toy-001',
            },
            {
              id: 'kids-2',
              title: "Kids' innerwear",
              badge: 'Under ₹199',
              image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80',
              productId: 'toy-001',
            },
            {
              id: 'kids-3',
              title: "Kids' t-shirts",
              badge: 'Under ₹249',
              image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=400&q=80',
              productId: 'toy-001',
            },
            {
              id: 'kids-4',
              title: "Kids' ethnic sets",
              badge: 'Under ₹399',
              image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=400&q=80',
              productId: 'toy-001',
            },
            {
              id: 'kids-5',
              title: 'Marvel Superhero Tee',
              badge: 'Under ₹299',
              image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
              productId: 'toy-006',
            },
            {
              id: 'kids-6',
              title: 'Baby Winter Sweater',
              badge: 'Under ₹349',
              image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80',
              productId: 'toy-001',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProductById ? onSelectProductById(item.productId) : onSelectCategory('toys')}
              className="w-32 sm:w-40 shrink-0 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all active:scale-95 snap-start group text-center"
            >
              <div className="aspect-3/4 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#dc2626] text-white py-1 px-1.5 text-xs font-black">
                {item.badge}
              </div>
              <div className="p-2">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SHOWCASE H: EXPLORE STORES (COMPACT 3 IN A LINE BOXES WITHOUT BRAND)   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Explore stores
          </h3>
          <span className="text-xs font-bold text-amber-700">Festive Specials &rarr;</span>
        </div>

        {/* 3 Compact Store Exploration Boxes in One Line (As requested) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
          <div
            onClick={() => onSelectCategory('accessories')}
            className="rounded-2xl overflow-hidden relative aspect-4/3 cursor-pointer group shadow-xs border-2 border-amber-300 hover:border-amber-400 transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80"
              alt="Gifting Store"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-2 sm:p-3">
              <div>
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                  GIFTING
                </span>
                <h4 className="text-white font-black text-[11px] sm:text-xs leading-tight mt-1 line-clamp-1">Festive Hampers</h4>
              </div>
            </div>
          </div>

          <div
            onClick={() => onSelectCategory('sarees')}
            className="rounded-2xl overflow-hidden relative aspect-4/3 cursor-pointer group shadow-xs border-2 border-amber-300 hover:border-amber-400 transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80"
              alt="Shaadi Ka Ghar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-2 sm:p-3">
              <div>
                <span className="bg-rose-500 text-white font-black text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                  SHAADI KA GHAR
                </span>
                <h4 className="text-white font-black text-[11px] sm:text-xs leading-tight mt-1 line-clamp-1">Bridal Couture</h4>
              </div>
            </div>
          </div>

          <div
            onClick={() => onSelectCategory('fashion')}
            className="rounded-2xl overflow-hidden relative aspect-4/3 cursor-pointer group shadow-xs border-2 border-amber-300 hover:border-amber-400 transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
              alt="Festivals of India"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-2 sm:p-3">
              <div>
                <span className="bg-emerald-500 text-white font-black text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                  FESTIVALS
                </span>
                <h4 className="text-white font-black text-[11px] sm:text-xs leading-tight mt-1 line-clamp-1">Puja Silks</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. DIWALI PRICE DROP (COMPACT 4 BOXES PLACED DIRECTLY UNDER EXPLORE STORES) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-2xl mx-auto px-3 sm:px-4 space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Diwali price drop</span>
            <span className="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full border border-rose-300">
              Steal Deals
            </span>
          </h3>
          <span className="text-xs font-bold text-rose-700">Budget Store &rarr;</span>
        </div>

        {/* 4 Compact Price Drop Boxes in Festive Royal Ruby Crimson & Gold */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {[
            { price: 299, label: 'UNDER ₹299', sub: 'T-Shirts & Slippers' },
            { price: 399, label: 'UNDER ₹399', sub: 'Shirts & Tops' },
            { price: 499, label: 'UNDER ₹499', sub: 'Jeans & Sneakers' },
            { price: 599, label: 'UNDER ₹599', sub: 'Kurtas & Jackets' },
          ].map((drop) => (
            <div
              key={drop.price}
              onClick={() => handlePriceClick(drop.price)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#881337] via-[#9f1239] to-[#be123c] border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] text-white flex flex-col items-center justify-between text-center cursor-pointer hover:scale-102 active:scale-98 transition-all group"
            >
              <div className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                PRICE DROP
              </div>
              <div className="font-black text-sm sm:text-base tracking-tight my-0.5 text-white drop-shadow-xs">
                {drop.label}
              </div>
              <p className="text-[9px] text-rose-100/90 font-medium truncate max-w-full">
                {drop.sub}
              </p>
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black mt-1 shadow-2xs group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. SHOP WITH VIBE (SINGLE SLIDING ROW WITH GLOSSY SILK CARDS & GOLD FRAMES) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Shop with Vibe</span>
              <span className="text-[10px] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                Aesthetic Moods
              </span>
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-700">Slide for Colors &rarr;</span>
        </div>

        {/* User Request: Single continuous sliding row with exact uploaded vibe cards */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth">
          {[
            {
              id: 'blue',
              name: 'BLUE',
              image: '/assets/aistudio/Screenshot_2026_1106_193236_878675a3.png',
              alt: 'BLUE Vibe Silk Card',
            },
            {
              id: 'green',
              name: 'GREEN',
              image: '/assets/aistudio/Screenshot_2026_1106_193250_e5234f97.png',
              alt: 'GREEN Vibe Silk Card',
            },
            {
              id: 'pink',
              name: 'PINK',
              image: '/assets/aistudio/Screenshot_2026_1106_193304_a72a30aa.png',
              alt: 'PINK Vibe Silk Card',
            },
            {
              id: 'gold',
              name: 'GOLD',
              image: '/assets/aistudio/Screenshot_2026_1106_193323_1841ecb8.png',
              alt: 'GOLD Vibe Silk Card',
            },
            {
              id: 'white',
              name: 'WHITE',
              image: '/assets/aistudio/Screenshot_2026_1106_193339_fb9f86c9.png',
              alt: 'WHITE Vibe Silk Card',
            },
            {
              id: 'black',
              name: 'BLACK',
              image: '/assets/aistudio/Screenshot_2026_1106_193352_75987c0e.png',
              alt: 'BLACK Vibe Silk Card',
            },
            {
              id: 'red',
              name: 'RED',
              image: '/assets/aistudio/Screenshot_2026_1106_193400_e9c57b25.png',
              alt: 'RED Vibe Silk Card',
            },
          ].map((vibe) => (
            <div
              key={vibe.id}
              onClick={() => {
                if (onSelectVibe) {
                  onSelectVibe(vibe.name);
                } else if (onSelectBrand) {
                  onSelectBrand(vibe.name);
                }
              }}
              className="relative w-36 sm:w-44 shrink-0 rounded-2xl sm:rounded-3xl shadow-[0_6px_20px_rgba(251,191,36,0.35)] cursor-pointer snap-start transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden select-none border-2 border-amber-400/60 bg-slate-900"
            >
              <div className="aspect-[3/4.2] w-full overflow-hidden relative">
                <img
                  src={vibe.image}
                  alt={vibe.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2.5">
                  <span className="text-[10px] font-black text-amber-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/60 shadow-xs">
                    View {vibe.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. ICONIC BRANDS: ALL TOP LABELS WITH DIRECT FILTERING & GENEROUS LOGO SPACE */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Iconic Brands
            </h3>
            <span className="text-[10px] bg-slate-900 text-amber-300 font-black px-2 py-0.5 rounded-full uppercase">
              100% Genuine • Official Stores
            </span>
          </div>
          <span className="text-xs font-bold text-amber-700">All Labels &rarr;</span>
        </div>

        {/* Horizontal Brand Strip with Dedicated Enlarged Logo Containers */}
        <div className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth">
          {[
            { name: 'Adidas', offer: 'Min. 50% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201142_d415b265.png', bg: 'bg-white' },
            { name: 'Nike', offer: 'Up to 50% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200435_83a20aa4.png', bg: 'bg-white' },
            { name: 'Campus', offer: 'Under ₹599', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200959_d4c9aac8.png', bg: 'bg-white' },
            { name: 'Puma', offer: 'Min. 40%-60% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200624_e72f4277.png', bg: 'bg-black' },
            { name: 'H&M', offer: 'Up to 50% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200334_9fd39ff1.png', bg: 'bg-white' },
            { name: 'Cider', offer: 'Up to 70% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200535_2605e0c4.png', bg: 'bg-white' },
            { name: 'Raymond', offer: 'Min. 40% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201459_8115fdd5.png', bg: 'bg-white' },
            { name: 'Allen Solly', offer: 'Min. 40% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202444_4f8a8a8d.png', bg: 'bg-black' },
            { name: 'W for Woman', offer: 'Min. 55% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202642_6357bb7f.png', bg: 'bg-[#dc2626]' },
            { name: 'Manyavar', offer: 'Festive Wear', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202804_2634fa53.png', bg: 'bg-white' },
            { name: 'Killer', offer: 'Min. 60% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202557_38db2bff.png', bg: 'bg-white' },
            { name: 'Sparx', offer: 'Under ₹499', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202618_36c67d2a.png', bg: 'bg-black' },
            { name: 'The Bear House', offer: 'Min. 75% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201107_80aed23a.png', bg: 'bg-white' },
            { name: 'Aurelia', offer: 'Min. 50% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202724_7319d819.png', bg: 'bg-[#f59e0b]' },
            { name: 'V-Mart', offer: 'Under ₹299', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202316_8c01cc26.png', bg: 'bg-[#dc2626]' },
            { name: 'Peter England', offer: 'Min. 45% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202512_111de0df.png', bg: 'bg-white' },
            { name: 'Wrogn', offer: 'Min. 60% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202016_9c8e47da.png', bg: 'bg-black' },
            { name: 'HRX', offer: 'Min. 60% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201816_ccf3035a.png', bg: 'bg-black' },
            { name: 'Safari', offer: 'Min. 80% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201352_e49a416b.png', bg: 'bg-white' },
            { name: 'Libas', offer: 'Min. 65% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201546_37174aa3.png', bg: 'bg-white' },
            { name: 'Aristocrat', offer: 'Min. 75% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202400_06d885e8.png', bg: 'bg-[#eab308]' },
            { name: 'Flying Machine', offer: 'Min. 50% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202533_11a8fedd.png', bg: 'bg-white' },
            { name: 'Red Tape', offer: 'Min. 70% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202129_13aedfdc.png', bg: 'bg-white' },
            { name: 'Biba', offer: 'Min. 50% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202055_a1733b9e.png', bg: 'bg-white' },
            { name: 'Metronaut', offer: 'Under ₹499', logoUrl: '/assets/aistudio/Screenshot_2026_1106_202231_0ebcbbbb.png', bg: 'bg-white' },
            { name: 'Tokyo Talkies', offer: 'Min. 55% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201303_79fb576a.png', bg: 'bg-white' },
            { name: 'U.S. Polo Assn.', offer: 'Min. 40% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200822_7769a814.png', bg: 'bg-white' },
            { name: 'Snitch', offer: 'Under ₹599', logoUrl: '/assets/aistudio/Screenshot_2026_1106_200930_d1493351.png', bg: 'bg-black' },
            { name: 'Highlander', offer: 'Min. 70% Off', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201709_e9f46b3b.png', bg: 'bg-white' },
            { name: 'Roadster', offer: 'Under ₹399', logoUrl: '/assets/aistudio/Screenshot_2026_1106_201936_d673a14e.png', bg: 'bg-white' },
          ].map((brand) => (
            <div
              key={brand.name}
              onClick={() => {
                if (onSelectBrand) {
                  onSelectBrand(brand.name);
                } else {
                  onExploreShop?.();
                }
              }}
              className="w-44 sm:w-52 shrink-0 p-3 sm:p-4 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer text-center group active:scale-95 snap-start flex flex-col items-center justify-between"
            >
              {/* Generous Enlarged Brand Logo Container (Clean & High Resolution) */}
              <div className={`w-full h-24 sm:h-28 rounded-2xl flex items-center justify-center p-2.5 overflow-hidden border border-slate-200/80 shadow-inner group-hover:scale-105 transition-transform ${brand.bg || 'bg-white'}`}>
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    loading="eager"
                    decoding="async"
                    onError={(e) => recoverImage(e.currentTarget)}
                    className="w-full h-full object-contain max-h-20 sm:max-h-24 transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xs">
                    <span>{brand.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Brand Name & Promotional Offer Tag */}
              <div className="mt-2.5 w-full">
                <p className="font-black text-sm sm:text-base text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                  {brand.name}
                </p>
                <span className="inline-block mt-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                  {brand.offer}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
