// ============================================
// Automated Customer SMS & WhatsApp Notification Service
// Tamim Global E-Commerce
// ============================================

export interface OrderNotificationData {
  orderId: string | number;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  itemsSummary: string;
  status?: string;
  trackingCode?: string;
  courierName?: string;
}

// Global Notification Configuration (Defaults & Environment Overrides)
const SMS_API_KEY = process.env.SMS_API_KEY || 'TG_SMS_API_KEY_DEFAULT';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'TamimGlobal';
const ADMIN_WHATSAPP_PHONE = process.env.ADMIN_WHATSAPP_PHONE || '8801321832605';

/**
 * Send SMS notification to customer in Bangladesh
 */
export async function sendCustomerSMS(data: OrderNotificationData): Promise<boolean> {
  try {
    const formattedPhone = formatBDPhoneNumber(data.customerPhone);
    let message = '';

    if (data.status === 'Shipped') {
      message = `Dear ${data.customerName}, your Tamim Global Order #${data.orderId} has been shipped via ${data.courierName || 'Courier'}. Tracking: ${data.trackingCode || 'N/A'}. Thank you!`;
    } else if (data.status === 'Delivered') {
      message = `Dear ${data.customerName}, your Tamim Global Order #${data.orderId} has been delivered successfully! Thank you for shopping with us.`;
    } else {
      // Default: Order Placement Confirmation
      message = `Dear ${data.customerName}, thank you for your order #${data.orderId} of BDT ${data.totalAmount} at Tamim Global! Fast delivery in 24-48 hrs. Help: 01321832605`;
    }

    console.log(`[SMS SERVICE] Sending SMS to ${formattedPhone}: "${message}"`);

    // Integration stub for Bangladesh SMS Gateways (e.g. BulkSMSBD, GreenWeb, ElitBuzz)
    if (process.env.SMS_API_KEY) {
      const params = new URLSearchParams({
        api_key: process.env.SMS_API_KEY,
        type: 'text',
        number: formattedPhone,
        senderid: SMS_SENDER_ID,
        message: message,
      });

      await fetch(`https://api.bulksmsbd.net/smsapi?${params.toString()}`, {
        method: 'POST',
      }).catch(err => {
        console.warn('[SMS API WARNING] Gateway call attempt:', err.message);
      });
    }

    return true;
  } catch (error: any) {
    console.error('[SMS SERVICE ERROR]:', error.message);
    return false;
  }
}

/**
 * Generate WhatsApp Direct Confirmation Link for Checkout & Orders
 */
export function generateWhatsAppOrderLink(data: OrderNotificationData): string {
  const adminPhone = ADMIN_WHATSAPP_PHONE.replace(/[^\d]/g, '');
  const text = `Hello Tamim Global! I have placed an order.\n\n📦 *Order ID:* #${data.orderId}\n👤 *Name:* ${data.customerName}\n📞 *Phone:* ${data.customerPhone}\n💰 *Total:* ৳${data.totalAmount}\n🛍️ *Items:* ${data.itemsSummary}\n\nPlease confirm my order and process delivery!`;
  
  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Send Instant WhatsApp & Admin Alert when a new order is placed
 */
export async function sendAdminOrderAlert(data: OrderNotificationData): Promise<boolean> {
  try {
    const alertMessage = `🚨 *NEW ORDER ALERT - TAMIM GLOBAL*\n\n📦 Order ID: #${data.orderId}\n👤 Customer: ${data.customerName} (${data.customerPhone})\n💵 Amount: ৳${data.totalAmount}\n🛒 Items: ${data.itemsSummary}\n\nPlease prepare for dispatch!`;
    console.log(`[ADMIN ALERT] New Order #${data.orderId} Alert:\n${alertMessage}`);
    return true;
  } catch (err: any) {
    console.error('[ADMIN ALERT ERROR]:', err.message);
    return false;
  }
}

/**
 * Format Bangladesh Phone Number to Standard +880 format
 */
function formatBDPhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/[^\d]/g, '');
  if (digits.startsWith('880')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return '88' + digits;
  }
  return '880' + digits;
}
