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
  ArrowRight
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
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const displayOrders = useMemo(() => {
    if (orders.length === 0) return [];
    if (filter === 'all') return orders;
    if (filter === 'active') {
      return orders.filter(
        (o) => o.orderStatus === 'confirmed' || o.orderStatus === 'packing' || o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery'
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
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {orders.length}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Check delivery status, download GST tax invoices, and reorder favourite styles.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'Active Delivery' },
              { id: 'delivered', label: 'Delivered' },
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
              const isActive = order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';

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

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.orderStatus === 'delivered' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : order.orderStatus === 'cancelled' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="capitalize">{order.orderStatus.replace(/_/g, ' ')}</span>
                      </span>

                      {/* OTP Badge for Active Orders */}
                      {isActive && order.otp && (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                          <span className="text-[10px] font-bold text-amber-800 uppercase">OTP:</span>
                          <span className="text-xs font-mono font-black text-slate-950">{order.otp}</span>
                          <button
                            onClick={() => handleCopyOtp(order.otp!)}
                            className="text-amber-700 hover:text-amber-900 cursor-pointer"
                            title="Copy OTP"
                          >
                            {copiedOtp === order.otp ? (
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
                            Size: <span className="font-semibold text-slate-700">{it.selectedSize || 'Standard'}</span> • Qty: {it.quantity}
                          </p>
                          <p className="text-xs font-black text-slate-900 mt-0.5">
                            ₹{it.product.price * it.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

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
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live Delivery</span>
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
              You haven&apos;t placed any orders matching this filter yet. Explore our newest fashion collections and enjoy exclusive discounts!
            </p>
            {onBackToShop && (
              <button
                onClick={onBackToShop}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all"
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
