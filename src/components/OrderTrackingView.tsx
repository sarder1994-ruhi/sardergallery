import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  AlertCircle,
  Printer,
  Compass,
  Phone,
  ExternalLink
} from 'lucide-react';
import { formatBDT } from '../utils/bangladeshData';
import type { Order, OrderStatus } from '../types';
import { getApiUrl, findLocalOrder } from '../utils/api';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onBackToShop: () => void;
}

const STATUS_STEPS: { key: OrderStatus; labelBn: string; descBn: string; icon: any }[] = [
  { key: 'pending_confirmation', labelBn: 'অর্ডার গৃহীত', descBn: 'অর্ডারটি যাচাইয়ের অপেক্ষায় আছে', icon: Clock },
  { key: 'confirmed', labelBn: 'কনফার্মড', descBn: 'অর্ডার নিশ্চিত করা হয়েছে', icon: CheckCircle2 },
  { key: 'processing', labelBn: 'প্রসেসিং', descBn: 'পণ্য প্রস্তুত করা হচ্ছে', icon: Package },
  { key: 'packed', labelBn: 'প্যাক সম্পন্ন', descBn: 'ডেলিভারির জন্য সুরক্ষিতভাবে প্যাক করা হয়েছে', icon: Package },
  { key: 'shipped', labelBn: 'কুরিয়ারে হস্তান্তর', descBn: 'কুরিয়ারের মাধ্যমে পাঠানো হয়েছে', icon: Truck },
  { key: 'delivered', labelBn: 'ডেলিভার্ড', descBn: 'গ্রাহকের নিকট সফলভাবে পৌঁছেছে', icon: Check },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onBackToShop,
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (searchNum: string) => {
    if (!searchNum.trim()) return;
    setLoading(true);
    setError('');
    try {
      let endpoint = `/api/orders/track/${encodeURIComponent(searchNum.trim())}`;
      if (phone.trim()) {
        endpoint += `?phone=${encodeURIComponent(phone.trim())}`;
      }
      const fullUrl = getApiUrl(endpoint);
      const res = await fetch(fullUrl);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setOrder(data);
        return;
      }
      
      // Fallback: check localStorage for matching order
      const local = findLocalOrder(searchNum.trim());
      if (local) {
        setOrder(local);
        return;
      }

      setError('অর্ডারটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার নম্বর লিখুন।');
      setOrder(null);
    } catch {
      const local = findLocalOrder(searchNum.trim());
      if (local) {
        setOrder(local);
      } else {
        setError('তথ্য লোড করতে সমস্যা হয়েছে। আপনার ইন্টারনেট বা অর্ডার নম্বর যাচাই করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!order) return 'upcoming';
    const statusOrder: OrderStatus[] = [
      'pending_confirmation',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(order.fulfillmentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (order.fulfillmentStatus === 'cancelled') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center max-w-md mx-auto space-y-2">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">অর্ডার ট্র্যাক করুন</h1>
        <p className="text-xs text-slate-500">
          আপনার অর্ডারের বর্তমান অবস্থা এবং কুরিয়ারের অবস্থান জানতে অর্ডার নম্বর দিন।
        </p>
      </div>

      {/* Search Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 sm:p-6 rounded-3xl border border-rose-100 shadow-md max-w-xl mx-auto space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              অর্ডার নম্বর (যেমন: SG-2026-1001)
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="SG-2026-XXXX"
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 uppercase focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মোবাইল নম্বর (ভেরিফিকেশন)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX (ঐচ্ছিক)"
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          {loading ? (
            <span>অনুসন্ধান করা হচ্ছে...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>ট্র্যাকিং তথ্য দেখুন</span>
            </>
          )}
        </button>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Order Result Details */}
      {order && (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-5 sm:p-8 space-y-8 animate-fadeIn">
          {/* Top Order Summary Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">অর্ডার নম্বর</span>
              <h2 className="text-xl sm:text-2xl font-black text-rose-600">{order.orderNumber}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট ইনভয়েস</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">ডেলিভারি অগ্রগতি</h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const status = getStepStatus(step.key);
                const isCurrent = order.fulfillmentStatus === step.key;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition ${
                      status === 'completed'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : isCurrent
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200'
                        : 'bg-slate-50/50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                        status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{step.labelBn}</h4>
                      <p className="text-[10px] mt-0.5 opacity-80 line-clamp-2">{step.descBn}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Consignment Section (If shipped) */}
          {order.courierName && order.consignmentId && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-900">
              <div>
                <span className="font-bold uppercase tracking-wider text-[11px] text-sky-700">
                  কুরিয়ার পার্সেল ট্র্যাকিং
                </span>
                <p className="font-black text-sm text-slate-800 mt-0.5">
                  সার্ভিস: {order.courierName.toUpperCase()} • কনসাইনমেন্ট আইডি: {order.consignmentId}
                </p>
              </div>

              {order.trackingCode && order.trackingCode.startsWith('http') && (
                <a
                  href={order.trackingCode}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <span>কুরিয়ার ওয়েবসাইটে ট্র্যাক করুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Order Details & Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Delivery & Customer Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                গ্রাহক ও ডেলিভারি তথ্য
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p>
                  <strong>নাম:</strong> {order.customerName}
                </p>
                <p>
                  <strong>মোবাইল:</strong> {order.customerPhone}
                </p>
                <p>
                  <strong>জেলা:</strong> {order.district}
                </p>
                <p>
                  <strong>ঠিকানা:</strong> {order.address}
                </p>
                <p>
                  <strong>পেমেন্ট মোড:</strong>{' '}
                  <span className="font-bold text-slate-800">
                    {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            {/* Products & Payment Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                অর্ডারকৃত পণ্যসমূহ
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-none">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <img src={item.image} alt={item.nameBn} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="truncate text-slate-800 font-medium">
                        {item.nameBn} (x{item.quantity})
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="pt-2 space-y-1 text-slate-600 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>সাবটোটাল:</span>
                    <span>{formatBDT(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>কুপন ছাড়:</span>
                      <span>-{formatBDT(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>ডেলিভারি ফি:</span>
                    <span>{formatBDT(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-rose-600 font-black">{formatBDT(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="pt-4 text-center">
            <button
              onClick={onBackToShop}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              ← কেনাকাটা চালিয়ে যান
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
