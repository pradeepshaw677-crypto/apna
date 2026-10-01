import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Phone, 
  MessageCircle, 
  FileText, 
  Receipt, 
  Share2, 
  Sparkles,
  QrCode,
  Tag
} from 'lucide-react';
import { Order } from '../types';
import { AbCoinLogo } from './AbCoinLogo';
import { numberToIndianWords } from '../utils/numberToWords';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const [viewMode, setViewMode] = useState<'thermal' | 'gst'>('thermal');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalItemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const netPayable = order.totalAmount;
  const wordsAmount = numberToIndianWords(netPayable);

  const getPaymentLabel = () => {
    if (order.paymentMethod === 'ab_coins') return 'AB Coins (Wallet)';
    if (order.paymentMethod === 'cod') return 'Cash on Delivery (COD)';
    if (order.paymentMethod === 'upi') return 'Online (UPI)';
    return (order.paymentMethod || 'COD').toUpperCase();
  };

  const getStatusLabel = () => {
    if (order.orderStatus === 'delivered') return 'Delivered';
    if (order.orderStatus === 'shipped') return 'In Transit';
    if (order.orderStatus === 'out_for_delivery') return 'Out for Delivery';
    if (order.orderStatus === 'confirmed') return 'Order Confirmed';
    if (order.orderStatus === 'placed') return 'Order Placed';
    return order.orderStatus.replace(/_/g, ' ').toUpperCase();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🧾 *Apka Apna Bazar - Tax Invoice*\nOrder ID: #ORD-${order.id}\nItems: ${totalItemCount}\nNet Payable: ₹${netPayable}\nStatus: ${getStatusLabel()}\nDelivery: 3-Day Express Doorstep\nHelpline: +91 6207462800`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div 
        className="bg-slate-100 w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-fadeIn print:max-h-none print:w-full print:border-none print:shadow-none print:rounded-none print:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black">Apka Apna Bazar Receipt</h3>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #ORD-{order.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('thermal')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'thermal'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                80mm Thermal Slip
              </button>
              <button
                type="button"
                onClick={() => setViewMode('gst')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'gst'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                A4 GST Tax Bill
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Format Switcher Tab */}
        <div className="sm:hidden flex bg-slate-200 border-b border-slate-300 p-1 text-xs font-bold text-slate-700 print:hidden">
          <button
            type="button"
            onClick={() => setViewMode('thermal')}
            className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${
              viewMode === 'thermal' ? 'bg-white text-slate-950 shadow-xs font-black' : ''
            }`}
          >
            80mm Thermal POS
          </button>
          <button
            type="button"
            onClick={() => setViewMode('gst')}
            className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${
              viewMode === 'gst' ? 'bg-white text-slate-950 shadow-xs font-black' : ''
            }`}
          >
            Official A4 GST
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-3 sm:p-6 space-y-6 flex-1 bg-slate-100/90 print:p-0 print:bg-white print:overflow-visible">
          
          {viewMode === 'thermal' ? (
            /* ========================================================= */
            /* 1. AUTHENTIC 80MM THERMAL RECEIPT SLIP (MATCHING SCREENSHOT) */
            /* ========================================================= */
            <div className="max-w-[380px] mx-auto bg-white p-5 sm:p-7 rounded-2xl shadow-md border border-slate-200 font-mono text-slate-900 text-xs leading-relaxed print:max-w-none print:shadow-none print:border-none print:p-2">
              
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-2">
                <h1 className="text-base sm:text-lg font-black tracking-wide text-slate-950 font-sans uppercase">
                  APKA APNA BAZAR
                </h1>
                <p className="text-[11px] leading-tight text-slate-700 uppercase font-semibold">
                  DADU COMPLEX, NEAR SHITLA MANDIR<br />
                  BAHARAGORA, JHARKHAND-832101<br />
                  MOB: 6207462800, 6203341481<br />
                  GSTIN: 20AAYFT4502E1ZC
                </p>
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-950 py-0.5">
                TAX INVOICE
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Order Meta */}
              <div className="space-y-1 text-xs text-slate-800">
                <div className="flex justify-between">
                  <span>Inv No: ORD-{order.id.slice(-6).toUpperCase()}</span>
                  <span>Date: {invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Name: {order.address?.fullName || 'Customer'}</span>
                  <span>Mob: {order.address?.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pay: {getPaymentLabel()}</span>
                  <span>Status: {getStatusLabel()}</span>
                </div>
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-950 pb-1">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Amt</span>
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-300 my-1" />

              {/* Line Items */}
              <div className="space-y-2 py-1 text-xs">
                {order.items.map((it, idx) => {
                  const itemRate = it.unitPrice || it.product.price;
                  const itemAmt = itemRate * it.quantity;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-6 leading-tight">
                          <span className="font-semibold block">{idx + 1}. {it.product.name}</span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            Size: {it.selectedSize || 'Free'} {it.selectedColor ? `• ${it.selectedColor}` : ''}
                          </span>
                        </div>
                        <span className="col-span-2 text-center">{it.quantity}</span>
                        <span className="col-span-2 text-right">{itemRate.toFixed(2)}</span>
                        <span className="col-span-2 text-right font-bold">{itemAmt.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Total Items & Total */}
              <div className="flex justify-between font-bold text-xs py-0.5">
                <span>Total Items: {totalItemCount}.00</span>
                <span>Total: {order.itemTotal.toFixed(2)}</span>
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Calculation Breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span>: {order.itemTotal.toFixed(2)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Discount ({order.appliedCoupon || 'Coupon'})</span>
                    <span>: -{order.discount.toFixed(2)}</span>
                  </div>
                )}

                {order.abCoinsUsed && order.abCoinsUsed > 0 && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>AB Coins Applied</span>
                    <span>: -{order.abCoinsUsed.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>: {order.deliveryFee === 0 ? '0.00 (FREE)' : order.deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-800 text-slate-950">
                  <span>NET PAYABLE</span>
                  <span>: Rs. {netPayable.toFixed(2)}</span>
                </div>
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Amount In Words (matching screenshot) */}
              <div className="text-center font-bold text-xs italic text-slate-900 py-1">
                {wordsAmount}
              </div>

              {/* Dotted Divider */}
              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Footer Note */}
              <div className="text-center space-y-1 pt-1">
                <p className="font-bold text-sm text-slate-950">Thank You, Visit Again!</p>
                <p className="text-[10px] text-slate-600 font-sans">
                  ⚡ 3-Day Express Doorstep Delivery Across India<br />
                  5-Day Hassle-Free Returns with OTP Confirmation
                </p>
                <div className="pt-2 flex justify-center items-center gap-1 opacity-70">
                  <div className="h-6 w-36 bg-[repeating-linear-gradient(90deg,#1e293b,#1e293b_2px,transparent_2px,transparent_4px)]" />
                </div>
                <p className="text-[9px] text-slate-400 font-mono tracking-widest">
                  *ORD-{order.id.slice(0, 10).toUpperCase()}*
                </p>
              </div>

            </div>
          ) : (
            /* ========================================================= */
            /* 2. OFFICIAL A4 GST TAX INVOICE FORMAT */
            /* ========================================================= */
            <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-6">
              
              {/* A4 Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-950 tracking-tight font-sans">
                      APKA APNA BAZAR
                    </span>
                    <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      Superstore
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Helpline: +91 6207462800, +91 6203341481 • GSTIN: 20AAYFT4502E1ZC
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-amber-300 font-black rounded-lg text-xs uppercase">
                    Tax Invoice / Bill of Supply
                  </span>
                  <p className="text-xs text-slate-500">Invoice No: <strong className="font-mono text-slate-900">INV-{order.id}</strong></p>
                  <p className="text-xs text-slate-500">Date: <strong className="text-slate-900">{invoiceDate}</strong></p>
                  <p className="text-xs text-slate-500">
                    Payment Mode: <strong className="text-emerald-700 uppercase font-bold">{getPaymentLabel()}</strong>
                  </p>
                </div>
              </div>

              {/* Billing & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-black text-slate-900 uppercase block tracking-wider text-[10px]">
                    Billed &amp; Delivered To:
                  </span>
                  <p className="font-bold text-slate-950 text-sm">{order.address?.fullName || "Valued Customer"}</p>
                  <p className="text-slate-600">{order.address?.streetAddress}</p>
                  {order.address?.landmark && <p className="text-slate-500">Landmark: {order.address.landmark}</p>}
                  <p className="text-slate-600">{order.address?.city}, {order.address?.state || "Jharkhand"} - {order.address?.pincode}</p>
                  <p className="text-slate-900 font-bold pt-1">Phone: {order.address?.phoneNumber}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-slate-600">
                  <span className="font-black text-slate-900 uppercase block tracking-wider text-[10px]">
                    Dispatch &amp; Express Delivery:
                  </span>
                  <p>Order ID: <strong className="text-slate-900 font-mono">#{order.id}</strong></p>
                  <p className="flex items-center gap-1 font-semibold text-slate-900">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    ⚡ 3-Day Express Doorstep Delivery Across India
                  </p>
                  <p>Delivery OTP: <strong className="font-mono text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{order.otp || 'Verified'}</strong></p>
                  <p>Order Status: <strong className="text-emerald-700 capitalize font-bold">{getStatusLabel()}</strong></p>
                </div>
              </div>

              {/* A4 Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[340px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2">Item Description</th>
                      <th className="py-2">Size / Variant</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-slate-900">
                          {it.product.name}
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">HSN: 61091000 • Fabric Guaranteed</span>
                        </td>
                        <td className="py-2.5 text-slate-600 font-semibold">
                          {it.selectedSize || 'Free'} {it.selectedColor ? `(${it.selectedColor})` : ''}
                        </td>
                        <td className="py-2.5 text-center font-bold text-slate-900">{it.quantity}</td>
                        <td className="py-2.5 text-right text-slate-600">₹{(it.unitPrice || it.product.price).toFixed(2)}</td>
                        <td className="py-2.5 text-right font-black text-slate-950">₹{((it.unitPrice || it.product.price) * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* A4 Summary */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="text-xs text-slate-500 max-w-sm space-y-1">
                  <p className="font-bold text-slate-800">Amount in Words:</p>
                  <p className="text-xs italic text-slate-900 font-semibold bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {wordsAmount}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold pt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>5-Day Doorstep Return Guarantee with Instant AB Coin Wallet Credit</span>
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs font-medium">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal MRP:</span>
                    <span>₹{order.itemTotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount ({order.appliedCoupon || 'Promo'}):</span>
                      <span>-₹{order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.abCoinsUsed && order.abCoinsUsed > 0 && (
                    <div className="flex justify-between text-amber-800 font-bold items-center">
                      <span className="flex items-center gap-1">
                        <AbCoinLogo size="xs" />
                        <span>AB Coins:</span>
                      </span>
                      <span>-₹{order.abCoinsUsed.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Express Delivery:</span>
                    <span>{order.deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${order.deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                    <span>Net Payable:</span>
                    <span>₹{netPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* ORDER STATUS & ACTIONS SECTION (MATCHING SCREENSHOT 2) */}
          {/* ========================================================= */}
          <div className="space-y-4 print:hidden">
            
            {/* Order Status Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Order Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-base font-black text-slate-950 capitalize">{getStatusLabel()}</h4>
                </div>
                <p className="text-xs text-slate-500 font-mono">Order ID: ORD-{order.id.slice(-6).toUpperCase()}</p>
              </div>

              {order.otp && (
                <div className="text-right bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Delivery OTP</span>
                  <span className="text-sm font-mono font-black text-amber-950 tracking-wider">{order.otp}</span>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Actions</span>
              
              {/* Print Receipt Primary Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <Printer className="w-5 h-5 text-amber-400" />
                <span>Print Receipt</span>
              </button>

              <p className="text-center text-xs text-slate-500 leading-tight">
                Uses thermal receipt layout. Select &quot;80mm Roll Paper&quot; or similar when printing.
              </p>

              {/* WhatsApp Share Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Share on WhatsApp</span>
                </button>

                <a
                  href="tel:+916207462800"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Call Executive (+91 6207462800)</span>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Contact Quick-Bar */}
        <div className="p-3 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-xs text-slate-600 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Support Desk: +91 6207462800</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Baharagora Central Hub</span>
        </div>

      </div>
    </div>
  );
};
