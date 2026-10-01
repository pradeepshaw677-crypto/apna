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
  Lock,
  RotateCcw,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Coupon, DeliveryAddress, Order } from '../types';
import { api } from '../utils/api';
import { getSizePriceDelta, formatINR } from '../utils/pricing';

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
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    setDetectingGps(true);
    setGpsSuccessMsg(null);
    if (!navigator.geolocation) {
      setDetectingGps(false);
      setAddress((prev) => ({
        ...prev,
        city: 'Baharagora',
        state: 'Jharkhand',
        pincode: '832101',
        streetAddress: prev.streetAddress || 'Main Chowk, Near Shitla Mandir',
      }));
      setGpsSuccessMsg('✓ Pre-filled Baharagora, Jharkhand Hub (832101)');
      setTimeout(() => setGpsSuccessMsg(null), 4000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setAddress((prev) => ({
          ...prev,
          city: 'Baharagora',
          state: 'Jharkhand',
          pincode: '832101',
          area: 'Dadu Complex / Main Chowk',
          streetAddress: prev.streetAddress || `GPS Auto-Filled (${latitude.toFixed(3)}, ${longitude.toFixed(3)}) - Near Baharagora Center`,
        }));
        setGpsSuccessMsg('✓ Current GPS Location Auto-Filled (Baharagora 832101)!');
        setTimeout(() => setGpsSuccessMsg(null), 4000);
      },
      () => {
        setDetectingGps(false);
        setAddress((prev) => ({
          ...prev,
          city: 'Baharagora',
          state: 'Jharkhand',
          pincode: '832101',
          streetAddress: prev.streetAddress || 'Dadu Complex, Near Shitla Mandir',
        }));
        setGpsSuccessMsg('✓ Set to Baharagora Central Hub (Jharkhand - 832101)');
        setTimeout(() => setGpsSuccessMsg(null), 4000);
      },
      { timeout: 7000 }
    );
  };

  if (!isOpen) return null;

  // Calculate dynamic size-adjusted total MRP and itemTotal
  const totalMRP = cartItems.reduce((sum, item) => {
    const sizeDelta = item.selectedSize ? getSizePriceDelta(item.selectedSize) : 0;
    const unitMrp = item.originalUnitPrice || (item.product.originalPrice + sizeDelta);
    return sum + unitMrp * item.quantity;
  }, 0);

  const itemTotal = cartItems.reduce((sum, item) => {
    const sizeDelta = item.selectedSize ? getSizePriceDelta(item.selectedSize) : 0;
    const unitPrice = item.unitPrice || (item.product.price + sizeDelta);
    return sum + unitPrice * item.quantity;
  }, 0);

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
          colors: ['#f59e0b', '#fb923c', '#e11d48', '#0f172a'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
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
              <p className="text-[11px] font-bold text-slate-900/80">Doorstep Delivery in Jharkhand • 6-Digit Delivery OTP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Step 1: Delivery Address */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                  1
                </span>
                <span>Delivery Address (Jharkhand)</span>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGps}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Navigation className={`w-3.5 h-3.5 text-amber-600 ${detectingGps ? 'animate-spin' : ''}`} />
                <span>{detectingGps ? 'Detecting GPS...' : '📍 Use Current Location (GPS)'}</span>
              </button>
            </div>

            {gpsSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gpsSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="Recipient's Name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={address.phoneNumber}
                    onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-Digit Mobile"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Flat / House No. / Building / Street *</label>
                <input
                  type="text"
                  required
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  placeholder="e.g. Dadu Complex, Near Shitla Mandir"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Area / Colony / Street *</label>
                <input
                  type="text"
                  required
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  placeholder="e.g. Main Chowk"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={address.landmark || ''}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="e.g. Opposite State Bank"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">6-Digit Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 832101"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Baharagora"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Address Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddress({ ...address, addressType: 'home' })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
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

          {/* Step 2: Payment Method - Cash on Delivery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                  2
                </span>
                <span>Payment Mode: Cash on Delivery (COD)</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                Pay on Delivery Only
              </span>
            </div>

            <div className="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                    <Banknote className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      Cash on Delivery (COD)
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
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
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>No Advance Bank Risk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>5-Day Easy Returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>6-Digit Secure OTP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900 uppercase tracking-wider">Order Summary ({cartItems.length} items)</p>
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal</span>
              <span>{formatINR(itemTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Coupon Savings ({appliedCoupon?.code})</span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Doorstep Delivery Charges</span>
              <span>{deliveryFee === 0 ? <strong className="text-amber-700 uppercase">FREE</strong> : formatINR(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable at Doorstep</span>
              <span>{formatINR(finalTotal)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isSubmitting ? 'Securing Your Order...' : `Confirm Order with COD (${formatINR(finalTotal)})`}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              By placing your order, you agree to Apna Bazar&apos;s Terms of Service and 5-Day Return Policy.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
