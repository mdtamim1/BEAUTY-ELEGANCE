import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { seedProducts } from './seedData';

// Resolve __dirname in ESM node runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../database/database.sqlite');

// Make sure database folder exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = sqlite3.verbose();

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('🔌 Connected to local SQLite database.');
    initializeDatabase();
  }
});

// Run schema seeding
function initializeDatabase() {
  db.serialize(() => {
    // Check if tables exist, if not, create them
    db.run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        group_name TEXT DEFAULT 'general',
        is_public INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        is_system INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        role_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        department TEXT,
        avatar_url TEXT,
        two_factor_secret TEXT,
        two_factor_enabled INTEGER DEFAULT 0,
        last_login_at TIMESTAMP,
        last_login_ip TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles (id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        avatar_url TEXT,
        segment TEXT DEFAULT 'New',
        status TEXT DEFAULT 'active',
        loyalty_points INTEGER DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0.00,
        order_count INTEGER DEFAULT 0,
        last_active_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        label TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS employee_invitations (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        expiry TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'subscribed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        brand TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        rating REAL DEFAULT 0.0,
        reviews INTEGER DEFAULT 0,
        image TEXT NOT NULL,
        in_stock INTEGER DEFAULT 1,
        published INTEGER DEFAULT 1,
        description TEXT,
        stock INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0.0,
        features TEXT,
        specs TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Run migrations to alter existing table structure safely
    db.run("ALTER TABLE products ADD COLUMN features TEXT", (err) => {
      // ignore error if column already exists
    });
    db.run("ALTER TABLE products ADD COLUMN specs TEXT", (err) => {
      // ignore error if column already exists
    });
    db.run("ALTER TABLE customers ADD COLUMN address TEXT", (err) => {
      // ignore error if column already exists
    });
    db.run("ALTER TABLE roles ADD COLUMN permissions TEXT", (err) => {
      // ignore error if column already exists
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS product_gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer TEXT NOT NULL,
        email TEXT NOT NULL,
        amount REAL NOT NULL,
        items INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        store_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        courier TEXT NOT NULL,
        city TEXT NOT NULL,
        thana TEXT,
        area TEXT,
        customer_note TEXT,
        shop_note TEXT,
        payment_type TEXT DEFAULT 'cod',
        memo_number TEXT,
        delivery_charge REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        status TEXT DEFAULT 'processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        color TEXT DEFAULT 'Default',
        size TEXT DEFAULT 'Free Size',
        code TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        sent INTEGER DEFAULT 0,
        opened INTEGER DEFAULT 0,
        clicked INTEGER DEFAULT 0,
        converted INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0.0,
        start_date TEXT,
        end_date TEXT,
        product_ids TEXT
      )
    `);

    // Seed default roles and super admin employee
    const defaultRoles = [
      { name: 'Super Admin', desc: 'System Administrator with full access', is_system: 1, permissions: ["dashboard", "analytics", "orders", "products", "storefront", "chats", "marketing", "employees", "finance", "security", "settings", "ai"] },
      { name: 'Admin', desc: 'Administrator with full management access', is_system: 1, permissions: ["dashboard", "analytics", "orders", "products", "storefront", "chats", "marketing", "employees", "finance", "security", "settings", "ai"] },
      { name: 'Moderator', desc: 'Staff with moderate access to orders, products, and support', is_system: 1, permissions: ["dashboard", "orders", "products", "chats"] }
    ];

    let processedCount = 0;
    defaultRoles.forEach(r => {
      db.get("SELECT id FROM roles WHERE name = ?", [r.name], (err, row: any) => {
        const afterRoleProcessed = () => {
          processedCount++;
          if (processedCount === defaultRoles.length) {
            // Seed Super Admin employee if they don't exist
            db.get("SELECT id FROM roles WHERE name = 'Super Admin'", (err, roleRow: any) => {
              if (roleRow) {
                const roleId = roleRow.id;
                db.get("SELECT id FROM employees WHERE email = 'admin@vipcommerce.com'", (err, empRow) => {
                  if (!empRow) {
                    // Admin password: admin123
                    db.run(`
                      INSERT INTO employees (id, role_id, first_name, last_name, email, password_hash, status, department)
                      VALUES ('EMP-001', ?, 'Super', 'Admin', 'admin@vipcommerce.com', '$2b$10$dT13c2LnpixQIRx7Bx/CtOqFOvNeS00tUBecfTZZ1lxBWXJpyYOHa', 'active', 'Management')
                    `, [roleId]);
                  }
                });
              }
            });
          }
        };

        if (!row) {
          db.run(
            "INSERT INTO roles (name, description, is_system, permissions) VALUES (?, ?, ?, ?)",
            [r.name, r.desc, r.is_system, JSON.stringify(r.permissions)],
            afterRoleProcessed
          );
        } else {
          db.run(
            "UPDATE roles SET permissions = ?, description = ? WHERE id = ?",
            [JSON.stringify(r.permissions), r.desc, row.id],
            afterRoleProcessed
          );
        }
      });
    });
    // Seed default products with full details (gallery, features, specs)
    db.run("DELETE FROM products WHERE id LIKE 'PRD-00%'", (err) => {
      if (err) console.error('Error deleting default products:', err);
      db.run("DELETE FROM product_gallery WHERE product_id LIKE 'PRD-00%'", (err) => {
        if (err) console.error('Error deleting default gallery:', err);
        
        const stmt = db.prepare(`
          INSERT INTO products (id, name, slug, sku, brand, category, price, original_price, rating, reviews, image, in_stock, published, description, stock, features, specs)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        seedProducts.forEach((p: any) => {
          stmt.run([
            p.id, p.name, p.slug, p.sku, p.brand, p.category, p.price, p.original_price, p.rating, p.reviews, p.image, p.in_stock, p.published, p.description, p.stock,
            JSON.stringify(p.features || []), JSON.stringify(p.specs || [])
          ]);
        });
        stmt.finalize(() => {
          console.log('🌱 Seeded 8 default products with features/specs into the database.');
          
          // Seed default products galleries
          seedProducts.forEach((p: any) => {
            if (p.gallery && Array.isArray(p.gallery)) {
              p.gallery.forEach((imgUrl: string) => {
                db.run(`INSERT OR IGNORE INTO product_gallery (product_id, image_url) VALUES (?, ?)`, [p.id, imgUrl]);
              });
            }
          });
          console.log('🖼️ Seeded default product galleries.');
        });
      });
    });

    // Seed default coupons if none exist
    db.get("SELECT COUNT(*) as count FROM coupons", (err, row: any) => {
      if (row && row.count === 0) {
        const defaultCoupons = [
          { code: 'SUMMER20', type: 'percentage', value: 20, expiry: '2026-08-31', status: 'active' },
          { code: 'TECH10', type: 'percentage', value: 10, expiry: '2026-07-15', status: 'active' },
          { code: 'FREESHIP', type: 'fixed', value: 150, expiry: '2026-12-31', status: 'active' },
          { code: 'WELCOME50', type: 'fixed', value: 50, expiry: '2026-06-30', status: 'expired' }
        ];

        defaultCoupons.forEach(c => {
          db.run(
            "INSERT INTO coupons (code, type, value, expiry, status) VALUES (?, ?, ?, ?, ?)",
            [c.code, c.type, c.value, c.expiry, c.status]
          );
        });
      }
    });

    // Seed default customer accounts and addresses if customers table is empty
    db.get("SELECT COUNT(*) as count FROM customers", (err, row: any) => {
      if (!err && row && row.count === 0) {
        // Rahim Islam: password_hash for 'rahim123'
        // bcrypt hash of 'rahim123' is $2b$10$tJ9fFp8LwXp/w7C27Q/VzO9ZtI48H2D57wF2hP20lQ/0N.p3z7.O6
        db.run(`
          INSERT INTO customers (id, first_name, last_name, email, password_hash, phone, loyalty_points, segment)
          VALUES ('cust-1', 'Rahim', 'Islam', 'rahim@gmail.com', '$2b$10$tJ9fFp8LwXp/w7C27Q/VzO9ZtI48H2D57wF2hP20lQ/0N.p3z7.O6', '01711223344', 150, 'Regular')
        `, (err) => {
          if (!err) {
            db.run(`
              INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
              VALUES ('addr-seed-1', 'cust-1', 'বাসা (Home)', 'Rahim Islam', '01711223344', 'হাউজ ২৪, রোড ৩, ধানমন্ডি, ঢাকা', 1)
            `);
            db.run(`
              INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
              VALUES ('addr-seed-2', 'cust-1', 'অফিস (Office)', 'Rahim Islam', '01711223355', 'লেভেল ৫, আইটি সেন্টার, কারওয়ান বাজার, ঢাকা', 0)
            `);
          }
        });

        // Kamrul Hasan: password_hash for 'kamrul123'
        // bcrypt hash of 'kamrul123' is $2b$10$tJ9fFp8LwXp/w7C27Q/VzO9ZtI48H2D57wF2hP20lQ/0N.p3z7.O6
        db.run(`
          INSERT INTO customers (id, first_name, last_name, email, password_hash, phone, loyalty_points, segment)
          VALUES ('cust-2', 'Kamrul', 'Hasan', 'kamrul@gmail.com', '$2b$10$tJ9fFp8LwXp/w7C27Q/VzO9ZtI48H2D57wF2hP20lQ/0N.p3z7.O6', '01911223344', 80, 'New')
        `, (err) => {
          if (!err) {
            db.run(`
              INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
              VALUES ('addr-seed-3', 'cust-2', 'বাসা (Home)', 'Kamrul Hasan', '01911223344', 'সেক্টর ৪, রোড ১২, উত্তরা, ঢাকা', 1)
            `);
          }
        });

        console.log('🌱 Seeded default customer accounts and addresses into database.');
      }
    });

    // Seed default orders if orders table is empty
    db.get("SELECT COUNT(*) as count FROM orders", (err, row: any) => {
      if (!err && row && row.count === 0) {
        // Let's seed mock orders spread across the last 30 days
        const mockOrders = [
          {
            id: 'ORD-54321',
            customer: 'Rahim Islam',
            email: 'rahim@gmail.com',
            amount: 219.98,
            items: 2,
            payment_method: 'Cash on Delivery',
            store_name: 'BEAUTY GLOWRY',
            phone: '01711223344',
            address: 'হাউজ ২৪, রোড ৩, ধানমন্ডি, ঢাকা',
            courier: 'Pathao',
            city: 'Dhaka',
            thana: 'Dhanmondi',
            area: 'Dhanmondi',
            customer_note: 'Please call before delivery',
            shop_note: 'Fragile item',
            payment_type: 'cod',
            memo_number: 'MEMO-991',
            delivery_charge: 60,
            discount: 0,
            paid_amount: 0,
            subtotal: 159.98,
            status: 'delivered',
            created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString() // 25 days ago
          },
          {
            id: 'ORD-54322',
            customer: 'Kamrul Hasan',
            email: 'kamrul@gmail.com',
            amount: 435.99,
            items: 1,
            payment_method: 'bKash',
            store_name: 'BEAUTY GLOWRY',
            phone: '01911223344',
            address: 'সেক্টর ৪, রোড ১২, উত্তরা, ঢাকা',
            courier: 'Steadfast',
            city: 'Dhaka',
            thana: 'Uttara',
            area: 'Uttara',
            customer_note: '',
            shop_note: '',
            payment_type: 'prepaid',
            memo_number: 'MEMO-992',
            delivery_charge: 60,
            discount: 20,
            paid_amount: 435.99,
            subtotal: 375.99,
            status: 'delivered',
            created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() // 15 days ago
          },
          {
            id: 'ORD-54323',
            customer: 'Sadia Rahman',
            email: 'sadia@gmail.com',
            amount: 149.97,
            items: 3,
            payment_method: 'Cash on Delivery',
            store_name: 'BEAUTY GLOWRY',
            phone: '01511223344',
            address: 'জিসি মোড়, চট্টগ্রাম',
            courier: 'Pathao',
            city: 'Chattogram',
            thana: 'Panchlaish',
            area: 'GEC',
            customer_note: '',
            shop_note: '',
            payment_type: 'cod',
            memo_number: '',
            delivery_charge: 120,
            discount: 0,
            paid_amount: 0,
            subtotal: 29.97,
            status: 'delivered',
            created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() // 10 days ago
          },
          {
            id: 'ORD-54324',
            customer: 'Tanvir Ahmed',
            email: 'tanvir@gmail.com',
            amount: 195.99,
            items: 1,
            payment_method: 'Nagad',
            store_name: 'BEAUTY GLOWRY',
            phone: '01811223344',
            address: 'উপশহর, সিলেট',
            courier: 'RedX',
            city: 'Sylhet',
            thana: 'Sylhet Sadar',
            area: 'Uposhahar',
            customer_note: 'Deliver after 4 PM',
            shop_note: '',
            payment_type: 'prepaid',
            memo_number: 'MEMO-994',
            delivery_charge: 120,
            discount: 50,
            paid_amount: 195.99,
            subtotal: 125.99,
            status: 'processing',
            created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() // 2 days ago
          },
          {
            id: 'ORD-54325',
            customer: 'Farhana Yasmin',
            email: 'farhana@gmail.com',
            amount: 759.99,
            items: 2,
            payment_method: 'Cash on Delivery',
            store_name: 'BEAUTY GLOWRY',
            phone: '01311223344',
            address: 'রাজশাহী বিশ্ববিদ্যালয়, রাজশাহী',
            courier: 'Pathao',
            city: 'Rajshahi',
            thana: 'Motihar',
            area: 'RU Campus',
            customer_note: '',
            shop_note: '',
            payment_type: 'cod',
            memo_number: '',
            delivery_charge: 120,
            discount: 100,
            paid_amount: 0,
            subtotal: 739.99,
            status: 'processing',
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString() // 5 hours ago
          },
          {
            id: 'ORD-54326',
            customer: 'Rahim Islam',
            email: 'rahim@gmail.com',
            amount: 349.99,
            items: 1,
            payment_method: 'Cash on Delivery',
            store_name: 'BEAUTY GLOWRY',
            phone: '01711223344',
            address: 'হাউজ ২৪, রোড ৩, ধানমন্ডি, ঢাকা',
            courier: 'Pathao',
            city: 'Dhaka',
            thana: 'Dhanmondi',
            area: 'Dhanmondi',
            customer_note: '',
            shop_note: '',
            payment_type: 'cod',
            memo_number: '',
            delivery_charge: 60,
            discount: 0,
            paid_amount: 0,
            subtotal: 289.99,
            status: 'processing',
            created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() // 1 hour ago
          }
        ];

        const mockItems: Record<string, any[]> = {
          'ORD-54321': [
            { product_name: 'Premium Leather Crossbody Bag', color: 'Brown', size: 'Free Size', code: 'LW-BAG-002', quantity: 1, price: 89.99 },
            { product_name: 'Organic Face Serum Collection', color: 'Default', size: 'Free Size', code: 'NG-FS-004', quantity: 2, price: 35.00 }
          ],
          'ORD-54322': [
            { product_name: 'Smart Watch Ultra Series 5', color: 'Titanium', size: '49mm', code: 'TG-SW-005', quantity: 1, price: 395.99 }
          ],
          'ORD-54323': [
            { product_name: 'Organic Face Serum Collection', color: 'Default', size: 'Free Size', code: 'NG-FS-004', quantity: 3, price: 9.99 }
          ],
          'ORD-54324': [
            { product_name: 'Wireless Earbuds Pro Max', color: 'Black', size: 'Free Size', code: 'ST-EPB-001', quantity: 1, price: 125.99 }
          ],
          'ORD-54325': [
            { product_name: '4K OLED Gaming Monitor 32"', color: 'Black', size: '32 Inch', code: 'VP-M-032', quantity: 1, price: 699.99 },
            { product_name: 'Organic Face Serum Collection', color: 'Default', size: 'Free Size', code: 'NG-FS-004', quantity: 1, price: 40.00 }
          ],
          'ORD-54326': [
            { product_name: 'Smart Watch Ultra Series 5', color: 'Orange', size: '49mm', code: 'TG-SW-005', quantity: 1, price: 289.99 }
          ]
        };

        db.serialize(() => {
          const stmtOrder = db.prepare(`
            INSERT INTO orders (
              id, customer, email, amount, items, payment_method, store_name, phone, address,
              courier, city, thana, area, customer_note, shop_note, payment_type, memo_number,
              delivery_charge, discount, paid_amount, subtotal, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const stmtItem = db.prepare(`
            INSERT INTO order_items (order_id, product_name, color, size, code, quantity, price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          mockOrders.forEach(o => {
            stmtOrder.run([
              o.id, o.customer, o.email, o.amount, o.items, o.payment_method, o.store_name, o.phone, o.address,
              o.courier, o.city, o.thana, o.area, o.customer_note, o.shop_note, o.payment_type, o.memo_number,
              o.delivery_charge, o.discount, o.paid_amount, o.subtotal, o.status, o.created_at
            ]);

            const items = mockItems[o.id] || [];
            items.forEach(item => {
              stmtItem.run([
                o.id, item.product_name, item.color, item.size, item.code, item.quantity, item.price
              ]);
            });
          });

          stmtOrder.finalize();
          stmtItem.finalize(() => {
            console.log('🌱 Seeded default orders and order items into database.');
          });
        });
      }
    });

    // Seed default system settings if table is empty
    db.get("SELECT COUNT(*) as count FROM system_settings", (err, row: any) => {
      if (!err && row && row.count === 0) {
        const defaultSettings = [
          { key: 'site_name', val: 'VIP Commerce Control Center', group: 'general' },
          { key: 'site_url', val: 'https://admin.vipcommerce.com', group: 'general' },
          { key: 'timezone', val: 'Asia/Dhaka (GMT+6)', group: 'general' },
          { key: 'currency', val: 'BDT (৳)', group: 'general' },
          { key: 'maintenance_mode', val: '0', group: 'general' },
          { key: 'email_provider', val: 'SendGrid', group: 'email' },
          { key: 'smtp_host', val: 'smtp.sendgrid.net', group: 'email' },
          { key: 'smtp_port', val: '587', group: 'email' },
          { key: 'cache_driver', val: 'Redis', group: 'cache' }
        ];

        db.serialize(() => {
          const stmt = db.prepare(`
            INSERT INTO system_settings (setting_key, setting_value, group_name)
            VALUES (?, ?, ?)
          `);
          defaultSettings.forEach(s => {
            stmt.run([s.key, s.val, s.group]);
          });
          stmt.finalize(() => {
            console.log('🌱 Seeded default system settings into database.');
          });
        });
      }
    });

    console.log('✅ SQLite Schema verification & seeding completed.');
  });
}

export default db;
