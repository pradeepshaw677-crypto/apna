import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle,
  Truck,
  Sparkles,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { CartItem, Coupon, DeliveryAddress, Order } from '../types';
import { formatINR, getSizePriceDelta } from '../utils/pricing';
import { api } from '../utils/api';
import { AbCoinLogo } from './AbCoinLogo';
import confetti from 'canvas-confetti';

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
  walletBalance = 0, // Welcome / default AB coins set to 0
  onDeductWalletCoins,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>(savedAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(!savedAddress.fullName || !savedAddress.streetAddress);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'ab_coins'>('cod');
  const [useAbCoins, setUseAbCoins] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  // Sync savedAddress changes
  useEffect(() => {
    if (savedAddress && savedAddress.streetAddress) {
      setAddress(savedAddress);
      if (savedAddress.fullName && savedAddress.streetAddress) {
        setIsEditingAddress(false);
      }
    }
  }, [savedAddress]);

  // Fast multi-tier GPS / IP Geolocation detection
  const handleUseCurrentLocation = async () => {
    setDetectingGps(true);
    setGpsSuccessMsg(null);

    const applyAddress = (street: string, city: string, state: string, pincode: string) => {
      setAddress((prev) => ({
        ...prev,
        streetAddress: street,
        city: city || 'Baharagora',
        state: state || 'Jharkhand',
        pincode: pincode || '832101',
        area: 'Baharagora Service Zone',
      }));
      setGpsSuccessMsg(`✓ Address Auto-Filled: ${street.slice(0, 30)}... (${pincode})`);
      setIsEditingAddress(true);
      setDetectingGps(false);
      setTimeout(() => setGpsSuccessMsg(null), 5000);
    };

    // Tier 1: Fast Browser GPS
    if (navigator.geolocation) {
      try {
        const coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err),
            { timeout: 3500, enableHighAccuracy: false, maximumAge: 60000 }
          );
        });

        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const road = addr.road || addr.street || addr.neighbourhood || addr.suburb || 'Main Market Road';
              const locality = addr.suburb || addr.village || addr.town || 'Baharagora';
              const city = addr.city || addr.town || addr.village || 'Baharagora';
              const state = addr.state || 'Jharkhand';
              const pin = addr.postcode || '832101';
              applyAddress(`${road}, ${locality}`, city, state, pin);
              return;
            }
          }
        } catch {}

        applyAddress(`GPS Location (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`, 'Baharagora', 'Jharkhand', '832101');
        return;
      } catch {}
    }

    // Tier 2: Real-time IP Geolocation
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          applyAddress(`${ipData.city || 'Main Road'}, ${ipData.region || 'Jharkhand'}`, ipData.city || 'Baharagora', ipData.region || 'Jharkhand', ipData.postal || '832101');
          return;
        }
      }
    } catch {}

    // Fallback: Baharagora Central Hub
    applyAddress('Dadu Complex, Near Shitla Mandir', 'Baharagora', 'Jharkhand', '832101');
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

  // User Explicit Rule: "2 AB Coin = 1 RS"
  const COIN_CONVERSION_RATE = 2; // 2 Coins = ₹1
  const walletRupeesValue = Math.floor(walletBalance / COIN_CONVERSION_RATE);

  const isUsingCoins = useAbCoins || selectedPaymentMethod === 'ab_coins';
  const coinsDiscountInRs = isUsingCoins
    ? Math.min(walletRupeesValue, subtotalAfterCoupon)
    : 0;

  const coinsToDeduct = coinsDiscountInRs * COIN_CONVERSION_RATE;
  const finalTotal = Math.max(0, subtotalAfterCoupon - coinsDiscountInRs);

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

      if (coinsToDeduct > 0 && onDeductWalletCoins) {
        onDeductWalletCoins(coinsToDeduct);
      }

      const response = await api.createOrder({
        items: cartItems,
        address,
        paymentMethod: finalTotal === 0 ? 'ab_coins' : selectedPaymentMethod,
        appliedCoupon,
        tipAmount: 0,
        userId,
        abCoinsUsed: isUsingCoins ? coinsToDeduct : 0,
        coinsDiscount: isUsingCoins ? coinsDiscountInRs : 0,
      });

      if (response && response.order) {
        const orderWithCoins: Order = {
          ...response.order,
          abCoinsUsed: coinsToDeduct,
          coinsDiscount: coinsDiscountInRs,
          totalAmount: finalTotal,
          estimatedDeliveryDate: '⚡ 3-Day Express Doorstep Delivery',
        };

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fb923c', '#e11d48', '#0f172a'],
          });
        } catch {}

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
        className="bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col mx-auto"
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
              <p className="text-[11px] font-bold text-slate-900/80">⚡ 3-Day Doorstep Delivery • 100% COD &amp; AB Coins (2 Coins = ₹1)</p>
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
                <span>{detectingGps ? 'Detecting...' : '📍 Auto-Detect GPS & Address'}</span>
              </button>
            </div>

            {gpsSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gpsSuccessMsg}</span>
              </div>
            )}

            {isEditingAddress ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={address.phoneNumber}
                        onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs p-2.5 pl-11 rounded-xl border border-slate-300 bg-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Flat / House No. &amp; Building / Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Royal Residency, Near Main Market"
                    value={address.streetAddress}
                    onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nearby Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Shitla Mandir"
                      value={address.landmark || ''}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      placeholder="Baharagora"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pincode (6 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="832101"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-amber-500 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (address.fullName && address.phoneNumber && address.streetAddress && address.pincode) {
                        setIsEditingAddress(false);
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Done Editing Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900">{address.fullName}</span>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      +91 {address.phoneNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    {address.streetAddress}{address.landmark ? `, Near ${address.landmark}` : ''}, {address.city}, {address.state} - <strong className="font-mono text-slate-900">{address.pincode}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-black text-amber-800 hover:underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Payment Mode with AB Coins (2 AB Coins = ₹1) */}
          <div className="space-y-3">
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

            {/* AB Coins Redeem Card with Conversion Notice (2 AB Coins = ₹1) */}
            <div 
              onClick={() => {
                setUseAbCoins(!useAbCoins);
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                useAbCoins
                  ? 'border-amber-500 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AbCoinLogo size="lg" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-950 text-xs sm:text-sm">Pay / Redeem AB Coins</h4>
                      <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full">
                        {walletBalance} Coins (₹{walletRupeesValue} Value)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950 font-bold mt-1">
                      ⚡ Rate: <strong>2 AB Coins = ₹1</strong>
                    </p>
                    {useAbCoins ? (
                      <p className="text-xs text-emerald-800 font-bold mt-1">
                        ✓ Redeeming {coinsToDeduct} Coins → ₹{coinsDiscountInRs} Discount Applied!
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">
                        Click to apply {Math.min(walletBalance, subtotalAfterCoupon * 2)} AB Coins and save ₹{Math.min(walletRupeesValue, subtotalAfterCoupon)}.
                      </p>
                    )}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={useAbCoins}
                  onChange={(e) => setUseAbCoins(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* 100% AB Coins Full Payment Card (if sufficient coins) */}
            {walletRupeesValue >= subtotalAfterCoupon && (
              <div 
                onClick={() => {
                  setSelectedPaymentMethod('ab_coins');
                  setUseAbCoins(true);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  selectedPaymentMethod === 'ab_coins'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950 text-sm flex items-center gap-1.5">
                        <span>100% AB Coins Payment</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-1.5 py-0.5 rounded">
                          Zero Cash Needed
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Your entire order of {formatINR(subtotalAfterCoupon)} will be paid using {subtotalAfterCoupon * 2} AB Coins (2 Coins = ₹1). Pay ₹0 at delivery!
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    selectedPaymentMethod === 'ab_coins' ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'ab_coins' && '✓'}
                  </div>
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
                      <span>Cash on Delivery (COD)</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
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
                  <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>3-Day Express Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Order Price Summary */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <span className="font-black text-slate-900 block mb-2 uppercase tracking-wider text-[11px]">
              Payment Summary ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items)
            </span>

            <div className="flex justify-between text-slate-600">
              <span>Total MRP:</span>
              <span className="line-through">{formatINR(totalMRP)}</span>
            </div>

            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Items Subtotal:</span>
              <span>{formatINR(itemTotal)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Doorstep Delivery:</span>
              <span>{deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount ({appliedCoupon?.code}):</span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}

            {coinsDiscountInRs > 0 && (
              <div className="flex justify-between text-amber-800 font-bold bg-amber-100/60 p-1.5 rounded-lg border border-amber-200">
                <span>AB Coins Redeemed ({coinsToDeduct} Coins @ 2 Coins = ₹1):</span>
                <span>-{formatINR(coinsDiscountInRs)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-slate-950">
              <span>Final Amount to Pay:</span>
              <span className="text-base text-amber-800">{formatINR(finalTotal)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Placing Your Order...</span>
            ) : finalTotal === 0 ? (
              <span>Place Order with AB Coins (₹0 Cash) →</span>
            ) : (
              <span>Confirm Order with 100% COD ({formatINR(finalTotal)}) →</span>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            🔒 Safe &amp; Encrypted • Dispatched within 24 hours with SMS/WhatsApp updates
          </p>
        </form>
      </div>
    </div>
  );
};
