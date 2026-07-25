import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { Truck, Shield, RotateCcw, Headphones, Star, Heart, ShoppingCart, Zap,
  Smartphone, Shirt, Home as HomeIcon, Dumbbell, Sparkles, BookOpen,
  Monitor, Camera, Watch, Car, Baby, Flower, Palette, Music, Gamepad, Gift,
  Grid3X3, ArrowRight, CheckCircle, AlertCircle, X, Maximize2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { CountdownTimer } from './CollectionPage';
import { subscribeToNewsletter, fetchCampaignsFromBackend } from '../services/api';
import { OptimizedImage } from '../components/layout/OptimizedImage';
import { SEOMeta } from '../components/layout/SEOMeta';
import { resolveProductWithCampaign } from '../utils/productCampaignResolver';
import { getEventsFromStore, saveCustomerAchievement, type EventItem } from '../store/eventStore';
import { Gamepad2, Trophy, HelpCircle, Check, Copy, Flame, Clock } from 'lucide-react';

interface StorefrontContext {
  addToCart: (product: any) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
}

// Icon lookup map for dynamic icon resolution from config
const ICON_MAP: Record<string, any> = {
  Smartphone, Shirt, Home: HomeIcon, Dumbbell, Sparkles, BookOpen,
  Monitor, Camera, Headphones, Watch, Car, Baby,
  Pizza: Gift, Flower, Palette, Music, Gamepad, Gift,
  Grid3X3, Truck, Shield, RotateCcw, Zap, Star,
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  'glasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
  'sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
  'women dress': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
  'panjabi': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
  't-shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  'polo': 'https://images.unsplash.com/photo-1625910513413-562624f38eec?auto=format&fit=crop&w=600&q=80',
  'shirts': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
  'pants': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
  'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  'w. bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
  'fitness item': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
};

const TOP_BRANDS_LIST = [
  {
    id: 1,
    brandName: "NIKE",
    categoryName: "Sports Shoes & Footwear",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    link: "/collection/nike"
  },
  {
    id: 2,
    brandName: "FITMAX",
    categoryName: "Gym & Core Fitness",
    img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    link: "/collection/fitmax"
  },
  {
    id: 3,
    brandName: "PUMA",
    categoryName: "Activewear & Sports Apparels",
    img: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80",
    link: "/collection/puma"
  },
  {
    id: 4,
    brandName: "YONEX",
    categoryName: "Sports Games & Racquets",
    img: "https://images.unsplash.com/photo-1687360441372-757f8b2b6835?auto=format&fit=crop&w=600&q=80",
    link: "/collection/yonex"
  },
  {
    id: 5,
    brandName: "THE ORDINARY",
    categoryName: "Skincare & Clinical Wellness",
    img: "https://images.unsplash.com/photo-1608248597369-234667e4526d?auto=format&fit=crop&w=600&q=80",
    link: "/collection/the-ordinary"
  },
  {
    id: 6,
    brandName: "AEROSTEP",
    categoryName: "Sneakers & Streetwear",
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
    link: "/collection/aerostep"
  }
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="product-card-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12} fill={i <= Math.round(rating) ? '#fbbf24' : 'none'} color="#fbbf24" />
    ))}
  </div>
);

export default function StorefrontHome() {
  const { addToCart, toggleWishlist, wishlist, searchQuery } = useOutletContext<any>();
  const [config] = useStorefrontConfig();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeNpTab, setActiveNpTab] = useState('ALL');
  const [showCampaignsModal, setShowCampaignsModal] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const location = useLocation();

  // Newsletter states
  const [emailInput, setEmailInput] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subError, setSubError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event & Game States
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [eventTab, setEventTab] = useState<'running' | 'upcoming'>('running');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Game Play State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [wonCoupon, setWonCoupon] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setEventsList(getEventsFromStore());
  }, []);

  const handleOpenEventModal = (event: EventItem) => {
    setSelectedEvent(event);
    setQuizIndex(0);
    setQuizAnswers([]);
    setGameResult('playing');
    setWonCoupon(null);
    setIsSpinning(false);
    setCopiedCode(false);
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (!selectedEvent) return;
    const newAnswers = [...quizAnswers, optionIndex];
    setQuizAnswers(newAnswers);

    const questions = selectedEvent.quizQuestions || [];
    if (quizIndex < questions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctIndex) correctCount++;
      });

      const randomRoll = Math.random() * 100;
      const winChance = selectedEvent.winProbability || 80;
      
      if (correctCount >= 2 && randomRoll <= winChance) {
        setGameResult('won');
        const code = selectedEvent.rewardCoupon?.code || 'WINNER20';
        setWonCoupon(code);
        saveCustomerAchievement({
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          gameType: selectedEvent.type,
          couponCode: code,
          discountText: selectedEvent.rewardCoupon?.type === 'percentage' 
            ? `${selectedEvent.rewardCoupon.value}% OFF` 
            : `৳${selectedEvent.rewardCoupon?.value} OFF`,
          earnedAt: new Date().toISOString(),
          used: false,
        });
      } else {
        setGameResult('lost');
      }
    }
  };

  const handleSpinWheel = () => {
    if (!selectedEvent || isSpinning) return;
    setIsSpinning(true);

    setTimeout(() => {
      setIsSpinning(false);
      const randomRoll = Math.random() * 100;
      const winChance = selectedEvent.winProbability || 85;

      if (randomRoll <= winChance) {
        setGameResult('won');
        const code = selectedEvent.rewardCoupon?.code || 'LUCKY500';
        setWonCoupon(code);
        saveCustomerAchievement({
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          gameType: selectedEvent.type,
          couponCode: code,
          discountText: selectedEvent.rewardCoupon?.type === 'percentage' 
            ? `${selectedEvent.rewardCoupon.value}% OFF` 
            : `৳${selectedEvent.rewardCoupon?.value} OFF`,
          earnedAt: new Date().toISOString(),
          used: false,
        });
      } else {
        setGameResult('lost');
      }
    }, 1800);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Load active campaigns from backend API
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const announcements = config.announcements ? config.announcements.filter((a: any) => a.enabled) : [];
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaigns = await fetchCampaignsFromBackend();
        if (campaigns) {
          const active = campaigns.filter((c: any) => c.status === 'active');
          setActiveCampaigns(active);
        } else {
          // Fallback to localStorage if API is offline
          const stored = localStorage.getItem('campaignList');
          if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) {
              setActiveCampaigns(list.filter((c: any) => c.status === 'active'));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load campaigns:', e);
      }
    };
    loadCampaigns();
  }, []);

  const dynamicTopBrands = useMemo(() => {
    const publishedProducts = (config.products || []).filter((p: any) => p.published);
    const brandMap = new Map<string, { brandName: string; categoryName: string; img: string; link: string }>();

    const brandImages: Record<string, string> = {
      'powergym': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
      'aerostep': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'adidas': 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=600&q=80',
      'kidsports': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      'flexifit': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
      'yonex': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80',
      'fitmax': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      'nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    };

    publishedProducts.forEach((p: any) => {
      const bName = (p.brand || '').trim();
      if (!bName) return;
      const key = bName.toLowerCase();
      if (!brandMap.has(key)) {
        const cat = p.category || 'Official Collection';
        const img = p.image || brandImages[key] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
        brandMap.set(key, {
          brandName: bName,
          categoryName: cat,
          img: img,
          link: `/collection/all?brand=${encodeURIComponent(bName)}`
        });
      }
    });

    (config.brands || []).forEach((b: any) => {
      const key = b.name.toLowerCase();
      if (!brandMap.has(key)) {
        const img = brandImages[key] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
        brandMap.set(key, {
          brandName: b.name,
          categoryName: b.category || 'Official Brand',
          img: img,
          link: `/collection/all?brand=${encodeURIComponent(b.name)}`
        });
      }
    });

    return Array.from(brandMap.values());
  }, [config.products, config.brands]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubMsg('');
    setSubError('');
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    const res = await subscribeToNewsletter(emailInput.trim());
    setIsSubmitting(false);

    if (res.status === 'success') {
      setSubMsg(res.message || 'Newsletter subscription successful!');
      setEmailInput('');
    } else {
      setSubError(res.message || 'Subscription failed. Please try again.');
    }
  };

  // Shuffle products randomly on component mount or products update
  const shuffledProducts = useMemo(() => {
    const publishedProducts = config.products.filter(p => p.published);
    const resolved = publishedProducts.map(p => resolveProductWithCampaign(p, activeCampaigns));
    return [...resolved].sort(() => Math.random() - 0.5);
  }, [config.products, activeCampaigns]);

  const newPopularProducts = useMemo(() => {
    let published = config.products.filter(p => p.published);
    if (config.newPopularProductIds && config.newPopularProductIds.length > 0) {
      const selectedSet = new Set(config.newPopularProductIds);
      published = published.filter(p => selectedSet.has(p.id));
    }
    const resolved = published.map(p => resolveProductWithCampaign(p, activeCampaigns));
    if (activeNpTab === 'ALL') return resolved;

    const tabQuery = activeNpTab.toLowerCase();
    const matched = resolved.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return cat.includes(tabQuery) || name.includes(tabQuery);
    });

    return matched.length > 0 ? matched : resolved;
  }, [config.products, config.newPopularProductIds, activeNpTab, activeCampaigns]);

  const filteredProducts = shuffledProducts.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  }, [location.hash]);

  // Filter enabled banners
  const banners = config.banners.filter(b => b.enabled);
  // Filter published categories
  let categories = config.categories.filter(c => c.published).sort((a, b) => a.sortOrder - b.sortOrder);
  if (categories.length === 0) {
    const uniqueCategoryNames = Array.from(new Set(config.products.filter(p => p.published).map(p => p.category)));
    const iconMap: Record<string, string> = {
      'Electronics': 'Smartphone',
      'Fashion': 'Shirt',
      'Home & Garden': 'Home',
      'Sports': 'Dumbbell',
      'Beauty': 'Sparkles',
      'Books': 'BookOpen',
    };
    categories = uniqueCategoryNames.map((name, index) => ({
      id: index + 1,
      name,
      icon: iconMap[name] || 'Grid3X3',
      count: config.products.filter(p => p.published && p.category === name).length,
      published: true,
      sortOrder: index + 1
    }));
  }


  // Find if there is an active timed campaign
  const activePromoSection = config.navLinks.find(n => n.enabled && n.timerEnabled && n.timerEndDate);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
    }
  };

  return (
    <>
      <SEOMeta 
        title="Tamim Global | Premium Sports, Gym Equipment & Active Lifestyle Store BD" 
        description="Discover Bangladesh's premier online destination for authentic gym equipment, dumbbells, sports shoes, activewear, and workout gear. Fast cash on delivery nationwide." 
        keywords="Tamim Global, Sports Equipment Bangladesh, Gym Equipment BD, Buy Dumbbells Online, Sports Shoes Dhaka, Fitness Gear, Workout Accessories"
        slug=""
      />
      {/* ---- Hero Full-Width Carousel ---- */}
      {banners.length > 0 && (
        <section 
          className="hero-carousel-fullscreen"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="fullscreen-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className={`fullscreen-slide ${banner.image ? 'has-image' : ''}`} 
                style={{ 
                  background: banner.image 
                    ? `url(${banner.image}) center/cover no-repeat`
                    : banner.gradient,
                  cursor: banner.buttonLink ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (banner.buttonLink) {
                    if (banner.buttonLink.startsWith('#')) {
                      document.getElementById(banner.buttonLink.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = banner.buttonLink;
                    }
                  }
                }}
              >
                {!banner.image && (
                  <div className="fullscreen-slide-inner">
                    <div className="slide-content-left" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                      <span className="slide-badge">
                        <Zap size={14} /> {banner.tag}
                      </span>
                      <h1>{banner.title}</h1>
                      <p>{banner.subtitle}</p>
                      <div className="slide-action-row">
                        <span className="slide-offer-highlight">{banner.offer}</span>
                        <button className="store-btn store-btn-white">
                          {banner.buttonText}
                        </button>
                      </div>
                    </div>
                    <div className="slide-visual-right">
                      <div className="slide-glowing-circle" />
                      <div className="slide-visual-badge">{banner.offer}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="fullscreen-dots">
            {banners.map((_, idx) => (
              <span 
                key={idx} 
                className={`fullscreen-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- Announcement Bar (Below Hero Carousel) ---- */}
      {(announcements.length > 0 || activeCampaigns.length > 0) && (
        <div className="announcement-bar theme-colored">
          <div className="announcement-marquee" style={{ background: 'var(--sf-accent)' }}>
            <div className="announcement-marquee-content" style={{ color: 'white' }}>
              {announcements.map((ann: any, idx: number) => (
                <span key={idx} className="announcement-marquee-item" style={{ color: 'white', fontWeight: 'bold' }}>
                  📢 {ann.text}
                </span>
              ))}
              {activeCampaigns.map((camp: any, idx: number) => (
                <Link 
                  to={`/campaign/${camp.id}`}
                  key={`camp-${idx}`} 
                  className="announcement-marquee-item campaign-promo hover-accent" 
                  style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
                >
                  🔥 {camp.name} Campaign is Live! Check Now!
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- SPLAYD Replica FEATURED CATEGORIES ---- */}
      <section className="splayd-categories-section" id="categories">
        <div className="splayd-categories-header">
          <div className="splayd-categories-line" />
          <h2 className="splayd-categories-title">FEATURED CATEGORIES</h2>
          <div className="splayd-categories-line" />
        </div>

        <div className="splayd-categories-grid">
          {categories.map((cat: any, i: number) => {
            const categorySlug = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const categoryUrl = `/collection/${categorySlug}`;
            
            const categoryProducts = config.products.filter(p => p.published && (p.category || '').toLowerCase().trim() === cat.name.toLowerCase().trim());
            const lastProductImage = categoryProducts.length > 0 ? categoryProducts[categoryProducts.length - 1].image : '';
            const fallbackImage = CATEGORY_IMAGE_MAP[cat.name.toLowerCase().trim()] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
            const catImage = cat.image || lastProductImage || fallbackImage;

            return (
              <Link 
                to={categoryUrl}
                key={i} 
                className="splayd-category-card"
              >
                <img src={catImage} alt={cat.name} className="splayd-category-card-img" />
                <div className="splayd-category-card-overlay">
                  <h3 className="splayd-category-name">{cat.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- TOP BRANDS Section (1-Line Slider with Touch & Scroll Buttons) ---- */}
      {(() => {
        const topBrandsRef = useRef<HTMLDivElement>(null);

        const scrollBrands = (direction: 'left' | 'right') => {
          if (topBrandsRef.current) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            topBrandsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        };

        return (
          <section className="top-brands-section">
            <div className="top-brands-header">
              <div className="top-brands-line" />
              <h2 className="top-brands-title">TOP BRANDS</h2>
              <div className="top-brands-line" />
            </div>

            <div className="top-brands-slider-wrapper">
              <button 
                type="button" 
                className="brands-scroll-btn prev"
                onClick={() => scrollBrands('left')}
                title="Scroll Left"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="top-brands-grid horizontal-row-scroll" ref={topBrandsRef}>
                {dynamicTopBrands.map((item, idx) => (
                  <Link to={item.link} key={idx} className="top-brand-card">
                    <div className="top-brand-card-bg">
                      <img src={item.img} alt={item.brandName} />
                    </div>
                    <div className="top-brand-card-overlay" />
                    <div className="top-brand-card-content">
                      <h3 className="top-brand-name">{item.brandName}</h3>
                    </div>
                  </Link>
                ))}
              </div>

              <button 
                type="button" 
                className="brands-scroll-btn next"
                onClick={() => scrollBrands('right')}
                title="Scroll Right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </section>
        );
      })()}

      {/* ---- Most Selling & Trending 3D Banners ---- */}
      <section className="homepage-3d-banners-section">
        <Link to="/collection/most-selling" className="banner-3d-card banner-3d-most-selling" style={{ textDecoration: 'none' }}>
          <div className="banner-3d-card-inner">
            <h2 className="banner-3d-title">Most Selling</h2>
          </div>
        </Link>

        <Link to="/collection/trending" className="banner-3d-card banner-3d-trending" style={{ textDecoration: 'none' }}>
          <div className="banner-3d-card-inner">
            <h2 className="banner-3d-title">Trending</h2>
          </div>
        </Link>
      </section>

      {/* ---- All Campaigns Compact Image Banner ---- */}
      <div className="homepage-campaign-banner-wrap">
        <Link to="/campaigns" className="homepage-campaign-banner-link">
          <div className="homepage-campaign-image-banner">
            <img 
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80" 
              alt="Exclusive Campaigns & Offers" 
              className="campaign-banner-img"
            />
            <div className="campaign-banner-overlay" />
            <div className="campaign-banner-content">
              <span className="campaign-banner-badge">
                <Sparkles size={14} /> EXCLUSIVE CAMPAIGNS & OFFERS
              </span>
              <h2 className="campaign-banner-title">
                EXPLORE ALL OUR SPECIAL CAMPAIGNS
              </h2>
              <p className="campaign-banner-subtitle">
                Explore all our contemporary special offers & mega deals at a glance
              </p>
            </div>
            <div className="campaign-banner-btn-box">
              <span>VIEW ALL CAMPAIGNS</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </Link>
      </div>

      {/* ---- RUNNING & UPCOMING EVENTS SECTION BANNER ---- */}
      <div className="homepage-campaign-banner-wrap" style={{ marginTop: '24px' }}>
        <Link to="/events" className="homepage-campaign-banner-link">
          <div className="homepage-campaign-image-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80" 
              alt="Running & Upcoming Events Zone" 
              className="campaign-banner-img"
              style={{ opacity: 0.4 }}
            />
            <div className="campaign-banner-overlay" style={{ background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)' }} />
            <div className="campaign-banner-content">
              <span className="campaign-banner-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                <Flame size={14} fill="#38bdf8" /> RUNNING & UPCOMING EVENTS
              </span>
              <h2 className="campaign-banner-title">
                JOIN LIVE EVENTS & PLAY TRIVIA GAMES
              </h2>
              <p className="campaign-banner-subtitle">
                Join our live events, quizzes and games to win discount vouchers instantly
              </p>
            </div>
            <div className="campaign-banner-btn-box" style={{ background: '#38bdf8', color: '#0f172a' }}>
              <span>EXPLORE EVENT ZONE</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </Link>
      </div>

      {/* ---- Active Campaigns Modal ---- */}
      {showCampaignsModal && (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="modal-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Active Campaigns</span>
              <button onClick={() => setShowCampaignsModal(false)} style={{ color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }} title="Close Modal">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeCampaigns.map((camp) => {
                // Resolve products associated with this campaign (robust matching)
                const targetIds = camp.productIds 
                  ? camp.productIds.map((id: any) => String(id).trim()) 
                  : [];
                const campProducts = config.products.filter(p => {
                  if (!p.published) return false;
                  if (targetIds.length > 0) {
                    return targetIds.includes(String(p.id).trim());
                  }
                  if (camp.productId) {
                    return String(p.id).trim() === String(camp.productId).trim();
                  }
                  return false;
                });

                return (
                  <div key={camp.id} className="campaign-modal-card">
                    <div className="campaign-modal-header-row">
                      <div>
                        <span style={{ display: 'inline-block', background: 'var(--sf-accent)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                          Campaign Active
                        </span>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                          <Link 
                            to={`/campaign/${camp.id}`} 
                            onClick={() => setShowCampaignsModal(false)}
                            style={{ color: 'white', textDecoration: 'none' }}
                            className="hover-accent"
                          >
                            {camp.name}
                          </Link>
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                          Valid: {new Date(camp.startDate).toLocaleDateString()} to {new Date(camp.endDate).toLocaleDateString()}
                        </p>
                        <div style={{ marginTop: '8px' }}>
                          <Link 
                            to={`/campaign/${camp.id}`}
                            onClick={() => setShowCampaignsModal(false)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sf-accent)', textDecoration: 'none' }}
                          >
                            Go to Campaign Page &rarr;
                          </Link>
                        </div>
                      </div>
                      <div>
                        <CountdownTimer
                          startDate={camp.startDate}
                          endDate={camp.endDate}
                          label="Campaign ends in"
                        />
                      </div>
                    </div>

                    {/* Associated products list */}
                    {campProducts.length > 0 ? (
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px' }}>Campaign Products:</h4>
                        <div className="campaign-products-grid">
                          {campProducts.map((product) => (
                            <div 
                              key={product.id} 
                              style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderRadius: '14px',
                                padding: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <OptimizedImage src={product.image} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '10px' }} width={200} height={200} />
                              <Link 
                                to={`/product/${product.id}`} 
                                onClick={() => setShowCampaignsModal(false)}
                                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', textDecoration: 'none', lineHeight: 1.3, height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                              >
                                {product.name}
                              </Link>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sf-accent)' }}>৳{product.price}</span>
                                <button 
                                  onClick={() => {
                                    addToCart(product);
                                    setShowCampaignsModal(false);
                                  }}
                                  style={{ background: 'var(--sf-accent)', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  Buy Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '16px 0 0 0', fontStyle: 'italic' }}>No products attached to this campaign.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---- NEW AND POPULAR Section (Exact Replica of SPLAYD) ---- */}
      <section className="new-popular-section" id="new-and-popular">
        <div className="new-popular-header">
          <h2 className="new-popular-title">NEW AND POPULAR</h2>
          <div className="new-popular-underline"></div>
        </div>

        <div className="new-popular-tabs-row">
          {['ALL', 'SNEAKERS', 'PANJABI', 'SHIRTS', 'PERFUMES', 'PANTS'].map((tab) => (
            <button
              key={tab}
              className={`new-popular-tab-btn ${activeNpTab === tab ? 'active' : ''}`}
              onClick={() => setActiveNpTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="new-popular-grid">
          {newPopularProducts.map((product: any) => (
            <Link to={`/product/${product.id}`} key={product.id} className="new-popular-card">
              <div className="new-popular-img-box">
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  className="new-popular-img"
                  width={400}
                  height={400}
                />
                <button
                  className={`product-card-wishlist ${wishlist?.includes(product.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                  title="Wishlist"
                >
                  <Heart size={16} fill={wishlist?.includes(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="new-popular-card-body">
                <h3 className="new-popular-card-title">{product.name}</h3>
                <div className="new-popular-card-footer">
                  <span className="new-popular-card-price">
                    Tk {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    className="new-popular-cart-icon-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    title="Add to Cart"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>



  </>
  );
}


