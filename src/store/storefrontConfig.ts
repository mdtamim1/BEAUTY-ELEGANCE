/**
 * Centralized Storefront Configuration Store
 * 
 * All storefront-editable content lives here. Data is persisted to localStorage
 * and consumed reactively by storefront components.
 * 
 * When a real backend is added, swap localStorage calls for API calls.
 */

// ============================================================
// TYPES
// ============================================================

export interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
  image?: string;
  tag: string;
  offer: string;
  buttonText: string;
  buttonLink: string;
  enabled: boolean;
}

export interface AnnouncementItem {
  id: number;
  text: string;
  enabled: boolean;
}

export interface CategoryConfig {
  id: number;
  name: string;
  icon: string; // lucide icon name
  count: number;
  published: boolean;
  sortOrder: number;
}

export interface NavLinkItem {
  id: number;
  label: string;
  url: string;
  enabled: boolean;
  productIds?: number[];
  timerEnabled?: boolean;
  timerStartDate?: string;
  timerEndDate?: string;
  timerLabel?: string;
  timerStartLabel?: string;
  customPageContent?: string;
}

export interface FooterColumn {
  title: string;
  links: NavLinkItem[];
}

export interface ContactInfo {
  whatsappNumber: string;
  phoneNumber: string;
  messengerUrl: string;
  email: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
}

export interface StoreBranding {
  storeName: string;
  logoTextPrimary: string;
  logoTextSecondary: string;
  footerDescription: string;
  copyrightText: string;
  paymentMethodsText: string;
}

export interface FeatureBadge {
  id: number;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface DeliveryConfig {
  insideDhakaPrice: number;
  insideDhakaTimeline: string;
  outsideDhakaPrice: number;
  outsideDhakaTimeline: string;
}

export interface NewsletterConfig {
  heading: string;
  subtitle: string;
  buttonText: string;
  placeholderText: string;
}

export interface ProductConfig {
  id: number;
  name: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  badge: 'sale' | 'new' | null;
  inStock: boolean;
  published: boolean;
  description: string;
  features: string[];
  specs: { name: string; value: string }[];
  customerReviews: { id: number; user: string; rating: number; date: string; comment: string; helpful: number }[];
  relatedProducts: number[];
  stock?: number;
  sold?: number;
  revenue?: number;
  videoUrl?: string;
  photoContent?: string;
}

export interface StorefrontConfig {
  banners: BannerSlide[];
  announcements: AnnouncementItem[];
  categories: CategoryConfig[];
  navLinks: NavLinkItem[];
  footerColumns: FooterColumn[];
  contactInfo: ContactInfo;
  branding: StoreBranding;
  featureBadges: FeatureBadge[];
  delivery: DeliveryConfig;
  newsletter: NewsletterConfig;
  products: ProductConfig[];
}

// ============================================================
// DEFAULT VALUES (matching current hardcoded content)
// ============================================================

const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 1,
    title: "Buy Best Gym and Sports Equipment",
    subtitle: "Discover premium gym and sports equipment at our online shop - from fitness machines to training gear, everything you need to stay active and healthy.",
    gradient: "linear-gradient(135deg, #111111 0%, #222222 50%, #000000 100%)",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    tag: "Sports passion",
    offer: "Special Sale",
    buttonText: "SHOP NOW",
    buttonLink: "/collection/fitness-item",
    enabled: true,
  },
  {
    id: 2,
    title: "Premium Quality Sports Shoes",
    subtitle: "Run faster, jump higher, and look stylish with our elite collection of athletic and casual sports footwear.",
    gradient: "linear-gradient(135deg, #1f1f1f 0%, #2e2e2e 50%, #111111 100%)",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    tag: "Shoes Collection",
    offer: "Up to 30% OFF",
    buttonText: "EXPLORE NOW",
    buttonLink: "/collection/sports-shoes",
    enabled: true,
  }
];

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: 1, text: "🎉 স্পোর্টস কোর এক্স মানেই শক্তি, খেলা আর আনন্দ! সকল পণ্যের ওপর বিশেষ ছাড়!", enabled: true },
  { id: 2, text: "🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা এবং দ্রুত হোম ডেলিভারি!", enabled: true },
  { id: 3, text: "📞 যেকোনো প্রয়োজনে কল বা হোয়াটসঅ্যাপ করুন: ০১৩২১৮৩২৬০৫", enabled: true }
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 1, name: 'Fitness Item', icon: 'Dumbbell', count: 120, published: true, sortOrder: 1 },
  { id: 2, name: 'Sports Game', icon: 'Gamepad', count: 85, published: true, sortOrder: 2 },
  { id: 3, name: 'Sports Shoes', icon: 'Watch', count: 95, published: true, sortOrder: 3 },
  { id: 4, name: 'Sports wear', icon: 'Shirt', count: 140, published: true, sortOrder: 4 },
];

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: 1, label: 'Home', url: '/', enabled: true },
  { id: 3, label: 'Shop', url: '/collection/fitness-item', enabled: true },
  { id: 15, label: 'Blogs', url: '/blogs', enabled: true },
  { id: 4, label: 'My account', url: '/account', enabled: true },
  { id: 5, label: 'Contact', url: '/page/6', enabled: true },
];

const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Quick Links',
    links: [
      { id: 1, label: 'Home', url: '/', enabled: true },
      { id: 2, label: 'Shop All', url: '/collection/fitness-item', enabled: true },
      { id: 3, label: 'New Arrivals', url: '/collection/fitness-item', enabled: true },
      { id: 4, label: 'Best Sellers', url: '/collection/fitness-item', enabled: true },
      { id: 5, label: 'Sale', url: '/collection/fitness-item', enabled: true },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { id: 6, label: 'Contact Us', url: '/', enabled: true, customPageContent: '<h3>যোগাযোগ করুন</h3><p>আমাদের সাথে সরাসরি কথা বলতে নিচের নম্বরে যোগাযোগ করুন:</p><p>📞 <strong>মোবাইল:</strong> ০১৩২১৮৩২৬০৫</p><p>💬 <strong>WhatsApp:</strong> +৮৮০১৩২১৮৩২৬০৫</p><p>✉️ <strong>ইমেইল:</strong> support@sportscorex.com</p><p>আমাদের সাথে যেকোনো প্রয়োজনে যোগাযোগ করতে পারেন।</p>' },
      { id: 7, label: 'Shipping Info', url: '/', enabled: true, customPageContent: '<h3>ডেলিভারি পলিসি ও চার্জ</h3><p>আমাদের যেকোনো পণ্য আপনার দোরগোড়ায় পৌঁছে দিতে আমরা নির্ভরযোগ্য ডেলিভারি পার্টনার ব্যবহার করি.</p><p>📍 <strong>ঢাকার ভেতরে:</strong> ডেলিভারি চার্জ ৬০ টাকা (সময়: ১-২ কার্যদিবস)</p><p>📍 <strong>ঢাকার বাইরে:</strong> ডেলিভারি চার্জ ১২০ টাকা (সময়: ২-৩ কার্যদিবস)</p><p>📦 ৫,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি প্রদান করা হয়।</p>' },
      { id: 8, label: 'Returns & Exchanges', url: '/', enabled: true, customPageContent: '<h3>রিটার্ন ও এক্সচেঞ্জ পলিসি</h3><p>আমাদের পণ্য ক্রয়ের পর যদি কোনো সমস্যা দেখা দেয় বা আপনি সন্তুষ্ট না হন, তবে ৭ দিনের মধ্যে সহজেই এক্সচেঞ্জ বা রিটার্ন করতে পারবেন।</p><p>⚠️ <strong>শর্তাবলী:</strong></p><ul><li>পণ্যটি অব্যবহৃত এবং সম্পূর্ণ নতুন অবস্থায় থাকতে হবে।</li><li>অরিজিনাল প্যাকেজিং ও মেমো সাথে থাকতে হবে।</li></ul>' },
      { id: 9, label: 'FAQ', url: '/', enabled: true, customPageContent: '<h3>সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3><p><strong>১. আমি কীভাবে অর্ডার করব?</strong><br/>পণ্যটি সিলেক্ট করে "Buy Now" এ ক্লিক করুন এবং আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে অর্ডার নিশ্চিত করুন।</p><p><strong>২. আমি কি ক্যাশ অন ডেলিভারি পেতে পারি?</strong><br/>হ্যাঁ, আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধের সুবিধা) দিচ্ছি।</p>' },
    ],
  },
  {
    title: 'Company',
    links: [
      { id: 11, label: 'About Us', url: '/', enabled: true, customPageContent: '<h3>আমাদের সম্পর্কে</h3><p><strong>SportScoreX</strong> একটি শীর্ষস্থানীয় অনলাইন স্পোর্টস রিটেইল প্ল্যাটফর্ম। আমাদের লক্ষ্য হলো সুলভ মূল্যে উন্নত মানের জিম ও ফিটনেস একুপমেন্ট, জুতো ও খেলাধুলার সামগ্রী আপনার দোরগোড়ায় পৌঁছে দেওয়া।</p>' },
      { id: 13, label: 'Privacy Policy', url: '/', enabled: true, customPageContent: '<h3>প্রাইভেসি পলিসি</h3><p>অর্ডার প্রসেস ও কাস্টমার সার্ভিসের সুবিধার্থে আমরা আপনার নাম, ঠিকানা ও মোবাইল নম্বর সংগ্রহ করে থাকি। আমরা নিশ্চিত করছি যে আপনার এই তথ্যগুলো সম্পূর্ণ সুরক্ষিত এবং কখনোই কোনো তৃতীয় পক্ষের কাছে শেয়ার করা হবে না।</p>' },
      { id: 14, label: 'Terms of Service', url: '/', enabled: true, customPageContent: '<h3>ব্যবহারের শর্তাবলী</h3><p>আমাদের ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি এই শর্তাবলীতে সম্মতি প্রদান করছেন।</p><ul><li>অর্ডারে দেওয়া মোবাইল নম্বর ও ডেলিভারি ঠিকানা সঠিক হতে হবে।</li><li>পণ্য ডেলিভারি পাওয়ার পর দয়া করে ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন।</li></ul>' },
    ],
  },
];

const DEFAULT_CONTACT_INFO: ContactInfo = {
  whatsappNumber: '8801321832605',
  phoneNumber: '01321832605',
  messengerUrl: 'https://m.me/sportscorex',
  email: 'support@sportscorex.com',
  facebookUrl: 'https://facebook.com/sportscorex',
  tiktokUrl: 'https://tiktok.com/@sportscorex',
  instagramUrl: 'https://instagram.com/sportscorex',
};

const DEFAULT_BRANDING: StoreBranding = {
  storeName: 'SportScoreX',
  logoTextPrimary: 'Sport',
  logoTextSecondary: 'ScoreX',
  footerDescription: 'Sports Core X মানেই শক্তি, খেলা আর আনন্দ আমাদের কাছে পাবেন Gym Equipment, Sports Item ও Kids Sports Products —পুরো পরিবারের জন্য।',
  copyrightText: '© 2026 SportScoreX. All rights reserved.',
  paymentMethodsText: 'Cash on Delivery • BKash • Rocket • Visa • Mastercard',
};

const DEFAULT_FEATURE_BADGES: FeatureBadge[] = [
  { id: 1, icon: 'Truck', title: 'Fast Delivery', description: 'Inside & Outside Dhaka', enabled: true },
  { id: 2, icon: 'Shield', title: 'Secure Shopping', description: '100% authentic items', enabled: true },
  { id: 3, icon: 'RotateCcw', title: 'Easy Exchange', description: '7 days support window', enabled: true },
  { id: 4, icon: 'Headphones', title: 'Help Center', description: 'Live WhatsApp support', enabled: true },
];

const DEFAULT_DELIVERY: DeliveryConfig = {
  insideDhakaPrice: 60,
  insideDhakaTimeline: '১-২ দিন',
  outsideDhakaPrice: 120,
  outsideDhakaTimeline: '২-৩ দিন',
};

const DEFAULT_NEWSLETTER: NewsletterConfig = {
  heading: 'Join Our Newsletter',
  subtitle: 'Get real-time discount drops and coupon codes directly in your inbox.',
  buttonText: 'Subscribe',
  placeholderText: 'Enter your email address',
};

const DEFAULT_PRODUCTS: ProductConfig[] = [
  {
    id: 1, name: 'Hex Dumbbells Set (20kg)', category: 'Fitness Item', brand: 'PowerGym', sku: 'SSX-HEX-001',
    price: 3500, originalPrice: 4200, rating: 4.8, reviews: 340,
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'High-quality hex dumbbells perfect for a home gym. Features premium cast iron plates and rubberized coating to protect your flooring.',
    features: ['Solid cast iron core','Anti-roll hex design','Knurled chrome grip for safety','Rubber coating reduces noise'],
    specs: [{name:'Total Weight',value:'20kg (10kg x 2)'},{name:'Material',value:'Cast Iron & Rubber'},{name:'Handle Type',value:'Knurled'}],
    customerReviews: [
      {id:101,user:'Asif R.',rating:5,date:'2026-05-12',comment:'Very good quality dumbbells. Highly recommended!',helpful:8}
    ],
    relatedProducts: [2, 7]
  },
  {
    id: 2, name: '4-Wheels AB Roller for Core Strength', category: 'Fitness Item', brand: 'FitMax', sku: 'SSX-ABR-002',
    price: 1200, originalPrice: 1800, rating: 4.7, reviews: 180,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'Stabilized 4-wheels AB roller designed to build core strength and burn fat. Includes a comfortable knee pad.',
    features: ['4-wheel design for max stability','Comfortable foam grip handles','Silent wheels protect floors','Includes knee foam mat'],
    specs: [{name:'Wheels Count',value:'4'},{name:'Max Weight Cap',value:'150kg'},{name:'Includes',value:'Knee Pad'}],
    customerReviews: [],
    relatedProducts: [1, 7]
  },
  {
    id: 3, name: 'Professional Match Football (Size 5)', category: 'Sports Game', brand: 'Puma', sku: 'SSX-FTB-003',
    price: 1500, originalPrice: 2000, rating: 4.6, reviews: 120,
    image: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80'],
    badge: 'sale', inStock: true, published: true,
    description: 'Top-tier match football featuring textured casing for excellent flight control and shape retention.',
    features: ['Premium textured casing for flight stability','High-density rubber bladder for air retention','Durable panels for longevity'],
    specs: [{name:'Size',value:'Official Size 5'},{name:'Weight',value:'420-440g'},{name:'Material',value:'PU Leather'}],
    customerReviews: [],
    relatedProducts: [4, 8]
  },
  {
    id: 4, name: 'Professional Carbon Fiber Badminton Racket', category: 'Sports Game', brand: 'Yonex', sku: 'SSX-BAD-004',
    price: 2800, originalPrice: 3500, rating: 4.8, reviews: 98,
    image: 'https://images.unsplash.com/photo-1687360441372-757f8b2b6835?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1687360441372-757f8b2b6835?auto=format&fit=crop&w=600&q=80'],
    badge: 'sale', inStock: true, published: true,
    description: 'Aerodynamic carbon fiber badminton racket designed for swift swing speed and heavy smash power.',
    features: ['Full carbon graphite frame','Aerodynamic nanotechnology','Isometric head shape for sweet spot expansion'],
    specs: [{name:'Frame Material',value:'High Modulus Graphite'},{name:'Weight',value:'83g'},{name:'Grip Size',value:'G4'}],
    customerReviews: [],
    relatedProducts: [3, 8]
  },
  {
    id: 5, name: 'Breathable Mesh Running Shoes', category: 'Sports Shoes', brand: 'AeroStep', sku: 'SSX-SH-005',
    price: 4500, originalPrice: 6000, rating: 4.9, reviews: 220,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'High performance running shoes featuring responsive cushioning and breathable mesh for peak training performance.',
    features: ['Engineered breathable mesh upper','Bounce cushion midsole for energy return','High traction rubber outsole'],
    specs: [{name:'Activity',value:'Running / Jogging'},{name:'Weight',value:'290g'},{name:'Warranty',value:'6 Months'}],
    customerReviews: [],
    relatedProducts: [6]
  },
  {
    id: 6, name: 'Dri-FIT Athletic Jersey', category: 'Sports wear', brand: 'Adidas', sku: 'SSX-JRS-006',
    price: 1200, originalPrice: 1600, rating: 4.6, reviews: 156,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'Stay cool and dry during intense play with this sweat-wicking lightweight training jersey.',
    features: ['Dri-FIT moisture wicking technology','Atheletic fit design','100% Recycled polyester'],
    specs: [{name:'Material',value:'Polyester'},{name:'Fit',value:'Slim Fit'},{name:'Wash',value:'Machine Wash Cold'}],
    customerReviews: [],
    relatedProducts: [5]
  },
  {
    id: 7, name: 'Non-Slip 8mm Yoga Mat', category: 'Fitness Item', brand: 'FlexiFit', sku: 'SSX-YOG-007',
    price: 950, originalPrice: 1500, rating: 4.7, reviews: 112,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80'],
    badge: 'sale', inStock: true, published: true,
    description: 'Extra thick 8mm TPE yoga mat featuring a non-slip textured alignment line pattern to keep posture correct.',
    features: ['High-density 8mm thick TPE material','Non-slip textured double side','Posture alignment marks','Eco-friendly non-toxic material'],
    specs: [{name:'Thickness',value:'8mm'},{name:'Material',value:'TPE'},{name:'Dimensions',value:'183cm x 61cm'}],
    customerReviews: [],
    relatedProducts: [1, 2]
  },
  {
    id: 8, name: 'Kids Adjustable Basketball Hoop Set', category: 'Sports Game', brand: 'KidSports', sku: 'SSX-BBH-008',
    price: 3200, originalPrice: 4500, rating: 4.5, reviews: 89,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80'],
    badge: 'sale', inStock: true, published: true,
    description: 'Height-adjustable basketball hoop system perfect for indoor/outdoor kid fun and sports development.',
    features: ['Adjustable height stand','Sturdy backboard and steel rim','Water/Sand fillable base for stability'],
    specs: [{name:'Max Height',value:'7 Feet'},{name:'Suitable Age',value:'3-10 Years'},{name:'Material',value:'Steel & Durable ABS'}],
    customerReviews: [],
    relatedProducts: [3, 4]
  }
];

// ============================================================
// STORAGE KEY
// ============================================================

const STORAGE_KEY = 'storefront_config';

// ============================================================
// CONFIG MANAGER
// ============================================================

let _config: StorefrontConfig | null = null;
let _listeners: Array<() => void> = [];

function getDefaultConfig(): StorefrontConfig {
  return {
    banners: DEFAULT_BANNERS,
    announcements: DEFAULT_ANNOUNCEMENTS,
    categories: DEFAULT_CATEGORIES,
    navLinks: DEFAULT_NAV_LINKS,
    footerColumns: DEFAULT_FOOTER_COLUMNS,
    contactInfo: { ...DEFAULT_CONTACT_INFO },
    branding: { ...DEFAULT_BRANDING },
    featureBadges: DEFAULT_FEATURE_BADGES,
    delivery: { ...DEFAULT_DELIVERY },
    newsletter: { ...DEFAULT_NEWSLETTER },
    products: DEFAULT_PRODUCTS,
  };
}

function loadConfig(): StorefrontConfig {
  if (_config) return _config;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Auto-migrate navigation links in local storage
      if (parsed.navLinks && Array.isArray(parsed.navLinks)) {
        let migrated = false;
        
        parsed.navLinks = parsed.navLinks
          .map((link: any) => {
            const labelLower = (link.label || '').toLowerCase();
            // Rename old labels
            if (labelLower === 'deals' || labelLower === 'deal') {
              migrated = true;
              link = { ...link, label: 'Offers', url: '/collection/offers' };
            }
            if (labelLower === 'brands' || labelLower === 'brand' || labelLower === 'popular') {
              migrated = true;
              link = { ...link, label: 'Popular Order', url: '/collection/popular-order' };
            }
            // Ensure New Arrivals has correct URL
            if (labelLower === 'new arrivals' || labelLower === 'new arrival') {
              if (link.url !== '/collection/new-arrivals') {
                migrated = true;
                link = { ...link, url: '/collection/new-arrivals' };
              }
              if (!link.productIds || link.productIds.length === 0) {
                migrated = true;
                link = { ...link, productIds: [6, 7] };
              }
            }
            // Ensure Popular Order has correct URL
            if (labelLower === 'popular order' || labelLower === 'popular') {
              if (link.url !== '/collection/popular-order') {
                migrated = true;
                link = { ...link, url: '/collection/popular-order' };
              }
              if (!link.productIds || link.productIds.length === 0) {
                migrated = true;
                link = { ...link, productIds: [2, 5] };
              }
            }
            // Ensure Offers has correct URL and products
            if (labelLower === 'offers' || labelLower === 'offer') {
              if (link.url !== '/collection/offers') {
                migrated = true;
                link = { ...link, url: '/collection/offers' };
              }
              if (!link.productIds || link.productIds.length === 0) {
                migrated = true;
                link = { ...link, productIds: [1, 3] };
              }
            }
            // Strip '/store' from any other URL
            let url = link.url || '';
            if (url.startsWith('/store/')) {
              migrated = true;
              link = { ...link, url: url.replace('/store/', '/') };
            } else if (url === '/store') {
              migrated = true;
              link = { ...link, url: '/' };
            }
            // Migrate hash-based URLs to route-based collection pages
            if (url.includes('/store#') && link.productIds && link.productIds.length > 0) {
              const hash = url.split('#')[1];
              if (hash) {
                migrated = true;
                link = { ...link, url: `/collection/${hash}` };
              }
            }
            return link;
          })
          .filter((link: any) => {
            const labelLower = (link.label || '').toLowerCase();
            const keep = labelLower !== 'shop' && labelLower !== 'shop all';
            if (!keep) migrated = true;
            return keep;
          });
          
        if (migrated) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      const defaults = getDefaultConfig();

      // Auto-migrate footer columns to contain default page content
      if (parsed.footerColumns && Array.isArray(parsed.footerColumns)) {
        parsed.footerColumns = parsed.footerColumns.map((col: any) => ({
          ...col,
          links: (col.links || []).map((link: any) => {
            const defaultCol = defaults.footerColumns.find(c => c.title === col.title);
            const defaultLink = defaultCol?.links.find(l => l.id === link.id);
            if (defaultLink && link.customPageContent === undefined) {
              return { ...link, customPageContent: defaultLink.customPageContent };
            }
            return link;
          })
        }));
      }

      // Merge with defaults to handle new fields added in updates
      _config = {
        ...defaults,
        ...parsed,
        contactInfo: { ...defaults.contactInfo, ...parsed.contactInfo },
        branding: { ...defaults.branding, ...parsed.branding },
        delivery: { ...defaults.delivery, ...parsed.delivery },
        newsletter: { ...defaults.newsletter, ...parsed.newsletter },
      };
      return _config as StorefrontConfig;
    }
  } catch {
    // ignore parse errors
  }
  _config = getDefaultConfig();
  return _config;
}

function saveConfig(config: StorefrontConfig): void {
  _config = config;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
  // Notify all listeners
  _listeners.forEach(fn => fn());
}

// ============================================================
// BACKEND SYNC AND UTILITIES
// ============================================================

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE = isLocalDev
  ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
  : 'https://beauty-elegance-admin.onrender.com/api/v1';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

async function syncWithBackend() {
  try {
    const response = await fetch(`${API_BASE}/settings/storefront?t=${Date.now()}`);
    if (response.ok) {
      const res = await response.json();
      if (res.status === 'success' && res.data) {
        const serverConfig = res.data;
        
        // Preserve products from currently loaded memory config or localStorage
        const currentProducts = _config?.products || [];
        if (currentProducts.length > 0) {
          serverConfig.products = currentProducts;
        } else {
          const localDataStr = localStorage.getItem(STORAGE_KEY);
          if (localDataStr) {
            try {
              const localData = JSON.parse(localDataStr);
              if (localData.products && localData.products.length > 0) {
                serverConfig.products = localData.products;
              }
            } catch (e) {}
          }
        }

        const localData = localStorage.getItem(STORAGE_KEY);
        if (JSON.stringify(serverConfig) !== localData) {
          _config = serverConfig;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverConfig));
          _listeners.forEach(fn => fn());
        }
      }
    }
  } catch (err) {
    console.warn("Failed to sync storefront config from backend:", err);
  }
}


// ============================================================
// PUBLIC API
// ============================================================

/** Get the full config */
export function getStorefrontConfig(): StorefrontConfig {
  return loadConfig();
}

/** Update the full config */
export function setStorefrontConfig(config: StorefrontConfig): void {
  saveConfig(config);
  fetch(`${API_BASE}/settings/storefront`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(config),
  }).catch(e => console.warn("Failed to save config to backend:", e));
}

/** Update the full config locally only (does not PUT to backend) */
export function setStorefrontConfigLocally(config: StorefrontConfig): void {
  saveConfig(config);
}

/** Update a specific section of the config */
export function updateStorefrontConfig<K extends keyof StorefrontConfig>(
  key: K,
  value: StorefrontConfig[K]
): void {
  const config = loadConfig();
  const newConfig = { ...config, [key]: value };
  saveConfig(newConfig);
  fetch(`${API_BASE}/settings/storefront`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(newConfig),
  }).catch(e => console.warn("Failed to save config to backend:", e));
}

/** Subscribe to config changes. Returns unsubscribe function. */
export function subscribeToConfig(listener: () => void): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter(fn => fn !== listener);
  };
}

/** Reset config to defaults */
export function resetStorefrontConfig(): void {
  _config = null;
  localStorage.removeItem(STORAGE_KEY);
  _listeners.forEach(fn => fn());
  fetch(`${API_BASE}/settings/storefront`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(getDefaultConfig()),
  }).catch(e => console.warn("Failed to reset config on backend:", e));
}

// ============================================================
// REACT HOOK
// ============================================================

import { useState as useStateReact, useEffect as useEffectReact } from 'react';

/** React hook to read and reactively update storefront config */
export function useStorefrontConfig(): [StorefrontConfig, (config: StorefrontConfig) => void] {
  const [config, setConfigState] = useStateReact<StorefrontConfig>(() => loadConfig());

  useEffectReact(() => {
    syncWithBackend();
    const unsubscribe = subscribeToConfig(() => {
      setConfigState({ ...loadConfig() });
    });
    return unsubscribe;
  }, []);

  const setConfig = (newConfig: StorefrontConfig) => {
    saveConfig(newConfig);
    fetch(`${API_BASE}/settings/storefront`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(newConfig),
    }).catch(e => console.warn("Failed to save config to backend:", e));
  };

  return [config, setConfig];
}

/** React hook for a specific config section */
export function useStorefrontSection<K extends keyof StorefrontConfig>(key: K): [StorefrontConfig[K], (value: StorefrontConfig[K]) => void] {
  const [config, setConfig] = useStorefrontConfig();

  const setValue = (value: StorefrontConfig[K]) => {
    setConfig({ ...config, [key]: value });
  };

  return [config[key], setValue];
}
