import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Banknote, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  Truck, 
  AlertCircle,
  Clock,
  Sparkles,
  Edit2,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Coupon, DeliveryAddress, Order } from '../types';
import { api } from '../utils/api';
import { getSizePriceDelta, formatINR } from '../utils/pricing';
import { AbCoinLogo } from './AbCoinLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  savedAddress: DeliveryAddress;
  onSaveAddress: (address: DeliveryAddress) => void;
  onOrderPlaced: (order: Order) => void;
  userId?: string;
  walletBalance?: number;
  onDeductWalletCoins?: (coins: number) => void;
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
  walletBalance = 0,
  onDeductWalletCoins,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>(savedAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(!savedAddress.fullName || !savedAddress.streetAddress);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'ab_coins'>(walletBalance >= 100 ? 'ab_coins' : 'cod');
  const [useAbCoins, setUseAbCoins] = useState(walletBalance > 0);
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

  const subtotalAfterCoupon = Math.max(0, itemTotal + deliveryFee - discountAmount);

  // AB Coins Calculation
  const coinsApplicable = (useAbCoins || selectedPaymentMethod === 'ab_coins')
    ? Math.min(walletBalance, subtotalAfterCoupon)
    : 0;

  const finalTotal = Math.max(0, subtotalAfterCoupon - coinsApplicable);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!address.fullName || !address.phoneNumber || !address.streetAddress || !address.pincode) {
      setErrorMessage('Please fill in complete delivery address details.');
      setIsEditingAddress(true);
      return;
    }

    if (address.phoneNumber.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile phone number.');
      setIsEditingAddress(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Save current address to user profile
      onSaveAddress(address);

      if (coinsApplicable > 0 && onDeductWalletCoins) {
        onDeductWalletCoins(coinsApplicable);
      }

      const response = await api.createOrder({
        items: cartItems,
        address,
        paymentMethod: finalTotal === 0 ? 'ab_coins' : selectedPaymentMethod,
        appliedCoupon,
        tipAmount: 0,
        userId,
      });

      if (response && response.order) {
        const orderWithCoins: Order = {
          ...response.order,
          abCoinsUsed: coinsApplicable,
          totalAmount: finalTotal,
          estimatedDeliveryDate: '⚡ 3-Day Express Doorstep Delivery',
        };

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fb923c', '#e11d48', '#0f172a'],
        });

        onOrderPlaced(orderWithCoins);
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
        className="bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-slate-950 shadow-inner">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Checkout: Apna Bazar Superstore</h2>
              <p className="text-[11px] font-bold text-slate-900/80">⚡ 3-Day Doorstep Express Delivery • 100% Cash on Delivery &amp; AB Coins</p>
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
                <span>Delivery Address (India Doorstep)</span>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGps}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{detectingGps ? 'Detecting...' : '📍 Use Current GPS Location'}</span>
              </button>
            </div>

            {gpsSuccessMsg && (
              <p className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{gpsSuccessMsg}</span>
              </p>
            )}

            {/* Saved Address One-Tap View */}
            {!isEditingAddress && address.fullName && address.streetAddress ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-400 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      ✓ Saved Delivery Address
                    </span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm">{address.fullName}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {address.streetAddress} {address.landmark ? `(Near ${address.landmark})` : ''}
                  </p>
                  <p className="text-xs text-slate-600">
                    {address.city}, {address.state || 'Jharkhand'} - {address.pincode}
                  </p>
                  <p className="text-xs font-bold text-slate-900 pt-0.5">
                    Phone: {address.phoneNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            ) : (
              /* Address Edit Form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Receiver&apos;s Full Name *</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number (For Delivery OTP) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={address.phoneNumber}
                    onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">House / Flat / Street / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={address.streetAddress}
                    onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                    placeholder="e.g. Dadu Complex, Near Shitla Mandir, Main Road"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono font-bold focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Express Delivery Badge */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span className="font-bold">⚡ Fast 3-Day Express Doorstep Delivery</span>
              </div>
              <span className="text-[10px] text-amber-300 font-extrabold bg-white/10 px-2 py-0.5 rounded-full">
                Guaranteed
              </span>
            </div>
          </div>

          {/* Step 2: Payment Mode - COD & AB Coins */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                  2
                </span>
                <span>Select Payment Mode</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                100% Buyer Protection
              </span>
            </div>

            {/* AB Coins Option Card */}
            {walletBalance > 0 && (
              <div 
                onClick={() => setUseAbCoins(!useAbCoins)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  useAbCoins
                    ? 'border-amber-500 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AbCoinLogo size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-950 text-xs sm:text-sm">Pay with AB Coins</h4>
                        <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.5 rounded">
                          {walletBalance} Coins Available
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Apply {coinsApplicable} AB Coins to save ₹{coinsApplicable} on this order.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={useAbCoins}
                    onChange={(e) => setUseAbCoins(e.target.checked)}
                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Cash on Delivery (COD) Card */}
            <div 
              onClick={() => setSelectedPaymentMethod('cod')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                selectedPaymentMethod === 'cod'
                  ? 'border-amber-500 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
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
                      {finalTotal === 0
                        ? 'Your order is 100% covered by AB Coins! ₹0 cash needed.'
                        : `Pay ${formatINR(finalTotal)} via cash or UPI directly when your package is delivered.`}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  selectedPaymentMethod === 'cod' ? 'bg-amber-500 text-slate-950' : 'border border-slate-300'
                }`}>
                  {selectedPaymentMethod === 'cod' && '✓'}
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
            {coinsApplicable > 0 && (
              <div className="flex justify-between text-amber-800 font-black items-center">
                <span className="flex items-center gap-1">
                  <AbCoinLogo size="xs" />
                  <span>AB Coins Redeemed ({coinsApplicable} Coins)</span>
                </span>
                <span>-{formatINR(coinsApplicable)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>3-Day Express Delivery Charges</span>
              <span>{deliveryFee === 0 ? <strong className="text-amber-700 uppercase">FREE</strong> : formatINR(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable at Doorstep</span>
              <span className={finalTotal === 0 ? 'text-emerald-700' : 'text-slate-950'}>
                {finalTotal === 0 ? '₹0 (Paid with AB Coins)' : formatINR(finalTotal)}
              </span>
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
              <span>
                {isSubmitting
                  ? 'Securing Your Order...'
                  : finalTotal === 0
                  ? 'Confirm Order with AB Coins (₹0 Cash)'
                  : `Confirm Order (${formatINR(finalTotal)})`}
              </span>
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
