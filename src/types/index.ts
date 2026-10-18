export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>; // e.g. { color: 'Pink', size: 'Standard' }
}

export interface Product {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  sku: string;
  categoryId: string;
  shortDescBn: string;
  shortDescEn?: string;
  fullDescBn: string;
  fullDescEn?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  images: string[];
  mainImage: string;
  variants?: ProductVariant[];
  dimensions?: string;
  weight?: string;
  specifications?: Record<string, string>;
  ageGroup?: string;
  careInstructions?: string;
  safetyInfo?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  descriptionBn?: string;
  image: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  nameBn: string;
  nameEn: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  subtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'pending_confirmation'
  | 'confirm'
  | 'confirmed'
  | 'hold'
  | 'phone_off'
  | 'not_received_call'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancel'
  | 'cancelled'
  | 'return'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'sslcommerz';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type CodReconciliationStatus = 'pending' | 'collected' | 'reconciled';

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  district: string;
  upazila?: string;
  address: string;
  deliveryInstructions?: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderStatus;
  codStatus?: CodReconciliationStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  courierName?: 'pathao' | 'steadfast' | 'redx' | 'manual';
  consignmentId?: string;
  trackingCode?: string;
  statusHistory: OrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  nameBn: string;
  nameEn: string;
  districts: string[];
  baseFee: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryDays: string;
  codAvailable: boolean;
  bulkyProductFee?: number;
}

export interface Banner {
  id: string;
  titleBn: string;
  subtitleBn: string;
  tagBn?: string;
  imageUrl: string;
  linkUrl: string;
  buttonTextBn: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BusinessSettings {
  businessNameBn: string;
  businessNameEn: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsappNumber: string;
  contactEmail: string;
  addressBn: string;
  facebookPageUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  currency: string;
  currencySymbol: string;
  deliveryInsideDhakaFee: number;
  deliveryOutsideDhakaFee: number;
  freeDeliveryThreshold: number;
  announcementTextBn: string;
  announcementActive: boolean;
  paymentGateways: {
    cod: { enabled: boolean; descriptionBn: string };
    bkash: { enabled: boolean; merchantNumber: string; testMode: boolean };
    nagad: { enabled: boolean; merchantNumber: string; testMode: boolean };
    sslcommerz: { enabled: boolean; storeId: string; testMode: boolean };
  };
  courierSettings: {
    provider: 'manual' | 'pathao' | 'steadfast' | 'redx';
    pathaoApiKey?: string;
    pathaoSecret?: string;
    steadfastApiKey?: string;
    steadfastSecret?: string;
    redxToken?: string;
  };
  analytics: {
    metaPixelId?: string;
    googleAnalyticsId?: string;
    metaCapiEnabled: boolean;
    metaCapiAccessToken?: string;
    testEventCode?: string;
  };
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  headlineBn: string;
  subheadlineBn: string;
  badgeTextBn?: string;
  productId: string;
  bannerImage: string;
  logoUrl?: string;
  featuresBn: string[];
  callToActionBn?: string;
  isActive: boolean;
  viewCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  district?: string;
  role: 'customer';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'staff';
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}
