import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Gift, 
  HelpCircle, 
  Heart, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  KeyRound, 
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  Wallet,
  Camera,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { UserProfile, Order } from '../types';
import { AbCoinLogo } from './AbCoinLogo';

interface DashboardViewProps {
  currentUser: UserProfile;
  wishlistCount: number;
  orders: Order[];
  onOpenTrackOrder: (order?: Order) => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenRefer: () => void;
  onOpenCatalogue: () => void;
  onViewInvoice: (order: Order) => void;
  onOpenAddresses: () => void;
  onOpenSupport: () => void;
  onRequestReturn?: (order: Order) => void;
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

  // Active delivery order (latest active order or demo order)
  const activeOrder = orders.find(
    (o) => o.orderStatus === 'placed' || o.orderStatus === 'confirmed' || o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery'
  ) || orders[0];

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) + (currentUser.totalSpent || 0);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* 1. Fashion Welcome Hero Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white shadow-xl space-y-4 relative overflow-hidden border border-amber-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-xs border border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome to your Fashion Hub</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              <span>Hello, {currentUser.name}!</span>
              <span>👋</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Track active deliveries in Jharkhand, manage saved addresses, and browse trending fashion, footwear &amp; accessories.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenCatalogue}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-400/20 transition-all active:scale-95 cursor-pointer"
              >
                <span>Explore Trending Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Membership</p>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">Apna Bazar Plus</h4>
            </div>
          </div>

          <div 
            onClick={onOpenWishlist}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 cursor-pointer hover:border-rose-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wishlist</p>
              <h4 className="text-sm sm:text-lg font-black text-slate-900">{wishlistCount} Saved</h4>
            </div>
          </div>

          <div 
            onClick={onOpenOrders}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 cursor-pointer hover:border-slate-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Orders</p>
              <h4 className="text-sm sm:text-lg font-black text-slate-900">{orders.length || 6}</h4>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <AbCoinLogo size="md" />
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                2 Coins = ₹1
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">AB Coin Wallet</p>
              <h4 className="text-sm sm:text-lg font-black text-amber-950">
                {(currentUser.walletBalance || 0).toLocaleString('en-IN')} Coins
              </h4>
            </div>
          </div>

        </div>

        {/* 2.5 AB Coin Official Wallet Section */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-5 sm:p-7 text-slate-950 shadow-lg border border-amber-300 relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <AbCoinLogo size="xl" />
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Apna Bazar Currency
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                  AB Coin Wallet
                </h3>
                <p className="text-xs font-bold text-slate-900/80">
                  Total Balance: <span className="font-mono text-base font-black text-slate-950">{currentUser.walletBalance || 0} AB Coins</span> (₹{Math.floor((currentUser.walletBalance || 0) / 2).toLocaleString('en-IN')} Shopping Value)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCatalogue}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Shop with AB Coins</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 sm:p-4 border border-amber-200 text-xs space-y-1.5 text-slate-800">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>How Apna Bazar (AB) Coins Work:</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              • <strong>2 AB Coins = ₹1 Indian Rupee</strong>. When you request a return, our admin quality team confirms the request and the entire item value is deposited directly into your AB Coin wallet.
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              • <strong>Instant Checkout Deduction</strong>: At checkout, you can select &quot;AB Coins&quot; to pay for orders with 0 cash required, or combine with Cash on Delivery (COD).
            </p>
            <p className="text-[10px] text-amber-900 font-bold">
              * Note: AB Coins are non-withdrawable store loyalty currency exclusively usable on Apna Bazar.
            </p>
          </div>

          {/* Wallet Transaction Ledger */}
          {currentUser.walletTransactions && currentUser.walletTransactions.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-black text-slate-950 block uppercase tracking-wider">Recent Wallet Activity:</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {currentUser.walletTransactions.map((tx) => (
                  <div key={tx.id} className="p-2.5 bg-white/90 rounded-xl flex items-center justify-between text-xs border border-amber-200">
                    <div>
                      <p className="font-bold text-slate-900">{tx.title}</p>
                      <p className="text-[10px] text-slate-500">{tx.date}</p>
                    </div>
                    <span className={`font-mono font-black ${tx.type === 'credit' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount} AB Coins
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2.8 Account Profile Details Card (Matching Screenshot 13) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                  alt={currentUser.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-amber-400 shadow-md"
                />
                <button
                  type="button"
                  title="Update Photo"
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md border border-white cursor-pointer hover:bg-slate-800"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-slate-950">{currentUser.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{currentUser.email || 'customer@apnabazar.in'}</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Account • Apna Bazar Gold Member</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAddresses}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center gap-1.5 border border-amber-300 self-start sm:self-auto cursor-pointer transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Manage Addresses</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Full Name</span>
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold truncate">
                {currentUser.name}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold font-mono truncate">
                {currentUser.phone || '+91 6207462800'}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>Email Address</span>
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold truncate">
                {currentUser.email || 'customer@apnabazar.in'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Active Order Card */}
        {activeOrder && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-black text-slate-900">
                    #{activeOrder.id}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  ₹{activeOrder.totalAmount?.toLocaleString('en-IN')} • 
                  <span className="ml-1 uppercase text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {activeOrder.orderStatus}
                  </span>
                </p>
              </div>

              <button
                onClick={() => onViewInvoice(activeOrder)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Invoice</span>
              </button>
            </div>

            {/* Delivery Details */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900">
                  {activeOrder.estimatedDeliveryDate || '15-Minute Express Delivery'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Deliver to: {activeOrder.address?.fullName}, {activeOrder.address?.streetAddress}, {activeOrder.address?.city}
                </p>
              </div>
            </div>

            {/* 6-Digit Delivery Confirmation OTP */}
            {activeOrder.otp && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-700" />
                    <span>6-Digit Delivery Confirmation OTP</span>
                  </span>
                  <button
                    onClick={() => handleCopyOtp(activeOrder.otp!)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedOtp ? <Check className="w-4 h-4 text-amber-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {activeOrder.otp.split('').map((digit, idx) => (
                    <span
                      key={idx}
                      className="w-9 h-11 bg-white border border-amber-300 rounded-xl font-mono text-lg font-black text-slate-950 flex items-center justify-center shadow-xs"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-amber-800">
                  Share this OTP with the delivery associate upon receiving your parcel to verify delivery.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onOpenTrackOrder(activeOrder)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-98 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Track Live Order &amp; Map</span>
              </button>

              <button
                onClick={onOpenOrders}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                All Orders
              </button>
            </div>

          </div>
        )}

        {/* 4. Quick Account Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={onOpenAddresses}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all text-left space-y-2 group cursor-pointer"
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
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Refer &amp; Earn</p>
              <p className="text-[10px] text-amber-700 font-bold">Earn ₹200 credits</p>
            </div>
          </button>

          <button
            onClick={onOpenSupport}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Help &amp; Returns</p>
              <p className="text-[10px] text-slate-400">24-hr resolution</p>
            </div>
          </button>

          <button
            onClick={onOpenCatalogue}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all text-left space-y-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Shop Catalog</p>
              <p className="text-[10px] text-slate-400">40+ trending styles</p>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};
