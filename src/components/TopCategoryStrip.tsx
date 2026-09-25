import React from 'react';
import { CATEGORIES } from '../data/products';
import { Sparkles, Flame } from 'lucide-react';

interface TopCategoryStripProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const TopCategoryStrip: React.FC<TopCategoryStripProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="w-full bg-white border-b border-slate-200/90 py-4 shadow-2xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Human Psychology Trigger */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Shop by Category</span>
                <span className="text-[10px] bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Trending
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Fresh daily groceries &amp; household essentials delivered in 15 mins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>15-Min Express Hub</span>
          </div>
        </div>

        {/* Horizontal Scrollable Categories with Circular Images matching modern apps */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex flex-col items-center shrink-0 p-1.5 sm:p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50/60 scale-105 shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Circular Image Container with Glowing Gradient Ring */}
                <div
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 shadow-lg shadow-orange-500/25 ring-2 ring-amber-400/40'
                      : 'bg-gradient-to-tr from-slate-200 to-slate-100 group-hover:from-amber-300 group-hover:to-orange-400'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Micro Badge for Psychology Conversion */}
                  {cat.id === 'all' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      ALL
                    </span>
                  )}
                  {cat.id === 'atta-rice-dal' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white animate-pulse">
                      HOT
                    </span>
                  )}
                  {cat.id === 'oil-ghee' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      -20%
                    </span>
                  )}
                  {cat.id === 'dry-fruits' && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white">
                      PURE
                    </span>
                  )}
                </div>

                {/* Category Labels */}
                <div className="text-center mt-1.5 w-18 sm:w-22">
                  <p
                    className={`text-xs sm:text-[13px] font-black leading-tight line-clamp-1 transition-colors ${
                      isSelected
                        ? 'text-orange-600 font-extrabold'
                        : 'text-slate-800 group-hover:text-amber-600'
                    }`}
                  >
                    {cat.name.split('&')[0].trim()}
                  </p>
                  {cat.hindiName && (
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                      {cat.hindiName}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
