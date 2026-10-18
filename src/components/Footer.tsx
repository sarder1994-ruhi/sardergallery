import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import type { BusinessSettings } from '../types';

interface FooterProps {
  settings: BusinessSettings | null;
  onOpenPolicy: (slug: string) => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenPolicy,
  onOpenTracking,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      {/* Top 3 Trust highlights */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">সারা দেশে দ্রুত ডেলিভারি</h4>
            <p className="text-xs text-slate-400 mt-0.5">ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা, বাইরে ২-৩ দিন</p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">১০০% নিরাপদ ও পরীক্ষিত পণ্য</h4>
            <p className="text-xs text-slate-400 mt-0.5">বিপিএ মুক্ত, শিশুদের কোমল ত্বকের উপযোগী</p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">সহজ রিটার্ন ও রিপ্লেসমেন্ট</h4>
            <p className="text-xs text-slate-400 mt-0.5">পণ্য হাতে পেয়ে চেক করে নেওয়ার নিশ্চয়তা</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Col 1: Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.businessNameBn} className="h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-300 flex items-center justify-center text-white text-base font-extrabold">
                👶
              </div>
            )}
            <span className="text-lg font-black text-white">
              {settings?.businessNameBn || 'সরদার গ্যালারি'}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            {settings?.businessNameEn || 'Sarder Gallery'} - আপনার সোনামণির সুস্থ বৃদ্ধি, আরামদায়ক ঘুম ও নিরাপত্তার বিশ্বস্ত সঙ্গী।
          </p>
          <div className="pt-1 text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{settings?.addressBn || 'ঢাকা, বাংলাদেশ'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>হটলাইন: {settings?.phone}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{settings?.contactEmail}</span>
            </p>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-sm tracking-wide">জনপ্রিয় ক্যাটাগরি</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="hover:text-rose-400 transition">
                বেবি রকার ও বাউন্সার
              </button>
            </li>
            <li>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="hover:text-rose-400 transition">
                বেবি দোলনা ও ক্র্যাডল
              </button>
            </li>
            <li>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="hover:text-rose-400 transition">
                বেবি প্লাশ সোফা ও সিটিং ট্রেইনার
              </button>
            </li>
            <li>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="hover:text-rose-400 transition">
                বেবি নেস্ট বেড ও মশারির সেট
              </button>
            </li>
            <li>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="hover:text-rose-400 transition">
                সিলিকন ফিডিং এক্সেসরিজ
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Policies */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-sm tracking-wide">কাস্টমার কেয়ার ও পলিসি</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <button onClick={() => onOpenPolicy('about')} className="hover:text-rose-400 transition">
                আমাদের সম্পর্কে (About Us)
              </button>
            </li>
            <li>
              <button onClick={onOpenTracking} className="hover:text-rose-400 transition">
                অর্ডার ট্র্যাক করুন
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('delivery')} className="hover:text-rose-400 transition">
                ডেলিভারি পলিসি ও চার্জ
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('return')} className="hover:text-rose-400 transition">
                রিটার্ন ও রিফান্ড পলিসি
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-rose-400 transition">
                প্রাইভেসি পলিসি
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-rose-400 transition">
                শর্তাবলী (Terms & Conditions)
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Payments & Courier */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm tracking-wide">পেমেন্ট ও পার্টনার্স</h4>
          <p className="text-slate-400 text-[11px]">
            আমরা সম্পূর্ণ নিরাপদ ক্যাশ অন ডেলিভারি (COD) এবং মোবাইল ব্যাংকিং সাপোর্ট করি।
          </p>

          <div className="flex flex-wrap gap-1.5">
            <span className="bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded text-[10px] border border-slate-700">
              ক্যাশ অন ডেলিভারি
            </span>
            <span className="bg-pink-900/40 text-pink-300 font-bold px-2 py-1 rounded text-[10px] border border-pink-700/50">
              bKash
            </span>
            <span className="bg-amber-900/40 text-amber-300 font-bold px-2 py-1 rounded text-[10px] border border-amber-700/50">
              Nagad
            </span>
            <span className="bg-blue-900/40 text-blue-300 font-bold px-2 py-1 rounded text-[10px] border border-blue-700/50">
              SSLCommerz
            </span>
          </div>

          <h5 className="font-bold text-white text-xs pt-2">ডেলিভারি পার্টনার্স:</h5>
          <div className="flex gap-2 text-[10px] text-slate-400">
            <span>Pathao Courier</span> • <span>Steadfast</span> • <span>RedX</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} {settings?.businessNameBn || 'সরদার গ্যালারি'} (Sarder Gallery). সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAdmin}
            className="hover:text-slate-300 transition text-[11px] underline underline-offset-4"
          >
            অ্যাডমিন লগইন
          </button>
        </div>
      </div>
    </footer>
  );
};
