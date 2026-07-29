import React, { useState } from 'react';
import { MessageCircle, X, Phone, Send, Sparkles, ShieldCheck } from 'lucide-react';
import './floating-chat.css';

interface FloatingLiveChatWidgetProps {
  whatsappNumber?: string;
  messengerUsername?: string;
  phoneNumber?: string;
}

export const FloatingLiveChatWidget: React.FC<FloatingLiveChatWidgetProps> = ({
  whatsappNumber = '8801321832605',
  messengerUsername = 'sportscorex',
  phoneNumber = '+8801321832605',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cleanWhatsapp = whatsappNumber.replace(/[^\d]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Tamim Global! I have a question regarding your products.')}`;
  const messengerUrl = `https://m.me/${messengerUsername}`;
  const phoneUrl = `tel:${phoneNumber.replace(/\s+/g, '')}`;

  return (
    <div className="tg-floating-chat-container">
      {/* Expanded Multi-Channel Popup Menu */}
      {isOpen && (
        <div className="tg-chat-popup animate-fadeInUp">
          <div className="tg-chat-header">
            <div className="tg-chat-header-info">
              <div className="tg-chat-avatar">
                <Sparkles size={18} className="tg-avatar-icon" />
                <span className="tg-online-badge"></span>
              </div>
              <div>
                <h4 className="tg-chat-title">Tamim Global Live Support</h4>
                <p className="tg-chat-sub">⚡ সাধারণত ৫ মিনিটের মধ্যে উত্তর দেওয়া হয়</p>
              </div>
            </div>
            <button
              className="tg-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="tg-chat-body">
            <p className="tg-chat-welcome">
              আসসালামু আলাইকুম! কোনো প্রশ্ন বা অর্ডারে সাহায্য প্রয়োজন? চ্যানেল বেছে নিন:
            </p>

            {/* WhatsApp Option */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tg-chat-option whatsapp-option"
            >
              <div className="tg-option-icon whatsapp-icon-bg">
                <MessageCircle size={22} />
              </div>
              <div className="tg-option-content">
                <span className="tg-option-label">WhatsApp সাপোর্ট</span>
                <span className="tg-option-desc">সরাসরি হোয়াটসঅ্যাপে চ্যাট করুন</span>
              </div>
              <Send size={16} className="tg-option-arrow" />
            </a>

            {/* Messenger Option */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tg-chat-option messenger-option"
            >
              <div className="tg-option-icon messenger-icon-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.909 1.458 5.518 3.738 7.213V22l3.39-1.862c.928.257 1.916.398 2.872.398 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.443l-2.584-2.756-5.044 2.756 5.548-5.892 2.648 2.756 4.98-2.756-5.548 5.892z"/>
                </svg>
              </div>
              <div className="tg-option-content">
                <span className="tg-option-label">FB Messenger চ্যাট</span>
                <span className="tg-option-desc">ফেসবুক মেসেঞ্জারে মেসেজ দিন</span>
              </div>
              <Send size={16} className="tg-option-arrow" />
            </a>

            {/* Direct Phone Call Option */}
            <a
              href={phoneUrl}
              className="tg-chat-option phone-option"
            >
              <div className="tg-option-icon phone-icon-bg">
                <Phone size={20} />
              </div>
              <div className="tg-option-content">
                <span className="tg-option-label">সরাসরি কল দিন</span>
                <span className="tg-option-desc">+880 1321-832605</span>
              </div>
              <Send size={16} className="tg-option-arrow" />
            </a>
          </div>

          <div className="tg-chat-footer">
            <ShieldCheck size={14} />
            <span>১০০% নিরাপদ ও সার্বক্ষণিক কাস্টমার কেয়ার</span>
          </div>
        </div>
      )}

      {/* Trigger Floating Action Button */}
      <button
        className={`tg-floating-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Live Chat Support"
      >
        <span className="tg-trigger-pulse"></span>
        {isOpen ? (
          <X size={26} className="tg-trigger-icon" />
        ) : (
          <div className="tg-trigger-inner">
            <MessageCircle size={26} className="tg-trigger-icon" />
            <span className="tg-unread-dot"></span>
          </div>
        )}
        <span className="tg-trigger-tooltip">Chat with us!</span>
      </button>
    </div>
  );
};
