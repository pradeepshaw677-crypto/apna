import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  FileText, 
  RotateCcw, 
  Truck,
  Copy,
  Check,
  Search,
  Banknote,
  ArrowRight,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { Order, CartItem } from '../types';

interface OrdersViewProps {
  orders?: Order[];
  onOpenTrackOrder: (order?: Order) => void;
  onViewInvoice: (order: Order) => void;
  onReorder: (items: CartItem[]) => void;
  onBackToShop?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders = [],
  onOpenTrackOrder,
  onViewInvoice,
  onReorder,
  onBackToShop,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'returned' | 'cancelled'>('all');
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const displayOrders = useMemo(() => {
    if (orders.length === 0) return [];
    if (filter === 'all') return orders;
    if (filter === 'active') {
      return orders.filter(
        (o) => o.orderStatus === 'placed' || o.orderStatus === 'confirmed' || o.orderStatus === 'packing' || o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery'
      );
    }
    if (filter === 'returned') {
      return orders.filter(
        (o) => o.orderStatus === 'return_requested' || o.orderStatus === 'return_pickup_scheduled' || o.orderStatus === 'returned'
      );
    }
    return orders.filter((o) => o.orderStatus === filter);
  }, [orders, filter]);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-500" />
              <span>My Orders</span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                {orders.length}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live delivery status, 6-digit delivery OTPs, 5-day easy returns, and official tax invoices.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: '⚡ Active Delivery' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'returned', label: 'Returns & OTP' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {displayOrders.length > 0 ? (
          <div className="space-y-4">
            {displayOrders.map((order) => {
              const isActive = order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned';
              const isReturned = order.orderStatus === 'return_requested' || order.orderStatus === 'return_pickup_scheduled' || order.orderStatus === 'returned';
              const isDelivered = order.orderStatus === 'delivered';
              const isWithin5Days = Date.now() - (order.deliveredAt || order.createdAt) <= 5 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Bar of Order Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                        #{order.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isReturned
                            ? 'bg-purple-100 text-purple-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isDelivered ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isReturned ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : order.orderStatus === 'cancelled' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="capitalize">{order.orderStatus.replace(/_/g, ' ')}</span>
                      </span>

                      {/* 6-DIGIT DELIVERY OTP BADGE FOR ACTIVE ORDERS */}
                      {isActive && order.otp && (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-1">
                          <span className="text-[10px] font-black text-amber-900 uppercase">Delivery OTP:</span>
                          <span className="text-xs font-mono font-black text-slate-950 tracking-wider">{order.otp}</span>
                          <button
                            onClick={() => handleCopyOtp(order.otp!)}
                            className="text-amber-700 hover:text-amber-900 cursor-pointer ml-0.5"
                            title="Copy Delivery OTP"
                          >
                            {copiedOtp === order.otp ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* 6-DIGIT RETURN PICKUP OTP BADGE IF RETURN SCHEDULED */}
                      {isReturned && order.returnOtp && (
                        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-300 rounded-xl px-2.5 py-1">
                          <span className="text-[10px] font-black text-purple-900 uppercase">Return Pickup OTP:</span>
                          <span className="text-xs font-mono font-black text-purple-950 tracking-wider">{order.returnOtp}</span>
                          <button
                            onClick={() => handleCopyOtp(order.returnOtp!)}
                            className="text-purple-700 hover:text-purple-900 cursor-pointer ml-0.5"
                            title="Copy Return OTP"
                          >
                            {copiedOtp === order.returnOtp ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-14 h-14 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {it.product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Size: <span className="font-semibold text-slate-700">{it.selectedSize || 'Standard'}</span> {it.selectedColor ? `• Color: ${it.selectedColor}` : ''} • Qty: {it.quantity}
                          </p>
                          <p className="text-xs font-black text-slate-900 mt-0.5">
                            ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 5-Day Return Banner on Delivered orders */}
                  {isDelivered && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-900">
                        <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          {isWithin5Days
                            ? 'Delivered safely! 5-Day Hassle-Free Return & Exchange Window Active.'
                            : 'Order completed. 5-Day Return window has expired.'}
                        </span>
                      </div>
                      {isWithin5Days && (
                        <button
                          onClick={() => onOpenTrackOrder(order)}
                          className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 text-[11px] shrink-0 transition-colors cursor-pointer"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bottom Summary & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-semibold">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Mode: <strong>COD (Cash on Delivery)</strong></span>
                      </div>
                      <span>•</span>
                      <span>Total: <strong className="text-slate-900 font-black">₹{order.totalAmount.toLocaleString('en-IN')}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewInvoice(order)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tax Invoice</span>
                      </button>

                      {isActive ? (
                        <button
                          onClick={() => onOpenTrackOrder(order)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live &amp; OTP</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onReorder(order.items)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder Styles</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-black text-slate-800 text-base">No orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t placed any orders matching this filter yet. Explore our latest fashion drops, footwear, toys, and accessories!
            </p>
            {onBackToShop && (
              <button
                onClick={onBackToShop}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all cursor-pointer"
              >
                Explore Apna Bazar Trends
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
