import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Product,
  Category,
  Order,
  Coupon,
  DeliveryZone,
  Banner,
  BusinessSettings,
  AdminUser,
  CustomerUser,
  AuditLog,
  Review,
  OrderStatus,
  CodReconciliationStatus,
  LandingPage
} from '../types';

interface DatabaseSchema {
  adminUsers: (AdminUser & { passwordHash: string })[];
  customers: (CustomerUser & { passwordHash: string })[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  deliveryZones: DeliveryZone[];
  banners: Banner[];
  settings: BusinessSettings;
  auditLogs: AuditLog[];
  reviews: Review[];
  landingPages: LandingPage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utility with PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, originalHash] = combined.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

// Default initial data
function getDefaultData(): DatabaseSchema {
  const initialAdminPass = hashPassword('123456');

  const defaultCategories: Category[] = [
    {
      id: 'cat-rockers',
      nameBn: 'বেবি রকার ও বাউন্সার',
      nameEn: 'Baby Rockers & Bouncers',
      slug: 'baby-rockers',
      descriptionBn: 'শিশুর আরামদায়ক ঘুম ও খেলার জন্য অটোমেটিক এবং ম্যানুয়াল রকার',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
      icon: 'RockingChair',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 'cat-swings',
      nameBn: 'বেবি দোলনা ও ক্র্যাডল',
      nameEn: 'Baby Swings & Cradles',
      slug: 'baby-swings',
      descriptionBn: 'মিউজিক এবং টাইমারসহ প্রিমিয়াম ইলেকট্রিক ও ম্যানুয়াল দোলনা',
      image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80',
      icon: 'Baby',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 'cat-sofas',
      nameBn: 'বেবি সোফা ও সিটিং সাপোর্ট',
      nameEn: 'Baby Sofas & Sitting Support',
      slug: 'baby-sofas',
      descriptionBn: 'শিশুর সঠিকভাবে বসা শেখার জন্য নরম ও আরামদায়ক প্লাশ সোফা',
      image: 'https://images.unsplash.com/photo-1584839446487-142fd57e1b52?auto=format&fit=crop&w=600&q=80',
      icon: 'Armchair',
      displayOrder: 3,
      isActive: true,
    },
    {
      id: 'cat-beds',
      nameBn: 'বেবি বেড, ম্যাট্রেস ও পিলো',
      nameEn: 'Baby Beds, Mattresses & Pillows',
      slug: 'baby-beds',
      descriptionBn: 'মশারিসহ সেফটি নেস্টেড বেবি বেড ও অ্যান্টি-ফ্ল্যাট হেড পিলো',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      icon: 'Bed',
      displayOrder: 4,
      isActive: true,
    },
    {
      id: 'cat-feeding',
      nameBn: 'বেবি ফিডিং ও ফুড এক্সেসরিজ',
      nameEn: 'Baby Feeding & Care',
      slug: 'baby-feeding',
      descriptionBn: 'বিপিএ মুক্ত ফুড গ্রেড সিলিকন ফিডিং সেট ও ওয়াটার কাপ',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      icon: 'Utensils',
      displayOrder: 5,
      isActive: true,
    },
    {
      id: 'cat-toys',
      nameBn: 'খেলনা ও লার্নিং অ্যাক্টিভিটি',
      nameEn: 'Baby Toys & Learning',
      slug: 'baby-toys',
      descriptionBn: 'মস্তিষ্কের বিকাশে সহায়ক নিরাপদ কাঠের ও নরম খেলনা',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
      icon: 'Gamepad2',
      displayOrder: 6,
      isActive: true,
    },
  ];

  const defaultProducts: Product[] = [
    {
      id: 'prod-1',
      nameBn: 'প্রিমিয়াম ইলেকট্রিক বেবি রকার উইথ ব্লুটুথ ও মিউজিক',
      nameEn: 'Premium Electric Baby Rocker with Bluetooth & Music',
      slug: 'premium-electric-baby-rocker-bluetooth',
      sku: 'SG-RCK-001',
      categoryId: 'cat-rockers',
      shortDescBn: 'স্মার্ট ব্লুটুথ মিউজিক, ৫টি সুইং স্পিড ও রিমোট কন্ট্রোল সুবিধাযুক্ত প্রিমিয়াম রকার।',
      shortDescEn: 'Smart Bluetooth music, 5 swing speeds and remote-controlled luxury rocker.',
      fullDescBn: 'সরদার গ্যালারির এই প্রিমিয়াম ইলেকট্রিক বেবি রকার নবজাতক থেকে শুরু করে ১২ মাস বয়সের শিশুদের জন্য অত্যন্ত উপযোগী। এতে রয়েছে নরম আরামদায়ক কুশন, সুরক্ষামূলক ৫-পয়েন্ট সেফটি বেল্ট, বিল্ট-ইন সফট লোলাবাই মিউজিক এবং ব্লুটুথ সংযোগ যার মাধ্যমে যেকোনো গান বাজানো যায়। ৩টি টাইমার মোড ও ৫টি ভিন্ন গতিতে দুলতে পারে। অ্যালুমিনিয়াম অ্যালয় মজবুত বডি দীর্ঘস্থায়ী ও নিরাপদ।',
      price: 6500,
      salePrice: 5490,
      costPrice: 4200,
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
      ],
      mainImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      variants: [
        { id: 'v1', name: 'Soft Gray (ধূসর)', sku: 'SG-RCK-001-GRY', price: 5490, stock: 10, attributes: { Color: 'Soft Gray' } },
        { id: 'v2', name: 'Pastel Pink (গোলাপী)', sku: 'SG-RCK-001-PNK', price: 5490, stock: 8, attributes: { Color: 'Pastel Pink' } },
      ],
      dimensions: '65cm x 60cm x 52cm',
      weight: '4.2 kg',
      specifications: {
        'উপাদান': 'অ্যালুমিনিয়াম ফ্রেম + অ্যান্টি-অ্যালার্জিক ফেব্রিক',
        'উপযুক্ত বয়স': '০ থেকে ১৮ মাস',
        'সর্বোচ্চ ওজন ধারণ ক্ষমতা': '১৫ কেজি',
        'পাওয়ার সোর্স': 'সরাসরি অ্যাডাপ্টার / ব্যাটারি চালিত',
      },
      ageGroup: '0-18 Months',
      careInstructions: 'ফেব্রিক কভার সহজে খুলে ওয়াশিং মেশিনে বা হাতে ধোয়া যায়। ফ্রেম ভেজা নরম কাপড় দিয়ে মুছে নিন।',
      safetyInfo: 'শিশুকে বসানোর সময় অবশ্যই ৫-পয়েন্ট সেফটি হারনেস আটকে দিন। কোনো উঁচু টেবিলের উপর রাখবেন না।',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      isPublished: true,
      seoTitle: 'প্রিমিয়াম ইলেকট্রিক বেবি রকার | Sarder Gallery Bangladesh',
      seoDescription: 'কিনুন প্রিমিয়াম ইলেকট্রিক বেবি রকার মিউজিক ও ব্লুটুথ সহ। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      nameBn: 'স্মার্ট ফোল্ডেবল বেবি ক্র্যাডল ও অটোমেটিক সুইং দোলনা',
      nameEn: 'Smart Foldable Baby Cradle & Automatic Swing',
      slug: 'smart-foldable-baby-cradle-automatic-swing',
      sku: 'SG-SWG-002',
      categoryId: 'cat-swings',
      shortDescBn: 'মশারিসহ সহজে ভাঁজযোগ্য প্রিমিয়াম অটোমেটিক বেবি দোলনা। শান্ত ঘুম নিশ্চিত করে।',
      shortDescEn: 'Foldable baby cradle swing with mosquito net and soft rocking action.',
      fullDescBn: 'শিশুর নির্ভার ঘুমের জন্য এই স্মার্ট দোলনাটি অন্যতম সেরা পছন্দ। সহজে ভাঁজ করে ঘরের যেকোনো জায়গায় রাখা যায় এবং ভ্রমণের সময় সাথে নেওয়া সম্ভব। পুরো শরীর কভার করা শ্বাস-প্রশ্বাসযোগ্য মশারির নেট শিশুকে মশা-মাছি থেকে সুরক্ষিত রাখে। শান্ত মিষ্টি সুর শিশুর ঘুম দ্রুত এনে দেয়।',
      price: 5200,
      salePrice: 4350,
      costPrice: 3400,
      stock: 14,
      images: [
        'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      ],
      mainImage: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
      variants: [
        { id: 'v3', name: 'Sky Blue (আকাশি)', sku: 'SG-SWG-002-BLU', price: 4350, stock: 7, attributes: { Color: 'Sky Blue' } },
        { id: 'v4', name: 'Cream Beige (ক্রিম)', sku: 'SG-SWG-002-CRM', price: 4350, stock: 7, attributes: { Color: 'Cream Beige' } },
      ],
      dimensions: '88cm x 50cm x 75cm',
      weight: '5.5 kg',
      specifications: {
        'উপাদান': 'কার্বন স্টিল পাইপ + নরম শ্বাসযোগ্য কটন',
        'উপযুক্ত বয়স': '০ থেকে ১২ মাস',
        'ওজন বহন ক্ষমতা': '১২ কেজি',
      },
      ageGroup: '0-12 Months',
      safetyInfo: 'মৃদু দোল শিশুর মস্তিষ্কের জন্য পুরোপুরি নিরাপদ ও আন্তর্জাতিক মানসম্মত।',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      nameBn: 'কিউট এনিমেল বেবি প্লাশ সোফা ও সিটিং ট্রেইনার চেয়ার',
      nameEn: 'Cute Animal Baby Plush Sofa & Sitting Support Chair',
      slug: 'cute-animal-baby-plush-sofa-sitting-support',
      sku: 'SG-SOF-003',
      categoryId: 'cat-sofas',
      shortDescBn: 'শিশুকে সোজা হয়ে বসতে শেখানোর জন্য নরম ও দৃষ্টিনন্দন অ্যান্টি-স্লিপ প্লাশ সোফা।',
      shortDescEn: 'Ergonomic plush sitting support sofa for training infants to sit upright.',
      fullDescBn: 'বাচ্চাদের ৪ থেকে ১৮ মাস বয়সে মেরুদণ্ডে সাপোর্ট দিয়ে সোজা হয়ে বসতে সাহায্য করে এই চমৎকার বেবি সোফা। উচ্চমানের সফট পিপি কটন ভর্তি থাকায় শিশু পড়ে গিয়ে আঘাত পাওয়ার কোনো ভয় নেই। নিচে অ্যান্টি-স্লিপ গ্রিপ রয়েছে যা মেঝেতে পিছলে যায় না। বিভিন্ন আকর্ষণীয় কার্টুন ডিজাইনে পাওয়া যাচ্ছে।',
      price: 2100,
      salePrice: 1650,
      costPrice: 1100,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1584839446487-142fd57e1b52?auto=format&fit=crop&w=800&q=80',
      ],
      mainImage: 'https://images.unsplash.com/photo-1584839446487-142fd57e1b52?auto=format&fit=crop&w=800&q=80',
      variants: [
        { id: 'v5', name: 'Friendly Bear Brown (ভালুক ব্রাউন)', sku: 'SG-SOF-003-BRN', price: 1650, stock: 12, attributes: { Design: 'Bear' } },
        { id: 'v6', name: 'Cute Bunny Pink (খরগোশ গোলাপী)', sku: 'SG-SOF-003-PNK', price: 1650, stock: 13, attributes: { Design: 'Bunny' } },
      ],
      dimensions: '50cm x 50cm x 40cm',
      weight: '1.8 kg',
      specifications: {
        'বাহ্যিক কভার': 'আল্ট্রা-সফট ভেলভেট প্লাশ',
        'ভিতরের ফিলিং': '১০০% পিওর হোয়াইট পিপি কটন',
        'উপযুক্ত বয়স': '৪ থেকে ১৮ মাস',
      },
      ageGroup: '4-18 Months',
      careInstructions: 'সহজে জিপার খুলে বাইরের কভার ওয়াশ করা যায়।',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      nameBn: 'অর্থোপেডিক নিউবর্ন বেবি নেস্ট বেড ও অ্যান্টি-মস্কিটো সেট',
      nameEn: 'Orthopedic Newborn Baby Nest Bed with Mosquito Net',
      slug: 'orthopedic-newborn-baby-nest-bed-mosquito-net',
      sku: 'SG-BED-004',
      categoryId: 'cat-beds',
      shortDescBn: 'মায়ের গর্ভের মতো নিরাপদ অনুভূতি দিতে অর্থোপেডিক বেড ও মশারির পূর্ণাঙ্গ কম্বো।',
      shortDescEn: 'Portable baby nest lounger with head-shaping pillow and full mesh net.',
      fullDescBn: 'নবজাতক শিশুর মাথার সঠিক গঠনের জন্য এই সেটে রয়েছে অ্যান্টি-ফ্ল্যাট হেড মেমোরি ফোম পিলো। চারপাশে উঁচু নরম বর্ডার শিশুকে কোনোদিকে গড়িয়ে পড়তে দেয় না। খাঁটি সুতি কাপড়ে তৈরি হওয়ায় শিশুর কোমল ত্বকে কোনো র‍্যাশ বা অস্বস্তি হয় না। সম্পূর্ণ সেটটি বহন করা খুবই সহজ।',
      price: 2450,
      salePrice: 1890,
      costPrice: 1300,
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      ],
      mainImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      dimensions: '85cm x 50cm',
      weight: '1.4 kg',
      specifications: {
        'ফ্যাব্রিক': '১০০% অরগানিক কটন ও শ্বাসযোগ্য ফোম',
        'প্যাকেজে অন্তর্ভুক্ত': '১টি বেড নেস্ট, ১টি শেপিং পিলো, ১টি ফুল মশারির কভার',
      },
      ageGroup: '0-12 Months',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-5',
      nameBn: 'ফুড-গ্রেড সিলিকন বেবি ফিডিং সেট (বাটি, চামচ ও বিব)',
      nameEn: 'Complete Food-Grade Silicone Baby Feeding Set',
      slug: 'food-grade-silicone-baby-feeding-set',
      sku: 'SG-FED-005',
      categoryId: 'cat-feeding',
      shortDescBn: '১০০% বিপিএ ফ্রি, নরম সিলিকনের বাটি, ফ্লেক্সিবল চামচ ও অ্যাডজাস্টেবল ক্যাচার বিব।',
      shortDescEn: 'Safe BPA-free suction bowl, soft spoon, fork and waterproof pocket bib.',
      fullDescBn: 'শিশুকে সহজে প্রথম শক্ত খাবার খাওয়ানোর জন্য এই ফিডিং সেটটি অত্যন্ত নিরাপদ। বাটির নিচে থাকা শক্তিশালী সাকশন বেজ টেবিলের সাথে শক্তভাবে আটকে থাকে, তাই শিশু উল্টে ফেলতে পারে না। চামচ ও কাঁটাচামচের নরম কোণা শিশুর সংবেদনশীল মাড়িতে কোনো ব্যথা দেয় না।',
      price: 1350,
      salePrice: 990,
      costPrice: 600,
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      ],
      mainImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      specifications: {
        'ম্যাটেরিয়াল': '১০০% ফুড গ্রেড সিলিকন (BPA & Phthalate Free)',
        'তাপমাত্রা সহ্য ক্ষমতা': '-২০°C থেকে ২২০°C',
        'ক্লিনিং': 'ডিশওয়াশার ও গরম পানিতে ফুটানো নিরাপদ',
      },
      ageGroup: '6-36 Months',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-6',
      nameBn: 'মন্টিসরি কাঠের সেন্সরি অ্যাক্টিভিটি ও শেপ সর্টার টয়',
      nameEn: 'Montessori Wooden Sensory Activity & Shape Sorter Toy',
      slug: 'montessori-wooden-sensory-activity-toy',
      sku: 'SG-TOY-006',
      categoryId: 'cat-toys',
      shortDescBn: 'শিশুর বুদ্ধিমত্তা ও হাতের সমন্বয় বাড়াতে নিরাপদ পরিবেশবান্ধব কাঠের খেলনা।',
      shortDescEn: 'Eco-friendly non-toxic natural wood learning and motor skills toy.',
      fullDescBn: 'প্রাকৃতিক পাইন কাঠের মসৃণ ফিনিশিং এবং ওয়াটার-বেসড নন-টক্সিক কালার দিয়ে তৈরি এই শিক্ষণীয় খেলনা। শিশুর রঙ চেনা, আকৃতি মেলা এবং হাত ও চোখের সমন্বয় দ্রুত উন্নত করতে বিশ্বজুড়ে চিকিৎসকদের প্রশংসিত খেলনা।',
      price: 1450,
      salePrice: 1150,
      costPrice: 750,
      stock: 22,
      images: [
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
      ],
      mainImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
      specifications: {
        'কাঠের ধরণ': 'প্রাকৃতিক মসৃণ পাইনউড',
        'রং': 'শিশুদের জন্য নিরাপদ লেড-ফ্রি ওয়াটার কালার',
      },
      ageGroup: '1-4 Years',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultBanners: Banner[] = [
    {
      id: 'ban-1',
      titleBn: 'আপনার সোনামণির প্রশান্তিময় ঘুম ও আনন্দময় শৈশব',
      subtitleBn: 'অটোমেটিক ইলেকট্রিক বেবি রকার ও দোলনায় চলছে বিশেষ মূল্যছাড়! সারা বাংলাদেশে ফ্রি ডেলিভারি সুযোগ।',
      tagBn: 'মেগা অফার ২০২৬',
      imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/products?category=baby-rockers',
      buttonTextBn: 'এখনই কিনুন ৳৫,৪৯০',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'ban-2',
      titleBn: 'বেবি সিটিং সোফা ও এরগনোমিক প্লাশ চেয়ার',
      subtitleBn: 'শিশুর পিঠ ও মেরুদণ্ডের সুরক্ষায় চিকিৎসকদের পছন্দের সিটিং সাপোর্ট সোফা।',
      tagBn: 'নতুন আগমন',
      imageUrl: 'https://images.unsplash.com/photo-1584839446487-142fd57e1b52?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/products?category=baby-sofas',
      buttonTextBn: 'সোফা কালেকশন দেখুন',
      isActive: true,
      sortOrder: 2,
    },
  ];

  const defaultCoupons: Coupon[] = [
    {
      id: 'cp-1',
      code: 'SARDER10',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 1000,
      maxDiscount: 350,
      usageLimit: 500,
      usedCount: 14,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      isActive: true,
    },
    {
      id: 'cp-2',
      code: 'BABYJOY',
      discountType: 'fixed',
      discountValue: 200,
      minOrderValue: 1500,
      usageLimit: 300,
      usedCount: 22,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      isActive: true,
    },
    {
      id: 'cp-3',
      code: 'FREESHIP',
      discountType: 'free_shipping',
      discountValue: 0,
      minOrderValue: 1800,
      usageLimit: 200,
      usedCount: 31,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      isActive: true,
    },
  ];

  const defaultDeliveryZones: DeliveryZone[] = [
    {
      id: 'zone-dhaka',
      nameBn: 'ঢাকার ভেতরে (Inside Dhaka)',
      nameEn: 'Inside Dhaka',
      districts: ['Dhaka', 'ঢাকা'],
      baseFee: 70,
      freeDeliveryThreshold: 2500,
      estimatedDeliveryDays: '২৪ - ৪৮ ঘণ্টার মধ্যে',
      codAvailable: true,
      bulkyProductFee: 50,
    },
    {
      id: 'zone-outside',
      nameBn: 'ঢাকার বাইরে (Outside Dhaka)',
      nameEn: 'Outside Dhaka',
      districts: ['Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur', 'Narayanganj', 'All Other Districts'],
      baseFee: 130,
      freeDeliveryThreshold: 2500,
      estimatedDeliveryDays: '২ - ৩ কার্যদিবসের মধ্যে',
      codAvailable: true,
      bulkyProductFee: 80,
    },
  ];

  const defaultSettings: BusinessSettings = {
    businessNameBn: 'সরদার গ্যালারি',
    businessNameEn: 'Sarder Gallery',
    logoUrl: '',
    faviconUrl: '',
    phone: '+8801700000000',
    whatsappNumber: '+8801700000000',
    contactEmail: 'contact@sardergallery.com',
    addressBn: 'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ',
    facebookPageUrl: 'https://facebook.com/sardergallery',
    instagramUrl: 'https://instagram.com/sardergallery',
    youtubeUrl: 'https://youtube.com',
    currency: 'BDT',
    currencySymbol: '৳',
    deliveryInsideDhakaFee: 70,
    deliveryOutsideDhakaFee: 130,
    freeDeliveryThreshold: 2500,
    announcementTextBn: '🎉 শুভ সূচনা অফার! ২,৫০০ টাকার অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি! কুপন কোড: SARDER10 ব্যবহারে ১০% ডিসকাউন্ট!',
    announcementActive: true,
    paymentGateways: {
      cod: { enabled: true, descriptionBn: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন (ক্যাশ অন ডেলিভারি)' },
      bkash: { enabled: false, merchantNumber: '', testMode: true },
      nagad: { enabled: false, merchantNumber: '', testMode: true },
      sslcommerz: { enabled: false, storeId: '', testMode: true },
    },
    courierSettings: {
      provider: 'manual',
      pathaoApiKey: '',
      pathaoSecret: '',
      steadfastApiKey: '',
      steadfastSecret: '',
      redxToken: '',
    },
    analytics: {
      metaPixelId: '',
      googleAnalyticsId: '',
      metaCapiEnabled: false,
    },
  };

  const defaultReviews: Review[] = [
    {
      id: 'rev-1',
      productId: 'prod-1',
      customerName: 'নুসরাত জাহান',
      rating: 5,
      comment: 'রকারটি আসলেই দারুণ! মিউজিক সিস্টেম খুব মিষ্টি এবং ব্লুটুথ দিয়ে নিজের পছন্দের গজল ও লোলাবাই বাজানো যায়। আমার ৪ মাসের বাচ্চা খুব শান্তিতে ঘুমায়। ধন্যবাদ সরদার গ্যালারি!',
      isApproved: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'rev-2',
      productId: 'prod-3',
      customerName: 'তানভীর আহমেদ',
      rating: 5,
      comment: 'সোফাটার কোয়ালিটি অনেক সফট আর কাপড় প্রিমিয়াম। বাচ্চা নিরাপদে বসতে পারে। ডেলিভারি ২ দিনের মধ্যে পেয়েছি।',
      isApproved: true,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  return {
    adminUsers: [
      {
        id: 'admin-1',
        username: 'admin@sarder',
        email: 'admin@sardergallery.com',
        fullName: 'সরদার গ্যালারি অ্যাডমিন',
        role: 'super_admin',
        passwordHash: initialAdminPass,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      },
    ],
    customers: [],
    products: defaultProducts,
    categories: defaultCategories,
    orders: [],
    coupons: defaultCoupons,
    deliveryZones: defaultDeliveryZones,
    banners: defaultBanners,
    settings: defaultSettings,
    auditLogs: [
      {
        id: 'log-1',
        action: 'SYSTEM_BOOTSTRAP',
        performedBy: 'System',
        details: 'Initial admin account bootstrapped for admin@sarder with mandatory password reset flag.',
        timestamp: new Date().toISOString(),
      },
    ],
    reviews: defaultReviews,
    landingPages: [
      {
        id: 'lp-1',
        slug: 'electric-baby-rocker',
        title: 'প্রিমিয়াম ইলেকট্রিক বেবি রকার - স্পেশাল অফার',
        headlineBn: 'আপনার সোনামণির জন্য সবচেয়ে নিরাপদ ও আধুনিক ইলেকট্রিক বেবি রকার!',
        subheadlineBn: 'স্মার্ট ব্লুটুথ মিউজিক, ৫টি সুইং স্পিড ও রিমোট কন্ট্রোল সহ শিশুর শান্ত ও আরামদায়ক ঘুম নিশ্চিত করুন।',
        badgeTextBn: 'মেগা অফার • সারা দেশে ফ্রি ডেলিভারি',
        productId: 'prod-1',
        bannerImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
        featuresBn: [
          'স্মার্ট ব্লুটুথ সংযোগ - পছন্দের সুর ও গান বাজানোর সুবিধা',
          '৫টি ভিন্ন গতিতে স্বয়ংক্রিয় দোলার কন্ট্রোল মোড',
          '৫-পয়েন্ট সেফটি হারনেস - শিশুর সর্বোচ্চ নিরাপত্তা নিশ্চিত করে',
          'অ্যালুমিনিয়াম অ্যালয় মজবুত স্ট্রাকচার ও নরম অ্যান্টি-অ্যালার্জিক ফেব্রিক',
          'সহজে রিমোট কন্ট্রোল দিয়ে দূর থেকেই স্পিড ও মিউজিক নিয়ন্ত্রণ',
        ],
        callToActionBn: 'এখনই অর্ডার করুন • ক্যাশ অন ডেলিভারি',
        isActive: true,
        viewCount: 142,
        orderCount: 18,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}

// Database Engine Class with atomic save
class Database {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure initial admin@sarder exists if file had older data
        if (!parsed.adminUsers || parsed.adminUsers.length === 0) {
          const defaults = getDefaultData();
          parsed.adminUsers = defaults.adminUsers;
        }
        if (!parsed.landingPages) {
          parsed.landingPages = getDefaultData().landingPages;
        }
        return parsed;
      }
    } catch (err) {
      console.error('Failed to read db.json, initializing fresh data:', err);
    }
    const defaults = getDefaultData();
    this.atomicSave(defaults);
    return defaults;
  }

  private atomicSave(dataToSave: DatabaseSchema) {
    const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    try {
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed atomic write to db:', err);
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
    }
  }

  public save() {
    this.atomicSave(this.data);
  }

  // Get raw schema (readonly)
  public getData(): DatabaseSchema {
    return this.data;
  }

  // Auth & Admin methods
  public findAdminByUsername(username: string) {
    return this.data.adminUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );
  }

  public updateAdminPassword(adminId: string, newPassword: string): boolean {
    const admin = this.data.adminUsers.find((u) => u.id === adminId);
    if (!admin) return false;
    admin.passwordHash = hashPassword(newPassword);
    admin.mustChangePassword = false;
    this.logAudit('ADMIN_PASSWORD_CHANGED', admin.username, 'Admin updated password securely.');
    this.save();
    return true;
  }

  public recordAdminLogin(adminId: string) {
    const admin = this.data.adminUsers.find((u) => u.id === adminId);
    if (admin) {
      admin.lastLogin = new Date().toISOString();
      this.save();
    }
  }

  public logAudit(action: string, performedBy: string, details: string, ip?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
      ip,
    };
    this.data.auditLogs.unshift(log);
    // keep maximum 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // Products
  public getProducts() {
    return this.data.products;
  }

  public getProductBySlugOrId(idOrSlug: string) {
    return this.data.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }

  public saveProduct(productData: Partial<Product> & { nameBn: string; price: number }): Product {
    const now = new Date().toISOString();
    if (productData.id) {
      const index = this.data.products.findIndex((p) => p.id === productData.id);
      if (index !== -1) {
        this.data.products[index] = {
          ...this.data.products[index],
          ...productData,
          updatedAt: now,
        };
        this.save();
        return this.data.products[index];
      }
    }

    const newProd: Product = {
      id: productData.id || `prod-${Date.now()}`,
      nameBn: productData.nameBn,
      nameEn: productData.nameEn || productData.nameBn,
      slug: productData.slug || productData.nameBn.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || `prod-${Date.now()}`,
      sku: productData.sku || `SG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      categoryId: productData.categoryId || 'cat-rockers',
      shortDescBn: productData.shortDescBn || '',
      shortDescEn: productData.shortDescEn || '',
      fullDescBn: productData.fullDescBn || '',
      fullDescEn: productData.fullDescEn || '',
      price: Number(productData.price),
      salePrice: productData.salePrice ? Number(productData.salePrice) : undefined,
      costPrice: productData.costPrice ? Number(productData.costPrice) : undefined,
      stock: Number(productData.stock || 0),
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.mainImage || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80'],
      mainImage: productData.mainImage || (productData.images && productData.images[0]) || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
      variants: productData.variants || [],
      dimensions: productData.dimensions,
      weight: productData.weight,
      specifications: productData.specifications || {},
      ageGroup: productData.ageGroup,
      careInstructions: productData.careInstructions,
      safetyInfo: productData.safetyInfo,
      isFeatured: !!productData.isFeatured,
      isNewArrival: !!productData.isNewArrival,
      isBestSeller: !!productData.isBestSeller,
      isPublished: productData.isPublished !== false,
      seoTitle: productData.seoTitle,
      seoDescription: productData.seoDescription,
      createdAt: now,
      updatedAt: now,
    };
    this.data.products.unshift(newProd);
    this.save();
    return newProd;
  }

  public deleteProduct(id: string): boolean {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.save();
    return true;
  }

  // Categories
  public getCategories() {
    return this.data.categories;
  }

  public saveCategory(categoryData: Partial<Category> & { nameBn: string }): Category {
    if (categoryData.id) {
      const idx = this.data.categories.findIndex((c) => c.id === categoryData.id);
      if (idx !== -1) {
        this.data.categories[idx] = { ...this.data.categories[idx], ...categoryData };
        this.save();
        return this.data.categories[idx];
      }
    }
    const newCat: Category = {
      id: categoryData.id || `cat-${Date.now()}`,
      nameBn: categoryData.nameBn,
      nameEn: categoryData.nameEn || categoryData.nameBn,
      slug: categoryData.slug || `cat-${Date.now()}`,
      descriptionBn: categoryData.descriptionBn,
      image: categoryData.image || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
      displayOrder: categoryData.displayOrder || this.data.categories.length + 1,
      isActive: categoryData.isActive !== false,
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // Orders & Inventory Transactions
  public getOrders() {
    return this.data.orders;
  }

  public findOrderByNumber(orderNumber: string) {
    return this.data.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase());
  }

  public createOrder(orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    district: string;
    upazila?: string;
    address: string;
    deliveryInstructions?: string;
    orderNotes?: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'sslcommerz';
    couponCode?: string;
    items: { productId: string; variantId?: string; quantity: number }[];
  }): { success: boolean; order?: Order; error?: string } {
    // 1. Validate items and inventory
    if (!orderPayload.items || orderPayload.items.length === 0) {
      return { success: false, error: 'কার্ট খালি, কোনো পণ্য পাওয়া যায়নি।' };
    }

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const reqItem of orderPayload.items) {
      const product = this.data.products.find((p) => p.id === reqItem.productId);
      if (!product) {
        return { success: false, error: `পণ্য পাওয়া যায়নি: ${reqItem.productId}` };
      }
      if (product.stock < reqItem.quantity) {
        return { success: false, error: `দুঃখিত, "${product.nameBn}" পর্যাপ্ত স্টকে নেই (মজুদ: ${product.stock} টি)` };
      }

      const unitPrice = product.salePrice ?? product.price;
      const itemSubtotal = unitPrice * reqItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        variantId: reqItem.variantId,
        nameBn: product.nameBn,
        nameEn: product.nameEn,
        sku: product.sku,
        price: unitPrice,
        quantity: reqItem.quantity,
        image: product.mainImage,
        subtotal: itemSubtotal,
      });
    }

    // 2. Calculate Delivery Fee
    const isDhaka = /dhaka|ঢাকা/i.test(orderPayload.district);
    const baseDeliveryFee = isDhaka
      ? this.data.settings.deliveryInsideDhakaFee
      : this.data.settings.deliveryOutsideDhakaFee;

    let deliveryFee = baseDeliveryFee;
    if (subtotal >= this.data.settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    // 3. Calculate Discount
    let discount = 0;
    let appliedCoupon = '';
    if (orderPayload.couponCode) {
      const codeUpper = orderPayload.couponCode.trim().toUpperCase();
      const coupon = this.data.coupons.find((c) => c.code.toUpperCase() === codeUpper && c.isActive);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percent') {
          let calc = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && calc > coupon.maxDiscount) calc = coupon.maxDiscount;
          discount = calc;
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue;
        } else if (coupon.discountType === 'free_shipping') {
          deliveryFee = 0;
        }
        coupon.usedCount += 1;
        appliedCoupon = coupon.code;
      }
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);

    // 4. Decrement Stock Atomically
    for (const reqItem of orderPayload.items) {
      const product = this.data.products.find((p) => p.id === reqItem.productId)!;
      product.stock -= reqItem.quantity;
      if (reqItem.variantId && product.variants) {
        const v = product.variants.find((v) => v.id === reqItem.variantId);
        if (v && v.stock >= reqItem.quantity) {
          v.stock -= reqItem.quantity;
        }
      }
    }

    // 5. Generate unique sequential Order Number (e.g. SG-2026-1042)
    const count = this.data.orders.length + 1001;
    const orderNumber = `SG-${new Date().getFullYear()}-${count}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail,
      district: orderPayload.district,
      upazila: orderPayload.upazila,
      address: orderPayload.address,
      deliveryInstructions: orderPayload.deliveryInstructions,
      orderNotes: orderPayload.orderNotes,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'cod' ? 'pending' : 'pending',
      fulfillmentStatus: 'pending_confirmation',
      codStatus: orderPayload.paymentMethod === 'cod' ? 'pending' : undefined,
      items: orderItems,
      subtotal,
      discount,
      couponCode: appliedCoupon || undefined,
      deliveryFee,
      total,
      statusHistory: [
        {
          status: 'pending_confirmation',
          timestamp: now,
          actor: 'Customer (Online Checkout)',
          note: 'অর্ডার সফলভাবে জমা দেওয়া হয়েছে। কনফার্মেশনের জন্য অপেক্ষমাণ।',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(newOrder);
    this.logAudit('ORDER_CREATED', orderPayload.customerPhone, `Order ${orderNumber} placed for ৳${total}`);
    this.save();

    return { success: true, order: newOrder };
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, actor: string, note?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const previousStatus = order.fulfillmentStatus;
    order.fulfillmentStatus = status;
    order.updatedAt = new Date().toISOString();

    // If cancelled or returned, return stock to products
    const isCancelledOrReturned = status === 'cancel' || status === 'cancelled' || status === 'return' || status === 'returned';
    const wasCancelledOrReturned = previousStatus === 'cancel' || previousStatus === 'cancelled' || previousStatus === 'return' || previousStatus === 'returned';
    if (isCancelledOrReturned && !wasCancelledOrReturned) {
      for (const item of order.items) {
        const prod = this.data.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
    }

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      actor,
      note: note || `Status changed from ${previousStatus} to ${status}`,
    });

    this.logAudit('ORDER_STATUS_UPDATED', actor, `Order ${order.orderNumber} changed to ${status}`);
    this.save();
    return order;
  }

  public updateCodReconciliation(orderId: string, codStatus: CodReconciliationStatus, actor: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.codStatus = codStatus;
    if (codStatus === 'collected' || codStatus === 'reconciled') {
      order.paymentStatus = 'paid';
    }
    order.updatedAt = new Date().toISOString();
    this.logAudit('COD_RECONCILED', actor, `Order ${order.orderNumber} COD status marked as ${codStatus}`);
    this.save();
    return order;
  }

  public updateOrderCourier(orderId: string, courierName: 'pathao' | 'steadfast' | 'redx' | 'manual', consignmentId: string, trackingCode?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.courierName = courierName;
    order.consignmentId = consignmentId;
    order.trackingCode = trackingCode || consignmentId;
    order.fulfillmentStatus = 'shipped';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date().toISOString(),
      actor: `Courier System (${courierName.toUpperCase()})`,
      note: `কুরিয়ারে হস্তান্তর করা হয়েছে। ট্র্যাকিং আইডি: ${consignmentId}`,
    });
    this.save();
    return order;
  }

  // Settings
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<BusinessSettings>, actor: string) {
    this.data.settings = { ...this.data.settings, ...partial };
    this.logAudit('SETTINGS_UPDATED', actor, 'Business settings were updated.');
    this.save();
    return this.data.settings;
  }

  // Coupons
  public getCoupons() {
    return this.data.coupons;
  }

  public saveCoupon(couponData: Partial<Coupon> & { code: string; discountValue: number }): Coupon {
    if (couponData.id) {
      const idx = this.data.coupons.findIndex((c) => c.id === couponData.id);
      if (idx !== -1) {
        this.data.coupons[idx] = { ...this.data.coupons[idx], ...couponData };
        this.save();
        return this.data.coupons[idx];
      }
    }
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: couponData.code.trim().toUpperCase(),
      discountType: couponData.discountType || 'percent',
      discountValue: Number(couponData.discountValue),
      minOrderValue: Number(couponData.minOrderValue || 0),
      maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : undefined,
      usageLimit: Number(couponData.usageLimit || 100),
      usedCount: 0,
      startDate: couponData.startDate || new Date().toISOString(),
      endDate: couponData.endDate || new Date(Date.now() + 90 * 86400000).toISOString(),
      isActive: couponData.isActive !== false,
    };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  // Banners
  public getBanners() {
    return this.data.banners;
  }

  public saveBanner(bannerData: Partial<Banner> & { titleBn: string; imageUrl: string }): Banner {
    if (bannerData.id) {
      const idx = this.data.banners.findIndex((b) => b.id === bannerData.id);
      if (idx !== -1) {
        this.data.banners[idx] = { ...this.data.banners[idx], ...bannerData };
        this.save();
        return this.data.banners[idx];
      }
    }
    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      titleBn: bannerData.titleBn,
      subtitleBn: bannerData.subtitleBn || '',
      tagBn: bannerData.tagBn,
      imageUrl: bannerData.imageUrl,
      linkUrl: bannerData.linkUrl || '/products',
      buttonTextBn: bannerData.buttonTextBn || 'অর্ডার করুন',
      isActive: bannerData.isActive !== false,
      sortOrder: bannerData.sortOrder || this.data.banners.length + 1,
    };
    this.data.banners.push(newBanner);
    this.save();
    return newBanner;
  }

  public deleteBanner(id: string): boolean {
    const idx = this.data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.banners.splice(idx, 1);
    this.save();
    return true;
  }

  // Landing Pages
  public getLandingPages(): LandingPage[] {
    return this.data.landingPages || [];
  }

  public getLandingPageBySlug(slug: string): LandingPage | undefined {
    return (this.data.landingPages || []).find((lp) => lp.slug === slug && lp.isActive);
  }

  public saveLandingPage(pageData: Partial<LandingPage> & { title: string; headlineBn: string; productId: string }): LandingPage {
    if (!this.data.landingPages) this.data.landingPages = [];
    const now = new Date().toISOString();

    if (pageData.id) {
      const idx = this.data.landingPages.findIndex((p) => p.id === pageData.id);
      if (idx !== -1) {
        this.data.landingPages[idx] = {
          ...this.data.landingPages[idx],
          ...pageData,
          updatedAt: now,
        };
        this.save();
        return this.data.landingPages[idx];
      }
    }

    const newPage: LandingPage = {
      id: pageData.id || `lp-${Date.now()}`,
      slug: pageData.slug || `campaign-${Date.now()}`,
      title: pageData.title,
      headlineBn: pageData.headlineBn,
      subheadlineBn: pageData.subheadlineBn || '',
      badgeTextBn: pageData.badgeTextBn || 'বিশেষ ক্যাম্পেইন',
      productId: pageData.productId,
      bannerImage: pageData.bannerImage || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
      logoUrl: pageData.logoUrl || '',
      featuresBn: pageData.featuresBn && pageData.featuresBn.length > 0 ? pageData.featuresBn : ['১০০% নিরাপদ ও শিশু-বান্ধব', 'সারা দেশে ক্যাশ অন ডেলিভারি'],
      callToActionBn: pageData.callToActionBn || 'এখনই অর্ডার করুন',
      isActive: pageData.isActive !== false,
      viewCount: 0,
      orderCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.landingPages.unshift(newPage);
    this.save();
    return newPage;
  }

  public deleteLandingPage(id: string): boolean {
    if (!this.data.landingPages) return false;
    const idx = this.data.landingPages.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.landingPages.splice(idx, 1);
    this.save();
    return true;
  }

  public incrementLandingPageView(slug: string) {
    if (!this.data.landingPages) return;
    const page = this.data.landingPages.find((p) => p.slug === slug);
    if (page) {
      page.viewCount = (page.viewCount || 0) + 1;
      this.save();
    }
  }

  // Reviews
  public getReviews(productId?: string) {
    if (productId) {
      return this.data.reviews.filter((r) => r.productId === productId && r.isApproved);
    }
    return this.data.reviews;
  }

  public addReview(productId: string, customerName: string, rating: number, comment: string): Review {
    const rev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      customerName,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      isApproved: true, // Auto-approve demo reviews or editable in admin
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.unshift(rev);
    this.save();
    return rev;
  }

  // Reports
  public getFinancialSummary() {
    const orders = this.data.orders;
    let grossSales = 0;
    let netRevenue = 0;
    let totalDiscounts = 0;
    let totalDeliveryFees = 0;
    let codCollected = 0;
    let codPending = 0;

    for (const o of orders) {
      const isCancelledOrReturned = o.fulfillmentStatus === 'cancel' || o.fulfillmentStatus === 'cancelled' || o.fulfillmentStatus === 'return' || o.fulfillmentStatus === 'returned';
      if (!isCancelledOrReturned) {
        grossSales += o.subtotal;
        totalDiscounts += o.discount;
        totalDeliveryFees += o.deliveryFee;
        netRevenue += o.total;

        if (o.paymentMethod === 'cod') {
          if (o.codStatus === 'collected' || o.codStatus === 'reconciled') {
            codCollected += o.total;
          } else {
            codPending += o.total;
          }
        }
      }
    }

    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.fulfillmentStatus] = (statusCounts[o.fulfillmentStatus] || 0) + 1;
    }

    const lowStockProducts = this.data.products.filter((p) => p.stock <= 5);

    return {
      totalOrders: orders.length,
      grossSales,
      netRevenue,
      totalDiscounts,
      totalDeliveryFees,
      codCollected,
      codPending,
      statusCounts,
      lowStockProducts,
    };
  }
}

export const db = new Database();
