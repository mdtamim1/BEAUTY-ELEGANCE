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
