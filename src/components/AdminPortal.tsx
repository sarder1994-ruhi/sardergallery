import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  CreditCard,
  Tag,
  Sliders,
  DollarSign,
  Shield,
  Download,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Eye,
  KeyRound,
  Lock,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  Save,
  Check,
  Image as ImageIcon,
  Globe,
  Layers,
  Link as LinkIcon,
  Sparkles,
  BarChart3,
  Upload,
  Copy,
  CheckCheck,
  Activity,
  Phone,
  PhoneOff,
  PhoneMissed,
  PhoneCall,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  RotateCcw,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatBDT } from '../utils/bangladeshData';
import type {
  Product,
  Category,
  Order,
  Coupon,
  Banner,
  LandingPage,
  BusinessSettings,
  AuditLog,
  OrderStatus,
  CodReconciliationStatus
} from '../types';
import {
  getApiUrl,
  getLocalOrders,
  getLocalProducts,
  getLocalCategories,
  getLocalSettings,
  updateLocalOrderStatus,
  updateLocalCodStatus,
  upsertLocalProduct,
  deleteLocalProduct,
  upsertLocalCategory,
  deleteLocalCategory,
  saveLocalSettings,
} from '../utils/api';

interface AdminPortalProps {
  onClose: () => void;
  categories: Category[];
  onRefreshData: () => void;
  onViewLandingPage?: (slug: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  categories,
  onRefreshData,
  onViewLandingPage,
}) => {
  const {
    adminUser,
    adminToken,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    changeAdminPassword,
  } = useAuth();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin@sarder');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Change state
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'brand_settings'
    | 'marketing_tracking'
    | 'banners'
    | 'landing_pages'
    | 'courier'
    | 'payments'
    | 'coupons'
    | 'delivery'
    | 'reports'
    | 'security'
  >('dashboard');

  // Copy link feedback state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Diagnostic CAPI test state
  const [testCapiLoading, setTestCapiLoading] = useState(false);
  const [testCapiResult, setTestCapiResult] = useState<any>(null);

  // Uploading state indicator
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Presets for Quick Selection
  const LOGO_PRESETS = [
    { name: 'Cute Pastel Teddy', url: 'https://images.unsplash.com/photo-1555252333-978fead06c00?auto=format&fit=crop&w=300&q=80' },
    { name: 'Baby Stork & Star', url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=300&q=80' },
    { name: 'Nursery Golden Star', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80' },
    { name: 'Modern Baby Crib', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80' },
  ];

  const BANNER_PRESETS = [
    {
      name: 'Electric Baby Rocker',
      imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
      titleBn: 'আপনার সোনামণির প্রশান্তিময় ঘুম ও আনন্দময় শৈশব',
      subtitleBn: 'অটোমেটিক ইলেকট্রিক বেবি রকার ও দোলনায় চলছে বিশেষ ছাড়!',
      tagBn: 'মেগা অফার ২০২৬',
    },
    {
      name: 'Baby Toys & Play Mat',
      imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
      titleBn: 'শিশুর মেধা বিকাশ ও খেলার নিরাপদ জগৎ',
      subtitleBn: '১০০% নন-টক্সিক ও শিশুবান্ধব লার্নিং টয় ও প্লে-ম্যাট কালেকশন',
      tagBn: 'নতুন আগমন',
    },
    {
      name: 'Feeding & Highchair Set',
      imageUrl: 'https://images.unsplash.com/photo-1595347097560-69238724e7bd?auto=format&fit=crop&w=1200&q=80',
      titleBn: 'নিরাপদ ফিডিং সেট ও মাল্টিফাংশনাল হাইচেয়ার',
      subtitleBn: 'শিশুর স্বাস্থ্যকর ও আনন্দদায়ক খাবার সময় নিশ্চিত করুন',
      tagBn: 'হট ডিল',
    },
    {
      name: 'Sleep & Baby Cots',
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      titleBn: 'শিশুর শান্ত ও নিরাপদ ঘুমের আধুনিক আয়োজন',
      subtitleBn: 'প্রিমিয়াম কোয়ালিটি কাঠের ও ফোল্ডিং বেবি কট কালেকশন',
      tagBn: 'বেস্ট সেলার',
    },
  ];

  // Helper to upload an image from file input
  const uploadImageFile = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ dataUrl: base64, fileName: file.name }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            resolve(data.url);
          } else {
            resolve(base64);
          }
        } catch {
          resolve(base64);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Helper to trigger Meta CAPI diagnostic test
  const handleTestCapiDiagnostic = async () => {
    setTestCapiLoading(true);
    setTestCapiResult(null);
    try {
      const res = await fetch('/api/admin/analytics/test-capi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      setTestCapiResult(data.result || data);
    } catch (err: any) {
      setTestCapiResult({ success: false, error: err.message || 'Diagnostic request failed' });
    } finally {
      setTestCapiLoading(false);
    }
  };

  // Copy landing page link
  const handleCopyLandingLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/landing/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Orders filter & search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForManage, setSelectedOrderForManage] = useState<Order | null>(null);
  const [manageOrderStatus, setManageOrderStatus] = useState<OrderStatus>('pending');
  const [manageOrderNote, setManageOrderNote] = useState('');
  const [manageSaving, setManageSaving] = useState(false);
  const [statusSaveNotice, setStatusSaveNotice] = useState<string | null>(null);

  // Product Sub-Navigation & Filters ('all' | 'categories' | 'low_stock')
  const [productSubTab, setProductSubTab] = useState<'all' | 'categories' | 'low_stock'>('all');
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);

  // Category management state
  const [adminCategories, setAdminCategories] = useState<Category[]>(categories || []);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormSaving, setCategoryFormSaving] = useState(false);

  // Product edit/create modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormSaving, setProductFormSaving] = useState(false);

  // Banner edit/create modal
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFormSaving, setBannerFormSaving] = useState(false);

  // Landing Page edit/create modal
  const [editingLandingPage, setEditingLandingPage] = useState<Partial<LandingPage> | null>(null);
  const [isLandingPageModalOpen, setIsLandingPageModalOpen] = useState(false);
  const [landingPageFormSaving, setLandingPageFormSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  // Sync categories prop
  useEffect(() => {
    if (categories && categories.length > 0) {
      setAdminCategories(categories);
    }
  }, [categories]);

  // Load all admin data
  const loadAdminData = async () => {
    if (!adminToken) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const safeFetch = async (endpoint: string) => {
        try {
          const res = await fetch(getApiUrl(endpoint), { headers });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            return await res.json();
          }
          return null;
        } catch {
          return null;
        }
      };

      const [resProd, resOrd, resCoup, resBan, resLp, resSet, resFin, resAud, resCats] = await Promise.all([
        safeFetch('/api/admin/products'),
        safeFetch('/api/admin/orders'),
        safeFetch('/api/admin/coupons'),
        safeFetch('/api/admin/banners'),
        safeFetch('/api/admin/landing-pages'),
        safeFetch('/api/admin/settings'),
        safeFetch('/api/admin/reports/financial'),
        safeFetch('/api/admin/audit-logs'),
        safeFetch('/api/admin/categories'),
      ]);

      if (Array.isArray(resProd) && resProd.length > 0) {
        setProducts(resProd);
      } else {
        setProducts(getLocalProducts());
      }

      if (Array.isArray(resOrd)) {
        setOrders(resOrd);
      } else {
        setOrders(getLocalOrders());
      }

      if (Array.isArray(resCoup)) setCoupons(resCoup);
      if (Array.isArray(resBan)) setBanners(resBan);
      if (Array.isArray(resLp)) setLandingPages(resLp);

      if (resSet && !resSet.error) {
        setSettings(resSet);
      } else {
        setSettings(getLocalSettings());
      }

      if (resFin && !resFin.error) setFinancials(resFin);
      if (Array.isArray(resAud)) setAuditLogs(resAud);

      if (Array.isArray(resCats) && resCats.length > 0) {
        setAdminCategories(resCats);
      } else {
        setAdminCategories(getLocalCategories());
      }
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn && !adminUser?.mustChangePassword) {
      loadAdminData();
    }
  }, [isAdminLoggedIn, adminUser?.mustChangePassword]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const result = await adminLogin(loginUsername, loginPassword);
    setLoginLoading(false);
    if (!result.success) {
      setLoginError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  // Handle mandatory password change
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    if (newPass.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Both password fields must match exactly.');
      return;
    }
    setPassLoading(true);
    const result = await changeAdminPassword(newPass, confirmPass);
    setPassLoading(false);
    if (!result.success) {
      setPassError(result.error || 'Password update failed. Please try again.');
    } else {
      setPassSuccess('Password successfully updated! You now have full dashboard access.');
      loadAdminData();
    }
  };

  // Format status label for clean English UI
  const formatStatusLabel = (status: OrderStatus | string): string => {
    switch (status) {
      case 'pending':
      case 'pending_confirmation':
        return 'Pending';
      case 'confirm':
      case 'confirmed':
        return 'Confirm';
      case 'hold':
        return 'Hold';
      case 'phone_off':
        return 'Phone Off';
      case 'not_received_call':
        return 'Not Received Call';
      case 'processing':
        return 'Processing';
      case 'packed':
        return 'Packed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancel':
      case 'cancelled':
        return 'Cancel';
      case 'return':
      case 'returned':
        return 'Return';
      default:
        return String(status).replace(/_/g, ' ');
    }
  };

  // Get color badges for status
  const getStatusBadgeStyle = (status: OrderStatus | string): { bg: string; text: string; border: string; dot: string } => {
    switch (status) {
      case 'pending':
      case 'pending_confirmation':
        return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' };
      case 'confirm':
      case 'confirmed':
        return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' };
      case 'hold':
        return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' };
      case 'phone_off':
        return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' };
      case 'not_received_call':
        return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-500' };
      case 'shipped':
        return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300', dot: 'bg-sky-500' };
      case 'delivered':
        return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300', dot: 'bg-teal-500' };
      case 'cancel':
      case 'cancelled':
        return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' };
      case 'return':
      case 'returned':
        return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
    }
  };

  // Order status update & save to server
  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    try {
      let savedOrder: Order | null = null;
      try {
        const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/status`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: newStatus, note }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.order) savedOrder = data.order;
        }
      } catch (e) {
        console.warn('Remote status update unavailable, saving to local store:', e);
      }

      // Fallback for Netlify static host
      if (!savedOrder) {
        savedOrder = updateLocalOrderStatus(orderId, newStatus, note);
      }

      if (savedOrder) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? savedOrder! : o)));
        if (selectedOrderForManage && selectedOrderForManage.id === orderId) {
          setSelectedOrderForManage(savedOrder);
        }
        setStatusSaveNotice(`Order status changed to "${formatStatusLabel(newStatus)}" and saved!`);
        setTimeout(() => setStatusSaveNotice(null), 3500);
        onRefreshData();
        return true;
      } else {
        alert('Failed to save order status.');
        return false;
      }
    } catch {
      alert('Network error while saving order status.');
      return false;
    }
  };

  // Save order status & note from modal
  const handleSaveOrderFromModal = async () => {
    if (!selectedOrderForManage) return;
    setManageSaving(true);
    const success = await handleOrderStatusUpdate(
      selectedOrderForManage.id,
      manageOrderStatus,
      manageOrderNote.trim() || undefined
    );
    setManageSaving(false);
    if (success) {
      setManageOrderNote('');
    }
  };

  // COD status update
  const handleCodStatusUpdate = async (orderId: string, codStatus: CodReconciliationStatus) => {
    try {
      let updated: Order | null = null;
      try {
        const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/cod-reconcile`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ codStatus }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.order) updated = data.order;
        }
      } catch {}

      if (!updated) {
        updated = updateLocalCodStatus(orderId, codStatus);
      }

      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated! : o)));
      }
    } catch {}
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: Partial<BusinessSettings>) => {
    try {
      let updated = false;
      try {
        const res = await fetch(getApiUrl('/api/admin/settings'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newSettings),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          setSettings(data.settings);
          updated = true;
        }
      } catch {}

      if (!updated) {
        const saved = saveLocalSettings(newSettings);
        setSettings(saved);
      }
      alert('Settings successfully updated!');
      onRefreshData();
    } catch {
      alert('Failed to save settings.');
    }
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.nameBn || !editingProduct?.price) {
      alert('Product Bengali Name and Regular Price are required.');
      return;
    }
    setProductFormSaving(true);
    try {
      let saved = false;
      try {
        const res = await fetch(getApiUrl('/api/admin/products'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(editingProduct),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.product) saved = true;
        }
      } catch {}

      if (!saved) {
        upsertLocalProduct(editingProduct);
        setProducts(getLocalProducts());
      } else {
        loadAdminData();
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setStatusSaveNotice('Product saved successfully!');
      setTimeout(() => setStatusSaveNotice(null), 3000);
      onRefreshData();
    } catch {
      alert('Failed to save product.');
    } finally {
      setProductFormSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      let deleted = false;
      try {
        const res = await fetch(getApiUrl(`/api/admin/products/${id}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          deleted = true;
        }
      } catch {}

      if (!deleted) {
        deleteLocalProduct(id);
        setProducts(getLocalProducts());
      } else {
        loadAdminData();
      }
      setStatusSaveNotice(`Product "${name}" deleted.`);
      setTimeout(() => setStatusSaveNotice(null), 3000);
      onRefreshData();
    } catch {
      alert('Failed to delete product.');
    }
  };

  // Open Add Product Modal with fresh template
  const handleOpenAddProduct = () => {
    setActiveTab('products');
    setProductSubTab('all');
    setEditingProduct({
      nameBn: '',
      nameEn: '',
      sku: `SG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      price: 1500,
      stock: 10,
      categoryId: adminCategories[0]?.id || 'cat-rockers',
      shortDescBn: '',
      fullDescBn: '',
      mainImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
      isPublished: true,
    });
    setIsProductModalOpen(true);
  };

  // Quick stock update (for table & Low Stock tab)
  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    setStockUpdatingId(productId);
    try {
      let updated = false;
      try {
        const res = await fetch(getApiUrl(`/api/admin/products/${productId}/stock`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ stock: Math.max(0, newStock) }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          updated = true;
        }
      } catch {}

      if (!updated) {
        upsertLocalProduct({ id: productId, stock: Math.max(0, newStock) });
        setProducts(getLocalProducts());
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
        );
      }
      setStatusSaveNotice(`Stock updated successfully to ${Math.max(0, newStock)}`);
      setTimeout(() => setStatusSaveNotice(null), 3000);
      onRefreshData();
    } catch (err) {
      console.error('Failed to update stock', err);
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.nameBn) {
      alert('Category Bengali Name is required.');
      return;
    }
    setCategoryFormSaving(true);
    try {
      let saved = false;
      try {
        const res = await fetch(getApiUrl('/api/admin/categories'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(editingCategory),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.category) saved = true;
        }
      } catch {}

      if (!saved) {
        upsertLocalCategory(editingCategory);
        setAdminCategories(getLocalCategories());
      } else {
        loadAdminData();
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setStatusSaveNotice('Category saved successfully!');
      setTimeout(() => setStatusSaveNotice(null), 3000);
      onRefreshData();
    } catch {
      alert('Failed to save category.');
    } finally {
      setCategoryFormSaving(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    const assignedCount = products.filter((p) => p.categoryId === catId).length;
    const msg =
      assignedCount > 0
        ? `Warning: ${assignedCount} products are assigned to "${catName}". Are you sure you want to delete this category?`
        : `Are you sure you want to delete category "${catName}"?`;
    if (!confirm(msg)) return;

    try {
      let deleted = false;
      try {
        const res = await fetch(getApiUrl(`/api/admin/categories/${catId}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          deleted = true;
        }
      } catch {}

      if (!deleted) {
        deleteLocalCategory(catId);
        setAdminCategories(getLocalCategories());
      } else {
        loadAdminData();
      }
      setStatusSaveNotice(`Category "${catName}" deleted.`);
      setTimeout(() => setStatusSaveNotice(null), 3000);
      onRefreshData();
    } catch {
      alert('Failed to delete category');
    }
  };

  // Save Banner
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.titleBn || !editingBanner?.imageUrl) {
      alert('Banner Title and Image URL are required.');
      return;
    }
    setBannerFormSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editingBanner),
      });
      const data = await res.json();
      if (res.ok) {
        setIsBannerModalOpen(false);
        setEditingBanner(null);
        loadAdminData();
        onRefreshData();
      }
    } catch {
      alert('Failed to save banner.');
    } finally {
      setBannerFormSaving(false);
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        onRefreshData();
      }
    } catch {}
  };

  // Save Landing Page
  const handleSaveLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLandingPage?.title || !editingLandingPage?.headlineBn || !editingLandingPage?.productId) {
      alert('Title, Bengali Headline, and Associated Product are required.');
      return;
    }
    setLandingPageFormSaving(true);
    try {
      const res = await fetch('/api/admin/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editingLandingPage),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLandingPageModalOpen(false);
        setEditingLandingPage(null);
        loadAdminData();
      }
    } catch {
      alert('Failed to save landing page.');
    } finally {
      setLandingPageFormSaving(false);
    }
  };

  // Delete Landing Page
  const handleDeleteLandingPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return;
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setLandingPages((prev) => prev.filter((lp) => lp.id !== id));
      }
    } catch {}
  };

  // 1. IF NOT LOGGED IN -> Show Admin Login Form
  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-rose-100">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-900 p-6 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-2xl font-black">
              🔐
            </div>
            <h2 className="text-xl font-black">Admin Portal Sign In</h2>
            <p className="text-xs text-rose-200 mt-1">Sarder Gallery Control Center</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Initial Admin Credentials:</strong>
              <div className="mt-1 flex justify-between font-mono text-[11px]">
                <span>User ID: <code>admin@sarder</code></span>
                <span>Password: <code>123456</code></span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700">
                (For security, you must choose a new secret password upon your first sign in)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Username / ID
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
              >
                {loginLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. IF MUST CHANGE PASSWORD -> Show Mandatory Password Reset Screen
  if (adminUser?.mustChangePassword) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-rose-100">
          <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-6 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2 text-2xl font-black">
              🛡️
            </div>
            <h2 className="text-xl font-black">Mandatory Password Update</h2>
            <p className="text-xs text-amber-100 mt-1">
              Please choose a new secure password before accessing the dashboard.
            </p>
          </div>

          <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
            {passError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}
            {passSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl">
                {passSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (Minimum 6 characters) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new confidential password"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-type new password exactly"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
            >
              {passLoading ? 'Saving...' : 'Update Password & Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Status counter helper for filter tabs
  const getStatusCount = (statusKey: string) => {
    return orders.filter((o) => {
      const fs = o.fulfillmentStatus;
      if (statusKey === 'all') return true;
      if (statusKey === 'pending') return fs === 'pending' || fs === 'pending_confirmation';
      if (statusKey === 'confirm') return fs === 'confirm' || fs === 'confirmed';
      if (statusKey === 'hold') return fs === 'hold';
      if (statusKey === 'phone_off') return fs === 'phone_off';
      if (statusKey === 'not_received_call') return fs === 'not_received_call';
      if (statusKey === 'cancel') return fs === 'cancel' || fs === 'cancelled';
      if (statusKey === 'return') return fs === 'return' || fs === 'returned';
      if (statusKey === 'shipped_delivered') return fs === 'shipped' || fs === 'delivered';
      return fs === statusKey;
    }).length;
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const fs = o.fulfillmentStatus;
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'pending') {
        if (fs !== 'pending' && fs !== 'pending_confirmation') return false;
      } else if (orderStatusFilter === 'confirm') {
        if (fs !== 'confirm' && fs !== 'confirmed') return false;
      } else if (orderStatusFilter === 'hold') {
        if (fs !== 'hold') return false;
      } else if (orderStatusFilter === 'phone_off') {
        if (fs !== 'phone_off') return false;
      } else if (orderStatusFilter === 'not_received_call') {
        if (fs !== 'not_received_call') return false;
      } else if (orderStatusFilter === 'cancel') {
        if (fs !== 'cancel' && fs !== 'cancelled') return false;
      } else if (orderStatusFilter === 'return') {
        if (fs !== 'return' && fs !== 'returned') return false;
      } else if (orderStatusFilter === 'shipped_delivered') {
        if (fs !== 'shipped' && fs !== 'delivered') return false;
      } else if (fs !== orderStatusFilter) {
        return false;
      }
    }
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.district.toLowerCase().includes(q) ||
        (o.address && o.address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Floating Status Save Toast Notification */}
      {statusSaveNotice && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-pulse">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{statusSaveNotice}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center font-black text-sm">
            SG
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black">
              Sarder Gallery • Admin Portal
            </h1>
            <p className="text-[10px] text-slate-400">
              Logged in as: {adminUser?.fullName} ({adminUser?.role})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAdminData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/api/admin/backup/export"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs flex items-center gap-1"
            title="Download Full Database Backup (JSON)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backup JSON</span>
          </a>

          <button
            onClick={adminLogout}
            className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            onClick={onClose}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
          >
            View Storefront
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 sm:w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="p-3 space-y-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'dashboard' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'orders' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              {orders.filter((o) => o.fulfillmentStatus === 'pending_confirmation').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {orders.filter((o) => o.fulfillmentStatus === 'pending_confirmation').length}
                </span>
              )}
            </button>

            {/* PRODUCT MENU WITH REQUESTED SUB-OPTIONS */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsProductMenuOpen(!isProductMenuOpen);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                  activeTab === 'products' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Package className="w-4 h-4" />
                  <span className="font-bold">Product</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {products.filter((p) => p.stock <= lowStockThreshold).length > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {products.filter((p) => p.stock <= lowStockThreshold).length}
                    </span>
                  )}
                  {isProductMenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Sub items: Add New Product, Category, All Product, Low Stock */}
              {isProductMenuOpen && (
                <div className="ml-3 pl-2.5 border-l-2 border-rose-100 space-y-0.5 py-1 text-xs">
                  {/* Sub 1: Add New Product */}
                  <button
                    onClick={handleOpenAddProduct}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 transition font-medium text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Add New Product</span>
                  </button>

                  {/* Sub 2: Category */}
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setProductSubTab('categories');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium text-left ${
                      activeTab === 'products' && productSubTab === 'categories'
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Layers className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Category</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-md font-mono text-slate-500">
                      {adminCategories.length}
                    </span>
                  </button>

                  {/* Sub 3: All Product */}
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setProductSubTab('all');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium text-left ${
                      activeTab === 'products' && productSubTab === 'all'
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>All Product</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-md font-mono text-slate-500">
                      {products.length}
                    </span>
                  </button>

                  {/* Sub 4: Low Stock */}
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setProductSubTab('low_stock');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition font-medium text-left ${
                      activeTab === 'products' && productSubTab === 'low_stock'
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Low Stock</span>
                    </div>
                    {products.filter((p) => p.stock <= lowStockThreshold).length > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {products.filter((p) => p.stock <= lowStockThreshold).length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* TAB: Brand & Logo Customizer */}
            <button
              onClick={() => setActiveTab('brand_settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'brand_settings' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Store Logo & Branding</span>
            </button>

            {/* TAB: Marketing & Tracking (Pixel/CAPI/GA4) */}
            <button
              onClick={() => setActiveTab('marketing_tracking')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'marketing_tracking' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Marketing, Pixel & CAPI</span>
            </button>

            {/* NEW TAB: Banners */}
            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'banners' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Hero Banners</span>
            </button>

            {/* NEW TAB: Landing Pages */}
            <button
              onClick={() => setActiveTab('landing_pages')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'landing_pages' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Sales Landing Pages</span>
            </button>

            <button
              onClick={() => setActiveTab('courier')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'courier' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Courier Integration</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'payments' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Gateways</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'coupons' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Coupons & Discounts</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'delivery' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Delivery Charges</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'reports' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Financial Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'security' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security & Audit</span>
            </button>
          </nav>

          <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400">
            Sarder Gallery Admin v1.1 • Full Stack Engine
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-semibold">Total Orders</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                    {financials?.totalOrders || orders.length} Orders
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                    Pending: {orders.filter((o) => o.fulfillmentStatus === 'pending_confirmation').length} Orders
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-semibold">Net Revenue</span>
                  <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
                    {formatBDT(financials?.netRevenue || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gross: {formatBDT(financials?.grossSales || 0)}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-semibold">COD Pending Collection</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                    {formatBDT(financials?.codPending || 0)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                    Collected: {formatBDT(financials?.codCollected || 0)}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-semibold">Products in Catalog</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                    {products.length} Items
                  </div>
                  <span className="text-[10px] text-rose-500 font-bold mt-1 block">
                    Low Stock (≤5): {products.filter((p) => p.stock <= 5).length} Items
                  </span>
                </div>
              </div>

              {/* Status Summary Pill Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 py-1 mr-1">Order Status Pipeline:</span>
                <button
                  onClick={() => { setOrderStatusFilter('pending'); setActiveTab('orders'); }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending: {getStatusCount('pending')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('confirm'); setActiveTab('orders'); }}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Confirm: {getStatusCount('confirm')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('hold'); setActiveTab('orders'); }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>Hold: {getStatusCount('hold')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('phone_off'); setActiveTab('orders'); }}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <PhoneOff className="w-3.5 h-3.5 text-orange-600" />
                  <span>Phone Off: {getStatusCount('phone_off')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('not_received_call'); setActiveTab('orders'); }}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <PhoneMissed className="w-3.5 h-3.5 text-rose-600" />
                  <span>Not Received Call: {getStatusCount('not_received_call')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('cancel'); setActiveTab('orders'); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cancel: {getStatusCount('cancel')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('return'); setActiveTab('orders'); }}
                  className="bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                  <span>Return: {getStatusCount('return')}</span>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter('shipped_delivered'); setActiveTab('orders'); }}
                  className="bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Shipped/Delivered: {getStatusCount('shipped_delivered')}</span>
                </button>
              </div>

              {/* Recent Orders table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-800 text-sm">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    View All Orders →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order Number</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Total (BDT)</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-rose-600">{o.orderNumber}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{o.customerName}</div>
                            <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                          </td>
                          <td className="p-3 text-slate-600">{o.district}</td>
                          <td className="p-3 font-bold text-slate-900">{formatBDT(o.total)}</td>
                          <td className="p-3 uppercase text-[10px] font-semibold text-slate-600">
                            {o.paymentMethod}
                          </td>
                          <td className="p-3">
                            {(() => {
                              const badge = getStatusBadgeStyle(o.fulfillmentStatus);
                              return (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                  <span>{formatStatusLabel(o.fulfillmentStatus)}</span>
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400">
                            No orders found yet. Place a test order on the storefront!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORE LOGO & BRANDING CUSTOMIZER */}
          {activeTab === 'brand_settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Store Logo & Brand Identity</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize your storefront logo, favicon tab icon, store names, and instant brand visuals.
                </p>
              </div>

              {/* Logo Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-rose-500" />
                    <span>Store Logo Customization</span>
                  </h3>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
                    Header, Footer & Invoices
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Logo Image URL
                      </label>
                      <input
                        type="text"
                        value={settings?.logoUrl || ''}
                        onChange={(e) =>
                          setSettings((prev: any) => ({
                            ...prev,
                            logoUrl: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/logo.png or choose from presets below"
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none"
                      />
                    </div>

                    {/* File Upload Button */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5 text-rose-600" />
                        <span>Upload Logo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingField('logo');
                            const url = await uploadImageFile(file);
                            setUploadingField(null);
                            if (url) {
                              setSettings((prev: any) => ({ ...prev, logoUrl: url }));
                            }
                          }}
                        />
                      </label>
                      {uploadingField === 'logo' && (
                        <span className="text-xs text-rose-600 animate-pulse font-semibold">Uploading...</span>
                      )}
                    </div>

                    {/* Quick Logo Presets */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                        Or Pick from Curated Baby Brand Logo Presets:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {LOGO_PRESETS.map((lp, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSettings((prev: any) => ({ ...prev, logoUrl: lp.url }))}
                            className="flex items-center gap-2 p-1.5 border border-slate-200 hover:border-rose-400 rounded-xl bg-slate-50 hover:bg-white text-left transition"
                          >
                            <img src={lp.url} alt={lp.name} className="w-7 h-7 object-cover rounded-lg" />
                            <span className="text-[11px] font-semibold text-slate-700 truncate">{lp.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Previews */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">Live Preview in Storefront Header</span>
                    <div className="bg-white p-3 rounded-xl border border-rose-100 flex items-center gap-3 shadow-xs">
                      {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt="Store Logo" className="h-10 max-w-[120px] object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-300 flex items-center justify-center text-white font-black text-xl shadow-xs">
                          👶
                        </div>
                      )}
                      <div>
                        <div className="font-black text-slate-800 text-sm">{settings?.businessNameBn || 'সরদার গ্যালারি'}</div>
                        <div className="text-[10px] text-slate-400">{settings?.businessNameEn || 'Sarder Gallery'} • Premium Baby Shop</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      💡 <strong>Tip:</strong> Transparent PNG or SVG files (Height: 40px - 60px) look best on both mobile and desktop headers.
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon & Store Names Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Browser Tab Icon & Store Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Favicon URL (Browser Icon)</label>
                    <input
                      type="text"
                      value={settings?.faviconUrl || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          faviconUrl: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/favicon.ico"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none"
                    />
                    <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl cursor-pointer transition">
                      <Upload className="w-3 h-3 text-rose-600" />
                      <span>Upload Favicon</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setSettings((prev: any) => ({ ...prev, faviconUrl: url }));
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Store Name (Bengali)</label>
                    <input
                      type="text"
                      value={settings?.businessNameBn || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          businessNameBn: e.target.value,
                        }))
                      }
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Store Name (English)</label>
                    <input
                      type="text"
                      value={settings?.businessNameEn || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          businessNameEn: e.target.value,
                        }))
                      }
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => settings && handleSaveSettings(settings)}
                  className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Brand & Logo Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: MARKETING, META PIXEL, CAPI & GOOGLE ANALYTICS */}
          {activeTab === 'marketing_tracking' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Marketing Analytics & Tracking Engine</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure Google Analytics 4, Meta Pixel (Facebook / Instagram Ads), and server-side Conversions API (CAPI).
                </p>
              </div>

              {/* Meta Pixel & CAPI Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">Meta Pixel & Conversions API (CAPI)</h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Meta Ads Manager (FB & IG)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Meta Pixel ID</label>
                    <input
                      type="text"
                      value={settings?.analytics?.metaPixelId || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          analytics: { ...prev.analytics, metaPixelId: e.target.value },
                        }))
                      }
                      placeholder="e.g. 1234567890123456"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Located in Meta Events Manager ➔ Data Sources ➔ Settings ➔ Pixel ID.
                    </p>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                      <input
                        type="checkbox"
                        checked={settings?.analytics?.metaCapiEnabled || false}
                        onChange={(e) =>
                          setSettings((prev: any) => ({
                            ...prev,
                            analytics: { ...prev.analytics, metaCapiEnabled: e.target.checked },
                          }))
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Enable Conversions API (CAPI)</span>
                        <span className="text-[10px] text-slate-500">
                          Dispatches server-to-server purchase events to bypass ad blockers & iOS privacy restrictions.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {settings?.analytics?.metaCapiEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Meta CAPI System User Access Token
                      </label>
                      <input
                        type="password"
                        value={settings?.analytics?.metaCapiAccessToken || ''}
                        onChange={(e) =>
                          setSettings((prev: any) => ({
                            ...prev,
                            analytics: { ...prev.analytics, metaCapiAccessToken: e.target.value },
                          }))
                        }
                        placeholder="EAAGxxxxxxxxxxxxxxxxxxxx..."
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Generate via Meta Business Manager ➔ Users ➔ System Users ➔ Generate New Token.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Test Event Code (Optional for Live Verification)
                      </label>
                      <input
                        type="text"
                        value={settings?.analytics?.testEventCode || ''}
                        onChange={(e) =>
                          setSettings((prev: any) => ({
                            ...prev,
                            analytics: { ...prev.analytics, testEventCode: e.target.value },
                          }))
                        }
                        placeholder="e.g. TEST12345"
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Found in Meta Events Manager ➔ Test Events tab.
                      </p>
                    </div>
                  </div>
                )}

                {/* Diagnostic Test Button */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestCapiDiagnostic}
                    disabled={testCapiLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                  >
                    <Activity className={`w-3.5 h-3.5 ${testCapiLoading ? 'animate-spin' : ''}`} />
                    <span>{testCapiLoading ? 'Testing Connection...' : 'Send Diagnostic Test Event to Meta & Google'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Triggers a safe test event to verify your tracking integration.
                  </span>
                </div>

                {/* Diagnostic Results Box */}
                {testCapiResult && (
                  <div className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${testCapiResult.success !== false ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {testCapiResult.success !== false ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                      <span>Diagnostic Event Result: {testCapiResult.success !== false ? 'Successfully Executed' : 'Execution Notice'}</span>
                    </div>
                    {testCapiResult.message && <p className="text-[11px]">{testCapiResult.message}</p>}
                    {testCapiResult.reason && <p className="text-[11px] text-amber-800">Notice: {testCapiResult.reason}</p>}
                    {testCapiResult.data && (
                      <pre className="text-[10px] bg-white/70 p-2 rounded-lg font-mono overflow-x-auto">
                        {JSON.stringify(testCapiResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Google Analytics 4 Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900">Google Analytics 4 (GA4) / Google Tag</h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    Google Tracking
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Google Analytics 4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={settings?.analytics?.googleAnalyticsId || ''}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        analytics: { ...prev.analytics, googleAnalyticsId: e.target.value },
                      }))
                    }
                    placeholder="G-XXXXXXXXXX or GTM-XXXXXXXX"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter your GA4 Measurement ID starting with <code>G-</code>. Automatically injects Google Tag (gtag.js).
                  </p>
                </div>
              </div>

              {/* Automatically Tracked Events Reference Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-xs">
                  📊 Automatically Tracked E-Commerce Events in Sarder Gallery:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-800">1. PageView:</strong> Fires on homepage, product catalog, and sales landing page loads.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-800">2. ViewContent:</strong> Fires when a customer views detailed product specs or campaign landing pages.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-800">3. AddToCart:</strong> Fires when items are added to the bag with price and SKU payload.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-800">4. InitiateCheckout:</strong> Fires when the checkout drawer or modal is opened.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 col-span-1 sm:col-span-2">
                    <strong className="text-emerald-700">5. Purchase:</strong> High-value event fired both in-browser via Pixel/GA4 and server-to-server via Meta CAPI with order ID, total BDT value, and SHA-256 hashed customer phone.
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => settings && handleSaveSettings(settings)}
                  className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Marketing & Tracking Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: HERO BANNERS MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-800">Hero Banners & Carousel</h2>
                  <p className="text-xs text-slate-500">Manage promotional slides, hero images, CTA texts, and links.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBanner({
                      titleBn: '',
                      subtitleBn: '',
                      tagBn: 'Special Offer',
                      imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
                      linkUrl: '/products',
                      buttonTextBn: 'Shop Now',
                      isActive: true,
                      sortOrder: banners.length + 1,
                    });
                    setIsBannerModalOpen(true);
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Banner</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
                    <div className="aspect-16/7 bg-slate-100 overflow-hidden relative">
                      <img src={b.imageUrl} alt={b.titleBn} className="w-full h-full object-cover" />
                      {b.tagBn && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {b.tagBn}
                        </span>
                      )}
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                        {b.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{b.titleBn}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{b.subtitleBn}</p>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t">
                        <span>Link: <code>{b.linkUrl}</code></span>
                        <span>Button: <strong>{b.buttonTextBn}</strong></span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingBanner(b);
                          setIsBannerModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SALES LANDING PAGES */}
          {activeTab === 'landing_pages' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-800">Dedicated Sales Landing Pages</h2>
                  <p className="text-xs text-slate-500">
                    High-converting single-product landing pages with urgency countdown, benefit checklist, and 1-click checkout.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingLandingPage({
                      title: '',
                      slug: `special-deal-${Date.now()}`,
                      headlineBn: '',
                      subheadlineBn: '',
                      badgeTextBn: 'Special Offer • Free Delivery',
                      productId: products[0]?.id || 'prod-1',
                      bannerImage: products[0]?.mainImage || '',
                      logoUrl: '',
                      featuresBn: [
                        '100% Baby-Safe & Non-Toxic Premium Materials',
                        'Fastest Cash on Delivery across Bangladesh',
                        '72-Hour Easy Replacement Warranty',
                      ],
                      callToActionBn: 'Order Now • Cash on Delivery',
                      isActive: true,
                    });
                    setIsLandingPageModalOpen(true);
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Landing Page</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Campaign Title</th>
                      <th className="p-3">Slug / URL</th>
                      <th className="p-3">Featured Product</th>
                      <th className="p-3">Traffic Views</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {landingPages.map((lp) => {
                      const associatedProd = products.find((p) => p.id === lp.productId);
                      return (
                        <tr key={lp.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-800">{lp.title}</td>
                          <td className="p-3 font-mono text-rose-600 font-semibold">
                            /landing/{lp.slug}
                          </td>
                          <td className="p-3 text-slate-600">
                            {associatedProd?.nameBn || lp.productId}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{lp.viewCount || 0} visits</td>
                          <td className="p-3 font-bold text-emerald-600">{lp.orderCount || 0} orders</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${lp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {lp.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            {onViewLandingPage && (
                              <button
                                onClick={() => onViewLandingPage(lp.slug)}
                                className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] inline-flex items-center gap-1"
                                title="Open Live Landing Page"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyLandingLink(lp.slug)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              title="Copy Campaign Link"
                            >
                              {copiedSlug === lp.slug ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setEditingLandingPage(lp);
                                setIsLandingPageModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLandingPage(lp.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {landingPages.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          No landing pages created yet. Click "Create Landing Page" to build your first campaign!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-rose-500" />
                    <span>Order Management & Call Center</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify customer calls, update statuses (Pending, Confirm, Hold, Phone Off, Not Received Call, Cancel, Return), and manage shipments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/api/admin/backup/export-csv/orders"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {/* Status Pipeline Filter Chips */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                    orderStatusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>All Orders</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {getStatusCount('all')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'pending'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'pending' ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-900'}`}>
                    {getStatusCount('pending')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('confirm')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'confirm'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'confirm' ? 'bg-white/30 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                    {getStatusCount('confirm')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('hold')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'hold'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
                  }`}
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Hold</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'hold' ? 'bg-white/30 text-white' : 'bg-purple-200 text-purple-900'}`}>
                    {getStatusCount('hold')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('phone_off')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'phone_off'
                      ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
                  }`}
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Phone Off</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'phone_off' ? 'bg-white/30 text-white' : 'bg-orange-200 text-orange-900'}`}>
                    {getStatusCount('phone_off')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('not_received_call')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'not_received_call'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                  }`}
                >
                  <PhoneMissed className="w-3.5 h-3.5" />
                  <span>Not Received Call</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'not_received_call' ? 'bg-white/30 text-white' : 'bg-rose-200 text-rose-900'}`}>
                    {getStatusCount('not_received_call')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('cancel')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'cancel'
                      ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'cancel' ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    {getStatusCount('cancel')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('return')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'return'
                      ? 'bg-red-600 text-white border-red-700 shadow-xs'
                      : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'return' ? 'bg-white/30 text-white' : 'bg-red-200 text-red-900'}`}>
                    {getStatusCount('return')}
                  </span>
                </button>

                <button
                  onClick={() => setOrderStatusFilter('shipped_delivered')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                    orderStatusFilter === 'shipped_delivered'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Shipped/Delivered</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${orderStatusFilter === 'shipped_delivered' ? 'bg-white/30 text-white' : 'bg-sky-200 text-sky-900'}`}>
                    {getStatusCount('shipped_delivered')}
                  </span>
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[220px] relative">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order #, Customer Name, Phone, or District..."
                    className="w-full text-xs border border-slate-200 rounded-xl py-2 pl-8 pr-3 focus:outline-none focus:border-rose-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-rose-400 font-semibold text-slate-700"
                  >
                    <option value="all">All Statuses ({getStatusCount('all')})</option>
                    <option value="pending">Pending ({getStatusCount('pending')})</option>
                    <option value="confirm">Confirm ({getStatusCount('confirm')})</option>
                    <option value="hold">Hold ({getStatusCount('hold')})</option>
                    <option value="phone_off">Phone Off ({getStatusCount('phone_off')})</option>
                    <option value="not_received_call">Not Received Call ({getStatusCount('not_received_call')})</option>
                    <option value="cancel">Cancel ({getStatusCount('cancel')})</option>
                    <option value="return">Return ({getStatusCount('return')})</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-semibold ml-auto">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order # & Date</th>
                        <th className="p-3">Customer & Phone</th>
                        <th className="p-3">Delivery Address</th>
                        <th className="p-3">Items Ordered</th>
                        <th className="p-3">Amount & COD</th>
                        <th className="p-3">Order Status</th>
                        <th className="p-3">Quick Change</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((o) => {
                        const badge = getStatusBadgeStyle(o.fulfillmentStatus);
                        return (
                          <tr key={o.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3">
                              <span className="font-bold text-rose-600 block">{o.orderNumber}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(o.createdAt).toLocaleDateString('en-GB')}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{o.customerName}</div>
                              <a
                                href={`tel:${o.customerPhone}`}
                                className="text-[11px] text-rose-600 hover:text-rose-700 font-mono font-bold flex items-center gap-1 mt-0.5"
                                title="Click to call customer directly"
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{o.customerPhone}</span>
                              </a>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-700 block">{o.district}</span>
                              <span className="text-[10px] text-slate-400 max-w-[170px] truncate block" title={o.address}>
                                {o.address}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {o.items.slice(0, 2).map((it, idx) => (
                                  <img
                                    key={idx}
                                    src={it.image}
                                    alt={it.nameEn || it.nameBn}
                                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                                    title={`${it.nameEn || it.nameBn} (Qty: ${it.quantity})`}
                                  />
                                ))}
                                {o.items.length > 2 && (
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    +{o.items.length - 2}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                                {o.items.reduce((acc, it) => acc + it.quantity, 0)} pc(s)
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{formatBDT(o.total)}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1 rounded">
                                  {o.paymentMethod}
                                </span>
                                {o.paymentMethod === 'cod' && (
                                  <span className={`text-[9px] font-bold px-1 rounded ${
                                    o.codStatus === 'collected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {o.codStatus === 'collected' ? 'Collected' : 'COD'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <select
                                  value={o.fulfillmentStatus}
                                  onChange={(e) =>
                                    handleOrderStatusUpdate(o.id, e.target.value as OrderStatus)
                                  }
                                  className={`text-[11px] font-bold border rounded-xl px-2 py-1 bg-white focus:outline-none shadow-2xs ${badge.text} ${badge.border}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirm">Confirm</option>
                                  <option value="hold">Hold</option>
                                  <option value="phone_off">Phone Off</option>
                                  <option value="not_received_call">Not Received Call</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancel">Cancel</option>
                                  <option value="return">Return</option>
                                </select>
                              </div>
                            </td>
                            <td className="p-3">
                              {/* Quick 1-click update buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOrderStatusUpdate(o.id, 'confirm')}
                                  className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                                  title="Confirm Order"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOrderStatusUpdate(o.id, 'hold')}
                                  className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
                                  title="Put on Hold"
                                >
                                  <PauseCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOrderStatusUpdate(o.id, 'phone_off')}
                                  className="p-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition"
                                  title="Mark Phone Off"
                                >
                                  <PhoneOff className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOrderStatusUpdate(o.id, 'not_received_call')}
                                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                                  title="Mark Not Received Call"
                                >
                                  <PhoneMissed className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedOrderForManage(o);
                                    setManageOrderStatus(o.fulfillmentStatus);
                                    setManageOrderNote('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                                  title="Manage Order, Status & History"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Manage</span>
                                </button>
                                <button
                                  onClick={() => setSelectedOrderForInvoice(o)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                  title="Print Invoice"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-slate-400">
                            No orders found matching the filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT WITH SUB-OPTIONS (All Product, Category, Low Stock, Add New Product) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Top Sub-Navigation Bar matching User Requirements */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setProductSubTab('all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      productSubTab === 'all'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>All Product</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        productSubTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {products.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setProductSubTab('categories')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      productSubTab === 'categories'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Category</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        productSubTab === 'categories' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {adminCategories.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setProductSubTab('low_stock')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      productSubTab === 'low_stock'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Low Stock</span>
                    {products.filter((p) => p.stock <= lowStockThreshold).length > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          productSubTab === 'low_stock' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {products.filter((p) => p.stock <= lowStockThreshold).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Sub-option: Add New Product */}
                <button
                  onClick={handleOpenAddProduct}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* ========================================================= */}
              {/* SUB-VIEW 1: ALL PRODUCT                                    */}
              {/* ========================================================= */}
              {productSubTab === 'all' && (
                <div className="space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2.5 items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search product by name or SKU..."
                          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-rose-500"
                        />
                        {productSearch && (
                          <button
                            onClick={() => setProductSearch('')}
                            className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Filter */}
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="all">All Categories ({products.length})</option>
                        {adminCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEn || c.nameBn} ({products.filter((p) => p.categoryId === c.id).length})
                          </option>
                        ))}
                      </select>

                      {/* Stock Filter */}
                      <select
                        value={productStockFilter}
                        onChange={(e) => setProductStockFilter(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="all">All Stock Status</option>
                        <option value="in_stock">In Stock ({products.filter((p) => p.stock > 0).length})</option>
                        <option value="low_stock">
                          Low Stock (≤{lowStockThreshold}) ({products.filter((p) => p.stock <= lowStockThreshold).length})
                        </option>
                        <option value="out_of_stock">
                          Out of Stock ({products.filter((p) => p.stock === 0).length})
                        </option>
                      </select>

                      {(productSearch || productCategoryFilter !== 'all' || productStockFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setProductSearch('');
                            setProductCategoryFilter('all');
                            setProductStockFilter('all');
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Image</th>
                            <th className="p-3">Product Name & SKU</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Selling Price</th>
                            <th className="p-3">Cost (Staff Only)</th>
                            <th className="p-3">Stock (Quick Edit)</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products
                            .filter((p) => {
                              if (productCategoryFilter !== 'all' && p.categoryId !== productCategoryFilter)
                                return false;
                              if (productStockFilter === 'low_stock' && p.stock > lowStockThreshold)
                                return false;
                              if (productStockFilter === 'out_of_stock' && p.stock !== 0) return false;
                              if (productStockFilter === 'in_stock' && p.stock === 0) return false;
                              if (productSearch.trim()) {
                                const q = productSearch.toLowerCase();
                                const matchName =
                                  (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
                                  (p.nameEn && p.nameEn.toLowerCase().includes(q));
                                const matchSku = p.sku && p.sku.toLowerCase().includes(q);
                                return matchName || matchSku;
                              }
                              return true;
                            })
                            .map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/80">
                                <td className="p-3">
                                  <img
                                    src={p.mainImage}
                                    alt={p.nameBn}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                                  />
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-800 block line-clamp-1">
                                    {p.nameEn ? `${p.nameEn} (${p.nameBn})` : p.nameBn}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                                </td>
                                <td className="p-3 text-slate-600">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                                    {adminCategories.find((c) => c.id === p.categoryId)?.nameEn ||
                                      adminCategories.find((c) => c.id === p.categoryId)?.nameBn ||
                                      p.categoryId}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-rose-600">
                                  {formatBDT(p.salePrice ?? p.price)}
                                  {p.salePrice && (
                                    <span className="text-[10px] text-slate-400 line-through block font-normal">
                                      {formatBDT(p.price)}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-500 font-medium">
                                  {p.costPrice ? formatBDT(p.costPrice) : '—'}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={p.stock <= 0 || stockUpdatingId === p.id}
                                      onClick={() => handleQuickStockUpdate(p.id, p.stock - 1)}
                                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-30"
                                      title="Decrease Stock"
                                    >
                                      -
                                    </button>
                                    <span
                                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                        p.stock === 0
                                          ? 'bg-rose-600 text-white'
                                          : p.stock <= lowStockThreshold
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {p.stock}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={stockUpdatingId === p.id}
                                      onClick={() => handleQuickStockUpdate(p.id, p.stock + 1)}
                                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                                      title="Increase Stock"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      p.isPublished
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {p.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                                <td className="p-3 text-right space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.nameBn)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {products.length === 0 && (
                            <tr>
                              <td colSpan={8} className="text-center py-8 text-slate-400">
                                No products found. Click "Add New Product" to create your first product.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-VIEW 2: CATEGORY                                       */}
              {/* ========================================================= */}
              {productSubTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">
                        Category Management (ক্যাটেগরি ম্যানেজমেন্ট)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Organize store products into categories, manage thumbnails, slugs, and storefront display order.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory({
                          nameBn: '',
                          nameEn: '',
                          slug: '',
                          image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
                          displayOrder: adminCategories.length + 1,
                          isActive: true,
                        });
                        setIsCategoryModalOpen(true);
                      }}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Category</span>
                    </button>
                  </div>

                  {/* Categories Grid / Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Image</th>
                            <th className="p-3">Category Name (Bangla & English)</th>
                            <th className="p-3">Slug Key</th>
                            <th className="p-3">Assigned Products</th>
                            <th className="p-3">Display Order</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminCategories.map((c) => {
                            const count = products.filter((p) => p.categoryId === c.id).length;
                            return (
                              <tr key={c.id} className="hover:bg-slate-50/80">
                                <td className="p-3">
                                  <img
                                    src={c.image}
                                    alt={c.nameBn}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                                  />
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block text-xs">{c.nameBn}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{c.nameEn}</span>
                                </td>
                                <td className="p-3 font-mono text-[11px] text-slate-500">
                                  {c.slug}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => {
                                      setProductCategoryFilter(c.id);
                                      setProductSubTab('all');
                                    }}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full text-[11px] transition"
                                    title="Click to view products in this category"
                                  >
                                    {count} {count === 1 ? 'Product' : 'Products'}
                                  </button>
                                </td>
                                <td className="p-3 font-bold text-slate-700">
                                  #{c.displayOrder}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      c.isActive
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {c.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-3 text-right space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingCategory(c);
                                      setIsCategoryModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                    title="Edit Category"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(c.id, c.nameBn)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {adminCategories.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center py-8 text-slate-400">
                                No categories found. Click "Add New Category" to create one.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-VIEW 3: LOW STOCK                                      */}
              {/* ========================================================= */}
              {productSubTab === 'low_stock' && (
                <div className="space-y-4">
                  {/* Low Stock Alert Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900 text-sm">
                          Low Stock Alert & Inventory Replenishment (স্টক সতর্কতা)
                        </h3>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Products below your threshold require immediate restocking to prevent order cancellations.
                        </p>
                      </div>
                    </div>

                    {/* Threshold selector */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-xs">
                      <span className="font-semibold text-slate-600">Threshold:</span>
                      {[3, 5, 10, 20].map((num) => (
                        <button
                          key={num}
                          onClick={() => setLowStockThreshold(num)}
                          className={`px-2 py-0.5 rounded-lg font-bold transition ${
                            lowStockThreshold === num
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          ≤ {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Items Under Alert</span>
                        <span className="text-lg font-black text-amber-600">
                          {products.filter((p) => p.stock <= lowStockThreshold).length}
                        </span>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        Threshold ≤ {lowStockThreshold}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Out of Stock (Zero)</span>
                        <span className="text-lg font-black text-rose-600">
                          {products.filter((p) => p.stock === 0).length}
                        </span>
                      </div>
                      <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                        Critical
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Sufficient Stock</span>
                        <span className="text-lg font-black text-emerald-600">
                          {products.filter((p) => p.stock > lowStockThreshold).length}
                        </span>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Healthy
                      </span>
                    </div>
                  </div>

                  {/* Low Stock Table with Instant 1-Click Restock */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Current Stock</th>
                            <th className="p-3">Urgency Status</th>
                            <th className="p-3">Quick Restock (+ Quantity)</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products
                            .filter((p) => p.stock <= lowStockThreshold)
                            .map((p) => {
                              const isOutOfStock = p.stock === 0;
                              return (
                                <tr key={p.id} className="hover:bg-slate-50/80">
                                  <td className="p-3">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={p.mainImage}
                                        alt={p.nameBn}
                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                      />
                                      <div>
                                        <span className="font-bold text-slate-900 block line-clamp-1">
                                          {p.nameEn ? `${p.nameEn} (${p.nameBn})` : p.nameBn}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-slate-600">
                                    {adminCategories.find((c) => c.id === p.categoryId)?.nameEn ||
                                      adminCategories.find((c) => c.id === p.categoryId)?.nameBn ||
                                      p.categoryId}
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`font-black text-sm px-2.5 py-1 rounded-xl inline-block ${
                                        isOutOfStock
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}
                                    >
                                      {p.stock} units
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {isOutOfStock ? (
                                      <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                        Out Of Stock
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                        Running Low
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {/* 1-Click Fast Stock Replenishment */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {[5, 10, 25].map((addAmount) => (
                                        <button
                                          key={addAmount}
                                          type="button"
                                          disabled={stockUpdatingId === p.id}
                                          onClick={() => handleQuickStockUpdate(p.id, p.stock + addAmount)}
                                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition shadow-2xs"
                                          title={`Add ${addAmount} to current stock`}
                                        >
                                          +{addAmount}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(p);
                                        setIsProductModalOpen(true);
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition"
                                    >
                                      <Edit className="w-3 h-3" />
                                      <span>Edit Product</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          {products.filter((p) => p.stock <= lowStockThreshold).length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-10 text-emerald-600 font-bold">
                                All products are well-stocked! No items below threshold ({lowStockThreshold}).
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: COURIER INTEGRATION */}
          {activeTab === 'courier' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Bangladesh Courier Integration</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure API integration adapters for Pathao, Steadfast, and RedX couriers. Orders can also be booked manually with consignment IDs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Pathao Courier</h3>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      API Adapter
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter your Pathao merchant client ID and API secret.
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">Client / API Key</label>
                    <input
                      type="text"
                      value={settings?.courierSettings?.pathaoApiKey || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          courierSettings: { ...prev.courierSettings, pathaoApiKey: e.target.value },
                        }))
                      }
                      placeholder="e.g. pth_live_xxxx"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Steadfast Courier</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      API Adapter
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter your Steadfast Courier merchant API key and secret.
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">API Key</label>
                    <input
                      type="text"
                      value={settings?.courierSettings?.steadfastApiKey || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          courierSettings: { ...prev.courierSettings, steadfastApiKey: e.target.value },
                        }))
                      }
                      placeholder="stdf_api_xxxx"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">RedX Courier</h3>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                      API Adapter
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter your RedX merchant bearer authentication token.
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">Bearer Token</label>
                    <input
                      type="text"
                      value={settings?.courierSettings?.redxToken || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          courierSettings: { ...prev.courierSettings, redxToken: e.target.value },
                        }))
                      }
                      placeholder="redx_token_xxxx"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-slate-800">Booking Shipments:</h4>
                <p className="text-xs text-slate-600">
                  When courier API credentials are configured, clicking "Ship Order" in Orders will automatically create a booking. If API keys are not yet configured, authorized staff can enter a manual consignment tracking ID which customers can track directly.
                </p>
                <button
                  onClick={() => settings && handleSaveSettings(settings)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Courier Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS SETTINGS */}
          {activeTab === 'payments' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Payment Gateway Configuration</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cash on Delivery (COD) is active by default. bKash, Nagad, and SSLCommerz can be configured below.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">Cash on Delivery (COD)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active & Functional
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Customers inspect their baby products upon home delivery and pay in cash directly to the courier agent.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">bKash Merchant Payment</span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.paymentGateways?.bkash?.enabled || false}
                        onChange={(e) =>
                          setSettings((prev: any) => ({
                            ...prev,
                            paymentGateways: {
                              ...prev.paymentGateways,
                              bkash: { ...prev.paymentGateways.bkash, enabled: e.target.checked },
                            },
                          }))
                        }
                      />
                      <span>Enable bKash Option at Checkout</span>
                    </label>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">bKash Merchant Number</label>
                    <input
                      type="text"
                      value={settings?.paymentGateways?.bkash?.merchantNumber || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          paymentGateways: {
                            ...prev.paymentGateways,
                            bkash: { ...prev.paymentGateways.bkash, merchantNumber: e.target.value },
                          },
                        }))
                      }
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">Nagad Payment Gateway</span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.paymentGateways?.nagad?.enabled || false}
                        onChange={(e) =>
                          setSettings((prev: any) => ({
                            ...prev,
                            paymentGateways: {
                              ...prev.paymentGateways,
                              nagad: { ...prev.paymentGateways.nagad, enabled: e.target.checked },
                            },
                          }))
                        }
                      />
                      <span>Enable Nagad Option at Checkout</span>
                    </label>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">Nagad Merchant Number</label>
                    <input
                      type="text"
                      value={settings?.paymentGateways?.nagad?.merchantNumber || ''}
                      onChange={(e) =>
                        setSettings((prev: any) => ({
                          ...prev,
                          paymentGateways: {
                            ...prev.paymentGateways,
                            nagad: { ...prev.paymentGateways.nagad, merchantNumber: e.target.value },
                          },
                        }))
                      }
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                    />
                  </div>
                </div>

                <button
                  onClick={() => settings && handleSaveSettings(settings)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Coupons & Promotional Codes</h2>
                <p className="text-xs text-slate-500">Manage promo codes, discount percentages, and minimum order limits.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Coupon Code</th>
                      <th className="p-3">Discount Type</th>
                      <th className="p-3">Discount Value</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Times Used</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3 font-bold text-rose-600 font-mono">{c.code}</td>
                        <td className="p-3 capitalize">
                          {c.discountType === 'percent'
                            ? 'Percentage (%)'
                            : c.discountType === 'fixed'
                            ? 'Fixed Amount (BDT)'
                            : 'Free Shipping'}
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {c.discountType === 'percent' ? `${c.discountValue}%` : `BDT ${c.discountValue}`}
                        </td>
                        <td className="p-3">BDT {c.minOrderValue}</td>
                        <td className="p-3 font-semibold">{c.usedCount} times</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DELIVERY CHARGES */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Delivery Zones & Fee Configuration</h2>
                <p className="text-xs text-slate-500">Configure inside Dhaka, outside Dhaka, and free delivery thresholds.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Inside Dhaka Delivery Fee (BDT)
                  </label>
                  <input
                    type="number"
                    value={settings?.deliveryInsideDhakaFee || 70}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        deliveryInsideDhakaFee: Number(e.target.value),
                      }))
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Outside Dhaka Delivery Fee (BDT)
                  </label>
                  <input
                    type="number"
                    value={settings?.deliveryOutsideDhakaFee || 130}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        deliveryOutsideDhakaFee: Number(e.target.value),
                      }))
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Free Delivery Minimum Order Amount (BDT)
                  </label>
                  <input
                    type="number"
                    value={settings?.freeDeliveryThreshold || 2500}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        freeDeliveryThreshold: Number(e.target.value),
                      }))
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Top Store Announcement Text
                  </label>
                  <input
                    type="text"
                    value={settings?.announcementTextBn || ''}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        announcementTextBn: e.target.value,
                      }))
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>

                <button
                  onClick={() => settings && handleSaveSettings(settings)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Delivery Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: FINANCIAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Financial Summary & Revenue Reports</h2>
                <p className="text-xs text-slate-500">Gross sales, net revenue, coupon discounts, and cash reconciliation.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500">Gross Product Sales</span>
                    <div className="text-lg font-black text-slate-800 mt-1">
                      {formatBDT(financials?.grossSales || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <span className="text-rose-700">Total Discounts Given</span>
                    <div className="text-lg font-black text-rose-600 mt-1">
                      -{formatBDT(financials?.totalDiscounts || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                    <span className="text-sky-700">Delivery Fees Collected</span>
                    <div className="text-lg font-black text-sky-800 mt-1">
                      {formatBDT(financials?.totalDeliveryFees || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-emerald-700">Total Net Revenue</span>
                    <div className="text-lg font-black text-emerald-800 mt-1">
                      {formatBDT(financials?.netRevenue || 0)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-xs text-slate-800 mb-2">
                    Cash on Delivery (COD) Collection Status:
                  </h4>
                  <div className="flex gap-6 text-xs">
                    <div>
                      <span className="text-slate-400">Pending with Couriers / Customers:</span>
                      <strong className="block text-amber-600 font-bold text-sm">
                        {formatBDT(financials?.codPending || 0)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Reconciled & Deposited to Bank:</span>
                      <strong className="block text-emerald-600 font-bold text-sm">
                        {formatBDT(financials?.codCollected || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY & AUDIT LOGS */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-4xl">
              <div>
                <h2 className="text-lg font-black text-slate-800">Security & Audit Logs</h2>
                <p className="text-xs text-slate-500">
                  Real-time tamper-evident log of administrative logins, password changes, and configuration updates.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Action</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 font-bold text-slate-800 font-mono">{log.action}</td>
                        <td className="p-3 text-slate-600">{log.performedBy}</td>
                        <td className="p-3 text-slate-600">{log.details}</td>
                        <td className="p-3 text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Banner Add / Edit Modal */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 border border-rose-100 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-black text-slate-800">
              {editingBanner.id ? 'Edit Promotional Banner' : 'Add New Hero Banner'}
            </h3>

            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.titleBn || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, titleBn: e.target.value })}
                  placeholder="e.g. আপনার সোনামণির প্রশান্তিময় ঘুম ও আনন্দময় শৈশব"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Subtitle / Promotional Description</label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitleBn || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitleBn: e.target.value })}
                  placeholder="e.g. অটোমেটিক ইলেকট্রিক বেবি রকার ও দোলনায় চলছে বিশেষ ছাড়!"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tag / Badge Text</label>
                  <input
                    type="text"
                    value={editingBanner.tagBn || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, tagBn: e.target.value })}
                    placeholder="e.g. Mega Offer 2026"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Button CTA Label</label>
                  <input
                    type="text"
                    value={editingBanner.buttonTextBn || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonTextBn: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Target Link URL</label>
                <input
                  type="text"
                  value={editingBanner.linkUrl || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                  placeholder="/products or /landing/electric-baby-rocker"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 font-mono focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Banner Image URL *</label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition">
                    <Upload className="w-3 h-3 text-rose-600" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImageFile(file);
                        if (url) {
                          setEditingBanner({ ...editingBanner, imageUrl: url });
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={editingBanner.imageUrl || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none"
                />

                {/* Quick Banner Presets */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Or Choose from High-Res Presets:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BANNER_PRESETS.map((bp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setEditingBanner({
                            ...editingBanner,
                            imageUrl: bp.imageUrl,
                            titleBn: editingBanner.titleBn || bp.titleBn,
                            subtitleBn: editingBanner.subtitleBn || bp.subtitleBn,
                            tagBn: editingBanner.tagBn || bp.tagBn,
                          })
                        }
                        className="text-[10px] text-slate-600 p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg text-left truncate flex items-center gap-1.5"
                      >
                        <img src={bp.imageUrl} alt={bp.name} className="w-5 h-5 rounded object-cover" />
                        <span className="truncate">{bp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {editingBanner.imageUrl && (
                  <div className="mt-2.5 aspect-16/7 max-h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={editingBanner.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-xs font-semibold text-slate-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBanner.isActive !== false}
                    onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                  />
                  <span>Active & Visible on Homepage</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bannerFormSaving}
                  className="px-5 py-2 rounded-xl text-xs bg-rose-500 hover:bg-rose-600 font-bold text-white shadow-md disabled:opacity-50"
                >
                  {bannerFormSaving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Landing Page Add / Edit Modal */}
      {isLandingPageModalOpen && editingLandingPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 border border-rose-100 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-black text-slate-800">
              {editingLandingPage.id ? 'Edit Sales Landing Page' : 'Create Sales Landing Page'}
            </h3>

            <form onSubmit={handleSaveLandingPage} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Campaign Title (Internal)</label>
                  <input
                    type="text"
                    required
                    value={editingLandingPage.title || ''}
                    onChange={(e) => setEditingLandingPage({ ...editingLandingPage, title: e.target.value })}
                    placeholder="e.g. Baby Rocker Flash Sale"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">URL Slug (/landing/&lt;slug&gt;)</label>
                  <input
                    type="text"
                    required
                    value={editingLandingPage.slug || ''}
                    onChange={(e) => setEditingLandingPage({ ...editingLandingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="e.g. electric-rocker-mega"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Associated Product *</label>
                <select
                  value={editingLandingPage.productId || ''}
                  onChange={(e) => {
                    const selProd = products.find((p) => p.id === e.target.value);
                    setEditingLandingPage({
                      ...editingLandingPage,
                      productId: e.target.value,
                      bannerImage: selProd?.mainImage || editingLandingPage.bannerImage,
                    });
                  }}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn} ({formatBDT(p.salePrice ?? p.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Main Headline *</label>
                <input
                  type="text"
                  required
                  value={editingLandingPage.headlineBn || ''}
                  onChange={(e) => setEditingLandingPage({ ...editingLandingPage, headlineBn: e.target.value })}
                  placeholder="e.g. আপনার সোনামণির জন্য সবচেয়ে নিরাপদ ও আধুনিক ইলেকট্রিক বেবি রকার!"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Subheadline / Sales Hook</label>
                <textarea
                  rows={2}
                  value={editingLandingPage.subheadlineBn || ''}
                  onChange={(e) => setEditingLandingPage({ ...editingLandingPage, subheadlineBn: e.target.value })}
                  placeholder="e.g. স্মার্ট ব্লুটুথ মিউজিক ও ৫টি সুইং স্পিড সহ শিশুর শান্ত ঘুম নিশ্চিত করুন..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Promo Badge Text</label>
                  <input
                    type="text"
                    value={editingLandingPage.badgeTextBn || ''}
                    onChange={(e) => setEditingLandingPage({ ...editingLandingPage, badgeTextBn: e.target.value })}
                    placeholder="e.g. Special Offer • Free Delivery"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingLandingPage.callToActionBn || ''}
                    onChange={(e) => setEditingLandingPage({ ...editingLandingPage, callToActionBn: e.target.value })}
                    placeholder="e.g. Order Now (Cash on Delivery)"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Landing Page Banner Image */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800">Landing Page Banner / Hero Image *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const selProd = products.find((p) => p.id === editingLandingPage.productId);
                        if (selProd?.mainImage) {
                          setEditingLandingPage({ ...editingLandingPage, bannerImage: selProd.mainImage });
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                    >
                      Use Product Image
                    </button>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold rounded-lg cursor-pointer transition">
                      <Upload className="w-3 h-3" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImageFile(file);
                          if (url) {
                            setEditingLandingPage({ ...editingLandingPage, bannerImage: url });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  value={editingLandingPage.bannerImage || ''}
                  onChange={(e) => setEditingLandingPage({ ...editingLandingPage, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white focus:border-rose-400 focus:outline-none"
                />

                {editingLandingPage.bannerImage && (
                  <div className="mt-2 aspect-16/7 max-h-32 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <img src={editingLandingPage.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Dedicated Campaign Logo (Optional) */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Campaign Header Logo (Optional)
                  </label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition">
                    <Upload className="w-3 h-3 text-rose-600" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImageFile(file);
                        if (url) {
                          setEditingLandingPage({ ...editingLandingPage, logoUrl: url });
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editingLandingPage.logoUrl || ''}
                  onChange={(e) => setEditingLandingPage({ ...editingLandingPage, logoUrl: e.target.value })}
                  placeholder="Leave empty to use main store logo, or enter custom URL"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-white focus:border-rose-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  If left blank, the landing page automatically displays the main store logo.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Key Features Checklist (Bullet Points)</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(editingLandingPage.featuresBn || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...(editingLandingPage.featuresBn || [])];
                          updated[idx] = e.target.value;
                          setEditingLandingPage({ ...editingLandingPage, featuresBn: updated });
                        }}
                        className="flex-1 text-xs border border-slate-200 rounded-xl p-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingLandingPage.featuresBn || []).filter((_, i) => i !== idx);
                          setEditingLandingPage({ ...editingLandingPage, featuresBn: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="e.g. 5-point safety harness & breathable cotton mesh"
                    className="flex-1 text-xs border border-slate-200 rounded-xl p-2 focus:border-rose-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!featureInput.trim()) return;
                      setEditingLandingPage({
                        ...editingLandingPage,
                        featuresBn: [...(editingLandingPage.featuresBn || []), featureInput.trim()],
                      });
                      setFeatureInput('');
                    }}
                    className="bg-slate-900 hover:bg-black text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 text-xs font-semibold text-slate-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLandingPage.isActive !== false}
                    onChange={(e) => setEditingLandingPage({ ...editingLandingPage, isActive: e.target.checked })}
                  />
                  <span>Active & Accessible</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLandingPageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={landingPageFormSaving}
                  className="px-5 py-2 rounded-xl text-xs bg-rose-500 hover:bg-rose-600 font-bold text-white shadow-md disabled:opacity-50"
                >
                  {landingPageFormSaving ? 'Saving...' : 'Save Landing Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 border border-rose-100 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-black text-slate-800">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Product Name (Bengali) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.nameBn || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameBn: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Product Name (English)</label>
                  <input
                    type="text"
                    value={editingProduct.nameEn || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">SKU Code</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={editingProduct.categoryId || 'cat-rockers'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1 bg-white"
                  >
                    {adminCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn || c.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Regular Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Offer / Sale Price (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Cost Price (৳ - Staff Only)</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Main Image URL</label>
                <input
                  type="text"
                  value={editingProduct.mainImage || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, mainImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescBn || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescBn: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.fullDescBn || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDescBn: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2 mt-1"
                />
              </div>

              <div className="flex gap-4 text-xs font-semibold text-slate-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isPublished !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                  />
                  <span>Published on Storefront</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isBestSeller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productFormSaving}
                  className="px-5 py-2 rounded-xl text-xs bg-rose-500 hover:bg-rose-600 font-bold text-white shadow-md disabled:opacity-50"
                >
                  {productFormSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add / Edit Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">
                {editingCategory.id ? 'Edit Category' : 'Add New Category (নতুন ক্যাটেগরি)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category Name (Bengali) *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.nameBn || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updates: Partial<Category> = { nameBn: val };
                      if (!editingCategory.slug && val) {
                        updates.slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
                      }
                      setEditingCategory({ ...editingCategory, ...updates });
                    }}
                    placeholder="যেমন: কিডস রকার্স"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:outline-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category Name (English)</label>
                  <input
                    type="text"
                    value={editingCategory.nameEn || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updates: Partial<Category> = { nameEn: val };
                      if (!editingCategory.slug && val) {
                        updates.slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
                      }
                      setEditingCategory({ ...editingCategory, ...updates });
                    }}
                    placeholder="e.g. Kids Rockers"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Slug / URL Key *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="kids-rockers"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1 font-mono text-slate-600 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category Image URL</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={editingCategory.image || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-rose-500"
                  />
                  {editingCategory.image && (
                    <img
                      src={editingCategory.image}
                      alt="preview"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.displayOrder ?? 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 mt-1"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive !== false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                    className="rounded text-rose-500"
                  />
                  <span>Active Category (Visible in Storefront & Filters)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryFormSaving}
                  className="px-5 py-2 rounded-xl text-xs bg-rose-500 hover:bg-rose-600 font-bold text-white shadow-md disabled:opacity-50"
                >
                  {categoryFormSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Management & Status Save Modal */}
      {selectedOrderForManage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-5 sm:p-6 border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                    Order Details
                  </span>
                  <h3 className="font-black text-slate-800 text-base sm:text-lg">
                    {selectedOrderForManage.orderNumber}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrderForManage.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForManage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Customer Contact & Call Action Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-900 text-sm">
                    {selectedOrderForManage.customerName}
                  </div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    📱 {selectedOrderForManage.customerPhone}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    📍 {selectedOrderForManage.address}, {selectedOrderForManage.district}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2">
                  <a
                    href={`tel:${selectedOrderForManage.customerPhone}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Customer Now</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForInvoice(selectedOrderForManage);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Printer className="w-3 h-3" />
                    <span>View / Print Invoice</span>
                  </button>
                </div>
              </div>

              {selectedOrderForManage.orderNotes && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-xs">
                  <strong>Customer Note:</strong> {selectedOrderForManage.orderNotes}
                </div>
              )}
            </div>

            {/* Status Selector & Save Area */}
            <div className="bg-white p-4 rounded-2xl border-2 border-rose-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Update Order Status & Verification</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Current: <strong className="text-slate-800">{formatStatusLabel(selectedOrderForManage.fulfillmentStatus)}</strong>
                </span>
              </div>

              {/* Status Radio Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'pending', label: 'Pending', icon: Clock, bg: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' },
                  { key: 'confirm', label: 'Confirm', icon: CheckCircle, bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100' },
                  { key: 'hold', label: 'Hold', icon: PauseCircle, bg: 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100' },
                  { key: 'phone_off', label: 'Phone Off', icon: PhoneOff, bg: 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100' },
                  { key: 'not_received_call', label: 'Not Received Call', icon: PhoneMissed, bg: 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100' },
                  { key: 'cancel', label: 'Cancel', icon: XCircle, bg: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' },
                  { key: 'return', label: 'Return', icon: RotateCcw, bg: 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100' },
                  { key: 'shipped', label: 'Shipped', icon: Truck, bg: 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100' },
                  { key: 'delivered', label: 'Delivered', icon: CheckCheck, bg: 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100' },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = manageOrderStatus === st.key ||
                    (st.key === 'pending' && manageOrderStatus === 'pending_confirmation') ||
                    (st.key === 'confirm' && manageOrderStatus === 'confirmed') ||
                    (st.key === 'cancel' && manageOrderStatus === 'cancelled') ||
                    (st.key === 'return' && manageOrderStatus === 'returned');
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setManageOrderStatus(st.key as OrderStatus)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition text-left ${
                        isSelected
                          ? 'ring-2 ring-rose-500 bg-slate-900 text-white border-slate-900 shadow-sm'
                          : st.bg
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-400' : ''}`} />
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Call Note / Outcome Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Call Outcome / Verification Note (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Phone was switched off',
                    'Did not receive call (No answer)',
                    'Customer confirmed order',
                    'Hold for 2 days as requested',
                    'Wrong number / fake order',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setManageOrderNote(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-lg transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  value={manageOrderNote}
                  onChange={(e) => setManageOrderNote(e.target.value)}
                  placeholder="e.g. Called at 2:30 PM. Customer requested delivery next Sunday. Confirmed address."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-rose-400 focus:outline-none"
                />
              </div>

              {/* Direct Save Button */}
              <button
                type="button"
                onClick={handleSaveOrderFromModal}
                disabled={manageSaving}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>
                  {manageSaving
                    ? 'Saving to Database...'
                    : `Save Order Status as "${formatStatusLabel(manageOrderStatus)}"`}
                </span>
              </button>
            </div>

            {/* Status History & Audit Log */}
            {selectedOrderForManage.statusHistory && selectedOrderForManage.statusHistory.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Status & Call Log History
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedOrderForManage.statusHistory.slice().reverse().map((ev, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-0.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {formatStatusLabel(ev.status)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ev.timestamp).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        By: <span className="font-semibold text-slate-700">{ev.actor}</span>
                      </div>
                      {ev.note && (
                        <div className="text-[11px] text-rose-700 bg-rose-50/60 p-1.5 rounded-lg mt-1 font-medium">
                          📝 {ev.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ordered Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
                <span>Ordered Items ({selectedOrderForManage.items.length})</span>
                <span>Total: {formatBDT(selectedOrderForManage.total)}</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrderForManage.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 flex items-center gap-2">
                        <img src={it.image} alt={it.nameEn || it.nameBn} className="w-8 h-8 rounded-lg object-cover border" />
                        <div>
                          <div className="font-semibold text-slate-800">{it.nameEn || it.nameBn}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</div>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                      <td className="p-2.5 text-right">{formatBDT(it.price)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatBDT(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs space-y-1 text-right">
                <div className="text-slate-500">Subtotal: {formatBDT(selectedOrderForManage.subtotal)}</div>
                <div className="text-slate-500">Delivery Fee: {formatBDT(selectedOrderForManage.deliveryFee)}</div>
                {selectedOrderForManage.discount > 0 && (
                  <div className="text-rose-600 font-semibold">Discount: -{formatBDT(selectedOrderForManage.discount)}</div>
                )}
                <div className="font-black text-sm text-rose-600 pt-1 border-t">
                  Total Payable: {formatBDT(selectedOrderForManage.total)}
                </div>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="pt-2 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForManage(null)}
                className="px-5 py-2.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 border border-rose-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800">Commercial Invoice Preview</h3>
                <p className="text-xs text-slate-500 font-mono">Order Number: {selectedOrderForInvoice.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p><strong>Customer:</strong> {selectedOrderForInvoice.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrderForInvoice.customerPhone}</p>
                <p><strong>Address:</strong> {selectedOrderForInvoice.address}, {selectedOrderForInvoice.district}</p>
              </div>

              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrderForInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{it.nameEn || it.nameBn}</td>
                      <td className="p-2 text-center">{it.quantity}</td>
                      <td className="p-2 text-right">৳{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 border-t space-y-1 text-right">
                <p>Subtotal: ৳{selectedOrderForInvoice.subtotal}</p>
                <p>Delivery Fee: ৳{selectedOrderForInvoice.deliveryFee}</p>
                {selectedOrderForInvoice.discount > 0 && <p className="text-rose-600">Discount: -৳{selectedOrderForInvoice.discount}</p>}
                <p className="font-black text-sm pt-1 border-t text-rose-600">
                  Total Payable: ৳{selectedOrderForInvoice.total}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs bg-slate-900 hover:bg-black font-bold text-white flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
