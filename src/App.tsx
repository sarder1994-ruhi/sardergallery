import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { PolicyModal } from './components/PolicyModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminPortal } from './components/AdminPortal';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ChevronRight,
  Flame,
  ArrowRight,
  Star,
  CheckCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import type { Product, Category, Banner, BusinessSettings, Order } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_BANNERS, DEFAULT_SETTINGS } from './data/storeData';
import { fetchJsonSafely } from './utils/api';

export function AppContent() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Navigation & View State
  const [activeView, setActiveView] = useState<'shop' | 'tracking' | 'admin'>('shop');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'popular' | 'price_asc' | 'price_desc' | 'newest'>('popular');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [directBuyProduct, setDirectBuyProduct] = useState<{ product: Product; variant?: any; quantity: number } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [policyType, setPolicyType] = useState<string | null>(null);
  const [trackingInitialNumber, setTrackingInitialNumber] = useState('');

  // Active Hero banner index
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const fetchData = async () => {
    try {
      const [resProd, resCat, resBan, resSet] = await Promise.all([
        fetchJsonSafely<Product[]>('/api/products', undefined, DEFAULT_PRODUCTS),
        fetchJsonSafely<Category[]>('/api/categories', undefined, DEFAULT_CATEGORIES),
        fetchJsonSafely<Banner[]>('/api/banners', undefined, DEFAULT_BANNERS),
        fetchJsonSafely<BusinessSettings>('/api/settings', undefined, DEFAULT_SETTINGS),
      ]);

      if (Array.isArray(resProd) && resProd.length > 0) setProducts(resProd);
      if (Array.isArray(resCat) && resCat.length > 0) setCategories(resCat);
      if (Array.isArray(resBan) && resBan.length > 0) setBanners(resBan);
      if (resSet && !('error' in (resSet as any))) setSettings(resSet);
    } catch (e) {
      console.warn('Network or API issue, retained store data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products based on selected category & search
  const filteredProducts = products.filter((p) => {
    if (selectedCategorySlug) {
      const matchedCat = categories.find((c) => c.slug === selectedCategorySlug);
      if (matchedCat && p.categoryId !== matchedCat.id && !p.slug.includes(selectedCategorySlug)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.nameBn.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortDescBn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice ?? a.price;
    const priceB = b.salePrice ?? b.price;
    if (sortOption === 'price_asc') return priceA - priceB;
    if (sortOption === 'price_desc') return priceB - priceA;
    if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
  });

  // Handler for Direct Order ("এখনই অর্ডার করুন")
  const handleDirectOrder = (product: Product, variant?: any, quantity = 1) => {
    setDirectBuyProduct({ product, variant, quantity });
    setIsCheckoutOpen(true);
  };

  // Handler to open Tracking View
  const handleOpenTrackingWithOrder = (orderNum: string) => {
    setTrackingInitialNumber(orderNum);
    setActiveView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-slate-800">
      {/* 1. Global Navigation Header */}
      <Header
        categories={categories}
        settings={settings}
        onSelectCategory={(slug) => {
          setSelectedCategorySlug(slug);
          if (slug) {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        selectedCategorySlug={selectedCategorySlug}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenTracking={() => {
          setActiveView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenPolicy={(p) => setPolicyType(p)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* 2. Main View Switcher */}
      {activeView === 'tracking' ? (
        <OrderTrackingView
          initialOrderNumber={trackingInitialNumber}
          onBackToShop={() => setActiveView('shop')}
        />
      ) : activeView === 'admin' ? (
        <AdminPortal
          onClose={() => setActiveView('shop')}
          categories={categories}
          onRefreshData={fetchData}
        />
      ) : (
        /* SHOPPING STOREFRONT */
        <main className="flex-1 space-y-12 pb-16">
          {/* Hero Banner Section */}
          {banners.length > 0 && !selectedCategorySlug && !searchQuery && (
            <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-100 via-pink-50 to-amber-50 border border-rose-200/60 shadow-lg min-h-[380px] sm:min-h-[440px] flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-12 items-center w-full z-10">
                  <div className="space-y-4 text-center md:text-left">
                    {banners[currentBannerIndex]?.tagBn && (
                      <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white font-black text-xs px-3.5 py-1 rounded-full shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{banners[currentBannerIndex].tagBn}</span>
                      </span>
                    )}

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                      {banners[currentBannerIndex]?.titleBn}
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-lg leading-relaxed">
                      {banners[currentBannerIndex]?.subtitleBn}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                      <button
                        onClick={() => {
                          const el = document.getElementById('catalog-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-xl transition flex items-center gap-2 cursor-pointer"
                      >
                        <span>{banners[currentBannerIndex]?.buttonTextBn || 'এখনই অর্ডার করুন'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          const phone = (settings?.whatsappNumber || '+8801700000000').replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${phone}?text=আসসালামু%20আলাইকুম,%20আমি%20সরদার%20গ্যালারির%20পণ্য%20সম্পর্কে%20জানতে%20চাই।`, '_blank');
                        }}
                        className="bg-white/80 hover:bg-white text-slate-700 font-bold px-5 py-3.5 rounded-2xl text-xs sm:text-sm border border-slate-200 transition"
                      >
                        হোয়াটসঅ্যাপে পরামর্শ নিন
                      </button>
                    </div>
                  </div>

                  <div className="relative aspect-4/3 max-h-[340px] flex items-center justify-center">
                    <img
                      src={banners[currentBannerIndex]?.imageUrl}
                      alt={banners[currentBannerIndex]?.titleBn}
                      className="w-full h-full object-cover rounded-2xl shadow-xl ring-4 ring-white"
                    />
                  </div>
                </div>

                {/* Banner navigation dots */}
                {banners.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentBannerIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          currentBannerIndex === idx ? 'w-6 bg-rose-500' : 'w-2 bg-slate-300'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Quick Category Browser Icons */}
          {!selectedCategorySlug && !searchQuery && (
            <section className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>👶 ক্যাটাগরি ব্রাউজ করুন</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategorySlug(cat.slug);
                      const el = document.getElementById('catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-3 bg-white rounded-2xl border border-slate-100 hover:border-rose-300 shadow-xs hover:shadow-md transition text-center flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden mb-2 shadow-xs group-hover:scale-105 transition">
                      <img src={cat.image} alt={cat.nameBn} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-rose-600 transition line-clamp-1">
                      {cat.nameBn}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Best Sellers Highlight Carousel */}
          {!selectedCategorySlug && !searchQuery && (
            <section className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span>সেরা বিক্রিত বেবি প্রোডাক্টস</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">সবচেয়ে বেশি অভিভাবকের পছন্দের পণ্যসমূহ</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {products
                  .filter((p) => p.isBestSeller)
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setSelectedProduct(p)}
                      onDirectOrder={(p) => handleDirectOrder(p)}
                      whatsappNumber={settings?.whatsappNumber}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* Free Delivery Campaign Promo Box */}
          <section className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="bg-white/20 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  সীমিত সময়ের সুযোগ
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black">
                  ৳{settings?.freeDeliveryThreshold || 2500} টাকার অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি!
                </h3>
                <p className="text-xs sm:text-sm text-rose-50 max-w-xl">
                  কুপন কোড <strong className="font-extrabold underline">SARDER10</strong> ব্যবহারে পাচ্ছেন অতিরিক্ত ১০% ডিসকাউন্ট। স্টক সীমিত!
                </p>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-rose-600 hover:bg-rose-50 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition shrink-0"
              >
                এখনই পণ্য পছন্দ করুন →
              </button>
            </div>
          </section>

          {/* Featured Baby Rockers & Swings Spotlight */}
          {!selectedCategorySlug && !searchQuery && (
            <section className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    🎶 বেবি রকার ও অটোমেটিক দোলনা
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">শিশুর শান্ত ঘুম ও আরামদায়ক বিনোদনের জন্য</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {products
                  .filter((p) => p.categoryId === 'cat-rockers' || p.categoryId === 'cat-swings')
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setSelectedProduct(p)}
                      onDirectOrder={(p) => handleDirectOrder(p)}
                      whatsappNumber={settings?.whatsappNumber}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* MAIN PRODUCT CATALOG SECTION */}
          <section id="catalog-section" className="max-w-7xl mx-auto px-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedCategorySlug
                    ? categories.find((c) => c.slug === selectedCategorySlug)?.nameBn || 'নির্বাচিত পণ্যসমূহ'
                    : searchQuery
                    ? `সার্চ ফলাফল: "${searchQuery}"`
                    : 'আমাদের সকল পণ্য সম্ভার'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  মোট {sortedProducts.length} টি পণ্য পাওয়া গেছে
                </p>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">সর্ট করুন:</span>
                <select
                  value={sortOption}
                  onChange={(e: any) => setSortOption(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-800 font-semibold focus:outline-none focus:border-rose-400"
                >
                  <option value="popular">জনপ্রিয়তা অনুযায়ী</option>
                  <option value="price_asc">মূল্য: কম থেকে বেশি</option>
                  <option value="price_desc">মূল্য: বেশি থেকে কম</option>
                  <option value="newest">নতুন আগমন</option>
                </select>

                {selectedCategorySlug && (
                  <button
                    onClick={() => setSelectedCategorySlug(null)}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    ফিল্টার মুছুন
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-xl font-bold">
                  🔍
                </div>
                <h3 className="font-bold text-slate-800 text-sm">কোনো পণ্য খুঁজে পাওয়া যায়নি!</h3>
                <p className="text-xs text-slate-500">
                  ভিন্ন কোনো শব্দ দিয়ে সার্চ করুন অথবা অন্য ক্যাটাগরি ব্রাউজ করুন।
                </p>
                <button
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setSearchQuery('');
                  }}
                  className="bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  সকল পণ্য দেখুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                    onDirectOrder={(p) => handleDirectOrder(p)}
                    whatsappNumber={settings?.whatsappNumber}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Trust Highlights Section */}
          <section className="max-w-7xl mx-auto px-4 pt-6">
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-10">
              <h2 className="text-center text-xl sm:text-2xl font-black text-slate-900 mb-8">
                কেন সরদার গ্যালারি থেকে কেনাকাটা করবেন?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-1">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm">১০০% আসল ও নিরাপদ পণ্য</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    শিশুর সুরক্ষায় ফুড গ্রেড সিলিকন ও টক্সিন-মুক্ত উপাদান নিশ্চিত করা হয়।
                  </p>
                </div>

                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-1">
                    <Truck className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm">সারা দেশে ক্যাশ অন ডেলিভারি</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    পণ্য হাতে পেয়ে চেক করে নেওয়ার শতভাগ নিশ্চয়তা। অগ্রিম পেমেন্টের কোনো চাপ নেই।
                  </p>
                </div>

                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-1">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm">সহজ রিপ্লেসমেন্ট সুবিধা</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    পণ্য কোনো ত্রুটিযুক্ত হলে দ্রুত সময়ের মধ্যে আমরা পরিবর্তন করে দিই।
                  </p>
                </div>

                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-1">
                    <Headphones className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm">আন্তরিক কাস্টমার সেবা</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    পণ্য নির্বাচন ও অর্ডার সংক্রান্ত যেকোনো সহযোগিতায় আমরা আছি সার্বক্ষণিক।
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="max-w-3xl mx-auto px-4 pt-6">
            <div className="text-center space-y-1.5 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-500" />
                <span>সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)</span>
              </h2>
              <p className="text-xs text-slate-500">
                গ্রাহকদের সচরাচর করা কিছু সাধারণ প্রশ্ন ও তার উত্তর
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  q: 'অর্ডার করার কতদিনের মধ্যে পণ্য হাতে পাবো?',
                  a: 'ঢাকার ভেতরে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।',
                },
                {
                  q: 'ডেলিভারির সময় কী পণ্য খুলে চেক করার সুযোগ আছে?',
                  a: 'হ্যাঁ, অবশ্যই! ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল চেক করে সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন।',
                },
                {
                  q: 'অগ্রিম কোনো টাকা দিতে হবে কি?',
                  a: 'না, আমাদের অধিকাংশ অর্ডারে কোনো অগ্রিম টাকা নেওয়া হয় না। সম্পূর্ণ মূল্য ক্যাশ অন ডেলিভারিতে পরিশোধ করা যায়।',
                },
                {
                  q: 'পণ্য ভাঙা বা ত্রুটিযুক্ত পেলে কী করণীয়?',
                  a: 'পণ্য পাওয়ার ৭২ ঘণ্টার মধ্যে আমাদের হটলাইন বা হোয়াটসঅ্যাপে জানালে আমরা বিনা খরচে পণ্যটি রিপ্লেস করে দেব।',
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-800 flex justify-between items-center hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openFaqIndex === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === i && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* 3. Global Footer */}
      <Footer
        settings={settings}
        onOpenPolicy={(slug) => setPolicyType(slug)}
        onOpenTracking={() => {
          setActiveView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setActiveView('admin')}
      />

      {/* 4. Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setDirectBuyProduct(null);
          setIsCheckoutOpen(true);
        }}
        freeDeliveryThreshold={settings?.freeDeliveryThreshold}
      />

      {/* 5. Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDirectOrder={(prod, variant, qty) => handleDirectOrder(prod, variant, qty)}
          settings={settings}
        />
      )}

      {/* 6. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        settings={settings}
        directBuyProduct={directBuyProduct}
        onOrderSuccess={(order) => {
          setConfirmedOrder(order);
        }}
      />

      {/* 7. Order Success & Invoice Modal */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(orderNum) => handleOpenTrackingWithOrder(orderNum)}
          settings={settings}
        />
      )}

      {/* 8. Legal & Policy Modal */}
      {policyType && (
        <PolicyModal
          policyType={policyType}
          onClose={() => setPolicyType(null)}
          settings={settings}
        />
      )}

      {/* 9. Floating WhatsApp & Scroll to Top */}
      <FloatingWhatsApp
        whatsappNumber={settings?.whatsappNumber}
        businessName={settings?.businessNameBn}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
