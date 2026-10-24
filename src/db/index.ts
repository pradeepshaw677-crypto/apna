import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { PRODUCTS } from '../data/products';

// Turso SQLite Client configuration
const url = process.env.TURSO_DATABASE_URL || 'file:apnabazar.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

/**
 * Initializes database tables and seeds catalog products if table is empty.
 * Ensures production resilience with atomic query support.
 */
export async function initDatabase(): Promise<void> {
  // Create tables using atomic SQLite DDL statements
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      google_sub TEXT,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      is_blocked INTEGER NOT NULL DEFAULT 0,
      token_version INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS otp_challenges (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      image_url TEXT,
      category TEXT,
      brand TEXT,
      description TEXT,
      original_price REAL,
      rating REAL,
      reviews_count INTEGER,
      is_best_seller INTEGER DEFAULT 0,
      is_flash_deal INTEGER DEFAULT 0,
      discount_percent INTEGER DEFAULT 0,
      unit TEXT,
      sizes_json TEXT,
      colors_json TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL,
      items_json TEXT,
      address_json TEXT,
      payment_method TEXT,
      ab_coins_used INTEGER DEFAULT 0,
      coins_discount REAL DEFAULT 0,
      delivery_otp TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Create indexing for high-speed queries
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_challenges(phone);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);`);

  // Seed default products if empty
  const countRes = await client.execute(`SELECT count(*) as total FROM products;`);
  const total = Number(countRes.rows[0]?.total ?? 0);

  if (total === 0) {
    console.log("Seeding initial products into Turso SQLite database...");
    const now = Date.now();
    for (const prod of PRODUCTS) {
      await client.execute({
        sql: `INSERT INTO products (
          id, name, price, stock, image_url, category, brand, description, 
          original_price, rating, reviews_count, is_best_seller, is_flash_deal, 
          discount_percent, unit, sizes_json, colors_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          prod.id,
          prod.name,
          prod.price,
          prod.stockCount ?? 50,
          prod.image || '',
          prod.category || 'general',
          prod.brand || 'Apna Bazar',
          prod.description || '',
          prod.originalPrice || prod.price,
          prod.rating || 4.5,
          prod.reviewsCount || 10,
          prod.isBestSeller ? 1 : 0,
          prod.isFlashDeal ? 1 : 0,
          prod.discountPercent || 0,
          prod.unit || 'piece',
          JSON.stringify(prod.sizes || []),
          JSON.stringify(prod.colors || []),
          now
        ]
      });
    }
    console.log(`Seeded ${PRODUCTS.length} products successfully.`);
  }
}
