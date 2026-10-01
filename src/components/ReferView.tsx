import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { AbCoinLogo } from './AbCoinLogo';

interface ReferViewProps {
  referralCode?: string;
  onExploreProducts: () => void;
}

export const ReferView: React.FC<ReferViewProps> = ({
  referralCode = 'APNA100',
  onExploreProducts,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Hey! Use my Apna Bazar invite code ${referralCode} to get flat ₹100 OFF on your first fashion & footwear order! Fast 3-Day Express Delivery with 100% Cash on Delivery & 5-Day Returns: https://apnabazar.in`;

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
              Give ₹100, <br />
              <span className="text-white drop-shadow-sm">Get 100 AB Coins!</span>
            </h1>
            <p className="text-slate-950/90 text-xs sm:text-sm font-semibold leading-relaxed">
              Invite your friends and family to Apna Bazar. They get flat ₹100 OFF on their first order, and you earn 100 AB Coins (₹100 shopping value) directly in your wallet once their package is delivered!
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

        {/* Anti-Fraud Security Guarantee Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-black text-base">Anti-Fraud &amp; Fair Referral Policy</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To ensure genuine benefits and prevent fraudulent accounts, our automated security engine enforces these verification rules:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">1. Device &amp; Mobile Verification</span>
              <p className="text-slate-400 text-[11px]">Each referral discount is valid only for distinct, first-time mobile numbers and verified delivery devices.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">2. Self-Referral Prevention</span>
              <p className="text-slate-400 text-[11px]">Users cannot apply their own code or use multiple duplicate accounts from the same address.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">3. Min Order Value ₹499</span>
              <p className="text-slate-400 text-[11px]">The flat ₹100 discount coupon applies automatically on any order with cart value of ₹499 or above.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">4. OTP Delivered Confirmation</span>
              <p className="text-slate-400 text-[11px]">100 AB Coins reward is credited to your wallet after OTP verification and confirmed doorstep delivery.</p>
            </div>
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
              <h4 className="font-black text-slate-900 text-sm">Friend Gets ₹100 OFF</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When they apply your code at checkout, they instantly get flat ₹100 discount on their purchase.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1">
                <span>You Earn 100 Coins</span>
                <AbCoinLogo size="xs" />
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Once their order is successfully delivered with OTP, 100 AB Coins are credited straight into your wallet!
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
