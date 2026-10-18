import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  MessageCircle,
  Phone,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BANGLADESH_DISTRICTS, isInsideDhaka, formatBDT, isValidBDPhone } from '../utils/bangladeshData';
import { trackEvent } from '../utils/analytics';
import type { LandingPage, Product, Order, BusinessSettings } from '../types';
import { getApiUrl, fetchJsonSafely, saveLocalOrder } from '../utils/api';
import { DEFAULT_PRODUCTS } from '../data/storeData';

interface LandingPageViewProps {
  slug: string;
  onBackToShop: () => void;
  onOrderSuccess: (order: Order) => void;
  settings: BusinessSettings | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  slug,
  onBackToShop,
  onOrderSuccess,
  settings,
}) => {
  const [page, setPage] = useState<LandingPage | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Embedded Direct Checkout Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Countdown timer for sales urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchJsonSafely<{ page: LandingPage; product: Product }>(`/api/landing-pages/${slug}`).then((data) => {
      if (data && data.page && data.product) {
        setPage(data.page);
        setProduct(data.product);
        trackEvent('ViewContent', {
          content_name: data.page.title,
          content_type: 'product',
          value: data.product?.salePrice ?? data.product?.price,
          currency: 'BDT',
        }, settings?.analytics?.metaCapiEnabled);
      } else {
        const matchedProd = DEFAULT_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
        if (matchedProd) {
          setProduct(matchedProd);
          setPage({
            id: `lp-${matchedProd.id}`,
            productId: matchedProd.id,
            slug: matchedProd.slug,
            title: matchedProd.nameBn,
            headlineBn: matchedProd.nameBn,
            subheadlineBn: matchedProd.shortDescBn,
            badgeTextBn: 'হট ডিল ২০২৬',
            bannerImage: matchedProd.mainImage,
            featuresBn: [
              '১০০% প্রিমিয়াম ও শিশুবান্ধব নিরাপদ উপাদান',
              'সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি',
              'পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা',
            ],
            callToActionBn: 'এখনই অর্ডার করুন',
            isActive: true,
            viewCount: 1,
            orderCount: 0,
            createdAt: matchedProd.createdAt,
            updatedAt: matchedProd.updatedAt,
          });
        } else {
          setError('ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
        }
      }
    }).catch(() => setError('তথ্য লোড করতে সমস্যা হয়েছে'))
    .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !page || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-xl font-bold text-slate-800">ক্যাম্পেইন পেজ পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-1">অফারটি শেষ হয়ে থাকতে পারে বা লিঙ্ক ভুল হয়েছে।</p>
        <button
          onClick={onBackToShop}
          className="mt-4 bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  const unitPrice = product.salePrice ?? product.price;
  const regularPrice = product.price;
  const isDhaka = isInsideDhaka(district);
  const insideFee = settings?.deliveryInsideDhakaFee ?? 70;
  const outsideFee = settings?.deliveryOutsideDhakaFee ?? 130;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 2500;

  const subtotal = unitPrice * quantity;
  const deliveryFee = subtotal >= freeThreshold ? 0 : isDhaka ? insideFee : outsideFee;
  const grandTotal = subtotal + deliveryFee;

  const handleLandingCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!customerName.trim()) {
      setSubmitError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    if (!customerPhone.trim() || !isValidBDPhone(customerPhone)) {
      setSubmitError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!address.trim()) {
      setSubmitError('অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalOrder: Order | null = null;
      try {
        const res = await fetch(getApiUrl('/api/orders'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            district,
            address: address.trim(),
            orderNotes: orderNotes.trim() || `Landing Page: ${page.slug}`,
            paymentMethod: 'cod',
            items: [{ productId: product.id, quantity }],
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.order) finalOrder = data.order;
        }
      } catch (err) {
        console.warn('Order API not reachable:', err);
      }

      if (!finalOrder) {
        const orderNum = `SG-${Date.now().toString().slice(-6)}`;
        finalOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: orderNum,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          district,
          address: address.trim(),
          orderNotes: orderNotes.trim() || `Landing Page: ${page.slug}`,
          items: [
            {
              productId: product.id,
              nameBn: product.nameBn,
              nameEn: product.nameEn,
              sku: product.sku,
              price: product.salePrice ?? product.price,
              quantity,
              image: product.mainImage,
              subtotal: (product.salePrice ?? product.price) * quantity,
            },
          ],
          subtotal,
          deliveryFee,
          discount: 0,
          total: grandTotal,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          fulfillmentStatus: 'pending',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              actor: 'System (Landing Page Order)',
              note: 'ল্যান্ডিং পেজ থেকে অর্ডার গৃহীত হয়েছে',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveLocalOrder(finalOrder);
      }

      // Track Purchase event for Meta Pixel, GA4, and CAPI
      trackEvent('Purchase', {
        value: grandTotal,
        currency: 'BDT',
        content_ids: [product.id],
        content_type: 'product',
      }, settings?.analytics?.metaCapiEnabled);

      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}

      if (finalOrder) {
        onOrderSuccess(finalOrder);
      }
    } catch {
      setSubmitError('সার্ভার যোগাযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToCheckout = () => {
    const el = document.getElementById('landing-order-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#fffdfa] min-h-screen text-slate-800">
      {/* Top Urgent Offer Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white text-xs sm:text-sm py-2 px-4 text-center font-bold flex flex-wrap items-center justify-center gap-2 sm:gap-4 shadow-sm">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 animate-pulse text-amber-300" />
          <span>আজকের স্পেশাল মেগা অফার শেষ হতে বাকি:</span>
        </span>
        <div className="flex items-center gap-1 font-mono bg-black/30 px-2.5 py-0.5 rounded-lg text-amber-300 font-bold">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Landing Header */}
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Sarder Gallery" className="h-9 sm:h-11 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-300 flex items-center justify-center text-white text-xl font-bold shadow-md">
              👶
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {settings?.businessNameBn || 'সরদার গ্যালারি'}
            </h1>
            <p className="text-[10px] text-slate-500">অফিসিয়াল স্পেশাল ক্যাম্পেইন</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <a
            href={`tel:${settings?.phone}`}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-200"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>কল দিন: {settings?.phone}</span>
          </a>
          <button
            onClick={scrollToCheckout}
            className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            অর্ডার করুন (৳{unitPrice})
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-4 sm:pt-8 pb-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8">
          {page.badgeTextBn && (
            <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 font-extrabold text-xs px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{page.badgeTextBn}</span>
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            {page.headlineBn}
          </h2>

          <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
            {page.subheadlineBn}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-5 sm:p-8 rounded-3xl border border-rose-100 shadow-xl">
          {/* Main Visual */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 relative">
              <img
                src={page.bannerImage || product.mainImage}
                alt={product.nameBn}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                বিশেষ মূল্যছাড় ৳{regularPrice - unitPrice} সাশ্রয়!
              </span>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 text-center">
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-600">
                  {formatBDT(unitPrice)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatBDT(regularPrice)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা</p>
            </div>
          </div>

          {/* Key Features Checklist */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              কেন এই পণ্যটি আপনার সোনামণির জন্য অপরিহার্য?
            </h3>

            <div className="space-y-3">
              {page.featuresBn.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center text-[10px] text-slate-600">
              <div className="p-2 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span>১০০% আসল ও নিরাপদ</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <Truck className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <RotateCcw className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span>৭২ ঘণ্টা রিপ্লেসমেন্ট</span>
              </div>
            </div>

            <button
              onClick={scrollToCheckout}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <span>{page.callToActionBn || 'এখনই অর্ডার করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Embedded 1-Click Order Form Section */}
      <section id="landing-order-form" className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              সরাসরি অর্ডার ফরম
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              অর্ডার করতে নিচের তথ্যগুলো পূরণ করুন
            </h3>
            <p className="text-xs text-slate-500">
              অগ্রিম কোনো টাকা দিতে হবে না। পণ্য হাতে পেয়ে চেক করে টাকা দিন।
            </p>
          </div>

          {submitError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleLandingCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার পূর্ণ নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: মোঃ জাহিদ হোসেন"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মোবাইল নাম্বার <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="যেমন: 017XXXXXXXX"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  জেলা নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:border-rose-400 focus:outline-none"
                >
                  <option value="Dhaka">ঢাকা (ঢাকার ভেতরে ৳{insideFee})</option>
                  {BANGLADESH_DISTRICTS.filter((d) => d.nameEn !== 'Dhaka').map((d) => (
                    <option key={d.nameEn} value={d.nameEn}>
                      {d.nameBn} ({d.nameEn} - ঢাকার বাইরে ৳{outsideFee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পরিমাণ (Quantity)
                </label>
                <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-xs font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-800 text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-xs font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সম্পূর্ণ ঠিকানা (বাসা নং, রোড, এলাকা) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: বাসা নং ১২, রোড নং ৪, সেক্টর ৭, উত্তরা, ঢাকা..."
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 focus:border-rose-400 focus:outline-none"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>পণ্যের মূল্য ({quantity} টি):</span>
                <span className="font-bold text-slate-800">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ ({isDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}):</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">ফ্রি ডেলিভারি</strong> : formatBDT(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-rose-600 font-black">{formatBDT(grandTotal)}</span>
              </div>
            </div>

            {/* Big Action Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black py-4 px-4 rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>অর্ডার নিশ্চিত করুন (৳{grandTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
