import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Search, 
  Package, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  KeyRound,
  FileText
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../utils/api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  allOrders: Order[];
  onOrderUpdated?: (order: Order) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  allOrders,
  onOrderUpdated,
}) => {
  const [lookupId, setLookupId] = useState('');
  const [displayedOrder, setDisplayedOrder] = useState<Order | null>(activeOrder);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrder) {
      setDisplayedOrder(activeOrder);
    } else if (allOrders.length > 0) {
      setDisplayedOrder(allOrders[0]);
    }
  }, [activeOrder, allOrders]);

  if (!isOpen) return null;

  const handleLookup = () => {
    const trimmed = lookupId.trim().toUpperCase();
    if (!trimmed) return;
    const found = allOrders.find(
      (o) => o.id.toUpperCase() === trimmed || o.address.phoneNumber.includes(trimmed)
    );
    if (found) {
      setDisplayedOrder(found);
      setCancelMessage(null);
    }
  };

  const handleCancel = async () => {
    if (!displayedOrder) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelOrder(displayedOrder.id);
      if (res && res.order) {
        setDisplayedOrder(res.order);
        setCancelMessage('Order has been cancelled. Refund will reflect in 24-48 hours.');
        if (onOrderUpdated) onOrderUpdated(res.order);
      }
    } catch (err: any) {
      setCancelMessage(err.message || 'Cannot cancel order at this stage.');
    } finally {
      setIsCancelling(false);
    }
  };

  const trackingSteps = [
    { title: 'Order Placed', statusKey: 'placed' },
    { title: 'Confirmed & Packed', statusKey: 'confirmed' },
    { title: 'Shipped (In Transit)', statusKey: 'shipped' },
    { title: 'Out for Delivery', statusKey: 'out_for_delivery' },
    { title: 'Delivered', statusKey: 'delivered' },
  ];

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const statusOrder = ['placed', 'confirmed', 'packing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepTargetIdx = [0, 1, 3, 4, 5][stepIndex];

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentIdx > stepTargetIdx) return 'completed';
    if (currentIdx === stepTargetIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="font-bold text-base sm:text-lg">Live Order &amp; Delivery Tracking</h2>
              <p className="text-[11px] text-slate-400">Apna Bazar Logistics Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Lookup Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter Order ID (e.g. AB-92817) or Phone Number"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 font-semibold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              onClick={handleLookup}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Track
            </button>
          </div>

          {displayedOrder ? (
            <div className="space-y-5">
              
              {/* Top Order Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{displayedOrder.id}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      displayedOrder.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : displayedOrder.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {displayedOrder.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Placed on {new Date(displayedOrder.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                {/* Delivery OTP Badge (Flipkart Style Security) */}
                {displayedOrder.orderStatus !== 'delivered' && displayedOrder.orderStatus !== 'cancelled' && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center gap-2.5">
                    <KeyRound className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Delivery OTP</p>
                      <p className="text-base font-black tracking-widest text-slate-900 font-mono">
                        {displayedOrder.otp}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Timeline Stepper */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Estimated Delivery: <span className="text-amber-600">{displayedOrder.estimatedDeliveryDate}</span>
                </p>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {trackingSteps.map((step, idx) => {
                    const status = getStepStatus(idx, displayedOrder.orderStatus);
                    const isCompleted = status === 'completed';
                    const isActive = status === 'active';
                    const isCancelled = status === 'cancelled';

                    return (
                      <div key={step.title} className="relative flex items-start gap-3">
                        <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                          isCompleted
                            ? 'bg-slate-900 border-slate-900 text-amber-400'
                            : isActive
                            ? 'bg-amber-500 border-amber-500 text-slate-950 animate-pulse'
                            : isCancelled
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>

                        <div>
                          <p className={`text-xs font-bold ${
                            isActive ? 'text-amber-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {isActive ? 'Current status of your consignment' : isCompleted ? 'Completed' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in Consignment */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ordered Items</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {displayedOrder.items.map((it, i) => (
                    <div key={i} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-12 h-14 object-cover rounded-md bg-slate-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{it.product.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {it.quantity} {it.selectedSize ? `• Size: ${it.selectedSize}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Delivery Address
                </p>
                <p className="font-semibold text-slate-800">{displayedOrder.address.fullName} ({displayedOrder.address.phoneNumber})</p>
                <p className="text-slate-600">
                  {displayedOrder.address.streetAddress}, {displayedOrder.address.landmark ? `${displayedOrder.address.landmark}, ` : ''}{displayedOrder.address.city} - {displayedOrder.address.pincode}
                </p>
              </div>

              {cancelMessage && (
                <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  {cancelMessage}
                </p>
              )}

              {/* Action Buttons: Cancel Order */}
              {displayedOrder.cancellationAllowed && displayedOrder.orderStatus !== 'cancelled' && displayedOrder.orderStatus !== 'delivered' && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                  >
                    {isCancelling ? 'Processing...' : 'Cancel Order'}
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No order selected or found.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
