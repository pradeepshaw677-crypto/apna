import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category, CategoryId } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-[108px] z-30 shadow-2xs py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center">
        
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-950 items-center justify-center shadow-xs hover:shadow-md transition-all shrink-0 mr-2 z-10 cursor-pointer active:scale-95"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pills Row - Exact Screenshot 2 */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = cat.itemCount || 40;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border shadow-2xs ${
                  isActive
                    ? 'bg-[#059669] text-white border-[#059669] shadow-sm scale-102'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <CategoryIcon 
                  categoryId={cat.id} 
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} 
                />
                <span>{cat.name} ({count} Items)</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-950 items-center justify-center shadow-xs hover:shadow-md transition-all shrink-0 ml-2 z-10 cursor-pointer active:scale-95"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
