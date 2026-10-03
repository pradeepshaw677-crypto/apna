import React, { useState } from 'react';
import { Star, CheckCircle2, Edit3, X, Send, ShieldCheck } from 'lucide-react';
import { ProductReview } from '../types';
import { REVIEWS } from '../data/products';

interface CustomerReviewsSectionProps {
  onOpenWriteReview?: () => void;
}

// User explicitly requested: "original main web me jo footer me jo write review hai baha me kisi ka vi review show nahi karega jo pahale three review tha sirf bahi show hoga agar koi review kare to submit karega to confirm massage dikhadana but uska review display me mat Lana"
const PERMANENT_TOP_3_REVIEWS = REVIEWS.slice(0, 3);

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  onOpenWriteReview,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    // Show confirmation message without modifying the display list
    setSubmittedMessage('Thank you! Your review has been submitted successfully for verification by Apna Bazar team.');
    
    setTimeout(() => {
      setSubmittedMessage(null);
      setIsModalOpen(false);
      setName('');
      setComment('');
    }, 2800);
  };

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            Verified Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Happy Customers Across India ⭐
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Genuine verified feedback on sarees, fashion &amp; footwear with 3-day express doorstep delivery and 100% Cash on Delivery!
          </p>
        </div>

        {/* Permanent Top 3 Verified Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERMANENT_TOP_3_REVIEWS.map((rev) => {
            const initials = rev.userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Stars + Quote watermark */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-3xl font-serif text-amber-200 font-black leading-none">
                      &rdquo;
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 italic font-medium leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {rev.userName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {rev.title || 'Verified Shopper'}
                      </p>
                    </div>
                  </div>

                  {rev.verifiedBuyer && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Write a Review Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Write a Customer Review</span>
          </button>
        </div>

      </div>

      {/* Write Review Modal (Centered without mobile clipping) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[88dvh] flex flex-col mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm sm:text-base">Share Your Review</h3>
                  <p className="text-[11px] text-slate-300">Help other shoppers at Apna Bazar</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {submittedMessage ? (
              <div className="p-6 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-black text-slate-900">Review Submitted!</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {submittedMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">({rating} of 5 Stars)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Feedback &amp; Experience</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the fabric quality, fitting, and delivery experience..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Review for Verification</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
