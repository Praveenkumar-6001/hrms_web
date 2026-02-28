# Database Migrations Guide

## 📁 Migration Files

This project uses **Knex.js** for database migrations. All migrations are in the `/migrations` folder.

```
migrations/
├── 001_create_users.js           ← Creates users table
└── 002_create_leave_requests.js  ← Creates leave_requests table
```

---

## 🚀 Running Migrations

### ✅ Create All Tables (First Time)

```bash
npm run migrate
```

This will:
1. Create `users` table
2. Create `leave_requests` table with foreign key
3. Create `knex_migrations` tracking table

**Output**: You'll see something like:
```
Batch 1 run: 2 migrations
```

---

### ℹ️ Check Migration Status

```bash
npm run migrate:status
```

Shows which migrations have been run.

---

### ⏮️ Rollback All Migrations (Remove Tables)

```bash
npm run migrate:rollback
```

This will drop both tables but keep the migration files.

---

## 📊 What Gets Created

### users table
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR UNIQUE NOT NULL
password_hash   VARCHAR NOT NULL
role            VARCHAR DEFAULT 'employee'
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### leave_requests table
```sql
id              SERIAL PRIMARY KEY
user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
start_date      DATE NOT NULL
end_date        DATE NOT NULL
reason          TEXT
status          VARCHAR DEFAULT 'pending'
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

---

## 🔧 Creating New Migrations

If you want to add new columns or tables, create a new migration file:

**File naming**: `NNN_description.js` (e.g., `003_add_department.js`)

**Example migration:**

```javascript
exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('department');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('department');
  });
};
```

Then run: `npm run migrate`

---

## 🎯 Full Setup Process

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with DATABASE_URL and JWT_SECRET
# (See QUICK_START.md)

# 3. Run migrations
npm run migrate

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000 and test!
```

---

## ✅ Workflow

```
npm run migrate          ← Create tables
npm run dev              ← Start server
Sign up at /signup       ← Test it works
npm run migrate:status   ← Check migrations
npm run migrate:rollback ← Reset if needed
```

---

## 🐛 Troubleshooting

### Error: "relation 'users' does not exist"
→ Run `npm run migrate` first

### Error: "password authentication failed"
→ Check DATABASE_URL in .env.local (check for `@` symbols)

### Error: "duplicate key value"
→ Migration already run or table exists

### Want to start fresh?
```bash
npm run migrate:rollback
npm run migrate
```

---

## 📝 Notes

- Migrations are **idempotent** → Safe to run multiple times
- Each migration tracks in `knex_migrations` table
- Rollback removes data → Backup first if needed
- Foreign key ensures data integrity (cascade delete)
- Timestamps added automatically (created_at, updated_at)

---

## 🔄 Environment-Specific

Migrations work with `.env.local` DATABASE_URL:

```bash
# Development
npm run migrate

# Production
NODE_ENV=production npm run migrate
```

The `knexfile.js` reads from `process.env.DATABASE_URL`

---

**Now run:** `npm run migrate` 🚀
