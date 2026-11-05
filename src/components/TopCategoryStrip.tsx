import React from 'react';
import { CATEGORIES } from '../data/products';
import { Sparkles, Flame, ChevronRight, LayoutGrid } from 'lucide-react';

interface TopCategoryStripProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onOpenMeeshoDrawer?: () => void;
}

export const TopCategoryStrip: React.FC<TopCategoryStripProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenMeeshoDrawer,
}) => {
  return (
    <section className="w-full bg-white border-b border-slate-200/90 py-3.5 sm:py-4 shadow-2xs relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header with Fashion Aesthetics - Single Line on Mobile */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current animate-bounce" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <span>Fashion &amp; Apparel</span>
                <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                  2026 Hot
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenMeeshoDrawer && (
              <button
                type="button"
                onClick={onOpenMeeshoDrawer}
                className="flex items-center gap-1 text-[11px] font-black text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:opacity-95 px-2.5 py-1 rounded-full shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Categories</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>15-Min Express in Jharkhand</span>
            </div>
          </div>
        </div>

        {/* User Request: Single line fashion & apparel category bar with smooth horizontal scroll */}
        <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          
          {/* Direct Category Menu Launcher in the Row */}
          {onOpenMeeshoDrawer && (
            <button
              type="button"
              onClick={onOpenMeeshoDrawer}
              className="group flex flex-col items-center shrink-0 p-1.5 sm:p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 shadow-md ring-2 ring-rose-400/40">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-white">
                  <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black tracking-widest text-amber-300 uppercase mt-0.5">EXPLORE</span>
                </div>
              </div>
              <div className="text-center mt-1 w-18 px-0.5">
                <p className="text-[11px] sm:text-xs font-black text-rose-600 truncate">
                  All Hubs
                </p>
              </div>
            </button>
          )}

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex flex-col items-center shrink-0 p-1.5 sm:p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-50 via-orange-50/50 to-amber-50/20 scale-105 shadow-md shadow-amber-500/10'
                    : 'hover:bg-slate-50 hover:scale-102'
                }`}
              >
                {/* Circular Image Container with Fashion Gradient Glow */}
                <div
                  className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-full p-0.5 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/30 ring-2 ring-amber-400/50'
                      : 'bg-gradient-to-tr from-slate-200 to-slate-100 group-hover:from-amber-400 group-hover:to-orange-400'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Micro Badges for Categories */}
                  {cat.id === 'all' && (
                    <span className="absolute -top-1 -right-1 bg-slate-900 text-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      ALL
                    </span>
                  )}
                  {cat.id === 'fashion' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white animate-pulse">
                      HOT
                    </span>
                  )}
                  {cat.id === 'footwear' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      TOP
                    </span>
                  )}
                  {cat.id === 'toys' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      NEW
                    </span>
                  )}
                  {cat.id === 'accessories' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      LUXE
                    </span>
                  )}
                </div>

                {/* Category Labels - Single Line Clean names */}
                <div className="text-center mt-1 w-16 sm:w-20 px-0.5">
                  <p
                    className={`text-[11px] sm:text-xs font-black leading-tight whitespace-nowrap truncate transition-colors ${
                      isSelected
                        ? 'text-amber-700 font-black'
                        : 'text-slate-800 group-hover:text-amber-700'
                    }`}
                    title={cat.name}
                  >
                    {cat.id === 'all'
                      ? 'All'
                      : cat.id === 'sarees'
                      ? 'Sarees'
                      : cat.id === 'fashion'
                      ? 'Apparel'
                      : cat.id === 'footwear'
                      ? 'Shoes'
                      : cat.id === 'toys'
                      ? 'Kids'
                      : cat.id === 'accessories'
                      ? 'Watches'
                      : cat.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
