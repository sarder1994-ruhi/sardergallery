import React from 'react';
import { CheckCircle2, Printer, Compass, ArrowRight, MessageCircle, Phone, Package } from 'lucide-react';
import { formatBDT } from '../utils/bangladeshData';
import type { Order, BusinessSettings } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  settings: BusinessSettings | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  settings,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const phone = (settings?.whatsappNumber || '+8801700000000').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি সরদার গ্যালারিতে একটি অর্ডার করেছি।\nঅর্ডার নম্বর: *${order.orderNumber}*\nমোট প্রদেয়: ৳${order.total}\nনাম: ${order.customerName}\nমোবাইল: ${order.customerPhone}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Printable Invoice View (Shown only during print) */}
      <div className="hidden print:block w-full p-8 text-black bg-white">
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black">{settings?.businessNameBn || 'সরদার গ্যালারি'}</h1>
            <p className="text-sm">{settings?.addressBn}</p>
            <p className="text-sm">ফোন: {settings?.phone} | ইমেইল: {settings?.contactEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase">চালান / ইনভয়েস</h2>
            <p className="text-sm font-semibold">অর্ডার নং: {order.orderNumber}</p>
            <p className="text-xs text-slate-500">তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded">
          <h3 className="font-bold text-sm mb-1">গ্রাহকের ঠিকানা:</h3>
          <p className="text-sm font-semibold">{order.customerName}</p>
          <p className="text-sm">মোবাইল: {order.customerPhone}</p>
          <p className="text-sm">জেলা: {order.district}, ঠিকানা: {order.address}</p>
          {order.orderNotes && <p className="text-xs italic mt-1">নোট: {order.orderNotes}</p>}
        </div>

        <table className="w-full text-left text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="py-2">পণ্যের বিবরণ</th>
              <th className="py-2 text-center">পরিমাণ</th>
              <th className="py-2 text-right">দর</th>
              <th className="py-2 text-right">মোট</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-2 font-medium">{it.nameBn}</td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">৳{it.price}</td>
                <td className="py-2 text-right">৳{it.price * it.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>সাবটোটাল:</span>
              <span>৳{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>ডিসকাউন্ট:</span>
                <span>-৳{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ:</span>
              <span>৳{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-900 pt-1">
              <span>সর্বমোট প্রদেয়:</span>
              <span>৳{order.total}</span>
            </div>
            <div className="text-xs pt-1 text-slate-500 text-right">
              পেমেন্ট মাধ্যম: {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod}
            </div>
          </div>
        </div>

        <div className="text-center text-xs border-t border-slate-200 pt-4 text-slate-500">
          সরদার গ্যালারিতে কেনাকাটার জন্য ধন্যবাদ। কোনো প্রয়োজনে যোগাযোগ করুন {settings?.phone} নম্বরে।
        </div>
      </div>

      {/* Screen Interactive Modal */}
      <div className="print:hidden bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-rose-100 flex flex-col">
        {/* Banner */}
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white p-6 text-center relative">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ধন্যবাদ! অর্ডার সফল হয়েছে!</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            আপনার অর্ডারটি সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে।
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Order Number Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-xs font-semibold text-slate-500">আপনার অর্ডার নম্বর</span>
            <div className="text-2xl font-black text-rose-600 tracking-wider mt-0.5">
              {order.orderNumber}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ভবিষ্যতে অর্ডার ট্র্যাকিং এর জন্য এই নম্বরটি সংরক্ষণ করুন।
            </p>
          </div>

          {/* Details summary */}
          <div className="space-y-2 text-xs text-slate-600 border border-slate-100 rounded-2xl p-3.5 bg-rose-50/30">
            <div className="flex justify-between">
              <span>গ্রাহকের নাম:</span>
              <strong className="text-slate-800">{order.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span>মোবাইল নম্বর:</span>
              <strong className="text-slate-800">{order.customerPhone}</strong>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি ঠিকানা:</span>
              <span className="text-right text-slate-800 max-w-[200px] truncate">
                {order.address}, {order.district}
              </span>
            </div>
            <div className="flex justify-between">
              <span>পেমেন্ট মেথড:</span>
              <strong className="text-slate-800">
                {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod.toUpperCase()}
              </strong>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-rose-100">
              <span>পরিশোধযোগ্য মোট টাকা:</span>
              <span className="text-rose-600 font-black">{formatBDT(order.total)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl flex items-start gap-2">
            <Phone className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              আমাদের কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার ফোনে কল করে অর্ডারটি কনফার্ম করবেন এবং কুরিয়ারে বুকিং সম্পন্ন করবেন।
            </span>
          </p>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>ইনভয়েস প্রিন্ট</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(order.orderNumber);
                }}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>অর্ডার ট্র্যাক</span>
              </button>
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>হোয়াটসঅ্যাপে অর্ডার তথ্য পাঠান</span>
            </button>

            <button
              onClick={onClose}
              className="w-full text-slate-500 hover:text-slate-700 py-1.5 text-xs font-semibold"
            >
              হোমপেজে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
