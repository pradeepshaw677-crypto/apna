import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Gift, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Percent, 
  HeartHandshake, 
  ChevronRight,
  Flame,
  CheckCircle2,
  Users,
  Banknote,
  Tag
} from 'lucide-react';
import { CategoryId } from '../types';

interface HeroBannerProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onExploreShop?: () => void;
  onOpenCouponModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  onExploreShop = () => {},
  onOpenCouponModal,
}) => {
  // Psychological Countdown Timer (2 hrs 45 mins countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

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

  return (
    <div className="space-y-6 sm:space-y-10">
      
      {/* 1. Festive Celebration & Urgency Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-emerald-50/50 border-b border-amber-200/60 py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="space-y-4 max-w-xl text-center md:text-left">
            
            {/* Scarcity & Urgency Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-orange-950 text-xs font-black border border-amber-300 shadow-2xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>⚡ Mega Grocery Bonanza</span>
              <span className="text-orange-400">•</span>
              <span className="text-orange-800">15-Min Delivery Live</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              India&apos;s Favorite <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Apna Bazar
              </span> Superstore!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Order fresh daily groceries, kitchen staples, snacks &amp; personal care at wholesale prices. 
              <strong className="text-slate-900 ml-1">100% Cash on Delivery — Pay only when your order arrives at your door!</strong>
            </p>

            {/* Countdown Flash Deal Pill for Human Psychology */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs flex items-center justify-between gap-3 max-w-md mx-auto md:mx-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 animate-pulse shrink-0" />
                <span className="text-xs font-black text-slate-900">Flash Deals Expire in:</span>
              </div>
              
              <div className="flex items-center gap-1.5 font-mono text-xs font-black text-slate-900">
                <span className="bg-slate-900 text-amber-300 px-2 py-1 rounded-md shadow-2xs">
                  {formatNum(timeLeft.hours)}h
                </span>
                <span>:</span>
                <span className="bg-slate-900 text-amber-300 px-2 py-1 rounded-md shadow-2xs">
                  {formatNum(timeLeft.minutes)}m
                </span>
                <span>:</span>
                <span className="bg-slate-900 text-amber-300 px-2 py-1 rounded-md shadow-2xs">
                  {formatNum(timeLeft.seconds)}s
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <button
                onClick={() => {
                  onSelectCategory('dry-fruits');
                  onExploreShop();
                }}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Shop Festive Deals 🎁</span>
              </button>

              <button
                onClick={onOpenCouponModal}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white hover:bg-slate-50 border border-amber-300 text-slate-800 text-xs font-bold shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Coupons &amp; Offers (Code: GROCERY200)</span>
              </button>
            </div>

            {/* Social Proof Bar */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700">
                <Users className="w-4 h-4 text-blue-600" />
                <span>1,480+ Orders Delivered Today in Baharagora ⭐</span>
              </div>
            </div>

          </div>

          {/* Right Visual Image Card with Badge */}
          <div className="relative shrink-0 w-full max-w-sm sm:max-w-md">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80"
                alt="Apna Bazar Fresh Groceries"
                className="w-full h-64 sm:h-76 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <span className="text-[10px] uppercase font-black bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 rounded-full text-white shadow-xs">
                    ⚡ 15-Minute Doorstep Delivery
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-1">100% Quality Inspected Groceries</h3>
                  <p className="text-xs text-slate-200">Delivered directly from Apna Bazar Baharagora Hub</p>
                  <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1 pt-1">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Zero advance • Pay cash on delivery</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. "Why Shop From Apna Bazar?" Section with 4 Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Millions Choose Us</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Shop From <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Apna Bazar?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            India&apos;s trusted grocery destination for genuine products, wholesale pricing &amp; 15-minute doorstep express delivery.
          </p>
        </div>

        {/* 4 Stat Boxes with Glowing Borders */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1 hover:border-amber-400 hover:shadow-md transition-all">
            <h4 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              5,000+
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Happy Customers</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1 hover:border-emerald-400 hover:shadow-md transition-all">
            <h4 className="text-2xl sm:text-3xl font-black text-emerald-600">
              15 Min
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Express Delivery</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1 hover:border-amber-400 hover:shadow-md transition-all">
            <h4 className="text-2xl sm:text-3xl font-black text-amber-600">
              700+
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Products Available</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1 hover:border-emerald-400 hover:shadow-md transition-all">
            <h4 className="text-2xl sm:text-3xl font-black text-emerald-600">
              100%
            </h4>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Genuine &amp; Sealed</p>
          </div>
        </div>

        {/* 3. Six Feature Highlight Cards (01 to 06) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          
          {/* 01 */}
          <div 
            onClick={onExploreShop}
            className="p-5 rounded-3xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">01</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                Superfast 15-Min Delivery
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hyperlocal fulfillment in Baharagora. Daily groceries and essentials delivered right to your doorstep.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 02 */}
          <div 
            onClick={onExploreShop}
            className="p-5 rounded-3xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-xs">
                <Percent className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-700">02</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                Best Price Guarantee
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Wholesale everyday rates. Save more on every order with unmatched discounts and transparent billing.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
              Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 03 */}
          <div 
            onClick={onExploreShop}
            className="p-5 rounded-3xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-black shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-rose-700">03</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-rose-700 transition-colors">
                100% Genuine Brands
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Direct partnerships with Godrej, Lipton, Fortune, Tata, Aashirvaad, and Bisk Farm. Sealed &amp; fresh.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
              Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 04 */}
          <div 
            onClick={onExploreShop}
            className="p-5 rounded-3xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black shadow-xs">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-700">04</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                100% Cash on Delivery
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Zero upfront payment required. Verify your package and delivery OTP at your doorstep before paying.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
              Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 05 */}
          <div 
            onClick={onExploreShop}
            className="p-5 rounded-3xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-violet-500 text-white flex items-center justify-center font-black shadow-xs">
                <Tag className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-700">05</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                Weekly Bonanza &amp; Coupons
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Unlock instant savings with coupon codes like GROCERY200, BAHARAGORA10, and FREESHIP on checkout.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
              Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 06 */}
          <div 
            onClick={onExploreShop}
            className="p-5 rounded-3xl bg-teal-50/50 hover:bg-teal-50 border border-teal-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-black shadow-xs">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-700">06</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                Customer First Guarantee
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                7-Day hassle-free replacement, direct telephone &amp; WhatsApp helpline for instant order assistance.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
              Explore Catalog <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>

      </section>

    </div>
  );
};
