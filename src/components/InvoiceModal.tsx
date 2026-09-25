import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { BrandLogo } from './BrandLogo';

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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base font-black">Official Tax Invoice</span>
            <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">#{order.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/10 hover:bg-black/20 text-slate-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs sm:text-sm">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BrandLogo variant="invoice" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Apna Bazar Logistics Hub, Express Gateway, New Delhi &amp; Baharagora Center
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Helpline: +91 98765 43210 | Email: support@apnabazar.in
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                GSTIN: 20AAJCA1829K1Z4 • CIN: U52100JH2026PTC018290
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 font-black rounded-lg text-xs uppercase">
                Tax Invoice / Bill of Supply
              </span>
              <p className="text-xs text-slate-500">Invoice No: <strong className="text-slate-800 font-mono">INV-{order.id}</strong></p>
              <p className="text-xs text-slate-500">Date: <strong className="text-slate-800">{invoiceDate}</strong></p>
              <p className="text-xs text-slate-500">Payment: <strong className="text-emerald-700 font-bold uppercase">Cash on Delivery (COD)</strong></p>
            </div>
          </div>

          {/* Billing & Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="font-black text-slate-900 uppercase block tracking-wider text-[11px]">Billed &amp; Delivered To:</span>
              <p className="font-bold text-slate-800 text-sm">{order.address?.fullName || "Valued Customer"}</p>
              <p className="text-slate-600">{order.address?.streetAddress}</p>
              {order.address?.landmark && <p className="text-slate-500">Landmark: {order.address.landmark}</p>}
              <p className="text-slate-600">{order.address?.city}, {order.address?.state || "Jharkhand"} - {order.address?.pincode}</p>
              <p className="text-slate-700 font-semibold pt-1">Phone: {order.address?.phoneNumber}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-slate-600">
              <span className="font-black text-slate-900 uppercase block tracking-wider text-[11px]">Dispatch &amp; Order Details:</span>
              <p>Order ID: <strong className="text-slate-800 font-mono">#{order.id}</strong></p>
              <p>Delivery Courier: <strong className="text-slate-800">BlueDart Express Air</strong></p>
              <p>Delivery OTP: <strong className="font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{order.otp || 'Verified'}</strong></p>
              <p>Order Status: <strong className="text-emerald-700 capitalize">{order.orderStatus}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                    <td className="py-2.5 font-medium text-slate-900 max-w-[200px] truncate">
                      {it.product.name}
                      <span className="block text-[10px] text-slate-400 font-mono">HSN: 61091000</span>
                    </td>
                    <td className="py-2.5 text-slate-600 font-semibold">
                      {it.selectedSize || 'Standard'}
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-800">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 text-right text-slate-600">
                      ₹{it.product.price}
                    </td>
                    <td className="py-2.5 text-right font-black text-slate-900">
                      ₹{it.product.price * it.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (MRP):</span>
                <span>₹{order.itemTotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({order.appliedCoupon || 'Promo'}):</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping &amp; Delivery:</span>
                <span>{order.deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (5% Included):</span>
                <span>₹{Math.round(order.totalAmount * 0.05)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                <span>Total Amount (COD):</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Declaration Note */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Declaration:</p>
            <p>
              This is a computer-generated tax invoice. No signature required. The goods sold are intended for end-user consumption. Applicable GST has been remitted to the Government of India.
            </p>
            <div className="flex items-center gap-1.5 pt-2 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Apna Bazar 100% Authentic Product Guarantee • 7 Days Return Policy</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
