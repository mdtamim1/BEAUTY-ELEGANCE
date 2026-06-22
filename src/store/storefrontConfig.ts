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
    title: "ঈদুল ফিতর মেগা সেল",
    subtitle: "ঈদ মোবারক! নতুন কালেকশনে ৫০% পর্যন্ত ছাড়!",
    gradient: "linear-gradient(135deg, #115e59 0%, #0f766e 50%, #042f2e 100%)",
    image: "https://picsum.photos/seed/eid-banner/600/600",
    tag: "Eid Special",
    offer: "Flat 50% OFF",
    buttonText: "অফারটি দেখুন",
    buttonLink: "#categories",
    enabled: true,
  },
  {
    id: 2,
    title: "শারদীয় দুর্গোৎসব অফার",
    subtitle: "পূজার আনন্দে শপিং করুন আকর্ষণীয় মূল্যে!",
    gradient: "linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #450a0a 100%)",
    image: "",
    tag: "Puja Fest",
    offer: "Buy 1 Get 1",
    buttonText: "অফারটি দেখুন",
    buttonLink: "#categories",
    enabled: true,
  },
  {
    id: 3,
    title: "পহেলা বৈশাখ উৎসব",
    subtitle: "শুভ নববর্ষ! নতুন বছরের স্পেশাল বৈশাখী ধামাকা অফার!",
    gradient: "linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #713f12 100%)",
    image: "",
    tag: "Boishakhi Fest",
    offer: "Flat 30% Cashback",
    buttonText: "অফারটি দেখুন",
    buttonLink: "#categories",
    enabled: true,
  },
  {
    id: 4,
    title: "হ্যাপি নিউ ইয়ার ধামাকা",
    subtitle: "নতুন বছরের সেরা ডিলগুলো লুফে নিন এখনই!",
    gradient: "linear-gradient(135deg, #6b21a8 0%, #8b5cf6 50%, #3b0764 100%)",
    image: "",
    tag: "New Year Sale",
    offer: "Up to 70% OFF",
    buttonText: "অফারটি দেখুন",
    buttonLink: "#categories",
    enabled: true,
  },
];

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: 1, text: "🎉 স্পেশাল উৎসব অফার! সকল পণ্যের ওপর ৫০% পর্যন্ত নিশ্চিত ছাড়!", enabled: true },
  { id: 2, text: "🚚 ৫,০০০ টাকার বেশি কেনাকাটায় সারা বাংলাদেশে ফ্রি হোম ডেলিভারি!", enabled: true },
  { id: 3, text: "✨ বিকাশ পেমেন্টে ১০% ইনস্ট্যান্ট ক্যাশব্যাক অফার চলছে!", enabled: true },
  { id: 4, text: "📞 যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন: ০১৭০০০০০০০০", enabled: true },
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 1, name: 'Electronics', icon: 'Smartphone', count: 1240, published: true, sortOrder: 1 },
  { id: 2, name: 'Fashion', icon: 'Shirt', count: 3450, published: true, sortOrder: 2 },
  { id: 3, name: 'Home & Garden', icon: 'Home', count: 890, published: true, sortOrder: 3 },
  { id: 4, name: 'Sports', icon: 'Dumbbell', count: 670, published: true, sortOrder: 4 },
  { id: 5, name: 'Beauty', icon: 'Sparkles', count: 1120, published: true, sortOrder: 5 },
  { id: 6, name: 'Books', icon: 'BookOpen', count: 2340, published: true, sortOrder: 6 },
];

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: 1, label: 'Home', url: '/', enabled: true },
  { id: 3, label: 'Offers', url: '/collection/offers', enabled: true, productIds: [1, 3], timerEnabled: true, timerStartDate: '2026-07-01T00:00:00', timerEndDate: '2026-08-01T00:00:00', timerLabel: 'Offer ends in', timerStartLabel: 'Offer starts in' },
  { id: 4, label: 'New Arrivals', url: '/collection/new-arrivals', enabled: true, productIds: [6, 7] },
  { id: 5, label: 'Popular Order', url: '/collection/popular-order', enabled: true, productIds: [2, 5] },
];

const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Quick Links',
    links: [
      { id: 1, label: 'Home', url: '/', enabled: true },
      { id: 2, label: 'Shop All', url: '/', enabled: true },
      { id: 3, label: 'New Arrivals', url: '/', enabled: true },
      { id: 4, label: 'Best Sellers', url: '/', enabled: true },
      { id: 5, label: 'Sale', url: '/', enabled: true },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { id: 6, label: 'Contact Us', url: '/', enabled: true, customPageContent: '<h3>যোগাযোগ করুন</h3><p>আমাদের সাথে সরাসরি কথা বলতে নিচের নম্বরে যোগাযোগ করুন:</p><p>📞 <strong>মোবাইল:</strong> ০১৭০০০০০০০০</p><p>💬 <strong>WhatsApp:</strong> +৮৮০১৭০০০০০০০০</p><p>✉️ <strong>ইমেইল:</strong> support@vipcommerce.com</p><p>শনিবার থেকে বৃহস্পতিবার সকাল ৯টা থেকে রাত ৯টা পর্যন্ত আমরা আপনার সহায়তার জন্য আছি।</p>' },
      { id: 7, label: 'Shipping Info', url: '/', enabled: true, customPageContent: '<h3>ডেলিভারি পলিসি ও চার্জ</h3><p>আমাদের যেকোনো পণ্য আপনার দোরগোড়ায় পৌঁছে দিতে আমরা নির্ভরযোগ্য ডেলিভারি পার্টনার ব্যবহার করি।</p><p>📍 <strong>ঢাকার ভেতরে:</strong> ডেলিভারি চার্জ ৬০ টাকা (সময়: ১-২ কার্যদিবস)</p><p>📍 <strong>ঢাকার বাইরে:</strong> ডেলিভারি চার্জ ১২০ টাকা (সময়: ২-৩ কার্যদিবস)</p><p>📦 ৫,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি প্রদান করা হয়।</p>' },
      { id: 8, label: 'Returns & Exchanges', url: '/', enabled: true, customPageContent: '<h3>রিটার্ন ও এক্সচেঞ্জ পলিসি</h3><p>আমাদের পণ্য ক্রয়ের পর যদি কোনো সমস্যা দেখা দেয় বা আপনি সন্তুষ্ট না হন, তবে ৭ দিনের মধ্যে সহজেই এক্সচেঞ্জ বা রিটার্ন করতে পারবেন।</p><p>⚠️ <strong>শর্তাবলী:</strong></p><ul><li>পণ্যটি অব্যবহৃত এবং সম্পূর্ণ নতুন অবস্থায় থাকতে হবে।</li><li>অরিজিনাল প্যাকেজিং ও মেমো সাথে থাকতে হবে।</li><li>সাইজ পরিবর্তন করার ক্ষেত্রে কোনো অতিরিক্ত চার্জ লাগবে না (শুধু ডেলিভারি চার্জ ছাড়া)।</li></ul>' },
      { id: 9, label: 'FAQ', url: '/', enabled: true, customPageContent: '<h3>সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3><p><strong>১. আমি কীভাবে অর্ডার করব?</strong><br/>পণ্যটি সিলেক্ট করে "Buy Now" এ ক্লিক করুন এবং আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে অর্ডার নিশ্চিত করুন।</p><p><strong>২. আমি কি ক্যাশ অন ডেলিভারি পেতে পারি?</strong><br/>হ্যাঁ, আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধের সুবিধা) দিচ্ছি।</p><p><strong>৩. আপনাদের কি কোনো শোরুম আছে?</strong><br/>বর্তমানে আমাদের সেবা পুরোপুরি অনলাইন-ভিত্তিক, যা আমরা ঢাকার প্রধান কার্যালয় থেকে পরিচালনা করি।</p>' },
      { id: 10, label: 'Track Order', url: '/', enabled: true, customPageContent: '<h3>অর্ডার ট্র্যাকিং</h3><p>অর্ডার ট্র্যাকিং পেজ খুব শীঘ্রই আসছে।</p>' },
    ],
  },
  {
    title: 'Company',
    links: [
      { id: 11, label: 'About Us', url: '/', enabled: true, customPageContent: '<h3>আমাদের সম্পর্কে</h3><p><strong>VIPCommerce</strong> একটি শীর্ষস্থানীয় অনলাইন রিটেইল প্ল্যাটফর্ম। আমাদের লক্ষ্য হলো সুলভ মূল্যে উন্নত মানের কসমেটিকস, ফ্যাশন ও অন্যান্য আকর্ষণীয় লাইফস্টাইল প্রডাক্টস আপনার দোরগোড়ায় পৌঁছে দেওয়া।</p><p>আমরা সরাসরি উৎপাদক ও আমদানিকারকের কাছ থেকে অথেন্টিক প্রোডাক্ট সংগ্রহ করি, যা শতভাগ আসল প্রোডাক্টের গ্যারান্টি দেয়।</p>' },
      { id: 12, label: 'Careers', url: '/', enabled: true, customPageContent: '<h3>ক্যারিয়ার</h3><p>আমাদের ডাইনামিক এবং এনার্জেটিক টিমে যোগ দিতে চান?</p><p>বর্তমানে আমাদের কোনো শূন্য পদ নেই। তবে আপনার সিভি মেইল করে রাখতে পারেন <strong>careers@vipcommerce.com</strong> ঠিকানায়। কোনো শূন্য পদ তৈরি হলে আমরা আপনার সাথে যোগাযোগ করব।</p>' },
      { id: 13, label: 'Privacy Policy', url: '/', enabled: true, customPageContent: '<h3>প্রাইভেসি পলিসি</h3><p>Personal information safety guidelines.</p><p>অর্ডার প্রসেস ও কাস্টমার সার্ভিসের সুবিধার্থে আমরা আপনার নাম, ঠিকানা ও মোবাইল নম্বর সংগ্রহ করে থাকি। আমরা নিশ্চিত করছি যে আপনার এই তথ্যগুলো সম্পূর্ণ সুরক্ষিত এবং কখনোই কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হবে না।</p>' },
      { id: 14, label: 'Terms of Service', url: '/', enabled: true, customPageContent: '<h3>ব্যবহারের শর্তাবলী</h3><p>আমাদের ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি এই শর্তাবলীতে সম্মতি প্রদান করছেন।</p><ul><li>অর্ডারে দেওয়া মোবাইল নম্বর ও ডেলিভারি ঠিকানা সঠিক হতে হবে।</li><li>পণ্য ডেলিভারি পাওয়ার পর দয়া করে ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন।</li><li>যেকোনো অভিযোগের জন্য ডেলিভারি নেওয়ার ২৪ ঘণ্টার মধ্যে সাপোর্টে যোগাযোগ করুন।</li></ul>' },
      { id: 15, label: 'Affiliate Program', url: '/', enabled: true, customPageContent: '<h3>অ্যাফিলিয়েট প্রোগ্রাম</h3><p>ঘরে বসেই আমাদের প্রোডাক্ট প্রোমোট করে আকর্ষণীয় কমিশন ইনকাম করুন!</p><p>আমাদের অ্যাফিলিয়েট মেম্বার হতে আপনার সোশ্যাল প্রোফাইলের লিঙ্ক এবং বিবরণ লিখে ইমেইল করুন <strong>affiliate@vipcommerce.com</strong> ঠিকানায়। আমাদের টিম আপনার আবেদন রিভিউ করে অ্যাফিলিয়েট অ্যাকাউন্ট সচল করে দেবে।</p>' },
    ],
  },
];

const DEFAULT_CONTACT_INFO: ContactInfo = {
  whatsappNumber: '8801700000000',
  phoneNumber: '01700000000',
  messengerUrl: 'https://m.me/yourpage',
  email: 'support@vipcommerce.com',
  facebookUrl: 'https://facebook.com/yourpage',
  tiktokUrl: 'https://tiktok.com/@yourprofile',
  instagramUrl: 'https://instagram.com/yourprofile',
};

const DEFAULT_BRANDING: StoreBranding = {
  storeName: 'VIPCommerce',
  logoTextPrimary: 'VIP',
  logoTextSecondary: 'Commerce',
  footerDescription: 'Premium ecommerce platform with 50,000+ products from verified sellers. Shop with confidence — free shipping, easy returns, and 24/7 customer support.',
  copyrightText: '© 2025 VIPCommerce. All rights reserved.',
  paymentMethodsText: 'Visa • Mastercard • PayPal • Apple Pay',
};

const DEFAULT_FEATURE_BADGES: FeatureBadge[] = [
  { id: 1, icon: 'Truck', title: 'Free Shipping', description: 'On orders over ৳৫০০০', enabled: true },
  { id: 2, icon: 'Shield', title: 'Secure Payment', description: '100% protected', enabled: true },
  { id: 3, icon: 'RotateCcw', title: 'Easy Returns', description: '30-day return policy', enabled: true },
  { id: 4, icon: 'Headphones', title: '24/7 Support', description: 'Always here to help', enabled: true },
];

const DEFAULT_DELIVERY: DeliveryConfig = {
  insideDhakaPrice: 60,
  insideDhakaTimeline: '১-২ দিন',
  outsideDhakaPrice: 120,
  outsideDhakaTimeline: '১-৩ দিন',
};

const DEFAULT_NEWSLETTER: NewsletterConfig = {
  heading: 'Join Our Newsletter',
  subtitle: 'Get 10% off your first order + exclusive deals delivered to your inbox',
  buttonText: 'Subscribe',
  placeholderText: 'Enter your email address',
};

const DEFAULT_PRODUCTS: ProductConfig[] = [
  {
    id: 1, name: 'Wireless Earbuds Pro Max', category: 'Electronics', brand: 'SonicTech', sku: 'ST-EPB-001',
    price: 129.99, originalPrice: 179.99, rating: 4.8, reviews: 2340,
    image: 'https://picsum.photos/seed/earbuds/600/600',
    gallery: ['https://picsum.photos/seed/earbuds/600/600','https://picsum.photos/seed/earbuds2/600/600','https://picsum.photos/seed/earbuds3/600/600','https://picsum.photos/seed/earbuds4/600/600'],
    badge: 'sale', inStock: true, published: true,
    description: 'Experience premium audio quality with the Wireless Earbuds Pro Max. Featuring active noise cancellation, 24-hour battery life, and sweat resistance. Designed for the ultimate auditory experience whether you are commuting, working out, or relaxing at home.',
    features: ['Active Noise Cancellation (ANC)','Transparency Mode for hearing the world around you','Up to 24 hours of total listening time with the MagSafe Charging Case','Spatial audio with dynamic head tracking','Sweat and water resistant (IPX4)'],
    specs: [{name:'Connectivity',value:'Bluetooth 5.3'},{name:'Battery Life',value:'Up to 6 hours on single charge'},{name:'Water Resistance',value:'IPX4'},{name:'Weight',value:'5.4g per earbud'},{name:'Warranty',value:'1 Year Manufacturer'}],
    customerReviews: [
      {id:101,user:'Alex D.',rating:5,date:'2025-10-12',comment:'The noise cancellation on these is incredible. I use them on the subway every day.',helpful:45},
      {id:102,user:'Sarah M.',rating:4,date:'2025-09-28',comment:'Great sound quality, but the case gets scratched easily. Highly recommend getting a cover.',helpful:22},
      {id:103,user:'Michael T.',rating:5,date:'2025-09-15',comment:'Best earbuds I have ever owned. The spatial audio feature really makes a difference.',helpful:18},
    ],
    relatedProducts: [3,5],
  },
  {
    id: 2, name: 'Premium Leather Crossbody Bag', category: 'Fashion', brand: 'Luxe Wear', sku: 'LW-BAG-002',
    price: 89.99, originalPrice: null, rating: 4.6, reviews: 1820,
    image: 'https://picsum.photos/seed/bag2/600/600',
    gallery: ['https://picsum.photos/seed/bag2/600/600','https://picsum.photos/seed/bag2_1/600/600','https://picsum.photos/seed/bag2_2/600/600'],
    badge: 'new', inStock: true, published: true,
    description: 'Crafted from 100% genuine full-grain leather, this crossbody bag combines timeless elegance with everyday practicality. It features multiple compartments to keep your essentials organized.',
    features: ['100% Genuine Full-Grain Leather','Adjustable crossbody strap','Gold-tone hardware','Interior zip and slip pockets'],
    specs: [{name:'Material',value:'Genuine Leather'},{name:'Dimensions',value:'10" W x 8" H x 3" D'},{name:'Strap Drop',value:'22" - 24"'},{name:'Lining',value:'Polyester'}],
    customerReviews: [
      {id:201,user:'Emily R.',rating:5,date:'2025-11-02',comment:'Absolutely beautiful bag! The leather feels so soft and premium.',helpful:12},
      {id:202,user:'Jessica W.',rating:4,date:'2025-10-18',comment:'Perfect size for everyday use, but I wish the strap was slightly thicker.',helpful:8},
    ],
    relatedProducts: [6,8],
  },
  {
    id: 3, name: 'Smart Watch Ultra Series 5', category: 'Electronics', brand: 'TechGear', sku: 'TG-SW-005',
    price: 349.99, originalPrice: 449.99, rating: 4.9, reviews: 5120,
    image: 'https://picsum.photos/seed/watch5/600/600',
    gallery: ['https://picsum.photos/seed/watch5/600/600','https://picsum.photos/seed/watch5_1/600/600','https://picsum.photos/seed/watch5_2/600/600'],
    badge: 'sale', inStock: true, published: true,
    description: 'The ultimate smartwatch for your active life. Track your health, workouts, and stay connected with cellular capability.',
    features: ['Always-On Retina display','Blood oxygen and ECG apps','Water resistant up to 50 meters','Advanced workout metrics'],
    specs: [{name:'Display',value:'OLED Always-On'},{name:'Battery',value:'Up to 18 hours'},{name:'Water Resistance',value:'50m'},{name:'Connectivity',value:'GPS + Cellular'}],
    customerReviews: [], relatedProducts: [1,5],
  },
  {
    id: 4, name: 'Organic Face Serum Collection', category: 'Beauty', brand: 'NatureGlow', sku: 'NG-FS-004',
    price: 45.99, originalPrice: null, rating: 4.7, reviews: 980,
    image: 'https://picsum.photos/seed/serum2/600/600',
    gallery: ['https://picsum.photos/seed/serum2/600/600','https://picsum.photos/seed/serum2_1/600/600'],
    badge: null, inStock: true, published: true,
    description: 'Revitalize your skin with our 100% organic face serum collection. Packed with Vitamin C and Hyaluronic Acid for a radiant glow.',
    features: ['100% Organic','Cruelty-Free','Contains Vitamin C & Hyaluronic Acid'],
    specs: [{name:'Volume',value:'30ml'},{name:'Skin Type',value:'All'}],
    customerReviews: [], relatedProducts: [8],
  },
  {
    id: 5, name: '4K OLED Gaming Monitor 32"', category: 'Electronics', brand: 'VisionPro', sku: 'VP-M-032',
    price: 699.99, originalPrice: 899.99, rating: 4.9, reviews: 3200,
    image: 'https://picsum.photos/seed/monitor3/600/600',
    gallery: ['https://picsum.photos/seed/monitor3/600/600','https://picsum.photos/seed/monitor3_1/600/600'],
    badge: 'sale', inStock: true, published: true,
    description: 'Immerse yourself in true 4K HDR gaming with unparalleled contrast and 144Hz refresh rate.',
    features: ['4K UHD Resolution','144Hz Refresh Rate','1ms Response Time','G-Sync Compatible'],
    specs: [{name:'Panel Type',value:'OLED'},{name:'Resolution',value:'3840 x 2160'},{name:'Refresh Rate',value:'144Hz'}],
    customerReviews: [], relatedProducts: [1,3],
  },
  {
    id: 6, name: 'Running Shoes X Carbon Pro', category: 'Sports', brand: 'AeroStep', sku: 'AS-RS-006',
    price: 159.99, originalPrice: null, rating: 4.5, reviews: 1560,
    image: 'https://picsum.photos/seed/shoes3/600/600',
    gallery: ['https://picsum.photos/seed/shoes3/600/600','https://picsum.photos/seed/shoes3_1/600/600'],
    badge: 'new', inStock: true, published: true,
    description: 'Lightweight, responsive running shoes featuring a carbon fiber plate for maximum energy return.',
    features: ['Carbon Fiber Plate','Breathable Mesh Upper','High-Traction Outsole'],
    specs: [{name:'Weight',value:'210g'},{name:'Drop',value:'8mm'}],
    customerReviews: [], relatedProducts: [2],
  },
  {
    id: 7, name: 'Ergonomic Office Chair Pro', category: 'Home & Garden', brand: 'ComfortZone', sku: 'CZ-CH-007',
    price: 299.99, originalPrice: 399.99, rating: 4.8, reviews: 2180,
    image: 'https://picsum.photos/seed/chair2/600/600',
    gallery: ['https://picsum.photos/seed/chair2/600/600','https://picsum.photos/seed/chair2_1/600/600'],
    badge: 'sale', inStock: true, published: true,
    description: 'Fully adjustable ergonomic chair designed to support your posture during long working hours.',
    features: ['Adjustable Lumbar Support','Breathable Mesh Back','4D Armrests'],
    specs: [{name:'Weight Capacity',value:'300 lbs'},{name:'Material',value:'Mesh & Aluminum'}],
    customerReviews: [], relatedProducts: [8],
  },
  {
    id: 8, name: 'Premium Silk Pillowcase Set', category: 'Home & Garden', brand: 'SleepWell', sku: 'SW-SP-008',
    price: 59.99, originalPrice: null, rating: 4.4, reviews: 890,
    image: 'https://picsum.photos/seed/pillow2/600/600',
    gallery: ['https://picsum.photos/seed/pillow2/600/600','https://picsum.photos/seed/pillow2_1/600/600'],
    badge: null, inStock: true, published: true,
    description: '100% pure mulberry silk pillowcases that prevent hair breakage and skin creases.',
    features: ['100% Mulberry Silk','Hidden Zipper','Machine Washable'],
    specs: [{name:'Size',value:'Standard (20" x 26")'},{name:'Thread Count',value:'600'}],
    customerReviews: [], relatedProducts: [4,7],
  },
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
// PUBLIC API
// ============================================================

/** Get the full config */
export function getStorefrontConfig(): StorefrontConfig {
  return loadConfig();
}

/** Update the full config */
export function setStorefrontConfig(config: StorefrontConfig): void {
  saveConfig(config);
}

/** Update a specific section of the config */
export function updateStorefrontConfig<K extends keyof StorefrontConfig>(
  key: K,
  value: StorefrontConfig[K]
): void {
  const config = loadConfig();
  saveConfig({ ...config, [key]: value });
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
}

// ============================================================
// REACT HOOK
// ============================================================

import { useState as useStateReact, useEffect as useEffectReact } from 'react';

/** React hook to read and reactively update storefront config */
export function useStorefrontConfig(): [StorefrontConfig, (config: StorefrontConfig) => void] {
  const [config, setConfigState] = useStateReact<StorefrontConfig>(() => loadConfig());

  useEffectReact(() => {
    const unsubscribe = subscribeToConfig(() => {
      setConfigState({ ...loadConfig() });
    });
    return unsubscribe;
  }, []);

  const setConfig = (newConfig: StorefrontConfig) => {
    saveConfig(newConfig);
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
