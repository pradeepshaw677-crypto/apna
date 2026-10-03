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
import { LocationPermissionModal } from './LocationPermissionModal';
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
  // User explicit instruction: "tum koi default me tick mat lagana user khud choose karega"
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'ab_coins' | null>(null);
  const [useAbCoins, setUseAbCoins] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
    setErrorMessage(null);

    const applyAddress = (street: string, city: string, state: string, pincode: string, landmark: string, fullFormatted?: string) => {
      setAddress((prev) => ({
        ...prev,
        streetAddress: street || 'Live GPS Location Point',
        landmark: landmark || '',
        area: `${city || ''}, ${state || ''}`,
        city: city || 'Local Area',
        state: state || 'India',
        pincode: pincode || '832101',
      }));
      setGpsSuccessMsg(`✓ Live Address Detected: ${street || city} (${pincode})`);
      setIsEditingAddress(true);
      setDetectingGps(false);
      setTimeout(() => setGpsSuccessMsg(null), 5000);
    };

    // Helper for fast browser geolocation
    const getGPS = (highAccuracy: boolean, timeoutMs: number): Promise<{ latitude: number; longitude: number }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation unsupported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: 30000 }
        );
      });
    };

    // Tier 1: Real Device Browser GPS
    if (navigator.geolocation) {
      try {
        let coords: { latitude: number; longitude: number };
        try {
          coords = await getGPS(true, 7000);
        } catch {
          // Fast fallback to network/cell tower triangulation
          coords = await getGPS(false, 5000);
        }

        // Live Server-side reverse geocode
        try {
          const res = await api.reverseGeocode(coords.latitude, coords.longitude);
          if (res && res.fullFormatted) {
            applyAddress(
              `${res.plusCode || ''}, ${res.road || ''}, ${res.locality || ''}`.replace(/^, |, $/g, ''),
              res.city,
              res.state,
              res.pincode,
              res.landmark,
              res.fullFormatted
            );
            return;
          }
        } catch (e) {
          console.error('Reverse geocode error in checkout:', e);
        }

        applyAddress(`GPS Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`, 'Local City', 'Jharkhand', '832101', '');
        return;
      } catch (err: any) {
        if (err?.code === 1) {
          setErrorMessage('⚠️ Location permission was denied in your browser. Please allow location in browser settings or type address manually.');
          setDetectingGps(false);
          return;
        }
      }
    }

    // Tier 2: Real-time GeoIP Lookup
    try {
      const geoIpData = await api.getGeoIP();
      if (geoIpData && geoIpData.lat && geoIpData.lon) {
        try {
          const res = await api.reverseGeocode(geoIpData.lat, geoIpData.lon);
          if (res && res.fullFormatted) {
            applyAddress(
              `${res.plusCode || ''}, ${res.road || ''}, ${res.locality || ''}`.replace(/^, |, $/g, ''),
              res.city || geoIpData.city,
              res.state || geoIpData.state,
              res.pincode || geoIpData.pincode,
              res.landmark,
              res.fullFormatted
            );
            return;
          }
        } catch {}
        applyAddress('Live Area', geoIpData.city || 'Local Area', geoIpData.state || 'India', geoIpData.pincode || '832101', '');
        return;
      }
    } catch {}

    setErrorMessage('Could not auto-detect location. Please enter your address details below.');
    setDetectingGps(false);
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={detectingGps}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{detectingGps ? 'Detecting...' : 'Auto-Detect GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>🗺️ Drop Pin on Map</span>
                </button>
              </div>
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

            {/* User explicit instruction: "and check out me ab coin ya to cod agar ab coin hai to ab se karaga agar cod to cod and tum koi default me tick mat lagana user khud choose karega" */}
            <div className="space-y-3">
              {/* Option 1: Cash on Delivery (COD) Card */}
              <div 
                onClick={() => {
                  setSelectedPaymentMethod('cod');
                  setUseAbCoins(false);
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                  selectedPaymentMethod === 'cod'
                    ? 'border-amber-500 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-colors ${
                      selectedPaymentMethod === 'cod' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Banknote className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>Cash on Delivery (COD)</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                          Doorstep Cash / UPI
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Pay {formatINR(subtotalAfterCoupon)} via Cash or QR code directly to rider at doorstep delivery. Zero advance risk!
                      </p>
                    </div>
                  </div>

                  {/* Radio Selection: Empty circle by default; Tick only when user chooses! */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                    selectedPaymentMethod === 'cod' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm border-2 border-amber-600' 
                      : 'border-2 border-slate-300 bg-slate-50'
                  }`}>
                    {selectedPaymentMethod === 'cod' ? '✓' : ''}
                  </div>
                </div>

                {/* Verified COD Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>No Advance Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>5-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>3-Day Express</span>
                  </div>
                </div>
              </div>

              {/* Option 2: Apna Bazar (AB) Coins Card */}
              <div 
                onClick={() => {
                  if (walletBalance <= 0) {
                    setErrorMessage('Aapke wallet me 0 AB Coins hain. Please Cash on Delivery (COD) select karein ya order returns se coins earn karein.');
                    return;
                  }
                  setSelectedPaymentMethod('ab_coins');
                  setUseAbCoins(true);
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                  selectedPaymentMethod === 'ab_coins'
                    ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 shadow-md ring-2 ring-emerald-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AbCoinLogo size="lg" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-950 text-xs sm:text-sm">Pay with AB Coins</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          walletBalance > 0 ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-500'
                        }`}>
                          Available: {walletBalance} Coins (₹{walletRupeesValue} Value)
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-950 font-bold mt-1">
                        ⚡ Rate: <strong>2 AB Coins = ₹1</strong>
                      </p>
                      {walletBalance <= 0 ? (
                        <p className="text-xs text-slate-500 mt-1">
                          Wallet balance: 0 AB Coins. Select Cash on Delivery (COD) to place this order.
                        </p>
                      ) : selectedPaymentMethod === 'ab_coins' ? (
                        <p className="text-xs text-emerald-800 font-bold mt-1">
                          ✓ Selected: {coinsToDeduct} Coins will be deducted ({formatINR(coinsDiscountInRs)} shopping value applied).
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">
                          Click to select AB Coins and pay {Math.min(walletBalance, subtotalAfterCoupon * 2)} Coins.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Radio Selection: Empty circle by default; Tick only when user chooses! */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                    selectedPaymentMethod === 'ab_coins' 
                      ? 'bg-emerald-600 text-white shadow-sm border-2 border-emerald-700' 
                      : 'border-2 border-slate-300 bg-slate-50'
                  }`}>
                    {selectedPaymentMethod === 'ab_coins' ? '✓' : ''}
                  </div>
                </div>
              </div>

              {/* Notice if no option selected yet */}
              {!selectedPaymentMethod && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2 animate-pulse">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Kripya upar diye gaye options me se <strong>Cash on Delivery (COD)</strong> ya <strong>AB Coins</strong> par click karein.</span>
                </div>
              )}
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

            {coinsDiscountInRs > 0 && selectedPaymentMethod === 'ab_coins' && (
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
            disabled={isSubmitting || !selectedPaymentMethod}
            className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              !selectedPaymentMethod
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 shadow-amber-400/25 active:scale-98 cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <span>Placing Your Order...</span>
            ) : !selectedPaymentMethod ? (
              <span>👆 Choose COD or AB Coins Above →</span>
            ) : selectedPaymentMethod === 'ab_coins' ? (
              <span>Place Order with AB Coins ({coinsToDeduct} Coins) →</span>
            ) : (
              <span>Confirm Order with 100% COD ({formatINR(finalTotal)}) →</span>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            🔒 Safe &amp; Encrypted • Dispatched within 24 hours with SMS/WhatsApp updates
          </p>
        </form>

        <LocationPermissionModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          currentPincode={address.pincode}
          onConfirmPincode={(pin, fullAddress, isJharkhand) => {
            setIsMapModalOpen(false);
            setAddress(prev => ({
              ...prev,
              streetAddress: fullAddress,
              pincode: pin,
            }));
            setGpsSuccessMsg(`✓ Google Map Delivery Point Confirmed!`);
            setIsEditingAddress(true);
            setTimeout(() => setGpsSuccessMsg(null), 5000);
          }}
        />
      </div>
    </div>
  );
};
