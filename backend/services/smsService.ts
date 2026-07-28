export interface SMSOrderDetails {
  orderId: string;
  customerName: string;
  amount: number;
  itemsCount: number;
  paymentMethod?: string;
}

/**
 * Sanitizes phone number to standard Bangladesh 11-digit mobile number format
 */
export const sanitizeBDPhone = (phone: string): string => {
  let clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.length > 11 && clean.startsWith('880')) {
    clean = clean.substring(2);
  }
  if (clean.length === 10 && clean.startsWith('1')) {
    clean = '0' + clean;
  }
  return clean;
};

/**
 * Sends an instant SMS notification to customer upon order placement
 */
export const sendOrderSMS = async (
  phone: string,
  details: SMSOrderDetails
): Promise<boolean> => {
  const cleanPhone = sanitizeBDPhone(phone);
  if (!cleanPhone || cleanPhone.length !== 11) {
    console.warn(`[SMSService] Invalid phone number provided: ${phone}, skipping SMS.`);
    return false;
  }

  const storeName = process.env.STORE_NAME || 'Tamim Global';
  const smsMessage = `Prio ${details.customerName || 'Customer'}, apnar order ID ${details.orderId} (${storeName}) safolbhabe grohon kora hoyeche! Mot taka: Tk ${details.amount}. Dhonnobad!`;

  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || '';
  const recipientNumber = `+88${cleanPhone}`;

  // 1. Attempt sending Transactional SMS via Brevo SMS API if BREVO_API_KEY is available
  if (brevoApiKey) {
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: 'TamimGlobal',
          recipient: recipientNumber,
          content: smsMessage,
          type: 'transactional'
        })
      });

      const resJson: any = await brevoRes.json().catch(() => ({}));
      if (brevoRes.ok) {
        console.log(`[SMSService - Brevo SMS] Instant SMS sent to ${recipientNumber} | MessageID:`, resJson.messageId || resJson.reference);
        return true;
      } else {
        console.warn(`[SMSService - Brevo SMS] Brevo API message:`, resJson.message || resJson.code || resJson);
      }
    } catch (e: any) {
      console.error(`[SMSService - Brevo SMS] Failed to send via Brevo SMS API:`, e.message || e);
    }
  }

  // 2. Attempt sending via BulkSMS BD / Generic SMS Gateway API
  const smsApiKey = process.env.SMS_API_KEY || process.env.BULKSMS_API_KEY || '';
  const smsSenderId = process.env.SMS_SENDER_ID || process.env.BULKSMS_SENDER_ID || storeName;

  if (!smsApiKey) {
    console.log(`[SMSService] 📱 INSTANT SMS TRIGGERED (Simulation Mode):`);
    console.log(` ➔ To: ${recipientNumber}`);
    console.log(` ➔ Message: "${smsMessage}"`);
    return true;
  }

  try {
    const response = await fetch('https://api.bulksmsbd.net/v2/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: smsApiKey,
        sender_id: smsSenderId,
        number: cleanPhone,
        message: smsMessage
      })
    });

    const resData: any = await response.json().catch(() => ({}));
    console.log(`[SMSService] Instant SMS sent to ${recipientNumber} | Response:`, resData);
    return true;
  } catch (err: any) {
    console.error(`[SMSService] Failed to send SMS to ${recipientNumber}:`, err.message || err);
    return false;
  }
};
