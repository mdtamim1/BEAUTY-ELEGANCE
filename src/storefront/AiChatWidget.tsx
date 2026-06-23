import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
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

      const data = await response.json();

      if (data.status === 'success' && data.data?.reply) {
        const aiMsg: ChatMsg = { role: 'model', text: data.data.reply };
        setMessages(prev => [...prev, aiMsg]);
        if (!open) setHasNewReply(true);
      } else {
        setError(data.message || 'দুঃখিত, AI রেসপন্স পাওয়া যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (e) {
      console.error('AI Chat Error:', e);
      setError('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। পরে আবার চেষ্টা করুন।');
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
        {open ? <X size={24} /> : <Sparkles size={26} />}
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
