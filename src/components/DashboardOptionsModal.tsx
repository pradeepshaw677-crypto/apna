import React from 'react';
import { Gift, AlertCircle, HelpCircle, Heart, MapPin, LogOut, X, ChevronRight } from 'lucide-react';

interface DashboardOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'refer' | 'complaints' | 'support' | 'wishlist' | 'addresses' | 'logout') => void;
}

export const DashboardOptionsModal: React.FC<DashboardOptionsModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-slideUp sm:animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-2 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900">Dashboard Options</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List matching screenshot */}
        <div className="space-y-2 text-xs font-bold text-slate-700">
          
          <button
            onClick={() => {
              onSelectOption('refer');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold">Refer &amp; Earn</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
              Earn ₹200
            </span>
          </button>

          <button
            onClick={() => {
              onSelectOption('complaints');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold">My Complaints / Support Ticket</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onSelectOption('support');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold">Help &amp; Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onSelectOption('wishlist');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-900 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold">Wishlist</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onSelectOption('addresses');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold">Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onSelectOption('logout');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-left mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Logout Account</span>
          </button>

        </div>

      </div>
    </div>
  );
};
