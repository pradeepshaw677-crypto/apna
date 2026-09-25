import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Send, Info, Phone, MessageCircle } from 'lucide-react';

interface SupportViewProps {
  onBackToShop: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ onBackToShop }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('9876543210');
  const [orderId, setOrderId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !issueType || !description) return;

    setIsSubmitted(true);
    setTimeout(() => {
      // simulated save or sync
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Back Link matching screenshot: "← Back to Home" */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Complaint Form Card matching screenshot */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lodge a Complaint
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We&apos;re sorry you&apos;re facing an issue. Please fill out the form below and our support team will get back to you within 24 hours.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-black text-slate-900 text-base">Complaint Registered!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Ticket #TKT-{Math.floor(10000 + Math.random() * 90000)} has been generated. Our Baharagora store manager will call or message you on <strong>{phone}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setDescription('');
                  setOrderId('');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Full Name */}
              <div>
                <label className="block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Order ID (Optional) */}
              <div>
                <label className="block mb-1">Order ID (Optional)</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Issue Type */}
              <div>
                <label className="block mb-1">Issue Type *</label>
                <select
                  required
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Select the type of issue</option>
                  <option value="delivery_delay">15-Min Delivery Delay</option>
                  <option value="damaged_product">Damaged / Leaking Product</option>
                  <option value="missing_item">Missing Item in Package</option>
                  <option value="wrong_item">Wrong Item Delivered</option>
                  <option value="quality_issue">Product Quality / Freshness Issue</option>
                  <option value="payment_query">Cash on Delivery / OTP Query</option>
                  <option value="other">Other Inquiries</option>
                </select>
              </div>

              {/* Describe Issue */}
              <div>
                <label className="block mb-1">Describe your issue *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please explain the problem you faced in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Notice Box matching screenshot:
                  "ℹ️ By submitting this form, you agree that our support executives might call you on your registered phone number to resolve this issue." */}
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-2.5 text-[11px] text-sky-800 font-medium">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  By submitting this form, you agree that our support executives might call you on your registered phone number to resolve this issue.
                </span>
              </div>

              {/* Submit Button matching screenshot: Yellow Pill Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-all hover:scale-101 active:scale-98 cursor-pointer"
              >
                Submit Complaint
              </button>
            </form>
          )}

          {/* Quick Direct Contacts */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Prefer immediate assistance?</span>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/916207462800?text=Hi%20The%20Grocery%20Hub,%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:6207462800"
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Store</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
