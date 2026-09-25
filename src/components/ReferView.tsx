import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Sparkles, 
  Coins, 
  MessageCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

interface ReferViewProps {
  referralCode?: string;
  onExploreProducts: () => void;
}

export const ReferView: React.FC<ReferViewProps> = ({
  referralCode = 'BHABANI2026',
  onExploreProducts,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Hey! Use my referral code ${referralCode} on Apna Bazar to get flat ₹200 OFF on your first grocery basket! Get fresh groceries delivered in 15 mins with 100% Cash on Delivery: https://apnabazar.in`;

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Hero Banner - Glowing Festive Gradient */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-slate-950 shadow-xl shadow-amber-500/15 relative overflow-hidden text-center sm:text-left">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mb-16" />
          
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-slate-950 text-xs font-black backdrop-blur-xs uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              <span>Apna Bazar Rewards Program</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Give ₹200, <br />
              <span className="text-white drop-shadow-sm">Get ₹200!</span>
            </h1>
            <p className="text-slate-950/80 text-xs sm:text-sm font-semibold leading-relaxed">
              Invite your friends and family to Apna Bazar. They get flat ₹200 off their first order, and you earn ₹200 in Apna Bazar shopping credits as soon as their package is delivered!
            </p>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900">Your Exclusive Invite Code</h3>
            <p className="text-xs text-slate-500">Share this code with your friends or copy the invite link below</p>
          </div>

          <div className="max-w-md mx-auto flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-amber-300">
            <div className="flex items-center gap-2 pl-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-950 tracking-widest">
                {referralCode}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={shareOnWhatsApp}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Copy Direct Link</span>
            </button>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            How Apna Bazar Referral Works
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h4 className="font-black text-slate-900 text-sm">Share Your Code</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send your unique referral code or link to friends and family via WhatsApp or SMS.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h4 className="font-black text-slate-900 text-sm">Friend Gets ₹200 OFF</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When they apply your code at checkout, they instantly get ₹200 discount on their purchase.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h4 className="font-black text-slate-900 text-sm">You Earn ₹200 Cash</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Once their order is successfully delivered, ₹200 is credited straight into your Apna Bazar wallet!
              </p>
            </div>
          </div>
        </div>

        {/* Explore CTA */}
        <div className="text-center pt-2">
          <button
            onClick={onExploreProducts}
            className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center gap-2 mx-auto transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Explore Fashion Collections</span>
          </button>
        </div>

      </div>
    </div>
  );
};
