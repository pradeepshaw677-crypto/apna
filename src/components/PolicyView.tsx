import React from 'react';
import { ArrowLeft, Clock, FileText, ShieldCheck, CheckCircle2, Lock, RotateCcw, Truck, HelpCircle } from 'lucide-react';

interface PolicyViewProps {
  policyType: 'about' | 'shipping' | 'returns' | 'cancellation' | 'terms' | 'privacy' | 'disclaimer';
  onBackToShop: () => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({ policyType, onBackToShop }) => {
  const getPolicyContent = () => {
    switch (policyType) {
      case 'about':
        return {
          title: 'About Us',
          readTime: '2 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <h3 className="text-base font-black text-slate-900">
                Welcome to Apna Bazar – India&apos;s Favorite Superstore
              </h3>
              <p>
                Apna Bazar (apkaapnabazar.in) is India&apos;s premier multi-category digital superstore bringing curated high-fashion, authentic Banarasi &amp; ethnic sarees, luxury sneakers, streetwear apparel, high-speed toys, and lifestyle accessories directly from certified manufacturers to your doorstep at true wholesale prices.
              </p>
              <p>
                Headquartered at Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101, we bridge regional craftspeople, national textile mills, and top streetwear hubs with consumers across India through modern digital infrastructure, secure OTP-verified deliveries, and transparent cash-on-delivery services.
              </p>
              <h4 className="font-bold text-slate-900 pt-2">Our Core Pillars</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>100% Brand Authenticity:</strong> Every piece undergoes strict quality and stitching inspections before dispatch.</li>
                <li><strong>5-Day Hassle-Free Returns:</strong> Try at home with complete peace of mind. Easy doorstep reverse pickup.</li>
                <li><strong>Express Delivery:</strong> Rapid delivery network with real-time live map tracking and 6-digit delivery OTP protection.</li>
                <li><strong>Transparent Cash on Delivery:</strong> Pay only when you hold your parcel in your hands.</li>
                <li><strong>Enterprise-Grade Security:</strong> HttpOnly secure session cookies, zero token leakage, and strict DPDP Act compliance.</li>
              </ul>
            </div>
          ),
        };

      case 'returns':
        return {
          title: '5-Day Refund & Returns Policy',
          readTime: '3 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 font-bold flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
                <span>5-Day Hassle-Free Doorstep Return Guarantee on Fashion, Footwear &amp; Lifestyle</span>
              </div>
              <p className="font-semibold text-slate-800">
                At Apna Bazar, customer happiness is non-negotiable. If you receive an item and the size doesn&apos;t fit, color differs, or you are simply not satisfied with the quality, you are protected by our 5-Day Hassle-Free Return Policy.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Return Window</h4>
                <p className="text-slate-600 mt-1">
                  You can initiate a return or exchange within <strong>5 calendar days</strong> from the date the package is delivered to you (verified by delivery timestamp).
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Eligible Return Reasons</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
                  <li>Size or fit issue (e.g. shirt, shoes, or kids&apos; clothing fit).</li>
                  <li>Received wrong product, size, or color variant.</li>
                  <li>Defective stitching, fabric damage, or transit blemish.</li>
                  <li>Missing accessories, belts, or unstitched blouse pieces.</li>
                  <li>Package or seal arrived unsealed or damaged.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. Return Conditions</h4>
                <p className="text-slate-600 mt-1">
                  Returned products must be in their original, unwashed, and undamaged condition with all original price tags, brand labels, and packaging intact.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">4. Refund Processing &amp; Payout Timelines</h4>
                <p className="text-slate-600 mt-1">
                  Once your returned package is picked up by our courier partner and passes basic verification:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
                  <li><strong>AB Coins Wallet:</strong> Instant refund credited within 10 minutes (with 100% redemption on future orders).</li>
                  <li><strong>Original Bank / UPI / Card:</strong> Refund credited directly to your bank account or UPI ID within 24 to 48 business hours.</li>
                  <li><strong>Cash on Delivery Orders:</strong> Customer can choose between instant AB Coins or provide their UPI ID / Bank IFSC for a direct NEFT/IMPS transfer.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">5. How to Request a Return</h4>
                <p className="text-slate-600 mt-1">
                  Go to <strong>My Orders</strong> &gt; Select your order &gt; Click <strong>&ldquo;Return Item&rdquo;</strong>. Choose your reason, upload a photo if defective, and submit. Our support team (+91 9999999999) schedules reverse pickup within 24 hours.
                </p>
              </div>
            </div>
          ),
        };

      case 'privacy':
        return {
          title: 'Privacy Policy & Data Security',
          readTime: '3 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Compliant with India&apos;s Digital Personal Data Protection (DPDP) Act 2023</span>
              </div>
              <p className="font-semibold text-slate-800">
                Apna Bazar (&ldquo;apkaapnabazar.in&rdquo;) respects and protects your digital privacy. We uphold strict architectural security rules ensuring that your sensitive data is never shared, sold, or exposed.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Information We Collect</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
                  <li><strong>Identity &amp; Contact:</strong> Mobile Phone Number (for WhatsApp/SMS 6-digit OTP login) and Optional Customer Name.</li>
                  <li><strong>Delivery Details:</strong> Street address, landmark, pincode, and optional GPS delivery pin to ensure accurate doorstep delivery.</li>
                  <li><strong>Order History:</strong> Ordered products, chosen sizes, colors, invoice records, and delivery OTP status.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Zero Sensitive Token Leakage</h4>
                <p className="text-slate-600 mt-1">
                  Authentication is strictly managed via cryptographically signed <strong>HttpOnly, SameSite=Strict cookies</strong> (<code className="bg-slate-100 px-1 rounded text-slate-900">__Host-cust_session</code>). Tokens are never accessible to client-side scripts, browser extensions, or localStorage, completely thwarting XSS session hijacking.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. OTP &amp; WhatsApp Privacy</h4>
                <p className="text-slate-600 mt-1">
                  OTPs are salted and hashed using cryptographic HMAC-SHA256 before database insertion. Raw OTPs are never stored in plain text, never returned in API payloads, and never logged.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">4. Third-Party Sharing</h4>
                <p className="text-slate-600 mt-1">
                  We <strong>NEVER sell, rent, or monetize</strong> customer contact information to advertisers. Data is exclusively shared with authorized delivery associates for physical parcel delivery.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">5. Right to Erasure</h4>
                <p className="text-slate-600 mt-1">
                  Under DPDP Act guidelines, customers have the right to request deletion of their profile and address book by contacting our Data Protection Officer at support@apkaapnabazar.in or helpline 9999999999.
                </p>
              </div>
            </div>
          ),
        };

      case 'cancellation':
        return {
          title: 'Order Cancellation Policy',
          readTime: '2 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <p className="font-semibold text-slate-800">
                We believe in providing flexibility. If you made a mistake or want to alter your order, you can cancel transparently.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Instant Online Cancellation</h4>
                <p className="text-slate-600 mt-1">
                  You can cancel your order directly from your <strong>Orders</strong> screen at any time while the order status is <strong>&ldquo;Placed&rdquo;</strong> or <strong>&ldquo;Confirmed&rdquo;</strong> before it has been dispatched from our regional fulfillment warehouse.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Cancellation After Dispatch</h4>
                <p className="text-slate-600 mt-1">
                  Once an order is handed over to our delivery associate and is &ldquo;Out for Delivery&rdquo;, online cancellation is disabled. However, you can politely decline to accept the order at your doorstep when the delivery partner arrives.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. AB Coins &amp; Coupons Restoration</h4>
                <p className="text-slate-600 mt-1">
                  If an order is cancelled, any AB Coins redeemed for the purchase are automatically refunded back to your wallet immediately, and any applied coupon code is released for future use.
                </p>
              </div>
            </div>
          ),
        };

      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          readTime: '2 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <p className="font-semibold text-slate-800">
                Apna Bazar delivers across all pin codes in India with dedicated express routing.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Delivery Timeline</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
                  <li><strong>Local Express Delivery (Baharagora &amp; Surrounding 10km):</strong> 15 to 45 minutes doorstep fulfillment.</li>
                  <li><strong>Regional Express (Jharkhand, West Bengal, Odisha):</strong> 1 to 2 business days.</li>
                  <li><strong>Pan-India Standard Shipping:</strong> 3 to 5 business days with major courier networks (Bluedart, Delhivery, Xpressbees).</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Delivery Charges</h4>
                <p className="text-slate-600 mt-1">
                  - Orders above <strong>₹499</strong>: 100% <strong>FREE Delivery</strong>.<br />
                  - Orders below ₹499: Nominal flat shipping fee of ₹40 applies.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. OTP Verification at Doorstep</h4>
                <p className="text-slate-600 mt-1">
                  To prevent fraudulent handovers and protect customer orders, a unique 6-digit delivery OTP is generated upon dispatch. Only share this OTP with the delivery executive after receiving and inspecting your parcel exterior.
                </p>
              </div>
            </div>
          ),
        };

      case 'terms':
        return {
          title: 'Terms of Service',
          readTime: '3 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <p className="font-semibold text-slate-800">
                By accessing or placing orders on Apna Bazar (&ldquo;apkaapnabazar.in&rdquo;), you agree to be bound by these Terms of Service in compliance with the Consumer Protection (E-Commerce) Rules, 2020.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Account &amp; Verification</h4>
                <p className="text-slate-600 mt-1">
                  Users authenticate via mobile phone OTP. You agree to provide accurate delivery information. Misuse of the platform, spam orders, or fraudulent refusal of confirmed COD packages may result in account restriction.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Product Warranties &amp; Descriptions</h4>
                <p className="text-slate-600 mt-1">
                  We strive to provide accurate photographs, fabric specifications, and size guides. Variations in monitor color calibrations may produce minor color differences. Handloom sarees may have slight natural weaving irregularities which are hallmarks of authentic craftsmanship.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. Pricing &amp; Stock Limits</h4>
                <p className="text-slate-600 mt-1">
                  All listed prices include GST and applicable taxes. We reserve the right to limit quantities per customer during high-demand festival flash sales.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">4. Dispute Resolution</h4>
                <p className="text-slate-600 mt-1">
                  Any disputes are subject to the exclusive jurisdiction of the competent courts in Ghatshila / Jamshedpur, Jharkhand.
                </p>
              </div>
            </div>
          ),
        };

      case 'disclaimer':
      default:
        return {
          title: 'Disclaimer',
          readTime: '2 min read',
          updated: 'November 3, 2026',
          content: (
            <div className="space-y-4 text-slate-700">
              <p className="font-semibold text-slate-800">
                Official legal and operational disclaimers for Apna Bazar e-commerce operations.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Brand Trademarks</h4>
                <p className="text-slate-600 mt-1">
                  All brand names, trademarks, logos, and product designs mentioned on this platform (such as Snitch, Campus, Puma, Adidas, Cantabil, Safari, etc.) belong to their respective copyright and trademark owners. Apna Bazar is an independent retail distributor of genuine branded merchandise.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Service Availability</h4>
                <p className="text-slate-600 mt-1">
                  While we strive for 99.9% uptime and express delivery schedules, delivery timelines may be influenced by adverse weather, road closures, or public holidays.
                </p>
              </div>
            </div>
          ),
        };
    }
  };

  const { title, readTime, updated, content } = getPolicyContent();

  return (
    <div className="min-h-screen bg-slate-950 text-white py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Back Link */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&larr; Back to Apna Bazar Superstore</span>
        </button>

        {/* Page Title & Meta */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-amber-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Last Updated: {updated}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime}</span>
            </span>
          </div>
        </div>

        {/* Content Sheet */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-xs sm:text-sm leading-relaxed border border-slate-200">
          <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl flex items-center justify-between">
            <span className="font-mono text-xs font-black text-amber-950">
              Verified Legal &amp; Customer Trust Documentation • Apna Bazar
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>

          {content}

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Apna Bazar Customer Care</p>
              <p>Helpline: +91 9999999999 • Dadu Complex, Baharagora 832101</p>
            </div>
            <button
              onClick={onBackToShop}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
