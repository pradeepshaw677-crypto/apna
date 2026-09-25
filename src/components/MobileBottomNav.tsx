import React from 'react';
import { LayoutGrid, Store, ShoppingBag, User, MoreHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'home' | 'orders' | 'profile' | 'more';
  onSelectTab: (tab: 'dashboard' | 'home' | 'orders' | 'profile' | 'more') => void;
  cartCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-lg md:hidden py-1 px-3">
      <div className="flex items-center justify-around">
        
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-amber-400 text-slate-950 shadow-xs' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Dashboard</span>
        </button>

        {/* 2. Shop Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-amber-400 text-slate-950 shadow-xs' : ''}`}>
            <Store className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Shop Home</span>
        </button>

        {/* 3. Orders */}
        <button
          onClick={() => onSelectTab('orders')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            activeTab === 'orders'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all relative ${activeTab === 'orders' ? 'bg-amber-400 text-slate-950 shadow-xs' : ''}`}>
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </button>

        {/* 4. Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-amber-400 text-slate-950 shadow-xs' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </button>

        {/* 5. More */}
        <button
          onClick={() => onSelectTab('more')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'more'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'more' ? 'bg-amber-400 text-slate-950 shadow-xs' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">More</span>
        </button>

      </div>
    </div>
  );
};
