import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck, 
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (product: CartItem['product'], newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  riderTip: number;
  onSetRiderTip: (tip: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalMRP = cartItems.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const itemTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const mrpDiscount = totalMRP - itemTotal;

  const FREE_DELIVERY_THRESHOLD = 499;
  const deliveryFee = itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : 49;
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - itemTotal);

  // Coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (itemTotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'fixed') {
        couponDiscount = appliedCoupon.discountValue;
      } else {
        couponDiscount = Math.min(400, Math.round((itemTotal * appliedCoupon.discountValue) / 100));
      }
    }
  }

  const finalTotal = Math.max(0, itemTotal + deliveryFee - couponDiscount);
  const totalSavings = mrpDiscount + couponDiscount;

  const handleApplyCouponCode = (code: string) => {
    setCouponError(null);
    const upper = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code.toUpperCase() === upper);

    if (!found) {
      setCouponError('Invalid coupon code. Try APNAFIRST or FASHION20');
      return;
    }

    if (itemTotal < found.minOrderValue) {
      setCouponError(`Min order value of ₹${found.minOrderValue} required for ${found.code}`);
      return;
    }

    onApplyCoupon(found);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-base sm:text-lg">Shopping Bag ({cartItems.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar (Flipkart Style) */}
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs">
            {remainingForFreeDelivery === 0 ? (
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>You unlocked <strong>FREE Delivery</strong> with Apna Bazar Plus!</span>
              </p>
            ) : (
              <div>
                <p className="text-amber-800 font-semibold mb-1">
                  Add items worth <strong>₹{remainingForFreeDelivery}</strong> more for Free Delivery
                </p>
                <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (itemTotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Your shopping bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Explore thousands of top styles in Fashion, Footwear, Toys & Accessories!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize || ''}`} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover object-top rounded-lg bg-slate-100 shrink-0 border border-slate-200"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-bold text-slate-500 uppercase">{item.product.brand}</p>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>

                      {/* Variant Badges */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                        {item.selectedSize && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-slate-500">{item.selectedColor}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Price Details (Flipkart / Myntra Style) */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              
              {/* Coupon Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. APNAFIRST)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 uppercase font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleApplyCouponCode(couponInput)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      &apos;{appliedCoupon.code}&apos; applied (-₹{couponDiscount})
                    </span>
                    <button
                      onClick={() => onApplyCoupon(null)}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span className="font-medium text-slate-800">₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Discount on MRP</span>
                  <span className="font-medium">-₹{mrpDiscount.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-slate-800">
                    {deliveryFee === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 text-center bg-emerald-50 py-1 rounded">
                  🎉 You are saving ₹{totalSavings.toLocaleString('en-IN')} on this order!
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Safe and Secure Payments • 100% Authentic Products</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
