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
  cache_driver: 'cacheDriver',
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
  cacheDriver: 'cache_driver',
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
      cacheDriver: 'Redis',
      cacheHitRate: 94.2,
      cacheSize: '2.4 GB',
    };

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        const camelKey = keyMapToCamel[row.setting_key];
        if (camelKey) {
          let val: any = row.setting_value;
          if (camelKey === 'maintenanceMode') {
            val = val === '1' || val === 'true';
          } else if (camelKey === 'smtpPort') {
            val = parseInt(val) || 587;
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

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO system_settings (setting_key, setting_value)
      VALUES (?, ?)
    `);

    const keys = Object.keys(settingsData).filter(k => keyMapToSnake[k]);
    if (keys.length === 0) {
      db.run('COMMIT');
      return res.json({ status: 'success', message: 'System settings updated successfully (no changes)' });
    }

    let completed = 0;
    let hasError = false;

    keys.forEach(camelKey => {
      const snakeKey = keyMapToSnake[camelKey];
      let val = settingsData[camelKey];
      if (typeof val === 'boolean') {
        val = val ? '1' : '0';
      } else {
        val = String(val);
      }

      stmt.run([snakeKey, val], (err) => {
        if (err) {
          console.error(`Failed to update setting key ${snakeKey}:`, err);
          hasError = true;
        }
        completed++;
        if (completed === keys.length) {
          stmt.finalize((finalErr) => {
            if (finalErr || hasError) {
              db.run('ROLLBACK');
              return res.status(500).json({ status: 'error', message: 'Failed to update system settings' });
            }

            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ status: 'error', message: 'Failed to commit settings update' });
              }
              res.json({ status: 'success', message: 'System settings updated successfully' });
            });
          });
        }
      });
    });
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

