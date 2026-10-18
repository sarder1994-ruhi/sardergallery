import React from 'react';
import { ShoppingBag, Eye, Heart, MessageCircle, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatBDT } from '../utils/bangladeshData';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  whatsappNumber?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onDirectOrder,
  whatsappNumber,
}) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const isWishlisted = wishlist.includes(product.id);

  const price = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = (whatsappNumber || '+8801700000000').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি সরদার গ্যালারি থেকে এই পণ্যটি অর্ডার করতে চাই:\n\n*${product.nameBn}*\nমূল্য: ৳${price}\nSKU: ${product.sku}\nলিংক: ${window.location.origin}/products/${product.slug}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {hasDiscount && (
          <span className="bg-rose-500 text-white font-extrabold text-[10px] md:text-xs px-2 py-0.5 rounded-full shadow-xs">
            -{discountPercent}% ছাড়
          </span>
        )}
        {product.isNewArrival && (
          <span className="bg-amber-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            নতুন
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-sky-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            বেস্ট সেলার
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs ${
          isWishlisted
            ? 'bg-rose-500 text-white'
            : 'bg-white/80 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white'
        }`}
        aria-label="Wishlist"
      >
        <Heart className="w-4 h-4 fill-current" />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.mainImage}
          alt={product.nameBn}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
              স্টক শেষ (Out of Stock)
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category / SKU */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>SKU: {product.sku}</span>
            <span className="flex items-center text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              5.0
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 group-hover:text-rose-600 transition-colors">
            {product.nameBn}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {product.shortDescBn}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-base md:text-lg font-black text-rose-600">
              {formatBDT(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatBDT(product.price)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) onDirectOrder(product);
              }}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
            >
              <span>অর্ডার করুন</span>
            </button>

            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) addToCart(product, 1);
              }}
              className="w-full bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 text-rose-700 py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>কার্টে নিন</span>
            </button>
          </div>

          {/* WhatsApp Direct Inquiry Link */}
          <button
            onClick={handleWhatsAppInquiry}
            className="w-full mt-1.5 py-1 text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center justify-center space-x-1 font-semibold group-hover:underline"
          >
            <MessageCircle className="w-3 h-3 text-emerald-600" />
            <span>হোয়াটসঅ্যাপে অর্ডার</span>
          </button>
        </div>
      </div>
    </div>
  );
};
