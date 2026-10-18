import type { Order } from '../types';

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

// LocalStorage helpers for fallback order storage when static on Netlify
const LOCAL_ORDERS_KEY = 'sg_local_orders';

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
    existing.unshift(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save order to localStorage', e);
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
