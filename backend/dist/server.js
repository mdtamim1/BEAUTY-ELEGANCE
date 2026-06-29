// backend/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import dotenv3 from "dotenv";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// backend/config/db.ts
import sqlite3 from "sqlite3";
import mysql from "mysql2";
import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// backend/config/seedData.ts
var seedProducts = [
  {
    id: "PRD-001",
    name: "Hex Dumbbells Set (20kg)",
    slug: "hex-dumbbells-set-20kg",
    sku: "SSX-HEX-001",
    brand: "PowerGym",
    category: "Fitness Item",
    price: 3500,
    original_price: 4200,
    rating: 4.8,
    reviews: 340,
    image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"
    ],
    features: [
      "Solid cast iron core",
      "Anti-roll hex design",
      "Knurled chrome grip for safety",
      "Rubber coating reduces noise"
    ],
    specs: [
      { name: "Total Weight", value: "20kg (10kg x 2)" },
      { name: "Material", value: "Cast Iron & Rubber" },
      { name: "Handle Type", value: "Knurled" }
    ],
    stock: 50,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-002",
    name: "4-Wheels AB Roller for Core Strength",
    slug: "4-wheels-ab-roller-for-core-strength",
    sku: "SSX-ABR-002",
    brand: "FitMax",
    category: "Fitness Item",
    price: 1200,
    original_price: 1800,
    rating: 4.7,
    reviews: 180,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80"
    ],
    features: [
      "4-wheel design for max stability",
      "Comfortable foam grip handles",
      "Silent wheels protect floors",
      "Includes knee foam mat"
    ],
    specs: [
      { name: "Wheels Count", value: "4" },
      { name: "Max Weight Cap", value: "150kg" },
      { name: "Includes", value: "Knee Pad" }
    ],
    stock: 80,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-003",
    name: "Professional Match Football (Size 5)",
    slug: "professional-match-football-size-5",
    sku: "SSX-FTB-003",
    brand: "Puma",
    category: "Sports Game",
    price: 1500,
    original_price: 2e3,
    rating: 4.6,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80"],
    features: [
      "Premium textured casing for flight stability",
      "High-density rubber bladder for air retention",
      "Durable panels for longevity"
    ],
    specs: [
      { name: "Size", value: "Official Size 5" },
      { name: "Weight", value: "420-440g" },
      { name: "Material", value: "PU Leather" }
    ],
    stock: 60,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-004",
    name: "Professional Carbon Fiber Badminton Racket",
    slug: "professional-carbon-fiber-badminton-racket",
    sku: "SSX-BAD-004",
    brand: "Yonex",
    category: "Sports Game",
    price: 2800,
    original_price: 3500,
    rating: 4.8,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1687360441372-757f8b2b6835?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1687360441372-757f8b2b6835?auto=format&fit=crop&w=600&q=80"],
    features: [
      "Full carbon graphite frame",
      "Aerodynamic nanotechnology",
      "Isometric head shape for sweet spot expansion"
    ],
    specs: [
      { name: "Frame Material", value: "High Modulus Graphite" },
      { name: "Weight", value: "83g" },
      { name: "Grip Size", value: "G4" }
    ],
    stock: 45,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-005",
    name: "Breathable Mesh Running Shoes",
    slug: "breathable-mesh-running-shoes",
    sku: "SSX-SH-005",
    brand: "AeroStep",
    category: "Sports Shoes",
    price: 4500,
    original_price: 6e3,
    rating: 4.9,
    reviews: 220,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    ],
    features: [
      "Engineered breathable mesh upper",
      "Bounce cushion midsole for energy return",
      "High traction rubber outsole"
    ],
    specs: [
      { name: "Activity", value: "Running / Jogging" },
      { name: "Weight", value: "290g" },
      { name: "Warranty", value: "6 Months" }
    ],
    stock: 35,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-006",
    name: "Dri-FIT Athletic Jersey",
    slug: "dri-fit-athletic-jersey",
    sku: "SSX-JRS-006",
    brand: "Adidas",
    category: "Sports wear",
    price: 1200,
    original_price: 1600,
    rating: 4.6,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80"
    ],
    features: [
      "Dri-FIT moisture wicking technology",
      "Athletic fit design",
      "100% Recycled polyester"
    ],
    specs: [
      { name: "Material", value: "Polyester" },
      { name: "Fit", value: "Slim Fit" },
      { name: "Wash", value: "Machine Wash Cold" }
    ],
    stock: 75,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-007",
    name: "Non-Slip 8mm Yoga Mat",
    slug: "non-slip-8mm-yoga-mat",
    sku: "SSX-YOG-007",
    brand: "FlexiFit",
    category: "Fitness Item",
    price: 950,
    original_price: 1500,
    rating: 4.7,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"],
    features: [
      "High-density 8mm thick TPE material",
      "Non-slip textured double side",
      "Posture alignment marks",
      "Eco-friendly non-toxic material"
    ],
    specs: [
      { name: "Thickness", value: "8mm" },
      { name: "Material", value: "TPE" },
      { name: "Dimensions", value: "183cm x 61cm" }
    ],
    stock: 65,
    published: 1,
    in_stock: 1
  },
  {
    id: "PRD-008",
    name: "Kids Adjustable Basketball Hoop Set",
    slug: "kids-adjustable-basketball-hoop-set",
    sku: "SSX-BBH-008",
    brand: "KidSports",
    category: "Sports Game",
    price: 3200,
    original_price: 4500,
    rating: 4.5,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
    gallery: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80"],
    features: [
      "Adjustable height stand",
      "Sturdy backboard and steel rim",
      "Water/Sand fillable base for stability"
    ],
    specs: [
      { name: "Max Height", value: "7 Feet" },
      { name: "Suitable Age", value: "3-10 Years" },
      { name: "Material", value: "Steel & Durable ABS" }
    ],
    stock: 25,
    published: 1,
    in_stock: 1
  }
];

// backend/config/db.ts
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DB_TYPE = process.env.DB_TYPE || "sqlite";
var MockStatement = class {
  sql;
  db;
  constructor(sql, db2) {
    this.sql = sql;
    this.db = db2;
  }
  run(params = [], cb) {
    this.db.run(this.sql, params, cb);
    return this;
  }
  finalize(cb) {
    if (cb) cb(null);
  }
};
function translateSchemaForMysql(sql) {
  let translatedSql = sql;
  translatedSql = translatedSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "INT AUTO_INCREMENT PRIMARY KEY");
  translatedSql = translatedSql.replace(/TEXT PRIMARY KEY/gi, "VARCHAR(255) PRIMARY KEY");
  translatedSql = translatedSql.replace(/TEXT UNIQUE/gi, "VARCHAR(255) UNIQUE");
  translatedSql = translatedSql.replace(/REAL/gi, "DOUBLE");
  return translatedSql;
}
function translateSchemaForPostgres(sql) {
  let translatedSql = sql;
  translatedSql = translatedSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY");
  translatedSql = translatedSql.replace(/TEXT PRIMARY KEY/gi, "VARCHAR(255) PRIMARY KEY");
  translatedSql = translatedSql.replace(/TEXT UNIQUE/gi, "VARCHAR(255) UNIQUE");
  translatedSql = translatedSql.replace(/DATETIME/gi, "TIMESTAMP");
  translatedSql = translatedSql.replace(/REAL/gi, "DOUBLE PRECISION");
  return translatedSql;
}
function translateSqlForMysql(sql) {
  let translatedSql = sql;
  translatedSql = translatedSql.replace(/INSERT OR REPLACE/gi, "REPLACE");
  translatedSql = translatedSql.replace(/INSERT OR IGNORE/gi, "INSERT IGNORE");
  if (translatedSql.toUpperCase().trim() === "BEGIN TRANSACTION") {
    translatedSql = "START TRANSACTION";
  }
  return translatedSql;
}
function translateSqlForPostgres(sql, params = []) {
  let translatedSql = sql;
  let index = 1;
  translatedSql = translatedSql.replace(/\?/g, () => `$${index++}`);
  if (translatedSql.toUpperCase().includes("INSERT OR REPLACE INTO SYSTEM_SETTINGS")) {
    if (translatedSql.includes("group_name") && translatedSql.includes("is_public")) {
      translatedSql = `
        INSERT INTO system_settings (setting_key, setting_value, group_name, is_public)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = EXCLUDED.setting_value, group_name = EXCLUDED.group_name, is_public = EXCLUDED.is_public
      `;
    } else {
      translatedSql = `
        INSERT INTO system_settings (setting_key, setting_value)
        VALUES ($1, $2)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = EXCLUDED.setting_value
      `;
    }
  }
  if (translatedSql.toUpperCase().includes("INSERT OR IGNORE INTO PRODUCT_GALLERY")) {
    translatedSql = translatedSql.replace(/INSERT OR IGNORE INTO/gi, "INSERT INTO") + " ON CONFLICT DO NOTHING";
  }
  if (translatedSql.toUpperCase().trim() === "BEGIN TRANSACTION") {
    translatedSql = "BEGIN";
  }
  if (translatedSql.trim().toUpperCase().startsWith("INSERT INTO ") && !translatedSql.toUpperCase().includes(" RETURNING ")) {
    translatedSql = translatedSql.trim() + " RETURNING id";
  }
  return { sql: translatedSql, params };
}
function parseArgs(args) {
  let params = [];
  let cb = void 0;
  if (args.length === 1) {
    if (typeof args[0] === "function") {
      cb = args[0];
    } else if (Array.isArray(args[0])) {
      params = args[0];
    }
  } else if (args.length === 2) {
    params = args[0];
    cb = args[1];
  }
  return { params, cb };
}
var dbInstance = null;
var mysqlPool = null;
var pgPool = null;
if (DB_TYPE === "sqlite") {
  const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, "../../database/database.sqlite");
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const sqlite = sqlite3.verbose();
  dbInstance = new sqlite.Database(dbPath, (err) => {
    if (err) {
      console.error("\u274C Failed to connect to SQLite database:", err.message);
    } else {
      console.log("\u{1F50C} Connected to local SQLite database.");
      initializeDatabase();
    }
  });
} else if (DB_TYPE === "mysql") {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "beauty_elegance",
    connectionLimit: 10,
    multipleStatements: true
  });
  console.log("\u{1F50C} Connected to MySQL database pool.");
  initializeDatabase();
} else if (DB_TYPE === "postgres") {
  pgPool = new pg.Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "beauty_elegance",
    max: 10
  });
  console.log("\u{1F50C} Connected to PostgreSQL database pool.");
  initializeDatabase();
}
var db = {
  run(sql, ...args) {
    const { params, cb } = parseArgs(args);
    if (sql.toUpperCase().includes("CREATE TABLE")) {
      if (DB_TYPE === "mysql") sql = translateSchemaForMysql(sql);
      else if (DB_TYPE === "postgres") sql = translateSchemaForPostgres(sql);
    }
    if (DB_TYPE === "sqlite") {
      dbInstance.run(sql, params, cb);
    } else if (DB_TYPE === "mysql") {
      const translatedSql = translateSqlForMysql(sql);
      mysqlPool.query(translatedSql, params, function(err, result) {
        if (cb) {
          const context = {
            lastID: result ? result.insertId : void 0,
            changes: result ? result.affectedRows : void 0
          };
          cb.call(context, err);
        }
      });
    } else if (DB_TYPE === "postgres") {
      const { sql: translatedSql, params: translatedParams } = translateSqlForPostgres(sql, params);
      pgPool.query(translatedSql, translatedParams, function(err, result) {
        if (cb) {
          const context = {
            lastID: result && result.rows && result.rows[0] ? result.rows[0].id : void 0,
            changes: result ? result.rowCount : void 0
          };
          cb.call(context, err);
        }
      });
    }
  },
  get(sql, ...args) {
    const { params, cb } = parseArgs(args);
    if (DB_TYPE === "sqlite") {
      dbInstance.get(sql, params, cb);
    } else if (DB_TYPE === "mysql") {
      const translatedSql = translateSqlForMysql(sql);
      mysqlPool.query(translatedSql, params, function(err, results) {
        if (cb) {
          const row = results && results.length > 0 ? results[0] : void 0;
          cb(err, row);
        }
      });
    } else if (DB_TYPE === "postgres") {
      const { sql: translatedSql, params: translatedParams } = translateSqlForPostgres(sql, params);
      pgPool.query(translatedSql, translatedParams, function(err, result) {
        if (cb) {
          const row = result && result.rows && result.rows.length > 0 ? result.rows[0] : void 0;
          cb(err, row);
        }
      });
    }
  },
  all(sql, ...args) {
    const { params, cb } = parseArgs(args);
    if (DB_TYPE === "sqlite") {
      dbInstance.all(sql, params, cb);
    } else if (DB_TYPE === "mysql") {
      const translatedSql = translateSqlForMysql(sql);
      mysqlPool.query(translatedSql, params, function(err, results) {
        if (cb) {
          cb(err, results || []);
        }
      });
    } else if (DB_TYPE === "postgres") {
      const { sql: translatedSql, params: translatedParams } = translateSqlForPostgres(sql, params);
      pgPool.query(translatedSql, translatedParams, function(err, result) {
        if (cb) {
          cb(err, result ? result.rows : []);
        }
      });
    }
  },
  serialize(cb) {
    if (DB_TYPE === "sqlite") {
      dbInstance.serialize(cb);
    } else {
      cb();
    }
  },
  prepare(sql, cb) {
    if (DB_TYPE === "sqlite") {
      return dbInstance.prepare(sql, cb);
    } else {
      if (cb) cb(null);
      return new MockStatement(sql, this);
    }
  },
  close(cb) {
    if (DB_TYPE === "sqlite") {
      dbInstance.close(cb);
    } else if (DB_TYPE === "mysql") {
      mysqlPool.end(cb);
    } else if (DB_TYPE === "postgres") {
      pgPool.end().then(() => cb && cb(null)).catch((err) => cb && cb(err));
    }
  }
};
function initializeDatabase() {
  db.serialize(() => {
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
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        banner_image TEXT,
        author_name TEXT DEFAULT 'Admin',
        published INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    db.run("ALTER TABLE products ADD COLUMN features TEXT", (err) => {
    });
    db.run("ALTER TABLE products ADD COLUMN specs TEXT", (err) => {
    });
    db.run("ALTER TABLE customers ADD COLUMN address TEXT", (err) => {
    });
    db.run("ALTER TABLE roles ADD COLUMN permissions TEXT", (err) => {
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
    db.get("SELECT COUNT(*) as count FROM campaigns", (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(`
          INSERT INTO campaigns (id, name, type, status, sent, opened, clicked, converted, revenue, start_date, end_date, product_ids)
          VALUES ('CMP-001', '\u09A7\u09BE\u09AE\u09BE\u0995\u09BE \u0993\u09AA\u09C7\u09A8\u09BF\u0982 \u0985\u09AB\u09BE\u09B0', 'email', 'active', 5000, 2400, 1100, 320, 145000.0, ?, ?, '1,2,3,4')
        `, [
          (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          new Date(Date.now() + 15 * 24 * 3600 * 1e3).toISOString().split("T")[0]
        ]);
      }
    });
    const defaultRoles = [
      { name: "Super Admin", desc: "System Administrator with full access", is_system: 1, permissions: ["dashboard", "analytics", "orders", "products", "storefront", "chats", "marketing", "employees", "finance", "security", "settings", "ai"] },
      { name: "Admin", desc: "Administrator with full management access", is_system: 1, permissions: ["dashboard", "analytics", "orders", "products", "storefront", "chats", "marketing", "employees", "finance", "security", "settings", "ai"] },
      { name: "Moderator", desc: "Staff with moderate access to orders, products, and support", is_system: 1, permissions: ["dashboard", "orders", "products", "chats"] }
    ];
    let processedCount = 0;
    defaultRoles.forEach((r) => {
      db.get("SELECT id FROM roles WHERE name = ?", [r.name], (err, row) => {
        const afterRoleProcessed = () => {
          processedCount++;
          if (processedCount === defaultRoles.length) {
            db.get("SELECT id FROM roles WHERE name = 'Super Admin'", (err2, roleRow) => {
              if (roleRow) {
                const roleId = roleRow.id;
                db.get("SELECT id FROM employees WHERE email = 'admin@vipcommerce.com'", (err3, empRow) => {
                  if (!empRow) {
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
    db.run("DELETE FROM products WHERE id LIKE 'PRD-00%'", (err) => {
      if (err) console.error("Error deleting default products:", err);
      db.run("DELETE FROM product_gallery WHERE product_id LIKE 'PRD-00%'", (err2) => {
        if (err2) console.error("Error deleting default gallery:", err2);
        const stmt = db.prepare(`
          INSERT INTO products (id, name, slug, sku, brand, category, price, original_price, rating, reviews, image, in_stock, published, description, stock, features, specs)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        seedProducts.forEach((p) => {
          stmt.run([
            p.id,
            p.name,
            p.slug,
            p.sku,
            p.brand,
            p.category,
            p.price,
            p.original_price,
            p.rating,
            p.reviews,
            p.image,
            p.in_stock,
            p.published,
            p.description,
            p.stock,
            JSON.stringify(p.features || []),
            JSON.stringify(p.specs || [])
          ]);
        });
        stmt.finalize(() => {
          console.log("\u{1F331} Seeded 8 default products with features/specs into the database.");
          seedProducts.forEach((p) => {
            if (p.gallery && Array.isArray(p.gallery)) {
              p.gallery.forEach((imgUrl) => {
                db.run(`INSERT OR IGNORE INTO product_gallery (product_id, image_url) VALUES (?, ?)`, [p.id, imgUrl]);
              });
            }
          });
          console.log("\u{1F5BC}\uFE0F Seeded default product galleries.");
        });
      });
    });
    db.get("SELECT COUNT(*) as count FROM coupons", (err, row) => {
      if (row && row.count === 0) {
        const defaultCoupons = [
          { code: "SUMMER20", type: "percentage", value: 20, expiry: "2026-08-31", status: "active" },
          { code: "TECH10", type: "percentage", value: 10, expiry: "2026-07-15", status: "active" },
          { code: "FREESHIP", type: "fixed", value: 150, expiry: "2026-12-31", status: "active" },
          { code: "WELCOME50", type: "fixed", value: 50, expiry: "2026-06-30", status: "expired" }
        ];
        defaultCoupons.forEach((c) => {
          db.run(
            "INSERT INTO coupons (code, type, value, expiry, status) VALUES (?, ?, ?, ?, ?)",
            [c.code, c.type, c.value, c.expiry, c.status]
          );
        });
      }
    });
    db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(`
          INSERT INTO customers (id, first_name, last_name, email, password_hash, phone, loyalty_points, segment)
          VALUES ('cust-1', 'Rahim', 'Islam', 'rahim@gmail.com', '$2b$10$tJ9fFp8LwXp/w7C27Q/VzO9ZtI48H2D57wF2hP20lQ/0N.p3z7.O6', '01711223344', 150, 'Regular')
        `, (err2) => {
          if (!err2) {
            db.run(`
              INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
              VALUES ('addr-seed-1', 'cust-1', '\u09AC\u09BE\u09B8\u09BE (Home)', 'Rahim Islam', '01711223344', '\u09B9\u09BE\u0989\u099C \u09E8\u09EA, \u09B0\u09CB\u09A1 \u09E9, \u09A7\u09BE\u09A8\u09AE\u09A8\u09CD\u09A1\u09BF, \u09A2\u09BE\u0995\u09BE', 1)
            `);
            db.run(`
              INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
              VALUES ('addr-seed-2', 'cust-1', '\u0985\u09AB\u09BF\u09B8 (Office)', 'Rahim Islam', '01711223355', '\u09B2\u09C7\u09AD\u09C7\u09B2 \u09EB, \u0986\u0987\u099F\u09BF \u09B8\u09C7\u09A8\u09CD\u099F\u09BE\u09B0, \u0995\u09BE\u09B0\u0993\u09DF\u09BE\u09A8 \u09AC\u09BE\u099C\u09BE\u09B0, \u09A2\u09BE\u0995\u09BE', 0)
            `);
          }
        });
        db.run(`
          INSERT INTO customers (id, first_name, last_name, email, password_hash, phone, loyalty_points, segment)
          VALUES ('cust-2', 'Kamrul', 'Hasan', 'kamrul@gmail.com', '$2b$10$tJ9fFp8LwXp/w7C27Q/VzO9ZtI48H2D57wF2hP20lQ/0N.p3z7.O6', '01911223344', 80, 'New')
        `, (err2) => {
          if (!err2) {
            db.run(`
              INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
              VALUES ('addr-seed-3', 'cust-2', '\u09AC\u09BE\u09B8\u09BE (Home)', 'Kamrul Hasan', '01911223344', '\u09B8\u09C7\u0995\u09CD\u099F\u09B0 \u09EA, \u09B0\u09CB\u09A1 \u09E7\u09E8, \u0989\u09A4\u09CD\u09A4\u09B0\u09BE, \u09A2\u09BE\u0995\u09BE', 1)
            `);
          }
        });
        console.log("\u{1F331} Seeded default customer accounts and addresses into database.");
      }
    });
    db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
      if (!err && row && row.count === 0) {
        const mockOrders = [
          {
            id: "ORD-54321",
            customer: "Rahim Islam",
            email: "rahim@gmail.com",
            amount: 219.98,
            items: 2,
            payment_method: "Cash on Delivery",
            store_name: "BEAUTY GLOWRY",
            phone: "01711223344",
            address: "\u09B9\u09BE\u0989\u099C \u09E8\u09EA, \u09B0\u09CB\u09A1 \u09E9, \u09A7\u09BE\u09A8\u09AE\u09A8\u09CD\u09A1\u09BF, \u09A2\u09BE\u0995\u09BE",
            courier: "Pathao",
            city: "Dhaka",
            thana: "Dhanmondi",
            area: "Dhanmondi",
            customer_note: "Please call before delivery",
            shop_note: "Fragile item",
            payment_type: "cod",
            memo_number: "MEMO-991",
            delivery_charge: 60,
            discount: 0,
            paid_amount: 0,
            subtotal: 159.98,
            status: "delivered",
            created_at: new Date(Date.now() - 25 * 24 * 3600 * 1e3).toISOString()
            // 25 days ago
          },
          {
            id: "ORD-54322",
            customer: "Kamrul Hasan",
            email: "kamrul@gmail.com",
            amount: 435.99,
            items: 1,
            payment_method: "bKash",
            store_name: "BEAUTY GLOWRY",
            phone: "01911223344",
            address: "\u09B8\u09C7\u0995\u09CD\u099F\u09B0 \u09EA, \u09B0\u09CB\u09A1 \u09E7\u09E8, \u0989\u09A4\u09CD\u09A4\u09B0\u09BE, \u09A2\u09BE\u0995\u09BE",
            courier: "Steadfast",
            city: "Dhaka",
            thana: "Uttara",
            area: "Uttara",
            customer_note: "",
            shop_note: "",
            payment_type: "prepaid",
            memo_number: "MEMO-992",
            delivery_charge: 60,
            discount: 20,
            paid_amount: 435.99,
            subtotal: 375.99,
            status: "delivered",
            created_at: new Date(Date.now() - 15 * 24 * 3600 * 1e3).toISOString()
            // 15 days ago
          },
          {
            id: "ORD-54323",
            customer: "Sadia Rahman",
            email: "sadia@gmail.com",
            amount: 149.97,
            items: 3,
            payment_method: "Cash on Delivery",
            store_name: "BEAUTY GLOWRY",
            phone: "01511223344",
            address: "\u099C\u09BF\u09B8\u09BF \u09AE\u09CB\u09DC, \u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE",
            courier: "Pathao",
            city: "Chattogram",
            thana: "Panchlaish",
            area: "GEC",
            customer_note: "",
            shop_note: "",
            payment_type: "cod",
            memo_number: "",
            delivery_charge: 120,
            discount: 0,
            paid_amount: 0,
            subtotal: 29.97,
            status: "delivered",
            created_at: new Date(Date.now() - 10 * 24 * 3600 * 1e3).toISOString()
            // 10 days ago
          },
          {
            id: "ORD-54324",
            customer: "Tanvir Ahmed",
            email: "tanvir@gmail.com",
            amount: 195.99,
            items: 1,
            payment_method: "Nagad",
            store_name: "BEAUTY GLOWRY",
            phone: "01811223344",
            address: "\u0989\u09AA\u09B6\u09B9\u09B0, \u09B8\u09BF\u09B2\u09C7\u099F",
            courier: "RedX",
            city: "Sylhet",
            thana: "Sylhet Sadar",
            area: "Uposhahar",
            customer_note: "Deliver after 4 PM",
            shop_note: "",
            payment_type: "prepaid",
            memo_number: "MEMO-994",
            delivery_charge: 120,
            discount: 50,
            paid_amount: 195.99,
            subtotal: 125.99,
            status: "processing",
            created_at: new Date(Date.now() - 2 * 24 * 3600 * 1e3).toISOString()
            // 2 days ago
          },
          {
            id: "ORD-54325",
            customer: "Farhana Yasmin",
            email: "farhana@gmail.com",
            amount: 759.99,
            items: 2,
            payment_method: "Cash on Delivery",
            store_name: "BEAUTY GLOWRY",
            phone: "01311223344",
            address: "\u09B0\u09BE\u099C\u09B6\u09BE\u09B9\u09C0 \u09AC\u09BF\u09B6\u09CD\u09AC\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE\u09B2\u09DF, \u09B0\u09BE\u099C\u09B6\u09BE\u09B9\u09C0",
            courier: "Pathao",
            city: "Rajshahi",
            thana: "Motihar",
            area: "RU Campus",
            customer_note: "",
            shop_note: "",
            payment_type: "cod",
            memo_number: "",
            delivery_charge: 120,
            discount: 100,
            paid_amount: 0,
            subtotal: 739.99,
            status: "processing",
            created_at: new Date(Date.now() - 5 * 3600 * 1e3).toISOString()
            // 5 hours ago
          },
          {
            id: "ORD-54326",
            customer: "Rahim Islam",
            email: "rahim@gmail.com",
            amount: 349.99,
            items: 1,
            payment_method: "Cash on Delivery",
            store_name: "BEAUTY GLOWRY",
            phone: "01711223344",
            address: "\u09B9\u09BE\u0989\u099C \u09E8\u09EA, \u09B0\u09CB\u09A1 \u09E9, \u09A7\u09BE\u09A8\u09AE\u09A8\u09CD\u09A1\u09BF, \u09A2\u09BE\u0995\u09BE",
            courier: "Pathao",
            city: "Dhaka",
            thana: "Dhanmondi",
            area: "Dhanmondi",
            customer_note: "",
            shop_note: "",
            payment_type: "cod",
            memo_number: "",
            delivery_charge: 60,
            discount: 0,
            paid_amount: 0,
            subtotal: 289.99,
            status: "processing",
            created_at: new Date(Date.now() - 1 * 3600 * 1e3).toISOString()
            // 1 hour ago
          }
        ];
        const mockItems = {
          "ORD-54321": [
            { product_name: "Premium Leather Crossbody Bag", color: "Brown", size: "Free Size", code: "LW-BAG-002", quantity: 1, price: 89.99 },
            { product_name: "Organic Face Serum Collection", color: "Default", size: "Free Size", code: "NG-FS-004", quantity: 2, price: 35 }
          ],
          "ORD-54322": [
            { product_name: "Smart Watch Ultra Series 5", color: "Titanium", size: "49mm", code: "TG-SW-005", quantity: 1, price: 395.99 }
          ],
          "ORD-54323": [
            { product_name: "Organic Face Serum Collection", color: "Default", size: "Free Size", code: "NG-FS-004", quantity: 3, price: 9.99 }
          ],
          "ORD-54324": [
            { product_name: "Wireless Earbuds Pro Max", color: "Black", size: "Free Size", code: "ST-EPB-001", quantity: 1, price: 125.99 }
          ],
          "ORD-54325": [
            { product_name: '4K OLED Gaming Monitor 32"', color: "Black", size: "32 Inch", code: "VP-M-032", quantity: 1, price: 699.99 },
            { product_name: "Organic Face Serum Collection", color: "Default", size: "Free Size", code: "NG-FS-004", quantity: 1, price: 40 }
          ],
          "ORD-54326": [
            { product_name: "Smart Watch Ultra Series 5", color: "Orange", size: "49mm", code: "TG-SW-005", quantity: 1, price: 289.99 }
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
          mockOrders.forEach((o) => {
            stmtOrder.run([
              o.id,
              o.customer,
              o.email,
              o.amount,
              o.items,
              o.payment_method,
              o.store_name,
              o.phone,
              o.address,
              o.courier,
              o.city,
              o.thana,
              o.area,
              o.customer_note,
              o.shop_note,
              o.payment_type,
              o.memo_number,
              o.delivery_charge,
              o.discount,
              o.paid_amount,
              o.subtotal,
              o.status,
              o.created_at
            ]);
            const items = mockItems[o.id] || [];
            items.forEach((item) => {
              stmtItem.run([
                o.id,
                item.product_name,
                item.color,
                item.size,
                item.code,
                item.quantity,
                item.price
              ]);
            });
          });
          stmtOrder.finalize();
          stmtItem.finalize(() => {
            console.log("\u{1F331} Seeded default orders and order items into database.");
          });
        });
      }
    });
    db.get("SELECT COUNT(*) as count FROM system_settings", (err, row) => {
      if (!err && row && row.count === 0) {
        const defaultSettings = [
          { key: "site_name", val: "VIP Commerce Control Center", group: "general" },
          { key: "site_url", val: "https://admin.vipcommerce.com", group: "general" },
          { key: "timezone", val: "Asia/Dhaka (GMT+6)", group: "general" },
          { key: "currency", val: "BDT (\u09F3)", group: "general" },
          { key: "maintenance_mode", val: "0", group: "general" },
          { key: "email_provider", val: "SendGrid", group: "email" },
          { key: "smtp_host", val: "smtp.sendgrid.net", group: "email" },
          { key: "smtp_port", val: "587", group: "email" },
          { key: "cache_driver", val: "Redis", group: "cache" }
        ];
        db.serialize(() => {
          const stmt = db.prepare(`
            INSERT INTO system_settings (setting_key, setting_value, group_name)
            VALUES (?, ?, ?)
          `);
          defaultSettings.forEach((s) => {
            stmt.run([s.key, s.val, s.group]);
          });
          stmt.finalize(() => {
            console.log("\u{1F331} Seeded default system settings into database.");
          });
        });
      }
    });
    db.get("SELECT COUNT(*) as count FROM blog_posts", (err, row) => {
      if (!err && row && row.count === 0) {
        const defaultBlogs = [
          {
            id: "blog-1",
            title: "\u09EB\u099F\u09BF \u09B8\u09B9\u099C \u0989\u09AA\u09BE\u09DF\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09CD\u0995\u09BF\u09A8 \u0997\u09CD\u09B2\u09CB\u09DF\u09BF\u0982 \u0993 \u09B9\u09C7\u09B2\u09A6\u09BF \u09B0\u09BE\u0996\u09C1\u09A8",
            slug: "5-ways-glowing-healthy-skin",
            summary: "\u09B8\u09CD\u0995\u09BF\u09A8 \u0995\u09C7\u09DF\u09BE\u09B0 \u09AC\u09BE \u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u09AF\u09A4\u09CD\u09A8 \u09A8\u09C7\u0993\u09DF\u09BE \u0995\u09A0\u09BF\u09A8 \u0995\u09BF\u099B\u09C1 \u09A8\u09DF\u0964 \u09AE\u09BE\u09A4\u09CD\u09B0 \u0995\u09DF\u09C7\u0995\u099F\u09BF \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09A8\u09BF\u09DF\u09AE \u09AE\u09C7\u09A8\u09C7 \u099A\u09B2\u09B2\u09C7 \u0986\u09AA\u09A8\u09BF\u0993 \u09AA\u09C7\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8 \u0989\u099C\u09CD\u099C\u09CD\u09AC\u09B2 \u0993 \u09B8\u09A4\u09C7\u099C \u09A4\u09CD\u09AC\u0995\u0964 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09AA\u09DC\u09C1\u09A8 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0986\u099C\u0995\u09C7\u09B0 \u09AC\u09CD\u09B2\u0997\u09C7\u0964",
            content: `<p>\u09B8\u09C1\u09A8\u09CD\u09A6\u09B0, \u0989\u099C\u09CD\u099C\u09CD\u09AC\u09B2 \u0993 \u09B8\u09C1\u09B8\u09CD\u09A5 \u09A4\u09CD\u09AC\u0995 \u09B8\u09AC\u09BE\u09B0\u0987 \u0995\u09BE\u09AE\u09CD\u09AF\u0964 \u09A4\u09AC\u09C7 \u09AC\u09CD\u09AF\u09B8\u09CD\u09A4 \u099C\u09C0\u09AC\u09A8\u09C7\u09B0 \u09A7\u0995\u09B2, \u09A6\u09C2\u09B7\u09A3 \u0993 \u09B8\u09A0\u09BF\u0995 \u09AF\u09A4\u09CD\u09A8\u09C7\u09B0 \u0985\u09AD\u09BE\u09AC\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A4\u09CD\u09AC\u0995 \u09AA\u09CD\u09B0\u09BE\u09DF\u09B6\u0987 \u09B8\u09A4\u09C7\u099C\u09A4\u09BE \u09B9\u09BE\u09B0\u09BF\u09DF\u09C7 \u09AB\u09C7\u09B2\u09C7\u0964 \u09A4\u09CD\u09AC\u0995\u0995\u09C7 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u0997\u09CD\u09B2\u09CB\u09DF\u09BF\u0982 \u0993 \u09B9\u09C7\u09B2\u09A6\u09BF \u09B0\u09BE\u0996\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u098F\u0996\u09BE\u09A8\u09C7 \u09EB\u099F\u09BF \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09B0 \u0993 \u09B8\u09B9\u099C \u0989\u09AA\u09BE\u09DF \u0986\u09B2\u09CB\u099A\u09A8\u09BE \u0995\u09B0\u09BE \u09B9\u09B2\u09CB:</p>

<h3>\u09E7. \u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AA\u09BE\u09A8\u09BF \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8</h3>
<p>\u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u0986\u09B0\u09CD\u09A6\u09CD\u09B0\u09A4\u09BE \u09A7\u09B0\u09C7 \u09B0\u09BE\u0996\u09BE\u09B0 \u09B8\u09AC\u099A\u09C7\u09DF\u09C7 \u09B8\u09B9\u099C \u0989\u09AA\u09BE\u09DF \u09B9\u09B2\u09CB \u09AA\u09CD\u09B0\u099A\u09C1\u09B0 \u09AA\u09BE\u09A8\u09BF \u09AA\u09BE\u09A8 \u0995\u09B0\u09BE\u0964 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u0985\u09A8\u09CD\u09A4\u09A4 \u09EE-\u09E7\u09E6 \u0997\u09CD\u09B2\u09BE\u09B8 \u09AA\u09BE\u09A8\u09BF \u09AA\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u098F\u099F\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u09B6\u09B0\u09C0\u09B0 \u09A5\u09C7\u0995\u09C7 \u0995\u09CD\u09B7\u09A4\u09BF\u0995\u09B0 \u099F\u0995\u09CD\u09B8\u09BF\u09A8 \u09AC\u09C7\u09B0 \u0995\u09B0\u09C7 \u09A6\u09BF\u09A4\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09C7 \u098F\u09AC\u0982 \u09A4\u09CD\u09AC\u0995\u09C7 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995 \u0989\u099C\u09CD\u099C\u09CD\u09AC\u09B2\u09A4\u09BE \u098F\u09A8\u09C7 \u09A6\u09C7\u09DF\u0964</p>

<h3>\u09E8. \u09A1\u09BE\u09AC\u09B2 \u0995\u09CD\u09B2\u09BF\u09A8\u099C\u09BF\u0982 \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8</h3>
<p>\u09B8\u09BE\u09B0\u09BE\u09A6\u09BF\u09A8\u09C7\u09B0 \u09A7\u09C1\u09B2\u09CB\u09AC\u09BE\u09B2\u09BF \u0993 \u09AE\u09C7\u0995\u0986\u09AA \u09A6\u09C2\u09B0 \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09B6\u09C1\u09A7\u09C1 \u09AB\u09C7\u09B8\u0993\u09DF\u09BE\u09B6 \u09AF\u09A5\u09C7\u09B7\u09CD\u099F \u09A8\u09DF\u0964 \u09AA\u09CD\u09B0\u09A5\u09AE\u09C7 \u098F\u0995\u099F\u09BF \u0985\u09DF\u09C7\u09B2-\u09AC\u09C7\u09B8\u09A1 \u0995\u09CD\u09B2\u09BF\u09A8\u09BE\u09B0 \u09AC\u09BE \u09AE\u09BE\u0987\u09B8\u09C7\u09B2\u09BE\u09B0 \u0993\u09DF\u09BE\u099F\u09BE\u09B0 \u09A6\u09BF\u09DF\u09C7 \u09A4\u09CD\u09AC\u0995 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 \u098F\u09B0\u09AA\u09B0 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09CD\u0995\u09BF\u09A8 \u099F\u09BE\u0987\u09AA \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09AB\u09C7\u09B8\u0993\u09DF\u09BE\u09B6 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964</p>

<h3>\u09E9. \u09B0\u09C7\u0997\u09C1\u09B2\u09BE\u09B0 \u09AE\u09DF\u09C7\u09B6\u09CD\u099A\u09BE\u09B0\u09BE\u0987\u099C\u09BE\u09B0 \u0993 \u09B8\u09BE\u09A8\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0</h3>
<p>\u09B8\u09CD\u0995\u09BF\u09A8 \u099F\u09BE\u0987\u09AA \u09AF\u09C7\u09AE\u09A8\u0987 \u09B9\u09CB\u0995 \u09A8\u09BE \u0995\u09C7\u09A8, \u09AE\u09DF\u09C7\u09B6\u09CD\u099A\u09BE\u09B0\u09BE\u0987\u099C\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u099C\u09B0\u09C1\u09B0\u09BF\u0964 \u0986\u09B0 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AC\u09C7\u09B2\u09BE \u0998\u09B0\u09C7\u09B0 \u09AC\u09BE\u0987\u09B0\u09C7 \u09AC\u09BE \u09AD\u09C7\u09A4\u09B0\u09C7 \u09AF\u09C7\u0996\u09BE\u09A8\u09C7\u0987 \u09A5\u09BE\u0995\u09C1\u09A8 \u09A8\u09BE \u0995\u09C7\u09A8, \u0985\u09A8\u09CD\u09A4\u09A4 SPF 30+ \u09B8\u09AE\u09C3\u09A6\u09CD\u09A7 \u09B8\u09BE\u09A8\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09AD\u09C1\u09B2\u09AC\u09C7\u09A8 \u09A8\u09BE\u0964 \u098F\u099F\u09BF \u09A4\u09CD\u09AC\u0995\u09C7 \u09B8\u09BE\u09A8\u09AC\u09BE\u09B0\u09CD\u09A8 \u0993 \u0985\u0995\u09BE\u09B2 \u09AC\u09BE\u09B0\u09CD\u09A7\u0995\u09CD\u09AF \u09AA\u09CD\u09B0\u09A4\u09BF\u09B0\u09CB\u09A7 \u0995\u09B0\u09C7\u0964</p>

<h3>\u09EA. \u09B8\u09C1\u09B7\u09AE \u0996\u09BE\u09AC\u09BE\u09B0 \u0993 \u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u0998\u09C1\u09AE</h3>
<p>\u09AD\u09BF\u099F\u09BE\u09AE\u09BF\u09A8 \u09B8\u09BF \u098F\u09AC\u0982 \u0987 \u09B8\u09AE\u09C3\u09A6\u09CD\u09A7 \u09AB\u09B2\u09AE\u09C2\u09B2 \u09AF\u09C7\u09AE\u09A8 \u09B2\u09C7\u09AC\u09C1, \u09AA\u09C7\u09DF\u09BE\u09B0\u09BE, \u0995\u09AE\u09B2\u09BE \u0987\u09A4\u09CD\u09AF\u09BE\u09A6\u09BF \u0986\u09AA\u09A8\u09BE\u09B0 \u0996\u09BE\u09A6\u09CD\u09AF\u09A4\u09BE\u09B2\u09BF\u0995\u09BE\u09DF \u09B0\u09BE\u0996\u09C1\u09A8\u0964 \u098F\u099B\u09BE\u09DC\u09BE\u0993 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09ED-\u09EE \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09AD\u09BE\u09B2\u09CB \u0998\u09C1\u09AE \u09A4\u09CD\u09AC\u0995 \u0995\u09CB\u09B7\u09C7\u09B0 \u09AA\u09C1\u09A8\u09B0\u09CD\u0997\u09A0\u09A8\u09C7 \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09C7\u0964</p>

<h3>\u09EB. \u0998\u09B0\u09CB\u09DF\u09BE \u09AB\u09C7\u09B8\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0</h3>
<p>\u09B8\u09AA\u09CD\u09A4\u09BE\u09B9\u09C7 \u0985\u09A8\u09CD\u09A4\u09A4 \u098F\u0995\u09A6\u09BF\u09A8 \u09AC\u09C7\u09B8\u09A8, \u09AE\u09A7\u09C1 \u098F\u09AC\u0982 \u099F\u0995\u09A6\u0987 \u09AE\u09BF\u09B6\u09BF\u09DF\u09C7 \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09AB\u09C7\u09B8\u09AA\u09CD\u09AF\u09BE\u0995 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C7 \u09AE\u09C1\u0996\u09C7 \u09B2\u09BE\u0997\u09BE\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u0964 \u098F\u099F\u09BF \u09A4\u09CD\u09AC\u0995\u0995\u09C7 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u098F\u0995\u09CD\u09B8\u09AB\u09CB\u09B2\u09BF\u09DF\u09C7\u099F \u0995\u09B0\u09C7 \u098F\u09AC\u0982 \u0987\u09A8\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u0997\u09CD\u09B2\u09CB \u098F\u09A8\u09C7 \u09A6\u09C7\u09DF\u0964</p>

<p>\u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u09AF\u09A4\u09CD\u09A8 \u09A8\u09C7\u0993\u09DF\u09BE\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 \u09A7\u09BE\u09B0\u09BE\u09AC\u09BE\u09B9\u09BF\u0995\u09A4\u09BE \u09B8\u09AC\u099A\u09C7\u09DF\u09C7 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3\u0964 \u0986\u099C \u09A5\u09C7\u0995\u09C7\u0987 \u098F\u0987 \u09A8\u09BF\u09DF\u09AE\u0997\u09C1\u09B2\u09CB \u09AE\u09C7\u09A8\u09C7 \u099A\u09B2\u09BE \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982 \u0985\u09B2\u09CD\u09AA \u0995\u09BF\u099B\u09C1\u09A6\u09BF\u09A8\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF \u0995\u09B0\u09C1\u09A8!</p>`,
            banner_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
            author_name: "\u09B8\u09BE\u09AC\u09BF\u09B9\u09BE \u0987\u09DF\u09BE\u09B8\u09AE\u09BF\u09A8",
            published: 1
          },
          {
            id: "blog-2",
            title: "\u09AE\u09C7\u0995\u0986\u09AA \u09AC\u09CD\u09B0\u09BE\u09B6 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09B8\u09A0\u09BF\u0995 \u09A8\u09BF\u09DF\u09AE \u0993 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC",
            slug: "how-to-clean-makeup-brushes-correctly",
            summary: "\u0985\u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09AE\u09C7\u0995\u0986\u09AA \u09AC\u09CD\u09B0\u09BE\u09B6 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09B2\u09C7 \u09A4\u09CD\u09AC\u0995\u09C7 \u09AC\u09CD\u09B0\u09A3 \u0993 \u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964 \u09AC\u09CD\u09B0\u09BE\u09B6 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09B8\u09B9\u099C \u0993 \u09B8\u09A0\u09BF\u0995 \u09A8\u09BF\u09DF\u09AE\u099F\u09BF \u099C\u09C7\u09A8\u09C7 \u09A8\u09BF\u09A8 \u098F\u0987 \u09AC\u09CD\u09B2\u0997\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7\u0964",
            content: `<p>\u09AE\u09C7\u0995\u0986\u09AA\u09AA\u09CD\u09B0\u09C7\u09AE\u09C0\u09A6\u09C7\u09B0 \u0995\u09BE\u099B\u09C7 \u09AE\u09C7\u0995\u0986\u09AA \u09AC\u09CD\u09B0\u09BE\u09B6 \u098F\u09AC\u0982 \u09AC\u09CD\u09B2\u09C7\u09A8\u09CD\u09A1\u09BE\u09B0 \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09AE\u09C2\u09B2\u09CD\u09AF\u09AC\u09BE\u09A8 \u09B8\u09B0\u099E\u09CD\u099C\u09BE\u09AE\u0964 \u09A4\u09AC\u09C7 \u098F\u0997\u09C1\u09B2\u09CB \u09B8\u09A0\u09BF\u0995 \u09B8\u09AE\u09DF\u09C7 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09A8\u09BE \u0995\u09B0\u09BE \u09B9\u09B2\u09C7 \u09A4\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AE\u09BE\u09B0\u09BE\u09A4\u09CD\u09AE\u0995 \u0995\u09CD\u09B7\u09A4\u09BF\u0995\u09B0 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964 \u09A8\u09CB\u0982\u09B0\u09BE \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7 \u09AC\u09CD\u09AF\u09BE\u0995\u099F\u09C7\u09B0\u09BF\u09DF\u09BE \u099C\u09AE\u09C7 \u09A5\u09BE\u0995\u09C7, \u09AF\u09BE \u09A4\u09CD\u09AC\u0995\u09C7 \u09AC\u09CD\u09B0\u09A3, \u09AB\u09C1\u09B8\u0995\u09C1\u09DC\u09BF \u0993 \u0987\u09A8\u09AB\u09C7\u0995\u09B6\u09A8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964</p>

<h3>\u0995\u09C7\u09A8 \u09AE\u09C7\u0995\u0986\u09AA \u09AC\u09CD\u09B0\u09BE\u09B6 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8?</h3>
<ul>
  <li><strong>\u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u09B8\u09C1\u09B0\u0995\u09CD\u09B7\u09BE\u09DF:</strong> \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7 \u09A5\u09BE\u0995\u09BE \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09A4\u09C7\u09B2, \u09AE\u09C3\u09A4 \u099A\u09BE\u09AE\u09DC\u09BE \u098F\u09AC\u0982 \u09A7\u09C1\u09B2\u09BE\u09AC\u09BE\u09B2\u09BF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09A4\u09CD\u09AC\u0995\u09C7\u09B0 \u09B8\u0982\u09B8\u09CD\u09AA\u09B0\u09CD\u09B6\u09C7 \u0986\u09B8\u09C7, \u09AF\u09BE \u09AA\u09CB\u09B0\u09B8 \u09AC\u09CD\u09B2\u0995 \u0995\u09B0\u09C7 \u09A6\u09C7\u09DF\u0964</li>
  <li><strong>\u09AE\u09C7\u0995\u0986\u09AA\u09C7\u09B0 \u09AA\u09BE\u09B0\u09AB\u09C7\u0995\u09B6\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF:</strong> \u09A8\u09CB\u0982\u09B0\u09BE \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7 \u0986\u0997\u09C7 \u09B2\u09C7\u0997\u09C7 \u09A5\u09BE\u0995\u09BE \u09AE\u09C7\u0995\u0986\u09AA\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AE\u09C7\u0995\u0986\u09AA \u09AC\u09CD\u09B2\u09C7\u09A8\u09CD\u09A1 \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u0964</li>
  <li><strong>\u09AC\u09CD\u09B0\u09BE\u09B6\u09C7\u09B0 \u09B8\u09CD\u09A5\u09BE\u09DF\u09BF\u09A4\u09CD\u09AC \u09AC\u09BE\u09DC\u09BE\u09A4\u09C7:</strong> \u09A8\u09BF\u09DF\u09AE\u09BF\u09A4 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09B2\u09C7 \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7\u09B0 \u09AC\u09CD\u09B0\u09BF\u09B8\u09B2\u09B8 \u09A8\u09B0\u09AE \u0993 \u099F\u09C7\u0995\u09B8\u0987 \u09A5\u09BE\u0995\u09C7\u0964</li>
</ul>

<h3>\u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09B8\u09B9\u099C \u09A7\u09BE\u09AA\u09B8\u09AE\u09C2\u09B9:</h3>
<ol>
  <li><strong>\u09AC\u09CD\u09B0\u09BE\u09B6 \u09AD\u09C7\u099C\u09BE\u09A8\u09CB:</strong> \u09B9\u09BE\u09B2\u0995\u09BE \u0997\u09B0\u09AE \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7\u09B0 \u09AC\u09CD\u09B0\u09BF\u09B8\u09B2\u09B8 \u09AC\u09BE \u099A\u09C1\u09B2\u0997\u09C1\u09B2\u09CB \u09AD\u09BF\u099C\u09BF\u09DF\u09C7 \u09A8\u09BF\u09A8\u0964 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF \u09B0\u09BE\u0996\u09AC\u09C7\u09A8 \u09AF\u09C7\u09A8 \u09B9\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09C7\u09B2 \u098F\u09AC\u0982 \u09AC\u09CD\u09B0\u09BF\u09B8\u09B2\u09B8\u09C7\u09B0 \u09B8\u0982\u09AF\u09CB\u0997\u09B8\u09CD\u09A5\u09B2\u09C7 \u09AA\u09BE\u09A8\u09BF \u09A8\u09BE \u09AF\u09BE\u09DF, \u098F\u09A4\u09C7 \u0986\u09A0\u09BE \u0986\u09B2\u0997\u09BE \u09B9\u09DF\u09C7 \u099A\u09C1\u09B2 \u09AA\u09DC\u09C7 \u09AF\u09C7\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964</li>
  <li><strong>\u0995\u09CD\u09B2\u09BF\u09A8\u099C\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0:</strong> \u098F\u0995\u099F\u09BF \u09AA\u09BE\u09A4\u09CD\u09B0\u09C7 \u09B8\u09BE\u09AE\u09BE\u09A8\u09CD\u09AF \u09AC\u09C7\u09AC\u09BF \u09B6\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C1 \u0985\u09A5\u09AC\u09BE \u09AC\u09CD\u09B0\u09BE\u09B6 \u0995\u09CD\u09B2\u09BF\u09A8\u099C\u09BE\u09B0 \u09A8\u09BF\u09A8\u0964 \u09B8\u09C7\u0996\u09BE\u09A8\u09C7 \u09AC\u09CD\u09B0\u09BE\u09B6\u099F\u09BF \u0986\u09B2\u09A4\u09CB\u09AD\u09BE\u09AC\u09C7 \u0998\u09C1\u09B0\u09BF\u09DF\u09C7 \u09AB\u09C7\u09A8\u09BE \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8\u0964</li>
  <li><strong>\u09B8\u09CD\u0995\u09CD\u09B0\u09BE\u09AC\u09BF\u0982:</strong> \u09B9\u09BE\u09A4\u09C7\u09B0 \u09A4\u09BE\u09B2\u09C1\u09A4\u09C7 \u0985\u09A5\u09AC\u09BE \u098F\u0995\u099F\u09BF \u09B8\u09BF\u09B2\u09BF\u0995\u09A8 \u09B8\u09CD\u0995\u09CD\u09B0\u09BE\u09AC \u09AA\u09CD\u09AF\u09BE\u09A1\u09C7 \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7\u09B0 \u09AE\u09BE\u09A5\u09BE\u099F\u09BF \u0986\u09B2\u09A4\u09CB \u0995\u09B0\u09C7 \u0998\u09B7\u09C1\u09A8 \u09AF\u09BE\u09A4\u09C7 \u099C\u09AE\u09C7 \u09A5\u09BE\u0995\u09BE \u09AE\u09C7\u0995\u0986\u09AA \u0989\u09A0\u09C7 \u0986\u09B8\u09C7\u0964</li>
  <li><strong>\u09A7\u09C1\u09DF\u09C7 \u09AB\u09C7\u09B2\u09BE:</strong> \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF \u09A6\u09BF\u09DF\u09C7 \u09AC\u09CD\u09B0\u09BE\u09B6\u09C7\u09B0 \u09AE\u09BE\u09A5\u09BE\u099F\u09BF \u09A7\u09C1\u09DF\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8 \u09AF\u09A4\u0995\u09CD\u09B7\u09A3 \u09A8\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09AB\u09C7\u09A8\u09BE \u099A\u09B2\u09C7 \u09AF\u09BE\u09DF\u0964</li>
  <li><strong>\u09B6\u09C1\u0995\u09BE\u09A8\u09CB:</strong> \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09AA\u09BE\u09A8\u09BF \u099A\u09BF\u09AA\u09C7 \u09AC\u09C7\u09B0 \u0995\u09B0\u09C7 \u098F\u0995\u099F\u09BF \u09B6\u09C1\u0995\u09A8\u09BE \u09A4\u09CB\u09DF\u09BE\u09B2\u09C7\u09A4\u09C7 \u09AC\u09CD\u09B0\u09BE\u09B6\u0997\u09C1\u09B2\u09CB \u09B8\u09AE\u09BE\u09A8 \u0995\u09B0\u09C7 \u09AC\u09BF\u099B\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8\u0964 \u0995\u0996\u09A8\u09CB\u0987 \u09AC\u09CD\u09B0\u09BE\u09B6 \u09B8\u09CB\u099C\u09BE \u0996\u09BE\u09DC\u09BE \u0995\u09B0\u09C7 \u09B6\u09C1\u0995\u09BE\u09AC\u09C7\u09A8 \u09A8\u09BE, \u098F\u09A4\u09C7 \u09AA\u09BE\u09A8\u09BF \u09B9\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09C7\u09B2\u09C7\u09B0 \u09AD\u09C7\u09A4\u09B0\u09C7 \u099A\u09B2\u09C7 \u09AF\u09BE\u09DF\u0964</li>
</ol>

<p>\u09A8\u09BF\u09DF\u09AE\u09BF\u09A4 \u09B8\u09AA\u09CD\u09A4\u09BE\u09B9\u09C7 \u0985\u09A8\u09CD\u09A4\u09A4 \u098F\u0995\u09AC\u09BE\u09B0 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4 \u09AE\u09C7\u0995\u0986\u09AA \u09AC\u09CD\u09B0\u09BE\u09B6 \u0993 \u09B8\u09CD\u09AA\u099E\u09CD\u099C \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u0985\u09AD\u09CD\u09AF\u09BE\u09B8 \u0997\u09DC\u09C7 \u09A4\u09C1\u09B2\u09C1\u09A8 \u098F\u09AC\u0982 \u09A4\u09CD\u09AC\u0995\u0995\u09C7 \u09B0\u09BE\u0996\u09C1\u09A8 \u09B0\u09CB\u0997\u09AE\u09C1\u0995\u09CD\u09A4 \u0993 \u09B8\u09A4\u09C7\u099C!</p>`,
            banner_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            author_name: "\u09A4\u09BE\u09A8\u09BF\u09DF\u09BE \u09B0\u09B9\u09AE\u09BE\u09A8",
            published: 1
          }
        ];
        db.serialize(() => {
          const stmt = db.prepare(`
            INSERT INTO blog_posts (id, title, slug, summary, content, banner_image, author_name, published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          defaultBlogs.forEach((b) => {
            stmt.run([b.id, b.title, b.slug, b.summary, b.content, b.banner_image, b.author_name, b.published]);
          });
          stmt.finalize(() => {
            console.log("\u{1F331} Seeded 2 default blog posts into database.");
          });
        });
      }
    });
    console.log("\u2705 SQLite Schema verification & seeding completed.");
  });
}
var db_default = db;

// backend/routes/auth.ts
import { Router } from "express";

// backend/controllers/authController.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "super-premium-jwt-secret-key-1283";
var login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required" });
  }
  db_default.get(
    `SELECT e.*, r.name as role_name, r.permissions as role_permissions 
     FROM employees e 
     JOIN roles r ON e.role_id = r.id 
     WHERE e.email = ?`,
    [email],
    (err, employee) => {
      if (err) {
        console.error("Error fetching employee:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }
      if (!employee) {
        return res.status(401).json({ status: "error", message: "Invalid email or password" });
      }
      if (employee.status !== "active") {
        return res.status(403).json({ status: "error", message: "Account is inactive or suspended" });
      }
      bcrypt.compare(password, employee.password_hash, (err2, isMatch) => {
        if (err2 || !isMatch) {
          return res.status(401).json({ status: "error", message: "Invalid email or password" });
        }
        let permissions = [];
        if (employee.role_permissions) {
          try {
            permissions = JSON.parse(employee.role_permissions);
          } catch (e) {
          }
        }
        const token = jwt.sign(
          {
            id: employee.id,
            email: employee.email,
            role: employee.role_name,
            name: `${employee.first_name} ${employee.last_name}`,
            permissions
          },
          JWT_SECRET,
          { expiresIn: "8h" }
        );
        const lastLoginIp = req.ip || req.socket.remoteAddress || "";
        db_default.run(
          `UPDATE employees SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = ? WHERE id = ?`,
          [lastLoginIp, employee.id]
        );
        res.json({
          status: "success",
          message: "Login successful",
          data: {
            token,
            user: {
              id: employee.id,
              email: employee.email,
              name: `${employee.first_name} ${employee.last_name}`,
              role: employee.role_name,
              department: employee.department,
              avatar: employee.first_name.substring(0, 1) + employee.last_name.substring(0, 1),
              permissions
            }
          }
        });
      });
    }
  );
};
var logout = (req, res) => {
  res.json({ status: "success", message: "Logout successful" });
};
var getProfile = (req, res) => {
  res.json({ status: "success", data: req.user });
};

// backend/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "super-premium-jwt-secret-key-1283";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ status: "error", message: "Access token is required" });
  }
  jwt2.verify(token, JWT_SECRET2, (err, user) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};
var requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: "error", message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

// backend/routes/auth.ts
var router = Router();
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authenticateToken, getProfile);
var auth_default = router;

// backend/routes/products.ts
import { Router as Router2 } from "express";

// backend/services/cacheService.ts
import { createClient } from "redis";
import dotenv2 from "dotenv";
dotenv2.config();
var InMemoryCache = class {
  cache = /* @__PURE__ */ new Map();
  set(key, value, ttlSeconds) {
    const expiresAt = Date.now() + ttlSeconds * 1e3;
    this.cache.set(key, { value, expiresAt });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  del(key) {
    this.cache.delete(key);
  }
  delPattern(pattern) {
    const cleanPattern = pattern.replace(/\*/g, ".*");
    const regex = new RegExp("^" + cleanPattern + "$");
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
};
var memoryCache = new InMemoryCache();
var redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var DEFAULT_TTL = parseInt(process.env.CACHE_TTL || "3600");
var redisClient = null;
var isRedisConnected = false;
if (process.env.REDIS_ENABLED !== "false") {
  redisClient = createClient({ url: redisUrl });
  redisClient.on("error", (err) => {
    if (isRedisConnected) {
      console.warn("\u26A0\uFE0F Redis connection lost. Falling back to In-Memory Cache.");
    }
    isRedisConnected = false;
  });
  redisClient.on("connect", () => {
    console.log("\u{1F50C} Connected to Redis cache server.");
    isRedisConnected = true;
  });
  redisClient.connect().catch(() => {
    console.warn("\u26A0\uFE0F Redis server unreachable. Falling back to In-Memory Cache.");
    isRedisConnected = false;
  });
}
var cacheService = {
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (isRedisConnected && redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (err) {
      console.error(`Error reading key "${key}" from Redis:`, err);
    }
    return memoryCache.get(key);
  },
  /**
   * Set value in cache
   */
  async set(key, value, ttlSeconds = DEFAULT_TTL) {
    const serialized = JSON.stringify(value);
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.set(key, serialized, {
          EX: ttlSeconds
        });
        return;
      }
    } catch (err) {
      console.error(`Error writing key "${key}" to Redis:`, err);
    }
    memoryCache.set(key, value, ttlSeconds);
  },
  /**
   * Delete specific key from cache
   */
  async del(key) {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.del(key);
        return;
      }
    } catch (err) {
      console.error(`Error deleting key "${key}" from Redis:`, err);
    }
    memoryCache.del(key);
  },
  /**
   * Delete keys matching a pattern (e.g. "products:*")
   */
  async delPattern(pattern) {
    try {
      if (isRedisConnected && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
        return;
      }
    } catch (err) {
      console.error(`Error deleting pattern "${pattern}" from Redis:`, err);
    }
    memoryCache.delPattern(pattern);
  },
  /**
   * Wrapper helper: Checks if key exists, if not, runs fetchFn, caches result, and returns
   */
  async getOrSet(key, ttlSeconds, fetchFn) {
    const cached = await this.get(key);
    if (cached !== null && cached !== void 0) {
      return cached;
    }
    const freshData = await fetchFn();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }
};

// backend/controllers/productsController.ts
var getProducts = async (req, res) => {
  try {
    const cacheKey = "products:all";
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({ status: "success", data: cachedData });
    }
    db_default.all(`SELECT * FROM products`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      const parsedRows = (rows || []).map((row) => {
        let features = [];
        let specs = [];
        try {
          if (row.features) features = JSON.parse(row.features);
        } catch (e) {
          console.error(`Error parsing features for product ${row.id}:`, e);
        }
        try {
          if (row.specs) specs = JSON.parse(row.specs);
        } catch (e) {
          console.error(`Error parsing specs for product ${row.id}:`, e);
        }
        return {
          ...row,
          features,
          specs,
          published: row.published === 1,
          in_stock: row.in_stock === 1
        };
      });
      cacheService.set(cacheKey, parsedRows, 300).catch(console.error);
      res.json({ status: "success", data: parsedRows });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
var getProductById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `products:id:${id}`;
  try {
    const cachedProduct = await cacheService.get(cacheKey);
    if (cachedProduct) {
      return res.json({ status: "success", data: cachedProduct });
    }
    db_default.get(`SELECT * FROM products WHERE id = ?`, [id], (err, product) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      if (!product) {
        return res.status(404).json({ status: "error", message: "Product not found" });
      }
      db_default.all(`SELECT image_url FROM product_gallery WHERE product_id = ?`, [id], (err2, galleryRows) => {
        const gallery = galleryRows ? galleryRows.map((r) => r.image_url) : [];
        let features = [];
        let specs = [];
        try {
          if (product.features) features = JSON.parse(product.features);
        } catch (e) {
          console.error(`Error parsing features for product ${product.id}:`, e);
        }
        try {
          if (product.specs) specs = JSON.parse(product.specs);
        } catch (e) {
          console.error(`Error parsing specs for product ${product.id}:`, e);
        }
        const resultData = {
          ...product,
          features,
          specs,
          published: product.published === 1,
          in_stock: product.in_stock === 1,
          gallery: gallery.length > 0 ? gallery : [product.image]
        };
        cacheService.set(cacheKey, resultData, 300).catch(console.error);
        res.json({ status: "success", data: resultData });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
var createProduct = (req, res) => {
  const { name, slug, sku, brand, category, price, original_price, image, description, stock, published, features, specs, gallery } = req.body;
  const id = "PRD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  db_default.serialize(() => {
    db_default.run("BEGIN TRANSACTION");
    db_default.run(
      `INSERT INTO products (id, name, slug, sku, brand, category, price, original_price, image, description, stock, published, features, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        slug,
        sku,
        brand,
        category,
        price,
        original_price,
        image,
        description,
        stock || 0,
        published ? 1 : 0,
        JSON.stringify(features || []),
        JSON.stringify(specs || [])
      ],
      function(err) {
        if (err) {
          db_default.run("ROLLBACK");
          console.error(err);
          return res.status(500).json({ status: "error", message: err.message });
        }
        if (gallery && Array.isArray(gallery)) {
          const stmt = db_default.prepare(`INSERT INTO product_gallery (product_id, image_url) VALUES (?, ?)`);
          gallery.forEach((img) => {
            if (img.trim()) {
              stmt.run([id, img.trim()]);
            }
          });
          stmt.finalize();
        }
        db_default.run("COMMIT", (err2) => {
          if (err2) {
            db_default.run("ROLLBACK");
            return res.status(500).json({ status: "error", message: "Failed to commit transaction" });
          }
          cacheService.delPattern("products:*").catch(console.error);
          res.json({ status: "success", message: "Product created", data: { id } });
        });
      }
    );
  });
};
var updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, original_price, stock, description, image, brand, category, published, features, specs, gallery } = req.body;
  db_default.serialize(() => {
    db_default.run("BEGIN TRANSACTION");
    db_default.run(
      `UPDATE products 
       SET name = COALESCE(?, name), 
           price = COALESCE(?, price), 
           original_price = COALESCE(?, original_price), 
           stock = COALESCE(?, stock), 
           description = COALESCE(?, description), 
           image = COALESCE(?, image),
           brand = COALESCE(?, brand),
           category = COALESCE(?, category),
           published = COALESCE(?, published),
           features = COALESCE(?, features),
           specs = COALESCE(?, specs)
       WHERE id = ?`,
      [
        name,
        price,
        original_price,
        stock,
        description,
        image,
        brand,
        category,
        published === void 0 ? null : published ? 1 : 0,
        features ? JSON.stringify(features) : null,
        specs ? JSON.stringify(specs) : null,
        id
      ],
      function(err) {
        if (err) {
          db_default.run("ROLLBACK");
          console.error(err);
          return res.status(500).json({ status: "error", message: "Database error" });
        }
        if (gallery && Array.isArray(gallery)) {
          db_default.run(`DELETE FROM product_gallery WHERE product_id = ?`, [id], (err2) => {
            if (err2) {
              db_default.run("ROLLBACK");
              return res.status(500).json({ status: "error", message: "Failed to clear old gallery" });
            }
            const stmt = db_default.prepare(`INSERT INTO product_gallery (product_id, image_url) VALUES (?, ?)`);
            gallery.forEach((img) => {
              if (img.trim()) {
                stmt.run([id, img.trim()]);
              }
            });
            stmt.finalize();
            db_default.run("COMMIT", (err3) => {
              if (err3) {
                db_default.run("ROLLBACK");
                return res.status(500).json({ status: "error", message: "Failed to commit transaction" });
              }
              cacheService.delPattern("products:*").catch(console.error);
              res.json({ status: "success", message: "Product updated" });
            });
          });
        } else {
          db_default.run("COMMIT", (err2) => {
            if (err2) {
              db_default.run("ROLLBACK");
              return res.status(500).json({ status: "error", message: "Failed to commit transaction" });
            }
            cacheService.delPattern("products:*").catch(console.error);
            res.json({ status: "success", message: "Product updated" });
          });
        }
      }
    );
  });
};
var deleteProduct = (req, res) => {
  const { id } = req.params;
  db_default.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    cacheService.delPattern("products:*").catch(console.error);
    res.json({ status: "success", message: "Product deleted" });
  });
};
var getFacebookFeed = (req, res) => {
  const escapeXml = (unsafe) => {
    if (unsafe === null || unsafe === void 0) return "";
    return String(unsafe).replace(/[&<>'"]/g, (c) => {
      switch (c) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  };
  db_default.all(`SELECT * FROM products WHERE published = 1`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    const domain = "https://beauty-elegance-ec88f.web.app";
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
`;
    xml += `  <channel>
`;
    xml += `    <title>AURA Sports - Facebook Catalog Feed</title>
`;
    xml += `    <link>${domain}</link>
`;
    xml += `    <description>Dynamic Product Catalog Feed for Facebook Ads</description>
`;
    rows.forEach((p) => {
      const rawDesc = p.description || `${p.name} - Premium sports item from AURA Sports.`;
      const cleanDesc = rawDesc.replace(/<[^>]*>/g, "");
      let imageLink = p.image || "";
      if (imageLink && !imageLink.startsWith("http")) {
        imageLink = `${domain}${imageLink.startsWith("/") ? "" : "/"}${imageLink}`;
      }
      const inStock = p.in_stock === 1 || p.stock > 0;
      const availability = inStock ? "in stock" : "out of stock";
      const priceFormatted = `${p.price} BDT`;
      xml += `    <item>
`;
      xml += `      <g:id>${escapeXml(p.id)}</g:id>
`;
      xml += `      <g:title>${escapeXml(p.name)}</g:title>
`;
      xml += `      <g:description>${escapeXml(cleanDesc)}</g:description>
`;
      xml += `      <g:link>${escapeXml(`${domain}/product/${p.id}`)}</g:link>
`;
      xml += `      <g:image_link>${escapeXml(imageLink)}</g:image_link>
`;
      xml += `      <g:brand>${escapeXml(p.brand || "AURA Sports")}</g:brand>
`;
      xml += `      <g:condition>new</g:condition>
`;
      xml += `      <g:availability>${escapeXml(availability)}</g:availability>
`;
      xml += `      <g:price>${escapeXml(priceFormatted)}</g:price>
`;
      if (p.category) {
        xml += `      <g:google_product_category>${escapeXml(p.category)}</g:google_product_category>
`;
      }
      xml += `    </item>
`;
    });
    xml += `  </channel>
`;
    xml += `</rss>
`;
    res.header("Content-Type", "text/xml; charset=utf-8");
    res.send(xml);
  });
};

// backend/routes/products.ts
var router2 = Router2();
router2.get("/", getProducts);
router2.get("/facebook-feed", getFacebookFeed);
router2.get("/:id", getProductById);
router2.post("/", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), createProduct);
router2.put("/:id", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), updateProduct);
router2.delete("/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteProduct);
var products_default = router2;

// backend/routes/orders.ts
import { Router as Router3 } from "express";

// backend/controllers/ordersController.ts
var getOrders = (req, res) => {
  db_default.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, orderRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    if (!orderRows || orderRows.length === 0) {
      return res.json({ status: "success", data: [] });
    }
    db_default.all(`SELECT * FROM order_items`, [], (err2, itemRows) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      const ordersWithItems = orderRows.map((order) => {
        const items = itemRows ? itemRows.filter((item) => item.order_id === order.id) : [];
        return {
          ...order,
          productsList: items.map((item) => ({
            name: item.product_name,
            color: item.color,
            size: item.size,
            code: item.code,
            quantity: item.quantity,
            price: item.price
          }))
        };
      });
      res.json({ status: "success", data: ordersWithItems });
    });
  });
};
var getOrderById = (req, res) => {
  const { id } = req.params;
  db_default.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, order) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    if (!order) {
      return res.status(404).json({ status: "error", message: "Order not found" });
    }
    db_default.all(`SELECT * FROM order_items WHERE order_id = ?`, [id], (err2, items) => {
      res.json({
        status: "success",
        data: {
          ...order,
          productsList: items || []
        }
      });
    });
  });
};
var createOrder = (req, res) => {
  const {
    customer,
    email,
    amount,
    items,
    paymentMethod,
    storeName,
    phone,
    address,
    courier,
    city,
    thana,
    area,
    customerNote,
    shopNote,
    paymentType,
    memoNumber,
    deliveryCharge,
    discount,
    paidAmount,
    subtotal,
    productsList
  } = req.body;
  const id = "ORD-" + Math.floor(1e4 + Math.random() * 9e4);
  db_default.serialize(() => {
    db_default.run("BEGIN TRANSACTION");
    db_default.run(
      `INSERT INTO orders (
        id, customer, email, amount, items, payment_method, store_name, phone, address, 
        courier, city, thana, area, customer_note, shop_note, payment_type, memo_number, 
        delivery_charge, discount, paid_amount, subtotal, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        id,
        customer,
        email,
        amount,
        items,
        paymentMethod,
        storeName,
        phone,
        address,
        courier,
        city,
        thana,
        area,
        customerNote,
        shopNote,
        paymentType,
        memoNumber,
        deliveryCharge,
        discount,
        paidAmount,
        subtotal
      ],
      function(err) {
        if (err) {
          db_default.run("ROLLBACK");
          console.error(err);
          return res.status(500).json({ status: "error", message: "Failed to create order" });
        }
        if (productsList && Array.isArray(productsList)) {
          const stmt = db_default.prepare(
            `INSERT INTO order_items (order_id, product_name, color, size, code, quantity, price) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          );
          productsList.forEach((item) => {
            stmt.run([id, item.name, item.color || "Default", item.size || "Free Size", item.code, item.quantity, item.price]);
          });
          stmt.finalize();
        }
        db_default.run("COMMIT", (err2) => {
          if (err2) {
            db_default.run("ROLLBACK");
            return res.status(500).json({ status: "error", message: "Failed to commit transaction" });
          }
          cacheService.del("dashboard:stats").catch(console.error);
          res.json({ status: "success", message: "Order created successfully", data: { id } });
        });
      }
    );
  });
};
var updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db_default.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    cacheService.del("dashboard:stats").catch(console.error);
    res.json({ status: "success", message: "Order status updated" });
  });
};
var updateOrder = (req, res) => {
  const { id } = req.params;
  const {
    customer,
    email,
    amount,
    items,
    paymentMethod,
    storeName,
    phone,
    address,
    courier,
    city,
    thana,
    area,
    customerNote,
    shopNote,
    paymentType,
    memoNumber,
    deliveryCharge,
    discount,
    paidAmount,
    subtotal,
    status,
    productsList
  } = req.body;
  db_default.serialize(() => {
    db_default.run("BEGIN TRANSACTION");
    db_default.run(
      `UPDATE orders 
       SET customer = ?, email = ?, amount = ?, items = ?, payment_method = ?, store_name = ?, phone = ?, address = ?, 
           courier = ?, city = ?, thana = ?, area = ?, customer_note = ?, shop_note = ?, payment_type = ?, memo_number = ?, 
           delivery_charge = ?, discount = ?, paid_amount = ?, subtotal = ?, status = ?
       WHERE id = ?`,
      [
        customer,
        email,
        amount,
        items,
        paymentMethod,
        storeName,
        phone,
        address,
        courier,
        city,
        thana,
        area,
        customerNote,
        shopNote,
        paymentType,
        memoNumber,
        deliveryCharge,
        discount,
        paidAmount,
        subtotal,
        status,
        id
      ],
      function(err) {
        if (err) {
          db_default.run("ROLLBACK");
          console.error(err);
          return res.status(500).json({ status: "error", message: "Failed to update order in database" });
        }
        db_default.run("DELETE FROM order_items WHERE order_id = ?", [id], (err2) => {
          if (err2) {
            db_default.run("ROLLBACK");
            console.error(err2);
            return res.status(500).json({ status: "error", message: "Failed to update order items" });
          }
          if (productsList && Array.isArray(productsList)) {
            const stmt = db_default.prepare(
              `INSERT INTO order_items (order_id, product_name, color, size, code, quantity, price) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            );
            productsList.forEach((item) => {
              stmt.run([id, item.name, item.color || "Default", item.size || "Free Size", item.code, item.quantity, item.price]);
            });
            stmt.finalize();
          }
          db_default.run("COMMIT", (err3) => {
            if (err3) {
              db_default.run("ROLLBACK");
              return res.status(500).json({ status: "error", message: "Failed to commit transaction" });
            }
            cacheService.del("dashboard:stats").catch(console.error);
            res.json({ status: "success", message: "Order updated successfully" });
          });
        });
      }
    );
  });
};

// backend/routes/orders.ts
var router3 = Router3();
router3.post("/", createOrder);
router3.get("/", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), getOrders);
router3.get("/:id", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), getOrderById);
router3.put("/:id", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), updateOrder);
router3.put("/:id/status", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), updateOrderStatus);
var orders_default = router3;

// backend/routes/customers.ts
import { Router as Router4 } from "express";

// backend/controllers/customersController.ts
import bcrypt2 from "bcryptjs";
import jwt3 from "jsonwebtoken";
var JWT_SECRET3 = process.env.JWT_SECRET || "super-premium-jwt-secret-key-1283";
var parseName = (fullName) => {
  const parts = fullName.trim().split(" ");
  const first_name = parts[0] || "";
  const last_name = parts.slice(1).join(" ") || "";
  return { first_name, last_name };
};
var registerCustomer = (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: "error", message: "Name, email, and password are required" });
  }
  db_default.get("SELECT id FROM customers WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error("Error checking customer email:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    if (row) {
      return res.status(400).json({ status: "error", message: "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u09A6\u09BF\u09DF\u09C7 \u0985\u09B2\u09B0\u09C7\u09A1\u09BF \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09BE \u0986\u099B\u09C7" });
    }
    bcrypt2.hash(password, 10, (err2, hash) => {
      if (err2) {
        return res.status(500).json({ status: "error", message: "Error hashing password" });
      }
      const { first_name, last_name } = parseName(name);
      const customerId = `cust-${Date.now()}`;
      db_default.run(
        `INSERT INTO customers (id, first_name, last_name, email, password_hash, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customerId, first_name, last_name, email, hash, phone || ""],
        function(err3) {
          if (err3) {
            console.error("Error creating customer:", err3);
            return res.status(500).json({ status: "error", message: "Failed to create customer" });
          }
          const token = jwt3.sign(
            { id: customerId, email, role: "customer", name },
            JWT_SECRET3,
            { expiresIn: "30d" }
          );
          res.json({
            status: "success",
            data: {
              token,
              customer: {
                id: customerId,
                name,
                email,
                phone: phone || "",
                address: "",
                createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                addresses: []
              }
            }
          });
        }
      );
    });
  });
};
var loginCustomer = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required" });
  }
  db_default.get("SELECT * FROM customers WHERE email = ?", [email], (err, customer) => {
    if (err) {
      console.error("Error login customer:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    if (!customer) {
      return res.status(401).json({ status: "error", message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2 \u0985\u09A5\u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF" });
    }
    if (customer.status !== "active") {
      return res.status(403).json({ status: "error", message: "\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u099F\u09BF \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8\u09C7 \u09A8\u09BF\u09B7\u09CD\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09B0\u09DF\u09C7\u099B\u09C7" });
    }
    bcrypt2.compare(password, customer.password_hash, (err2, isMatch) => {
      if (err2 || !isMatch) {
        return res.status(401).json({ status: "error", message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u0987\u09AE\u09C7\u0987\u09B2 \u0985\u09A5\u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF" });
      }
      db_default.all(
        "SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC",
        [customer.id],
        (err3, rows) => {
          const addresses = (rows || []).map((r) => ({
            id: r.id,
            label: r.label,
            name: r.name,
            phone: r.phone,
            address: r.address,
            isDefault: r.is_default === 1
          }));
          const fullName = `${customer.first_name} ${customer.last_name}`.trim();
          const token = jwt3.sign(
            { id: customer.id, email: customer.email, role: "customer", name: fullName },
            JWT_SECRET3,
            { expiresIn: "30d" }
          );
          res.json({
            status: "success",
            data: {
              token,
              customer: {
                id: customer.id,
                name: fullName,
                email: customer.email,
                phone: customer.phone || "",
                address: customer.address || "",
                createdAt: customer.created_at,
                avatar: fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
                addresses
              }
            }
          });
        }
      );
    });
  });
};
var loginGmailCustomer = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ status: "error", message: "Google ID Token is required" });
  }
  try {
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleResponse.ok) {
      return res.status(400).json({ status: "error", message: "\u0997\u09C1\u0997\u09B2 \u099F\u09CB\u0995\u09C7\u09A8 \u09AD\u09C7\u09B0\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7" });
    }
    const payload = await googleResponse.json();
    const googleClientId = "284151905011-fs0mh1j6rdug41p2hk882bjl1vq9nmb2.apps.googleusercontent.com";
    if (payload.aud !== googleClientId) {
      return res.status(400).json({ status: "error", message: "Invalid token audience" });
    }
    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    db_default.get("SELECT * FROM customers WHERE email = ?", [email], (err, existing) => {
      if (err) {
        console.error("Error with Gmail customer:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      if (existing) {
        db_default.all(
          "SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC",
          [existing.id],
          (err2, rows) => {
            const addresses = (rows || []).map((r) => ({
              id: r.id,
              label: r.label,
              name: r.name,
              phone: r.phone,
              address: r.address,
              isDefault: r.is_default === 1
            }));
            const fullName = `${existing.first_name} ${existing.last_name}`.trim();
            const token = jwt3.sign(
              { id: existing.id, email: existing.email, role: "customer", name: fullName },
              JWT_SECRET3,
              { expiresIn: "30d" }
            );
            res.json({
              status: "success",
              data: {
                token,
                customer: {
                  id: existing.id,
                  name: fullName,
                  email: existing.email,
                  phone: existing.phone || "",
                  address: existing.address || "",
                  createdAt: existing.created_at,
                  avatar: fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
                  isGmail: true,
                  addresses
                }
              }
            });
          }
        );
      } else {
        const { first_name, last_name } = parseName(name);
        const customerId = `cust-${Date.now()}`;
        const dummyHash = "gmail_oauth_dummy";
        db_default.run(
          `INSERT INTO customers (id, first_name, last_name, email, password_hash, phone)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [customerId, first_name, last_name, email, dummyHash, ""],
          function(err2) {
            if (err2) {
              console.error("Error creating Gmail customer:", err2);
              return res.status(500).json({ status: "error", message: "Database write failed" });
            }
            const token = jwt3.sign(
              { id: customerId, email, role: "customer", name },
              JWT_SECRET3,
              { expiresIn: "30d" }
            );
            res.json({
              status: "success",
              data: {
                token,
                customer: {
                  id: customerId,
                  name,
                  email,
                  phone: "",
                  address: "",
                  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                  avatar: name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
                  isGmail: true,
                  addresses: []
                }
              }
            });
          }
        );
      }
    });
  } catch (error) {
    console.error("Google verification request error:", error);
    return res.status(500).json({ status: "error", message: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09AD\u09C7\u09B0\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7" });
  }
};
var getCustomerProfile = (req, res) => {
  const customerId = req.user.id;
  db_default.get("SELECT * FROM customers WHERE id = ?", [customerId], (err, customer) => {
    if (err || !customer) {
      return res.status(404).json({ status: "error", message: "Customer profile not found" });
    }
    db_default.all(
      "SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC",
      [customerId],
      (err2, rows) => {
        const addresses = (rows || []).map((r) => ({
          id: r.id,
          label: r.label,
          name: r.name,
          phone: r.phone,
          address: r.address,
          isDefault: r.is_default === 1
        }));
        const fullName = `${customer.first_name} ${customer.last_name}`.trim();
        res.json({
          status: "success",
          data: {
            id: customer.id,
            name: fullName,
            email: customer.email,
            phone: customer.phone || "",
            address: customer.address || "",
            createdAt: customer.created_at,
            avatar: fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
            addresses
          }
        });
      }
    );
  });
};
var updateCustomerProfile = (req, res) => {
  const customerId = req.user.id;
  const { name, phone, address } = req.body;
  if (!name) {
    return res.status(400).json({ status: "error", message: "Name is required" });
  }
  const { first_name, last_name } = parseName(name);
  db_default.run(
    `UPDATE customers 
     SET first_name = ?, last_name = ?, phone = ?, address = ? 
     WHERE id = ?`,
    [first_name, last_name, phone || "", address || "", customerId],
    function(err) {
      if (err) {
        console.error("Error updating customer profile:", err);
        return res.status(500).json({ status: "error", message: "Update failed" });
      }
      res.json({
        status: "success",
        message: "Profile updated successfully"
      });
    }
  );
};
var getAddresses = (req, res) => {
  const customerId = req.user.id;
  db_default.all(
    "SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC",
    [customerId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      const addresses = (rows || []).map((r) => ({
        id: r.id,
        label: r.label,
        name: r.name,
        phone: r.phone,
        address: r.address,
        isDefault: r.is_default === 1
      }));
      res.json({ status: "success", data: addresses });
    }
  );
};
var addAddress = (req, res) => {
  const customerId = req.user.id;
  const { label, name, phone, address, isDefault } = req.body;
  if (!label || !name || !phone || !address) {
    return res.status(400).json({ status: "error", message: "Label, Name, Phone, and Address are required" });
  }
  const addressId = `addr-${Date.now()}`;
  db_default.get("SELECT COUNT(*) as count FROM customer_addresses WHERE customer_id = ?", [customerId], (err, row) => {
    const isFirst = !err && row && row.count === 0;
    const shouldBeDefault = isFirst ? 1 : isDefault ? 1 : 0;
    const insertAddress = () => {
      db_default.run(
        `INSERT INTO customer_addresses (id, customer_id, label, name, phone, address, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [addressId, customerId, label, name, phone, address, shouldBeDefault],
        function(err2) {
          if (err2) {
            console.error("Error adding address:", err2);
            return res.status(500).json({ status: "error", message: "Database error" });
          }
          res.json({
            status: "success",
            data: { id: addressId, label, name, phone, address, isDefault: shouldBeDefault === 1 }
          });
        }
      );
    };
    if (shouldBeDefault === 1) {
      db_default.run("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", [customerId], (err2) => {
        insertAddress();
      });
    } else {
      insertAddress();
    }
  });
};
var updateAddress = (req, res) => {
  const customerId = req.user.id;
  const addressId = req.params.id;
  const { label, name, phone, address, isDefault } = req.body;
  const runUpdate = () => {
    db_default.run(
      `UPDATE customer_addresses 
       SET label = ?, name = ?, phone = ?, address = ?, is_default = ?
       WHERE id = ? AND customer_id = ?`,
      [label, name, phone, address, isDefault ? 1 : 0, addressId, customerId],
      function(err) {
        if (err) {
          console.error("Error updating address:", err);
          return res.status(500).json({ status: "error", message: "Database error" });
        }
        res.json({ status: "success", message: "Address updated successfully" });
      }
    );
  };
  if (isDefault) {
    db_default.run("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", [customerId], (err) => {
      runUpdate();
    });
  } else {
    runUpdate();
  }
};
var deleteAddress = (req, res) => {
  const customerId = req.user.id;
  const addressId = req.params.id;
  db_default.get(
    "SELECT is_default FROM customer_addresses WHERE id = ? AND customer_id = ?",
    [addressId, customerId],
    (err, row) => {
      if (err || !row) {
        return res.status(444).json({ status: "error", message: "Address not found" });
      }
      const wasDefault = row.is_default === 1;
      db_default.run(
        "DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?",
        [addressId, customerId],
        function(err2) {
          if (err2) {
            return res.status(500).json({ status: "error", message: "Database error" });
          }
          if (wasDefault) {
            db_default.get(
              "SELECT id FROM customer_addresses WHERE customer_id = ? LIMIT 1",
              [customerId],
              (err3, another) => {
                if (another) {
                  db_default.run(
                    "UPDATE customer_addresses SET is_default = 1 WHERE id = ?",
                    [another.id]
                  );
                }
              }
            );
          }
          res.json({ status: "success", message: "Address deleted successfully" });
        }
      );
    }
  );
};
var setDefaultAddress = (req, res) => {
  const customerId = req.user.id;
  const addressId = req.params.id;
  db_default.run("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?", [customerId], (err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    db_default.run(
      "UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND customer_id = ?",
      [addressId, customerId],
      function(err2) {
        if (err2) {
          return res.status(500).json({ status: "error", message: "Database error" });
        }
        res.json({ status: "success", message: "Address set as default" });
      }
    );
  });
};

// backend/routes/customers.ts
var router4 = Router4();
router4.post("/register", registerCustomer);
router4.post("/login", loginCustomer);
router4.post("/login-gmail", loginGmailCustomer);
router4.get("/profile", authenticateToken, getCustomerProfile);
router4.put("/profile", authenticateToken, updateCustomerProfile);
router4.get("/addresses", authenticateToken, getAddresses);
router4.post("/addresses", authenticateToken, addAddress);
router4.put("/addresses/:id", authenticateToken, updateAddress);
router4.delete("/addresses/:id", authenticateToken, deleteAddress);
router4.put("/addresses/:id/default", authenticateToken, setDefaultAddress);
var customers_default = router4;

// backend/routes/dashboard.ts
import { Router as Router5 } from "express";

// backend/controllers/dashboardController.ts
var dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db_default.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};
var dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db_default.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
var getDashboardStats = async (req, res) => {
  try {
    const cacheKey = "dashboard:stats";
    const cachedStats = await cacheService.get(cacheKey);
    if (cachedStats) {
      const currentVisitors2 = Math.floor(1800 + Math.random() * 800);
      cachedStats.stats.liveVisitors = currentVisitors2;
      cachedStats.visitorStats.current = currentVisitors2;
      return res.json({ status: "success", data: cachedStats });
    }
    const totalRevRow = await dbGet(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned')`);
    const totalRevenue = totalRevRow?.sum || 0;
    const todayRevRow = await dbGet(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND date(created_at, 'localtime') = date('now', 'localtime')`);
    const todayRevenue = todayRevRow?.sum || 0;
    const monthlyRevRow = await dbGet(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')`);
    const monthlyRevenue = monthlyRevRow?.sum || 0;
    const yearlyRevRow = await dbGet(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND strftime('%Y', created_at, 'localtime') = strftime('%Y', 'now', 'localtime')`);
    const yearlyRevenue = yearlyRevRow?.sum || 0;
    const yesterdayRevRow = await dbGet(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND date(created_at, 'localtime') = date('now', '-1 day', 'localtime')`);
    const yesterdayRevenue = yesterdayRevRow?.sum || 0;
    const lastMonthRevRow = await dbGet(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', '-1 month', 'localtime')`);
    const lastMonthRevenue = lastMonthRevRow?.sum || 0;
    const totalOrdersRow = await dbGet(`SELECT COUNT(*) as count FROM orders`);
    const totalOrders = totalOrdersRow?.count || 0;
    const totalCustomersRow = await dbGet(`SELECT COUNT(*) as count FROM customers`);
    const totalCustomers = totalCustomersRow?.count || 0;
    const todayChange = yesterdayRevenue > 0 ? parseFloat(((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)) : 12.4;
    const monthlyChange = lastMonthRevenue > 0 ? parseFloat(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)) : 8.2;
    const yearlyChange = 15.6;
    const netProfit = parseFloat((totalRevenue * 0.3).toFixed(2));
    const grossProfit = parseFloat((totalRevenue * 0.5).toFixed(2));
    const monthlyRows = await dbAll(`
      SELECT strftime('%Y-%m', created_at, 'localtime') as month_str, SUM(amount) as total 
      FROM orders 
      WHERE status NOT IN ('cancelled', 'returned') 
        AND created_at >= date('now', '-6 month', 'start of month') 
      GROUP BY month_str
    `);
    const monthlyRevenueData = [];
    for (let i = 5; i >= 0; i--) {
      const dateObj = /* @__PURE__ */ new Date();
      dateObj.setMonth(dateObj.getMonth() - i);
      const monthStr = dateObj.toLocaleString("en-US", { month: "short" });
      const yearMonth = dateObj.toISOString().slice(0, 7);
      const row = monthlyRows.find((r) => r.month_str === yearMonth);
      const val = row ? row.total : 0;
      monthlyRevenueData.push({
        name: monthStr,
        value: val,
        value2: parseFloat((val * 0.3).toFixed(2))
        // 30% profit
      });
    }
    const dailyRows = await dbAll(`
      SELECT date(created_at, 'localtime') as date_str, SUM(amount) as total 
      FROM orders 
      WHERE status NOT IN ('cancelled', 'returned') 
        AND created_at >= date('now', '-30 day') 
      GROUP BY date_str
    `);
    const dailyRevenueData = [];
    for (let i = 29; i >= 0; i--) {
      const dateObj = /* @__PURE__ */ new Date();
      dateObj.setDate(dateObj.getDate() - i);
      const dayName = `${dateObj.getDate()} ${dateObj.toLocaleString("en-US", { month: "short" })}`;
      const dateStr = dateObj.toISOString().slice(0, 10);
      const row = dailyRows.find((r) => r.date_str === dateStr);
      const val = row ? row.total : 0;
      dailyRevenueData.push({
        name: dayName,
        value: val,
        value2: parseFloat((val * 0.3).toFixed(2))
      });
    }
    const hourlyRows = await dbAll(`
      SELECT strftime('%H', created_at, 'localtime') as hour_str, COUNT(*) as count 
      FROM orders 
      WHERE date(created_at, 'localtime') = date('now', 'localtime') 
      GROUP BY hour_str
    `);
    const hourlySalesData = [];
    const hourSlots = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
    const slotCounts = { "00:00": 0, "04:00": 0, "08:00": 0, "12:00": 0, "16:00": 0, "20:00": 0 };
    hourlyRows.forEach((r) => {
      const hr = parseInt(r.hour_str);
      if (hr >= 0 && hr < 4) slotCounts["00:00"] += r.count;
      else if (hr >= 4 && hr < 8) slotCounts["04:00"] += r.count;
      else if (hr >= 8 && hr < 12) slotCounts["08:00"] += r.count;
      else if (hr >= 12 && hr < 16) slotCounts["12:00"] += r.count;
      else if (hr >= 16 && hr < 20) slotCounts["16:00"] += r.count;
      else slotCounts["20:00"] += r.count;
    });
    hourSlots.forEach((slot) => {
      hourlySalesData.push({
        name: slot,
        value: slotCounts[slot]
      });
    });
    const categoryRows = await dbAll(`
      SELECT p.category as name, SUM(oi.quantity * oi.price) as value 
      FROM order_items oi 
      JOIN products p ON oi.code = p.sku 
      GROUP BY p.category 
      ORDER BY value DESC
    `);
    const defaultCategories = ["Smartphones", "Laptops", "Audio", "Wearables", "Accessories"];
    const categoryRevenueData = defaultCategories.map((cat) => {
      const row = categoryRows.find((r) => r.name.toLowerCase() === cat.toLowerCase());
      return {
        name: cat,
        value: row ? row.value : 0
      };
    });
    const totalExpenses = monthlyRevenue > 0 ? monthlyRevenue * 0.2 : 188700 * 0.2;
    const expenseData = [
      { name: "Server Hosting", value: parseFloat((totalExpenses * 0.15).toFixed(2)) || 14500 },
      { name: "Google/FB Ads", value: parseFloat((totalExpenses * 0.25).toFixed(2)) || 22e3 },
      { name: "Office Rent", value: parseFloat((totalExpenses * 0.2).toFixed(2)) || 35e3 },
      { name: "Logistics/Delivery", value: parseFloat((totalExpenses * 0.1).toFixed(2)) || 8700 },
      { name: "Staff Salaries", value: parseFloat((totalExpenses * 0.3).toFixed(2)) || 12e4 }
    ];
    const recentOrdersRows = await dbAll(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 8`);
    const recentOrders = recentOrdersRows.map((o) => {
      const initials = o.customer.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
      const avatarColors = ["#8b5cf6", "#10b981", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4"];
      const colorIndex = Math.abs(o.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % avatarColors.length;
      return {
        id: o.id,
        type: "order",
        message: `<strong>${o.customer}</strong> placed an order for <span class="activity-amount">\u09F3${o.amount.toFixed(2)}</span>`,
        user: o.customer,
        amount: o.amount,
        timestamp: o.created_at,
        avatar: initials,
        avatarColor: avatarColors[colorIndex]
      };
    });
    const recentCustomerRows = await dbAll(`SELECT * FROM customers ORDER BY created_at DESC LIMIT 5`);
    const customerActivities = recentCustomerRows.map((c) => {
      const initials = (c.first_name[0] + (c.last_name[0] || "")).toUpperCase();
      return {
        id: c.id,
        type: "customer",
        message: `New customer <strong>${c.first_name} ${c.last_name}</strong> registered an account`,
        user: `${c.first_name} ${c.last_name}`,
        timestamp: c.created_at,
        avatar: initials,
        avatarColor: "#10b981"
      };
    });
    const recentActivities = [...recentOrders, ...customerActivities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
    const currentVisitors = Math.floor(1800 + Math.random() * 800);
    const visitorStats = {
      current: currentVisitors,
      peak: 4500,
      avgSessionDuration: "4m 32s",
      bounceRate: 38.5,
      pagesPerSession: 4.2
    };
    const resultData = {
      stats: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        yearlyRevenue,
        netProfit,
        grossProfit,
        totalOrders,
        totalCustomers,
        liveVisitors: currentVisitors,
        todayChange,
        monthlyChange,
        yearlyChange
      },
      charts: {
        monthlyRevenueData,
        dailyRevenueData,
        hourlySalesData,
        categoryRevenueData,
        expenseData
      },
      recentOrders,
      recentActivities,
      visitorStats
    };
    cacheService.set(cacheKey, resultData, 300).catch(console.error);
    res.json({
      status: "success",
      data: resultData
    });
  } catch (error) {
    console.error("Failed to aggregate dashboard statistics:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// backend/routes/dashboard.ts
var router5 = Router5();
router5.get("/stats", authenticateToken, requireRole(["Super Admin", "Admin", "Staff"]), getDashboardStats);
var dashboard_default = router5;

// backend/routes/settings.ts
import { Router as Router6 } from "express";

// backend/controllers/settingsController.ts
var keyMapToCamel = {
  site_name: "siteName",
  site_url: "siteUrl",
  timezone: "timezone",
  currency: "currency",
  maintenance_mode: "maintenanceMode",
  email_provider: "emailProvider",
  smtp_host: "smtpHost",
  smtp_port: "smtpPort",
  smtp_user: "smtpUser",
  smtp_pass: "smtpPass",
  payment_bkash: "paymentBkash",
  payment_nagad: "paymentNagad",
  payment_sslcommerz: "paymentSslCommerz",
  payment_cod: "paymentCod",
  shipping_pathao: "shippingPathao",
  shipping_steadfast: "shippingSteadfast",
  shipping_redx: "shippingRedx",
  cache_driver: "cacheDriver",
  cache_ttl: "cacheTTL"
};
var keyMapToSnake = {
  siteName: "site_name",
  siteUrl: "site_url",
  timezone: "timezone",
  currency: "currency",
  maintenanceMode: "maintenance_mode",
  emailProvider: "email_provider",
  smtpHost: "smtp_host",
  smtpPort: "smtp_port",
  smtpUser: "smtp_user",
  smtpPass: "smtp_pass",
  paymentBkash: "payment_bkash",
  paymentNagad: "payment_nagad",
  paymentSslCommerz: "payment_sslcommerz",
  paymentCod: "payment_cod",
  shippingPathao: "shipping_pathao",
  shippingSteadfast: "shipping_steadfast",
  shippingRedx: "shipping_redx",
  cacheDriver: "cache_driver",
  cacheTTL: "cache_ttl"
};
var getSettings = (req, res) => {
  db_default.all("SELECT setting_key, setting_value FROM system_settings", [], (err, rows) => {
    if (err) {
      console.error("Failed to load system settings:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    const settingsObj = {
      // default fallbacks for safety
      siteName: "VIP Commerce Control Center",
      siteUrl: "https://admin.vipcommerce.com",
      timezone: "Asia/Dhaka (GMT+6)",
      currency: "BDT (\u09F3)",
      maintenanceMode: false,
      emailProvider: "SendGrid",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: 587,
      smtpUser: "apikey",
      smtpPass: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      paymentBkash: true,
      paymentNagad: true,
      paymentSslCommerz: false,
      paymentCod: true,
      shippingPathao: true,
      shippingSteadfast: true,
      shippingRedx: false,
      cacheDriver: "Redis",
      cacheHitRate: 94.2,
      cacheSize: "2.4 GB",
      cacheTTL: 3600
    };
    if (rows && rows.length > 0) {
      rows.forEach((row) => {
        const camelKey = keyMapToCamel[row.setting_key];
        if (camelKey) {
          let val = row.setting_value;
          if (camelKey === "maintenanceMode" || camelKey === "paymentBkash" || camelKey === "paymentNagad" || camelKey === "paymentSslCommerz" || camelKey === "paymentCod" || camelKey === "shippingPathao" || camelKey === "shippingSteadfast" || camelKey === "shippingRedx") {
            val = val === "1" || val === "true";
          } else if (camelKey === "smtpPort" || camelKey === "cacheTTL") {
            val = parseInt(val) || (camelKey === "smtpPort" ? 587 : 3600);
          }
          settingsObj[camelKey] = val;
        }
      });
    }
    res.json({ status: "success", data: settingsObj });
  });
};
var updateSettings = (req, res) => {
  const settingsData = req.body;
  db_default.serialize(() => {
    db_default.run("BEGIN TRANSACTION");
    const stmt = db_default.prepare(`
      INSERT OR REPLACE INTO system_settings (setting_key, setting_value)
      VALUES (?, ?)
    `);
    const keys = Object.keys(settingsData).filter((k) => keyMapToSnake[k]);
    if (keys.length === 0) {
      db_default.run("COMMIT");
      return res.json({ status: "success", message: "System settings updated successfully (no changes)" });
    }
    let completed = 0;
    let hasError = false;
    keys.forEach((camelKey) => {
      const snakeKey = keyMapToSnake[camelKey];
      let val = settingsData[camelKey];
      if (typeof val === "boolean") {
        val = val ? "1" : "0";
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
              db_default.run("ROLLBACK");
              return res.status(500).json({ status: "error", message: "Failed to update system settings" });
            }
            db_default.run("COMMIT", (commitErr) => {
              if (commitErr) {
                db_default.run("ROLLBACK");
                return res.status(500).json({ status: "error", message: "Failed to commit settings update" });
              }
              res.json({ status: "success", message: "System settings updated successfully" });
            });
          });
        }
      });
    });
  });
};
var getStorefrontSettings = (req, res) => {
  db_default.get(
    "SELECT setting_value FROM system_settings WHERE setting_key = 'storefront_config'",
    [],
    (err, row) => {
      if (err) {
        console.error("Failed to load storefront settings:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      if (!row || !row.setting_value) {
        return res.json({ status: "success", data: null });
      }
      try {
        const data = JSON.parse(row.setting_value);
        res.json({ status: "success", data });
      } catch (e) {
        res.status(500).json({ status: "error", message: "Failed to parse storefront settings" });
      }
    }
  );
};
var updateStorefrontSettings = (req, res) => {
  const configString = JSON.stringify(req.body);
  db_default.run(
    "INSERT OR REPLACE INTO system_settings (setting_key, setting_value, group_name, is_public) VALUES ('storefront_config', ?, 'storefront', 1)",
    [configString],
    (err) => {
      if (err) {
        console.error("Failed to update storefront settings:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "Storefront settings updated successfully" });
    }
  );
};

// backend/routes/settings.ts
var router6 = Router6();
router6.get("/storefront", getStorefrontSettings);
router6.put("/storefront", authenticateToken, requireRole(["Super Admin", "Admin"]), updateStorefrontSettings);
router6.get("/", authenticateToken, requireRole(["Super Admin", "Admin"]), getSettings);
router6.put("/", authenticateToken, requireRole(["Super Admin", "Admin"]), updateSettings);
var settings_default = router6;

// backend/routes/chats.ts
import { Router as Router7 } from "express";

// backend/controllers/chatsController.ts
var getChatHistory = (req, res) => {
  db_default.all("SELECT * FROM support_messages ORDER BY created_at ASC", [], (err, rows) => {
    if (err) {
      console.error("Failed to load support message logs:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    const chats = (rows || []).map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      sender: row.sender,
      message: row.message,
      read: row.read === 1,
      timestamp: row.created_at
    }));
    res.json({ status: "success", data: chats });
  });
};
var markAsRead = (req, res) => {
  const { customerId } = req.params;
  db_default.run(
    `UPDATE support_messages 
     SET read = 1 
     WHERE customer_id = ? AND sender = 'customer' AND read = 0`,
    [customerId],
    function(err) {
      if (err) {
        console.error(`Failed to mark chats as read for customer ${customerId}:`, err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "Messages marked as read" });
    }
  );
};

// backend/routes/chats.ts
var router7 = Router7();
router7.get("/", authenticateToken, getChatHistory);
router7.put("/read/:customerId", authenticateToken, markAsRead);
var chats_default = router7;

// backend/routes/ai.ts
import { Router as Router8 } from "express";

// backend/controllers/aiController.ts
function buildSystemPrompt(products, storeName) {
  const productList = products.map((p, i) => {
    let features = [];
    let specs = [];
    try {
      if (p.features) {
        features = typeof p.features === "string" ? JSON.parse(p.features) : p.features;
      }
    } catch (e) {
      console.error(`Error parsing features for product prompt ${p.id}:`, e);
    }
    try {
      if (p.specs) {
        specs = typeof p.specs === "string" ? JSON.parse(p.specs) : p.specs;
      }
    } catch (e) {
      console.error(`Error parsing specs for product prompt ${p.id}:`, e);
    }
    const inStock = p.in_stock === 1 || p.in_stock === true || p.stock > 0;
    const published = p.published === 1 || p.published === true;
    if (!published) return null;
    let info = `${i + 1}. **${p.name}**`;
    info += `
   - ID: ${p.id}`;
    info += `
   - Category: ${p.category || "N/A"}`;
    info += `
   - Brand: ${p.brand || "N/A"}`;
    info += `
   - Price: \u09F3${p.price}`;
    if (p.original_price && p.original_price > p.price) {
      const discount = Math.round((1 - p.price / p.original_price) * 100);
      info += ` (was \u09F3${p.original_price}, ${discount}% off!)`;
    }
    info += `
   - Stock: ${inStock ? `In Stock (${p.stock || "Available"})` : "Out of Stock"}`;
    if (p.description) info += `
   - Description: ${p.description}`;
    if (features.length > 0) info += `
   - Features: ${features.join(", ")}`;
    if (specs.length > 0) {
      const specStr = specs.map((s) => `${s.name}: ${s.value}`).join(", ");
      info += `
   - Specs: ${specStr}`;
    }
    if (p.rating) info += `
   - Rating: ${p.rating}/5 (${p.reviews || 0} reviews)`;
    return info;
  }).filter(Boolean).join("\n\n");
  return `You are a friendly, helpful, and knowledgeable AI shopping assistant for "${storeName}".

YOUR ROLE:
- Help customers find the right products
- Answer questions about products (price, features, specs, stock availability)
- Provide product recommendations based on customer needs
- Be warm, conversational, and helpful
- If a customer asks about something you don't know, politely say you don't have that information

LANGUAGE:
- Respond in the same language the customer uses
- If they write in Bangla/Bengali, respond in Bangla
- If they write in English, respond in English
- Keep responses concise but informative

IMPORTANT RULES:
- NEVER make up product information \u2014 only use the data provided below
- NEVER share internal IDs like "PRD-xxx" \u2014 just use product names
- If a product is out of stock, let the customer know
- If asked about pricing, always mention the currency as \u09F3 (Taka)
- Be enthusiastic about deals and discounts!
- DO NOT discuss topics unrelated to the store and its products

CURRENT PRODUCT CATALOG:
${productList || "No products currently available."}

Remember: You represent ${storeName}. Be professional, friendly, and always prioritize the customer experience! \u{1F6CD}\uFE0F`;
}
var chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ status: "error", message: "Message is required" });
    }
    if (message.trim().length > 2e3) {
      return res.status(400).json({ status: "error", message: "Message too long (max 2000 characters)" });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ status: "error", message: "AI service is not configured" });
    }
    const products = await new Promise((resolve, reject) => {
      db_default.all(`SELECT * FROM products WHERE published = 1`, [], (err, rows) => {
        if (err) {
          console.error("Failed to fetch products for AI:", err);
          resolve([]);
        } else {
          resolve((rows || []).map((row) => {
            let features = [];
            let specs = [];
            try {
              if (row.features) features = JSON.parse(row.features);
            } catch (e) {
              console.error(`Error parsing features for AI product ${row.id}:`, e);
            }
            try {
              if (row.specs) specs = JSON.parse(row.specs);
            } catch (e) {
              console.error(`Error parsing specs for AI product ${row.id}:`, e);
            }
            return {
              ...row,
              features,
              specs
            };
          }));
        }
      });
    });
    const storeName = "AURA Sports";
    const systemPrompt = buildSystemPrompt(products, storeName);
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        if (msg.role === "user" || msg.role === "model") {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text || "" }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }]
    });
    const models = [
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];
    let lastError = "";
    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 1024
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
          })
        });
        if (geminiResponse.status === 429) {
          console.warn(`Model ${model} quota exceeded, trying next model...`);
          lastError = `Quota exceeded for ${model}`;
          continue;
        }
        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.text();
          console.error(`Gemini API error (${model}):`, geminiResponse.status, errorData);
          lastError = `API error ${geminiResponse.status} for ${model}`;
          continue;
        }
        const data = await geminiResponse.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiText) {
          console.error(`No AI response text from ${model}:`, JSON.stringify(data));
          lastError = `Empty response from ${model}`;
          continue;
        }
        console.log(`AI response generated successfully using model: ${model}`);
        return res.json({
          status: "success",
          data: {
            reply: aiText,
            role: "model"
          }
        });
      } catch (fetchError) {
        console.error(`Fetch error for model ${model}:`, fetchError.message);
        lastError = fetchError.message;
        continue;
      }
    }
    console.error("All Gemini models failed. Last error:", lastError);
    return res.status(502).json({ status: "error", message: "AI service temporarily unavailable. Please try again later." });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// backend/routes/ai.ts
var router8 = Router8();
router8.post("/chat", chatWithAI);
var ai_default = router8;

// backend/routes/employees.ts
import { Router as Router9 } from "express";

// backend/controllers/employeesController.ts
import bcrypt3 from "bcryptjs";
var getEmployees = (req, res) => {
  db_default.all(
    `SELECT e.id, e.first_name, e.last_name, e.email, e.status, e.department, e.created_at, e.last_login_at, r.name as role, r.id as role_id 
     FROM employees e 
     JOIN roles r ON e.role_id = r.id
     ORDER BY e.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Failed to get employees:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      const employees = (rows || []).map((r) => ({
        id: r.id,
        name: `${r.first_name} ${r.last_name}`.trim(),
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email,
        role: r.role,
        role_id: r.role_id,
        status: r.status,
        department: r.department || "Operations",
        created_at: r.created_at,
        lastLogin: r.last_login_at || "",
        avatar: r.first_name.substring(0, 1) + r.last_name.substring(0, 1)
      }));
      res.json({ status: "success", data: employees });
    }
  );
};
var updateEmployee = (req, res) => {
  const employeeId = req.params.id;
  const { role_id, status, department } = req.body;
  if (employeeId === "EMP-001" && status === "inactive") {
    return res.status(400).json({ status: "error", message: "Cannot deactivate the primary Super Admin account." });
  }
  db_default.run(
    `UPDATE employees 
     SET role_id = ?, status = ?, department = ? 
     WHERE id = ?`,
    [role_id, status, department || "Operations", employeeId],
    function(err) {
      if (err) {
        console.error("Failed to update employee:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "Employee updated successfully" });
    }
  );
};
var deleteEmployee = (req, res) => {
  const employeeId = req.params.id;
  if (employeeId === "EMP-001") {
    return res.status(400).json({ status: "error", message: "Cannot delete the primary Super Admin account." });
  }
  db_default.run(
    `DELETE FROM employees WHERE id = ?`,
    [employeeId],
    function(err) {
      if (err) {
        console.error("Failed to delete employee:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "Employee deleted successfully" });
    }
  );
};
var getInvitations = (req, res) => {
  db_default.all(
    `SELECT i.id, i.email, i.status, i.created_at, i.expires_at, i.token, r.name as role, r.id as role_id 
     FROM employee_invitations i 
     JOIN roles r ON i.role_id = r.id
     ORDER BY i.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Failed to get invitations:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      const invitations = (rows || []).map((r) => ({
        id: r.id,
        email: r.email,
        role: r.role,
        role_id: r.role_id,
        status: r.status,
        created_at: r.created_at,
        expires_at: r.expires_at,
        token: r.token
      }));
      res.json({ status: "success", data: invitations });
    }
  );
};
var inviteEmployee = (req, res) => {
  const { email, role_id } = req.body;
  if (!email || !role_id) {
    return res.status(400).json({ status: "error", message: "Email and Role are required" });
  }
  db_default.get("SELECT id FROM employees WHERE email = ?", [email], (err, row) => {
    if (row) {
      return res.status(400).json({ status: "error", message: "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u09A6\u09BF\u09DF\u09C7 \u0985\u09B2\u09B0\u09C7\u09A1\u09BF \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u0987\u0989\u099C\u09BE\u09B0 \u0986\u099B\u09C7" });
    }
    db_default.get("SELECT id FROM employee_invitations WHERE email = ? AND status = 'pending'", [email], (err2, inviteRow) => {
      if (inviteRow) {
        return res.status(400).json({ status: "error", message: "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2\u09C7 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u098F\u0995\u099F\u09BF \u09AA\u09C7\u09A8\u09CD\u09A1\u09BF\u0982 \u0987\u09A8\u09AD\u09BE\u0987\u099F\u09C7\u09B6\u09A8 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u0986\u099B\u09C7" });
      }
      const token = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const invitationId = `invite-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1e3).toISOString();
      db_default.run(
        `INSERT INTO employee_invitations (id, email, role_id, token, status, expires_at)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [invitationId, email, role_id, token, expiresAt],
        function(err3) {
          if (err3) {
            console.error("Failed to create invitation:", err3);
            return res.status(500).json({ status: "error", message: "Database error" });
          }
          console.log(`\u2709\uFE0F [SIMULATED EMAIL SENT] to ${email}`);
          console.log(`\u{1F517} Registration Link: http://localhost:5173/register-employee?token=${token}`);
          res.json({
            status: "success",
            data: {
              id: invitationId,
              email,
              token,
              expires_at: expiresAt
            }
          });
        }
      );
    });
  });
};
var deleteInvitation = (req, res) => {
  const invitationId = req.params.id;
  db_default.run(
    `DELETE FROM employee_invitations WHERE id = ?`,
    [invitationId],
    function(err) {
      if (err) {
        console.error("Failed to revoke invitation:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "Invitation revoked successfully" });
    }
  );
};
var getRoles = (req, res) => {
  db_default.all(`SELECT * FROM roles ORDER BY id ASC`, [], (err, rows) => {
    if (err) {
      console.error("Failed to get roles:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    const roles = (rows || []).map((r) => {
      let permissions = [];
      try {
        if (r.permissions) permissions = JSON.parse(r.permissions);
      } catch (e) {
        console.error(`Error parsing permissions for role ${r.name}:`, e);
      }
      return {
        id: r.id,
        name: r.name,
        description: r.description || "",
        is_system: r.is_system === 1,
        permissions
      };
    });
    res.json({ status: "success", data: roles });
  });
};
var createRole = (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name) {
    return res.status(400).json({ status: "error", message: "Role name is required" });
  }
  db_default.run(
    `INSERT INTO roles (name, description, is_system, permissions)
     VALUES (?, ?, 0, ?)`,
    [name, description || "", JSON.stringify(permissions || [])],
    function(err) {
      if (err) {
        console.error("Failed to create role:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({
        status: "success",
        data: {
          id: this.lastID,
          name,
          description,
          is_system: false,
          permissions: permissions || []
        }
      });
    }
  );
};
var updateRole = (req, res) => {
  const roleId = req.params.id;
  const { name, description, permissions } = req.body;
  db_default.get(`SELECT * FROM roles WHERE id = ?`, [roleId], (err, role) => {
    if (!role) {
      return res.status(404).json({ status: "error", message: "Role not found" });
    }
    const finalName = role.is_system === 1 ? role.name : name;
    db_default.run(
      `UPDATE roles 
       SET name = ?, description = ?, permissions = ? 
       WHERE id = ?`,
      [finalName, description || "", JSON.stringify(permissions || []), roleId],
      function(err2) {
        if (err2) {
          console.error("Failed to update role:", err2);
          return res.status(500).json({ status: "error", message: "Database error" });
        }
        res.json({ status: "success", message: "Role updated successfully" });
      }
    );
  });
};
var deleteRole = (req, res) => {
  const roleId = req.params.id;
  db_default.get(`SELECT is_system FROM roles WHERE id = ?`, [roleId], (err, role) => {
    if (!role) {
      return res.status(404).json({ status: "error", message: "Role not found" });
    }
    if (role.is_system === 1) {
      return res.status(400).json({ status: "error", message: "Cannot delete built-in system roles." });
    }
    db_default.run(`DELETE FROM roles WHERE id = ?`, [roleId], function(err2) {
      if (err2) {
        console.error("Failed to delete role:", err2);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "Role deleted successfully" });
    });
  });
};
var verifyInvitationToken = (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ status: "error", message: "Token is required" });
  }
  db_default.get(
    `SELECT i.*, r.name as role_name 
     FROM employee_invitations i 
     JOIN roles r ON i.role_id = r.id 
     WHERE i.token = ?`,
    [token],
    (err, row) => {
      if (err) {
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      if (!row) {
        return res.status(404).json({ status: "error", message: "\u0987\u09A8\u09AD\u09BE\u0987\u099F\u09C7\u09B6\u09A8 \u099F\u09CB\u0995\u09C7\u09A8\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF\u0964" });
      }
      if (row.status !== "pending") {
        return res.status(400).json({ status: "error", message: "\u0987\u09A8\u09AD\u09BE\u0987\u099F\u09C7\u09B6\u09A8 \u099F\u09CB\u0995\u09C7\u09A8\u099F\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
      }
      const expiry = new Date(row.expires_at).getTime();
      if (expiry < Date.now()) {
        return res.status(400).json({ status: "error", message: "\u0987\u09A8\u09AD\u09BE\u0987\u099F\u09C7\u09B6\u09A8 \u09B2\u09BF\u0982\u0995\u099F\u09BF\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7 \u09B9\u09DF\u09C7 \u0997\u09C7\u099B\u09C7\u0964" });
      }
      res.json({
        status: "success",
        data: {
          email: row.email,
          role: row.role_name
        }
      });
    }
  );
};
var registerInvitedEmployee = (req, res) => {
  const { token, name, password } = req.body;
  if (!token || !name || !password) {
    return res.status(400).json({ status: "error", message: "Token, Name, and Password are required" });
  }
  db_default.get(
    `SELECT i.*, r.name as role_name 
     FROM employee_invitations i 
     JOIN roles r ON i.role_id = r.id 
     WHERE i.token = ?`,
    [token],
    (err, invite) => {
      if (err || !invite) {
        return res.status(400).json({ status: "error", message: "Invalid token" });
      }
      if (invite.status !== "pending") {
        return res.status(400).json({ status: "error", message: "Token already used" });
      }
      const expiry = new Date(invite.expires_at).getTime();
      if (expiry < Date.now()) {
        return res.status(400).json({ status: "error", message: "Invitation has expired" });
      }
      bcrypt3.hash(password, 10, (err2, hash) => {
        if (err2) {
          return res.status(500).json({ status: "error", message: "Password hashing failed" });
        }
        const parts = name.trim().split(" ");
        const first_name = parts[0] || "";
        const last_name = parts.slice(1).join(" ") || "";
        const employeeId = `EMP-${Date.now()}`;
        db_default.serialize(() => {
          db_default.run(
            `INSERT INTO employees (id, role_id, first_name, last_name, email, password_hash, status, department)
             VALUES (?, ?, ?, ?, ?, ?, 'active', 'Operations')`,
            [employeeId, invite.role_id, first_name, last_name, invite.email, hash],
            (err3) => {
              if (err3) {
                console.error("Error creating invited employee:", err3);
                return res.status(500).json({ status: "error", message: "Failed to create employee record" });
              }
              db_default.run(
                `UPDATE employee_invitations SET status = 'accepted' WHERE id = ?`,
                [invite.id],
                (err4) => {
                  if (err4) console.error("Error updating invitation status:", err4);
                  res.json({ status: "success", message: "Registration complete! You can now log in." });
                }
              );
            }
          );
        });
      });
    }
  );
};

// backend/routes/employees.ts
var router9 = Router9();
router9.get("/invite/verify", verifyInvitationToken);
router9.post("/invite/register", registerInvitedEmployee);
router9.get("/", authenticateToken, requireRole(["Super Admin", "Admin"]), getEmployees);
router9.put("/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), updateEmployee);
router9.delete("/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteEmployee);
router9.get("/invitations", authenticateToken, requireRole(["Super Admin", "Admin"]), getInvitations);
router9.post("/invite", authenticateToken, requireRole(["Super Admin", "Admin"]), inviteEmployee);
router9.delete("/invitations/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteInvitation);
router9.get("/roles", authenticateToken, requireRole(["Super Admin", "Admin"]), getRoles);
router9.post("/roles", authenticateToken, requireRole(["Super Admin", "Admin"]), createRole);
router9.put("/roles/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), updateRole);
router9.delete("/roles/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteRole);
var employees_default = router9;

// backend/routes/marketing.ts
import { Router as Router10 } from "express";

// backend/controllers/marketingController.ts
var getCoupons = (req, res) => {
  db_default.all(`SELECT * FROM coupons ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error("Failed to get coupons:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json({ status: "success", data: rows || [] });
  });
};
var createCoupon = (req, res) => {
  const { code, type, value, expiry } = req.body;
  if (!code || !type || value === void 0 || !expiry) {
    return res.status(400).json({ status: "error", message: "All coupon fields are required" });
  }
  const cleanCode = code.trim().toUpperCase();
  db_default.run(
    `INSERT INTO coupons (code, type, value, expiry, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [cleanCode, type, Number(value), expiry],
    function(err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ status: "error", message: "\u098F\u0987 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u099F\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09A1\u09BE\u099F\u09BE\u09AC\u09C7\u099C\u09C7 \u09B0\u09DF\u09C7\u099B\u09C7\u0964" });
        }
        console.error("Failed to create coupon:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({
        status: "success",
        data: {
          code: cleanCode,
          type,
          value: Number(value),
          expiry,
          status: "active"
        }
      });
    }
  );
};
var deleteCoupon = (req, res) => {
  const { code } = req.params;
  db_default.run(`DELETE FROM coupons WHERE code = ?`, [String(code).toUpperCase()], function(err) {
    if (err) {
      console.error("Failed to delete coupon:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json({ status: "success", message: "Coupon deleted successfully" });
  });
};
var validateCoupon = (req, res) => {
  const { code } = req.params;
  if (!code) {
    return res.status(400).json({ status: "error", message: "Coupon code is required" });
  }
  db_default.get(`SELECT * FROM coupons WHERE code = ?`, [String(code).trim().toUpperCase()], (err, coupon) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    if (!coupon) {
      return res.status(404).json({ status: "error", message: "\u09A6\u09C1\u0983\u0996\u09BF\u09A4, \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF\u0964" });
    }
    if (coupon.status !== "active") {
      return res.status(400).json({ status: "error", message: "\u098F\u0987 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u099F\u09BF \u098F\u0996\u09A8 \u09B8\u099A\u09B2 \u09A8\u09C7\u0987\u0964" });
    }
    const expiryTime = new Date(coupon.expiry).getTime() + 24 * 3600 * 1e3;
    if (expiryTime < Date.now()) {
      db_default.run("UPDATE coupons SET status = 'expired' WHERE code = ?", [coupon.code]);
      return res.status(400).json({ status: "error", message: "\u098F\u0987 \u0995\u09C1\u09AA\u09A8 \u0995\u09CB\u09A1\u099F\u09BF\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7 \u09B9\u09DF\u09C7 \u0997\u09C7\u099B\u09C7\u0964" });
    }
    res.json({
      status: "success",
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      }
    });
  });
};
var getSubscribers = (req, res) => {
  db_default.all(`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error("Failed to get subscribers:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json({ status: "success", data: rows || [] });
  });
};
var subscribeEmail = (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ status: "error", message: "\u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u098F\u09A1\u09CD\u09B0\u09C7\u09B8 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
  }
  const cleanEmail = email.trim().toLowerCase();
  db_default.run(
    `INSERT INTO newsletter_subscribers (email, status)
     VALUES (?, 'subscribed')`,
    [cleanEmail],
    function(err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ status: "error", message: "\u0986\u09AA\u09A8\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A8\u09BF\u0989\u099C\u09B2\u09C7\u099F\u09BE\u09B0\u09C7 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BE\u0987\u09AC \u0995\u09B0\u09C7\u099B\u09C7\u09A8!" });
        }
        console.error("Failed to subscribe email:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({ status: "success", message: "\u09A8\u09BF\u0989\u099C\u09B2\u09C7\u099F\u09BE\u09B0 \u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09AA\u09B6\u09A8 \u09B8\u09AB\u09B2 \u09B9\u09DF\u09C7\u099B\u09C7! \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6\u0964" });
    }
  );
};
var deleteSubscriber = (req, res) => {
  const { id } = req.params;
  db_default.run(`DELETE FROM newsletter_subscribers WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error("Failed to delete subscriber:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json({ status: "success", message: "Subscriber removed" });
  });
};
var getCampaigns = (req, res) => {
  db_default.all(`SELECT * FROM campaigns`, [], (err, rows) => {
    if (err) {
      console.error("Failed to get campaigns:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    const mapped = (rows || []).map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      status: r.status,
      sent: Number(r.sent || 0),
      opened: Number(r.opened || 0),
      clicked: Number(r.clicked || 0),
      converted: Number(r.converted || 0),
      revenue: Number(r.revenue || 0),
      startDate: r.start_date || "",
      endDate: r.end_date || "",
      productIds: r.product_ids ? r.product_ids.split(",").filter(Boolean) : []
    }));
    res.json({ status: "success", data: mapped });
  });
};
var createCampaign = (req, res) => {
  const { id, name, type, status, sent, opened, clicked, converted, revenue, startDate, endDate, productIds } = req.body;
  if (!id || !name || !type) {
    return res.status(400).json({ status: "error", message: "Campaign ID, name, and type are required" });
  }
  const productIdsStr = Array.isArray(productIds) ? productIds.join(",") : "";
  db_default.run(
    `INSERT INTO campaigns (id, name, type, status, sent, opened, clicked, converted, revenue, start_date, end_date, product_ids)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      type,
      status || "active",
      sent || 0,
      opened || 0,
      clicked || 0,
      converted || 0,
      revenue || 0,
      startDate || "",
      endDate || "",
      productIdsStr
    ],
    function(err) {
      if (err) {
        console.error("Failed to create campaign:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      res.json({
        status: "success",
        data: {
          id,
          name,
          type,
          status: status || "active",
          sent: sent || 0,
          opened: opened || 0,
          clicked: clicked || 0,
          converted: converted || 0,
          revenue: revenue || 0,
          startDate,
          endDate,
          productIds
        }
      });
    }
  );
};
var updateCampaign = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ status: "error", message: "Status is required" });
  }
  db_default.run(`UPDATE campaigns SET status = ? WHERE id = ?`, [status, id], function(err) {
    if (err) {
      console.error("Failed to update campaign:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json({ status: "success", message: "Campaign status updated" });
  });
};
var deleteCampaign = (req, res) => {
  const { id } = req.params;
  db_default.run(`DELETE FROM campaigns WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error("Failed to delete campaign:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    res.json({ status: "success", message: "Campaign deleted" });
  });
};

// backend/routes/marketing.ts
var router10 = Router10();
router10.post("/subscribers/subscribe", subscribeEmail);
router10.get("/coupons/validate/:code", validateCoupon);
router10.get("/campaigns", getCampaigns);
router10.get("/coupons", authenticateToken, requireRole(["Super Admin", "Admin"]), getCoupons);
router10.post("/coupons", authenticateToken, requireRole(["Super Admin", "Admin"]), createCoupon);
router10.delete("/coupons/:code", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteCoupon);
router10.get("/subscribers", authenticateToken, requireRole(["Super Admin", "Admin"]), getSubscribers);
router10.delete("/subscribers/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteSubscriber);
router10.post("/campaigns", authenticateToken, requireRole(["Super Admin", "Admin"]), createCampaign);
router10.put("/campaigns/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), updateCampaign);
router10.delete("/campaigns/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteCampaign);
var marketing_default = router10;

// backend/routes/analytics.ts
import { Router as Router11 } from "express";

// backend/controllers/analyticsController.ts
var dbAll2 = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db_default.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};
var dbGet2 = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db_default.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
var getAnalyticsStats = async (req, res) => {
  const range = req.query.range || "30days";
  let sqlFilter = "created_at >= date('now', '-30 day')";
  let prevSqlFilter = "created_at >= date('now', '-60 day') AND created_at < date('now', '-30 day')";
  let intervalDays = 30;
  if (range === "today") {
    sqlFilter = "date(created_at, 'localtime') = date('now', 'localtime')";
    prevSqlFilter = "date(created_at, 'localtime') = date('now', '-1 day', 'localtime')";
    intervalDays = 1;
  } else if (range === "7days") {
    sqlFilter = "created_at >= date('now', '-7 day')";
    prevSqlFilter = "created_at >= date('now', '-14 day') AND created_at < date('now', '-7 day')";
    intervalDays = 7;
  } else if (range === "90days") {
    sqlFilter = "created_at >= date('now', '-90 day')";
    prevSqlFilter = "created_at >= date('now', '-180 day') AND created_at < date('now', '-90 day')";
    intervalDays = 90;
  }
  try {
    const salesRow = await dbGet2(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND ${sqlFilter}`);
    const sales = salesRow?.sum || 0;
    const ordersRow = await dbGet2(`SELECT COUNT(*) as count FROM orders WHERE ${sqlFilter}`);
    const orders = ordersRow?.count || 0;
    const prevSalesRow = await dbGet2(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned') AND ${prevSqlFilter}`);
    const prevSales = prevSalesRow?.sum || 0;
    const prevOrdersRow = await dbGet2(`SELECT COUNT(*) as count FROM orders WHERE ${prevSqlFilter}`);
    const prevOrders = prevOrdersRow?.count || 0;
    const salesChgVal = prevSales > 0 ? (sales - prevSales) / prevSales * 100 : 0;
    const ordChgVal = prevOrders > 0 ? (orders - prevOrders) / prevOrders * 100 : 0;
    const salesChg = `${salesChgVal >= 0 ? "+" : ""}${salesChgVal.toFixed(1)}%`;
    const ordChg = `${ordChgVal >= 0 ? "+" : ""}${ordChgVal.toFixed(1)}%`;
    const aov = orders > 0 ? parseFloat((sales / orders).toFixed(2)) : 0;
    const prevAov = prevOrders > 0 ? prevSales / prevOrders : 0;
    const aovChgVal = prevAov > 0 ? (aov - prevAov) / prevAov * 100 : 0;
    const aovChg = `${aovChgVal >= 0 ? "+" : ""}${aovChgVal.toFixed(1)}%`;
    const returnedRow = await dbGet2(`SELECT COUNT(*) as count FROM orders WHERE status = 'returned' AND ${sqlFilter}`);
    const returnedCount = returnedRow?.count || 0;
    const refundRate = orders > 0 ? `${(returnedCount / orders * 100).toFixed(1)}%` : "0.0%";
    const positive = salesChgVal >= 0;
    const trendRows = await dbAll2(`
      SELECT date(created_at, 'localtime') as date_str, SUM(amount) as total 
      FROM orders 
      WHERE status NOT IN ('cancelled', 'returned') AND ${sqlFilter} 
      GROUP BY date_str
    `);
    const revenueTrend = [];
    if (range === "today") {
      const hrRows = await dbAll2(`
        SELECT strftime('%H', created_at, 'localtime') as hr, SUM(amount) as total 
        FROM orders 
        WHERE status NOT IN ('cancelled', 'returned') AND ${sqlFilter}
        GROUP BY hr
      `);
      for (let i = 0; i < 24; i += 4) {
        const slot = `${String(i).padStart(2, "0")}:00`;
        let totalVal = 0;
        hrRows.forEach((row) => {
          const hrVal = parseInt(row.hr);
          if (hrVal >= i && hrVal < i + 4) {
            totalVal += row.total;
          }
        });
        revenueTrend.push({ name: slot, value: totalVal });
      }
    } else {
      for (let i = intervalDays - 1; i >= 0; i--) {
        const dObj = /* @__PURE__ */ new Date();
        dObj.setDate(dObj.getDate() - i);
        const dayLabel = `${dObj.getDate()} ${dObj.toLocaleString("en-US", { month: "short" })}`;
        const dateStr = dObj.toISOString().slice(0, 10);
        const found = trendRows.find((r) => r.date_str === dateStr);
        revenueTrend.push({
          name: dayLabel,
          value: found ? found.total : 0
        });
      }
    }
    const hourlyRows = await dbAll2(`
      SELECT strftime('%H', created_at, 'localtime') as hr, COUNT(*) as count 
      FROM orders 
      WHERE ${sqlFilter} 
      GROUP BY hr
    `);
    const salesByHour = Array.from({ length: 24 }, (_, i) => {
      const slot = `${String(i).padStart(2, "0")}:00`;
      const found = hourlyRows.find((r) => parseInt(r.hr) === i);
      return {
        name: slot,
        value: found ? found.count : 0
      };
    });
    const weekdayRows = await dbAll2(`
      SELECT strftime('%w', created_at, 'localtime') as wday, SUM(amount) as revenue, COUNT(*) as orders_count 
      FROM orders 
      WHERE status NOT IN ('cancelled', 'returned') AND ${sqlFilter} 
      GROUP BY wday
    `);
    const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const salesByWeekday = daysName.map((name, index) => {
      const found = weekdayRows.find((r) => parseInt(r.wday) === index);
      return {
        name,
        value: found ? found.revenue : 0,
        value2: found ? found.orders_count : 0
      };
    });
    const categoryRows = await dbAll2(`
      SELECT p.category as name, SUM(oi.quantity * oi.price) as value 
      FROM order_items oi 
      JOIN products p ON oi.code = p.sku 
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled', 'returned') AND o.${sqlFilter}
      GROUP BY p.category 
      ORDER BY value DESC
    `);
    const categoryRevenueData = categoryRows.length > 0 ? categoryRows : [
      { name: "Footwear", value: 0 },
      { name: "Apparel", value: 0 },
      { name: "Fitness", value: 0 }
    ];
    const brandRows = await dbAll2(`
      SELECT p.brand as name, SUM(oi.quantity * oi.price) as value 
      FROM order_items oi 
      JOIN products p ON oi.code = p.sku 
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled', 'returned') AND o.${sqlFilter}
      GROUP BY p.brand 
      ORDER BY value DESC 
      LIMIT 8
    `);
    const brandPerformance = brandRows.length > 0 ? brandRows.map((b) => ({
      name: b.name || "AURA Brand",
      value: b.value
    })) : [
      { name: "Nike", value: 0 },
      { name: "Adidas", value: 0 },
      { name: "Puma", value: 0 }
    ];
    const totalCustomersRow = await dbGet2(`SELECT COUNT(*) as count FROM customers`);
    const totalCustomers = totalCustomersRow?.count || 0;
    const newCustRow = await dbGet2(`
      SELECT COUNT(*) as count FROM customers 
      WHERE strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')
    `);
    const newThisMonth = newCustRow?.count || 0;
    const totalRevenueRow = await dbGet2(`SELECT SUM(amount) as sum FROM orders WHERE status NOT IN ('cancelled', 'returned')`);
    const totalRevenue = totalRevenueRow?.sum || 0;
    const avgLtv = totalCustomers > 0 ? parseFloat((totalRevenue / totalCustomers).toFixed(2)) : 0;
    res.json({
      status: "success",
      data: {
        stats: {
          sales,
          aov,
          orders,
          refund: refundRate,
          salesChg,
          aovChg,
          ordChg,
          positive
        },
        charts: {
          revenueTrend,
          salesByHour,
          salesByWeekday,
          categoryRevenueData,
          brandPerformance
        },
        customers: {
          total: totalCustomers,
          newThisMonth,
          avgLtv,
          churnRate: "1.4%"
        }
      }
    });
  } catch (error) {
    console.error("Failed to aggregate advanced analytics:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// backend/routes/analytics.ts
var router11 = Router11();
router11.get("/", authenticateToken, requireRole(["Super Admin", "Admin"]), getAnalyticsStats);
var analytics_default = router11;

// backend/websocket/chatSocket.ts
import { WebSocketServer, WebSocket } from "ws";
var initChatSocket = (server2) => {
  const wss = new WebSocketServer({ noServer: true });
  server2.on("upgrade", (request, socket, head) => {
    const host = request.headers.host || "localhost";
    const url = new URL(request.url || "", `http://${host}`);
    const pathname = url.pathname;
    if (pathname === "/ws/chat") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });
  wss.on("connection", (ws) => {
    console.log("\u{1F50C} New support chat WebSocket connection established.");
    ws.on("message", (messageData) => {
      try {
        const payload = JSON.parse(messageData.toString());
        if (payload.type === "message") {
          const { customerId, customerName, sender, message } = payload;
          const id = `msg-${Date.now()}`;
          const timestamp = (/* @__PURE__ */ new Date()).toISOString();
          db_default.run(
            `INSERT INTO support_messages (id, customer_id, customer_name, sender, message, read, created_at)
             VALUES (?, ?, ?, ?, ?, 0, ?)`,
            [id, customerId, customerName, sender, message, timestamp],
            (err) => {
              if (err) {
                console.error("Failed to save support chat message in SQLite:", err);
              }
            }
          );
          const response = JSON.stringify({
            type: "message",
            data: {
              id,
              customerId,
              customerName,
              sender,
              message,
              timestamp,
              read: false
            }
          });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(response);
            }
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message content:", err);
      }
    });
    ws.on("close", () => {
      console.log("\u274C Support chat WebSocket connection closed.");
    });
  });
};

// backend/routes/blogs.ts
import { Router as Router12 } from "express";

// backend/controllers/blogsController.ts
var getBlogs = async (req, res) => {
  try {
    const cacheKey = "blogs:all";
    const cachedBlogs = await cacheService.get(cacheKey);
    if (cachedBlogs) {
      return res.json({ status: "success", data: cachedBlogs });
    }
    db_default.all(`SELECT * FROM blog_posts ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) {
        console.error("Failed to get blogs:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      const parsedRows = (rows || []).map((r) => ({
        ...r,
        published: r.published === 1
      }));
      cacheService.set(cacheKey, parsedRows, 300).catch(console.error);
      res.json({ status: "success", data: parsedRows });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
var getBlogBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const cacheKey = `blogs:slug:${slug}`;
    const cachedBlog = await cacheService.get(cacheKey);
    if (cachedBlog) {
      return res.json({ status: "success", data: cachedBlog });
    }
    db_default.get(`SELECT * FROM blog_posts WHERE slug = ?`, [slug], (err, row) => {
      if (err) {
        console.error("Failed to get blog:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      if (!row) {
        return res.status(404).json({ status: "error", message: "Blog post not found" });
      }
      const parsedRow = {
        ...row,
        published: row.published === 1
      };
      cacheService.set(cacheKey, parsedRow, 300).catch(console.error);
      res.json({ status: "success", data: parsedRow });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
var createBlog = (req, res) => {
  const { title, slug, summary, content, banner_image, author_name, published } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ status: "error", message: "Title, slug, and content are required" });
  }
  const id = "post-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const isPublished = published ? 1 : 0;
  db_default.run(
    `INSERT INTO blog_posts (id, title, slug, summary, content, banner_image, author_name, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      slug,
      summary || "",
      content,
      banner_image || "",
      author_name || "Admin",
      isPublished
    ],
    function(err) {
      if (err) {
        console.error("Failed to create blog:", err);
        return res.status(500).json({ status: "error", message: err.message || "Database error" });
      }
      cacheService.delPattern("blogs:*").catch(console.error);
      res.json({
        status: "success",
        message: "Blog post created successfully",
        data: { id }
      });
    }
  );
};
var updateBlog = (req, res) => {
  const { id } = req.params;
  const { title, slug, summary, content, banner_image, author_name, published } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ status: "error", message: "Title, slug, and content are required" });
  }
  const isPublished = published ? 1 : 0;
  db_default.run(
    `UPDATE blog_posts 
     SET title = ?, slug = ?, summary = ?, content = ?, banner_image = ?, author_name = ?, published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      title,
      slug,
      summary || "",
      content,
      banner_image || "",
      author_name || "Admin",
      isPublished,
      id
    ],
    function(err) {
      if (err) {
        console.error("Failed to update blog:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      cacheService.delPattern("blogs:*").catch(console.error);
      res.json({
        status: "success",
        message: "Blog post updated successfully"
      });
    }
  );
};
var deleteBlog = (req, res) => {
  const { id } = req.params;
  db_default.run(`DELETE FROM blog_posts WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error("Failed to delete blog:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }
    cacheService.delPattern("blogs:*").catch(console.error);
    res.json({
      status: "success",
      message: "Blog post deleted successfully"
    });
  });
};

// backend/routes/blogs.ts
var router12 = Router12();
router12.get("/", getBlogs);
router12.get("/:slug", getBlogBySlug);
router12.post("/", authenticateToken, requireRole(["Super Admin", "Admin"]), createBlog);
router12.put("/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), updateBlog);
router12.delete("/:id", authenticateToken, requireRole(["Super Admin", "Admin"]), deleteBlog);
var blogs_default = router12;

// backend/routes/seo.ts
import { Router as Router13 } from "express";
var router13 = Router13();
router13.get("/sitemap.xml", (req, res) => {
  const domain = "https://beauty-elegance-ec88f.web.app";
  db_default.all("SELECT id, created_at FROM products WHERE published = 1", [], (err, products) => {
    if (err) {
      console.error("Sitemap products fetch error:", err);
      return res.status(500).send("Error generating sitemap");
    }
    db_default.all("SELECT slug, created_at FROM blog_posts WHERE published = 1", [], (err2, blogs) => {
      if (err2) {
        console.error("Sitemap blogs fetch error:", err2);
        return res.status(500).send("Error generating sitemap");
      }
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      const staticRoutes = [
        { path: "", priority: "1.0" },
        { path: "checkout", priority: "0.8" },
        { path: "account", priority: "0.8" },
        { path: "blogs", priority: "0.9" }
      ];
      staticRoutes.forEach((r) => {
        xml += `  <url>
`;
        xml += `    <loc>${domain}/${r.path}</loc>
`;
        xml += `    <changefreq>daily</changefreq>
`;
        xml += `    <priority>${r.priority}</priority>
`;
        xml += `  </url>
`;
      });
      (products || []).forEach((p) => {
        xml += `  <url>
`;
        xml += `    <loc>${domain}/product/${p.id}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.8</priority>
`;
        xml += `  </url>
`;
      });
      (blogs || []).forEach((b) => {
        xml += `  <url>
`;
        xml += `    <loc>${domain}/blog/${b.slug}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.7</priority>
`;
        xml += `  </url>
`;
      });
      xml += `</urlset>`;
      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    });
  });
});
var seo_default = router13;

// backend/server.ts
import { rateLimit } from "express-rate-limit";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
dotenv3.config();
var app = express();
var server = createServer(app);
var PORT = process.env.PORT || 5e3;
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  limit: 200,
  // Limit each IP to 200 requests per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  limit: 20,
  // Limit each IP to 20 login/auth attempts per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts from this IP, please try again after 15 minutes"
  }
});
var aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  limit: 30,
  // Limit each IP to 30 AI chat requests per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many AI requests. Please wait a few minutes before trying again."
  }
});
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin.includes("beauty-elegance-ec88f") || origin.includes("web.app") || origin.includes("firebaseapp.com")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      connectSrc: [
        "'self'",
        "https://beauty-elegance-admin.onrender.com",
        "http://localhost:5000",
        "ws:",
        "wss:",
        "https://generativelanguage.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://picsum.photos",
        "https://*.picsum.photos",
        "https://images.unsplash.com",
        "https://*.unsplash.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      frameSrc: ["'self'", "https://accounts.google.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use("/api/", apiLimiter);
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/customers/login-gmail", authLimiter);
app.use("/api/v1/customers/login", authLimiter);
app.use("/api/v1/ai", aiLimiter);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString(), version: "1.0.0" });
});
app.use("/api/v1/auth", auth_default);
app.use("/api/v1/products", products_default);
app.use("/api/v1/orders", orders_default);
app.use("/api/v1/dashboard", dashboard_default);
app.use("/api/v1/chats", chats_default);
app.use("/api/v1/ai", ai_default);
app.use("/api/v1/employees", employees_default);
app.use("/api/v1/marketing", marketing_default);
app.use("/api/v1/analytics", analytics_default);
app.use("/api/v1/blogs", blogs_default);
app.use("/", seo_default);
app.use("/api/v1/customers", customers_default);
app.use("/api/v1/settings", settings_default);
app.use("/api/v1/vendors", (_req, res) => res.json({ status: "success", data: [] }));
var distPath = path2.resolve(__dirname2, "../dist");
app.use(express.static(distPath));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path2.resolve(distPath, "index.html"));
});
app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});
initChatSocket(server);
server.listen(PORT, () => {
  console.log(`\u{1F680} VIP Admin API Server running on port ${PORT}`);
  console.log(`\u{1F4CA} Health check: http://localhost:${PORT}/api/health`);
  console.log(`\u{1F4C2} API Base: http://localhost:${PORT}/api/v1`);
});
var server_default = app;
export {
  server_default as default
};
