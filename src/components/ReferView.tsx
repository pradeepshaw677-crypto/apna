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
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const directLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralCode}` : `https://apnabazar.in/?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = `Hey! Order genuine fashion, footwear and daily essentials from Apna Bazar using my link: ${directLink} (or code ${referralCode}). Get 50 AB Coins discount! 100% Cash on Delivery & 5-Day Returns.`;

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
              Refer a Friend, <br />
              <span className="text-white drop-shadow-sm">Earn 50 + 50 AB Coins!</span>
            </h1>
            <p className="text-slate-950/90 text-xs sm:text-sm font-semibold leading-relaxed">
              Share your link with friends. When they order within 4-5 days and their package is delivered successfully with OTP, real AB Coins (50 Coins for you, 50 Coins for your friend = ₹25 real shopping cash each) are credited directly into your wallet!
            </p>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900">Your Exclusive Invite Code &amp; Link</h3>
            <p className="text-xs text-slate-500">Share this code or your direct link. Friends ordering within 4-5 days unlock instant rewards.</p>
          </div>

          <div className="max-w-md mx-auto flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-amber-300">
            <div className="flex items-center gap-2 pl-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-950 tracking-widest">
                {referralCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={shareOnWhatsApp}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
            </button>
          </div>
        </div>

        {/* Anti-Fraud Security Guarantee Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-black text-base">Anti-Fraud &amp; Fair Referral Security System</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To ensure genuine benefits and prevent fake or fraudulent orders, our automated security engine enforces these verification rules:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">1. Device &amp; Phone Verification</span>
              <p className="text-slate-400 text-[11px]">Each referral is valid only for distinct, first-time mobile numbers and verified delivery devices.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">2. Self-Referral Protection</span>
              <p className="text-slate-400 text-[11px]">Users cannot apply their own referral link or create duplicate accounts to farm rewards.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">3. 4-5 Day Purchase Window</span>
              <p className="text-slate-400 text-[11px]">When a friend visits via your link, their referral tracking remains active for 5 days.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
              <span className="font-bold text-amber-300 block">4. OTP Delivered Confirmation</span>
              <p className="text-slate-400 text-[11px]">Coins are credited strictly once the doorstep courier delivers the order with 6-digit OTP verification.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1 sm:col-span-2">
              <span className="font-bold text-amber-300 block">5. Return &amp; Cancellation Safeguard</span>
              <p className="text-slate-400 text-[11px]">If the friend returns or cancels their order within the 5-day return window, referral AB coins are NOT issued / revoked to prevent return fraud.</p>
            </div>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            How Apna Bazar Referral Works (50 + 50 Coins)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h4 className="font-black text-slate-900 text-sm">Share Your Invite Code</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send your unique referral code ({referralCode}) to friends &amp; family via WhatsApp or SMS.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h4 className="font-black text-slate-900 text-sm">Friend Places 1st Order</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your friend registers and enters your referral code when placing their very first order.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1">
                <span>Both Earn 50 AB Coins</span>
                <AbCoinLogo size="xs" />
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When their 1st order is successfully delivered with 6-digit OTP, 50 Coins are added to your wallet and 50 Coins to theirs!
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
