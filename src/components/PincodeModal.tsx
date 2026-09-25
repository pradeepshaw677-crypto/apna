import React, { useState } from 'react';
import { X, MapPin, Check, Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onPincodeSelected: (pincode: string) => void;
}

export const PincodeModal: React.FC<PincodeModalProps> = ({
  isOpen,
  onClose,
  currentPincode,
  onPincodeSelected,
}) => {
  const [pincode, setPincode] = useState(currentPincode || '832101');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    eligible?: boolean;
    deliveryDate?: string;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;

    setLoading(true);
    const res = await api.checkPincode(pincode);
    setResult(res);
    setLoading(false);
    if (res.eligible) {
      onPincodeSelected(pincode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Check Delivery Speed</h3>
              <p className="text-[11px] text-slate-400">Nationwide Express Delivery Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleCheck} className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Enter 6-Digit Indian Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 832101 or 110001"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loading || pincode.length !== 6}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          </form>

          {result && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              result.eligible ? 'bg-amber-50/60 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{result.message}</span>
              </div>
              {result.deliveryDate && (
                <p className="text-slate-600 font-semibold">
                  Estimated Delivery by: <strong className="text-amber-700">{result.deliveryDate}</strong>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Free Delivery with Plus</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
              <span>7 Days Easy Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
