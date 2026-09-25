import React from 'react';
import { ArrowLeft, Clock, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
          readTime: '1 min read',
          updated: 'August 3, 2026',
          content: (
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Welcome to Apna Bazar
              </h3>
              <p>
                Apna Bazar is your trusted neighborhood superstore, committed to providing high-quality products at affordable prices. Located at Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101, we offer a wide range of groceries, daily essentials, packaged foods, beverages, personal care products, household items, and much more - all under one roof.
              </p>
              <p>
                Our goal is simple: to make grocery shopping easy, convenient, and affordable for every family. Whether you visit our store or order online, we focus on delivering genuine products, competitive prices, and excellent customer service.
              </p>
              <h4 className="font-bold text-slate-900 pt-2">Why Shop With Us?</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Local Presence:</strong> Rooted in Baharagora, understanding local preferences.</li>
                <li><strong>15-Min Express Delivery:</strong> Quick doorstep service across all local zones.</li>
                <li><strong>Genuine Products:</strong> Sourced directly from reputed manufacturers (Godrej, Lipton, Tata, Aashirvaad).</li>
                <li><strong>Best Prices:</strong> Everyday wholesale and retail discounts with Cash on Delivery.</li>
              </ul>
            </div>
          ),
        };

      case 'cancellation':
        return {
          title: 'Cancellation Policy',
          readTime: '2 min read',
          updated: 'August 3, 2026',
          content: (
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">
                At Apna Bazar, customers can cancel their orders within 5 minutes of placing the order.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Order Cancellation Window</h4>
                <p className="text-slate-600 mt-1">
                  Customers can cancel their order within 5 minutes from the time the order is successfully placed. After 5 minutes, the cancellation option will be automatically disabled as the order enters the packing, verification, and dispatch stage at our Baharagora hub. Once packed or out for delivery, orders cannot be cancelled.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. How to Cancel</h4>
                <p className="text-slate-600 mt-1">
                  Customers can cancel their order directly from the website within the 5-minute cancellation window by clicking the &ldquo;Cancel Order&rdquo; button on their order card in the Orders section.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. Cancellation by Apna Bazar</h4>
                <p className="text-slate-600 mt-1">
                  We reserve the right to cancel any order due to unforeseen circumstances, stock unavailability, or delivery limitations. If cancelled by us, immediate notification is sent via WhatsApp or phone.
                </p>
              </div>
            </div>
          ),
        };

      case 'returns':
        return {
          title: 'Refund & Returns Policy',
          readTime: '2 min read',
          updated: 'August 3, 2026',
          content: (
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">
                At Apna Bazar, customer satisfaction is our top priority. If you are not satisfied with your order, please read our refund policy below.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Eligible for Refund or Replacement</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
                  <li>Wrong product is delivered.</li>
                  <li>Product is damaged or opened during delivery transit.</li>
                  <li>Product is near or past its expiry date.</li>
                  <li>Item is missing from the delivered package.</li>
                  <li>Order is cancelled by Apna Bazar.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Non-Refundable Cases</h4>
                <p className="text-slate-600 mt-1">
                  Refunds will not be provided if the product has been opened or used (unless defective), or if customer changes their mind after successful delivery and OTP confirmation.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. Doorstep Inspection</h4>
                <p className="text-slate-600 mt-1">
                  Customers are encouraged to inspect all groceries at the time of delivery before sharing the 6-digit delivery OTP with our courier associate.
                </p>
              </div>
            </div>
          ),
        };

      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          readTime: '2 min read',
          updated: 'August 5, 2026',
          content: (
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">
                Welcome to Apna Bazar. We are committed to delivering your grocery orders safely, hygienically, and swiftly.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Delivery Service Areas</h4>
                <p className="text-slate-600 mt-1">
                  Apna Bazar currently delivers across Baharagora town, nearby colleges, markets, and surrounding residential zones within a 10km radius from our Dadu Complex center.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Delivery Timeframes &amp; Slots</h4>
                <p className="text-slate-600 mt-1">
                  - <strong>15-Min Express Delivery:</strong> For immediate essentials and snacks during store hours (7:30 AM to 9:30 PM).<br />
                  - <strong>Next Morning Delivery (9 AM - 12 PM):</strong> For evening orders placed after 9:30 PM.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. Delivery Charges</h4>
                <p className="text-slate-600 mt-1">
                  Delivery is completely <strong>FREE</strong> on all orders above ₹499. Nominal delivery fees of ₹20-₹40 may apply for lower value orders.
                </p>
              </div>
            </div>
          ),
        };

      case 'terms':
        return {
          title: 'Terms and Conditions',
          readTime: '2 min read',
          updated: 'August 4, 2026',
          content: (
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">
                Welcome to The Grocery Hub. By accessing or using our website, you agree to comply with and be bound by the following terms.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Acceptance of Terms</h4>
                <p className="text-slate-600 mt-1">
                  By using this website or placing orders, you agree to these terms and conditions. If you disagree with any part, please refrain from using our service.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Products &amp; Pricing</h4>
                <p className="text-slate-600 mt-1">
                  All products are subject to availability. Prices may change without prior notice. Product images are for reference; actual packaging and design may slightly vary according to manufacturer updates.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">3. Orders &amp; COD Payment</h4>
                <p className="text-slate-600 mt-1">
                  Orders are confirmed upon placement. For Cash on Delivery, payment must be handed over in cash or scanned via UPI to the delivery executive upon OTP verification.
                </p>
              </div>
            </div>
          ),
        };

      case 'privacy':
        return {
          title: 'Privacy Policy',
          readTime: '2 min read',
          updated: 'August 3, 2026',
          content: (
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">
                Your privacy is paramount to us. This Privacy Policy explains how The Grocery Hub collects, uses, and safeguards your information.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">1. Information We Collect</h4>
                <p className="text-slate-600 mt-1">
                  When you place an order, we collect your Full Name, Mobile Phone Number, Delivery Address, Landmark, and Order History to facilitate accurate fulfillment.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">2. Data Security &amp; Sharing</h4>
                <p className="text-slate-600 mt-1">
                  We do not sell, rent, or trade your personal information to third parties. Customer data is strictly used for dispatching orders and sending transactional delivery alerts.
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
          updated: 'August 3, 2026',
          content: (
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">
                Welcome to The Grocery Hub. The information provided on this website is for general informational and shopping purposes only.
              </p>
              <div>
                <h4 className="font-bold text-slate-900">Product Information Disclaimer</h4>
                <p className="text-slate-600 mt-1">
                  While we strive to keep all product information accurate, manufacturer packaging, ingredients, and nutrition facts may change. Customers are advised to read labels, warnings, and directions before using or consuming a product.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Pricing &amp; Availability</h4>
                <p className="text-slate-600 mt-1">
                  Prices and stock availability are subject to daily market fluctuations. We make every effort to display accurate pricing at all times.
                </p>
              </div>
            </div>
          ),
        };
    }
  };

  const { title, readTime, updated, content } = getPolicyContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Back Link */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home &gt; {title.toUpperCase()}</span>
        </button>

        {/* Page Title & Meta matching screenshot */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Last Updated: {updated}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime}</span>
            </span>
          </div>
        </div>

        {/* Content Sheet matching screenshot */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-xs sm:text-sm leading-relaxed">
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-emerald-900">
              Official Policy Documentation • Apna Bazar
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          {content}

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <span>Dadu Complex, Near Shitla Mandir, Baharagora, 832101</span>
            <button
              onClick={onBackToShop}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl w-fit transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
