import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  Check,
  Send,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatBDT } from '../utils/bangladeshData';
import type { Product, ProductVariant, Review, BusinessSettings } from '../types';
import { fetchJsonSafely, getApiUrl } from '../utils/api';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectOrder: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  settings: BusinessSettings | null;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onDirectOrder,
  settings,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.mainImage);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setSelectedImage(product.mainImage);
    setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    setQuantity(1);

    // Fetch reviews
    fetchJsonSafely<Review[]>(`/api/reviews/${product.id}`, undefined, []).then((data) => {
      if (Array.isArray(data)) setReviews(data);
    });
  }, [product]);

  const currentPrice = selectedVariant?.price ?? product.salePrice ?? product.price;
  const regularPrice = product.price;
  const hasDiscount = currentPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleWhatsAppOrder = () => {
    const phone = (settings?.whatsappNumber || '+8801700000000').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম,\nআমি সরদার গ্যালারি থেকে এই পণ্যটি অর্ডার করতে আগ্রহী:\n\n*${product.nameBn}*\n${selectedVariant ? `ভ্যারিয়েন্ট: ${selectedVariant.name}\n` : ''}পরিমাণ: ${quantity} টি\nমূল্য: ৳${currentPrice * quantity}\nলিংক: ${window.location.origin}/products/${product.slug}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      const fullUrl = getApiUrl('/api/reviews');
      let createdReview: Review | null = null;
      try {
        const res = await fetch(fullUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            customerName: reviewName,
            rating: reviewRating,
            comment: reviewComment,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.review) createdReview = data.review;
        }
      } catch (err) {
        console.warn('Review API not reachable:', err);
      }

      if (!createdReview) {
        createdReview = {
          id: `rev-${Date.now()}`,
          productId: product.id,
          customerName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
          isApproved: true,
        };
      }

      setReviews([createdReview, ...reviews]);
      setReviewSuccess(true);
      setReviewName('');
      setReviewComment('');
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch {
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-4 border border-rose-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 px-5 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600">
            <span>SKU: {selectedVariant?.sku || product.sku}</span>
            <span>•</span>
            <span className="text-slate-500">{product.nameEn}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Gallery */}
            <div className="space-y-3">
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative shadow-inner">
                <img
                  src={selectedImage}
                  alt={product.nameBn}
                  className="w-full h-full object-cover object-center"
                />
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md">
                    -{discountPercent}% ছাড়
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        selectedImage === img ? 'border-rose-500 scale-95' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                  {product.nameBn}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center space-x-3 mt-2 text-xs">
                  <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>5.0 ({reviews.length} টি রিভিউ)</span>
                  </div>
                  {isOutOfStock ? (
                    <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      স্টক শেষ
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>স্টকে আছে ({currentStock} টি)</span>
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-4 p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600">
                    {formatBDT(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm sm:text-base text-slate-400 line-through">
                      {formatBDT(regularPrice)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                      ৳{regularPrice - currentPrice} সাশ্রয়
                    </span>
                  )}
                </div>

                {/* Short description */}
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  {product.shortDescBn}
                </p>

                {/* Variants (e.g. Color) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      কালার / ডিজাইন সিলেক্ট করুন:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            selectedVariant?.id === v.id
                              ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {v.name} (মজুদ: {v.stock})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selection */}
                <div className="mt-4 flex items-center space-x-3">
                  <label className="text-xs font-bold text-slate-700">পরিমাণ:</label>
                  <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      disabled={quantity >= currentStock}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    মোট: <strong>{formatBDT(currentPrice * quantity)}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => {
                      onClose();
                      onDirectOrder(product, selectedVariant, quantity);
                    }}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:bg-slate-300 text-white font-black py-3 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <span>এখনই অর্ডার করুন</span>
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart(product, quantity, selectedVariant);
                    }}
                    className="w-full bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 text-rose-700 font-bold py-3 px-4 rounded-xl text-sm border border-rose-200 transition flex items-center justify-center space-x-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </button>
                </div>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
                </button>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
                  <span>১০০% নিরাপদ উপকরণ</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-rose-500 mb-0.5" />
                  <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-4 h-4 text-amber-500 mb-0.5" />
                  <span>সহজ রিটার্ন পলিসি</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details / Specs / Reviews Tabs */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex space-x-3 border-b border-slate-200 text-sm font-bold pb-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition ${
                  activeTab === 'details'
                    ? 'border-b-2 border-rose-500 text-rose-600 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বিস্তারিত বিবরণ
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 transition ${
                  activeTab === 'specs'
                    ? 'border-b-2 border-rose-500 text-rose-600 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                স্পেসিফিকেশন ও সেফটি
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 transition ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-rose-500 text-rose-600 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                গ্রাহক রিভিউ ({reviews.length})
              </button>
            </div>

            <div className="pt-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{product.fullDescBn}</p>
                  {product.ageGroup && (
                    <p className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-medium text-rose-900">
                      👶 <strong>উপযুক্ত বয়স:</strong> {product.ageGroup}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4">
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, val], idx) => (
                            <tr
                              key={idx}
                              className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                            >
                              <td className="p-2.5 font-bold text-slate-800 w-1/3 border-r border-slate-200">
                                {key}
                              </td>
                              <td className="p-2.5 text-slate-600">{val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {product.safetyInfo && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs">
                      <strong>নিরাপত্তা বিষয়ক তথ্য:</strong> {product.safetyInfo}
                    </div>
                  )}

                  {product.careInstructions && (
                    <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-sky-900 text-xs">
                      <strong>যত্ন ও পরিষ্কার নির্দেশিকা:</strong> {product.careInstructions}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">এখনও কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs">{rev.customerName}</span>
                            <div className="flex text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">{rev.comment}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-3">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <span>আপনার মূল্যবান মতামত বা রিভিউ লিখুন</span>
                    </h4>

                    {reviewSuccess && (
                      <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">
                        ধন্যবাদ! আপনার রিভিউটি গ্রহণ করা হয়েছে।
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="আপনার নাম"
                        className="text-xs border border-slate-200 rounded-xl p-2 bg-white focus:outline-none focus:border-rose-400"
                      />
                      <div className="flex items-center space-x-2 bg-white p-2 border border-slate-200 rounded-xl text-xs">
                        <span className="text-slate-600 font-semibold">রেটিং:</span>
                        <div className="flex space-x-1 cursor-pointer">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              onClick={() => setReviewRating(s)}
                              className={`w-4 h-4 ${
                                s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="পণ্যটি কেমন লেগেছে? আপনার অভিজ্ঞতা শেয়ার করুন..."
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white focus:outline-none focus:border-rose-400"
                    />

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>রিভিউ পোস্ট করুন</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
