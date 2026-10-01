import React from 'react';
import { Store, LayoutGrid, ShoppingBag, Package, User } from 'lucide-react';

export type MobileTab = 'home' | 'categories' | 'cart' | 'orders' | 'profile';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: MobileTab) => void;
  cartCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl md:hidden py-1 px-2 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* 1. Shop Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-amber-400 text-slate-950 shadow-xs scale-105' : ''}`}>
            <Store className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Home</span>
        </button>

        {/* 2. Categories */}
        <button
          type="button"
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-amber-400 text-slate-950 shadow-xs scale-105' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Categories</span>
        </button>

        {/* 3. My Bag (Cart with Live Counter) */}
        <button
          type="button"
          onClick={() => onSelectTab('cart')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'cart'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative p-1.5 rounded-xl transition-all">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">My Bag</span>
        </button>

        {/* 4. Orders & Tracking */}
        <button
          type="button"
          onClick={() => onSelectTab('orders')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-amber-400 text-slate-950 shadow-xs scale-105' : ''}`}>
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Orders</span>
        </button>

        {/* 5. Account / Profile */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile' || activeTab === 'dashboard'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'profile' || activeTab === 'dashboard' ? 'bg-amber-400 text-slate-950 shadow-xs scale-105' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Account</span>
        </button>

      </div>
    </nav>
  );
};
