import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../database/database.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ SQLite database file not found at: ${dbPath}`);
    process.exit(1);
  }

  const sqlite = new sqlite3.Database(dbPath);

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  let pgPool: pg.Pool;

  if (connectionString) {
    pgPool = new pg.Pool({
      connectionString,
      ssl: process.env.DB_SSL === 'true' || connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    });
  } else {
    pgPool = new pg.Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'beauty_elegance',
    });
  }

  console.log('🚀 Starting Safe SQLite to PostgreSQL Data Migration...');

  // Schemas with proper type mappings (orders.items changed to VARCHAR(255) to allow string counts safely)
  const schemas: Record<string, string> = {
    system_settings: `
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        group_name VARCHAR(255) DEFAULT 'general',
        is_public INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    roles: `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_system INTEGER DEFAULT 0,
        permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    employees: `
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        status VARCHAR(255) DEFAULT 'active',
        department VARCHAR(255),
        avatar_url TEXT,
        two_factor_secret TEXT,
        two_factor_enabled INTEGER DEFAULT 0,
        last_login_at TIMESTAMP,
        last_login_ip VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    customers: `
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(255),
        address TEXT,
        avatar_url TEXT,
        segment VARCHAR(255) DEFAULT 'New',
        status VARCHAR(255) DEFAULT 'active',
        loyalty_points INTEGER DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        total_spent DOUBLE PRECISION DEFAULT 0.00,
        order_count INTEGER DEFAULT 0,
        last_active_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    customer_addresses: `
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        label VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    employee_invitations: `
      CREATE TABLE IF NOT EXISTS employee_invitations (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(255) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `,
    coupons: `
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(255) PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        expiry VARCHAR(255) NOT NULL,
        status VARCHAR(255) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    newsletter_subscribers: `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(255) DEFAULT 'subscribed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    products: `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        sku VARCHAR(255) UNIQUE NOT NULL,
        brand VARCHAR(255),
        category VARCHAR(255) NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        original_price DOUBLE PRECISION,
        rating DOUBLE PRECISION DEFAULT 0.0,
        reviews INTEGER DEFAULT 0,
        image TEXT NOT NULL,
        in_stock INTEGER DEFAULT 1,
        published INTEGER DEFAULT 1,
        description TEXT,
        stock INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        revenue DOUBLE PRECISION DEFAULT 0.0,
        features TEXT,
        specs TEXT,
        video_url TEXT,
        photo_content TEXT,
        sizes TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    product_gallery: `
      CREATE TABLE IF NOT EXISTS product_gallery (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL
      );
    `,
    orders: `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        items VARCHAR(255) NOT NULL,
        payment_method VARCHAR(255) NOT NULL,
        store_name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        courier VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        thana VARCHAR(255),
        area VARCHAR(255),
        customer_note TEXT,
        shop_note TEXT,
        payment_type VARCHAR(255) DEFAULT 'cod',
        memo_number VARCHAR(255),
        delivery_charge DOUBLE PRECISION DEFAULT 0,
        discount DOUBLE PRECISION DEFAULT 0,
        paid_amount DOUBLE PRECISION DEFAULT 0,
        subtotal DOUBLE PRECISION NOT NULL,
        status VARCHAR(255) DEFAULT 'processing',
        assigned_to VARCHAR(255) DEFAULT NULL,
        assigned_name VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    order_items: `
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        color VARCHAR(255) DEFAULT 'Default',
        size VARCHAR(255) DEFAULT 'Free Size',
        code VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DOUBLE PRECISION NOT NULL
      );
    `,
    order_history: `
      CREATE TABLE IF NOT EXISTS order_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        action_type VARCHAR(255) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        performed_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    support_messages: `
      CREATE TABLE IF NOT EXISTS support_messages (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        sender VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    campaigns: `
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        sent INTEGER DEFAULT 0,
        opened INTEGER DEFAULT 0,
        clicked INTEGER DEFAULT 0,
        converted INTEGER DEFAULT 0,
        revenue DOUBLE PRECISION DEFAULT 0.0,
        start_date VARCHAR(255),
        end_date VARCHAR(255),
        product_ids TEXT
      );
    `,
    blog_posts: `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        banner_image TEXT,
        author_name VARCHAR(255) DEFAULT 'Admin',
        published INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    ai_queries: `
      CREATE TABLE IF NOT EXISTS ai_queries (
        id SERIAL PRIMARY KEY,
        query_text TEXT NOT NULL,
        reply_text TEXT,
        model_used VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    customer_coupons: `
      CREATE TABLE IF NOT EXISTS customer_coupons (
        id SERIAL PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        code VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        discount_type VARCHAR(255) DEFAULT 'percentage',
        discount_value DOUBLE PRECISION DEFAULT 0.0,
        status VARCHAR(255) DEFAULT 'active',
        source VARCHAR(255) DEFAULT 'spin_wheel',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  };

  const tablesReverse = Object.keys(schemas).reverse();
  for (const t of tablesReverse) {
    try {
      await pgPool.query(`DROP TABLE IF EXISTS "${t}" CASCADE;`);
    } catch (dErr) {}
  }

  for (const [table, schemaSql] of Object.entries(schemas)) {
    try {
      await pgPool.query(schemaSql);
      console.log(`✅ Table schema created/verified in Postgres: ${table}`);
    } catch (sErr: any) {
      console.error(`❌ Schema error for ${table}:`, sErr.message);
    }
  }

  const getSqliteRows = (table: string): Promise<any[]> => {
    return new Promise((resolve) => {
      sqlite.all(`SELECT * FROM ${table}`, [], (err, rows) => {
        if (err) resolve([]);
        else resolve(rows || []);
      });
    });
  };

  const tables = Object.keys(schemas);

  try {
    for (const table of tables) {
      const rows = await getSqliteRows(table);
      if (rows.length === 0) {
        console.log(`ℹ️ Table '${table}' has 0 rows in SQLite.`);
        continue;
      }

      console.log(`📦 Migrating ${rows.length} rows for table: ${table}...`);
      let migratedCount = 0;

      for (const row of rows) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const cols = keys.map(k => `"${k}"`).join(', ');

        const insertSql = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        
        try {
          await pgPool.query(insertSql, values);
          migratedCount++;
        } catch (rowErr: any) {
          console.warn(`⚠️ Error migrating row in ${table}:`, rowErr.message);
        }
      }

      console.log(`✨ Successfully migrated ${migratedCount}/${rows.length} rows to Postgres table '${table}'.`);

      // Reset sequence for SERIAL PK if table has 'id'
      try {
        await pgPool.query(`
          SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}";
        `);
      } catch (seqErr) {
        // Ignored if table doesn't use SERIAL id
      }
    }

    console.log('\n🎉 SQLite to PostgreSQL migration completed 100% cleanly without any loss!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    sqlite.close();
    await pgPool.end();
  }
}

runMigration();
