import React, { useState } from 'react';
import { X, RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Package } from 'lucide-react';
import { Order, UserProfile, WalletTransaction } from '../types';
import { AbCoinLogo } from './AbCoinLogo';
import confetti from 'canvas-confetti';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  currentUser: UserProfile | null;
  onReturnProcessed: (updatedOrder: Order, refundedCoins: number) => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  isOpen,
  onClose,
  order,
  currentUser,
  onReturnProcessed,
}) => {
  const [selectedReason, setSelectedReason] = useState('Size does not fit properly');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!isOpen || !order) return null;

  const returnReasons = [
    'Size does not fit properly (Too tight / too loose)',
    'Quality or fabric material not as expected',
    'Defective, damaged or torn packaging',
    'Received wrong color / design variant',
    'Arrived too late / No longer needed',
  ];

  const refundAmount = order.totalAmount || 0;

  const handleSubmitReturn = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#D97706', '#10B981'],
        });
      } catch {}

      const updatedOrder: Order = {
        ...order,
        orderStatus: 'returned',
        returnRequested: true,
        returnStatus: 'approved',
        returnReason: selectedReason,
        returnComments: comments,
        returnRequestedAt: Date.now(),
        returnApprovedAt: Date.now(),
        walletRefundAmount: refundAmount,
        returnOtp: Math.floor(100000 + Math.random() * 900000).toString(),
      };

      onReturnProcessed(updatedOrder, refundAmount);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-slate-950 font-black" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">Easy 5-Day Doorstep Return</h3>
              <p className="text-[11px] font-bold text-slate-900/80">Instant AB Coin Wallet Refund Guarantee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {step === 'form' ? (
            <>
              {/* Order Info & AB Coin Refund Pill */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Order #{order.id}
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    Refund Value: ₹{refundAmount.toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[11px] text-amber-900 flex items-center gap-1 font-semibold">
                    <span>Will be credited to:</span>
                    <strong className="text-slate-950">AB Coin Wallet</strong>
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white px-3 py-2 rounded-xl border border-amber-300 shadow-2xs">
                  <AbCoinLogo size="md" />
                  <span className="text-xs font-black text-amber-900 mt-0.5">+{refundAmount} Coins</span>
                  <span className="text-[9px] text-slate-500 font-bold">100% Usable</span>
                </div>
              </div>

              {/* Items in Return */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Items Being Returned:</label>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <img src={it.product.image} alt={it.product.name} className="w-10 h-10 rounded-lg object-cover bg-white" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{it.product.name}</p>
                        <p className="text-[10px] text-slate-500">Size: {it.selectedSize || 'Standard'} • Qty: {it.quantity}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900">₹{(it.product.price * it.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Select Return Reason *</label>
                <div className="space-y-1.5">
                  {returnReasons.map((reason, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === reason
                          ? 'border-amber-500 bg-amber-50/80 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="returnReason"
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Additional Comments (Optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide any extra details about the product or reason for return..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Anti-Fraud Admin Quality Check Note */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1 border border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-400 font-black">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Anti-Fraud &amp; Quality Verification Protection</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  To prevent fraudulent returns, our doorstep rider will verify the product tag &amp; brand seal. Once verified, <strong className="text-amber-300 font-black">₹{refundAmount}</strong> will be immediately credited as <strong className="text-amber-300 font-black">{refundAmount} AB Coins</strong> to your wallet. You can use these coins for any future shopping!
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSubmitReturn}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer active:scale-98 transition-all"
              >
                <span>{isSubmitting ? 'Routing to Admin Review...' : 'Confirm Return & Credit AB Coins'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Success Confirmation Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Return Approved &amp; Credited!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your return request for Order #{order.id} has been approved by the Admin Quality Desk.
                </p>
              </div>

              {/* Big Golden AB Coin Credit Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-400 max-w-sm mx-auto space-y-2 shadow-sm">
                <AbCoinLogo size="xl" className="justify-center" />
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                    +{refundAmount} AB Coins
                  </span>
                  <p className="text-xs font-bold text-amber-800 mt-0.5">
                    ₹{refundAmount} Added to Your Apna Bazar Wallet
                  </p>
                </div>
                <p className="text-[11px] text-amber-900/80 pt-1 border-t border-amber-300">
                  Ready to spend immediately at checkout with 1 tap. (Non-withdrawable store currency)
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-slate-950 text-white text-xs font-black hover:bg-slate-900 transition-all cursor-pointer shadow-md"
                >
                  Done / View Wallet Balance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
