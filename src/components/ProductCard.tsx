import React, { useState } from 'react';
import { Star, Heart, Share2, Plus, Minus, ShoppingBag, Banknote, Sparkles, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { getSizePriceDelta, formatINR } from '../utils/pricing';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isWishlisted: boolean;
  onAddToCart: (product: Product, size?: string, color?: string, priceOverride?: number) => void;
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
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );

  // Dynamic Size Price Adjustment
  const sizeDelta = getSizePriceDelta(selectedSize);
  const currentPrice = product.price + sizeDelta;
  const currentOriginalPrice = product.originalPrice + sizeDelta;
  const savings = Math.max(0, currentOriginalPrice - currentPrice);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Apna Bazar for only ${formatINR(currentPrice)}! 100% Cash on Delivery & 5-Day Returns.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
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
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-600 text-white text-[10px] font-black tracking-wider flex items-center gap-0.5 shadow-xs">
            ⚡ {product.discountPercent}% OFF
          </span>
        ) : !product.inStock ? (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black">
            SOLD OUT
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
            NEW DROP
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
      <div className="relative py-2 sm:py-3 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50/70 my-1">
        <img
          src={product.image}
          alt={product.name}
          className="h-36 sm:h-44 w-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-300"
          loading="lazy"
        />

        {/* Stock Scarcity Badge */}
        {product.inStock && product.stockCount && product.stockCount < 10 && (
          <span className="absolute bottom-1.5 left-1.5 bg-amber-500/95 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs border border-amber-300">
            🔥 Only {product.stockCount} Left!
          </span>
        )}
      </div>

      {/* Color Swatch Dots Preview */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex items-center gap-1.5 py-1">
          {product.colors.slice(0, 4).map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(c.name);
              }}
              className={`w-3.5 h-3.5 rounded-full border shadow-2xs shrink-0 cursor-pointer transition-transform ${
                selectedColor === c.name ? 'scale-125 border-amber-500 ring-1 ring-amber-400' : 'border-slate-300'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[10px] text-slate-400 font-bold">+{product.colors.length - 4}</span>
          )}
        </div>
      )}

      {/* Product Details */}
      <div className="space-y-1.5 text-left">
        
        {/* Star Rating Line */}
        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-slate-800 ml-0.5">{product.rating || 4.8}</span>
          <span className="text-slate-400 font-normal">({product.reviewsCount || 120})</span>
        </div>

        {/* Product Brand & Category */}
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
          <span>{product.brand}</span>
          <span>•</span>
          <span className="text-slate-500">{product.subcategory || product.category}</span>
        </div>

        {/* Product Name with Stable Baseline */}
        <h4 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors min-h-[2rem]">
          {product.name}
        </h4>

        {/* Interactive Size Selector Pills with Dynamic Price Bump */}
        {product.sizes && product.sizes.length > 0 && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 overflow-hidden text-[10px] text-slate-500 font-semibold flex-wrap pt-0.5"
          >
            <span className="text-slate-400 text-[10px] shrink-0">Size:</span>
            {product.sizes.slice(0, 4).map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold cursor-pointer transition-all border shrink-0 ${
                  selectedSize === s
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[9px] text-slate-400 font-bold">+{product.sizes.length - 4}</span>
            )}
          </div>
        )}

        {/* Price Row: Dynamic Price with Indian Rupees, MRP, Savings */}
        <div className="flex items-baseline gap-1 sm:gap-1.5 pt-1 flex-wrap">
          <span className="text-sm sm:text-lg font-black text-slate-950 whitespace-nowrap">
            {formatINR(currentPrice)}
          </span>
          {currentOriginalPrice > currentPrice && (
            <span className="text-[11px] sm:text-xs text-slate-400 line-through whitespace-nowrap">
              {formatINR(currentOriginalPrice)}
            </span>
          )}
          {savings > 0 && (
            <span className="text-[9px] sm:text-[10px] font-black text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 whitespace-nowrap">
              SAVE {formatINR(savings)}
            </span>
          )}
        </div>

        {/* 5-Day Return & COD Reassurance */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-slate-500 pt-0.5 flex-wrap gap-1">
          <span className="flex items-center gap-1 text-slate-600 whitespace-nowrap">
            <Banknote className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Cash on Delivery</span>
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-extrabold whitespace-nowrap">
            <RotateCcw className="w-3 h-3 text-amber-600 shrink-0" />
            <span>5-Day Return</span>
          </span>
        </div>
      </div>

      {/* Bottom Action: Radiant Glowing "Add to Cart" Button */}
      <div className="pt-2 sm:pt-3">
        {quantityInCart > 0 ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between bg-slate-900 text-amber-300 rounded-full p-0.5 sm:p-1 shadow-md shadow-slate-900/20 border border-slate-800"
          >
            <button
              onClick={() => onUpdateQuantity(product, quantityInCart - 1)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-[11px] sm:text-xs font-black px-1 text-center truncate min-w-0">
              {quantityInCart} in Bag
            </span>
            <button
              onClick={() => onUpdateQuantity(product, quantityInCart + 1)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        ) : !product.inStock ? (
          <button
            disabled
            className="w-full py-2 sm:py-2.5 px-2 rounded-full bg-slate-100 text-slate-400 text-[11px] sm:text-xs font-bold cursor-not-allowed text-center whitespace-nowrap"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, selectedSize, selectedColor, currentPrice);
            }}
            className="w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-amber-400/20 border border-amber-300 hover:scale-102 active:scale-98 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Add to Bag ({formatINR(currentPrice)})</span>
            <span className="sm:hidden text-[11px] font-black whitespace-nowrap">Add • {formatINR(currentPrice)}</span>
          </button>
        )}
      </div>

    </div>
  );
};
