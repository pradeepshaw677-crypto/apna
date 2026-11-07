import React from 'react';
import { ShoppingCart, Sparkles, ShieldCheck, Truck, RefreshCcw, Tag, Smile, Gem } from 'lucide-react';
import { Product } from '../types';

export interface DiwaliDealItem {
  id: string;
  name: string;
  categoryTag: string;
  categoryIcon: string;
  originalPrice: number;
  dealPrice: number;
  image: string;
  silkGradient: string;
  targetProductId: string;
  categoryId: string;
}

export const DIWALI_TOP_DEALS: DiwaliDealItem[] = [
  {
    id: 'diwali-1-brooklyn',
    name: 'Brooklyn Fleece Streetwear Hoodie',
    categoryTag: "Men's Wear",
    categoryIcon: '👑',
    originalPrice: 499,
    dealPrice: 299,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#0284c7] via-[#0369a1] to-[#1e3a8a]',
    targetProductId: 'fsh-001',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-2-polo',
    name: 'Classic White Tipped Collar Polo',
    categoryTag: "Men's Wear",
    categoryIcon: '👑',
    originalPrice: 399,
    dealPrice: 299,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#16a34a] via-[#15803d] to-[#14532d]',
    targetProductId: 'fsh-002',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-3-flannel',
    name: 'Buffalo Plaid Check Casual Shirt',
    categoryTag: "Men's Wear",
    categoryIcon: '👑',
    originalPrice: 449,
    dealPrice: 349,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#9333ea] via-[#7e22ce] to-[#581c87]',
    targetProductId: 'fsh-004',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-4-jeans',
    name: 'Classic Indigo Blue Denim Jeans',
    categoryTag: 'Jeans',
    categoryIcon: '👑',
    originalPrice: 799,
    dealPrice: 599,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#eab308] via-[#ca8a04] to-[#854d0e]',
    targetProductId: 'fsh-003',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-5-pinkdress',
    name: 'Pink Floral Flared Puff-Sleeve Dress',
    categoryTag: "Women's Wear",
    categoryIcon: '👑',
    originalPrice: 699,
    dealPrice: 499,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#ec4899] via-[#db2777] to-[#9d174d]',
    targetProductId: 'fsh-003',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-6-kurti',
    name: 'Royal Maroon Zari Embroidered Kurti',
    categoryTag: "Women's Wear",
    categoryIcon: '👑',
    originalPrice: 499,
    dealPrice: 349,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#7c3aed] via-[#6d28d9] to-[#4c1d95]',
    targetProductId: 'fsh-004',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-7-whitefrock',
    name: 'Sweetheart White Floral Summer Frock',
    categoryTag: "Women's Wear",
    categoryIcon: '👑',
    originalPrice: 599,
    dealPrice: 399,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#22c55e] via-[#16a34a] to-[#15803d]',
    targetProductId: 'fsh-003',
    categoryId: 'fashion',
  },
  {
    id: 'diwali-8-handbag',
    name: 'Blush Pink Golden Heart Sling Bag',
    categoryTag: 'Handbag',
    categoryIcon: '👑',
    originalPrice: 499,
    dealPrice: 249,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    silkGradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
    targetProductId: 'acc-003',
    categoryId: 'accessories',
  },
];

interface DiwaliTopDealsSectionProps {
  onSelectProductById?: (productId: string) => void;
  onExploreShop?: () => void;
  onAddToCartDirect?: (deal: DiwaliDealItem) => void;
}

export const DiwaliTopDealsSection: React.FC<DiwaliTopDealsSectionProps> = ({
  onSelectProductById,
  onExploreShop,
  onAddToCartDirect,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <div className="relative rounded-3xl overflow-hidden border-3 sm:border-4 border-amber-400 bg-gradient-to-b from-[#18032b] via-[#240645] to-[#120224] p-3 sm:p-6 shadow-[0_0_35px_rgba(251,191,36,0.45)] text-white select-none">
        
        {/* Festive Golden Garland Lights Overlay */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-amber-400/30 to-transparent pointer-events-none" />

        {/* ========================================================================= */}
        {/* HEADER: DIWALI SPECIAL OFFER | TOP DEALS | HAPPY DIWALI & 70% OFF TAG     */}
        {/* ========================================================================= */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 pb-4 border-b border-amber-400/40">
          
          {/* Left: Glowing Diya + Diwali Special Offer Medallion */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#991b1b] via-[#dc2626] to-[#f59e0b] p-1 shadow-lg shadow-amber-500/30 border-2 border-amber-300 flex flex-col items-center justify-center text-center leading-none">
              <span className="text-sm sm:text-base">🪔</span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-200 mt-0.5">Diwali</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-white">Special</span>
              <span className="text-[8px] font-bold text-amber-300">Offer</span>
            </div>
          </div>

          {/* Center: Crown + TOP DEALS 3D Banner + Gold Ribbon */}
          <div className="text-center space-y-1 my-1">
            <div className="flex items-center justify-center gap-1.5 text-amber-400">
              <span className="text-xl sm:text-2xl">👑</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.6)] uppercase">
              TOP DEALS
            </h2>
            <div className="inline-block bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-6 py-1 rounded-full shadow-md uppercase tracking-wider">
              Men &amp; Women Fashion
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-amber-200/90 tracking-wide pt-0.5">
              Shop Smart • Dress Better
            </p>
          </div>

          {/* Right: UP TO 70% OFF Tag + Happy Diwali Glowing Script */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-gradient-to-b from-red-600 to-rose-700 text-white p-2 rounded-2xl border-2 border-amber-300 shadow-md text-center leading-tight">
              <span className="text-[9px] font-bold uppercase block text-amber-200">UP TO</span>
              <span className="text-base sm:text-xl font-black text-white block">70%</span>
              <span className="text-[10px] font-black text-amber-300 uppercase block">OFF</span>
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-amber-300 block tracking-wider">Happy</span>
              <span className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 block drop-shadow-xs italic">
                Diwali 🪔
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* TRUST BADGES STRIP (MATCHING SCREENSHOT SIDE PILLARS)                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 py-3 border-b border-amber-400/25 text-[10px] sm:text-xs font-bold text-amber-100/90 text-center">
          <div className="flex items-center justify-center gap-1 bg-white/5 py-1 px-1.5 rounded-lg border border-amber-400/20">
            <Gem className="w-3 h-3 text-amber-400" />
            <span className="truncate">Premium Quality</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white/5 py-1 px-1.5 rounded-lg border border-amber-400/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="truncate">Secure Shopping</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white/5 py-1 px-1.5 rounded-lg border border-amber-400/20">
            <Truck className="w-3 h-3 text-amber-400" />
            <span className="truncate">Free Shipping</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white/5 py-1 px-1.5 rounded-lg border border-amber-400/20">
            <RefreshCcw className="w-3 h-3 text-sky-400" />
            <span className="truncate">Easy Returns</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white/5 py-1 px-1.5 rounded-lg border border-amber-400/20">
            <Tag className="w-3 h-3 text-rose-400" />
            <span className="truncate">Lowest Price</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white/5 py-1 px-1.5 rounded-lg border border-amber-400/20">
            <Smile className="w-3 h-3 text-yellow-400" />
            <span className="truncate">Happy Customers</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8 PRODUCT CARDS GRID (EXACT 2 ROWS OF 4 AS IN SCREENSHOT)                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 pb-4">
          {DIWALI_TOP_DEALS.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onSelectProductById?.(deal.targetProductId)}
              className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-400/90 shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] active:scale-98 transition-all relative"
            >
              {/* Product Visual Container with Silk Background */}
              <div className={`relative aspect-[1/1.05] w-full overflow-hidden bg-gradient-to-br ${deal.silkGradient} p-2 flex items-center justify-center`}>
                
                {/* Category Pill Tag (e.g. 👑 Men's Wear, 👑 Jeans, 👑 Handbag) */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center gap-1 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/60 shadow-xs">
                    <span>{deal.categoryIcon}</span>
                    <span>{deal.categoryTag}</span>
                  </span>
                </div>

                {/* Centered Isolated Product Photo */}
                <img
                  src={deal.image}
                  alt={deal.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-500 shadow-md"
                />

                {/* Subtle festive sparkle highlight */}
                <span className="absolute top-2 right-2 text-amber-300 text-xs drop-shadow-xs">✨</span>
              </div>

              {/* Card Footer: Pricing Banner & Add to Cart Button */}
              <div className="p-2 sm:p-2.5 bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#fcd34d] text-slate-950 text-center space-y-1.5 border-t border-amber-300">
                
                {/* Pricing: Strikethrough + Bold Red Price */}
                <div className="flex items-center justify-center gap-1.5 font-black leading-none">
                  <span className="text-[11px] sm:text-xs text-slate-500 line-through">
                    ₹{deal.originalPrice}*
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#dc2626] drop-shadow-2xs">
                    ₹{deal.dealPrice}*
                  </span>
                </div>

                {/* Item Subtitle */}
                <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                  {deal.name}
                </p>

                {/* Glossy Red Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddToCartDirect) {
                      onAddToCartDirect(deal);
                    } else if (onSelectProductById) {
                      onSelectProductById(deal.targetProductId);
                    }
                  }}
                  className="w-full py-1.5 sm:py-2 px-3 rounded-full bg-gradient-to-r from-[#dc2626] via-[#e11d48] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-900/30 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM BANNER: BIG SAVINGS... BIG HAPPINESS... | SHOP NOW >> | DIYAS      */}
        {/* ========================================================================= */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-400/30 text-center sm:text-left">
          
          <div className="flex items-center gap-2">
            <span className="text-xl">🪔</span>
            <div>
              <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide italic">
                Big Savings... Big Happiness...
              </p>
              <p className="text-[10px] text-amber-100/80 font-medium">
                100% Cash on Delivery &amp; 5-Day Hassle-Free Returns
              </p>
            </div>
          </div>

          {/* Large Shop Now Button */}
          <button
            type="button"
            onClick={onExploreShop}
            className="py-2.5 sm:py-3 px-8 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 border-2 border-amber-300 shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Shop Now &raquo;</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Fashion for Everyone
              </span>
            </div>
            <span className="text-xl">🪔</span>
          </div>

        </div>

      </div>
    </section>
  );
};
