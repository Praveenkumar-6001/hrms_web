import { Pool } from 'pg';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Provide a connect() interface compatible with existing code that expects
// `const client = await pool.connect(); await client.query(...); client.release()`

async function tryPostgres() {
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('No DATABASE_URL');
  const pool = new Pool({ connectionString: conn, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
  try {
    // quick test
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    pool.on('error', (err) => console.error('Postgres pool error', err));
    console.log('Using Postgres DB');
    return {
      type: 'pg',
      pool,
      async connect() { return pool.connect(); }
    };
  } catch (e) {
    // ensure pool closed
    try { await pool.end(); } catch {}
    throw e;
  }
}

function setupSqlite() {
  const dbFile = path.join(process.cwd(), 'dev.sqlite3');
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbFile);

  // create tables if missing (simple migrations)
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Using SQLite DB at', dbFile);

  // helper to convert PG-style $1 placeholders to ? for sqlite
  function toSqlite(sql) {
    return sql.replace(/\$\d+/g, '?');
  }

  return {
    type: 'sqlite',
    db,
    async connect() {
      return {
        async query(sql, params = []) {
          const s = toSqlite(sql);
          const lower = sql.trim().toLowerCase();
          if (lower.startsWith('select')) {
            const stmt = db.prepare(s);
            const rows = stmt.all(...params);
            return { rows };
          }
          if (lower.startsWith('insert')) {
            // emulate RETURNING id if present
            const hasReturning = /returning\s+/i.test(lower);
            const sNoReturning = s.replace(/returning\s+[\w\*,\s]+/i, '');
            const stmt = db.prepare(sNoReturning);
            const info = stmt.run(...params);
            if (hasReturning) return { rows: [{ id: info.lastInsertRowid }] };
            return { rowCount: info.changes };
          }
          const stmt = db.prepare(s);
          const info = stmt.run(...params);
          return { rowCount: info.changes };
        },
        release() { /* no-op for sqlite */ }
      };
    }
  };
}

let backend = null;

async function getBackend() {
  if (backend) return backend;
  try {
    backend = await tryPostgres();
    return backend;
  } catch (e) {
    console.warn('Postgres unavailable, falling back to SQLite:', e.message);
    backend = setupSqlite();
    return backend;
  }
}

// Export an object that supports both `connect()` and `query()` for compatibility
export default {
  connect: async () => {
    const b = await getBackend();
    return b.connect();
  },
  query: async (sql, params) => {
    const b = await getBackend();
    if (b.type === 'pg') {
      return b.pool.query(sql, params);
    }
    // sqlite: use connect() helper
    const client = await b.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }
};