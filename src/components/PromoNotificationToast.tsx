import React, { useState, useEffect } from 'react';
import { Tag, X, Check, Sparkles, ArrowRight, Percent } from 'lucide-react';
import { Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/products';
import confetti from 'canvas-confetti';

interface PromoNotificationToastProps {
  onApplyCoupon: (coupon: Coupon) => void;
  appliedCoupon: Coupon | null;
}

export const PromoNotificationToast: React.FC<PromoNotificationToastProps> = ({
  onApplyCoupon,
  appliedCoupon,
}) => {
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Rotate through coupons periodically
  useEffect(() => {
    // Delay initial appearance by 2.5 seconds
    const timer = setTimeout(() => {
      if (!isDismissed) setIsVisible(true);
    }, 2500);

    const interval = setInterval(() => {
      setCurrentCouponIndex((prev) => (prev + 1) % AVAILABLE_COUPONS.length);
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  const activeCoupon = AVAILABLE_COUPONS[currentCouponIndex] || AVAILABLE_COUPONS[0];
  const isCurrentlyApplied = appliedCoupon?.code === activeCoupon.code;

  if (isDismissed || !isVisible) return null;

  const handleApply = () => {
    onApplyCoupon(activeCoupon);
    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.85 },
        colors: ['#f59e0b', '#fb923c', '#e11d48', '#8b5cf6']
      });
    } catch {}
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-auto z-40 max-w-sm w-auto sm:w-full mx-auto sm:mx-0 animate-slideUp">
      <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 relative overflow-hidden group">
        
        {/* Amber Glow Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />

        {/* Promo Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 font-black">
          <Percent className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Promo Message */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
              {activeCoupon.code}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Special Offer
            </span>
          </div>
          <p className="text-xs font-bold text-slate-100 truncate mt-1">
            {activeCoupon.description}
          </p>
          <p className="text-[10px] text-slate-400">
            Min order: ₹{activeCoupon.minOrderValue}
          </p>
        </div>

        {/* Apply CTA Button */}
        <div>
          {isCurrentlyApplied ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-950/60 px-2.5 py-1.5 rounded-xl border border-amber-500/40">
              <Check className="w-3.5 h-3.5" />
              <span>Applied</span>
            </span>
          ) : (
            <button
              onClick={handleApply}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              Apply
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
