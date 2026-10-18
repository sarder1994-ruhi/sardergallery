import React from 'react';
import { X, ShieldCheck, Truck, RotateCcw, HelpCircle, FileText, Info } from 'lucide-react';
import type { BusinessSettings } from '../types';

interface PolicyModalProps {
  policyType: string | null;
  onClose: () => void;
  settings: BusinessSettings | null;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyType, onClose, settings }) => {
  if (!policyType) return null;

  const renderContent = () => {
    switch (policyType) {
      case 'about':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-rose-500" />
              <span>আমাদের সম্পর্কে (About Sarder Gallery)</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                <strong>সরদার গ্যালারি (Sarder Gallery)</strong> বাংলাদেশের অন্যতম বিশ্বস্ত বেবি ও শিশুদের পণ্যের অনলাইন গ্যালারি। আমাদের মূল লক্ষ্য—আপনার সোনামণির জন্য সবচেয়ে নিরাপদ, আরামদায়ক ও প্রিমিয়াম কোয়ালিটির পণ্য সরবরাহ করা।
              </p>
              <p>
                আমরা বিশেষ যত্ন সহকারে প্রতিটি পণ্য বাছাই করি। আমাদের প্রধান পণ্যসমূহের মধ্যে রয়েছে অটোমেটিক ও ইলেকট্রিক বেবি রকার, বেবি দোলনা, নরম সিটিং সাপোর্ট সোফা, অর্থোপেডিক নেস্ট বেড, বিপিএ-মুক্ত সিলিকন ফিডিং সেট এবং শিশুদের মানসিক বিকাশে সহায়ক মন্টিসরি খেলনা।
              </p>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-rose-900">
                <h4 className="font-bold mb-1">আমাদের প্রতিশ্রুতি:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>১০০% নিরাপদ ও শিশু-বান্ধব উপকরণ</li>
                  <li>সারা বাংলাদেশে দ্রুততম ক্যাশ অন ডেলিভারি সুবিধা</li>
                  <li>অর্ডার করার আগে ও পরে ২৪/৭ কাস্টমার সাপোর্ট</li>
                  <li>সহজ এবং আন্তরিক রিটার্ন ও রিপ্লেসমেন্ট সেবা</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'delivery':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-500" />
              <span>ডেলিভারি পলিসি ও চার্জ</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-bold text-slate-800">ঢাকার ভেতরে:</h4>
                  <p className="text-sm font-black text-rose-600 mt-1">
                    ৳{settings?.deliveryInsideDhakaFee || 70}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">ডেলিভারি সময়: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-bold text-slate-800">ঢাকার বাইরে:</h4>
                  <p className="text-sm font-black text-rose-600 mt-1">
                    ৳{settings?.deliveryOutsideDhakaFee || 130}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">ডেলিভারি সময়: ২ থেকে ৩ কার্যদিবস</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-900 font-semibold">
                🎉 বিশেষ সুযোগ: ৳{settings?.freeDeliveryThreshold || 2500} টাকার বা তদূর্ধ্ব অর্ডারে সারা বাংলাদেশে সম্পূর্ণ <strong>ফ্রি ডেলিভারি</strong>!
              </div>

              <h4 className="font-bold text-slate-800 pt-2">ডেলিভারির নিয়মাবলী:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>ডেলিভারি ম্যানের সামনে পার্সেল খুলে পণ্যটি চেক করে মূল্য পরিশোধ করার অনুরোধ করা হচ্ছে।</li>
                <li>আমাদের অনুমোদিত কুরিয়ার পার্টনার: পাঠাও কুরিয়ার, স্টিডফাস্ট এবং রেডএক্স।</li>
                <li>অনিবার্য প্রাকৃতিক দুর্যোগ বা ছুটির দিনে ডেলিভারিতে কিছুটা অতিরিক্ত সময় লাগতে পারে।</li>
              </ul>
            </div>
          </div>
        );

      case 'return':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-500" />
              <span>রিটার্ন ও রিফান্ড পলিসি</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                আপনার সন্তুষ্টিই আমাদের শীর্ষ অগ্রাধিকার। যদি কোনো কারণে আপনি ক্ষতিগ্রস্ত বা ভুল পণ্য পান, তবে আমরা তা দ্রুত সমাধান করব।
              </p>
              <div className="space-y-2 border-l-4 border-rose-500 pl-3">
                <h4 className="font-bold text-slate-800">রিটার্ন শর্তসমূহ:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>পণ্য গ্রহণের সর্বোচ্চ ৭২ ঘণ্টার মধ্যে আমাদের হটলাইন বা হোয়াটসঅ্যাপে জানাতে হবে।</li>
                  <li>পণ্যটি অব্যবহৃত এবং মূল প্যাকেজিং সহ থাকতে হবে।</li>
                  <li>ত্রুটিপূর্ণ পণ্যের ক্ষেত্রে আমরা সম্পূর্ণ নিজস্ব খরচে নতুন পণ্য রিপ্লেস করে থাকি।</li>
                </ul>
              </div>
              <p>
                অনলাইন পেমেন্ট করা থাকলে এবং পণ্য রিটার্ন হলে ৩ থেকে ৫ কার্যদিবসের মধ্যে আপনার নির্ধারিত একাউন্টে টাকা রিফান্ড করা হবে।
              </p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>প্রাইভেসি ও গ্রাহক তথ্য নিরাপত্তা পলিসি</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                সরদার গ্যালারিতে আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করা আমাদের আইনি ও নৈতিক দায়িত্ব।
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>আমরা কেবল পণ্য পৌঁছানো এবং অর্ডার নিশ্চিতকরণের জন্য আপনার নাম, ঠিকানা ও মোবাইল নম্বর ব্যবহার করি।</li>
                <li>আমরা কখনই আপনার ব্যক্তিগত বা যোগাযোগের তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রয় বা অপব্যবহার করি না।</li>
                <li>আমাদের সাইটে পাসওয়ার্ড বা পেমেন্ট সংক্রান্ত তথ্য আধুনিক এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে।</li>
              </ul>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <span>শর্তাবলী (Terms & Conditions)</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                সরদার গ্যালারিতে অর্ডার করার মাধ্যমে আপনি আমাদের নির্ধারিত নিয়ম ও শর্তাবলী মেনে নিচ্ছেন।
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>ওয়েবসাইটে প্রদর্শিত পণ্যের মূল্য এবং স্টক সময়ের সাথে পরিবর্তনশীল হতে পারে।</li>
                <li>ভুল বা অসত্য যোগাযোগের তথ্য প্রদান করলে অর্ডার বাতিল করার অধিকার কর্তৃপক্ষের রয়েছে।</li>
                <li>পণ্য হাতে পাওয়ার পর যেকোনো দাবি প্রমাণের জন্য পার্সেল খোলার ভিডিও রাখার পরামর্শ দেওয়া হচ্ছে।</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden p-6 relative border border-rose-100 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-xl text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
