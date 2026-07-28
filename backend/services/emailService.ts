import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || 'rjtamim154@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'yfginnhvzzloemza';

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
const STORE_LOGO = `${STORE_URL}/logo.png`;
const FROM_EMAIL = `"${STORE_NAME}" <${EMAIL_USER}>`;

// ---- HTML email base template ----
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${STORE_NAME}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #111827; padding: 28px 32px; text-align: center; }
    .header img { height: 52px; object-fit: contain; }
    .header h1 { color: #e11d48; font-size: 1.1rem; margin: 8px 0 0; letter-spacing: 2px; font-weight: 800; }
    .body { padding: 32px; color: #1f2937; }
    .body h2 { font-size: 1.3rem; font-weight: 800; margin: 0 0 12px; color: #111827; }
    .body p { font-size: 0.92rem; line-height: 1.7; color: #4b5563; margin: 0 0 16px; }
    .btn { display: inline-block; background: #e11d48; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 100px; font-weight: 700; font-size: 0.9rem; margin-top: 8px; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
    .tag { display: inline-block; background: #fef2f2; color: #e11d48; border-radius: 100px; padding: 4px 12px; font-size: 0.78rem; font-weight: 700; margin: 4px 4px 4px 0; }
    .product-card { display: flex; gap: 12px; align-items: center; background: #f9fafb; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
    .product-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
    .product-info { flex: 1; }
    .product-name { font-weight: 700; font-size: 0.88rem; color: #111827; margin: 0 0 4px; }
    .product-price { color: #e11d48; font-weight: 800; font-size: 0.9rem; }
    .footer { background: #111827; padding: 20px 32px; text-align: center; }
    .footer p { color: #6b7280; font-size: 0.75rem; margin: 4px 0; }
    .footer a { color: #9ca3af; text-decoration: none; }
    .unsubscribe { font-size: 0.7rem; color: #6b7280; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${STORE_LOGO}" alt="${STORE_NAME}" onerror="this.style.display='none'" />
      <h1>${STORE_NAME.toUpperCase()}</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
      <p><a href="${STORE_URL}">${STORE_URL}</a></p>
      <p class="unsubscribe">আর ইমেইল পেতে না চাইলে <a href="${STORE_URL}/unsubscribe">এখানে ক্লিক করুন</a></p>
    </div>
  </div>
</body>
</html>
`;

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
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:10px 0;font-weight:600;color:#111827;">${item.name} ${item.color && item.color !== 'Default' ? `(${item.color})` : ''} x${item.quantity}</td>
      <td style="padding:10px 0;text-align:right;font-weight:700;color:#e11d48;">৳${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <div style="background:#fef2f2;border-left:4px solid #e11d48;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
      <h2 style="margin:0 0 4px;font-size:1.2rem;color:#9f1239;">🎉 অর্ডার সফলভাবে গৃহীত হয়েছে!</h2>
      <p style="margin:0;font-size:0.88rem;color:#be123c;">অর্ডার নম্বর: <strong>${order.id}</strong></p>
    </div>

    <p>প্রিয় <strong>${order.customer}</strong>,</p>
    <p><strong>${STORE_NAME}</strong>-এ কেনাকাটার জন্য আপনাকে ধন্যবাদ! আপনার অর্ডারটি সফলভাবে আমাদের সিস্টেমে প্রসেস হচ্ছে।</p>

    <h3 style="font-size:1rem;margin:20px 0 10px;color:#111827;border-bottom:2px solid #f3f4f6;padding-bottom:6px;">📦 অর্ডারের বিবরণ</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="border-bottom:2px solid #e5e7eb;text-align:left;font-size:0.8rem;color:#6b7280;">
          <th style="padding:6px 0;">পণ্য</th>
          <th style="padding:6px 0;text-align:right;">মূল্য</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || '<tr><td colspan="2" style="padding:10px 0;">পণ্য তালিকা প্রসেসিং এ রয়েছে</td></tr>'}
      </tbody>
    </table>

    <div style="background:#f9fafb;border-radius:8px;padding:14px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.88rem;">
        <span>সাবটোটাল:</span>
        <span style="font-weight:600;">৳${(order.subtotal || order.amount).toFixed(2)}</span>
      </div>
      ${order.deliveryCharge ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.88rem;">
        <span>ডেলিভারি চার্জ:</span>
        <span style="font-weight:600;">৳${order.deliveryCharge.toFixed(2)}</span>
      </div>` : ''}
      ${order.discount ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.88rem;color:#10b981;">
        <span>ডিসকাউন্ট:</span>
        <span style="font-weight:600;">-৳${order.discount.toFixed(2)}</span>
      </div>` : ''}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0;" />
      <div style="display:flex;justify-content:space-between;font-size:1.05rem;font-weight:800;color:#e11d48;">
        <span>সর্বমোট দেয়:</span>
        <span>৳${order.amount.toFixed(2)}</span>
      </div>
    </div>

    <h3 style="font-size:1rem;margin:20px 0 10px;color:#111827;border-bottom:2px solid #f3f4f6;padding-bottom:6px;">📍 ডেলিভারি ঠিকানা</h3>
    <p style="margin:4px 0;font-size:0.88rem;color:#374151;"><strong>গ্রহীতা:</strong> ${order.customer}</p>
    <p style="margin:4px 0;font-size:0.88rem;color:#374151;"><strong>মোবাইল:</strong> ${order.phone || 'N/A'}</p>
    <p style="margin:4px 0;font-size:0.88rem;color:#374151;"><strong>ঠিকানা:</strong> ${order.address || ''} ${order.thana ? `, ${order.thana}` : ''} ${order.city ? `, ${order.city}` : ''}</p>
    <p style="margin:4px 0;font-size:0.88rem;color:#374151;"><strong>পেমেন্ট মেথড:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>

    <hr class="divider" />
    <p style="font-size:0.85rem;color:#6b7280;text-align:center;">যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন। ধন্যবাদ!</p>
  `;

  const htmlBody = emailTemplate(content);
  const subjectText = `🛍️ আপনার অর্ডার কনফার্ম হয়েছে! (অর্ডার #${order.id}) — ${STORE_NAME}`;

  // 1. Attempt sending via Brevo API v3 if BREVO_API_KEY is present
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '';
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: STORE_NAME, email: EMAIL_USER },
          to: [{ email: order.email, name: order.customer || 'Customer' }],
          subject: subjectText,
          htmlContent: htmlBody
        })
      });

      if (response.ok) {
        console.log(`[EmailService - Brevo API] Email sent successfully to: ${order.email}`);
        return true;
      } else {
        const errRes = await response.json().catch(() => ({}));
        console.error('[EmailService - Brevo API] Brevo returned error:', errRes);
      }
    } catch (err: any) {
      console.error('[EmailService - Brevo API] Failed to send via Brevo:', err.message || err);
    }
  }

  // 2. Direct Nodemailer Gmail SMTP Execution
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
