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
  FileText,
  RotateCcw,
  Copy,
  Check,
  Navigation,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../utils/api';
import { TrackingMap } from './TrackingMap';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  allOrders: Order[];
  onOrderUpdated?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  allOrders,
  onOrderUpdated,
  onViewInvoice,
}) => {
  const [lookupId, setLookupId] = useState('');
  const [displayedOrder, setDisplayedOrder] = useState<Order | null>(activeOrder);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // 5-Day Return state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Size is too small / loose');
  const [returnComments, setReturnComments] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(text);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const handleCancel = async () => {
    if (!displayedOrder) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelOrder(displayedOrder.id);
      if (res && res.order) {
        setDisplayedOrder(res.order);
        setCancelMessage('Order has been cancelled successfully.');
        if (onOrderUpdated) onOrderUpdated(res.order);
      }
    } catch (err: any) {
      setCancelMessage(err.message || 'Cannot cancel order at this stage.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleInitiateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayedOrder) return;

    setIsSubmittingReturn(true);
    // Generate 6-digit Return Pickup OTP
    const generatedReturnOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const updated: Order = {
      ...displayedOrder,
      orderStatus: 'return_pickup_scheduled',
      returnRequested: true,
      returnOtp: generatedReturnOtp,
      returnReason,
      returnComments,
      returnRequestedAt: Date.now(),
    };

    try {
      // Sync with server if endpoint exists or local store
      if (api.updateOrderStatus) {
        await api.updateOrderStatus(displayedOrder.id, 'return_pickup_scheduled');
      }
    } catch {
      // offline fallback
    }

    setDisplayedOrder(updated);
    if (onOrderUpdated) onOrderUpdated(updated);
    setIsSubmittingReturn(false);
    setIsReturnModalOpen(false);
    setReturnSuccessMsg(`Return pickup scheduled! Hand over parcel with OTP ${generatedReturnOtp}.`);
  };

  // 5-day return eligibility check (within 5 days of creation or delivery)
  const isWithin5Days = displayedOrder
    ? Date.now() - (displayedOrder.deliveredAt || displayedOrder.createdAt) <= 5 * 24 * 60 * 60 * 1000
    : false;

  const trackingSteps = [
    { title: 'Order Placed', statusKey: 'placed', desc: 'COD confirmed at Apna Bazar' },
    { title: 'Packed & Verified', statusKey: 'confirmed', desc: 'Packed fresh at Baharagora Express Hub' },
    { title: 'Shipped (In Transit)', statusKey: 'shipped', desc: 'Dispatched with logistics associate' },
    { title: 'Out for Delivery', statusKey: 'out_for_delivery', desc: 'Rider is on the way with your OTP parcel' },
    { title: 'Delivered', statusKey: 'delivered', desc: 'Delivered safely via 6-digit OTP verification' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-black text-base sm:text-lg">Live Delivery Tracking &amp; OTP</h2>
              <p className="text-[11px] text-amber-300 font-semibold">15-Min Express Hub • Baharagora (832101)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                placeholder="Enter Order ID (e.g. AB-92817) or Mobile Number"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 font-semibold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              onClick={handleLookup}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>

          {displayedOrder ? (
            <div className="space-y-5">
              
              {/* Top Order Status & 6-Digit Delivery OTP Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border border-amber-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-950 font-mono">#{displayedOrder.id}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      displayedOrder.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : displayedOrder.orderStatus === 'return_pickup_scheduled'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : displayedOrder.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    }`}>
                      {displayedOrder.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Placed on {new Date(displayedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • <span className="font-bold text-slate-800">Cash on Delivery</span>
                  </p>
                </div>

                {/* 6-DIGIT DELIVERY OTP BOX */}
                {displayedOrder.orderStatus !== 'delivered' && displayedOrder.orderStatus !== 'cancelled' && (
                  <div className="w-full sm:w-auto p-3.5 rounded-2xl bg-white border-2 border-amber-400 shadow-md flex items-center justify-between sm:justify-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                        Delivery Associate OTP
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-widest text-slate-950 font-mono">
                          {displayedOrder.otp || '482910'}
                        </span>
                        <button
                          onClick={() => handleCopy(displayedOrder.otp || '482910')}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy Delivery OTP"
                        >
                          {copiedOtp === (displayedOrder.otp || '482910') ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Share with rider at doorstep
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* REAL LEAFLET GPS ROUTE MAP: HUB TO CUSTOMER */}
              {displayedOrder.orderStatus !== 'cancelled' && (
                <TrackingMap
                  orderId={displayedOrder.id}
                  customerCity={displayedOrder.address.city}
                  customerAddress={displayedOrder.address.streetAddress}
                  customerName={displayedOrder.address.fullName}
                />
              )}

              {/* 5-DAY RETURN REQUEST & RETURN OTP SECTION */}
              {displayedOrder.orderStatus === 'delivered' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border-2 border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-purple-700" />
                      <div>
                        <h4 className="font-black text-sm text-purple-950">
                          5-Day Hassle-Free Return / Exchange
                        </h4>
                        <p className="text-xs text-purple-700">
                          {isWithin5Days ? 'Return window open (Within 5 days)' : 'Return window has concluded'}
                        </p>
                      </div>
                    </div>

                    {isWithin5Days && !displayedOrder.returnRequested && (
                      <button
                        onClick={() => setIsReturnModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Request Return
                      </button>
                    )}
                  </div>

                  {/* If Return is already requested, show Return OTP! */}
                  {displayedOrder.returnRequested && displayedOrder.returnOtp && (
                    <div className="p-3.5 rounded-xl bg-white border border-purple-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-purple-900">
                          Pickup Associate Return OTP
                        </span>
                        <span className="text-xs font-mono font-black text-purple-950 bg-purple-100 px-2 py-0.5 rounded tracking-widest text-base">
                          {displayedOrder.returnOtp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Reason: <strong>{displayedOrder.returnReason}</strong>. Please hand over the sealed item with original packaging to the pickup courier.
                      </p>
                    </div>
                  )}

                  {returnSuccessMsg && (
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {returnSuccessMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Return Form Modal / Drawer */}
              {isReturnModalOpen && (
                <form onSubmit={handleInitiateReturn} className="p-4 rounded-2xl bg-white border-2 border-purple-300 space-y-3 shadow-md animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="font-black text-xs sm:text-sm text-slate-900">
                      Initiate 5-Day Easy Return &amp; Generate OTP
                    </h5>
                    <button type="button" onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 text-xs">✕</button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Select Return Reason:</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="Size is too small / tight">Size is too small / tight</option>
                      <option value="Size is too loose / large">Size is too loose / large</option>
                      <option value="Color or look differs from photo">Color or look differs from photo</option>
                      <option value="Quality or fabric not as expected">Quality or fabric not as expected</option>
                      <option value="Received damaged or defective piece">Received damaged or defective piece</option>
                      <option value="Received incorrect item">Received incorrect item</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Additional Notes (Optional):</label>
                    <textarea
                      value={returnComments}
                      onChange={(e) => setReturnComments(e.target.value)}
                      placeholder="Tell us what went wrong..."
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsReturnModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReturn}
                      className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                    >
                      {isSubmittingReturn ? 'Scheduling...' : 'Confirm Return & Get OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* Visual Timeline Stepper */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">
                  Estimated Delivery: <span className="text-amber-600">{displayedOrder.estimatedDeliveryDate || 'Today in 15 mins'}</span>
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
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in Consignment */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Ordered Items</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {displayedOrder.items.map((it, i) => (
                    <div key={i} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-12 h-14 object-cover rounded-xl bg-slate-100"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{it.product.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {it.quantity} {it.selectedSize ? `• Size: ${it.selectedSize}` : ''} {it.selectedColor ? `• Color: ${it.selectedColor}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Delivery Address
                </p>
                <p className="font-semibold text-slate-800">{displayedOrder.address.fullName} ({displayedOrder.address.phoneNumber})</p>
                <p className="text-slate-600">
                  {displayedOrder.address.streetAddress}, {displayedOrder.address.landmark ? `${displayedOrder.address.landmark}, ` : ''}{displayedOrder.address.city} - {displayedOrder.address.pincode}
                </p>
              </div>

              {cancelMessage && (
                <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  {cancelMessage}
                </p>
              )}

              {/* Action Buttons: Cancel Order & Invoice */}
              <div className="pt-1 flex items-center justify-between gap-2">
                {onViewInvoice && (
                  <button
                    onClick={() => onViewInvoice(displayedOrder)}
                    className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Tax Invoice</span>
                  </button>
                )}

                {displayedOrder.cancellationAllowed && displayedOrder.orderStatus !== 'cancelled' && displayedOrder.orderStatus !== 'delivered' && (
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {isCancelling ? 'Processing...' : 'Cancel Order'}
                  </button>
                )}
              </div>

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
