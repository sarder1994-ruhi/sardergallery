import re

# Read current AdminPortal.tsx
with open('src/components/AdminPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update activeTab type to include 'brand_settings' and 'marketing_tracking'
old_tab_type = """  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'brand_analytics'
    | 'banners'
    | 'landing_pages'
    | 'courier'
    | 'payments'
    | 'coupons'
    | 'delivery'
    | 'reports'
    | 'security'
  >('dashboard');"""

new_tab_type = """  const [activeTab, setActiveTab] = useState<
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
  };"""

if old_tab_type in content:
    content = content.replace(old_tab_type, new_tab_type)
    print("Replaced activeTab type and added helper functions successfully.")
else:
    print("WARNING: Could not find old_tab_type")

with open('/tmp/test_out.tsx', 'w') as f:
    f.write(content)
print("Finished step 1")
