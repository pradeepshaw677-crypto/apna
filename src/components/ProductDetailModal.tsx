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
  HelpCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { api } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';

interface ProductDetailModalProps {
  product: Product | null;
  quantityInCart: number;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onUpdateQuantity: (product: Product, newQty: number) => void;
  onToggleWishlist: (productId: string) => void;
  onBuyNow: (product: Product, size?: string, color?: string) => void;
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
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );

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

  const savingsAmount = product.originalPrice - product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Flipkart / Myntra Multi-Image Gallery */}
        <div className="md:w-1/2 p-4 sm:p-6 bg-slate-50 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
          
          {/* Main Zoomable Image View */}
          <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs zoom-container">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />

            {/* Discount Badge */}
            <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded shadow-sm">
              {product.discountPercent}% OFF
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                isWishlisted ? 'bg-amber-50 text-amber-500' : 'bg-white text-slate-400 hover:text-amber-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-amber-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white ${
                    selectedImageIndex === idx
                      ? 'border-slate-900 ring-2 ring-amber-500/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Desktop Direct Purchase CTA Buttons */}
          <div className="hidden md:grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onAddToCart(product, selectedSize, selectedColor)}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{quantityInCart > 0 ? `In Bag (${quantityInCart})` : 'Add to Bag'}</span>
            </button>

            <button
              onClick={() => {
                onBuyNow(product, selectedSize, selectedColor);
                onClose();
              }}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

        {/* Right Side: Product Details, Specs, Delivery & Reviews */}
        <div className="md:w-1/2 p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Brand & Title */}
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              {product.brand} • {product.subcategory}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 leading-snug">
              {product.name}
            </h2>
            {product.hindiName && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{product.hindiName}</p>
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
              <span className="text-xs font-bold text-amber-600 ml-2">
                ✓ Plus Assured
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-extrabold text-amber-600">
                {product.discountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Inclusive of all taxes • <span className="text-emerald-700">You Save ₹{savingsAmount.toLocaleString('en-IN')}</span>
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Select Size:</span>
                <span className="text-amber-600 font-semibold cursor-pointer hover:underline">
                  Size Guide &amp; Fit
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      selectedSize === size
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Variants */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                Color Variant: <span className="font-normal text-slate-600">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                      selectedColor === color.name ? 'border-amber-500 scale-110 shadow-sm' : 'border-slate-300'
                    }`}
                    title={color.name}
                  >
                    <span className="block w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Pincode Checker */}
          <div className="p-3.5 rounded-xl border border-slate-200 space-y-2.5">
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
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
              >
                {isCheckingPin ? 'Checking...' : 'Check'}
              </button>
            </div>
            {pincodeResult && (
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{pincodeResult.message || `Delivery by ${pincodeResult.deliveryDate}`}</span>
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" /> Free Delivery with Plus
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> 7 Days Hassle-Free Return
              </div>
            </div>
          </div>

          {/* Flipkart / Myntra Style Offers Accordion */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Available Offers</p>
            <div className="text-xs space-y-1.5">
              <div className="flex items-start gap-2 text-slate-700">
                <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Special Price:</strong> Flat ₹200 off with code <strong>APNAFIRST</strong> on checkout.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Bank Offer:</strong> 10% Instant Discount on HDFC &amp; ICICI Bank Cards.</span>
              </div>
            </div>
          </div>

          {/* Product Highlights */}
          {product.highlights && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product Highlights</p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications Table */}
          {product.specifications && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Specifications</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex border-b border-slate-200 last:border-b-0">
                    <span className="w-1/3 bg-slate-50 p-2 font-semibold text-slate-600 border-r border-slate-200">
                      {spec.label}
                    </span>
                    <span className="w-2/3 p-2 text-slate-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Customer Ratings &amp; Reviews</h4>
              <span className="text-xs text-slate-500">{reviews.length} Verified Reviews</span>
            </div>

            {/* Review List */}
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {rev.rating} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      </span>
                      <span className="text-xs font-bold text-slate-900">{rev.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {rev.userName} • <span className="text-emerald-700">✓ Verified Buyer</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleSubmitReview} className="p-3.5 rounded-xl border border-slate-200 space-y-2.5 bg-white">
              <p className="text-xs font-bold text-slate-900">Write a Review for this Product</p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-1 ${newRating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Your Full Name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />

              <textarea
                placeholder="Detailed experience with size, quality, and material..."
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {isSubmittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>

              {reviewSuccess && (
                <p className="text-xs font-bold text-emerald-600">
                  Thank you! Your verified review has been posted.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Mobile Sticky Bottom CTA Bar */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-2 shadow-lg z-20">
          <button
            onClick={() => onAddToCart(product, selectedSize, selectedColor)}
            className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Add to Bag</span>
          </button>

          <button
            onClick={() => {
              onBuyNow(product, selectedSize, selectedColor);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
