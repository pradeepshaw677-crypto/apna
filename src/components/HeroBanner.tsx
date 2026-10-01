import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Users, 
  Banknote, 
  Tag,
  ShoppingBag,
  Zap,
  Flame,
  Award
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
    <div className="w-full">
      {/* 1. Festive Fashion, Footwear, Toys & Lifestyle Hero Banner */}
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
              <span>⚡ Big Fashion &amp; Lifestyle Festival</span>
              <span className="text-orange-400">•</span>
              <span className="text-orange-800">15-Min Delivery Live in Baharagora</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Trending Fashion &amp; Footwear <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Apna Bazar
              </span> Superstore!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Discover viral streetwear, luxury sneakers, high-speed toys &amp; designer accessories at wholesale prices. 
              <strong className="text-slate-900 ml-1">100% Cash on Delivery &amp; 5-Day Hassle-Free Returns with OTP verification!</strong>
            </p>

            {/* Countdown Flash Deal Pill */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs flex items-center justify-between gap-3 max-w-md mx-auto md:mx-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 animate-pulse shrink-0" />
                <span className="text-xs font-black text-slate-900">Flash Festival Deals End In:</span>
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
                  onSelectCategory('fashion');
                  onExploreShop();
                }}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Shop Trending Fashion 🔥</span>
              </button>

              <button
                onClick={onOpenCouponModal}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white hover:bg-slate-50 border border-amber-300 text-slate-800 text-xs font-bold shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Coupons &amp; Offers (Code: APNAFIRST)</span>
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
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
                alt="Apna Bazar Fashion & Lifestyle"
                className="w-full h-64 sm:h-80 object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <span className="text-[10px] uppercase font-black bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 rounded-full text-slate-950 shadow-xs">
                    ⚡ New Season Drop
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-1">Footwear, Apparel, Toys &amp; Accessories</h3>
                  <p className="text-xs text-slate-200">Dispatched in 15 mins directly from Baharagora Hub</p>
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
    </div>
  );
};
