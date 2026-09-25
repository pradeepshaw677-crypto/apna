import React, { useState } from 'react';
import { 
  Heart, 
  Package, 
  Wallet, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  Gift, 
  Copy, 
  Check,
  Clock,
  Sparkles,
  Phone,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Order } from '../types';

interface DashboardViewProps {
  currentUser: UserProfile;
  wishlistCount: number;
  orders: Order[];
  onOpenTrackOrder: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenRefer: () => void;
  onOpenCatalogue: () => void;
  onViewInvoice: (order: Order) => void;
  onOpenAddresses: () => void;
  onOpenSupport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  wishlistCount,
  orders,
  onOpenTrackOrder,
  onOpenWishlist,
  onOpenOrders,
  onOpenRefer,
  onOpenCatalogue,
  onViewInvoice,
  onOpenAddresses,
  onOpenSupport,
}) => {
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Active delivery order (latest active order or grocery demo order from screenshot)
  const activeOrder: Order = orders.find(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled') || orders[0] || {
    id: 'ORD-9721',
    createdAt: Date.now() - 40 * 60 * 1000,
    items: [
      {
        product: {
          id: 'prod-funfoods-pizza-topping',
          name: "Dr. Oetker Funfoods Pizza Topping All in One",
          brand: "Dr. Oetker",
          category: "snacks",
          price: 45,
          originalPrice: 50,
          discountPercent: 10,
          image: "https://images.unsplash.com/photo-1572448862527-d3c904757de6?auto=format&fit=crop&w=600&q=80",
          unit: "200g Pouch",
          rating: 4.8,
          reviewsCount: 94,
          inStock: true,
          description: "Rich Italian tomato puree blended with Mediterranean herbs.",
        },
        quantity: 1,
      },
      {
        product: {
          id: 'prod-clean-and-clear',
          name: "Clean & Clear Foaming Face Wash",
          brand: "Clean & Clear",
          category: "personal-care",
          price: 285,
          originalPrice: 310,
          discountPercent: 8,
          image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
          unit: "100ml Bottle",
          rating: 4.9,
          reviewsCount: 165,
          inStock: true,
          description: "Oil-free facial cleanser.",
        },
        quantity: 1,
      },
    ],
    itemTotal: 2203,
    deliveryFee: 0,
    packagingFee: 0,
    discount: 200,
    tipAmount: 0,
    totalAmount: 2203,
    address: {
      fullName: currentUser.name,
      phoneNumber: currentUser.phone,
      streetAddress: "Dadu Complex, Near Shitla Mandir",
      landmark: "Main Market",
      area: "Main Road",
      city: "Baharagora",
      state: "Jharkhand",
      pincode: "832101",
      addressType: "home",
      isDefault: true,
    },
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "shipped",
    estimatedDeliveryDate: "Next Morning Delivery (9 AM - 12 PM)",
    appliedCoupon: "GROCERY200",
    otp: "577448",
    cancellationAllowed: true,
  };

  const totalSpent = orders.reduce((acc, o) => acc + o.totalAmount, 0) || 2203;

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* 1. Green Welcome Hero Card matching screenshot `thegroceryhub.in/dash`:
            - Deep green gradient
            - "⭐ Welcome to your Account"
            - "Hello, Ttt! 👋"
            - "Track active deliveries, manage your saved addresses, and browse your favorite groceries."
            - Yellow button: "Start Shopping →" */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-950 text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="space-y-2 relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome to your Account</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              <span>Hello, {currentUser.name}!</span>
              <span>👋</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Track active deliveries, manage your saved addresses, and browse your favorite groceries.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenCatalogue}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Three Stat Cards matching screenshot:
            Wishlist Items: 0 Saved
            Total Orders: 6
            Total Spent: ₹2203 */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          
          <div 
            onClick={onOpenWishlist}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-rose-300 transition-all cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wishlist Items</p>
              <h4 className="text-sm sm:text-lg font-black text-slate-900">{wishlistCount} Saved</h4>
            </div>
          </div>

          <div 
            onClick={onOpenOrders}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 transition-all cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Orders</p>
              <h4 className="text-sm sm:text-lg font-black text-slate-900">{orders.length || 6}</h4>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Spent</p>
              <h4 className="text-sm sm:text-lg font-black text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</h4>
            </div>
          </div>

        </div>

        {/* 3. Active Order Card matching screenshot `#ORD-9721`:
            - Header: #ORD-9721, Aug 29, 10:47 PM, ₹2203.00, PROCESSING
            - Items: Dr. Oetker Funfoods Pizza Topping... "25 Items • Payment Verified"
            - Slot: 🌙 NEXT MORNING DELIVERY (9 AM - 12 PM)
            - DELIVERY OTP: 5 7 7 4 4 8 (Share this OTP only after receiving your order)
            - Buttons: Track Live Delivery (Yellow) | Cancel Order (Pink) | View Invoice (Text) */}
        {activeOrder && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono font-black text-slate-900 text-sm">#{activeOrder.id}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Aug 29, 10:47 PM</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  ₹{activeOrder.totalAmount}.00
                </span>
                <span className="block text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                  PROCESSING
                </span>
              </div>
            </div>

            {/* Items Summary with Thumbnail */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={activeOrder.items[0]?.product.image || "https://images.unsplash.com/photo-1572448862527-d3c904757de6?auto=format&fit=crop&w=120&q=80"}
                alt="Order item"
                className="w-12 h-12 rounded-xl object-contain bg-white shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">
                  {activeOrder.items[0]?.product.name || "Dr. Oetker Funfoods Pizza Topping..."}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {activeOrder.items.length > 1 ? `${activeOrder.items.length} Items` : "1 Item"} • Payment Verified (COD)
                </p>
              </div>
            </div>

            {/* Delivery Slot Pill matching screenshot: 🌙 NEXT MORNING DELIVERY (9 AM - 12 PM) */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs font-bold text-indigo-900 flex items-center gap-2">
              <span>🌙</span>
              <span>NEXT MORNING DELIVERY (9 AM - 12 PM)</span>
            </div>

            {/* Delivery OTP Box matching screenshot:
                DELIVERY OTP
                5 7 7 4 4 8
                Share this OTP only after receiving your order. */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-1 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                🔒 DELIVERY OTP
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black tracking-widest text-slate-950">
                  {activeOrder.otp || "577448"}
                </span>
                <button
                  onClick={() => handleCopyOtp(activeOrder.otp || "577448")}
                  className="p-1 rounded text-amber-800 hover:bg-amber-100 cursor-pointer"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Share this OTP only after receiving your order.
              </p>
            </div>

            {/* Action Buttons matching screenshot:
                - Track Live Delivery (Yellow pill button)
                - Cancel Order 04:43 (Pink pill button)
                - View Invoice */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenTrackOrder}
                  className="py-2.5 px-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Track Live Delivery</span>
                </button>

                <button
                  onClick={() => alert("Cancellation window active. Your order #ORD-9721 has been marked for review.")}
                  className="py-2.5 px-4 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Cancel Order</span>
                  <span className="font-mono bg-white/70 px-1 py-0.2 rounded text-[10px]">04:43</span>
                </button>
              </div>

              <button
                onClick={() => onViewInvoice(activeOrder)}
                className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                View Invoice
              </button>
            </div>

          </div>
        )}

        {/* 4. Quick Account Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={onOpenAddresses}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Saved Addresses</p>
              <p className="text-[10px] text-slate-400">Configure drop-off</p>
            </div>
          </button>

          <button
            onClick={onOpenRefer}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Refer &amp; Earn</p>
              <p className="text-[10px] text-emerald-600 font-bold">Earn ₹200 credits</p>
            </div>
          </button>

          <button
            onClick={onOpenSupport}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Lodge Complaint</p>
              <p className="text-[10px] text-slate-400">24-hr resolution</p>
            </div>
          </button>

          <button
            onClick={onOpenCatalogue}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Shop Catalog</p>
              <p className="text-[10px] text-slate-400">700+ fresh items</p>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
