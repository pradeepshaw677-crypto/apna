import React from 'react';
import { 
  Sparkles, 
  Zap, 
  Percent, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  PhoneCall, 
  ChevronRight, 
  Truck, 
  Banknote, 
  Award 
} from 'lucide-react';

interface WhyShopSectionProps {
  onExploreShop?: () => void;
}

export const WhyShopSection: React.FC<WhyShopSectionProps> = ({ onExploreShop }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>India&apos;s Favorite Superstore</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Why Shop From <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Apna Bazar?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Delivering the latest trending fashion, footwear, toys, and lifestyle essentials at unbeatable wholesale prices with 15-minute doorstep express fulfillment.
        </p>
      </div>

      {/* 4 Stat Boxes with Glowing Accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-amber-400 hover:shadow-lg transition-all group">
          <h4 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
            10,000+
          </h4>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Happy Shoppers</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-orange-400 hover:shadow-lg transition-all group">
          <h4 className="text-2xl sm:text-3xl font-black text-orange-600 group-hover:scale-105 transition-transform">
            15 Mins
          </h4>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Express Delivery</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-rose-400 hover:shadow-lg transition-all group">
          <h4 className="text-2xl sm:text-3xl font-black text-rose-600 group-hover:scale-105 transition-transform">
            5-Day
          </h4>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Easy Returns &amp; OTP</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-amber-400 hover:shadow-lg transition-all group">
          <h4 className="text-2xl sm:text-3xl font-black text-amber-600 group-hover:scale-105 transition-transform">
            100%
          </h4>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Cash on Delivery</p>
        </div>
      </div>

      {/* 6 Feature Highlight Cards (01 to 06) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        
        {/* 01 */}
        <div 
          onClick={onExploreShop}
          className="p-5 rounded-3xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200/80 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-mono font-bold text-amber-800">01</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">
              15-Min Express Doorstep Delivery
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Hyperlocal warehouse dispatch located right in Baharagora, Jharkhand. Order any trending fashion or footwear item and receive it at your doorstep within minutes.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
            Shop Trending Styles <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 02 */}
        <div 
          onClick={onExploreShop}
          className="p-5 rounded-3xl bg-orange-50/60 hover:bg-orange-50 border border-orange-200/80 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center font-black shadow-xs">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-orange-800">02</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base group-hover:text-orange-700 transition-colors">
              Direct Wholesale Factory Pricing
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Zero middlemen. We source apparel, sneakers, toys, and luxury accessories directly from certified factories to guarantee up to 70% savings below MRP.
            </p>
          </div>
          <span className="text-xs font-bold text-orange-700 flex items-center gap-1">
            View Wholesale Discounts <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 03 */}
        <div 
          onClick={onExploreShop}
          className="p-5 rounded-3xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-blue-700">03</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base group-hover:text-blue-700 transition-colors">
              100% Cash on Delivery &amp; OTP
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Zero advance payment required. Inspect your order when the courier arrives, verify items with your 6-digit delivery OTP, and pay cash or UPI easily.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
            Order with COD <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 04 */}
        <div 
          onClick={onExploreShop}
          className="p-5 rounded-3xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-black shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-700">04</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base group-hover:text-purple-700 transition-colors">
              5-Day Hassle-Free Returns with OTP
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Size didn&apos;t fit or changed your mind? Request return with 1 tap from your Orders tab within 5 days. Hand over parcel to pickup agent with your Return OTP.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
            Learn Return Policy <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 05 */}
        <div 
          onClick={onExploreShop}
          className="p-5 rounded-3xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-500 text-white flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-rose-700">05</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base group-hover:text-rose-700 transition-colors">
              100% Genuine &amp; Quality Inspected
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Every item undergoes strict multi-point physical inspection before packaging. Authentic branded apparel, durable soles, and child-safe non-toxic toys.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
            Quality Guarantee <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 06 */}
        <div 
          onClick={onExploreShop}
          className="p-5 rounded-3xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 shadow-2xs transition-all space-y-3 cursor-pointer group hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-amber-900">06</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base group-hover:text-amber-800 transition-colors">
              Direct Baharagora Local Helpline
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              No robot delays. Call or WhatsApp our Baharagora store desk directly on +91 6207462800 for instant assistance, order tracking, and size consultations.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
            Contact Support Desk <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>

    </section>
  );
};
