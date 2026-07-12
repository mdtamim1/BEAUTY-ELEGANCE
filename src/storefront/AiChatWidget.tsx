import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import './ai-chat.css';

// ============================================
// AI CHAT WIDGET — Premium Floating Chatbot
// Connects to backend proxy for Gemini AI
// API key is NEVER exposed to frontend
// ============================================

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocalDev
  ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
  : 'https://api.tamimglobal.com/api/v1';

interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTION_CHIPS = [
  'কি কি পণ্য আছে?',
  'সবচেয়ে কম দামের পণ্য কোনটি?',
  'What products are on sale?',
  'কোন পণ্যে সবচেয়ে বেশি ছাড়?',
];

export default function AiChatWidget() {
  const [config] = useStorefrontConfig();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasNewReply, setHasNewReply] = useState(false);
  const [lastMatchedProduct, setLastMatchedProduct] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Clear badge when opening
  useEffect(() => {
    if (open) setHasNewReply(false);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      // Build history for multi-turn conversation
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: history.slice(0, -1) // Exclude the current message (it's sent separately)
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();

      if (data.status === 'success' && data.data?.reply) {
        const aiMsg: ChatMsg = { role: 'model', text: data.data.reply };
        setMessages(prev => [...prev, aiMsg]);
        if (!open) setHasNewReply(true);
      } else {
        throw new Error(data.message || 'AI Response empty');
      }
    } catch (e) {
      console.warn('AI Chat Error, using local fallback:', e);
      const reply = generateClientFallbackResponse(text.trim(), config.products || [], lastMatchedProduct, setLastMatchedProduct);
      const aiMsg: ChatMsg = { role: 'model', text: reply };
      setMessages(prev => [...prev, aiMsg]);
      if (!open) setHasNewReply(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Format AI text: bold, line breaks
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating 3D AI Button (hidden when chat is open) */}
      {!open && (
        <button
          className="ai-chat-fab"
          onClick={() => setOpen(true)}
          title="AI Shopping Assistant"
          aria-label="Open AI Shopping Assistant"
          id="ai-chat-button"
        >
          <Sparkles size={25} />
          {hasNewReply && <span className="ai-fab-badge">!</span>}
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <>
          {/* Mobile overlay */}
          <div className="ai-chat-overlay" onClick={() => setOpen(false)} />

          <div className="ai-chat-window" id="ai-chat-window">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-avatar">
                <Sparkles size={20} />
              </div>
              <div className="ai-chat-header-info">
                <div className="ai-chat-header-title">AI Shopping Assistant</div>
                <div className="ai-chat-header-status">
                  <span className="ai-chat-header-status-dot" />
                  Online — Ready to help
                </div>
              </div>
              <button
                className="ai-chat-header-close"
                onClick={() => setOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.length === 0 && (
                <>
                  <div className="ai-chat-welcome">
                    <span className="ai-chat-welcome-emoji">🛍️</span>
                    <h4>স্বাগতম! আমি আপনার AI Assistant</h4>
                    <p>পণ্য সম্পর্কে যেকোনো প্রশ্ন করুন — দাম, ফিচার, স্টক, অথবা সাজেশন!</p>
                  </div>
                  <div className="ai-chat-suggestions">
                    {SUGGESTION_CHIPS.map((chip, i) => (
                      <button
                        key={i}
                        className="ai-chat-suggestion-chip"
                        onClick={() => sendMessage(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`ai-chat-msg ${msg.role}`}
                  dangerouslySetInnerHTML={
                    msg.role === 'model'
                      ? { __html: formatText(msg.text) }
                      : undefined
                  }
                >
                  {msg.role === 'user' ? msg.text : undefined}
                </div>
              ))}

              {loading && (
                <div className="ai-chat-typing">
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                </div>
              )}

              {error && <div className="ai-chat-error">{error}</div>}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="ai-chat-input-area" onSubmit={handleSubmit}>
              <textarea
                ref={inputRef}
                className="ai-chat-input"
                placeholder="আপনার প্রশ্ন লিখুন..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
                maxLength={2000}
              />
              <button
                type="submit"
                className="ai-chat-send-btn"
                disabled={!input.trim() || loading}
                title="Send"
              >
                <Send size={18} />
              </button>
            </form>

            <div className="ai-chat-powered">
              ✨ Powered by AI
            </div>
          </div>
        </>
      )}
    </>
  );
}

// =========================================================
// Heuristic Client-Side AI Response Generator (Fallback)
// =========================================================
function generateClientFallbackResponse(
  message: string, 
  products: any[], 
  lastMatchedProduct: any, 
  setLastMatchedProduct: (p: any) => void
): string {
  const query = message.toLowerCase().trim();
  const activeProducts = products.filter(p => p.published);

  // Common intent checks
  const isAskingForUse = query.includes('use') || query.includes('kivabe') || query.includes('কিভাবে') || query.includes('নিয়ম') || query.includes('rules') || query.includes('kaj') || query.includes('কাজ') || query.includes('ব্যবহার') || query.includes('work') || query.includes('hobe');
  const isAskingForBenefits = query.includes('upokarita') || query.includes('উপকার') || query.includes('সুবিধা') || query.includes('benefit') || query.includes('feature') || query.includes('ফিচার');
  const isAskingForSpecs = query.includes('spec') || query.includes('মাপ') || query.includes('size') || query.includes('সাইজ') || query.includes('material') || query.includes('উপাদান') || query.includes('বিবরণ') || query.includes('details') || query.includes('বিস্তারিত');
  const isAskingForPrice = query.includes('price') || query.includes('দাম') || query.includes('কত') || query.includes('টাকা') || query.includes('cost');
  const isAskingForStock = query.includes('stock') || query.includes('আছে') || query.includes('পাব') || query.includes('পাওয়া');

  // Helper function to build a tailored response for a matched product based on intent
  const buildTailoredResponse = (product: any): string => {
    const inStock = product.in_stock === 1 || product.in_stock === true || product.stock > 0;
    
    if (isAskingForUse) {
      let reply = `**${product.name}** এর ব্যবহার ও কাজের বিবরণ:\n\n`;
      if (product.description) {
        reply += `${product.description}\n\n`;
      }
      if (product.features && product.features.length > 0) {
        reply += `**ব্যবহারের সুবিধা ও বৈশিষ্ট্যসমূহ:**\n`;
        product.features.forEach((f: string) => {
          reply += `- ${f}\n`;
        });
      }
      return reply;
    }

    if (isAskingForBenefits) {
      let reply = `**${product.name}** এর উপকারিতা ও বিশেষ ফিচারসমূহ:\n\n`;
      if (product.features && product.features.length > 0) {
        product.features.forEach((f: string) => {
          reply += `- ${f}\n`;
        });
      } else if (product.description) {
        reply += `${product.description}\n`;
      } else {
        reply += `এটি একটি অত্যন্ত মানসম্পন্ন ও কার্যকরী পণ্য।\n`;
      }
      return reply;
    }

    if (isAskingForSpecs) {
      let reply = `**${product.name}** এর স্পেসিফিকেশন ও বিস্তারিত তথ্য:\n\n`;
      if (product.specs && product.specs.length > 0) {
        product.specs.forEach((s: any) => {
          reply += `- **${s.name}**: ${s.value}\n`;
        });
      } else if (product.description) {
        reply += `**বিবরণ:** ${product.description}\n`;
      }
      return reply;
    }

    if (isAskingForPrice) {
      let reply = `**${product.name}** এর বর্তমান মূল্য ৳${product.price}।`;
      if (product.originalPrice && product.originalPrice > product.price) {
        reply += ` (পূর্বে এর মূল্য ছিল ৳${product.originalPrice}, যা এখন ${Math.round((1 - product.price / product.originalPrice) * 100)}% ছাড়ে পাওয়া যাচ্ছে!)`;
      }
      return reply;
    }

    if (isAskingForStock) {
      return `**${product.name}** পণ্যটি ${inStock ? `বর্তমানে স্টকে আছে (বাকি আছে ${product.stock || 1} টি)` : 'বর্তমানে স্টক আউট'}`;
    }

    // Default detailed product info card
    let reply = `**${product.name}** সম্পর্কে বিস্তারিত তথ্য:\n\n`;
    reply += `- **মূল্য**: ৳${product.price}\n`;
    if (product.originalPrice && product.originalPrice > product.price) {
      reply += `- **অরিজিনাল প্রাইস**: ৳${product.originalPrice} (${Math.round((1 - product.price / product.originalPrice) * 100)}% ছাড়!)\n`;
    }
    reply += `- **স্টক**: ${inStock ? `স্টকে আছে (বাকি আছে ${product.stock || 1} টি)` : 'স্টক আউট'}\n`;
    if (product.description) reply += `- **বিবরণ**: ${product.description}\n`;
    
    if (product.features && product.features.length > 0) {
      reply += `\n**ফিচারসমূহ:**\n`;
      product.features.forEach((f: string) => {
        reply += `- ${f}\n`;
      });
    }

    if (product.specs && product.specs.length > 0) {
      reply += `\n**স্পেসিফিকেশন:**\n`;
      product.specs.forEach((s: any) => {
        reply += `- **${s.name}**: ${s.value}\n`;
      });
    }

    // Find related products in the same category
    if (product.category) {
      const related = activeProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
      if (related.length > 0) {
        reply += `\n🔗 **সম্পর্কিত অন্যান্য পণ্য (Related Products):**\n`;
        related.forEach(p => {
          reply += `- **${p.name}** (৳${p.price})\n`;
        });
      }
    }
    return reply;
  };

  // 1. First, check if user is asking follow-up questions about the last matched product
  if (lastMatchedProduct && (isAskingForUse || isAskingForBenefits || isAskingForSpecs || isAskingForPrice || isAskingForStock)) {
    return buildTailoredResponse(lastMatchedProduct);
  }

  // 2. Common Greetings
  if (query.includes('হ্যালো') || query.includes('hi') || query.includes('hello') || query.includes('কেমন আছ') || query.includes('আছেন')) {
    return 'হ্যালো! আমি আপনার AI শপিং অ্যাসিস্ট্যান্ট। আমি আপনাকে স্টোরের পণ্য খুঁজে পেতে, দাম জানতে অথবা ছাড় ও অফার জানতে সাহায্য করতে পারি। আপনি কি খুঁজছেন বলুন?';
  }

  // 3. Product Catalog Queries
  if (query.includes('পণ্য') || query.includes('প্রোডাক্ট') || query.includes('product') || query.includes('list') || query.includes('কি কি আছে')) {
    if (activeProducts.length === 0) return 'দুঃখিত, এই মুহূর্তে আমাদের স্টোরে কোনো পণ্য পাওয়া যাচ্ছে না।';
    const listStr = activeProducts.slice(0, 10).map(p => `- **${p.name}** (৳${p.price})${p.category ? ` - *Category: ${p.category}*` : ''}`).join('\n');
    return `আমাদের স্টোরের পণ্যসমূহের তালিকা নিচে দেওয়া হলো:\n\n${listStr}\n\nযেকোনো পণ্যের বিস্তারিত জানতে তার নাম লিখে প্রশ্ন করুন!`;
  }

  // 4. Low Price Queries
  if (query.includes('কম দাম') || query.includes('সস্তা') || query.includes('cheap') || query.includes('low price') || query.includes('কমদামি')) {
    if (activeProducts.length === 0) return 'দুঃখিত, এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না।';
    const sorted = [...activeProducts].sort((a, b) => a.price - b.price);
    const listStr = sorted.slice(0, 5).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের স্টোরের সবচেয়ে কম দামের পণ্যসমূহ:\n\n${listStr}`;
  }

  // 5. Discount / Offers Queries
  if (query.includes('ছাড়') || query.includes('অফার') || query.includes('discount') || query.includes('sale') || query.includes('ক্যাম্পেইন') || query.includes('কমাবে')) {
    const discounted = activeProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
    if (discounted.length === 0) return 'এই মুহূর্তে কোনো পণ্যে সরাসরি মূল্যছাড় নেই, তবে আমাদের সব পণ্যের দামই অত্যন্ত সাশ্রয়ী!';
    const listStr = discounted.slice(0, 5).map(p => {
      const pct = Math.round((1 - p.price / p.originalPrice) * 100);
      return `- **${p.name}**: ৳${p.price} (মূল্য: ৳${p.originalPrice}, **${pct}% ছাড়!**)`;
    }).join('\n');
    return `আমাদের আকর্ষণীয় অফার ও ডিসকাউন্টযুক্ত পণ্যসমূহ:\n\n${listStr}`;
  }

  // 6. Direct product name matches & keyword aliases
  let matched = activeProducts.find(p => query.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(query));
  
  if (!matched) {
    const aliases = [
      { keywords: ['dumbbell', 'ডাম্বেল', 'ডামবেল'], id: 1, backId: 'PRD-001' },
      { keywords: ['roller', 'রোলার', 'ab roller', 'এবি রোলার'], id: 2, backId: 'PRD-002' },
      { keywords: ['football', 'ফুটবল', 'বল'], id: 3, backId: 'PRD-003' },
      { keywords: ['badminton', 'র‍্যাকেট', 'র্যাকেট', 'রকেট', 'ব্যাডমিন্টন'], id: 4, backId: 'PRD-004' },
      { keywords: ['shoes', 'জুতো', 'জুতা', 'রানিং', 'running'], id: 5, backId: 'PRD-005' },
      { keywords: ['jersey', 'জার্সি', 'ড্রাই-ফিট', 'dri-fit'], id: 6, backId: 'PRD-006' },
      { keywords: ['yoga', 'ম্যাট', 'ইয়োগা', 'ইয়োগা'], id: 7, backId: 'PRD-007' },
      { keywords: ['basketball', 'বাস্কেটবল', 'হুপ', 'hoop'], id: 8, backId: 'PRD-008' }
    ];
    
    for (const alias of aliases) {
      if (alias.keywords.some(kw => query.includes(kw))) {
        matched = activeProducts.find(p => String(p.id) === String(alias.id) || String(p.id) === String(alias.backId));
        if (matched) break;
      }
    }
  }

  if (matched) {
    setLastMatchedProduct(matched);
    return buildTailoredResponse(matched);
  }

  // 7. Smart Synonyms & Category queries
  let targetCategoryName: string | null = null;
  
  if (query.includes('fitness') || query.includes('ফিটনেস') || query.includes('gym') || query.includes('gym') || query.includes('জিম') || query.includes('ব্যায়াম') || query.includes('ব্যায়াম') || query.includes('workout') || query.includes('exercise') || query.includes('dumbbell') || query.includes('ডাম্বেল') || query.includes('রোলার') || query.includes('roller')) {
    targetCategoryName = 'Fitness Item';
  } else if (query.includes('game') || query.includes('sports') || query.includes('খেলা') || query.includes('খেলার') || query.includes('ফুটবল') || query.includes('football') || query.includes('ক্রিকেট') || query.includes('ball') || query.includes('বল') || query.includes('বাস্কেটবল') || query.includes('basketball') || query.includes('badminton') || query.includes('ব্যাটমিন্টন')) {
    targetCategoryName = 'Sports Game';
  } else if (query.includes('shoes') || query.includes('জুতা') || query.includes('জুতো') || query.includes('স্নিকার') || query.includes('sneakers') || query.includes('shoe')) {
    targetCategoryName = 'Sports Shoes';
  } else if (query.includes('wear') || query.includes('jersey') || query.includes('জার্সি') || query.includes('tshirt') || query.includes('t-shirt') || query.includes('টি-শার্ট') || query.includes('পোশাক') || query.includes('cloth') || query.includes('কাপড়') || query.includes('polo') || query.includes('পোলো')) {
    targetCategoryName = 'Sports wear';
  }
  
  let categoryMatched = activeProducts;
  if (targetCategoryName) {
    categoryMatched = activeProducts.filter(p => p.category && p.category.toLowerCase().includes(targetCategoryName!.toLowerCase()));
  } else {
    categoryMatched = activeProducts.filter(p => p.category && query.includes(p.category.toLowerCase()));
  }

  if (categoryMatched.length > 0) {
    const listStr = categoryMatched.slice(0, 5).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের কাছে **${categoryMatched[0].category || targetCategoryName}** সংক্রান্ত নিচের পণ্যগুলো রয়েছে:\n\n${listStr}\n\nপণ্যের বিবরণ, দাম বা ব্যবহারের নিয়ম জানতে পণ্যটির নাম লিখে প্রশ্ন করতে পারেন!`;
  }

  // Default fallback with categories and products listing
  const categoryNames = Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)));
  const categoryListStr = categoryNames.length > 0 
    ? `\n\nআমাদের স্টোরের প্রধান ক্যাটাগরিগুলো হলো:\n` + categoryNames.map(c => `- **${c}**`).join('\n')
    : '';
    
  const popularListStr = activeProducts.length > 0
    ? `\n\nজনপ্রিয় কিছু পণ্য:\n` + activeProducts.slice(0, 3).map(p => `- **${p.name}** (৳${p.price})`).join('\n')
    : '';

  return `আমি আপনার প্রশ্নটি সরাসরি বুঝতে পারিনি। আমি আপনাকে পণ্য খুঁজে পেতে, দাম জানতে অথবা পরামর্শ দিতে সাহায্য করতে পারি।${categoryListStr}${popularListStr}\n\nঅনুগ্রহ করে কোনো পণ্যের নাম বা আপনার পছন্দের ক্যাটাগরি লিখে প্রশ্ন করুন!`;
}
