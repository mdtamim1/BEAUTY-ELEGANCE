import { Request, Response } from 'express';
import db from '../config/db';

// Get all coupons
export const getCoupons = (req: Request, res: Response) => {
  db.all(`SELECT * FROM coupons ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error('Failed to get coupons:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows || [] });
  });
};

// Create a new coupon code
export const createCoupon = (req: Request, res: Response) => {
  const { code, type, value, expiry } = req.body;

  if (!code || !type || value === undefined || !expiry) {
    return res.status(400).json({ status: 'error', message: 'All coupon fields are required' });
  }

  const cleanCode = code.trim().toUpperCase();

  db.run(
    `INSERT INTO coupons (code, type, value, expiry, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [cleanCode, type, Number(value), expiry],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ status: 'error', message: 'এই কুপন কোডটি ইতিমধ্যে ডাটাবেজে রয়েছে।' });
        }
        console.error('Failed to create coupon:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      res.json({
        status: 'success',
        data: {
          code: cleanCode,
          type,
          value: Number(value),
          expiry,
          status: 'active'
        }
      });
    }
  );
};

// Delete coupon
export const deleteCoupon = (req: Request, res: Response) => {
  const { code } = req.params;

  db.run(`DELETE FROM coupons WHERE code = ?`, [String(code).toUpperCase()], function (err) {
    if (err) {
      console.error('Failed to delete coupon:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Coupon deleted successfully' });
  });
};

// Validate coupon (Customer checkout validation)
export const validateCoupon = (req: Request, res: Response) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ status: 'error', message: 'Coupon code is required' });
  }

  db.get(`SELECT * FROM coupons WHERE code = ?`, [String(code).trim().toUpperCase()], (err, coupon: any) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    if (!coupon) {
      return res.status(404).json({ status: 'error', message: 'দুঃখিত, কুপন কোডটি সঠিক নয়।' });
    }

    if (coupon.status !== 'active') {
      return res.status(400).json({ status: 'error', message: 'এই কুপন কোডটি এখন সচল নেই।' });
    }

    const expiryTime = new Date(coupon.expiry).getTime() + (24 * 3600 * 1000); // Expiry day end
    if (expiryTime < Date.now()) {
      // Mark as expired in DB
      db.run("UPDATE coupons SET status = 'expired' WHERE code = ?", [coupon.code]);
      return res.status(400).json({ status: 'error', message: 'এই কুপন কোডটির মেয়াদ শেষ হয়ে গেছে।' });
    }

    res.json({
      status: 'success',
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      }
    });
  });
};

// Get subscribers list
export const getSubscribers = (req: Request, res: Response) => {
  db.all(`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error('Failed to get subscribers:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows || [] });
  });
};

// Public: Subscribe email
export const subscribeEmail = (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ status: 'error', message: 'সঠিক ইমেইল এড্রেস প্রদান করুন।' });
  }

  const cleanEmail = email.trim().toLowerCase();

  db.run(
    `INSERT INTO newsletter_subscribers (email, status)
     VALUES (?, 'subscribed')`,
    [cleanEmail],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ status: 'error', message: 'আপনি ইতিমধ্যে আমাদের নিউজলেটারে সাবস্ক্রাইব করেছেন!' });
        }
        console.error('Failed to subscribe email:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      res.json({ status: 'success', message: 'নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে! ধন্যবাদ।' });
    }
  );
};

// Delete subscriber from log
export const deleteSubscriber = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run(`DELETE FROM newsletter_subscribers WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Failed to delete subscriber:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Subscriber removed' });
  });
};

// Get all campaigns from SQLite database
export const getCampaigns = (req: Request, res: Response) => {
  db.all(`SELECT * FROM campaigns`, [], (err, rows: any[]) => {
    if (err) {
      console.error('Failed to get campaigns:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    const mapped = (rows || []).map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      status: r.status,
      sent: Number(r.sent || 0),
      opened: Number(r.opened || 0),
      clicked: Number(r.clicked || 0),
      converted: Number(r.converted || 0),
      revenue: Number(r.revenue || 0.0),
      startDate: r.start_date || '',
      endDate: r.end_date || '',
      productIds: r.product_ids ? r.product_ids.split(',').filter(Boolean) : []
    }));
    res.json({ status: 'success', data: mapped });
  });
};

// Create a new campaign inside SQLite database
export const createCampaign = (req: Request, res: Response) => {
  const { id, name, type, status, sent, opened, clicked, converted, revenue, startDate, endDate, productIds } = req.body;

  if (!id || !name || !type) {
    return res.status(400).json({ status: 'error', message: 'Campaign ID, name, and type are required' });
  }

  const productIdsStr = Array.isArray(productIds) ? productIds.join(',') : '';

  db.run(
    `INSERT INTO campaigns (id, name, type, status, sent, opened, clicked, converted, revenue, start_date, end_date, product_ids)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      type,
      status || 'active',
      sent || 0,
      opened || 0,
      clicked || 0,
      converted || 0,
      revenue || 0.0,
      startDate || '',
      endDate || '',
      productIdsStr
    ],
    function (err) {
      if (err) {
        console.error('Failed to create campaign:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      res.json({ 
        status: 'success', 
        data: { 
          id, name, type, status: status || 'active', sent: sent || 0, opened: opened || 0, clicked: clicked || 0, converted: converted || 0, revenue: revenue || 0.0, startDate, endDate, productIds 
        } 
      });
    }
  );
};

// Update campaign status in SQLite database
export const updateCampaign = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ status: 'error', message: 'Status is required' });
  }

  db.run(`UPDATE campaigns SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) {
      console.error('Failed to update campaign:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Campaign status updated' });
  });
};

// Delete campaign from SQLite database
export const deleteCampaign = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run(`DELETE FROM campaigns WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Failed to delete campaign:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Campaign deleted' });
  });
};

const DEFAULT_SPIN_WHEEL_CONFIG = {
  enabled: true,
  title: 'ঘুরে জিতুন স্পেশাল ডিসকাউন্ট!',
  subtitle: 'আজকের সৌভাগ্যজনক কুপন কোড জিততে চাকাটি ঘোরান!',
  slices: [
    { id: '1', label: '10% OFF', coupon_code: 'SPIN10', type: 'percentage', value: 10, weight: 40, color: '#7c3aed' },
    { id: '2', label: '৳100 OFF', coupon_code: 'SPIN100', type: 'fixed', value: 100, weight: 30, color: '#059669' },
    { id: '3', label: '15% OFF', coupon_code: 'VIP15', type: 'percentage', value: 15, weight: 15, color: '#d97706' },
    { id: '4', label: 'Free Delivery', coupon_code: 'FREEDEL', type: 'fixed', value: 60, weight: 10, color: '#e11d48' },
    { id: '5', label: '25% MEGA', coupon_code: 'MEGA25', type: 'percentage', value: 25, weight: 5, color: '#2563eb' }
  ]
};

export const getSpinWheelConfig = (req: Request, res: Response) => {
  db.get(`SELECT setting_value FROM system_settings WHERE setting_key = 'spin_wheel_settings'`, [], (err, row: any) => {
    if (err) {
      console.error('Error fetching spin wheel config:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    if (!row || !row.setting_value) {
      return res.json({ status: 'success', data: DEFAULT_SPIN_WHEEL_CONFIG });
    }

    try {
      const config = JSON.parse(row.setting_value);
      return res.json({ status: 'success', data: config });
    } catch (e) {
      return res.json({ status: 'success', data: DEFAULT_SPIN_WHEEL_CONFIG });
    }
  });
};

export const spinWheelPlay = (req: Request, res: Response) => {
  db.get(`SELECT setting_value FROM system_settings WHERE setting_key = 'spin_wheel_settings'`, [], (err, row: any) => {
    let config = DEFAULT_SPIN_WHEEL_CONFIG;
    if (row && row.setting_value) {
      try {
        config = JSON.parse(row.setting_value);
      } catch (e) {}
    }

    if (!config.enabled || !config.slices || config.slices.length === 0) {
      return res.status(400).json({ status: 'error', message: 'স্পিন হুইল অফার আপাতত বন্ধ রয়েছে।' });
    }

    const totalWeight = config.slices.reduce((sum: number, s: any) => sum + (Number(s.weight) || 0), 0);
    if (totalWeight <= 0) {
      const defaultSlice = config.slices[0];
      return res.json({ status: 'success', data: defaultSlice, winningIndex: 0 });
    }

    let randomWeight = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < config.slices.length; i++) {
      const sliceWeight = Number(config.slices[i].weight) || 0;
      if (randomWeight < sliceWeight) {
        winningIndex = i;
        break;
      }
      randomWeight -= sliceWeight;
    }

    const winningSlice = config.slices[winningIndex];

    // Ensure coupon exists in database so customer can redeem it
    if (winningSlice && winningSlice.coupon_code) {
      const cleanCode = winningSlice.coupon_code.trim().toUpperCase();
      db.run(
        `INSERT OR IGNORE INTO coupons (code, type, value, expiry, status) VALUES (?, ?, ?, '2030-12-31', 'active')`,
        [cleanCode, winningSlice.type || 'percentage', Number(winningSlice.value) || 10]
      );
    }

    return res.json({
      status: 'success',
      data: winningSlice,
      winningIndex
    });
  });
};

export const updateSpinWheelConfig = (req: Request, res: Response) => {
  const { enabled, title, subtitle, slices } = req.body;

  const newConfig = {
    enabled: enabled !== undefined ? Boolean(enabled) : true,
    title: title || DEFAULT_SPIN_WHEEL_CONFIG.title,
    subtitle: subtitle || DEFAULT_SPIN_WHEEL_CONFIG.subtitle,
    slices: Array.isArray(slices) ? slices : DEFAULT_SPIN_WHEEL_CONFIG.slices
  };

  const jsonVal = JSON.stringify(newConfig);

  // Auto-sync coupons to database
  if (Array.isArray(newConfig.slices)) {
    newConfig.slices.forEach((s: any) => {
      if (s.coupon_code) {
        const code = String(s.coupon_code).trim().toUpperCase();
        db.run(
          `INSERT OR IGNORE INTO coupons (code, type, value, expiry, status) VALUES (?, ?, ?, '2030-12-31', 'active')`,
          [code, s.type || 'percentage', Number(s.value) || 10]
        );
      }
    });
  }

  db.run(
    `INSERT OR REPLACE INTO system_settings (setting_key, setting_value, group_name, is_public)
     VALUES ('spin_wheel_settings', ?, 'marketing', 1)`,
    [jsonVal],
    function (err) {
      if (err) {
        console.error('Failed to update spin wheel config:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      res.json({ status: 'success', message: 'স্পিন হুইল সেটিংস সফলভাবে সেভ করা হয়েছে!', data: newConfig });
    }
  );
};
