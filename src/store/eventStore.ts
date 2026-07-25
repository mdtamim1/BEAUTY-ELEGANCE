// Event & Gamification Data Store
// Supports Running/Upcoming Events, Trivia Quizzes, Product Discount Games, Win Probabilities, and Customer Achievements

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  status: 'running' | 'upcoming';
  type: 'quiz' | 'spin' | 'discount_match' | 'mission' | 'jackpot';
  startDate: string;
  endDate: string;
  winProbability: number; // 0 to 100 percentage
  gamesEnabled?: boolean;
  rewardCoupon: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
  };
  quizQuestions?: QuizQuestion[];
  featuredProductId?: number | string;
  // Jackpot Slot Machine config (admin configurable)
  jackpotSlots?: JackpotSlot[];
}

export interface JackpotSlot {
  id: string;
  label: string;        // e.g. "20% OFF", "৳500 OFF"
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  weight: number;       // Higher = more likely to appear
  emoji: string;        // Visual icon/emoji for the reel
  color: string;        // Neon color for this slot value
}

export interface CustomerAchievement {
  eventId: string;
  eventTitle: string;
  gameType: string;
  couponCode: string;
  discountText: string;
  earnedAt: string;
  used: boolean;
}

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'EVT-101',
    title: 'Summer Fashion Trivia Quiz Challenge',
    description: 'Answer 3 quick product questions to win an instant 20% OFF discount coupon!',
    bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    status: 'running',
    type: 'quiz',
    startDate: '2026-07-20',
    endDate: '2026-08-10',
    winProbability: 80,
    rewardCoupon: {
      code: 'TRIVIA20',
      type: 'percentage',
      value: 20,
    },
    quizQuestions: [
      {
        id: 1,
        question: 'Which luxury brand is renowned for premium sports sneakers and athletic footwear?',
        options: ['Nike', 'Rolex', 'Gucci', 'Chanel'],
        correctIndex: 0,
      },
      {
        id: 2,
        question: 'What is the primary material used in authentic Panjabi collections?',
        options: ['Synthetic Plastic', '100% Premium Cotton & Silk', 'Nylon', 'Polyester'],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'What offer does Tamim Global provide on all fast delivery orders?',
        options: ['Free Delivery & Express Shipping', 'No Warranty', 'No Returns', 'Cash Only'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'EVT-102',
    title: 'Product Mystery Discount Wheel',
    description: 'Spin the mystery wheel and match product offers to unlock up to ৳500 OFF instant coupon!',
    bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    status: 'running',
    type: 'spin',
    startDate: '2026-07-22',
    endDate: '2026-08-15',
    winProbability: 85,
    rewardCoupon: {
      code: 'LUCKY500',
      type: 'fixed',
      value: 500,
    },
  },
  {
    id: 'EVT-104',
    title: 'VIP Shopping Quest: Mission Complete Challenge',
    description: 'Complete 3 quick shopping missions to unlock 35% OFF VIP Mega Coupon!',
    bannerImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
    status: 'running',
    type: 'mission',
    startDate: '2026-07-25',
    endDate: '2026-08-30',
    winProbability: 95,
    rewardCoupon: {
      code: 'MISSIONVIP35',
      type: 'percentage',
      value: 35,
    },
  },
  {
    id: 'EVT-103',
    title: 'Grand Festival Season Countdown Game',
    description: 'Upcoming Mega Festival Event! Match product badges to win VIP 30% OFF vouchers.',
    bannerImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming',
    type: 'discount_match',
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    winProbability: 90,
    rewardCoupon: {
      code: 'FESTIVAL30',
      type: 'percentage',
      value: 30,
    },
  },
  {
    id: 'EVT-105',
    title: '🎰 Lucky Jackpot Slot Machine',
    description: 'Pull the lever on our ultra-premium 3-reel slot machine! Match 3 symbols to win an instant discount coupon.',
    bannerImage: 'https://images.unsplash.com/photo-1624558574961-5b85e3f9c9b2?auto=format&fit=crop&w=1200&q=80',
    status: 'running',
    type: 'jackpot',
    startDate: '2026-07-25',
    endDate: '2026-08-31',
    winProbability: 70,
    gamesEnabled: true,
    rewardCoupon: {
      code: 'JACKPOT25',
      type: 'percentage',
      value: 25,
    },
    jackpotSlots: [
      { id: 's1', label: '5% OFF',   discountType: 'percentage', discountValue: 5,   weight: 35, emoji: '🍋', color: '#eab308' },
      { id: 's2', label: '10% OFF',  discountType: 'percentage', discountValue: 10,  weight: 25, emoji: '🔔', color: '#38bdf8' },
      { id: 's3', label: '15% OFF',  discountType: 'percentage', discountValue: 15,  weight: 18, emoji: '🍒', color: '#ec4899' },
      { id: 's4', label: '20% OFF',  discountType: 'percentage', discountValue: 20,  weight: 12, emoji: '⭐', color: '#f59e0b' },
      { id: 's5', label: '25% OFF',  discountType: 'percentage', discountValue: 25,  weight: 7,  emoji: '💎', color: '#8b5cf6' },
      { id: 's6', label: '৳500 OFF', discountType: 'fixed',      discountValue: 500, weight: 3,  emoji: '🏆', color: '#10b981' },
    ],
  },
];

const LOCAL_STORAGE_KEY = 'storefront_events_data';
const ACHIEVEMENTS_STORAGE_KEY = 'customer_event_achievements';

export function getEventsFromStore(): EventItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Auto-merge any new default events not yet in stored list
        const storedIds = new Set(parsed.map((e: EventItem) => e.id));
        const missingDefaults = INITIAL_EVENTS.filter(e => !storedIds.has(e.id));
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          saveEventsToStore(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse events from storage:', e);
  }
  saveEventsToStore(INITIAL_EVENTS);
  return INITIAL_EVENTS;
}

export function saveEventsToStore(events: EventItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events to storage:', e);
  }
}

export function getCustomerAchievements(customerPhoneOrEmail?: string): CustomerAchievement[] {
  try {
    const list: CustomerAchievement[] = [];
    
    // Read global achievements
    const globalData = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (globalData) {
      const parsed = JSON.parse(globalData);
      if (Array.isArray(parsed)) list.push(...parsed);
    }

    // Read user-specific achievements
    if (customerPhoneOrEmail) {
      const userData = localStorage.getItem(`${ACHIEVEMENTS_STORAGE_KEY}_${customerPhoneOrEmail}`);
      if (userData) {
        const parsed = JSON.parse(userData);
        if (Array.isArray(parsed)) list.push(...parsed);
      }
    } else {
      // Also check customer_auth_user if present
      const authUser = localStorage.getItem('customer_auth_user');
      if (authUser) {
        try {
          const userObj = JSON.parse(authUser);
          const userKey = userObj?.email || userObj?.phone;
          if (userKey) {
            const userData = localStorage.getItem(`${ACHIEVEMENTS_STORAGE_KEY}_${userKey}`);
            if (userData) {
              const parsed = JSON.parse(userData);
              if (Array.isArray(parsed)) list.push(...parsed);
            }
          }
        } catch (err) {}
      }
    }

    // Deduplicate by eventId or couponCode
    const uniqueMap = new Map<string, CustomerAchievement>();
    list.forEach(item => {
      const key = item.eventId || item.couponCode;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    return Array.from(uniqueMap.values());
  } catch (e) {
    console.error('Failed to parse achievements:', e);
  }
  return [];
}

export function saveCustomerAchievement(achievement: CustomerAchievement, customerPhoneOrEmail?: string): void {
  try {
    let targetUserKey = customerPhoneOrEmail;
    if (!targetUserKey) {
      const authUser = localStorage.getItem('customer_auth_user');
      if (authUser) {
        try {
          const userObj = JSON.parse(authUser);
          targetUserKey = userObj?.email || userObj?.phone;
        } catch (err) {}
      }
    }

    // Save to global list
    const currentGlobal = getCustomerAchievements();
    const globalExists = currentGlobal.some(a => a.eventId === achievement.eventId || a.couponCode === achievement.couponCode);
    if (!globalExists) {
      const updatedGlobal = [achievement, ...currentGlobal];
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedGlobal));
    }

    // Save to user-specific list if user key exists
    if (targetUserKey) {
      const userKey = `${ACHIEVEMENTS_STORAGE_KEY}_${targetUserKey}`;
      const currentUser = getCustomerAchievements(targetUserKey);
      const userExists = currentUser.some(a => a.eventId === achievement.eventId || a.couponCode === achievement.couponCode);
      if (!userExists) {
        const updatedUser = [achievement, ...currentUser];
        localStorage.setItem(userKey, JSON.stringify(updatedUser));
      }
    }
  } catch (e) {
    console.error('Failed to save achievement:', e);
  }
}

export function hasCustomerCompletedEvent(eventId: string, customerPhoneOrEmail?: string): boolean {
  const achievements = getCustomerAchievements(customerPhoneOrEmail);
  return achievements.some(a => a.eventId === eventId);
}
