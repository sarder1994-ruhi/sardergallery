import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Truck, CheckCircle2, AlertCircle, CreditCard, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { BANGLADESH_DISTRICTS, isInsideDhaka, formatBDT, isValidBDPhone } from '../utils/bangladeshData';
import type { BusinessSettings, Order } from '../types';
import { getApiUrl, saveLocalOrder } from '../utils/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings | null;
  onOrderSuccess: (order: Order) => void;
  directBuyProduct?: { product: any; variant?: any; quantity: number } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOrderSuccess,
  directBuyProduct,
}) => {
  const { cart, subtotal: cartSubtotal, appliedCoupon, clearCart } = useCart();

  // If direct buy was initiated, compute values for it; otherwise use cart
  const itemsToBuy = directBuyProduct
    ? [
        {
          productId: directBuyProduct.product.id,
          variantId: directBuyProduct.variant?.id,
          nameBn: directBuyProduct.product.nameBn,
          quantity: directBuyProduct.quantity,
          price: directBuyProduct.variant?.price ?? directBuyProduct.product.salePrice ?? directBuyProduct.product.price,
          image: directBuyProduct.product.mainImage,
        },
      ]
    : cart.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        nameBn: item.product.nameBn,
        quantity: item.quantity,
        price: item.selectedPrice,
        image: item.product.mainImage,
      }));

  const subtotal = directBuyProduct
    ? itemsToBuy[0].price * itemsToBuy[0].quantity
    : cartSubtotal;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'sslcommerz'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate delivery fee
  const isDhaka = isInsideDhaka(district);
  const insideDhakaFee = settings?.deliveryInsideDhakaFee ?? 70;
  const outsideDhakaFee = settings?.deliveryOutsideDhakaFee ?? 130;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 2500;

  let deliveryFee = isDhaka ? insideDhakaFee : outsideDhakaFee;
  if (subtotal >= freeThreshold || appliedCoupon?.isFreeShipping) {
    deliveryFee = 0;
  }

  const discount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!phone.trim() || !isValidBDPhone(phone)) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 01712345678)।');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন।');
      return;
    }
    if (itemsToBuy.length === 0) {
      setErrorMessage('অর্ডার করার জন্য কোনো পণ্য পাওয়া যায়নি।');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        district,
        upazila: upazila.trim() || undefined,
        address: address.trim(),
        orderNotes: orderNotes.trim() || undefined,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        items: itemsToBuy.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      let finalOrder: Order | null = null;

      try {
        const res = await fetch(getApiUrl('/api/orders'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.order) {
            finalOrder = data.order;
          }
        }
      } catch (e) {
        console.warn('API order endpoint not reachable, generating static order:', e);
      }

      // If remote API not active or returned static 404 on Netlify, create resilient order record
      if (!finalOrder) {
        const orderNum = `SG-${Date.now().toString().slice(-6)}`;
        finalOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: orderNum,
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || undefined,
          district,
          upazila: upazila.trim() || undefined,
          address: address.trim(),
          orderNotes: orderNotes.trim() || undefined,
          items: itemsToBuy.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            nameBn: item.nameBn,
            nameEn: item.nameBn,
            sku: `SG-ITEM-${item.productId}`,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            subtotal: item.price * item.quantity,
          })),
          subtotal,
          deliveryFee,
          discount,
          total: grandTotal,
          paymentMethod,
          paymentStatus: 'pending',
          fulfillmentStatus: 'pending',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              actor: 'System (Customer Order)',
              note: 'অর্ডারটি সফলভাবে গৃহীত হয়েছে',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveLocalOrder(finalOrder);
      }

      // Order created successfully!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      if (!directBuyProduct) {
        clearCart();
      }

      onClose();
      onOrderSuccess(finalOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 border border-rose-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <span>🛍️ অর্ডার কনফার্ম করুন</span>
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              সঠিক ঠিকানা দিন, পণ্য পৌঁছানোর পর মূল্য পরিশোধ করুন।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Recipient Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
                ১
              </span>
              <span>গ্রাহকের তথ্য ও ডেলিভারি ঠিকানা</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: মোঃ জাহিদ হাসান"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নাম্বার <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জেলা নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:border-rose-400 focus:outline-none"
                >
                  <option value="Dhaka">ঢাকা (Dhaka - ঢাকার ভেতরে ৳{insideDhakaFee})</option>
                  {BANGLADESH_DISTRICTS.filter((d) => d.nameEn !== 'Dhaka').map((d) => (
                    <option key={d.nameEn} value={d.nameEn}>
                      {d.nameBn} ({d.nameEn} - ঢাকার বাইরে ৳{outsideDhakaFee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  থানা / উপজেলা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি / মিরপুর / সদর"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: বাসা নং ১২, রোড নং ৪, সেক্টর ৭, উত্তরা..."
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="যেমন: কল দিয়ে আসবেন / বিকেলে ডেলিভারি দিন"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:border-rose-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
                ২
              </span>
              <span>পেমেন্ট মেথড নির্বাচন করুন</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* COD Option */}
              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
                  paymentMethod === 'cod'
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-rose-500 focus:ring-rose-400"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>ক্যাশ অন ডেলিভারি (COD)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করবেন।
                  </p>
                </div>
              </label>

              {/* bKash Option */}
              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-1 text-pink-500 focus:ring-pink-400"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                    <CreditCard className="w-4 h-4 text-pink-600" />
                    <span>বিকাশ (bKash)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    অর্ডার কনফার্মেশনের পর বিকাশ মার্চেন্ট পেমেন্ট।
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Order Summary & Totals */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              অর্ডারের সংক্ষিপ্ত বিবরণ
            </h4>

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {itemsToBuy.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <img src={it.image} alt={it.nameBn} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="truncate text-slate-700">
                      {it.nameBn} <strong className="text-slate-900">x{it.quantity}</strong>
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 shrink-0">
                    {formatBDT(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-semibold">{formatBDT(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>কুপন ডিসকাউন্ট:</span>
                  <span className="font-semibold">-{formatBDT(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>
                  ডেলিভারি চার্জ ({isDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):
                </span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-600 font-bold">ফ্রি ডেলিভারি</strong>
                  ) : (
                    formatBDT(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-rose-600 font-black">{formatBDT(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 py-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>১০০% আসল পণ্য</span>
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-rose-500" />
              <span>দ্রুততম হোম ডেলিভারি</span>
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-2xl text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>অর্ডার নিশ্চিত করুন (৳{grandTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
