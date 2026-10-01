import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Heart, 
  ShoppingBag, 
  Truck, 
  Tag, 
  Check, 
  MapPin, 
  Clock, 
  Camera, 
  ThumbsUp, 
  Share2, 
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Ruler,
  BadgeCheck,
  Banknote
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { api } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';
import { getSizePriceDelta, formatINR } from '../utils/pricing';

interface ProductDetailModalProps {
  product: Product | null;
  quantityInCart: number;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: string, priceOverride?: number) => void;
  onUpdateQuantity: (product: Product, newQty: number) => void;
  onToggleWishlist: (productId: string) => void;
  onBuyNow: (product: Product, size?: string, color?: string, priceOverride?: number) => void;
  pincode: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  quantityInCart,
  isWishlisted,
  onClose,
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
  onBuyNow,
  pincode,
}) => {
  if (!product) return null;

  // Selected Variant states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );

  // Expanded details toggle ("view all details")
  const [isFullDetailsOpen, setIsFullDetailsOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Delivery Pincode Checker state
  const [pincodeInput, setPincodeInput] = useState(pincode || '832101');
  const [pincodeResult, setPincodeResult] = useState<{
    eligible?: boolean;
    deliveryDate?: string;
    message?: string;
  } | null>(null);
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [uploadedReviewImage, setUploadedReviewImage] = useState<string | null>(null);

  // Gallery images array
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  // Dynamic Size Price Adjustment
  const sizeDelta = getSizePriceDelta(selectedSize);
  const currentPrice = product.price + sizeDelta;
  const currentOriginalPrice = product.originalPrice + sizeDelta;
  const savingsAmount = Math.max(0, currentOriginalPrice - currentPrice);

  // Fetch reviews on mount
  useEffect(() => {
    let isMounted = true;
    api.getReviews(product.id).then((revs) => {
      if (isMounted) setReviews(revs);
    });
    return () => { isMounted = false; };
  }, [product.id]);

  // Initial pincode check
  useEffect(() => {
    if (pincodeInput) {
      api.checkPincode(pincodeInput).then(setPincodeResult);
    }
  }, []);

  const handleCheckPincode = async () => {
    if (!pincodeInput) return;
    setIsCheckingPin(true);
    const res = await api.checkPincode(pincodeInput);
    setPincodeResult(res);
    setIsCheckingPin(false);
  };

  const handleSelectColor = (colorName: string, imageIndex?: number) => {
    setSelectedColor(colorName);
    if (typeof imageIndex === 'number' && galleryImages[imageIndex]) {
      setSelectedImageIndex(imageIndex);
    }
  };

  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await uploadToCloudinary(file, "reviews");
      setUploadedReviewImage(res.url);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview(product.id, {
        rating: newRating,
        title: "Verified Customer Review",
        comment: reviewComment,
        userName: reviewerName,
        images: uploadedReviewImage ? [uploadedReviewImage] : [],
      });
      setReviews([res, ...reviews]);
      setReviewComment('');
      setReviewerName('');
      setUploadedReviewImage(null);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Shop ${product.name} on Apna Bazar for ${formatINR(currentPrice)}! 100% Cash on Delivery & 5-Day Returns.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-700 transition-colors shadow-md border border-slate-200 cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Multi-Image Gallery */}
        <div className="md:w-1/2 p-4 sm:p-6 bg-slate-50 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
          
          {/* Main Zoomable Image View */}
          <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs zoom-container">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Discount Badge */}
            {product.discountPercent > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-amber-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-sm">
                ⚡ {product.discountPercent}% OFF
              </div>
            )}

            {/* Top action icons */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/90 text-slate-600 hover:text-slate-950 shadow-md cursor-pointer transition-transform active:scale-90"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-2 rounded-full shadow-md transition-all cursor-pointer ${
                  isWishlisted ? 'bg-rose-50 text-rose-500 scale-105' : 'bg-white/90 text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-xs scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}

          {/* Desktop Direct Purchase CTA Buttons */}
          <div className="hidden md:grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onAddToCart(product, selectedSize, selectedColor, currentPrice)}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{quantityInCart > 0 ? `In Bag (${quantityInCart})` : `Add to Bag (${formatINR(currentPrice)})`}</span>
            </button>

            <button
              onClick={() => {
                onBuyNow(product, selectedSize, selectedColor, currentPrice);
                onClose();
              }}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-98 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now (COD)</span>
            </button>
          </div>
        </div>

        {/* Right Side: Product Details, Specs, Delivery & Reviews */}
        <div className="md:w-1/2 p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Brand & Title */}
          <div>
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
              {product.brand} • {product.subcategory || product.category}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
              {product.name}
            </h2>
            {product.hindiName && (
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{product.hindiName}</p>
            )}

            {/* Rating Pill */}
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {product.reviewsCount.toLocaleString('en-IN')} Ratings &amp; Reviews
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ✓ 100% Genuine
              </span>
            </div>
          </div>

          {/* Pricing Row: Dynamic Size-Adjusted Price */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatINR(currentPrice)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatINR(currentOriginalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-sm font-extrabold text-rose-600">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Inclusive of all taxes • {savingsAmount > 0 && <span className="text-amber-800 font-bold">You Save {formatINR(savingsAmount)}</span>}
            </p>
          </div>

          {/* Size Selector with Price Differences */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-900">
                  Select Size: <span className="font-normal text-slate-500">({selectedSize})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                  className="text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart &amp; Fit Guide</span>
                </button>
              </div>

              {/* Size guide popup chart */}
              {isSizeGuideOpen && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span>Standard India Fit Chart</span>
                    <button onClick={() => setIsSizeGuideOpen(false)} className="text-amber-700 text-xs">✕</button>
                  </div>
                  <table className="w-full text-[11px] text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-amber-200 text-left font-bold">
                        <th className="py-1">Size</th>
                        <th className="py-1">Chest/Waist</th>
                        <th className="py-1">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-amber-100"><td>S / 38</td><td>38 inches</td><td>27 inches</td></tr>
                      <tr className="border-b border-amber-100"><td>M / 40</td><td>40 inches</td><td>28 inches</td></tr>
                      <tr className="border-b border-amber-100"><td>L / 42</td><td>42 inches</td><td>29 inches</td></tr>
                      <tr><td>XL / 44</td><td>44 inches</td><td>30 inches</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((size) => {
                  const delta = getSizePriceDelta(size);
                  const isCurrent = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span>{size}</span>
                      {delta > 0 && (
                        <span className={`text-[10px] ${isCurrent ? 'text-amber-300 font-normal' : 'text-slate-500'}`}>
                          (+₹{delta})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Variants */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">
                Color Variant: <span className="font-normal text-slate-600">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color, i) => (
                  <button
                    key={color.name}
                    onClick={() => handleSelectColor(color.name, color.imageIndex ?? i)}
                    className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                      selectedColor === color.name ? 'border-amber-500 scale-110 shadow-sm ring-2 ring-amber-400/40' : 'border-slate-300'
                    }`}
                    title={color.name}
                  >
                    <span className="block w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5-Day Return & Delivery Speed Callouts */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                <span>5-Day Hassle-Free Returns with OTP</span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full">
                Guaranteed
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              If the size doesn&apos;t fit or you wish to exchange, simply initiate return from the Orders page within 5 days of delivery. A 6-digit Return OTP will be provided for pickup.
            </p>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              Delivery Options &amp; Speed
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pincodeInput}
                maxLength={6}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleCheckPincode}
                disabled={isCheckingPin}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                {isCheckingPin ? 'Checking...' : 'Check'}
              </button>
            </div>
            {pincodeResult && (
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{pincodeResult.message}</span>
              </p>
            )}
          </div>

          {/* Product Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Key Highlights
              </h4>
              <ul className="space-y-1.5">
                {product.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expandable "View All Details" Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsFullDetailsOpen(!isFullDetailsOpen)}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors cursor-pointer"
            >
              <span>View Full Product Specifications &amp; Care</span>
              {isFullDetailsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {isFullDetailsOpen && (
              <div className="p-4 space-y-4 bg-white border-t border-slate-200 text-xs">
                <div>
                  <h5 className="font-bold text-slate-900 mb-1">Product Description</h5>
                  <p className="text-slate-600 leading-relaxed">{product.description}</p>
                </div>

                {product.specifications && product.specifications.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-900 mb-2">Specifications</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.specifications.map((spec, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">{spec.label}</span>
                          <span className="font-semibold text-slate-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verified Customer Reviews Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>Customer Reviews ({reviews.length})</span>
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating} / 5</span>
              </span>
            </h4>

            {/* Existing Reviews List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleSubmitReview} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block">Write a Review</span>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Your Name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />

              <textarea
                placeholder="Detailed feedback regarding fabric, comfort, sizing, or finish..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />

              <div className="flex items-center justify-between">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>{uploadedReviewImage ? 'Photo attached ✓' : 'Upload photo'}</span>
                  <input type="file" accept="image/*" onChange={handleReviewPhotoUpload} className="hidden" />
                </label>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>

              {reviewSuccess && (
                <p className="text-xs font-bold text-amber-800 bg-amber-50 p-1.5 rounded">
                  Thank you! Your verified review has been posted.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Mobile Sticky Bottom CTA Bar */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-2 shadow-lg z-20">
          <button
            onClick={() => onAddToCart(product, selectedSize, selectedColor, currentPrice)}
            className="py-3 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Bag ({formatINR(currentPrice)})</span>
          </button>

          <button
            onClick={() => {
              onBuyNow(product, selectedSize, selectedColor, currentPrice);
              onClose();
            }}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Buy Now (COD)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
