import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  FileText,
  ShoppingBag,
  CheckCircle2,
  BadgePercent,
  Banknote,
  RotateCcw,
  Headphones
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onSelectCategory: (categoryId: string) => void;
  onNavigateView: (view: 'home' | 'dashboard' | 'orders' | 'addresses' | 'refer' | 'support' | 'about' | 'shipping' | 'returns' | 'cancellation' | 'terms' | 'privacy' | 'disclaimer') => void;
  onExploreShop?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigateView,
  onExploreShop,
}) => {
  return (
    <footer className="bg-[#070d19] text-white pt-10 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. Radiant CTA Banner */}
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 text-center space-y-4 shadow-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Apna Bazar Express Guarantee</span>
          </span>

          <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Quality Groceries. Better Prices. <br className="hidden sm:inline" />
            Superfast 15-Minute Doorstep Delivery! 🚀
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-900/80 max-w-lg mx-auto">
            Everything your family needs — from fresh daily staples to personal care &amp; festival treats. Pay only when you receive via Cash on Delivery!
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (onExploreShop) onExploreShop();
                onNavigateView('home');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 inline-flex items-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-slate-950/30"
            >
              <span>Explore Apna Bazar Catalog</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* 2. Four Trust Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-y border-slate-800/80">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">15-Min Delivery</p>
              <p className="text-[10px] text-slate-400">Express to your door</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">100% Cash on Delivery</p>
              <p className="text-[10px] text-slate-400">Zero advance fee</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">100% Genuine Items</p>
              <p className="text-[10px] text-slate-400">Direct from top brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Local Customer Care</p>
              <p className="text-[10px] text-slate-400">Call &amp; WhatsApp support</p>
            </div>
          </div>
        </div>

        {/* 3. Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="footer" onClick={() => onNavigateView('home')} />
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              <strong>Apna Bazar</strong> is India&apos;s favorite neighborhood digital superstore. We empower families in Baharagora and across India with fresh groceries, authentic products, wholesale everyday prices, and blazing-fast 15-minute express delivery.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Apna Bazar Logistics Hub, Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:6207462800" className="hover:text-emerald-400 transition-colors">
                  +91 6207462800, +91 9771762719
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:support@apnabazar.in" className="hover:text-emerald-400 transition-colors">
                  support@apnabazar.in
                </a>
              </div>
            </div>
          </div>

          {/* Quick Account Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-slate-200">
              Account &amp; Services
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigateView('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  My Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('home')} className="hover:text-white transition-colors cursor-pointer">
                  Shop Home Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('orders')} className="hover:text-white transition-colors cursor-pointer">
                  Live Orders &amp; Invoices
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('addresses')} className="hover:text-white transition-colors cursor-pointer">
                  Saved Delivery Addresses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('refer')} className="hover:text-amber-400 transition-colors cursor-pointer text-amber-400 font-bold">
                  Refer &amp; Earn ₹200 🎁
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-slate-200">
              Top Categories
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('atta-rice-dal')} className="hover:text-white transition-colors cursor-pointer">
                  Atta, Rice &amp; Dal
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('oil-ghee')} className="hover:text-white transition-colors cursor-pointer">
                  Oil, Ghee &amp; Spices
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('beverages')} className="hover:text-white transition-colors cursor-pointer">
                  Beverages &amp; Premium Tea
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cookies')} className="hover:text-white transition-colors cursor-pointer">
                  Cookies &amp; Biscuits
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('dry-fruits')} className="hover:text-white transition-colors cursor-pointer">
                  Dry Fruits &amp; Dates
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bathing-soaps')} className="hover:text-white transition-colors cursor-pointer">
                  Bathing Soaps &amp; Personal Care
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('household')} className="hover:text-white transition-colors cursor-pointer">
                  Household Essentials
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div className="space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-slate-200">
              Trust &amp; Policies
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigateView('support')} className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-bold">
                  Lodge a Complaint / Ticket
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Apna Bazar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('shipping')} className="hover:text-white transition-colors cursor-pointer">
                  15-Min Express Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('cancellation')} className="hover:text-white transition-colors cursor-pointer">
                  Cancellation Policy (5 Mins)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('returns')} className="hover:text-white transition-colors cursor-pointer">
                  Refund &amp; Replacement Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. Comprehensive SEO & Store Description Section (Requested explicitly: "iska discrioption footer side kar and acche se de") */}
        <div className="pt-8 border-t border-slate-800/80 space-y-6 text-xs text-slate-400 leading-relaxed bg-white/2 p-6 sm:p-8 rounded-3xl border border-white/5">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>About Apna Bazar — India&apos;s Trusted Neighborhood Digital Superstore</span>
            </h3>
            <p>
              Welcome to <strong>Apna Bazar</strong>, Baharagora&apos;s very own one-stop online shopping destination designed to make everyday grocery and household shopping simple, affordable, and blazingly fast. Headquartered at Dadu Complex, Near Shitla Mandir, Baharagora, Apna Bazar connects thousands of local families with farm-fresh products, reputed national brands, and daily essentials — all delivered straight to your doorstep within 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Why Shop from Apna Bazar?</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Unlike traditional marketplaces with delayed shipping, Apna Bazar operates dedicated express fulfillment hubs in Baharagora. Every item undergoes rigorous hygienic inspection, ensuring you receive fresh, sealed, and genuine products every single time.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Cash on Delivery &amp; Zero Risk</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                We believe in total customer trust. You never have to pay upfront online. Every single order is confirmed for Cash on Delivery (COD) with zero convenience fee. Inspect your items at your doorstep, verify your 6-digit delivery OTP with our courier partner, and pay only when fully satisfied.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Unbeatable Wholesale Discounts</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Save big on monthly rations! Enjoy everyday discounted MRPs on Fortune Sunflower Oil, Aashirvaad Shudh Chakki Atta, Godrej No.1 Soaps, Lipton Green Tea, Tata Tea Gold, Clean &amp; Clear, Bisk Farm, and premium dry fruits. Plus, unlock instant coupon codes like <strong className="text-amber-300">GROCERY200</strong> and <strong className="text-amber-300">FREESHIP</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-white/5 space-y-1">
            <p>
              <strong>Popular Categories in Baharagora:</strong> Atta, Rice &amp; Pulses | Refined Oils &amp; Desi Ghee | Green Tea &amp; Coffee | Biscuits &amp; Bakery | Premium Dates &amp; Raisins | Bathing Soaps &amp; Body Washes | Detergent Powders &amp; Cleaners | Ready Snacks &amp; Instant Noodles.
            </p>
            <p>
              <strong>Service Availability:</strong> Main Market, College Road, Shitla Mandir Area, Block Office Road, Tata-Kharagpur Highway Junction, and surrounding panchayats across Baharagora (PIN: 832101).
            </p>
          </div>
        </div>

        {/* 5. Bottom Status Bar & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-bold">Live - Delivering Across Baharagora (PIN: 832101)</span>
          </div>

          <p className="flex items-center gap-1 text-slate-400 font-medium">
            <span>Built with ❤️ for Indian Families</span>
            <span>• © 2026 Apna Bazar. All rights reserved.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
