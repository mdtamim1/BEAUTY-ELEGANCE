const STEADFAST_BASE_URL = process.env.STEADFAST_BASE_URL || 'https://portal.packzy.com/api/v1';

export interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
}

export interface CreateOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export class SteadfastService {
  private static getHeaders(apiKey: string, secretKey: string) {
    return {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      'Content-Type': 'application/json'
    };
  }

  public static async createOrder(credentials: SteadfastCredentials, payload: CreateOrderPayload) {
    try {
      const response = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
        method: 'POST',
        headers: this.getHeaders(credentials.apiKey, credentials.secretKey),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.errors || 'Failed to create Steadfast order');
      }
      return data;
    } catch (error: any) {
      console.error('Steadfast createOrder error:', error.message);
      throw new Error(error.message || 'Failed to create Steadfast order');
    }
  }

  public static async bulkCreateOrders(credentials: SteadfastCredentials, payloadList: CreateOrderPayload[]) {
    try {
      const response = await fetch(`${STEADFAST_BASE_URL}/create_order/bulk-order`, {
        method: 'POST',
        headers: this.getHeaders(credentials.apiKey, credentials.secretKey),
        body: JSON.stringify({ data: payloadList })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to bulk create Steadfast orders');
      }
      return data;
    } catch (error: any) {
      console.error('Steadfast bulkCreateOrders error:', error.message);
      throw new Error(error.message || 'Failed to bulk create Steadfast orders');
    }
  }

  public static async getStatusByInvoice(credentials: SteadfastCredentials, invoiceId: string) {
    try {
      const response = await fetch(`${STEADFAST_BASE_URL}/status_by_invoice/${invoiceId}`, {
        headers: this.getHeaders(credentials.apiKey, credentials.secretKey)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch status by invoice');
      }
      return data;
    } catch (error: any) {
      console.error('Steadfast getStatusByInvoice error:', error.message);
      throw new Error(error.message || 'Failed to fetch status by invoice');
    }
  }

  public static async getStatusByTrackingCode(credentials: SteadfastCredentials, trackingCode: string) {
    try {
      const response = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`, {
        headers: this.getHeaders(credentials.apiKey, credentials.secretKey)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch status by tracking code');
      }
      return data;
    } catch (error: any) {
      console.error('Steadfast getStatusByTrackingCode error:', error.message);
      throw new Error(error.message || 'Failed to fetch status by tracking code');
    }
  }

  public static async getBalance(credentials: SteadfastCredentials) {
    try {
      const response = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
        headers: this.getHeaders(credentials.apiKey, credentials.secretKey)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch Steadfast balance');
      }
      return data;
    } catch (error: any) {
      console.error('Steadfast getBalance error:', error.message);
      throw new Error(error.message || 'Failed to fetch Steadfast balance');
    }
  }
}
