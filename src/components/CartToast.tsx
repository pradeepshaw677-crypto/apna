import React from 'react';
import { ShoppingBag, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/pricing';

export interface CartToastItem {
  product: Product;
  size?: string;
  color?: string;
  price: number;
}

interface CartToastProps {
  item: CartToastItem | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const CartToast: React.FC<CartToastProps> = ({
  item,
  onClose,
  onOpenCart,
}) => {
  if (!item) return null;

  return (
    <div className="fixed top-20 left-3 right-3 sm:left-auto sm:right-6 z-50 max-w-sm w-auto sm:w-full mx-auto sm:mx-0 animate-slideIn">
      <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 relative overflow-hidden">
        
        {/* Amber Glow Background */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Product Thumbnail */}
        <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-0.5 rounded-tl">
            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Added to Bag
            </span>
          </div>
          <h4 className="text-xs font-black text-white truncate mt-0.5">
            {item.product.name}
          </h4>
          <p className="text-[11px] text-slate-300 font-medium">
            {item.size && <span>Size: <strong>{item.size}</strong></span>}
            {item.color && <span> • <strong>{item.color}</strong></span>}
            <span className="ml-1 text-amber-300 font-black">({formatINR(item.price)})</span>
          </p>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => {
            onClose();
            onOpenCart();
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Bag</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
