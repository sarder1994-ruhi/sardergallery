export interface District {
  nameEn: string;
  nameBn: string;
  division: string;
  isDhakaCity?: boolean;
}

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { nameEn: 'Dhaka', nameBn: 'ঢাকা', division: 'Dhaka', isDhakaCity: true },
  { nameEn: 'Gazipur', nameBn: 'গাজীপুর', division: 'Dhaka' },
  { nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', division: 'Dhaka' },
  { nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', division: 'Dhaka' },
  { nameEn: 'Faridpur', nameBn: 'ফরিদপুর', division: 'Dhaka' },
  { nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', division: 'Dhaka' },
  { nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', division: 'Dhaka' },
  { nameEn: 'Narsingdi', nameBn: 'নরসিংদী', division: 'Dhaka' },
  { nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', division: 'Dhaka' },
  { nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', division: 'Dhaka' },
  { nameEn: 'Madaripur', nameBn: 'মাদারীপুর', division: 'Dhaka' },
  { nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', division: 'Dhaka' },
  { nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', division: 'Dhaka' },

  // Chittagong Division
  { nameEn: 'Chittagong', nameBn: 'চট্টগ্রাম', division: 'Chittagong' },
  { nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', division: 'Chittagong' },
  { nameEn: 'Comilla', nameBn: 'কুমিল্লা', division: 'Chittagong' },
  { nameEn: 'Feni', nameBn: 'ফেনী', division: 'Chittagong' },
  { nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', division: 'Chittagong' },
  { nameEn: 'Chandpur', nameBn: 'চাঁদপুর', division: 'Chittagong' },
  { nameEn: 'Noakhali', nameBn: 'নোয়াখালী', division: 'Chittagong' },
  { nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', division: 'Chittagong' },
  { nameEn: 'Bandarban', nameBn: 'বান্দরবান', division: 'Chittagong' },
  { nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', division: 'Chittagong' },
  { nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', division: 'Chittagong' },

  // Sylhet Division
  { nameEn: 'Sylhet', nameBn: 'সিলেট', division: 'Sylhet' },
  { nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', division: 'Sylhet' },
  { nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', division: 'Sylhet' },
  { nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', division: 'Sylhet' },

  // Rajshahi Division
  { nameEn: 'Rajshahi', nameBn: 'রাজশাহী', division: 'Rajshahi' },
  { nameEn: 'Bogra', nameBn: 'বগুড়া', division: 'Rajshahi' },
  { nameEn: 'Pabna', nameBn: 'পাবনা', division: 'Rajshahi' },
  { nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', division: 'Rajshahi' },
  { nameEn: 'Naogaon', nameBn: 'নওগাঁ', division: 'Rajshahi' },
  { nameEn: 'Natore', nameBn: 'নাটোর', division: 'Rajshahi' },
  { nameEn: 'Chapai Nawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi' },
  { nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', division: 'Rajshahi' },

  // Khulna Division
  { nameEn: 'Khulna', nameBn: 'খুলনা', division: 'Khulna' },
  { nameEn: 'Jessore', nameBn: 'যশোর', division: 'Khulna' },
  { nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', division: 'Khulna' },
  { nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', division: 'Khulna' },
  { nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', division: 'Khulna' },
  { nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', division: 'Khulna' },
  { nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', division: 'Khulna' },
  { nameEn: 'Magura', nameBn: 'মাগুরা', division: 'Khulna' },
  { nameEn: 'Meherpur', nameBn: 'মেহেরপুর', division: 'Khulna' },
  { nameEn: 'Narail', nameBn: 'নড়াইল', division: 'Khulna' },

  // Barisal Division
  { nameEn: 'Barisal', nameBn: 'বরিশাল', division: 'Barisal' },
  { nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', division: 'Barisal' },
  { nameEn: 'Bhola', nameBn: 'ভোলা', division: 'Barisal' },
  { nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', division: 'Barisal' },
  { nameEn: 'Barguna', nameBn: 'বরগুনা', division: 'Barisal' },
  { nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', division: 'Barisal' },

  // Rangpur Division
  { nameEn: 'Rangpur', nameBn: 'রংপুর', division: 'Rangpur' },
  { nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', division: 'Rangpur' },
  { nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', division: 'Rangpur' },
  { nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', division: 'Rangpur' },
  { nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', division: 'Rangpur' },
  { nameEn: 'Nilphamari', nameBn: 'নীলফামারী', division: 'Rangpur' },
  { nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', division: 'Rangpur' },
  { nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', division: 'Rangpur' },

  // Mymensingh Division
  { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', division: 'Mymensingh' },
  { nameEn: 'Jamalpur', nameBn: 'জামালপুর', division: 'Mymensingh' },
  { nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', division: 'Mymensingh' },
  { nameEn: 'Sherpur', nameBn: 'শেরপুর', division: 'Mymensingh' },
];

export function isInsideDhaka(districtName: string): boolean {
  if (!districtName) return false;
  const lower = districtName.toLowerCase().trim();
  return lower === 'dhaka' || lower === 'ঢাকা' || lower.includes('dhaka city');
}

export function formatBDT(amount: number, useBengaliDigits = false): string {
  const rounded = Math.round(amount);
  const formattedEn = rounded.toLocaleString('en-IN');
  if (!useBengaliDigits) {
    return `৳${formattedEn}`;
  }
  const bnDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };
  const bnString = formattedEn.replace(/[0-9]/g, (w) => bnDigits[w] || w);
  return `৳${bnString}`;
}

export function isValidBDPhone(phone: string): boolean {
  const clean = phone.replace(/[\s-]/g, '');
  return /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(clean);
}
