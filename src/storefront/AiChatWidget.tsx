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
  : 'https://beauty-elegance-admin.onrender.com/api/v1';

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
      const reply = generateClientFallbackResponse(text.trim(), config.products || []);
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
      {/* Floating 3D AI Button */}
      <button
        className={`ai-chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        title={open ? 'Close AI Assistant' : 'AI Shopping Assistant'}
        aria-label={open ? 'Close AI Assistant' : 'Open AI Shopping Assistant'}
        id="ai-chat-button"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
        {!open && hasNewReply && <span className="ai-fab-badge">!</span>}
      </button>

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
function generateClientFallbackResponse(message: string, products: any[]): string {
  const query = message.toLowerCase().trim();
  const activeProducts = products.filter(p => p.published);

  if (query.includes('হ্যালো') || query.includes('hi') || query.includes('hello') || query.includes('কেমন আছ') || query.includes('আছেন')) {
    return 'হ্যালো! আমি আপনার AI শপিং অ্যাসিস্ট্যান্ট। আমি আপনাকে স্টোরের পণ্য খুঁজে পেতে, দাম জানতে অথবা ছাড় ও অফার জানতে সাহায্য করতে পারি। আপনি কি খুঁজছেন বলুন?';
  }

  if (query.includes('পণ্য') || query.includes('প্রোডাক্ট') || query.includes('product') || query.includes('list') || query.includes('কি কি আছে')) {
    if (activeProducts.length === 0) return 'দুঃখিত, এই মুহূর্তে আমাদের স্টোরে কোনো পণ্য পাওয়া যাচ্ছে না।';
    const listStr = activeProducts.slice(0, 5).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের স্টোরের কিছু চমৎকার পণ্য নিচে দেওয়া হলো:\n\n${listStr}\n\nযেকোনো পণ্যের বিস্তারিত জানতে তার নাম লিখে প্রশ্ন করুন!`;
  }

  if (query.includes('কম দাম') || query.includes('সস্তা') || query.includes('cheap') || query.includes('low price') || query.includes('কমদামি')) {
    if (activeProducts.length === 0) return 'দুঃখিত, এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না।';
    const sorted = [...activeProducts].sort((a, b) => a.price - b.price);
    const listStr = sorted.slice(0, 3).map(p => `- **${p.name}** (৳${p.price})`).join('\n');
    return `আমাদের স্টোরের সবচেয়ে কম দামের পণ্যসমূহ:\n\n${listStr}`;
  }

  if (query.includes('ছাড়') || query.includes('অফার') || query.includes('discount') || query.includes('sale') || query.includes('ক্যাম্পেইন') || query.includes('কমাবে')) {
    const discounted = activeProducts.filter(p => p.original_price && p.original_price > p.price);
    if (discounted.length === 0) return 'এই মুহূর্তে কোনো পণ্যে সরাসরি মূল্যছাড় নেই, তবে আমাদের সব পণ্যের দামই অত্যন্ত সাশ্রয়ী!';
    const listStr = discounted.slice(0, 3).map(p => {
      const pct = Math.round((1 - p.price / p.original_price) * 100);
      return `- **${p.name}**: ৳${p.price} (মূল্য: ৳${p.original_price}, **${pct}% ছাড়!**)`;
    }).join('\n');
    return `আমাদের আকর্ষণীয় অফার ও ডিসকাউন্টযুক্ত পণ্যসমূহ:\n\n${listStr}`;
  }

  // Search for specific product matches
  const matched = activeProducts.find(p => query.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(query));
  if (matched) {
    const inStock = matched.in_stock === 1 || matched.in_stock === true || matched.stock > 0;
    let reply = `**${matched.name}** সম্পর্কে তথ্য:\n\n- **মূল্য**: ৳${matched.price}\n`;
    if (matched.original_price && matched.original_price > matched.price) {
      reply += `- **অরিজিনাল প্রাইস**: ৳${matched.original_price} (${Math.round((1 - matched.price / matched.original_price) * 100)}% ছাড়!)\n`;
    }
    reply += `- **স্টক**: ${inStock ? `স্টকে আছে (${matched.stock || 'উপলব্ধ'})` : 'স্টক আউট'}\n`;
    if (matched.description) reply += `- **বিবরণ**: ${matched.description}\n`;
    return reply;
  }

  return 'আমি আপনার প্রশ্নটি বুঝতে পেরেছি। আমাদের স্টোরে থাকা পণ্যগুলোর দাম, বিবরণ, অথবা কোনো ছাড় সম্পর্কে জানতে পণ্যটির নাম লিখে প্রশ্ন করতে পারেন। আমি আপনাকে সেরা তথ্যটি দেওয়ার চেষ্টা করব!';
}
