import React from 'react';
import { 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  Heart, 
  Banknote, 
  BadgePercent, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onSelectCategory: (categoryId: string) => void;
  onNavigateView: (view: 'home' | 'dashboard' | 'orders' | 'addresses' | 'refer' | 'support' | 'about' | 'shipping' | 'returns' | 'cancellation' | 'terms' | 'privacy' | 'disclaimer') => void;
  onExploreShop: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigateView,
  onExploreShop,
}) => {
  return (
    <footer className="bg-slate-950 text-white pt-12 pb-24 md:pb-12 border-t border-slate-800 relative overflow-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* 1. Value Proposition Pillars Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white">15-Min Express</h4>
              <p className="text-[11px] text-slate-400">Jharkhand Express Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white">5-Day Returns</h4>
              <p className="text-[11px] text-slate-400">Easy OTP Pickup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white">100% COD</h4>
              <p className="text-[11px] text-slate-400">Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white">Genuine Brands</h4>
              <p className="text-[11px] text-slate-400">100% Verified Quality</p>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Links Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="footer" onClick={() => onNavigateView('home')} />
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              <strong>Apna Bazar</strong> is India&apos;s trusted fashion and lifestyle superstore. We empower shoppers in Baharagora and across Jharkhand with trending apparel, sneakers, toys, and luxury accessories at unbeatable wholesale prices with 15-minute express delivery.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Apna Bazar Express Hub, Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:6207462800" className="hover:text-amber-400 transition-colors">
                  +91 6207462800, +91 9771762719
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:support@apnabazar.in" className="hover:text-amber-400 transition-colors">
                  support@apnabazar.in
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-amber-400">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('all')} className="hover:text-white transition-colors cursor-pointer">
                  All Collections
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('fashion')} className="hover:text-white transition-colors cursor-pointer">
                  Fashion &amp; Apparel
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('footwear')} className="hover:text-white transition-colors cursor-pointer">
                  Footwear &amp; Shoes
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('toys')} className="hover:text-white transition-colors cursor-pointer">
                  Toys &amp; Kids Games
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('accessories')} className="hover:text-white transition-colors cursor-pointer">
                  Watches &amp; Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-amber-400">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateView('support')} className="hover:text-white transition-colors cursor-pointer">
                  Help Center &amp; Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('returns')} className="hover:text-white transition-colors cursor-pointer">
                  5-Day Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('shipping')} className="hover:text-white transition-colors cursor-pointer">
                  Delivery &amp; Shipping
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('cancellation')} className="hover:text-white transition-colors cursor-pointer">
                  Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('orders')} className="hover:text-white transition-colors cursor-pointer">
                  Track Active Order
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div className="space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-amber-400">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateView('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Apna Bazar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('disclaimer')} className="hover:text-white transition-colors cursor-pointer">
                  Disclaimer &amp; Authenticity
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateView('refer')} className="hover:text-amber-400 transition-colors cursor-pointer font-bold">
                  Refer &amp; Earn ₹200
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Detailed About Apna Bazar SEO Section */}
        <div className="pt-8 border-t border-slate-800/80 space-y-6 text-xs text-slate-400 leading-relaxed bg-white/2 p-6 sm:p-8 rounded-3xl border border-white/5">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>About Apna Bazar — India&apos;s Trusted Fashion &amp; Lifestyle Superstore</span>
            </h3>
            <p>
              Welcome to <strong>Apna Bazar</strong>, Baharagora and Jharkhand&apos;s leading online destination for trending fashion, sneakers, educational toys, and lifestyle accessories. Headquartered at Dadu Complex, Near Shitla Mandir, Baharagora, Apna Bazar connects thousands of shoppers with high-quality branded collections, wholesale prices, 100% Cash on Delivery, and 5-Day Hassle-Free Returns with 6-digit OTP verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>15-Minute Doorstep Express in Jharkhand</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Unlike traditional online stores that take 4 to 7 days, Apna Bazar operates dedicated express fulfillment hubs right in Baharagora. Order apparel, footwear, or toys and receive them within minutes.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Cash on Delivery &amp; Zero Risk</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Total customer peace of mind. No advance online payment required. Inspect your order at doorstep, verify with your 6-digit OTP, and pay cash or UPI only upon satisfaction.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-rose-400 shrink-0" />
                <span>5-Day Easy Returns with Pickup OTP</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Wrong size or want to exchange? Request an easy return from your Orders tab within 5 days of delivery. A 6-digit Return OTP ensures secure pickup and instant refund.
              </p>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-white/5 space-y-1">
            <p>
              <strong>Curated Collections:</strong> Oversized Graphic Tees | Cotton Slim Shirts | Denim Jeans | Ethnic Kurtas | Running Sneakers | Formal Leather Loafers | Remote Control Cars | Building Block Sets | Smart Watches | UV Sunglasses.
            </p>
            <p>
              <strong>Fulfillment Hub:</strong> Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101. Serving all surrounding Jharkhand districts.
            </p>
          </div>
        </div>

        {/* 4. Bottom Status Bar & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-300 font-bold">Live - Express Doorstep Delivery Active in Jharkhand (PIN: 832101)</span>
          </div>

          <p className="flex items-center gap-1 text-slate-400 font-medium">
            <span>Built with ❤️ for Indian Shoppers</span>
            <span>• © 2026 Apna Bazar. All rights reserved.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
