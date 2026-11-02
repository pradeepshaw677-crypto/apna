import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Truck, 
  Receipt, 
  QrCode
} from 'lucide-react';
import { Order } from '../types';
import { AbCoinLogo } from './AbCoinLogo';
import { numberToIndianWords } from '../utils/numberToWords';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const invoiceTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div 
        className="bg-slate-100 w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92dvh] flex flex-col print:max-h-none print:w-full print:border-none print:shadow-none print:rounded-none print:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black">Official Tax Invoice &amp; Cash Memo</h3>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #ORD-{order.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 sm:px-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Print Receipt or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice Paper</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Authentic A4 Tax Invoice Paper */}
        <div className="overflow-y-auto p-3 sm:p-6 flex-1 bg-slate-100/90 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Authentic Clean Tax Invoice Paper Sheet */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-300 text-xs sm:text-sm text-slate-800 space-y-5 print:border-none print:shadow-none print:p-0">
            
            {/* Store & Bill Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-sans">
                    APKA APNA BAZAR
                  </span>
                  <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded border border-amber-500">
                    Retail Hub
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                  Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Store Helpline: <strong className="text-slate-900 font-bold">+91 9999999999</strong> • GSTIN: 20AAYFT4502E1ZC
                </p>
                <p className="text-[11px] text-slate-500">
                  Email: support@apnabazar.in • Operating Hours: 8:00 AM - 10:00 PM
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block px-3 py-1 bg-slate-950 text-amber-300 font-black rounded-lg text-xs uppercase tracking-wide">
                  TAX INVOICE / CASH MEMO
                </span>
                <p className="text-xs text-slate-600">Invoice No: <strong className="font-mono text-slate-950 font-black">INV-{order.id.toUpperCase()}</strong></p>
                <p className="text-xs text-slate-600">Date &amp; Time: <strong className="text-slate-900 font-semibold">{invoiceDate} at {invoiceTime}</strong></p>
                <p className="text-xs text-slate-600">
                  Payment Mode: <strong className="text-emerald-700 uppercase font-black">{getPaymentLabel()}</strong>
                </p>
              </div>
            </div>

            {/* Billed To & Consignment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 uppercase block tracking-wider text-[10px]">
                  Billed &amp; Delivered To:
                </span>
                <p className="font-bold text-slate-950 text-sm">{order.address?.fullName || "Valued Customer"}</p>
                <p className="text-slate-700 font-medium">{order.address?.streetAddress}</p>
                {order.address?.landmark && <p className="text-slate-500 font-normal">Landmark: {order.address.landmark}</p>}
                <p className="text-slate-700 font-semibold">{order.address?.city}, {order.address?.state || "Jharkhand"} - {order.address?.pincode}</p>
                <p className="text-slate-950 font-bold pt-1">Mobile: {order.address?.phoneNumber}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
                <span className="font-black text-slate-900 uppercase block tracking-wider text-[10px]">
                  Dispatch &amp; Delivery Consignment:
                </span>
                <p>Order Reference: <strong className="text-slate-950 font-mono font-bold">#{order.id}</strong></p>
                <p className="flex items-center gap-1 font-semibold text-slate-900">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>3-Day Express Doorstep Delivery Across India</span>
                </p>
                <p>Delivery OTP: <strong className="font-mono text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-black">{order.otp || 'Verified'}</strong></p>
                <p>Current Status: <strong className="text-emerald-700 capitalize font-black">{getStatusLabel()}</strong></p>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-700 font-black uppercase text-[10px] bg-slate-50">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Item Description</th>
                    <th className="py-2.5 px-2">Size / Color</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Rate</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-bold text-slate-950">
                        {it.product.name}
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">HSN: 61091000 • 100% Genuine Quality</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-700 font-semibold">
                        {it.selectedSize || 'Standard'} {it.selectedColor ? `(${it.selectedColor})` : ''}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-950">{it.quantity}</td>
                      <td className="py-2.5 px-2 text-right text-slate-700">₹{(it.unitPrice || it.product.price).toFixed(2)}</td>
                      <td className="py-2.5 px-2 text-right font-black text-slate-950">₹{((it.unitPrice || it.product.price) * it.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation & Summary Section */}
            <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="text-xs text-slate-600 max-w-sm space-y-2">
                <div>
                  <p className="font-bold text-slate-900">Amount in Words:</p>
                  <p className="text-xs italic text-slate-950 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                    {wordsAmount}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5-Day Doorstep Return / Exchange Window Active</span>
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal MRP ({totalItemCount} items):</span>
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
                      <span>AB Coins Redeemed:</span>
                    </span>
                    <span>-₹{order.coinsDiscount || Math.floor(order.abCoinsUsed / 2)}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Express Delivery:</span>
                  <span>{order.deliveryFee === 0 ? <strong className="text-emerald-700 font-bold">FREE</strong> : `₹${order.deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                  <span>Net Payable Amount:</span>
                  <span>₹{netPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Official Stamp & Signatory Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="font-bold text-slate-800">Terms &amp; Conditions:</p>
                <p>1. Goods once sold can be returned/exchanged within 5 days of doorstep delivery.</p>
                <p>2. Hand over items in original tags and packaging with the 6-digit pickup OTP.</p>
                <p>3. This is a computer-generated tax invoice and requires no physical signature.</p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="inline-block border-2 border-dashed border-slate-300 rounded-xl px-4 py-2 bg-slate-50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Authorized Stamp</p>
                  <p className="font-black text-xs text-slate-900 tracking-wider">APKA APNA BAZAR</p>
                  <p className="text-[9px] text-emerald-700 font-bold">VERIFIED &amp; CERTIFIED</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
