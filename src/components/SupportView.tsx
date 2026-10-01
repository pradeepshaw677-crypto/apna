import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  Info, 
  Phone, 
  MessageCircle, 
  AlertCircle, 
  Mail, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Truck,
  HelpCircle,
  Upload
} from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';

interface SupportViewProps {
  onBackToShop: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ onBackToShop }) => {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('6207462800');
  const [orderId, setOrderId] = useState('');
  const [issueType, setIssueType] = useState('size_issue');
  const [description, setDescription] = useState('');
  const [uploadedProof, setUploadedProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState('');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I track my active fashion order status?',
      a: 'You can track your order live anytime under the "Orders" tab or by clicking "Track Order" in the top header. You will also receive real-time SMS updates and an OTP for secure doorstep delivery.',
    },
    {
      q: 'What if I receive defective apparel, wrong size, or bad fabric quality?',
      a: 'Apka Apna Bazar offers a 100% Buyer Protection Guarantee. You have 5 days from delivery to request a return right from your Orders page. Our rider picks up the item and your full payment is immediately refunded as AB Coins to your wallet.',
    },
    {
      q: 'How do refunds work with AB Coins?',
      a: 'Once your return pickup is confirmed via OTP, the entire order amount is credited instantly to your AB Coins Wallet (1 AB Coin = ₹1). You can use these coins to buy any sarees, footwear, or apparel with zero expiry!',
    },
    {
      q: 'What are the customer support operating hours?',
      a: 'Our Baharagora central support desk is active Monday to Sunday from 8:00 AM to 10:00 PM IST via direct phone (+91 6207462800) and WhatsApp (+91 6207462800).',
    },
    {
      q: 'How does the 5-day doorstep return pickup with OTP work?',
      a: 'When you submit a return request, a 6-digit Return OTP is generated. When our logistics executive arrives at your doorstep to pick up the item, share the OTP to verify the return and your AB Coins are credited automatically.',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await uploadToCloudinary(file, 'complaints');
      setUploadedProof(res.url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !description) return;

    setIsSubmitting(true);
    const ticketId = 'TKT-' + Math.floor(10000 + Math.random() * 90000);
    setGeneratedTicket(ticketId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Back Link matching screenshot */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* 1. Hero Banner matching Screenshot 8 */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-md space-y-2 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-slate-950/15 text-slate-950 px-3 py-1 rounded-full border border-slate-950/20">
              24/7 ASSISTANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              Help &amp; Support Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-900/90 font-medium max-w-lg leading-relaxed">
              Need help with an order, item issue, or delivery? Reach out to our dedicated support team directly.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/20 blur-xl pointer-events-none" />
        </div>

        {/* 2. Card 1: Lodge a Complaint (Matching Screenshot 8) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-black text-slate-900">Lodge a Complaint</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Facing an issue with quality, missing items, or delayed delivery? File an official complaint and our manager will address it immediately.
              </p>
            </div>
          </div>

          {!showComplaintForm ? (
            <button
              type="button"
              onClick={() => setShowComplaintForm(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <span>Lodge a Complaint Now</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <div className="pt-2 border-t border-slate-100 animate-fadeIn">
              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-slate-900 text-base">Complaint Registered!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Ticket <strong>#{generatedTicket}</strong> generated. Our Baharagora store supervisor will call or WhatsApp you at <strong>+91 {phone}</strong> within 4 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setShowComplaintForm(false);
                      setDescription('');
                    }}
                    className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Done &amp; Close Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Mobile Phone *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Order ID (Optional)</label>
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g. ORD-10293"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">Issue Category *</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="size_issue">Fitting / Wrong Size Received</option>
                      <option value="defective">Defective / Damaged Fabric / Stitching</option>
                      <option value="different_item">Received Different Color or Product</option>
                      <option value="delayed">Delivery Delay / Rider Not Contactable</option>
                      <option value="refund">AB Coins Refund Not Reflected</option>
                      <option value="other">Other Inquiry / Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Describe the Issue *</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide details of the item and problem..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-amber-500 text-xs resize-none"
                    />
                  </div>

                  {/* Photo Upload Option */}
                  <div>
                    <label className="block mb-1">Attach Item Photo / Receipt (Optional)</label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                        <span>{uploadedProof ? 'Change Photo' : 'Upload Image'}</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                      {uploadedProof && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Attached
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Registering...' : 'Submit Official Complaint'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowComplaintForm(false)}
                      className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 3. Card 2: WhatsApp Chat Support (Matching Screenshot 7) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              OFFICIAL WHATSAPP
            </span>
            <h3 className="text-base font-black text-slate-900 pt-1">WhatsApp Chat Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Connect instantly with our customer support team on WhatsApp for fast assistance and order updates.
            </p>
            <p className="text-xs text-slate-900 font-mono font-bold pt-1">
              📱 Phone / WhatsApp: <span className="text-emerald-700">+91 6207462800</span>
            </p>
          </div>

          <a
            href="https://wa.me/916207462800?text=Hello%20Apka%20Apna%20Bazar%20Support,%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-98"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Chat on WhatsApp (+91 6207462800)</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </a>
        </div>

        {/* 4. Card 3: Direct Phone Call (Matching Screenshot 6) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-black text-slate-900">Direct Phone Call</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Speak directly with our support executive for urgent order cancellations or address updates.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Mon - Sun: 8:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>

          <a
            href="tel:+916207462800"
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Call +91 6207462800</span>
          </a>
        </div>

        {/* 5. Card 4: Email Inquiry (Matching Screenshot 6) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-black text-slate-900">Email Inquiry</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                For corporate orders, vendor inquiries, or feedback, send us an email and we&apos;ll reply within 24 hours.
              </p>
              <p className="text-xs text-slate-700 font-mono font-semibold pt-1">
                ✉️ support@apnabazar.in
              </p>
            </div>
          </div>

          <a
            href="mailto:support@apnabazar.in?subject=Customer%20Support%20Inquiry%20-%20Apka%20Apna%20Bazar"
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 transition-colors"
          >
            <Mail className="w-4 h-4 text-slate-600" />
            <span>Send Email Inquiry</span>
          </a>
        </div>

        {/* 6. Card 5: Frequently Asked Questions (Matching Screenshot 5) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 font-medium">
              Quick answers to common questions regarding fashion orders, quality, and refunds.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Quick Action Contacts Bar */}
        <div className="p-4 rounded-3xl bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <p className="font-bold">Apka Apna Bazar Direct Desk</p>
              <p className="text-[11px] text-slate-400">Dadu Complex, Baharagora (832101)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/916207462800"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>
            <a
              href="tel:+916207462800"
              className="p-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors font-bold"
              title="Call Us"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
