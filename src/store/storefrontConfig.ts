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
    title: "ELEVATE YOUR GAME",
    subtitle: "High-performance sports gear and apparel designed for champions.",
    gradient: "linear-gradient(135deg, #111111 0%, #222222 50%, #000000 100%)",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
    tag: "Pro Performance",
    offer: "Up to 30% OFF",
    buttonText: "Shop Gear",
    buttonLink: "#categories",
    enabled: true,
  },
  {
    id: 2,
    title: "TRAIN WITHOUT LIMITS",
    subtitle: "Premium fitness accessories and gym equipment built to last.",
    gradient: "linear-gradient(135deg, #1f1f1f 0%, #2e2e2e 50%, #111111 100%)",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    tag: "Fitness Special",
    offer: "Flat 20% OFF",
    buttonText: "View Collection",
    buttonLink: "#categories",
    enabled: true,
  },
  {
    id: 3,
    title: "CHAMPIONS WEAR AURA",
    subtitle: "Get authentic sportswear jerseys and premium training footwear.",
    gradient: "linear-gradient(135deg, #000000 0%, #1c1c1c 50%, #292929 100%)",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80",
    tag: "Athletic Wear",
    offer: "Buy 1 Get 1 Free",
    buttonText: "Shop Apparel",
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
  { id: 1, name: 'Footwear', icon: 'Dumbbell', count: 180, published: true, sortOrder: 1 },
  { id: 2, name: 'Apparel', icon: 'Shirt', count: 320, published: true, sortOrder: 2 },
  { id: 3, name: 'Fitness', icon: 'Zap', count: 150, published: true, sortOrder: 3 },
  { id: 4, name: 'Equipment', icon: 'Grid3X3', count: 90, published: true, sortOrder: 4 },
  { id: 5, name: 'Accessories', icon: 'Watch', count: 120, published: true, sortOrder: 5 },
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
  storeName: 'AURA Sports',
  logoTextPrimary: 'AURA',
  logoTextSecondary: 'Sports',
  footerDescription: 'Elevate your game with high-performance sports gear, apparel, and training accessories. Trusted by athletes worldwide for ultimate durability and comfort.',
  copyrightText: '© 2026 AURA Sports. All rights reserved.',
  paymentMethodsText: 'Visa • Mastercard • BKash • Rocket • Cash on Delivery',
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
    id: 1, name: 'Nike Air Zoom Pegasus Running Shoes', category: 'Footwear', brand: 'Nike', sku: 'NK-AZP-001',
    price: 4500, originalPrice: 6000, rating: 4.8, reviews: 340,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'The Nike Air Zoom Pegasus offers responsive cushioning and secure support to keep you moving comfortably through your runs. Experience premium energy return with lightweight foam.',
    features: ['Zoom Air unit for responsive bounce','Breathable engineered mesh upper','Flywire cables for lockdown fit','Durable rubber outsole for traction'],
    specs: [{name:'Activity',value:'Running / Training'},{name:'Weight',value:'280g'},{name:'Arch Support',value:'Neutral'},{name:'Warranty',value:'6 Months'}],
    customerReviews: [
      {id:101,user:'Rahat A.',rating:5,date:'2026-05-12',comment:'Super comfortable for daily running. The bounce is incredible!',helpful:12},
      {id:102,user:'Sajid H.',rating:4,date:'2026-04-28',comment:'Great fit, but runs slightly small. Size up by half a size.',helpful:5}
    ],
    relatedProducts: [3, 7]
  },
  {
    id: 2, name: 'Dri-FIT Athletic Training Jersey', category: 'Apparel', brand: 'Adidas', sku: 'AD-DFT-002',
    price: 1200, originalPrice: null, rating: 4.6, reviews: 180,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'new', inStock: true, published: true,
    description: 'Stay dry and cool during intense workouts. This lightweight training jersey is made with moisture-wicking Dri-FIT fabric to keep you focused on your training.',
    features: ['Moisture-wicking fabric','Athletic slim fit','Reflective details for low light visibility','Chafe-free flatlock seams'],
    specs: [{name:'Material',value:'100% Recycled Polyester'},{name:'Fit',value:'Athletic Fit'},{name:'Washing',value:'Machine Wash Cold'}],
    customerReviews: [],
    relatedProducts: [6, 8]
  },
  {
    id: 3, name: 'Cast Iron Adjustable Dumbbells (20kg Set)', category: 'Fitness', brand: 'PowerGym', sku: 'PG-CID-003',
    price: 3500, originalPrice: 4200, rating: 4.9, reviews: 520,
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'Perfect for home gym workouts. This adjustable dumbbell set includes high-quality cast iron plates and a secure spinlock collar system to customize your lifting weight easily.',
    features: ['Solid cast iron plates for maximum durability','Spinlock collars for quick weight adjustment','Knurled chrome handles for secure grip','Convenient carrying case included'],
    specs: [{name:'Total Weight',value:'20kg (10kg x 2)'},{name:'Plate Material',value:'Cast Iron'},{name:'Handle Type',value:'Knurled Chrome'}],
    customerReviews: [],
    relatedProducts: [1, 5]
  },
  {
    id: 4, name: 'Professional Carbon Fiber Badminton Racket', category: 'Equipment', brand: 'Yonex', sku: 'YX-CFB-004',
    price: 2800, originalPrice: null, rating: 4.7, reviews: 98,
    image: 'https://images.unsplash.com/photo-1617083934386-611b6985226b?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1617083934386-611b6985226b?auto=format&fit=crop&w=600&q=80'],
    badge: null, inStock: true, published: true,
    description: 'Designed for intermediate to advanced players seeking high power and control. Built with high-modulus carbon fiber for a lightweight yet incredibly strong frame.',
    features: ['Full carbon graphite frame','Nanometric technology for aerodynamic speed','Isometric head shape expands sweet spot','Control support cap for better grip play'],
    specs: [{name:'Frame Material',value:'High Modulus Graphite'},{name:'Weight',value:'83g (4U)'},{name:'Grip Size',value:'G4'}],
    customerReviews: [],
    relatedProducts: [8]
  },
  {
    id: 5, name: 'Anti-Burst Gym & Yoga Ball', category: 'Fitness', brand: 'FlexiFit', sku: 'FF-AGB-005',
    price: 850, originalPrice: 1200, rating: 4.7, reviews: 120,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80'],
    badge: 'sale', inStock: true, published: true,
    description: 'Enhance core strength, balance, and posture. Made from extra-thick, anti-burst PVC material designed to withstand heavy workouts at home or the gym.',
    features: ['Anti-burst technology up to 500 lbs','Non-slip textured surface','Foot pump included for easy inflation','Versatile tool for core training and rehabilitation'],
    specs: [{name:'Diameter',value:'65cm'},{name:'Material',value:'Non-toxic PVC'},{name:'Includes',value:'Foot Pump, Plugs'}],
    customerReviews: [],
    relatedProducts: [3, 7]
  },
  {
    id: 6, name: 'Waterproof Sports Gym Duffle Bag', category: 'Accessories', brand: 'Nike', sku: 'NK-WDB-006',
    price: 1800, originalPrice: null, rating: 4.5, reviews: 156,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'new', inStock: true, published: true,
    description: 'Carry your training essentials with ease. This durable, water-resistant duffle bag features a dedicated ventilated shoe compartment and padded shoulder strap.',
    features: ['Water-resistant base material','Spacious main compartment','Separate ventilated pocket for shoes or wet gear','Adjustable padded shoulder strap'],
    specs: [{name:'Capacity',value:'45L'},{name:'Dimensions',value:'20" L x 11" W x 11" H'},{name:'Material',value:'Polyester'}],
    customerReviews: [],
    relatedProducts: [2, 7]
  },
  {
    id: 7, name: 'Smart Sport Fitness Watch Active', category: 'Accessories', brand: 'Fitbit', sku: 'FB-SFB-007',
    price: 3200, originalPrice: 4000, rating: 4.8, reviews: 218,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?auto=format&fit=crop&w=600&q=80'
    ],
    badge: 'sale', inStock: true, published: true,
    description: 'Track your heart rate, sleep quality, daily steps, and workout sessions. Features standard sports tracking modes and water-resistance up to 50 meters.',
    features: ['24/7 Heart rate monitor','Multi-sport tracking modes','Up to 7 days battery life','Water resistant to 50m (IP68)'],
    specs: [{name:'Display',value:'AMOLED Color Display'},{name:'Battery',value:'Up to 7 Days'},{name:'Compatibility',value:'iOS & Android'}],
    customerReviews: [],
    relatedProducts: [1, 6]
  },
  {
    id: 8, name: 'Professional Match Football (Size 5)', category: 'Equipment', brand: 'Puma', sku: 'PM-PMF-008',
    price: 1500, originalPrice: null, rating: 4.4, reviews: 89,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    gallery: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'],
    badge: null, inStock: true, published: true,
    description: 'A high-performance match football designed for superior flight stability, shape retention, and touch control. Perfect for outdoor training or professional matches.',
    features: ['Premium textured casing for better grip','High-density rubber bladder for air retention','Machine stitched durable panels','Official Size 5 dimensions'],
    specs: [{name:'Size',value:'Official Size 5'},{name:'Weight',value:'420-440g'},{name:'Material',value:'PU Leather'}],
    customerReviews: [],
    relatedProducts: [2, 4]
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
