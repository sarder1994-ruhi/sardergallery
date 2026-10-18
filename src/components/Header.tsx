import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Phone,
  ShieldCheck,
  Truck,
  Menu,
  X,
  Compass,
  User,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatBDT } from '../utils/bangladeshData';
import type { Category, BusinessSettings } from '../types';

interface HeaderProps {
  categories: Category[];
  settings: BusinessSettings | null;
  onSelectCategory: (slug: string | null) => void;
  selectedCategorySlug: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  onOpenPolicy: (type: string) => void;
  activeView: 'shop' | 'tracking' | 'admin';
  setActiveView: (view: 'shop' | 'tracking' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  settings,
  onSelectCategory,
  selectedCategorySlug,
  searchQuery,
  setSearchQuery,
  onOpenTracking,
  onOpenAdmin,
  activeView,
  setActiveView,
}) => {
  const { itemCount, subtotal, setIsCartOpen, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-rose-100">
      {/* 1. Top Announcement Bar */}
      {settings?.announcementActive && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white text-xs md:text-sm py-1.5 px-4 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
              <span className="truncate">{settings.announcementTextBn}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-4 shrink-0 text-xs">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5" />
                <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
              </span>
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center space-x-1 hover:underline text-rose-100"
              >
                <Phone className="w-3 h-3" />
                <span>হটলাইন: {settings.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-rose-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            onClick={() => {
              setActiveView('shop');
              onSelectCategory(null);
            }}
            className="flex items-center space-x-2 text-left group"
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.businessNameBn || 'Sarder Gallery'}
                className="h-10 md:h-12 max-w-[150px] object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                👶
              </div>
            )}
            <div>
              <span className="text-xl md:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-1.5">
                {settings?.businessNameBn || 'সরদার গ্যালারি'}
                <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 uppercase tracking-wider">
                  Baby Care
                </span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {settings?.businessNameEn || 'Sarder Gallery'} • নিরাপদ ও প্রিমিয়াম বেবি শপ
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বেবি রকার, দোলনা, সোফা বা খেলনা খুঁজুন..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:bg-white focus:outline-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Track Order, Wishlist, Cart Drawer, Admin */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Order Tracking Button */}
          <button
            onClick={onOpenTracking}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeView === 'tracking'
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-rose-500" />
            <span>অর্ডার ট্র্যাক</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3.5 py-2 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:from-rose-600 hover:to-pink-600 transition active:scale-95"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold">
              {formatBDT(subtotal)}
            </span>
          </button>

          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-full border transition ${
              activeView === 'admin'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="অ্যাডমিন ড্যাশবোর্ড"
            aria-label="Admin Portal"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-2.5 md:hidden">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য সার্চ করুন (যেমন: বেবি রকার, সোফা)..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:bg-white focus:outline-none rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Bar (Horizontal Scrollable) */}
      <nav className="bg-slate-50/80 border-t border-slate-100 overflow-x-auto scrollbar-none px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 whitespace-nowrap text-xs md:text-sm font-medium">
          <button
            onClick={() => {
              setActiveView('shop');
              onSelectCategory(null);
            }}
            className={`px-3 py-1 rounded-full transition ${
              selectedCategorySlug === null && activeView === 'shop'
                ? 'bg-rose-500 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            সকল পণ্য
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveView('shop');
                onSelectCategory(cat.slug);
              }}
              className={`px-3 py-1 rounded-full transition ${
                selectedCategorySlug === cat.slug && activeView === 'shop'
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {cat.nameBn}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                setActiveView('shop');
                onSelectCategory(null);
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-rose-50 font-medium text-slate-800"
            >
              🏠 হোম ও সকল পণ্য
            </button>
            <button
              onClick={() => {
                onOpenTracking();
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-rose-50 font-medium text-slate-800 flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 text-rose-500" />
              <span>অর্ডার ট্র্যাক করুন</span>
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-3 rounded-lg hover:bg-rose-50 font-medium text-slate-800 flex items-center space-x-2"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>অ্যাডমিন ড্যাশবোর্ড</span>
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            <p>হটলাইন: {settings?.phone}</p>
            <p>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা</p>
          </div>
        </div>
      )}
    </header>
  );
};
