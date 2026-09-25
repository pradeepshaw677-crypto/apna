import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistedProducts: Product[];
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistedProducts,
  onAddToCart,
  onRemoveFromWishlist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">My Wishlist</h3>
              <p className="text-[11px] text-slate-400">{wishlistedProducts.length} saved styles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {wishlistedProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Your Wishlist is Empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Save your favorite clothes, sneakers, and accessories here to buy them anytime!
              </p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-20 object-cover object-top rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase text-slate-400">{product.brand}</p>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] font-bold text-amber-600">({product.discountPercent}% OFF)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onRemoveFromWishlist(product.id);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors flex items-center gap-1"
                    title="Move to Bag"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Move to Bag</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(product.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors self-end"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
