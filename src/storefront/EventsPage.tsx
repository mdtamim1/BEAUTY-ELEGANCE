import { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Trophy, Sparkles, Flame, Clock, Gamepad2, Gift, ArrowRight, 
  RotateCcw, Check, Copy, X, Zap, ShieldCheck, HelpCircle, AlertCircle,
  Timer, Award, CircleDot, Star
} from 'lucide-react';
import { getEventsFromStore, saveCustomerAchievement, hasCustomerCompletedEvent, type EventItem, type JackpotSlot } from '../store/eventStore';
import { SEOMeta } from '../components/layout/SEOMeta';
import './storefront-events.css';

// 8 Segments for the Ultra Spin Wheel
const WHEEL_SEGMENTS = [
  { label: '20% OFF', color: '#0284c7', textColor: '#ffffff', code: 'WHEEL20' },
  { label: '৳500 OFF', color: '#1e1b4b', textColor: '#38bdf8', code: 'FLAT500' },
  { label: '15% OFF', color: '#d97706', textColor: '#ffffff', code: 'LUCKY15' },
  { label: 'VIP 30%', color: '#4c1d95', textColor: '#a78bfa', code: 'VIP30' },
  { label: '৳200 OFF', color: '#0f766e', textColor: '#ffffff', code: 'SAVE200' },
  { label: '25% OFF', color: '#b91c1c', textColor: '#ffffff', code: 'EXTRA25' },
  { label: '৳100 OFF', color: '#334155', textColor: '#94a3b8', code: 'GIFT100' },
  { label: '50% MEGA', color: '#047857', textColor: '#34d399', code: 'MEGA50' },
];

export default function EventsPage() {
  const { addToCart } = useOutletContext<any>() || { addToCart: () => {} };
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<'running' | 'upcoming'>('running');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Quiz Game States
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizTimer, setQuizTimer] = useState(15);
  const timerRef = useRef<any>(null);

  // Wheel Spin States
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);

  // Scratch Card Game States
  const [scratchedCards, setScratchedCards] = useState<boolean[]>([false, false, false]);
  const [cardValues, setCardValues] = useState<string[]>(['💎 25% OFF', '💎 25% OFF', '💎 25% OFF']);

  // Mission Complete Game States
  const [missionProgress, setMissionProgress] = useState<boolean[]>([false, false, false]);

  // Overall Result
  const [gameResult, setGameResult] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [wonCoupon, setWonCoupon] = useState<string | null>(null);
  const [wonDiscountText, setWonDiscountText] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Jackpot Slot Machine States
  const [slotReels, setSlotReels] = useState<[JackpotSlot | null, JackpotSlot | null, JackpotSlot | null]>([null, null, null]);
  const [slotSpinning, setSlotSpinning] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [slotPulled, setSlotPulled] = useState(false);
  const [slotRollAnim, setSlotRollAnim] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    setEventsList(getEventsFromStore());
  }, []);

  // Quiz Timer Countdown Effect
  useEffect(() => {
    if (selectedEvent && selectedEvent.type === 'quiz' && gameResult === 'playing') {
      setQuizTimer(15);
      timerRef.current = setInterval(() => {
        setQuizTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleQuizAnswer(-1); // Auto submit wrong answer on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizIndex, selectedEvent, gameResult]);

  const handleOpenEventModal = (event: EventItem) => {
    if (hasCustomerCompletedEvent(event.id)) {
      alert('আপনি ইতিমধ্যে এই ইভেন্টটি বিজয়ী হয়েছেন! আপনার কুপন কোডটি দেখতে "Customer Account > Events & Rewards" সেকশন চেক করুন।');
      return;
    }

    if (event.gamesEnabled === false) {
      alert('এই ইভেন্টের গেম মোডটি অ্যাডমিন প্যানেল থেকে সাময়িকভাবে বন্ধ রাখা হয়েছে।');
      return;
    }

    setSelectedEvent(event);
    setQuizIndex(0);
    setQuizAnswers([]);
    setSelectedOption(null);
    setGameResult('playing');
    setWonCoupon(null);
    setIsSpinning(false);
    setRotation(0);
    setWheelWinner(null);
    setScratchedCards([false, false, false]);
    setMissionProgress([false, false, false]);
    setCopiedCode(false);
    setSlotReels([null, null, null]);
    setSlotSpinning([false, false, false]);
    setSlotPulled(false);
    setSlotRollAnim([0, 0, 0]);
  };

  const handleQuizAnswer = (optionIndex: number) => {
    clearInterval(timerRef.current);
    setSelectedOption(optionIndex);

    setTimeout(() => {
      if (!selectedEvent) return;
      const newAnswers = [...quizAnswers, optionIndex];
      setQuizAnswers(newAnswers);
      setSelectedOption(null);

      const questions = selectedEvent.quizQuestions || [];
      if (quizIndex < questions.length - 1) {
        setQuizIndex(prev => prev + 1);
      } else {
        // Evaluate quiz score
        let correctCount = 0;
        questions.forEach((q, idx) => {
          if (newAnswers[idx] === q.correctIndex) correctCount++;
        });

        const randomRoll = Math.random() * 100;
        const winChance = selectedEvent.winProbability || 80;

        if (correctCount >= 2 && randomRoll <= winChance) {
          triggerWin(selectedEvent.rewardCoupon?.code || 'QUIZWIN20', selectedEvent.rewardCoupon?.type === 'percentage' ? `${selectedEvent.rewardCoupon.value}% OFF` : `৳${selectedEvent.rewardCoupon?.value} OFF`);
        } else {
          setGameResult('lost');
        }
      }
    }, 600);
  };

  const handleSpinWheel = () => {
    if (!selectedEvent || isSpinning) return;
    setIsSpinning(true);
    setWheelWinner(null);

    // Calculate segment stopping angle
    const totalSegments = WHEEL_SEGMENTS.length;
    const segmentAngle = 360 / totalSegments;
    const winningIndex = Math.floor(Math.random() * totalSegments);
    const targetSegment = WHEEL_SEGMENTS[winningIndex];

    // Extra 5 to 8 full rotations + target angle offset
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDegree = extraRotations + (360 - (winningIndex * segmentAngle + segmentAngle / 2));

    setRotation(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setWheelWinner(targetSegment);

      const randomRoll = Math.random() * 100;
      const winChance = selectedEvent.winProbability || 85;

      if (randomRoll <= winChance) {
        triggerWin(targetSegment.code, targetSegment.label);
      } else {
        setGameResult('lost');
      }
    }, 4500);
  };

  const handleScratchCard = (index: number) => {
    if (scratchedCards[index]) return;
    const updated = [...scratchedCards];
    updated[index] = true;
    setScratchedCards(updated);

    // If all 3 card revealed
    if (updated.every(val => val)) {
      setTimeout(() => {
        if (!selectedEvent) return;
        const randomRoll = Math.random() * 100;
        const winChance = selectedEvent.winProbability || 85;

        if (randomRoll <= winChance) {
          triggerWin(selectedEvent.rewardCoupon?.code || 'MATCH25', selectedEvent.rewardCoupon?.type === 'percentage' ? `${selectedEvent.rewardCoupon.value}% OFF` : `৳${selectedEvent.rewardCoupon?.value} OFF`);
        } else {
          setGameResult('lost');
        }
      }, 800);
    }
  };

  const handleCompleteMission = (index: number) => {
    if (missionProgress[index]) return;
    const updated = [...missionProgress];
    updated[index] = true;
    setMissionProgress(updated);

    if (updated.every(val => val)) {
      setTimeout(() => {
        if (!selectedEvent) return;
        triggerWin(selectedEvent.rewardCoupon?.code || 'MISSIONVIP35', selectedEvent.rewardCoupon?.type === 'percentage' ? `${selectedEvent.rewardCoupon.value}% OFF` : `৳${selectedEvent.rewardCoupon?.value} OFF`);
      }, 600);
    }
  };

  const triggerWin = (code: string, discountText: string) => {
    setGameResult('won');
    setWonCoupon(code);
    setWonDiscountText(discountText);

    if (selectedEvent) {
      saveCustomerAchievement({
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        gameType: selectedEvent.type,
        couponCode: code,
        discountText: discountText,
        earnedAt: new Date().toISOString(),
        used: false,
      });
    }
  };

  // ---- JACKPOT SLOT MACHINE HANDLER ----
  const handlePullJackpotLever = () => {
    if (!selectedEvent || slotPulled || slotSpinning.some(Boolean)) return;
    const slots = selectedEvent.jackpotSlots;
    if (!slots || slots.length === 0) return;

    setSlotPulled(true);
    setSlotSpinning([true, true, true]);
    setSlotReels([null, null, null]);

    // Weighted random pick
    const pickSlot = (): JackpotSlot => {
      const totalWeight = slots.reduce((s, sl) => s + (sl.weight || 1), 0);
      let rand = Math.random() * totalWeight;
      for (const sl of slots) {
        rand -= sl.weight || 1;
        if (rand <= 0) return sl;
      }
      return slots[slots.length - 1];
    };

    const winChance = selectedEvent.winProbability || 70;
    const didWin = Math.random() * 100 <= winChance;

    // Pick winning symbols or random mismatched symbols
    let reel1: JackpotSlot, reel2: JackpotSlot, reel3: JackpotSlot;
    if (didWin) {
      const winner = pickSlot();
      reel1 = winner; reel2 = winner; reel3 = winner;
    } else {
      reel1 = pickSlot();
      do { reel2 = pickSlot(); } while (reel2.id === reel1.id && slots.length > 1);
      reel3 = pickSlot();
    }

    // Stagger reel stops: reel1 stops at 1s, reel2 at 2s, reel3 at 3s
    setSlotRollAnim([Date.now(), Date.now(), Date.now()]);

    setTimeout(() => {
      setSlotReels(prev => [reel1, prev[1], prev[2]]);
      setSlotSpinning(prev => [false, prev[1], prev[2]]);
    }, 1000);
    setTimeout(() => {
      setSlotReels(prev => [prev[0], reel2, prev[2]]);
      setSlotSpinning(prev => [prev[0], false, prev[2]]);
    }, 2000);
    setTimeout(() => {
      setSlotReels([reel1, reel2, reel3]);
      setSlotSpinning([false, false, false]);

      const isJackpot = reel1.id === reel2.id && reel2.id === reel3.id;
      setTimeout(() => {
        if (isJackpot) {
          const discountText = reel1.discountType === 'percentage'
            ? `${reel1.discountValue}% OFF`
            : `৳${reel1.discountValue} OFF`;
          const couponCode = selectedEvent.rewardCoupon?.code || 'JACKPOT25';
          triggerWin(couponCode, discountText);
        } else {
          setGameResult('lost');
          setSlotPulled(false); // allow retry
        }
      }, 600);
    }, 3000);
  };


  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const runningEvents = eventsList.filter(e => e.status === 'running');
  const upcomingEvents = eventsList.filter(e => e.status === 'upcoming');

  return (
    <div className="events-page-wrapper">
      <SEOMeta 
        title="Running & Upcoming Events Arena" 
        description="Participate in exclusive brand trivia games, product spin wheels, and win verified discount coupons." 
      />

      {/* Hero Header */}
      <div className="events-hero-header">
        <div className="events-hero-badge">
          <Flame size={18} fill="#38bdf8" color="#38bdf8" />
          <span>OFFICIAL EVENT ARENA</span>
        </div>
        <h1 className="events-hero-title">Running & Upcoming Events</h1>
        <p className="events-hero-subtitle">
          Participate in special events, quizzes & product discount games to win premium discount vouchers!
        </p>

        {/* Event Navigation Tabs */}
        <div className="events-tab-container">
          <button 
            type="button"
            className={`events-nav-tab ${activeTab === 'running' ? 'active' : ''}`}
            onClick={() => setActiveTab('running')}
          >
            🔥 Running Events ({runningEvents.length})
          </button>
          <button 
            type="button"
            className={`events-nav-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            ⏳ Upcoming Events ({upcomingEvents.length})
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="events-grid-container">
        {(activeTab === 'running' ? runningEvents : upcomingEvents).map((evt) => {
          const isGamesDisabled = evt.gamesEnabled === false;
          const isCompleted = hasCustomerCompletedEvent(evt.id);

          return (
            <div key={evt.id} className="premium-event-card">
              <div className="premium-event-card-media">
                <img src={evt.bannerImage} alt={evt.title} />
                <div className="premium-event-card-overlay" />
                <div className="premium-event-badge-row">
                  <span className={`event-status-pill ${evt.status}`}>
                    {evt.status === 'running' ? <Sparkles size={13} /> : <Clock size={13} />}
                    {evt.status === 'running' ? 'LIVE NOW' : 'COMING SOON'}
                  </span>
                  <span className="event-reward-pill">
                    🎁 {evt.rewardCoupon?.type === 'percentage' ? `${evt.rewardCoupon.value}% OFF` : `৳${evt.rewardCoupon?.value} OFF`}
                  </span>
                </div>
              </div>

              <div className="premium-event-card-body">
                <h3 className="event-card-title">{evt.title}</h3>
                <p className="event-card-desc">{evt.description}</p>

                <div className="event-card-footer">
                  <div className="event-meta-info">
                    <span className="event-win-prob">
                      🎯 Win Chance: {evt.winProbability || 80}%
                    </span>
                    <span className="event-game-type">
                  {evt.type === 'quiz' ? '🧠 Trivia Quiz' : evt.type === 'spin' ? '🎡 Casino Wheel' : evt.type === 'mission' ? '🎯 Shopping Quest' : evt.type === 'jackpot' ? '🎰 Jackpot Slots' : '💎 Mystery Match'}
                    </span>
                  </div>

                  {evt.status === 'running' ? (
                    isCompleted ? (
                      <button
                        type="button"
                        className="event-play-btn disabled"
                        disabled
                        style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#4ade80', border: '1px solid rgba(16, 185, 129, 0.4)', cursor: 'default' }}
                      >
                        <Check size={16} />
                        <span>Completed (Reward Claimed)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`event-play-btn ${isGamesDisabled ? 'disabled' : ''}`}
                        onClick={() => handleOpenEventModal(evt)}
                      >
                        {isGamesDisabled ? (
                          <span>Game Disabled</span>
                        ) : (
                          <>
                            <span>Play & Win Voucher</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    )
                  ) : (
                    <span className="event-upcoming-tag">
                      <Clock size={14} /> Starts Soon ⏳
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- ULTRA HIGH-END PROFESSIONAL GAME MODAL ---- */}
      {selectedEvent && (
        <div className="ultra-game-modal-overlay">
          <div className="ultra-game-modal-card">
            {/* Modal Header */}
            <div className="ultra-game-modal-header">
              <div className="ultra-game-modal-title">
                <Gamepad2 size={22} color="#38bdf8" />
                <h3>{selectedEvent.title}</h3>
              </div>
              <button 
                type="button" 
                className="ultra-game-close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="ultra-game-modal-body">
              {/* WON STATE */}
              {gameResult === 'won' && (
                <div className="game-won-view">
                  <div className="game-won-trophy-ring">
                    <Trophy size={50} />
                  </div>
                  <h2 className="game-won-title">VICTORY UNLOCKED! 🎉</h2>
                  <p className="game-won-subtitle">
                    You won <strong>{wonDiscountText}</strong> voucher for <strong>{selectedEvent.title}</strong>!
                  </p>

                  <div className="game-coupon-code-box">
                    <span className="coupon-box-label">CLAIMABLE VOUCHER CODE</span>
                    <strong className="coupon-box-code">{wonCoupon}</strong>
                  </div>

                  <div className="game-action-buttons">
                    <button
                      type="button"
                      className={`copy-code-btn ${copiedCode ? 'copied' : ''}`}
                      onClick={() => wonCoupon && handleCopyCoupon(wonCoupon)}
                    >
                      {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                      <span>{copiedCode ? 'Code Copied!' : 'Copy Coupon Code'}</span>
                    </button>
                    <Link to="/checkout" className="checkout-now-btn">
                      Use in Checkout &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* LOST STATE */}
              {gameResult === 'lost' && (
                <div className="game-lost-view">
                  <div className="game-lost-icon-ring">
                    <RotateCcw size={36} />
                  </div>
                  <h3>Almost Made It!</h3>
                  <p>Don't give up! Try again to claim your special reward.</p>
                  <button
                    type="button"
                    className="retry-game-btn"
                    onClick={() => handleOpenEventModal(selectedEvent)}
                  >
                    Play Again ↺
                  </button>
                </div>
              )}

              {/* TRIVIA QUIZ GAME */}
              {gameResult === 'playing' && selectedEvent.type === 'quiz' && (
                <div className="quiz-game-container">
                  {selectedEvent.quizQuestions && selectedEvent.quizQuestions[quizIndex] ? (
                    <div>
                      {/* Question Timer HUD & Category */}
                      <div className="quiz-hud-bar">
                        <span className="quiz-category-badge">
                          <Award size={14} /> BRAND KNOWLEDGE
                        </span>
                        <div className="quiz-timer-badge">
                          <Timer size={14} />
                          <span>00:{quizTimer < 10 ? `0${quizTimer}` : quizTimer}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="quiz-progress-bar-row">
                        <div className="quiz-progress-track">
                          <div 
                            className="quiz-progress-fill" 
                            style={{ width: `${((quizIndex + 1) / selectedEvent.quizQuestions.length) * 100}%` }}
                          />
                        </div>
                        <span className="quiz-progress-text">
                          {quizIndex + 1} / {selectedEvent.quizQuestions.length}
                        </span>
                      </div>

                      <h3 className="quiz-question-title">
                        {selectedEvent.quizQuestions[quizIndex].question}
                      </h3>

                      <div className="quiz-options-list">
                        {selectedEvent.quizQuestions[quizIndex].options.map((opt, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className={`quiz-option-pill ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleQuizAnswer(optIdx)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="option-index-badge">{String.fromCharCode(65 + optIdx)}</span>
                                <span>{opt}</span>
                              </div>
                              <ArrowRight size={16} className="option-arrow" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* ULTRA 3D CASINO SPIN WHEEL */}
              {gameResult === 'playing' && selectedEvent.type === 'spin' && (
                <div className="casino-wheel-wrapper">
                  {/* Wheel Pointer Ticker Needle */}
                  <div className="wheel-pointer-pin">▼</div>

                  {/* 3D Segmented Wheel Container */}
                  <div className="wheel-outer-ring">
                    <div 
                      className="wheel-segmented-disc"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.85, 0.2, 1)' : 'none'
                      }}
                    >
                      {WHEEL_SEGMENTS.map((seg, idx) => {
                        const angle = 360 / WHEEL_SEGMENTS.length;
                        return (
                          <div 
                            key={idx} 
                            className="wheel-segment-slice"
                            style={{
                              transform: `rotate(${idx * angle}deg)`,
                              background: seg.color,
                              color: seg.textColor
                            }}
                          >
                            <span className="segment-label-text">{seg.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="wheel-center-cap">
                      <Star size={24} color="#eab308" fill="#eab308" />
                    </div>
                  </div>

                  <h3 className="wheel-status-title">
                    {isSpinning ? 'Spinning Casino Wheel...' : 'Spin 3D Wheel for Instant Discount'}
                  </h3>

                  <button
                    type="button"
                    className="trigger-spin-btn"
                    onClick={handleSpinWheel}
                    disabled={isSpinning}
                  >
                    {isSpinning ? 'Spinning...' : '🎡 SPIN WHEEL NOW'}
                  </button>
                </div>
              )}

              {/* MYSTERY REVEAL MATCH GAME */}
              {gameResult === 'playing' && selectedEvent.type === 'discount_match' && (
                <div className="scratch-game-wrapper">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                    Reveal Golden Cards to Match Discount
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Click all 3 golden cards to reveal your special product voucher!
                  </p>

                  <div className="scratch-cards-grid">
                    {cardValues.map((val, idx) => (
                      <div 
                        key={idx}
                        className={`golden-scratch-card ${scratchedCards[idx] ? 'revealed' : ''}`}
                        onClick={() => handleScratchCard(idx)}
                      >
                        {scratchedCards[idx] ? (
                          <span className="card-revealed-text">{val}</span>
                        ) : (
                          <div className="card-hidden-cover">
                            <Sparkles size={28} color="#eab308" />
                            <span>TAP TO REVEAL</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JACKPOT SLOT MACHINE GAME */}
              {gameResult === 'playing' && selectedEvent.type === 'jackpot' && (() => {
                const slots = selectedEvent.jackpotSlots || [];
                // Rolling symbols for animation
                const rollingSymbols = ['🎰','💎','⭐','🍒','🔔','🍋','🏆','🎯','🎪','🌟'];
                return (
                  <div className="jackpot-machine-wrapper">
                    {/* Machine Header */}
                    <div className="jackpot-machine-header">
                      <span className="jackpot-machine-title">🎰 JACKPOT SLOT MACHINE</span>
                      <p className="jackpot-machine-subtitle">Match 3 symbols to win your discount!</p>
                    </div>

                    {/* Possible Prizes Display */}
                    <div className="jackpot-prizes-strip">
                      {slots.map((sl) => (
                        <div key={sl.id} className="jackpot-prize-chip" style={{ borderColor: sl.color, color: sl.color }}>
                          <span>{sl.emoji}</span>
                          <span>{sl.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* The 3 Reels */}
                    <div className="jackpot-reels-container">
                      {/* Highlight lines */}
                      <div className="jackpot-reel-highlight-top" />
                      <div className="jackpot-reel-highlight-bottom" />

                      {([0, 1, 2] as const).map((reelIdx) => {
                        const reel = slotReels[reelIdx];
                        const spinning = slotSpinning[reelIdx];
                        return (
                          <div key={reelIdx} className={`jackpot-reel-drum ${spinning ? 'spinning' : ''}`}>
                            <div className="jackpot-reel-drum-inner">
                              {spinning ? (
                                // Show rolling animation
                                [...Array(5)].map((_, i) => (
                                  <div key={i} className="jackpot-reel-symbol rolling">
                                    {rollingSymbols[(reelIdx * 3 + i) % rollingSymbols.length]}
                                  </div>
                                ))
                              ) : reel ? (
                                // Show result
                                <div
                                  className="jackpot-reel-symbol result"
                                  style={{ color: reel.color, textShadow: `0 0 24px ${reel.color}` }}
                                >
                                  <span className="reel-emoji">{reel.emoji}</span>
                                  <span className="reel-label" style={{ color: reel.color }}>{reel.label}</span>
                                </div>
                              ) : (
                                <div className="jackpot-reel-symbol idle">❓</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Win Probability Info */}
                    <div className="jackpot-win-prob-info">
                      <span>🎯 Win Chance: <strong style={{ color: '#4ade80' }}>{selectedEvent.winProbability}%</strong></span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Match all 3 reels to win!</span>
                    </div>

                    {/* The Lever / Pull Button */}
                    <button
                      type="button"
                      className={`jackpot-lever-btn ${slotSpinning.some(Boolean) ? 'spinning' : ''}`}
                      onClick={handlePullJackpotLever}
                      disabled={slotSpinning.some(Boolean)}
                    >
                      {slotSpinning.some(Boolean) ? (
                        <><span className="lever-spin-icon">⚙️</span> Spinning Reels...</>
                      ) : slotPulled && gameResult === 'playing' ? (
                        <><span>🔄</span> Try Again!</>
                      ) : (
                        <><span>🎰</span> PULL THE LEVER!</>
                      )}
                    </button>
                  </div>
                );
              })()}

              {/* MISSION COMPLETE QUEST GAME */}
              {gameResult === 'playing' && selectedEvent.type === 'mission' && (
                <div className="mission-quest-wrapper">
                  {/* Mission Overall Progress HUD */}
                  <div className="mission-hud-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trophy size={16} /> QUEST PROGRESS
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#4ade80' }}>
                        {missionProgress.filter(Boolean).length} / 3 COMPLETED
                      </span>
                    </div>

                    <div className="quiz-progress-track" style={{ height: '10px' }}>
                      <div 
                        className="quiz-progress-fill" 
                        style={{ width: `${(missionProgress.filter(Boolean).length / 3) * 100}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} 
                      />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '20px 0 6px 0' }}>
                    Complete All 3 Shopping Quests
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Tap to complete each mission and unlock your 35% VIP discount coupon!
                  </p>

                  <div className="mission-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Mission 1 */}
                    <div className={`mission-item-card ${missionProgress[0] ? 'done' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="mission-icon-circle">
                          {missionProgress[0] ? <Check size={18} color="#10b981" /> : <Flame size={18} color="#38bdf8" />}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Mission 1: Daily Check-In</h4>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Claim daily shopping attendance bonus</span>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className={`mission-claim-btn ${missionProgress[0] ? 'completed' : ''}`}
                        onClick={() => handleCompleteMission(0)}
                        disabled={missionProgress[0]}
                      >
                        {missionProgress[0] ? 'Completed ✓' : 'Tap Check-In'}
                      </button>
                    </div>

                    {/* Mission 2 */}
                    <div className={`mission-item-card ${missionProgress[1] ? 'done' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="mission-icon-circle">
                          {missionProgress[1] ? <Check size={18} color="#10b981" /> : <Sparkles size={18} color="#eab308" />}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Mission 2: Wishlist Explorer</h4>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Explore luxury collections & bookmark items</span>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className={`mission-claim-btn ${missionProgress[1] ? 'completed' : ''}`}
                        onClick={() => handleCompleteMission(1)}
                        disabled={missionProgress[1]}
                      >
                        {missionProgress[1] ? 'Completed ✓' : 'Complete Quest'}
                      </button>
                    </div>

                    {/* Mission 3 */}
                    <div className={`mission-item-card ${missionProgress[2] ? 'done' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="mission-icon-circle">
                          {missionProgress[2] ? <Check size={18} color="#10b981" /> : <Zap size={18} color="#a78bfa" />}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Mission 3: Brand Quiz Master</h4>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Verify authentic product guarantee policy</span>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className={`mission-claim-btn ${missionProgress[2] ? 'completed' : ''}`}
                        onClick={() => handleCompleteMission(2)}
                        disabled={missionProgress[2]}
                      >
                        {missionProgress[2] ? 'Completed ✓' : 'Complete Quest'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
