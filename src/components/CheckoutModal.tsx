import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Truck,
  Phone,
  User,
  Home,
  Briefcase,
  AlertCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Coupon, DeliveryAddress, Order } from '../types';
import { api } from '../utils/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  savedAddress: DeliveryAddress;
  onSaveAddress: (address: DeliveryAddress) => void;
  onOrderPlaced: (order: Order) => void;
  userId?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  savedAddress,
  onSaveAddress,
  onOrderPlaced,
  userId,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>(savedAddress);
  const [paymentMethod] = useState<'cod'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalMRP = cartItems.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const itemTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = itemTotal >= 499 ? 0 : 49;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (itemTotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'fixed') {
        discountAmount = appliedCoupon.discountValue;
      } else {
        discountAmount = Math.min(400, Math.round((itemTotal * appliedCoupon.discountValue) / 100));
      }
    }
  }

  const finalTotal = Math.max(0, itemTotal + deliveryFee - discountAmount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!address.fullName || !address.phoneNumber || !address.streetAddress || !address.pincode) {
      setErrorMessage('Please fill in complete delivery address details.');
      return;
    }

    if (address.phoneNumber.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save current address to user profile
      onSaveAddress(address);

      const response = await api.createOrder({
        items: cartItems,
        address,
        paymentMethod,
        appliedCoupon,
        tipAmount: 0,
        userId,
      });

      if (response && response.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#0F172A', '#E2E8F0'],
        });

        onOrderPlaced(response.order);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-slate-950 shadow-inner">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Secure Cash on Delivery Checkout</h2>
              <p className="text-[11px] font-semibold text-slate-900/80">Pay at Doorstep • 6-Digit Verified Delivery OTP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Step 1: Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Delivery Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="e.g. Bhabani Shit"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={address.phoneNumber}
                  onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Street Address / House No / Flat *</label>
                <input
                  type="text"
                  required
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  placeholder="e.g. Plot 42, Green Avenue, Main Road"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Area / Landmark</label>
                <input
                  type="text"
                  value={address.landmark || ''}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">6-Digit PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 832101"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Baharagora"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddress({ ...address, addressType: 'home' })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      address.addressType === 'home'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" /> Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddress({ ...address, addressType: 'work' })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      address.addressType === 'work'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Work
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method - Strictly COD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  2
                </span>
                <span>Payment Mode: Cash on Delivery (COD)</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Pay on Delivery Only
              </span>
            </div>

            <div className="p-4 rounded-xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      Cash on Delivery (COD)
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                        100% Safe
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Zero advance payment required. Pay via cash or UPI directly to the courier agent when your package is delivered.
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                  ✓
                </div>
              </div>

              {/* Verified Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>No Card / Bank Risk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Doorstep Inspection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>6-Digit Secure OTP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Pricing */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900 uppercase tracking-wider">Order Summary ({cartItems.length} items)</p>
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal</span>
              <span>₹{itemTotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Savings ({appliedCoupon?.code})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charges</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isSubmitting ? 'Securing Your Order...' : `Pay ₹${finalTotal.toLocaleString('en-IN')} & Place Order`}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              By placing your order, you agree to Apna Bazar&apos;s Terms of Service and Privacy Policy.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
