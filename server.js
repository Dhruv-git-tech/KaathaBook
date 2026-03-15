import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
const PORT = process.env.PORT || 3000;
const IS_VERCEL = process.env.VERCEL === '1' || !!process.env.VERCEL;

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static(__dirname));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('📱 New client connected:', socket.id);
  socket.on('disconnect', () => console.log('📴 Client disconnected'));
});

// Helper to broadcast updates
const broadcastUpdate = (type, data) => {
  io.emit('data-update', { type, data, timestamp: new Date().toISOString() });
};

// ═══════════════════════════════════════════════════════════
// VALIDATION & ERROR HANDLING
// ═══════════════════════════════════════════════════════════
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const Validators = {
  phone: (value) => /^[0-9]{10}$/.test(String(value).replace(/\D/g, '')),
  name: (value) => String(value).trim().length >= 2 && String(value).trim().length <= 100,
  amount: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && num <= 999999;
  },
  limit: (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 1000000;
  }
};

const validateCustomer = (data) => {
  if (!Validators.name(data.name)) throw new ValidationError('Invalid name (2-100 chars)', 'name');
  if (!Validators.phone(data.phone)) throw new ValidationError('Invalid phone (10 digits)', 'phone');
  if (!Validators.limit(data.limit)) throw new ValidationError('Invalid limit (1-1,000,000)', 'limit');
  return true;
};

const validateProduct = (data) => {
  if (!Validators.name(data.name)) throw new ValidationError('Invalid product name', 'name');
  if (!Validators.amount(data.price)) throw new ValidationError('Invalid price (0-999,999)', 'price');
  return true;
};

const validateTransaction = (data) => {
  if (!data.custId) throw new ValidationError('Customer ID required', 'custId');
  if (!data.type || !['credit', 'payment'].includes(data.type)) throw new ValidationError('Invalid transaction type', 'type');
  if (!Validators.amount(data.total || data.amount)) throw new ValidationError('Invalid amount', 'amount');
  return true;
};

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, field: err.field });
  }
  
  // Don't leak database errors to client
  const message = err.message === 'UNIQUE constraint failed: customers.phone' 
    ? 'Phone number already exists'
    : process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : err.message;
    
  res.status(500).json({ error: message });
});

// ═══════════════════════════════════════════════════════════
// DATABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════
let db = null;
const dbPromise = initDB().catch(err => {
  console.error('❌ Database initialization failed:', err);
  return null;
});

// Middleware to ensure DB is ready before handling requests
app.use(async (req, res, next) => {
  // Skip middleware for static assets if needed, but for Express on Vercel, everything goes through here
  if (!db) {
    await dbPromise;
  }
  if (!db && req.path.startsWith('/api')) {
    return res.status(503).json({ error: 'Database not initialized' });
  }
  next();
});

async function initDB() {
  const dbPath = IS_VERCEL 
    ? path.join('/tmp', 'kaathabook.db') 
    : path.join(__dirname, 'kaathabook.db');
    
  console.log(`📂 Initializing database at: ${dbPath}`);
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // WAL mode doesn't work well on some serverless filesystems, but /tmp should support it
  try {
    await db.exec('PRAGMA journal_mode = WAL');
  } catch (e) {
    console.warn('⚠️ WAL mode failed, falling back to DELETE:', e.message);
    await db.exec('PRAGMA journal_mode = DELETE');
  }

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      custId TEXT,
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      addr TEXT,
      cycle TEXT,
      "limit" INTEGER,
      balance REAL DEFAULT 0,
      initials TEXT,
      color TEXT,
      bg TEXT,
      joinDate DATE,
      lastTx DATE,
      dueDate DATE,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT,
      price REAL NOT NULL,
      unit TEXT,
      barcode TEXT UNIQUE,
      stock INTEGER DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      custId TEXT NOT NULL,
      type TEXT NOT NULL,
      items TEXT,
      amount REAL,
      method TEXT,
      total REAL,
      date DATETIME,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_joinDate ON customers(joinDate);
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_transactions_custId ON transactions(custId);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // Seed default retailer
  const retailer = await db.get('SELECT * FROM users WHERE role = "retailer"');
  if (!retailer) {
    await db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['retailer', 'admin123', 'retailer']
    );
    console.log('👤 Default retailer account created (retailer/admin123)');
  }

  // Create accounts for existing customers if they don't have one
  const allCusts = await db.all('SELECT id, name FROM customers');
  for (const c of allCusts) {
    const user = await db.get('SELECT * FROM users WHERE custId = ?', c.id);
    if (!user) {
      await db.run(
        'INSERT INTO users (username, password, role, custId) VALUES (?, ?, ?, ?)',
        [c.id, c.id, 'customer', c.id]
      );
    }
  }

  console.log('✅ Database initialized successfully');
}

// ═══════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '').trim();
    
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // 1. Check users table (primarily for Retailers)
    let user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    
    // 2. FALLBACK: Check customers table (Customers use their ID as both username and password)
    if (!user) {
      // Use LIKE for case-insensitive ID check if needed, but IDs are usually exact
      const customer = await db.get('SELECT * FROM customers WHERE id = ?', [username]);
      
      // For customers, password must match the ID exactly
      if (customer && customer.id === password) {
        user = {
          id: customer.id,
          username: customer.id,
          name: customer.name,
          role: 'customer',
          lastLogin: new Date().toISOString()
        };
        // Auto-create user record for faster future lookups and role persistence
        await db.run(
          'INSERT OR IGNORE INTO users (username, password, name, role, custId) VALUES (?, ?, ?, ?, ?)',
          [customer.id, customer.id, customer.name, 'customer', customer.id]
        );
      }
    }

    if (!user) {
      console.warn(`Failed login attempt for: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.run('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', user.id);
    
    // In a real app, we'd use JWT. For this demo, we return the user profile.
    const { password: _, ...userInfo } = user;
    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  // Mock session check
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _, ...userInfo } = user;
    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS - CUSTOMERS
// ═══════════════════════════════════════════════════════════
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.all('SELECT * FROM customers ORDER BY name');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res, next) => {
  try {
    const { id, name, phone, addr, cycle, limit, balance, initials, color, bg, joinDate, lastTx, dueDate } = req.body;
    
    // Validate inputs
    validateCustomer({ name, phone, limit });
    
    if (!id) throw new ValidationError('Customer ID required', 'id');
    
    // Check if phone already exists
    const existing = await db.get('SELECT id FROM customers WHERE phone = ?', phone);
    if (existing) return res.status(409).json({ error: 'Phone number already exists' });

    await db.run(
      `INSERT INTO customers (id, name, phone, addr, cycle, "limit", balance, initials, color, bg, joinDate, lastTx, dueDate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, String(name).trim(), String(phone).replace(/\D/g, '').slice(-10), addr || '', cycle || 'Monthly', 
       limit || 1500, balance || 0, initials || '', color || '#000', bg || '#FFF', joinDate || new Date().toISOString().split('T')[0], 
       lastTx || new Date().toISOString().split('T')[0], dueDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0]]
    );
    
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', id);
    
    // Create corresponding user account for login
    await db.run(
      'INSERT OR IGNORE INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [customer.id, customer.id, customer.id, customer.name, 'customer']
    );

    broadcastUpdate('customer-added', customer);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

app.put('/api/customers/:id', async (req, res, next) => {
  try {
    const { name, phone, addr, cycle, limit, balance, dueDate, lastTx } = req.body;
    const { id } = req.params;
    
    if (!id) throw new ValidationError('Customer ID required', 'id');
    
    // Validate inputs (only validate if they're being updated)
    if (name) validateCustomer({ name, phone: phone || '9999999999', limit: limit || 1000 });
    
    // Check if customer exists
    const existing = await db.get('SELECT * FROM customers WHERE id = ?', id);
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    
    await db.run(
      `UPDATE customers SET name=?, phone=?, addr=?, cycle=?, "limit"=?, balance=?, dueDate=?, lastTx=?, updatedAt=CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [String(name || existing.name).trim(), String(phone || existing.phone).replace(/\D/g, '').slice(-10), 
       addr || existing.addr, cycle || existing.cycle, limit || existing.limit, 
       balance !== undefined ? Math.max(0, balance) : existing.balance, dueDate || existing.dueDate, 
       lastTx || existing.lastTx, id]
    );
    
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', id);
    broadcastUpdate('customer-updated', customer);
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM customers WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS - PRODUCTS
// ═══════════════════════════════════════════════════════════
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/barcode/:barcode', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE barcode = ?', req.params.barcode);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const { id, name, emoji, price, unit, barcode, stock } = req.body;
    
    // Validate inputs
    validateProduct({ name, price });
    if (!id) throw new ValidationError('Product ID required', 'id');
    
    if (barcode) {
      const existing = await db.get('SELECT id FROM products WHERE barcode = ?', barcode);
      if (existing) return res.status(409).json({ error: 'Barcode already exists' });
    }

    await db.run(
      `INSERT INTO products (id, name, emoji, price, unit, barcode, stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, String(name).trim(), emoji || '📦', parseFloat(price) || 0, unit || 'unit', 
       barcode ? String(barcode).trim() : null, parseInt(stock) || 100]
    );
    
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

app.put('/api/products/:id', async (req, res, next) => {
  try {
    const { name, emoji, price, unit, barcode, stock } = req.body;
    const { id } = req.params;
    
    if (!id) throw new ValidationError('Product ID required', 'id');
    if (name) validateProduct({ name, price: price || 100 });
    
    const existing = await db.get('SELECT * FROM products WHERE id = ?', id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    
    await db.run(
      `UPDATE products SET name=?, emoji=?, price=?, unit=?, barcode=?, stock=?, updatedAt=CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [String(name || existing.name).trim(), emoji || existing.emoji, parseFloat(price) || existing.price, 
       unit || existing.unit, barcode ? String(barcode).trim() : existing.barcode, 
       parseInt(stock) !== undefined ? parseInt(stock) : existing.stock, id]
    );
    
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw new ValidationError('Product ID required', 'id');
    
    const existing = await db.get('SELECT id FROM products WHERE id = ?', id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    
    await db.run('DELETE FROM products WHERE id = ?', id);
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS - TRANSACTIONS
// ═══════════════════════════════════════════════════════════
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.all(
      'SELECT * FROM transactions ORDER BY date DESC LIMIT 1000'
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions/customer/:custId', async (req, res) => {
  try {
    const transactions = await db.all(
      'SELECT * FROM transactions WHERE custId = ? ORDER BY date DESC',
      req.params.custId
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { id, custId, type, items, amount, method, total, date, notes } = req.body;
    
    await db.run(
      `INSERT INTO transactions (id, custId, type, items, amount, method, total, date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, custId, type, JSON.stringify(items || []), amount, method, total, date, notes]
    );
    
    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', id);
    if (transaction) {
      transaction.items = JSON.parse(transaction.items);
      // Update customer balance in real-time
      const customer = await db.get('SELECT * FROM customers WHERE id = ?', transaction.custId);
      broadcastUpdate('transaction-added', { transaction, customer });
    }
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS - ANALYTICS
// ═══════════════════════════════════════════════════════════
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const totalDue = await db.get(
      'SELECT SUM(balance) as total FROM customers'
    );
    const totalGiven = await db.get(
      'SELECT SUM(total) as total FROM transactions WHERE type = "credit"'
    );
    const totalCollected = await db.get(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "payment"'
    );
    const custCount = await db.get(
      'SELECT COUNT(*) as count FROM customers'
    );

    res.json({
      totalDue: totalDue.total || 0,
      totalGiven: totalGiven.total || 0,
      totalCollected: totalCollected.total || 0,
      customerCount: custCount.count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/top-items', async (req, res) => {
  try {
    const result = await db.all(`
      SELECT 
        json_extract(item, '$.name') as name,
        json_extract(item, '$.pid') as pid,
        COUNT(*) as frequency,
        SUM(CAST(json_extract(item, '$.qty') AS REAL)) as totalQty,
        SUM(CAST(json_extract(item, '$.price') AS REAL) * CAST(json_extract(item, '$.qty') AS REAL)) as totalValue
      FROM transactions, json_each(items) as item
      WHERE type = 'credit'
      GROUP BY name
      ORDER BY totalQty DESC
      LIMIT 10
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// BULK SYNC ENDPOINT (for offline support)
// ═══════════════════════════════════════════════════════════
app.post('/api/sync', async (req, res) => {
  try {
    const { customers, products, transactions } = req.body;

    // Sync customers
    if (customers && Array.isArray(customers)) {
      for (const cust of customers) {
        const exists = await db.get('SELECT id FROM customers WHERE id = ?', cust.id);
        if (exists) {
          await db.run(
            `UPDATE customers SET name=?, phone=?, addr=?, cycle=?, "limit"=?, balance=?, dueDate=?, lastTx=? WHERE id = ?`,
            [cust.name, cust.phone, cust.addr, cust.cycle, cust.limit, cust.balance, cust.dueDate, cust.lastTx, cust.id]
          );
        } else {
          await db.run(
            `INSERT INTO customers (id, name, phone, addr, cycle, "limit", balance, initials, color, bg, joinDate, lastTx, dueDate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [cust.id, cust.name, cust.phone, cust.addr, cust.cycle, cust.limit, cust.balance, cust.initials, cust.color, cust.bg, cust.joinDate, cust.lastTx, cust.dueDate]
          );
        }
        
        // Ensure user account exists for login
        await db.run(
          'INSERT OR IGNORE INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
          [cust.id, cust.id, cust.id, cust.name, 'customer']
        );
      }
    }

    // Sync products
    if (products && Array.isArray(products)) {
      for (const prod of products) {
        const exists = await db.get('SELECT id FROM products WHERE id = ?', prod.id);
        if (exists) {
          await db.run(
            `UPDATE products SET name=?, emoji=?, price=?, unit=?, barcode=?, stock=? WHERE id = ?`,
            [prod.name, prod.emoji, prod.price, prod.unit, prod.barcode, prod.stock, prod.id]
          );
        } else {
          await db.run(
            `INSERT INTO products (id, name, emoji, price, unit, barcode, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [prod.id, prod.name, prod.emoji, prod.price, prod.unit, prod.barcode, prod.stock]
          );
        }
      }
    }

    // Sync transactions
    if (transactions && Array.isArray(transactions)) {
      for (const tx of transactions) {
        const exists = await db.get('SELECT id FROM transactions WHERE id = ?', tx.id);
        if (!exists) {
          await db.run(
            `INSERT INTO transactions (id, custId, type, items, amount, method, total, date, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tx.id, tx.custId, tx.type, JSON.stringify(tx.items || []), tx.amount, tx.method, tx.total, tx.date, tx.notes]
          );
        }
      }
    }

    res.json({ success: true, message: 'Sync completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// EXPORT / BACKUP ENDPOINTS
// ═══════════════════════════════════════════════════════════
app.get('/api/export/all', async (req, res) => {
  try {
    const customers = await db.all('SELECT * FROM customers');
    const products = await db.all('SELECT * FROM products');
    const transactions = await db.all('SELECT * FROM transactions');

    transactions.forEach(tx => {
      tx.items = JSON.parse(tx.items);
    });

    res.setHeader('Content-Disposition', 'attachment; filename="kaathabook-backup.json"');
    res.json({
      exportDate: new Date().toISOString(),
      customers,
      products,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export/customer/:custId', async (req, res) => {
  try {
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', req.params.custId);
    const transactions = await db.all('SELECT * FROM transactions WHERE custId = ? ORDER BY date DESC', req.params.custId);

    transactions.forEach(tx => {
      tx.items = JSON.parse(tx.items);
    });

    res.setHeader('Content-Disposition', `attachment; filename="${customer.name}-ledger.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      customer,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════
// STATIC FILES & SPA FALLBACK
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  // On Vercel, paths might be strange, so we ensure the file exists
  const indexPath = path.join(__dirname, 'kaathabook.html');
  res.sendFile(indexPath);
});

app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, 'customer.html'));
});

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.get('/api/reminders/sms/:custId', async (req, res) => {
  try {
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', req.params.custId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    
    const storeName = "KaathaBook Store"; 
    const message = `Namaste ${customer.name}, your outstanding balance at ${storeName} is ₹${customer.balance || 0}. Please clear it at your earliest. Thank you!`;
    const encodedMsg = encodeURIComponent(message);
    const smsUrl = `sms:${customer.phone}?body=${encodedMsg}`;
    
    res.json({ message, smsUrl, phone: customer.phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════
// Export app for Vercel
export default app;

async function startServer() {
  try {
    await initDB();
    // Only listen if not running as a Vercel function
    if (!IS_VERCEL) {
      server.listen(PORT, () => {
        console.log(`🚀 KaathaBook Backend running on http://localhost:${PORT}`);
        console.log(`📊 API available at http://localhost:${PORT}/api`);
        console.log(`💾 Database: kaathabook.db`);
      });
    } else {
      console.log('☁️ Running in Vercel Serverless environment');
    }
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    if (!IS_VERCEL) process.exit(1);
  }
}

startServer();
