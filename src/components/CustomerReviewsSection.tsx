import React, { useState } from 'react';
import { Star, CheckCircle2, Edit3, X, Send } from 'lucide-react';
import { ProductReview } from '../types';
import { REVIEWS } from '../data/products';

interface CustomerReviewsSectionProps {
  onOpenWriteReview?: () => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  onOpenWriteReview,
}) => {
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: 'general',
      userId: `usr-${Date.now()}`,
      userName: name.trim(),
      rating,
      title: 'Verified Baharagora Customer',
      comment: comment.trim(),
      createdAt: Date.now(),
      verifiedBuyer: true,
      helpfulCount: 1,
    };

    setReviewsList([newRev, ...reviewsList]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setName('');
      setComment('');
    }, 1500);
  };

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header matching screenshot */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            Trusted By
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hundreds of Happy Customers in Baharagora ⭐
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Real feedback from verified buyers who enjoy fresh organic groceries every day.
          </p>
        </div>

        {/* Reviews Cards Grid matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsList.map((rev) => {
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

                {/* Customer Pill matching screenshot */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                      <span>{rev.userName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Baharagora, Jharkhand
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Write a Review Button matching screenshot */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Write a Review</span>
          </button>
        </div>

      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Share Your Experience</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-black text-slate-900 text-sm">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-500">Your review is now live for shoppers in Baharagora.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block mb-1">Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Your Review in English / Hindi *</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe product freshness, packaging, and delivery speed..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Verified Review</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
