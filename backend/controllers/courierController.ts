import { Request, Response } from 'express';
import db from '../config/db';
import { SteadfastService } from '../services/steadfastService';
import { FraudCheckService } from '../services/fraudCheckService';

// Helper to retrieve Steadfast Credentials from Database / System Settings
const getSteadfastCredentials = (): Promise<{ apiKey: string; secretKey: string; enabled: boolean }> => {
  return new Promise((resolve) => {
    db.all(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('steadfast_api_key', 'steadfast_secret_key', 'steadfast_enabled')",
      [],
      (_err, rows: any[]) => {
        let apiKey = process.env.STEADFAST_API_KEY || '79pqokvknppabsrcstiz6kyzlsc9p3zm';
        let secretKey = process.env.STEADFAST_SECRET_KEY || '7lyfy5nakfdkq8x2m2rvkbzr';
        let enabled = true;

        if (rows && rows.length > 0) {
          rows.forEach((row) => {
            if (row.setting_key === 'steadfast_api_key' && row.setting_value) {
              apiKey = row.setting_value;
            }
            if (row.setting_key === 'steadfast_secret_key' && row.setting_value) {
              secretKey = row.setting_value;
            }
            if (row.setting_key === 'steadfast_enabled' && row.setting_value !== undefined) {
              enabled = row.setting_value === '1' || row.setting_value === 'true';
            }
          });
        }
        resolve({ apiKey, secretKey, enabled });
      }
    );
  });
};

const logOrderHistory = (orderId: string, actionType: string, oldValue: string | null, newValue: string | null, performedBy: string) => {
  db.run(
    `INSERT INTO order_history (order_id, action_type, old_value, new_value, performed_by)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, actionType, oldValue, newValue, performedBy]
  );
};

export const sendOrderToSteadfast = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ status: 'error', message: 'Order ID is required' });
    }

    const credentials = await getSteadfastCredentials();
    if (!credentials.apiKey || !credentials.secretKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Steadfast API Key or Secret Key is missing. Please configure courier settings first.'
      });
    }

    // Fetch order details
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], async (err, order: any) => {
      if (err || !order) {
        return res.status(404).json({ status: 'error', message: 'Order not found' });
      }

      // Clean phone number (ensure 11 digits BD phone number format)
      let phone = (order.phone || '').replace(/[^0-9]/g, '');
      if (phone.length > 11 && phone.startsWith('880')) {
        phone = phone.substring(2);
      }

      // Calculate COD Amount (Total Amount minus Paid Amount)
      const codAmount = Math.max(0, Math.round((order.amount || 0) - (order.paid_amount || 0)));

      const payload = {
        invoice: order.id,
        recipient_name: order.customer || 'Customer',
        recipient_phone: phone,
        recipient_address: order.address || 'Address not provided',
        cod_amount: codAmount,
        note: order.customer_note || order.shop_note || `Order #${order.id}`
      };

      try {
        const responseData = await SteadfastService.createOrder(credentials, payload);
        const consignment = responseData.consignment || responseData;

        const consignmentId = consignment.consignment_id ? String(consignment.consignment_id) : null;
        const trackingCode = consignment.tracking_code ? String(consignment.tracking_code) : null;
        const courierStatus = consignment.status || 'in_review';

        // Update database order record
        db.run(
          `UPDATE orders 
           SET consignment_id = ?, tracking_code = ?, courier_status = ?, courier_name = 'Steadfast', status = CASE WHEN status = 'processing' OR status = 'pending' THEN 'shipped' ELSE status END
           WHERE id = ?`,
          [consignmentId, trackingCode, courierStatus, order.id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating order courier info:', updateErr);
            }
            logOrderHistory(order.id, 'courier_dispatch', order.status, 'shipped', 'System (Steadfast Courier)');

            return res.json({
              status: 'success',
              message: 'Order successfully sent to Steadfast Courier',
              data: {
                consignment_id: consignmentId,
                tracking_code: trackingCode,
                courier_status: courierStatus,
                courier_name: 'Steadfast',
                steadfastResponse: responseData
              }
            });
          }
        );
      } catch (apiErr: any) {
        return res.status(500).json({
          status: 'error',
          message: apiErr.message || 'Failed to dispatch order to Steadfast API'
        });
      }
    });
  } catch (error: any) {
    console.error('sendOrderToSteadfast controller error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
  }
};

export const bulkSendToSteadfast = async (req: Request, res: Response) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'orderIds must be a non-empty array' });
    }

    const credentials = await getSteadfastCredentials();
    if (!credentials.apiKey || !credentials.secretKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Steadfast API Key or Secret Key is missing in courier settings'
      });
    }

    const placeholders = orderIds.map(() => '?').join(',');
    db.all(`SELECT * FROM orders WHERE id IN (${placeholders})`, orderIds, async (err, orders: any[]) => {
      if (err || !orders || orders.length === 0) {
        return res.status(404).json({ status: 'error', message: 'No matching orders found' });
      }

      const payloadList = orders.map((order) => {
        let phone = (order.phone || '').replace(/[^0-9]/g, '');
        if (phone.length > 11 && phone.startsWith('880')) {
          phone = phone.substring(2);
        }
        const codAmount = Math.max(0, Math.round((order.amount || 0) - (order.paid_amount || 0)));
        return {
          invoice: order.id,
          recipient_name: order.customer || 'Customer',
          recipient_phone: phone,
          recipient_address: order.address || 'Address not provided',
          cod_amount: codAmount,
          note: order.customer_note || order.shop_note || `Order #${order.id}`
        };
      });

      try {
        const responseData = await SteadfastService.bulkCreateOrders(credentials, payloadList);
        
        // Update database records
        orders.forEach((order) => {
          db.run(
            `UPDATE orders 
             SET courier_name = 'Steadfast', courier_status = 'in_review', status = CASE WHEN status = 'processing' OR status = 'pending' THEN 'shipped' ELSE status END 
             WHERE id = ?`,
            [order.id]
          );
          logOrderHistory(order.id, 'courier_bulk_dispatch', order.status, 'shipped', 'System (Steadfast Courier)');
        });

        res.json({
          status: 'success',
          message: `Successfully dispatched ${orders.length} orders to Steadfast Courier`,
          data: responseData
        });
      } catch (apiErr: any) {
        res.status(500).json({ status: 'error', message: apiErr.message || 'Bulk dispatch failed' });
      }
    });
  } catch (error: any) {
    console.error('bulkSendToSteadfast controller error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
  }
};

export const getSteadfastStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const credentials = await getSteadfastCredentials();

    if (!credentials.apiKey || !credentials.secretKey) {
      return res.status(400).json({ status: 'error', message: 'Steadfast credentials missing' });
    }

    db.get('SELECT * FROM orders WHERE id = ?', [id], async (err, order: any) => {
      if (err || !order) {
        return res.status(404).json({ status: 'error', message: 'Order not found' });
      }

      const lookupCode = order.tracking_code || order.id;

      try {
        let statusData;
        if (order.tracking_code) {
          statusData = await SteadfastService.getStatusByTrackingCode(credentials, order.tracking_code);
        } else {
          statusData = await SteadfastService.getStatusByInvoice(credentials, order.id);
        }

        const deliveryStatus = statusData?.delivery_status || statusData?.status || 'unknown';

        db.run('UPDATE orders SET courier_status = ? WHERE id = ?', [deliveryStatus, order.id]);

        return res.json({
          status: 'success',
          data: {
            orderId: order.id,
            trackingCode: order.tracking_code,
            consignmentId: order.consignment_id,
            courierStatus: deliveryStatus,
            steadfastData: statusData
          }
        });
      } catch (apiErr: any) {
        return res.status(500).json({ status: 'error', message: apiErr.message || 'Status check failed' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
  }
};

export const getSteadfastBalance = async (_req: Request, res: Response) => {
  try {
    const credentials = await getSteadfastCredentials();

    if (!credentials.apiKey || !credentials.secretKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Steadfast credentials not configured'
      });
    }

    const balanceData = await SteadfastService.getBalance(credentials);
    return res.json({
      status: 'success',
      data: balanceData
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to connect to Steadfast Courier'
    });
  }
};

export const checkUniversalFraud = async (req: Request, res: Response) => {
  try {
    const rawPhone = req.params.phone || req.query.phone;
    const phone = Array.isArray(rawPhone) ? String(rawPhone[0]) : String(rawPhone || '');
    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Mobile phone number is required for fraud check' });
    }

    const credentials = await getSteadfastCredentials();
    const report = await FraudCheckService.getAggregatedFraudReport(phone, credentials);

    // Update customer risk score in database if customer exists with this phone
    const cleanPhone = FraudCheckService.sanitizePhone(phone);
    db.run(
      'UPDATE customers SET risk_score = ? WHERE phone LIKE ? OR phone LIKE ?',
      [report.risk_score, `%${cleanPhone}%`, `%${cleanPhone.substring(1)}%`]
    );

    return res.json({
      status: 'success',
      data: report
    });
  } catch (error: any) {
    console.error('checkUniversalFraud controller error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to perform universal fraud check'
    });
  }
};
