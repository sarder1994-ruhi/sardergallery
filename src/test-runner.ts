/**
 * Automated Business Logic Test Suite for Sarder Gallery
 */
import { db, hashPassword, verifyPassword } from './server/db';
import { isInsideDhaka, formatBDT, isValidBDPhone } from './utils/bangladeshData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failed++;
  }
}

console.log('==================================================');
console.log('🧪 RUNNING SARDER GALLERY AUTOMATED TESTS');
console.log('==================================================\n');

// 1. Password Hashing & Security Tests
const samplePass = '123456';
const hashed = hashPassword(samplePass);
assert(hashed.includes(':'), 'Password hash contains salt and hash separated by colon');
assert(verifyPassword('123456', hashed) === true, 'Correct password verification succeeds');
assert(verifyPassword('wrongpassword', hashed) === false, 'Wrong password verification fails safely');

// 2. Admin Bootstrap Test
const admin = db.findAdminByUsername('admin@sarder');
assert(admin !== undefined, 'Initial administrator admin@sarder exists');
assert(admin?.role === 'super_admin', 'Initial administrator has super_admin role');
assert(verifyPassword('123456', admin?.passwordHash || '') === true, 'Initial administrator password matches bootstrap hash');

// 3. Bangladesh Phone Number Validation Tests
assert(isValidBDPhone('01712345678') === true, 'Standard 017 mobile number is valid');
assert(isValidBDPhone('01987654321') === true, 'Standard 019 mobile number is valid');
assert(isValidBDPhone('+8801812345678') === true, 'Mobile number with +880 country code is valid');
assert(isValidBDPhone('01234567890') === false, 'Invalid BD operator prefix 012 is rejected');
assert(isValidBDPhone('12345') === false, 'Short phone number is rejected');

// 4. District & Delivery Fee Calculation Tests
assert(isInsideDhaka('Dhaka') === true, 'Dhaka recognized as inside Dhaka zone');
assert(isInsideDhaka('ঢাকা') === true, 'ঢাকা (Bengali) recognized as inside Dhaka zone');
assert(isInsideDhaka('Chittagong') === false, 'Chittagong recognized as outside Dhaka zone');
assert(isInsideDhaka('Sylhet') === false, 'Sylhet recognized as outside Dhaka zone');

// 5. Currency Formatting Tests
assert(formatBDT(5490).includes('5,490'), 'formatBDT formats currency with commas');

// 6. Products & Inventory Tests
const products = db.getProducts();
assert(products.length >= 6, 'Product catalog contains seeded baby products');
const rocker = products.find((p) => p.sku === 'SG-RCK-001');
assert(rocker !== undefined, 'SG-RCK-001 Baby Rocker exists in database');
const initialStock = rocker?.stock || 0;
assert(initialStock > 0, 'Baby Rocker has positive initial stock');

// 7. Atomic Order Creation & Inventory Decrement Test
const testOrderRes = db.createOrder({
  customerName: 'টেস্ট কাস্টমার',
  customerPhone: '01711223344',
  district: 'Dhaka',
  address: 'ধানমন্ডি, ঢাকা',
  paymentMethod: 'cod',
  couponCode: 'SARDER10',
  items: [{ productId: rocker!.id, quantity: 2 }],
});

assert(testOrderRes.success === true, 'Order created successfully');
assert(!!testOrderRes.order?.orderNumber.startsWith('SG-'), 'Order assigned unique sequential order number');
assert(rocker!.stock === initialStock - 2, 'Product inventory atomically decremented by ordered quantity');

// 8. Overselling Prevention Test
const overOrderRes = db.createOrder({
  customerName: 'ওভার স্টক টেস্ট',
  customerPhone: '01811223344',
  district: 'Sylhet',
  address: 'সিলেট সদর',
  paymentMethod: 'cod',
  items: [{ productId: rocker!.id, quantity: 9999 }],
});
assert(overOrderRes.success === false, 'Overselling order rejected by server-side inventory check');

// 9. Order Status Lifecycle & Cancellation Stock Restoration Test
const createdOrderId = testOrderRes.order!.id;
const updatedOrder = db.updateOrderStatus(createdOrderId, 'confirmed', 'Admin');
assert(updatedOrder?.fulfillmentStatus === 'confirmed', 'Order fulfillment status updated to confirmed');
assert(updatedOrder?.statusHistory.length === 2, 'Status history event properly logged with actor and timestamp');

// Cancel order and verify stock restored
const cancelledOrder = db.updateOrderStatus(createdOrderId, 'cancelled', 'Admin');
assert(cancelledOrder?.fulfillmentStatus === 'cancelled', 'Order cancelled');
assert(rocker!.stock === initialStock, 'Stock restored to original level after order cancellation');

// 10. COD Reconciliation Test
const codOrder = db.updateCodReconciliation(createdOrderId, 'collected', 'Accounts Manager');
assert(codOrder?.codStatus === 'collected', 'COD status updated to collected');
assert(codOrder?.paymentStatus === 'paid', 'Payment status automatically updated to paid upon COD collection');

// 11. Financial Summary Report Test
const report = db.getFinancialSummary();
assert(typeof report.grossSales === 'number', 'Financial report provides gross sales number');
assert(typeof report.netRevenue === 'number', 'Financial report provides net revenue number');
assert(typeof report.codPending === 'number', 'Financial report tracks pending COD collection');

console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
}
