import React from 'react';
import { Star, Heart, Share2, Plus, Minus, ShoppingBag, Check, Banknote, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (product: Product, newQty: number) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  isWishlisted,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const savings = Math.max(0, product.originalPrice - product.price);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Buy ${product.name} on Apna Bazar for only ₹${product.price}! 100% Cash on Delivery.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group p-3 sm:p-4 relative"
    >
      {/* Top Bar: Discount Badge & Actions (Wishlist + Share) */}
      <div className="flex items-center justify-between z-10">
        {product.discountPercent > 0 ? (
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black tracking-wider flex items-center gap-0.5 shadow-xs">
            ⚡ {product.discountPercent}% OFF
          </span>
        ) : !product.inStock ? (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black">
            SOLD OUT
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
            FRESH
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 scale-110'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative py-2 sm:py-3 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-32 sm:h-40 w-full object-contain group-hover:scale-108 transition-transform duration-300"
          loading="lazy"
        />

        {/* Scarcity badge if stock is low */}
        {product.inStock && product.stockCount && product.stockCount < 10 && (
          <span className="absolute bottom-1 left-1 bg-amber-500/90 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full backdrop-blur-2xs shadow-xs">
            🔥 Only {product.stockCount} Left!
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-1.5 pt-1 text-left">
        
        {/* Star Rating Line */}
        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-slate-700 ml-0.5">{product.rating || 5}</span>
          <span className="text-slate-400 font-normal">({product.reviewsCount || 120})</span>
        </div>

        {/* Product Name */}
        <h4 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
          {product.name}
        </h4>

        {/* Weight / Pack Size */}
        <p className="text-[11px] text-slate-500 font-semibold">
          {product.unit || 'Standard Pack'}
        </p>

        {/* Social Proof Line: "19 people bought this recently" */}
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{Math.floor(14 + (product.reviewsCount % 22))} ordered today in Baharagora</span>
        </p>

        {/* Price Row: Current Price, MRP, Save amount */}
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-sm sm:text-base font-black text-slate-950">
            ₹{product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
          {savings > 0 && (
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              SAVE ₹{savings}
            </span>
          )}
        </div>

        {/* COD Reassurance micro-tag */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 pt-0.5">
          <Banknote className="w-3 h-3 text-emerald-600" />
          <span>Pay Cash on Delivery</span>
        </div>
      </div>

      {/* Bottom Action: Radiant Glowing "Add to Cart" Button */}
      <div className="pt-3">
        {quantityInCart > 0 ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between bg-emerald-700 text-white rounded-full p-1 shadow-md shadow-emerald-700/20"
          >
            <button
              onClick={() => onUpdateQuantity(product, quantityInCart - 1)}
              className="w-7 h-7 rounded-full bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black px-2">{quantityInCart} in Cart</span>
            <button
              onClick={() => onUpdateQuantity(product, quantityInCart + 1)}
              className="w-7 h-7 rounded-full bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : !product.inStock ? (
          <button
            disabled
            className="w-full py-2.5 px-3 rounded-full bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full py-2.5 px-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 border border-amber-300 hover:scale-102 active:scale-98 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>

    </div>
  );
};
