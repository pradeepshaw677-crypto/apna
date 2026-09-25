import React, { useState } from 'react';
import { X, Tag, Check, Copy, Sparkles, Percent } from 'lucide-react';
import { Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/products';

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (coupon: Coupon) => void;
  appliedCoupon: Coupon | null;
}

export const OffersModal: React.FC<OffersModalProps> = ({
  isOpen,
  onClose,
  onApplyCoupon,
  appliedCoupon,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Coupons &amp; Bank Offers</h3>
              <p className="text-[11px] text-slate-400">Apply instantly for maximum order savings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {AVAILABLE_COUPONS.map((coupon) => {
            const isApplied = appliedCoupon?.code === coupon.code;

            return (
              <div
                key={coupon.code}
                className={`p-3.5 rounded-xl border transition-all ${
                  isApplied
                    ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded bg-slate-900 text-amber-400 border border-slate-800 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Copy code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyCoupon(coupon);
                      onClose();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                    }`}
                  >
                    {isApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>

                <p className="text-xs font-semibold text-slate-800 mt-2">
                  {coupon.description}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Min order subtotal: ₹{coupon.minOrderValue} • {coupon.expiryText || 'Valid today'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
