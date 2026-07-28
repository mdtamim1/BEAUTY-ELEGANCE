import { Request, Response } from 'express';
import db from '../config/db';

const keyMapToCamel: Record<string, string> = {
  site_name: 'siteName',
  site_url: 'siteUrl',
  timezone: 'timezone',
  currency: 'currency',
  maintenance_mode: 'maintenanceMode',
  email_provider: 'emailProvider',
  smtp_host: 'smtpHost',
  smtp_port: 'smtpPort',
  smtp_user: 'smtpUser',
  smtp_pass: 'smtpPass',
  payment_bkash: 'paymentBkash',
  payment_nagad: 'paymentNagad',
  payment_sslcommerz: 'paymentSslCommerz',
  payment_cod: 'paymentCod',
  shipping_pathao: 'shippingPathao',
  shipping_steadfast: 'shippingSteadfast',
  shipping_redx: 'shippingRedx',
  steadfast_api_key: 'steadfastApiKey',
  steadfast_secret_key: 'steadfastSecretKey',
  steadfast_enabled: 'steadfastEnabled',
  redx_token: 'redxToken',
  carrybee_client_id: 'carrybeeClientId',
  carrybee_client_secret: 'carrybeeClientSecret',
  pathao_client_id: 'pathaoClientId',
  pathao_client_secret: 'pathaoClientSecret',
  pathao_username: 'pathaoUsername',
  pathao_password: 'pathaoPassword',
  paperfly_key: 'paperflyKey',
  couriercheck_api_key: 'couriercheckApiKey',
  cache_driver: 'cacheDriver',
  cache_ttl: 'cacheTTL',
};

const keyMapToSnake: Record<string, string> = {
  siteName: 'site_name',
  siteUrl: 'site_url',
  timezone: 'timezone',
  currency: 'currency',
  maintenanceMode: 'maintenance_mode',
  emailProvider: 'email_provider',
  smtpHost: 'smtp_host',
  smtpPort: 'smtp_port',
  smtpUser: 'smtp_user',
  smtpPass: 'smtp_pass',
  paymentBkash: 'payment_bkash',
  paymentNagad: 'payment_nagad',
  paymentSslCommerz: 'payment_sslcommerz',
  paymentCod: 'payment_cod',
  shippingPathao: 'shipping_pathao',
  shippingSteadfast: 'shipping_steadfast',
  shippingRedx: 'shipping_redx',
  steadfastApiKey: 'steadfast_api_key',
  steadfastSecretKey: 'steadfast_secret_key',
  steadfastEnabled: 'steadfast_enabled',
  redxToken: 'redx_token',
  carrybeeClientId: 'carrybee_client_id',
  carrybeeClientSecret: 'carrybee_client_secret',
  pathaoClientId: 'pathao_client_id',
  pathaoClientSecret: 'pathao_client_secret',
  pathaoUsername: 'pathao_username',
  pathaoPassword: 'pathao_password',
  paperflyKey: 'paperfly_key',
  couriercheckApiKey: 'couriercheck_api_key',
  cacheDriver: 'cache_driver',
  cacheTTL: 'cache_ttl',
};

export const getSettings = (req: Request, res: Response) => {
  db.all('SELECT setting_key, setting_value FROM system_settings', [], (err, rows: any[]) => {
    if (err) {
      console.error('Failed to load system settings:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    const settingsObj: Record<string, any> = {
      // default fallbacks for safety
      siteName: 'VIP Commerce Control Center',
      siteUrl: 'https://admin.vipcommerce.com',
      timezone: 'Asia/Dhaka (GMT+6)',
      currency: 'BDT (৳)',
      maintenanceMode: false,
      emailProvider: 'SendGrid',
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      smtpUser: 'apikey',
      smtpPass: '••••••••••••••••••••',
      paymentBkash: true,
      paymentNagad: true,
      paymentSslCommerz: false,
      paymentCod: true,
      shippingPathao: true,
      shippingSteadfast: true,
      shippingRedx: false,
      steadfastApiKey: process.env.STEADFAST_API_KEY || '79pqokvknppabsrcstiz6kyzlsc9p3zm',
      steadfastSecretKey: process.env.STEADFAST_SECRET_KEY || '7lyfy5nakfdkq8x2m2rvkbzr',
      steadfastEnabled: true,
      cacheDriver: 'Redis',
      cacheHitRate: 94.2,
      cacheSize: '2.4 GB',
      cacheTTL: 3600,
    };

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        const camelKey = keyMapToCamel[row.setting_key];
        if (camelKey) {
          let val: any = row.setting_value;
          if (
            camelKey === 'maintenanceMode' ||
            camelKey === 'paymentBkash' ||
            camelKey === 'paymentNagad' ||
            camelKey === 'paymentSslCommerz' ||
            camelKey === 'paymentCod' ||
            camelKey === 'shippingPathao' ||
            camelKey === 'shippingSteadfast' ||
            camelKey === 'shippingRedx' ||
            camelKey === 'steadfastEnabled'
          ) {
            val = val === '1' || val === 'true';
          } else if (camelKey === 'smtpPort' || camelKey === 'cacheTTL') {
            val = parseInt(val) || (camelKey === 'smtpPort' ? 587 : 3600);
          }
          settingsObj[camelKey] = val;
        }
      });
    }

    res.json({ status: 'success', data: settingsObj });
  });
};

export const updateSettings = (req: Request, res: Response) => {
  const settingsData = req.body;
  const keys = Object.keys(settingsData).filter(k => keyMapToSnake[k]);

  if (keys.length === 0) {
    return res.json({ status: 'success', message: 'System settings updated successfully (no changes)' });
  }

  const dbType = process.env.DB_TYPE || 'sqlite';
  const isSqlite = dbType === 'sqlite';

  const startTx = (cb: (err: any) => void) => {
    if (isSqlite) {
      db.run('BEGIN TRANSACTION', cb);
    } else {
      cb(null);
    }
  };

  const commitTx = (cb: (err: any) => void) => {
    if (isSqlite) {
      db.run('COMMIT', cb);
    } else {
      cb(null);
    }
  };

  const rollbackTx = (cb: () => void) => {
    if (isSqlite) {
      db.run('ROLLBACK', () => cb());
    } else {
      cb();
    }
  };

  startTx((txErr) => {
    if (txErr) {
      console.error('Failed to start transaction:', txErr);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    let index = 0;
    const updateNext = () => {
      if (index === keys.length) {
        commitTx((commitErr) => {
          if (commitErr) {
            console.error('Failed to commit transaction:', commitErr);
            rollbackTx(() => {
              res.status(500).json({ status: 'error', message: 'Failed to commit system settings' });
            });
            return;
          }
          res.json({ status: 'success', message: 'System settings updated successfully' });
        });
        return;
      }

      const camelKey = keys[index];
      const snakeKey = keyMapToSnake[camelKey];
      let val = settingsData[camelKey];
      if (typeof val === 'boolean') {
        val = val ? '1' : '0';
      } else {
        val = String(val);
      }

      // Dynamically update process.env for courier keys
      if (snakeKey === 'couriercheck_api_key') process.env.COURIERCHECK_API_KEY = val;
      if (snakeKey === 'pathao_client_id') process.env.PATHAO_CLIENT_ID = val;
      if (snakeKey === 'pathao_client_secret') process.env.PATHAO_CLIENT_SECRET = val;
      if (snakeKey === 'pathao_username') process.env.PATHAO_USERNAME = val;
      if (snakeKey === 'pathao_password') process.env.PATHAO_PASSWORD = val;
      if (snakeKey === 'steadfast_api_key') process.env.STEADFAST_API_KEY = val;
      if (snakeKey === 'steadfast_secret_key') process.env.STEADFAST_SECRET_KEY = val;

      db.run(
        `INSERT OR REPLACE INTO system_settings (setting_key, setting_value) VALUES (?, ?)`,
        [snakeKey, val],
        (err) => {
          if (err) {
            console.error(`Failed to update setting key ${snakeKey}:`, err);
            rollbackTx(() => {
              res.status(500).json({ status: 'error', message: 'Failed to update system settings' });
            });
            return;
          }
          index++;
          updateNext();
        }
      );
    };

    updateNext();
  });
};

export const getStorefrontSettings = (req: Request, res: Response) => {
  db.get(
    "SELECT setting_value FROM system_settings WHERE setting_key = 'storefront_config'",
    [],
    (err, row: any) => {
      if (err) {
        console.error('Failed to load storefront settings:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      if (!row || !row.setting_value) {
        return res.json({ status: 'success', data: null });
      }
      try {
        const data = JSON.parse(row.setting_value);
        res.json({ status: 'success', data });
      } catch (e) {
        res.status(500).json({ status: 'error', message: 'Failed to parse storefront settings' });
      }
    }
  );
};

export const updateStorefrontSettings = (req: Request, res: Response) => {
  const configString = JSON.stringify(req.body);
  db.run(
    "INSERT OR REPLACE INTO system_settings (setting_key, setting_value, group_name, is_public) VALUES ('storefront_config', ?, 'storefront', 1)",
    [configString],
    (err) => {
      if (err) {
        console.error('Failed to update storefront settings:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      res.json({ status: 'success', message: 'Storefront settings updated successfully' });
    }
  );
};

