import type { Order, Product, Category, BusinessSettings, OrderStatus, CodReconciliationStatus } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../data/storeData';

// Read remote API URL if defined in Netlify or environment variables (e.g. VITE_API_URL=https://api.sardergallery.com)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL}${cleanPath}`;
}

export async function fetchJsonSafely<T>(url: string, options?: RequestInit, fallback: T | null = null): Promise<T | null> {
  try {
    const fullUrl = getApiUrl(url);
    const res = await fetch(fullUrl, options);
    if (!res.ok) {
      console.warn(`[API] ${url} returned HTTP ${res.status}`);
      return fallback;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[API] ${url} returned non-JSON response (${contentType}). Returning fallback data.`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${url}:`, err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence for Static Netlify Hosting
// ---------------------------------------------------------------------------
const LOCAL_ORDERS_KEY = 'sg_local_orders';
const LOCAL_PRODUCTS_KEY = 'sg_local_products';
const LOCAL_CATEGORIES_KEY = 'sg_local_categories';
const LOCAL_SETTINGS_KEY = 'sg_local_settings';

// Orders
export function getLocalOrders(): Order[] {
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  try {
    const existing = getLocalOrders();
    const idx = existing.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
    if (idx >= 0) {
      existing[idx] = order;
    } else {
      existing.unshift(order);
    }
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save order to localStorage', e);
  }
}

export function updateLocalOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | null {
  try {
    const orders = getLocalOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return null;
    target.fulfillmentStatus = newStatus;
    target.updatedAt = new Date().toISOString();
    if (!target.statusHistory) target.statusHistory = [];
    target.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      note: note || `Status updated to ${newStatus}`,
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    return target;
  } catch (e) {
    console.error('Failed to update local order status', e);
    return null;
  }
}

export function updateLocalCodStatus(orderId: string, codStatus: CodReconciliationStatus): Order | null {
  try {
    const orders = getLocalOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return null;
    target.codStatus = codStatus;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    return target;
  } catch {
    return null;
  }
}

export function findLocalOrder(query: string): Order | undefined {
  const q = query.trim().toLowerCase();
  const orders = getLocalOrders();
  return orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === q ||
      o.customerPhone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''))
  );
}

// Products
export function getLocalProducts(): Product[] {
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PRODUCTS;
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export function upsertLocalProduct(product: Partial<Product>): Product {
  const products = getLocalProducts();
  const now = new Date().toISOString();
  let saved: Product;
  if (product.id) {
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      saved = { ...products[idx], ...product, updatedAt: now } as Product;
      products[idx] = saved;
    } else {
      saved = { ...product, id: product.id, createdAt: now, updatedAt: now } as Product;
      products.unshift(saved);
    }
  } else {
    const newId = `prod-${Date.now()}`;
    saved = {
      ...product,
      id: newId,
      slug: product.slug || `prod-${Date.now()}`,
      sku: product.sku || `SG-ITEM-${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
      isPublished: product.isPublished !== undefined ? product.isPublished : true,
    } as Product;
    products.unshift(saved);
  }
  saveLocalProducts(products);
  return saved;
}

export function deleteLocalProduct(id: string): boolean {
  const products = getLocalProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length !== products.length) {
    saveLocalProducts(filtered);
    return true;
  }
  return false;
}

// Categories
export function getLocalCategories(): Category[] {
  try {
    const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_CATEGORIES;
}

export function saveLocalCategories(cats: Category[]): void {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

export function upsertLocalCategory(category: Partial<Category>): Category {
  const cats = getLocalCategories();
  let saved: Category;
  if (category.id) {
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      saved = { ...cats[idx], ...category } as Category;
      cats[idx] = saved;
    } else {
      saved = { ...category, id: category.id } as Category;
      cats.push(saved);
    }
  } else {
    const newId = `cat-${Date.now()}`;
    saved = {
      ...category,
      id: newId,
      slug: category.slug || `category-${Date.now()}`,
      isActive: category.isActive !== undefined ? category.isActive : true,
      displayOrder: category.displayOrder || cats.length + 1,
    } as Category;
    cats.push(saved);
  }
  saveLocalCategories(cats);
  return saved;
}

export function deleteLocalCategory(id: string): boolean {
  const cats = getLocalCategories();
  const filtered = cats.filter((c) => c.id !== id);
  if (filtered.length !== cats.length) {
    saveLocalCategories(filtered);
    return true;
  }
  return false;
}

// Settings
export function getLocalSettings(): BusinessSettings {
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: Partial<BusinessSettings>): BusinessSettings {
  const current = getLocalSettings();
  const merged = { ...current, ...settings };
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
  return merged;
}
