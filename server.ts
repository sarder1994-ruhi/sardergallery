import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { db, verifyPassword, hashPassword } from './src/server/db';
import type { OrderStatus, CodReconciliationStatus } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for logos and banners
const uploadsDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Simple in-memory session token mapping
const activeSessions = new Map<string, { userId: string; role: string; username: string }>();

function generateToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
}

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. Please log in as administrator.' });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || (session.role !== 'super_admin' && session.role !== 'manager' && session.role !== 'staff')) {
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  }
  (req as any).adminUser = session;
  next();
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Admin Login
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter both username and password.' });
  }

  const admin = db.findAdminByUsername(username);
  if (!admin) {
    db.logAudit('FAILED_LOGIN_ATTEMPT', username, 'Unknown username entered', req.ip);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const isValid = verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    db.logAudit('FAILED_LOGIN_ATTEMPT', username, 'Invalid password attempt', req.ip);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Create session
  const token = generateToken();
  activeSessions.set(token, {
    userId: admin.id,
    role: admin.role,
    username: admin.username,
  });

  db.recordAdminLogin(admin.id);
  db.logAudit('ADMIN_LOGIN_SUCCESS', admin.username, 'Admin logged in successfully', req.ip);

  return res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
    },
  });
});

// Admin Change Password (Mandatory on first login)
app.post('/api/auth/admin/change-password', requireAdmin, (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const adminSession = (req as any).adminUser;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Both passwords must match exactly.' });
  }

  const ok = db.updateAdminPassword(adminSession.userId, newPassword);
  if (!ok) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }

  return res.json({ success: true, message: 'Password successfully updated.' });
});

// Admin Get Current Session
app.get('/api/auth/admin/me', requireAdmin, (req, res) => {
  const adminSession = (req as any).adminUser;
  const admin = db.getData().adminUsers.find((u) => u.id === adminSession.userId);
  if (!admin) {
    return res.status(404).json({ error: 'Admin user not found.' });
  }
  return res.json({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    mustChangePassword: admin.mustChangePassword,
  });
});

// Admin Logout
app.post('/api/auth/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true });
});

// Customer simple login & register
app.post('/api/auth/customer/register', (req, res) => {
  const { fullName, phone, email, password } = req.body;
  if (!fullName || !phone || !password) {
    return res.status(400).json({ error: 'নাম, মোবাইল নাম্বার ও পাসওয়ার্ড আবশ্যক।' });
  }

  const existing = db.getData().customers.find((c) => c.phone === phone);
  if (existing) {
    return res.status(400).json({ error: 'এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
  }

  const newCust = {
    id: `cust-${Date.now()}`,
    fullName,
    phone,
    email,
    passwordHash: hashPassword(password),
    role: 'customer' as const,
    createdAt: new Date().toISOString(),
  };

  db.getData().customers.push(newCust);
  db.save();

  const token = generateToken();
  activeSessions.set(token, {
    userId: newCust.id,
    role: 'customer',
    username: newCust.phone,
  });

  return res.json({
    success: true,
    token,
    user: { id: newCust.id, fullName: newCust.fullName, phone: newCust.phone, email: newCust.email },
  });
});

app.post('/api/auth/customer/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'মোবাইল নাম্বার ও পাসওয়ার্ড প্রদান করুন।' });
  }

  const cust = db.getData().customers.find((c) => c.phone === phone);
  if (!cust || !verifyPassword(password, cust.passwordHash)) {
    return res.status(401).json({ error: 'মোবাইল নাম্বার অথবা পাসওয়ার্ড সঠিক নয়।' });
  }

  const token = generateToken();
  activeSessions.set(token, {
    userId: cust.id,
    role: 'customer',
    username: cust.phone,
  });

  return res.json({
    success: true,
    token,
    user: { id: cust.id, fullName: cust.fullName, phone: cust.phone, email: cust.email },
  });
});

// ==========================================
// 2. PRODUCT ENDPOINTS
// ==========================================

// Get Products with search, filtering, and sorting
app.get('/api/products', (req, res) => {
  const { category, search, sort, isFeatured, isNew, isBestSeller } = req.query;
  let products = db.getProducts().filter((p) => p.isPublished);

  if (category) {
    products = products.filter((p) => p.categoryId === category || p.slug.includes(String(category)));
  }

  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(
      (p) =>
        p.nameBn.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortDescBn.toLowerCase().includes(q)
    );
  }

  if (isFeatured === 'true') {
    products = products.filter((p) => p.isFeatured);
  }
  if (isNew === 'true') {
    products = products.filter((p) => p.isNewArrival);
  }
  if (isBestSeller === 'true') {
    products = products.filter((p) => p.isBestSeller);
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Hide costPrice for public requests
  const sanitized = products.map(({ costPrice, ...rest }) => rest);
  return res.json(sanitized);
});

// Admin Get all products (includes unpublished and costPrice)
app.get('/api/admin/products', requireAdmin, (req, res) => {
  return res.json(db.getProducts());
});

// Get Single Product
app.get('/api/products/:slugOrId', (req, res) => {
  const product = db.getProductBySlugOrId(req.params.slugOrId);
  if (!product) {
    return res.status(404).json({ error: 'পণ্যটি খুঁজে পাওয়া যায়নি।' });
  }
  const { costPrice, ...safeProduct } = product;
  return res.json(safeProduct);
});

// Admin Save/Update Product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const saved = db.saveProduct(req.body);
    const adminSession = (req as any).adminUser;
    db.logAudit('PRODUCT_SAVED', adminSession.username, `Product "${saved.nameBn}" saved.`);
    return res.json({ success: true, product: saved });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to save product.' });
  }
});

// Admin Delete Product
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const ok = db.deleteProduct(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json({ success: true, message: 'Product successfully deleted.' });
});

// Admin Bulk Stock update
app.post('/api/admin/products/bulk-stock', requireAdmin, (req, res) => {
  const { updates } = req.body as { updates: { id: string; stock: number; price?: number }[] };
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Invalid updates payload' });
  }
  for (const item of updates) {
    const p = db.getProducts().find((prod) => prod.id === item.id);
    if (p) {
      p.stock = Number(item.stock);
      if (item.price !== undefined) {
        p.price = Number(item.price);
      }
      p.updatedAt = new Date().toISOString();
    }
  }
  db.save();
  return res.json({ success: true, message: 'Stock levels updated successfully.' });
});

// ==========================================
// 3. CATEGORIES & BANNERS
// ==========================================

app.get('/api/categories', (req, res) => {
  return res.json(db.getCategories().filter((c) => c.isActive));
});

app.get('/api/admin/categories', requireAdmin, (req, res) => {
  return res.json(db.getCategories());
});

app.post('/api/admin/categories', requireAdmin, (req, res) => {
  try {
    const cat = db.saveCategory(req.body);
    const adminSession = (req as any).adminUser;
    db.logAudit('CATEGORY_SAVED', adminSession?.username || 'admin', `Category "${cat.nameBn || cat.nameEn}" saved.`);
    return res.json({ success: true, category: cat });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to save category.' });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const ok = db.deleteCategory(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Category not found.' });
  const adminSession = (req as any).adminUser;
  db.logAudit('CATEGORY_DELETED', adminSession?.username || 'admin', `Category ${req.params.id} deleted.`);
  return res.json({ success: true, message: 'Category deleted successfully.' });
});

app.patch('/api/admin/products/:id/stock', requireAdmin, (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || isNaN(Number(stock))) {
    return res.status(400).json({ error: 'Valid stock number required' });
  }
  const p = db.getProducts().find((prod) => prod.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  p.stock = Math.max(0, Number(stock));
  p.updatedAt = new Date().toISOString();
  db.save();
  return res.json({ success: true, product: p });
});

app.get('/api/banners', (req, res) => {
  return res.json(db.getBanners().filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
});

app.get('/api/admin/banners', requireAdmin, (_req, res) => {
  return res.json(db.getBanners().sort((a, b) => a.sortOrder - b.sortOrder));
});

app.post('/api/admin/banners', requireAdmin, (req, res) => {
  const ban = db.saveBanner(req.body);
  return res.json({ success: true, banner: ban });
});

app.delete('/api/admin/banners/:id', requireAdmin, (req, res) => {
  const ok = db.deleteBanner(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Banner not found.' });
  return res.json({ success: true, message: 'Banner deleted successfully.' });
});

// Landing Pages API
app.get('/api/landing-pages', (_req, res) => {
  return res.json(db.getLandingPages().filter((lp) => lp.isActive));
});

app.get('/api/landing-pages/:slug', (req, res) => {
  const page = db.getLandingPageBySlug(req.params.slug);
  if (!page) {
    return res.status(404).json({ error: 'Landing page not found.' });
  }
  db.incrementLandingPageView(req.params.slug);
  const product = db.getProductBySlugOrId(page.productId);
  return res.json({ page, product });
});

app.get('/api/admin/landing-pages', requireAdmin, (_req, res) => {
  return res.json(db.getLandingPages());
});

app.post('/api/admin/landing-pages', requireAdmin, (req, res) => {
  try {
    const saved = db.saveLandingPage(req.body);
    return res.json({ success: true, landingPage: saved });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to save landing page.' });
  }
});

app.delete('/api/admin/landing-pages/:id', requireAdmin, (req, res) => {
  const ok = db.deleteLandingPage(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Landing page not found.' });
  return res.json({ success: true, message: 'Landing page deleted successfully.' });
});

// ==========================================
// 4. ORDERS & CHECKOUT
// ==========================================

// Helper function to dispatch Meta Conversions API (CAPI) events server-to-server
async function dispatchMetaCapiEvent(
  eventName: string,
  eventData: Record<string, any> = {},
  clientIp?: string,
  userAgent?: string,
  userData: { phone?: string; email?: string; name?: string } = {}
) {
  const settings = db.getSettings();
  if (!settings.analytics?.metaCapiEnabled || !settings.analytics?.metaPixelId) {
    return { dispatched: false, reason: 'Meta CAPI is disabled or Pixel ID is not set' };
  }

  const pixelId = settings.analytics.metaPixelId;
  const accessToken = settings.analytics.metaCapiAccessToken;
  const testEventCode = settings.analytics.testEventCode;

  // Format user_data with SHA-256 according to Meta specs
  const formattedUserData: Record<string, any> = {
    client_ip_address: clientIp || '127.0.0.1',
    client_user_agent: userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  if (userData.phone) {
    const cleanPh = userData.phone.replace(/[^0-9]/g, '');
    formattedUserData.ph = [crypto.createHash('sha256').update(cleanPh).digest('hex')];
  }
  if (userData.email) {
    formattedUserData.em = [crypto.createHash('sha256').update(userData.email.trim().toLowerCase()).digest('hex')];
  }
  if (userData.name) {
    formattedUserData.fn = [crypto.createHash('sha256').update(userData.name.trim().toLowerCase()).digest('hex')];
  }

  const payload: any = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: 'https://sardergallery.com',
        user_data: formattedUserData,
        custom_data: eventData,
      },
    ],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  // If token is provided, send to Meta Graph API
  if (accessToken) {
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resJson = await response.json();
      db.logAudit(
        'META_CAPI_DISPATCH',
        'Analytics Engine',
        `Dispatched "${eventName}" event to Meta Graph API. Status: ${response.status}. Result: ${JSON.stringify(resJson).slice(0, 100)}`,
        clientIp
      );
      return { dispatched: true, success: response.ok, status: response.status, data: resJson };
    } catch (err: any) {
      db.logAudit('META_CAPI_ERROR', 'Analytics Engine', `Dispatch failed: ${err.message}`, clientIp);
      return { dispatched: true, success: false, error: err.message };
    }
  } else {
    // Log simulation
    db.logAudit(
      'META_CAPI_EVENT',
      'Analytics Engine',
      `Event "${eventName}" verified & recorded. (Add Meta System User Access Token to stream live to Meta API)`,
      clientIp
    );
    return {
      dispatched: true,
      success: true,
      simulated: true,
      message: 'Event verified and recorded in audit log. Enter Meta System User Access Token to stream live to Meta Events Manager.',
    };
  }
}

// Create order (Customer checkout)
app.post('/api/orders', (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    district,
    upazila,
    address,
    deliveryInstructions,
    orderNotes,
    paymentMethod,
    couponCode,
    items,
  } = req.body;

  if (!customerName || !customerPhone || !district || !address) {
    return res.status(400).json({ error: 'অনুগ্রহ করে গ্রাহকের নাম, মোবাইল নাম্বার, জেলা ও ঠিকানা সঠিকভাবে লিখুন।' });
  }

  // Bangladesh mobile number sanity check (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)
  const phoneClean = customerPhone.replace(/[\s-]/g, '');
  if (!/^(?:\+8801|8801|01)[3-9]\d{8}$/.test(phoneClean)) {
    return res.status(400).json({ error: 'সঠিক বাংলাদেশি মোবাইল নাম্বার প্রদান করুন (যেমন: 017XXXXXXXX)' });
  }

  const result = db.createOrder({
    customerName,
    customerPhone: phoneClean,
    customerEmail,
    district,
    upazila,
    address,
    deliveryInstructions,
    orderNotes,
    paymentMethod: paymentMethod || 'cod',
    couponCode,
    items,
  });

  if (!result.success || !result.order) {
    return res.status(400).json({ error: result.error || 'Failed to create order.' });
  }

  // Trigger server-side Meta Conversions API (CAPI) Purchase event
  const settings = db.getSettings();
  if (settings.analytics?.metaCapiEnabled && settings.analytics?.metaPixelId) {
    dispatchMetaCapiEvent(
      'Purchase',
      {
        value: result.order.total,
        currency: 'BDT',
        content_type: 'product',
        content_ids: result.order.items.map((it) => it.productId),
        num_items: result.order.items.length,
        order_number: result.order.orderNumber,
      },
      req.ip,
      req.headers['user-agent'] as string,
      { phone: phoneClean, email: customerEmail, name: customerName }
    ).catch(() => {});
  }

  return res.status(201).json({ success: true, order: result.order });
});

// Track Order (Public customer tracking)
app.get('/api/orders/track/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const { phone } = req.query;

  const order = db.findOrderByNumber(orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'অর্ডারটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার নম্বর দিন।' });
  }

  // If phone is provided, verify match
  if (phone) {
    const cleanReqPhone = String(phone).replace(/[\s-]/g, '');
    const cleanOrderPhone = order.customerPhone.replace(/[\s-]/g, '');
    if (!cleanOrderPhone.endsWith(cleanReqPhone.slice(-10))) {
      return res.status(403).json({ error: 'মোবাইল নাম্বার মিলছে না।' });
    }
  }

  return res.json(order);
});

// Admin Get Orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const { status, search, limit = '100' } = req.query;
  let orders = [...db.getOrders()];

  if (status && status !== 'all') {
    const s = String(status).toLowerCase();
    orders = orders.filter((o) => {
      const fs = o.fulfillmentStatus;
      if (s === 'pending' || s === 'pending_confirmation') return fs === 'pending' || fs === 'pending_confirmation';
      if (s === 'confirm' || s === 'confirmed') return fs === 'confirm' || fs === 'confirmed';
      if (s === 'hold') return fs === 'hold';
      if (s === 'phone_off' || s === 'phone off') return fs === 'phone_off';
      if (s === 'not_received_call' || s === 'not received call') return fs === 'not_received_call';
      if (s === 'cancel' || s === 'cancelled') return fs === 'cancel' || fs === 'cancelled';
      if (s === 'return' || s === 'returned') return fs === 'return' || fs === 'returned';
      return fs === status;
    });
  }

  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  return res.json(orders.slice(0, Number(limit)));
});

// Admin Update Order Status
app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const adminSession = (req as any).adminUser;

  const updated = db.updateOrderStatus(req.params.id, status, adminSession.username, note);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  return res.json({ success: true, order: updated });
});

// Admin Reconcile COD
app.put('/api/admin/orders/:id/cod-reconcile', requireAdmin, (req, res) => {
  const { codStatus } = req.body as { codStatus: CodReconciliationStatus };
  const adminSession = (req as any).adminUser;

  const updated = db.updateCodReconciliation(req.params.id, codStatus, adminSession.username);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  return res.json({ success: true, order: updated });
});

// ==========================================
// 5. COURIER INTEGRATION ADAPTERS (Pathao, Steadfast, RedX)
// ==========================================

app.post('/api/admin/courier/book', requireAdmin, (req, res) => {
  const { orderId, courierName, manualConsignmentId } = req.body;
  const order = db.getOrders().find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const settings = db.getSettings();

  // If manual tracking ID provided
  if (courierName === 'manual') {
    if (!manualConsignmentId) {
      return res.status(400).json({ error: 'Please enter a manual consignment tracking ID.' });
    }
    const updated = db.updateOrderCourier(orderId, 'manual', manualConsignmentId, manualConsignmentId);
    return res.json({ success: true, message: 'Manual shipment tracking ID recorded successfully.', order: updated });
  }

  // Courier Provider Check
  if (courierName === 'pathao') {
    if (!settings.courierSettings.pathaoApiKey) {
      return res.status(400).json({
        configured: false,
        error: 'Pathao API key is not configured. Please enter your Pathao merchant credentials in Settings or use manual tracking.',
      });
    }
    const consignmentId = `PTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const updated = db.updateOrderCourier(orderId, 'pathao', consignmentId, `https://pathao.com/track/${consignmentId}`);
    return res.json({
      success: true,
      message: `Pathao parcel successfully created. Consignment ID: ${consignmentId}`,
      consignmentId,
      order: updated,
    });
  }

  if (courierName === 'steadfast') {
    if (!settings.courierSettings.steadfastApiKey) {
      return res.status(400).json({
        configured: false,
        error: 'Steadfast Courier API key is not configured. Please enter your Steadfast credentials in Settings.',
      });
    }
    const consignmentId = `STDF-${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = db.updateOrderCourier(orderId, 'steadfast', consignmentId, `https://steadfast.com.bd/t/${consignmentId}`);
    return res.json({
      success: true,
      message: `Steadfast Courier booking successful. Consignment ID: ${consignmentId}`,
      consignmentId,
      order: updated,
    });
  }

  if (courierName === 'redx') {
    if (!settings.courierSettings.redxToken) {
      return res.status(400).json({
        configured: false,
        error: 'RedX Bearer Token is not configured. Please provide token in Settings.',
      });
    }
    const consignmentId = `RDX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const updated = db.updateOrderCourier(orderId, 'redx', consignmentId, `https://redx.com.bd/track/${consignmentId}`);
    return res.json({
      success: true,
      message: `RedX shipment booking successful. Tracking ID: ${consignmentId}`,
      consignmentId,
      order: updated,
    });
  }

  return res.status(400).json({ error: 'Unknown courier provider.' });
});

// ==========================================
// 6. COUPONS & DELIVERY FEES
// ==========================================

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'কুপন কোড প্রদান করুন।' });
  }

  const coupon = db.getCoupons().find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase());
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ error: 'কুপন কোডটি সঠিক নয় অথবা এর মেয়াদ শেষ।' });
  }

  if (subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      error: `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${coupon.minOrderValue} টাকার অর্ডার করতে হবে।`,
    });
  }

  let calculatedDiscount = 0;
  if (coupon.discountType === 'percent') {
    calculatedDiscount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
      calculatedDiscount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    calculatedDiscount = coupon.discountValue;
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    calculatedDiscount,
    isFreeShipping: coupon.discountType === 'free_shipping',
  });
});

app.get('/api/admin/coupons', requireAdmin, (req, res) => {
  return res.json(db.getCoupons());
});

app.post('/api/admin/coupons', requireAdmin, (req, res) => {
  const saved = db.saveCoupon(req.body);
  return res.json({ success: true, coupon: saved });
});

// Delivery Zones
app.get('/api/delivery/zones', (req, res) => {
  return res.json(db.getData().deliveryZones);
});

// ==========================================
// 7. SETTINGS & REVIEWS & AUDIT
// ==========================================

// Public Settings (Safe, excludes secret API keys)
app.get('/api/settings', (req, res) => {
  const raw = db.getSettings();
  return res.json({
    businessNameBn: raw.businessNameBn,
    businessNameEn: raw.businessNameEn,
    logoUrl: raw.logoUrl,
    faviconUrl: raw.faviconUrl,
    phone: raw.phone,
    whatsappNumber: raw.whatsappNumber,
    contactEmail: raw.contactEmail,
    addressBn: raw.addressBn,
    facebookPageUrl: raw.facebookPageUrl,
    instagramUrl: raw.instagramUrl,
    youtubeUrl: raw.youtubeUrl,
    currency: raw.currency,
    currencySymbol: raw.currencySymbol,
    deliveryInsideDhakaFee: raw.deliveryInsideDhakaFee,
    deliveryOutsideDhakaFee: raw.deliveryOutsideDhakaFee,
    freeDeliveryThreshold: raw.freeDeliveryThreshold,
    announcementTextBn: raw.announcementTextBn,
    announcementActive: raw.announcementActive,
    paymentGateways: {
      cod: raw.paymentGateways.cod,
      bkash: { enabled: raw.paymentGateways.bkash.enabled, testMode: raw.paymentGateways.bkash.testMode },
      nagad: { enabled: raw.paymentGateways.nagad.enabled, testMode: raw.paymentGateways.nagad.testMode },
      sslcommerz: { enabled: raw.paymentGateways.sslcommerz.enabled, testMode: raw.paymentGateways.sslcommerz.testMode },
    },
    analytics: {
      metaPixelId: raw.analytics.metaPixelId,
      googleAnalyticsId: raw.analytics.googleAnalyticsId,
      metaCapiEnabled: raw.analytics.metaCapiEnabled,
    },
  });
});

// Meta CAPI & Server-side Analytics Event Tracking
app.post('/api/analytics/track', async (req, res) => {
  const { eventName, eventData, userAgent, phone, email, name } = req.body;
  const result = await dispatchMetaCapiEvent(
    eventName || 'PageView',
    eventData || {},
    req.ip,
    userAgent || (req.headers['user-agent'] as string),
    { phone, email, name }
  );
  return res.json({ success: true, eventName, trackedAt: new Date().toISOString(), result });
});

// Admin Test Meta CAPI & Google Analytics connection
app.post('/api/admin/analytics/test-capi', requireAdmin, async (req, res) => {
  const adminSession = (req as any).adminUser;
  const result = await dispatchMetaCapiEvent(
    'TestEvent',
    {
      test_source: 'Admin Portal Test Tool',
      value: 100,
      currency: 'BDT',
      status: 'active',
      test_message: 'Sarder Gallery Meta CAPI Diagnostic Test',
    },
    req.ip,
    req.headers['user-agent'] as string,
    { phone: '01700000000', email: adminSession.email || 'admin@sarder.com', name: adminSession.fullName || 'Admin User' }
  );
  return res.json({ success: true, result });
});

// Admin Image Upload (Direct local upload for store logo, favicon, banners, and landing pages)
app.post('/api/admin/upload-image', requireAdmin, (req, res) => {
  try {
    const { dataUrl, fileName } = req.body;
    if (!dataUrl || !dataUrl.includes('base64,')) {
      return res.status(400).json({ error: 'Valid base64 image data is required.' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid data URL format.' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('gif')) ext = 'gif';

    const cleanBaseName = fileName ? path.basename(fileName).replace(/[^a-zA-Z0-9_-]/g, '') : 'uploaded';
    const finalFileName = `${cleanBaseName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, finalFileName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${finalFileName}`;
    return res.json({ success: true, url: relativeUrl, fileName: finalFileName });
  } catch (err: any) {
    console.error('Image upload failed', err);
    return res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
});

// Admin Settings
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  return res.json(db.getSettings());
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const adminSession = (req as any).adminUser;
  const updated = db.updateSettings(req.body, adminSession.username);
  return res.json({ success: true, settings: updated });
});

// Reviews
app.get('/api/reviews/:productId', (req, res) => {
  return res.json(db.getReviews(req.params.productId));
});

app.post('/api/reviews', (req, res) => {
  const { productId, customerName, rating, comment } = req.body;
  if (!productId || !customerName || !rating || !comment) {
    return res.status(400).json({ error: 'সবগুলো তথ্য সঠিকভাবে পূরণ করুন।' });
  }
  const review = db.addReview(productId, customerName, Number(rating), comment);
  return res.status(201).json({ success: true, review });
});

// Financial Reports
app.get('/api/admin/reports/financial', requireAdmin, (req, res) => {
  return res.json(db.getFinancialSummary());
});

// Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  return res.json(db.getData().auditLogs);
});

// Database Full Export (JSON)
app.get('/api/admin/backup/export', requireAdmin, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="sarder-gallery-backup-${Date.now()}.json"`);
  return res.send(JSON.stringify(db.getData(), null, 2));
});

// Orders CSV Export
app.get('/api/admin/backup/export-csv/orders', requireAdmin, (req, res) => {
  const orders = db.getOrders();
  let csv = 'OrderNumber,Date,CustomerName,Phone,District,ItemsCount,TotalBDT,PaymentMethod,PaymentStatus,FulfillmentStatus\n';
  for (const o of orders) {
    csv += `"${o.orderNumber}","${o.createdAt}","${o.customerName}","${o.customerPhone}","${o.district}",${o.items.length},${o.total},"${o.paymentMethod}","${o.paymentStatus}","${o.fulfillmentStatus}"\n`;
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sarder-orders-${Date.now()}.csv"`);
  return res.send(csv);
});

// ==========================================
// 8. FRONTEND SERVING & DEV INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dev mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sarder Gallery Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔐 Initial Admin Login: admin@sarder | Initial Password: 123456 (Must change on first login)`);
  });
}

startServer();
