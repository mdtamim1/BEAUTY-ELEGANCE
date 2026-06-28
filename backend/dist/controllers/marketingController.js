import db from '../config/db';
// Get all coupons
export const getCoupons = (req, res) => {
    db.all(`SELECT * FROM coupons ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            console.error('Failed to get coupons:', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', data: rows || [] });
    });
};
// Create a new coupon code
export const createCoupon = (req, res) => {
    const { code, type, value, expiry } = req.body;
    if (!code || !type || value === undefined || !expiry) {
        return res.status(400).json({ status: 'error', message: 'All coupon fields are required' });
    }
    const cleanCode = code.trim().toUpperCase();
    db.run(`INSERT INTO coupons (code, type, value, expiry, status)
     VALUES (?, ?, ?, ?, 'active')`, [cleanCode, type, Number(value), expiry], function (err) {
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
    });
};
// Delete coupon
export const deleteCoupon = (req, res) => {
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
export const validateCoupon = (req, res) => {
    const { code } = req.params;
    if (!code) {
        return res.status(400).json({ status: 'error', message: 'Coupon code is required' });
    }
    db.get(`SELECT * FROM coupons WHERE code = ?`, [String(code).trim().toUpperCase()], (err, coupon) => {
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
export const getSubscribers = (req, res) => {
    db.all(`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            console.error('Failed to get subscribers:', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', data: rows || [] });
    });
};
// Public: Subscribe email
export const subscribeEmail = (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ status: 'error', message: 'সঠিক ইমেইল এড্রেস প্রদান করুন।' });
    }
    const cleanEmail = email.trim().toLowerCase();
    db.run(`INSERT INTO newsletter_subscribers (email, status)
     VALUES (?, 'subscribed')`, [cleanEmail], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ status: 'error', message: 'আপনি ইতিমধ্যে আমাদের নিউজলেটারে সাবস্ক্রাইব করেছেন!' });
            }
            console.error('Failed to subscribe email:', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', message: 'নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে! ধন্যবাদ।' });
    });
};
// Delete subscriber from log
export const deleteSubscriber = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM newsletter_subscribers WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Failed to delete subscriber:', err);
            return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', message: 'Subscriber removed' });
    });
};
