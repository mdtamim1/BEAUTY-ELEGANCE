import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const EMAIL_USER = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'rjtamim154@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

// ---- Nodemailer transporter (Gmail SMTP) ----
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

const STORE_NAME = process.env.STORE_NAME || 'Tamim Global';
const STORE_URL = process.env.STORE_URL || 'https://tamimglobal.com';
const FROM_EMAIL = EMAIL_USER ? `"${STORE_NAME}" <${EMAIL_USER}>` : '';

// Helper to convert TG logo to base64 so email clients display it directly
const getLogoBase64 = (): string => {
  try {
    const candidates = [
      path.join(process.cwd(), 'public', 'email-logo.png'),
      path.join(process.cwd(), 'public', 'site-logo.png'),
      path.join(process.cwd(), 'public', 'favicon.png'),
    ];
    for (const logoPath of candidates) {
      if (fs.existsSync(logoPath)) {
        const buffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${buffer.toString('base64')}`;
      }
    }
  } catch (e) {
    console.error('[EmailService] Could not read logo file:', e);
  }
  return `${STORE_URL}/email-logo.png`;
};

// ---- HTML email base template ----
const emailTemplate = (content: string) => {
  const logoSrc = getLogoBase64();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${STORE_NAME}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f17; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-wrapper { width: 100%; background-color: #0b0f17; padding: 32px 12px; box-sizing: border-box; }
    .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.35); border: 1px solid #1e293b; }
    .email-header { background: linear-gradient(180deg, #090d16 0%, #171c28 100%); padding: 36px 24px 28px; text-align: center; border-bottom: 3px solid #e11d48; }
    .header-logo { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid #e11d48; box-shadow: 0 0 25px rgba(225, 29, 72, 0.45); display: inline-block; background: #000000; }
    .brand-title { color: #ffffff; font-size: 1.35rem; margin: 14px 0 0; letter-spacing: 3px; font-weight: 900; text-transform: uppercase; font-family: Arial, sans-serif; }
    .brand-subtitle { color: #f43f5e; font-size: 0.72rem; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; font-weight: 800; }
    .email-body { padding: 32px 28px; background: #ffffff; color: #1e293b; }
    .btn { display: inline-block; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff !important; text-decoration: none; padding: 13px 32px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.5px; box-shadow: 0 6px 18px rgba(225, 29, 72, 0.35); }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 24px 0; }
    .tag { display: inline-block; background: #fef2f2; color: #e11d48; border-radius: 100px; padding: 4px 12px; font-size: 0.78rem; font-weight: 700; margin: 4px 4px 4px 0; }
    .email-footer { background: #090d16; padding: 26px 24px; text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #1e293b; }
    .email-footer p { margin: 6px 0; }
    .email-footer a { color: #f43f5e; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <img class="header-logo" src="${logoSrc}" alt="${STORE_NAME}" />
        <div class="brand-title">${STORE_NAME}</div>
        <div class="brand-subtitle">PREMIUM E-COMMERCE</div>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p>© ${new Date().getFullYear()} <strong style="color:#ffffff;">${STORE_NAME}</strong>. All rights reserved.</p>
        <p><a href="${STORE_URL}">${STORE_URL}</a></p>
        <p style="margin-top: 12px; color: #64748b; font-size: 0.72rem;">অর্ডার বা যেকোনো সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

// ---- Welcome email (on subscribe) ----
export const sendWelcomeEmail = async (email: string): Promise<boolean> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not set in .env, skipping email.');
    return false;
  }

  const content = `
    <h2>🎉 সাবস্ক্রিপশন সফল!</h2>
    <p>আপনাকে <strong>${STORE_NAME}</strong>-এর নিউজলেটারে স্বাগতম! এখন থেকে আপনি পাবেন:</p>
    <div>
      <span class="tag">🔥 এক্সক্লুসিভ অফার</span>
      <span class="tag">🆕 নতুন পণ্যের আপডেট</span>
      <span class="tag">🎁 বিশেষ কুপন কোড</span>
      <span class="tag">⚡ ফ্ল্যাশ সেল নোটিশ</span>
    </div>
    <hr class="divider" />
    <p>এখনই কেনাকাটা শুরু করুন এবং সেরা ডিলগুলো উপভোগ করুন।</p>
    <a href="${STORE_URL}" class="btn">🛍️ শপ করুন এখনই</a>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 ${STORE_NAME}-এ স্বাগতম! আপনার সাবস্ক্রিপশন সফল`,
      html: emailTemplate(content),
    });
    console.log(`[EmailService] Welcome email sent to: ${email}`);
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to send welcome email:', err);
    return false;
  }
};

// ---- New product announcement email ----
export const sendNewProductEmail = async (
  subscribers: string[],
  product: { name: string; price: number; image: string; id: string | number }
): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] Email credentials not set, skipping newsletter.');
    return;
  }
  if (!subscribers.length) return;

  const productUrl = `${STORE_URL}/product/${product.id}`;
  const content = `
    <h2>🆕 নতুন পণ্য এসেছে!</h2>
    <p>আপনার জন্য একটি দুর্দান্ত নতুন পণ্য যোগ হয়েছে আমাদের স্টোরে:</p>
    <div class="product-card">
      <img class="product-img" src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <p class="product-name">${product.name}</p>
        <p class="product-price">৳${product.price.toLocaleString()}</p>
      </div>
    </div>
    <a href="${productUrl}" class="btn">এখনই দেখুন →</a>
  `;

  try {
    const transporter = createTransporter();
    // Send in batches of 50 to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const promises = batch.map(email =>
        transporter.sendMail({
          from: FROM_EMAIL,
          to: email,
          subject: `🆕 নতুন পণ্য: ${product.name} — ${STORE_NAME}`,
          html: emailTemplate(content),
        }).catch(err => console.error(`[EmailService] Failed to send to ${email}:`, err))
      );
      await Promise.all(promises);
      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    console.log(`[EmailService] New product email sent to ${subscribers.length} subscribers`);
  } catch (err) {
    console.error('[EmailService] Failed to send new product emails:', err);
  }
};

// ---- Offer/campaign email ----
export const sendOfferEmail = async (
  subscribers: string[],
  offer: { title: string; description: string; couponCode?: string; discount?: string; link?: string }
): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] Email credentials not set, skipping offer email.');
    return;
  }
  if (!subscribers.length) return;

  const offerLink = offer.link || STORE_URL;
  const content = `
    <h2>🔥 ${offer.title}</h2>
    <p>${offer.description}</p>
    ${offer.discount ? `<p style="font-size:1.5rem;font-weight:900;color:#e11d48;text-align:center;">${offer.discount} ছাড়!</p>` : ''}
    ${offer.couponCode ? `
      <div style="background:#fef2f2;border:2px dashed #e11d48;border-radius:10px;padding:16px;text-align:center;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:0.82rem;color:#6b7280;">আপনার কুপন কোড:</p>
        <p style="margin:0;font-size:1.4rem;font-weight:900;color:#e11d48;letter-spacing:3px;">${offer.couponCode}</p>
      </div>
    ` : ''}
    <a href="${offerLink}" class="btn">🛍️ অফার দেখুন</a>
  `;

  try {
    const transporter = createTransporter();
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const promises = batch.map(email =>
        transporter.sendMail({
          from: FROM_EMAIL,
          to: email,
          subject: `🔥 ${offer.title} — ${STORE_NAME}`,
          html: emailTemplate(content),
        }).catch(err => console.error(`[EmailService] Failed to send to ${email}:`, err))
      );
      await Promise.all(promises);
      if (i + batchSize < subscribers.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    console.log(`[EmailService] Offer email sent to ${subscribers.length} subscribers`);
  } catch (err) {
    console.error('[EmailService] Failed to send offer emails:', err);
  }
};

// ---- Instant Order Confirmation Email ----
export interface OrderEmailData {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  thana?: string;
  amount: number;
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  paymentMethod?: string;
  productsList?: Array<{ name: string; quantity: number; price: number; color?: string; size?: string }>;
}

/**
 * Sends transactional email via Brevo API v3 (api.brevo.com/v3/smtp/email)
 */
export const sendBrevoEmail = async (
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '';
  if (!brevoApiKey) return false;

  const senderEmail = process.env.EMAIL_USER || 'rjtamim154@gmail.com';
  const senderName = process.env.STORE_NAME || 'Tamim Global';

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName || 'Customer' }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (response.ok) {
      console.log(`[EmailService - Brevo API] Email sent successfully to: ${toEmail}`);
      return true;
    } else {
      const errRes = await response.json().catch(() => ({}));
      console.error('[EmailService - Brevo API] Brevo API returned error:', errRes);
      return false;
    }
  } catch (err: any) {
    console.error('[EmailService - Brevo API] Failed to send via Brevo:', err.message || err);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (order: OrderEmailData): Promise<boolean> => {
  if (!order.email || !order.email.includes('@')) {
    console.warn(`[EmailService] Invalid customer email: ${order.email}, skipping confirmation email.`);
    return false;
  }

  const itemsHtml = (order.productsList || []).map(item => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px 10px;font-weight:700;color:#0f172a;vertical-align:middle;">
        <div style="font-size:0.92rem;color:#0f172a;">${item.name}</div>
        ${item.color && item.color !== 'Default' ? `<span style="display:inline-block;font-size:0.75rem;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px;margin-top:3px;">রং: ${item.color}</span>` : ''}
        ${item.size && item.size !== 'Free Size' ? `<span style="display:inline-block;font-size:0.75rem;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px;margin-top:3px;margin-left:4px;">সাইজ: ${item.size}</span>` : ''}
      </td>
      <td style="padding:12px 10px;text-align:center;font-weight:700;color:#475569;vertical-align:middle;font-size:0.88rem;">x${item.quantity}</td>
      <td style="padding:12px 10px;text-align:right;font-weight:800;color:#e11d48;vertical-align:middle;font-size:0.95rem;">৳${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <div style="background:linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);border:1px solid #fecdd3;padding:20px;border-radius:14px;margin-bottom:24px;text-align:center;">
      <div style="font-size:1.3rem;font-weight:900;color:#9f1239;margin-bottom:6px;">🎉 অর্ডার সফলভাবে গৃহীত হয়েছে!</div>
      <div style="font-size:0.9rem;color:#be123c;">অর্ডার নম্বর: <span style="background:#e11d48;color:#ffffff;padding:3px 12px;border-radius:20px;font-weight:800;letter-spacing:1px;">${order.id}</span></div>
    </div>

    <p style="font-size:0.95rem;color:#334155;line-height:1.6;margin-bottom:20px;">
      প্রিয় <strong>${order.customer}</strong>,<br />
      <strong>${STORE_NAME}</strong>-এ কেনাকাটা করার জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার অর্ডারটি সফলভাবে আমাদের সিস্টেমে নথিভুক্ত হয়েছে এবং শীঘ্রই ডেলিভারির জন্য প্রসেস করা হবে।
    </p>

    <div style="font-size:1rem;font-weight:800;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;margin:28px 0 16px;text-transform:uppercase;letter-spacing:0.5px;">
      📦 অর্ডারের বিবরণ
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <thead>
        <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:left;font-size:0.78rem;color:#64748b;text-transform:uppercase;">
          <th style="padding:10px 12px;">পণ্য</th>
          <th style="padding:10px 12px;text-align:center;">পরিমাণ</th>
          <th style="padding:10px 12px;text-align:right;">মূল্য</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#64748b;">পণ্য তালিকা প্রসেসিং এ রয়েছে</td></tr>'}
      </tbody>
    </table>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;font-size:0.9rem;color:#475569;">সাবটোটাল:</td>
          <td style="padding:4px 0;text-align:right;font-size:0.9rem;font-weight:700;color:#1e293b;">৳${(order.subtotal || order.amount).toFixed(2)}</td>
        </tr>
        ${order.deliveryCharge ? `
        <tr>
          <td style="padding:4px 0;font-size:0.9rem;color:#475569;">ডেলিভারি চার্জ:</td>
          <td style="padding:4px 0;text-align:right;font-size:0.9rem;font-weight:700;color:#1e293b;">৳${order.deliveryCharge.toFixed(2)}</td>
        </tr>` : ''}
        ${order.discount ? `
        <tr>
          <td style="padding:4px 0;font-size:0.9rem;color:#10b981;font-weight:600;">ডিসকাউন্ট:</td>
          <td style="padding:4px 0;text-align:right;font-size:0.9rem;font-weight:700;color:#10b981;">-৳${order.discount.toFixed(2)}</td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="padding:8px 0 4px;"><hr style="border:none;border-top:1px dashed #cbd5e1;margin:0;" /></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:1.05rem;font-weight:900;color:#0f172a;">সর্বমোট দেয়:</td>
          <td style="padding:6px 0;text-align:right;font-size:1.15rem;font-weight:900;color:#e11d48;">৳${order.amount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="font-size:1rem;font-weight:800;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;margin:28px 0 16px;text-transform:uppercase;letter-spacing:0.5px;">
      📍 ডেলিভারি ঠিকানা
    </div>

    <div style="background:#f8fafc;border-left:4px solid #e11d48;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:24px;">
      <p style="margin:4px 0;font-size:0.9rem;color:#334155;"><strong>গ্রহীতা:</strong> ${order.customer}</p>
      <p style="margin:4px 0;font-size:0.9rem;color:#334155;"><strong>মোবাইল:</strong> ${order.phone || 'N/A'}</p>
      <p style="margin:4px 0;font-size:0.9rem;color:#334155;"><strong>ঠিকানা:</strong> ${order.address || ''} ${order.thana ? `, ${order.thana}` : ''} ${order.city ? `, ${order.city}` : ''}</p>
      <p style="margin:4px 0;font-size:0.9rem;color:#334155;"><strong>পেমেন্ট মেথড:</strong> <span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;font-weight:700;font-size:0.8rem;">${order.paymentMethod || 'Cash on Delivery'}</span></p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="${STORE_URL}" class="btn">🛍️ ওয়েবসাইট ভিজিট করুন</a>
    </div>
  `;

  const htmlBody = emailTemplate(content);
  const subjectText = `🛍️ আপনার অর্ডার কনফার্ম হয়েছে! (অর্ডার #${order.id}) — ${STORE_NAME}`;

  // 1. Attempt sending via Brevo API v3 if BREVO_API_KEY is present
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '';
  if (brevoApiKey) {
    const sent = await sendBrevoEmail(
      order.email,
      order.customer || 'Customer',
      subjectText,
      htmlBody
    );
    if (sent) return true;
  }

  // 2. Direct Nodemailer Gmail SMTP Execution
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('[EmailService] Email notification skipped (No active EMAIL_USER / BREVO_API_KEY configured).');
    return false;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: order.email,
      subject: subjectText,
      html: htmlBody,
    });
    console.log(`[EmailService] Order confirmation email sent to: ${order.email} for order #${order.id}`);
    return true;
  } catch (err: any) {
    console.error(`[EmailService] Failed to send order confirmation email to ${order.email}:`, err.message || err);
    return false;
  }
};
