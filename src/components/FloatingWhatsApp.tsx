import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp, X } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
  businessName?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  whatsappNumber = '+8801700000000',
  businessName = 'সরদার গ্যালারি',
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম ${businessName}! আমি আপনাদের ওয়েবসাইট থেকে পণ্য সম্পর্কে জানতে যোগাযোগ করছি।`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end space-y-3 no-print">
      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition hover:scale-105"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* WhatsApp Tooltip */}
      {showTooltip && (
        <div className="bg-white rounded-2xl shadow-xl p-3 border border-emerald-100 max-w-xs text-xs text-slate-700 relative animate-bounce">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          <p className="font-bold text-emerald-800">অর্ডার করতে চান বা কোনো প্রশ্ন আছে?</p>
          <p className="text-[11px] text-slate-500 mt-0.5">সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন!</p>
        </div>
      )}

      {/* Floating WhatsApp Action Button */}
      <button
        onClick={handleWhatsAppClick}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative ring-4 ring-emerald-200/50"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="sr-only">হোয়াটসঅ্যাপ</span>
      </button>
    </div>
  );
};
