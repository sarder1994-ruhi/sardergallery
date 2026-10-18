import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatBDT } from '../utils/bangladeshData';
import { DEFAULT_COUPONS } from '../data/storeData';
import { getApiUrl } from '../utils/api';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  freeDeliveryThreshold?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  freeDeliveryThreshold = 2500,
}) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    appliedCoupon,
    setAppliedCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const fullUrl = getApiUrl('/api/coupons/validate');
      let applied = false;

      try {
        const res = await fetch(fullUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: couponInput.trim(), subtotal }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          setAppliedCoupon(data);
          setCouponInput('');
          applied = true;
        } else if (res.status === 400 && contentType.includes('application/json')) {
          const data = await res.json();
          setCouponError(data.error || 'কুপনটি প্রযোজ্য নয়');
          applied = true;
        }
      } catch (err) {
        console.warn('Coupon endpoint not reachable, checking local coupons:', err);
      }

      if (!applied) {
        // Fallback for static Netlify host
        const codeClean = couponInput.trim().toUpperCase();
        const found = DEFAULT_COUPONS.find((c) => c.code.toUpperCase() === codeClean && c.isActive);
        if (found) {
          if (subtotal < found.minOrderValue) {
            setCouponError(`সর্বনিম্ন ৳${found.minOrderValue} টাকার অর্ডারে এই কুপন প্রযোজ্য`);
          } else {
            const rawDiscount = (subtotal * found.discountValue) / 100;
            const maxDisc = found.maxDiscount ?? Infinity;
            const discountAmount = Math.min(rawDiscount, maxDisc);
            setAppliedCoupon({
              code: found.code,
              discountAmount,
              discountType: 'percentage',
              discountValue: found.discountValue,
            });
            setCouponInput('');
          }
        } else {
          setCouponError('কুপন কোডটি সঠিক নয়');
        }
      }
    } catch {
      setCouponError('কুপন যাচাই করতে সমস্যা হয়েছে');
    } finally {
      setCouponLoading(false);
    }
  };

  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const finalEstimate = Math.max(0, subtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-slate-800">
                শপিং কার্ট ({cart.length} টি পণ্য)
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 text-xs">
            {remainingForFreeDelivery > 0 ? (
              <div>
                <p className="text-amber-800 font-medium">
                  আর <strong className="font-bold text-amber-900">{formatBDT(remainingForFreeDelivery)}</strong> টাকার কেনাকাটায় <strong>ফ্রি ডেলিভারি</strong>!
                </p>
                <div className="w-full bg-amber-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-700 font-bold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>অভিনন্দন! আপনি সারা বাংলাদেশে ফ্রি ডেলিভারি পাচ্ছেন!</span>
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-3 text-rose-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-600 text-base">আপনার কার্ট খালি!</p>
                <p className="text-xs text-slate-400 mt-1">
                  পছন্দের বেবি রকার, সোফা বা খেলনা কার্টে যোগ করুন।
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-600"
                >
                  শপিং শুরু করুন
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant?.id || 'main'}`}
                  className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <img
                    src={item.product.mainImage}
                    alt={item.product.nameBn}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {item.product.nameBn}
                    </h4>
                    {item.variant && (
                      <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        {item.variant.name}
                      </span>
                    )}
                    <div className="text-xs font-bold text-rose-600 mt-1">
                      {formatBDT(item.selectedPrice)}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)
                          }
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)
                          }
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      কুপন <strong>{appliedCoupon.code}</strong> কার্যকর (-{formatBDT(appliedCoupon.calculatedDiscount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    বাদ দিন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="কুপন কোড (যেমন: SARDER10)"
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 uppercase focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-xl text-xs font-bold"
                  >
                    {couponLoading ? '...' : 'প্রয়োগ'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-slate-800">{formatBDT(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span className="font-bold">-{formatBDT(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>ডেলিভারি চার্জ</span>
                  <span>চেকআউটে জেলা অনুযায়ী হিসাব হবে</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>সর্বমোট প্রাক্কলন</span>
                  <span className="text-rose-600">{formatBDT(finalEstimate)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 transition"
              >
                <span>অর্ডার কনফার্ম করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
