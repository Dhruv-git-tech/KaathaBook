# KaathaBook - Digital Udhaar Store for Inventory-Based Credit

The only item-level credit tracking app for kirana shops. Not just "Ramesh owes ₹500" — but "Ramesh took 2kg rice, 1L oil, 1 packet atta on March 12th." Modern retail analytics for traditional credit sales.

**This product does something no other katha app does:**
- **Item-by-item katha** - Every credit entry records exact products, quantities, prices (not just amounts)
- **Customer accountability** - Your customers get a persistent QR-linked account showing exactly what they owe and why
- **Barcode-driven workflow** - Scan products to add to credit (the only app that works this way in India)
- **Inventory-driven analytics** - Know which products are your top kathaed items and when you'll run out
- **Credit limit enforcement** - Set per-customer limits and prevent over-extension
- **Works offline** - Perfect credit tracking even on 2G networks or no internet

**Why this matters:** Khatabook solves "how much is owed." KaathaBook solves "what is owed, when, and with proof."

---

## Features

✅ **Barcode & QR Code Scanning** - Real-time product barcode scanning (ZXing.js) with instant credit entry  
✅ **Item-Level Credit History** - Every transaction records product, quantity, price, date (not just amount)  
✅ **Customer Portal with QR** - Customer scans QR to see their running tab with full transaction history  
✅ **Product Analytics** - Discover top kathaed items, predict stockouts, spot demand patterns  
✅ **Credit Limit Enforcement** - Set per-customer limits, require override reason for exceptions  
✅ **Telugu & Regional Language** - Complete localization (200+ translations)  
✅ **Offline-First Architecture** - Works completely offline, auto-syncs when online (no Khatabook cloud required)  
✅ **WhatsApp Integration** - Send itemized payment reminders via WhatsApp (not generic SMS)  
✅ **PWA & Installation** - Install as native app on Android/iOS/Desktop  
✅ **Real-Time Dashboard** - Today's sales by product, customer spending patterns, pending balances  
✅ **Multi-Device Sync** - Optional backend for syncing data across devices/shopkeeper + assistant  

---

## Why KaathaBook, Not Khatabook

| Feature | Khatabook | KaathaBook |
|---------|-----------|-----------|
| **What gets recorded** | Amount ("₹500 given") | Items ("2kg rice, 1L oil @ ₹65 each") |
| **How you enter credit** | Manual amount input | Barcode scan (faster, no math errors) |
| **Customer experience** | Gets a WhatsApp link | Gets persistent QR-linked account |
| **Can customer see their account?** | No (just SMS reminders) | Yes, anytime with QR code |
| **Credit limit per customer** | ❌ Not available | ✅ Built-in |
| **Analytics** | Money flow only | **Product demand + inventory forecast** |
| **Inventory tracking** | ❌ Not available | ✅ Real-time from katha |
| **Offline first** | Cloud-only | ✅ Works on 2G/no internet |
| **Differentiation** | Generic ledger | **Udhaar store workflow** |

---

## Quick Start (Frontend Only - No Backend)

### 1. Download the App
```bash
# Download kathabook.html to any location
# Right-click on file → Open with Browser
```

### 2. Install as PWA (Optional)
- **Android**: Tap menu (⋮) → "Install app"
- **iOS/Safari**: Tap Share → "Add to Home Screen"
- **Desktop/Chrome**: Click address bar → Install icon

### 3. Start Your Udhaar Store
- **Dashboard**: View today's sales by product + customer spending
- **Add Customers**: Set credit limits for each customer
- **Add Products**: Add your kirana inventory with barcodes
- **Scan & Sell**: Barcode scan products to add to customer credit instantly
- **Customer Portal**: Share QR code with customers; they see their account anytime
- **Analytics**: Spot which items are moving most as credit (your real demand signal)

---

## Setup with Backend (Multi-Device Sync)

You run the backend so data syncs across shopkeeper + assistant devices without relying on Khatabook's servers.

### Step 1: Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (recommended)
- Run installer, click "Next" until done

### Step 2: Download Project Files
```bash
mkdir kathabook
cd kathabook
# Place these files here:
# - kathabook.html
# - server.js
# - package.json
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Backend Server
```bash
npm start
```
Expected output:
```
✅ Database initialized
🟢 Server running on http://localhost:3000
```

### Step 5: Open Frontend
- **Local machine**: `http://localhost:3000`
- **Mobile on same WiFi**: `http://192.168.1.100:3000` (use your computer's IP)

### Step 6: Test Multi-Device Sync
- Add a customer on one device
- Refresh on another device
- Should see the same customer (synced via backend)

---

## The Differentiation: Item-Level Katha

### Traditional Katha (Khatabook approach)
```
Shopkeeper: "Ramesh, you owe ₹1240"
Ramesh: "I just took ₹500 worth of rice last week"
Shopkeeper: "No no, you took ₹1240 worth over two weeks"
→ Dispute. Loss of trust.
```

### Item-Level Katha (KaathaBook approach)
```
Shopkeeper scans: 2kg rice (₹130) → 1L oil (₹185) → 1 atta (₹210) = ₹525 on March 10
Shopkeeper scans: 1kg sugar (₹44) → 1 salt (₹18) = ₹62 on March 12
Total: ₹587

Customer sees via QR: "I owe ₹587: rice ₹130 (March 10), oil ₹185 (March 10), atta ₹210 (March 10), sugar ₹44 (March 12), salt ₹18 (March 12)"
→ Ramesh says "Yes, that's right. I'll pay by March 20"
→ Accountability. Trust. No disputes.
```

**This is why item-level tracking builds business.**

---

## The Product Moat: Smart Analytics

Because you track items (not just amounts), you unlock insights Khatabook can never offer:

### 1. Demand Forecasting
```
"Rice is your #1 kathaed item (₹8,450 in March)
You sold 280kg from inventory, 32kg on credit.
At this pace, you'll stockout by March 28."
→ Time to reorder
```

### 2. Customer Segmentation
```
Ramesh spends ₹500/week on rice (consistent).
Priya buys oil (₹300) every 2 weeks + atta (₹400) weekly.
→ Set smart credit limits based on buying patterns
```

### 3. Product Profitability
```
Rice: 12% of katha volume, 8% of your margin (low-margin item)
Organic atta: 4% of volume, 18% of margin (high-margin item)
→ Consider stocking more organic items or negotiating better rates on rice
```

### 4. Churn Prediction
```
Priya hasn't appeared in 14 days (usually visits weekly).
Her pending balance is ₹450 (highest in months).
→ Send focused payment reminder (not blast SMS to everyone)
```

**Khatabook shows you money flow. KaathaBook shows you your business.**

---

## Customer Experience: The QR Account

Your customer (Ramesh) can open the account anytime without WhatsApp:

**Customer Portal Features:**
- ✅ Running tab by transaction date
- ✅ Item breakdown per transaction (not just "₹500")
- ✅ Outstanding balance highlighted
- ✅ Payment history with dates
- ✅ Dispute resolution (customer can point to specific transaction)
- ✅ No WhatsApp link required (permanent, shareable QR)
- ✅ Works offline (cached view of last sync)

**Khatabook's customer experience:** Payment reminder SMS (one-way).  
**KaathaBook's customer experience:** Persistent account portal (two-way accountability).

---

## Backend API Endpoints

All endpoints use JSON and are designed for item-level katha:

### Customers
- `GET /api/customers` - Get all customers with running balances
- `POST /api/customers` - Add customer (with credit limit)
- `PUT /api/customers/:id` - Update customer info/limit
- `DELETE /api/customers/:id` - Remove customer

### Products
- `GET /api/products` - Get inventory catalog
- `POST /api/products` - Add product (emoji, barcode, price)
- `PUT /api/products/:id` - Update product

### Transactions
- `GET /api/transactions` - Full transaction history (item-level)
- `POST /api/transactions` - Record transaction
- `GET /api/analytics/top-items` - Most kathaed products

### Analytics (The Differentiator)
- `GET /api/analytics/summary` - Dashboard (daily sales by product, top customers)
- `GET /api/analytics/forecast` - Inventory forecast (predicted stockouts)
- `GET /api/analytics/customer/:id` - Customer buying pattern analysis

### Sync & Export
- `POST /api/sync` - Bulk sync from offline
- `GET /api/export/all` - Full backup (with items)
- `GET /api/export/customer/:id` - Customer ledger (itemized)

---

## Offline-First Sync Model

```
Device 1 (Shopkeeper): Adds transaction → Saves to localStorage (instant)
                                        ↓
                                   Syncs to backend (if online)
                                        ↓
Device 2 (Assistant): Loads backend data on startup
                     Same transaction appears (no delay)

If offline: Both devices work perfectly offline.
When online: Auto-sync to backend (no user action).
```

**Result:** Multi-device sync without cloud dependency.

---

## Deployment

### Option 1: On Your Computer (Self-Hosted)
```bash
npm start
# Backend runs on your machine
# Access via http://192.168.1.100:3000 on any device
# Works as long as your computer is on
```

### Option 2: Free Cloud - Railway/Render
- 5-minute setup
- URL like `yourstore.railway.app`
- Works from anywhere (not just home WiFi)
- No credit card required

### Option 3: Paid Hosting
- DigitalOcean ($5/month)
- AWS Lightsail ($3.50/month)
- VPS with better uptime SLA

**Recommendation:** Start with Railway (free), move to self-hosted when you need 24/7 uptime.

---

## Technical Stack

**Why this stack for a kirana shop:**
- **Vanilla JavaScript** - No frameworks = 100KB total size, works on old phones
- **SQLite** - File-based, zero infrastructure, perfect for small business
- **Node.js** - Lightweight, runs on Raspberry Pi or cheap VPS
- **Offline-first** - Works on 2G/no internet (India's reality)

**What you're NOT paying for:**
- ❌ Cloud infrastructure costs (like Khatabook)
- ❌ SMS/WhatsApp API fees (built-in integration)
- ❌ Monthly subscription (you own your data)

---

## File Structure

```
kathabook/
├── kathabook.html         # Frontend app (open in browser)
├── customer.html          # Customer QR-linked portal
├── server.js              # Backend API (run with npm start)
├── package.json           # Node.js dependencies
├── manifest.json          # PWA configuration
├── sw.js                  # Service worker (offline support)
├── kathabook.db           # SQLite database (auto-created)
└── README.md              # This file
```

---

## Migration from Khatabook

If you're switching from Khatabook:

1. **Export your data** from Khatabook → CSV
2. **Import into KaathaBook** → Use `/api/sync` endpoint
3. **Verify** customer balances match
4. **Run both systems in parallel** for 1 week
5. **Inform customers** of new QR code for account access

---

## FAQ

**Q: Do I need the backend?**  
A: No. The app works 100% offline with localStorage. Backend is only needed if you want to sync across multiple devices (shopkeeper + assistant).

**Q: Can customers edit their history?**  
A: No. Transactions are append-only (like a blockchain ledger). Prevents fraud, builds trust.

**Q: What happens if I lose my phone?**  
A: If you have backend running: Data is on the database, upload to new phone.  
If offline-only: Backup by exporting `/api/export/all` regularly.

**Q: Can multiple shops use the same backend?**  
A: Not yet. Current schema is single-shop. Future version will support multi-shop with role-based access.

**Q: How do I integrate SMS payment reminders?**  
A: API is ready (`/api/customers/:id`). Just connect Twilio or FastAPI SMS to send itemized reminders.

---

## Getting Started Checklist

- [ ] Download `kathabook.html`
- [ ] Open in browser (or install as PWA)
- [ ] Add first customer (set credit limit)
- [ ] Add products (barcode optional but recommended)
- [ ] Record 3 transactions (use barcode scan)
- [ ] Share customer QR code, customer checks their account
- [ ] (Optional) Run backend for multi-device sync
- [ ] (Optional) Deploy to Railway for remote access

---

## Support

For issues or feature requests:
- Check `F12` → Console for error messages
- Check backend logs if using API
- Enable debug: `localStorage.setItem('kb_debug', 'true')`

---

**Version**: 2.0 (Digital Udhaar Store Edition)  
**Status**: Production Ready ✅  
**Last Updated**: March 2026

### Frontend (Runs Anywhere)
- Any modern browser: Chrome, Firefox, Safari, Edge
- Works on: Android, iOS, iPad, Desktop, Laptop
- No installation required - just open `kathabook.html` in a browser

### Backend (Optional - For Multi-Device Sync)
- **Node.js 16+** ([Download](https://nodejs.org/))
- **Minimum RAM**: 256MB (runs smoothly on Raspberry Pi Zero)
- **Disk Space**: ~10MB (database grows with usage)
- **Operating System**: Windows, Mac, or Linux

---

## Quick Start (Frontend Only - No Backend)

### 1. Download the App
```bash
# Download kathabook.html to any location
# Right-click on file → Open with Browser
```

### 2. Install as PWA (Optional)
- **Android**: Tap menu (⋮) → "Install app"
- **iOS/Safari**: Tap Share → "Add to Home Screen"
- **Desktop/Chrome**: Click address bar → Install icon

### 3. Start Using
- Tap "Dashboard" to view overview
- Tap "Customers" to add/manage customers
- Tap "Scan" to record purchases with barcode
- Tap "Products" to manage inventory
- Tap "Analytics" to view insights

---

## Setup with Backend (Multi-Device Sync)

### Step 1: Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (recommended)
- Run installer, click "Next" until done

### Step 2: Download Project Files
```bash
# Create folder
mkdir kathabook
cd kathabook

# Inside folder, you need:
# - kathabook.html (frontend)
# - server.js (backend)
# - package.json (dependencies list)
```

### Step 3: Install Dependencies (One-time)
```bash
npm install
```

### Step 4: Start Backend Server
```bash
npm start
```
Expected output:
```
✅ Database initialized
🟢 Server running on http://localhost:3000
```

### Step 5: Open Frontend
- **Chrome/Firefox**: Go to `http://localhost:3000`
- **Android/Mobile**: Go to `http://[YOUR-COMPUTER-IP]:3000` (e.g., `http://192.168.1.100:3000`)

### Step 6: Test Connection
- Add a customer on any device
- Refresh browser on another device
- New customer should appear (synced via backend)

---

## Backend API Endpoints

The backend provides these REST endpoints (all use JSON):

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Remove customer

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Remove product

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Record transaction
- `GET /api/analytics/summary` - Dashboard stats

### Sync & Export
- `POST /api/sync` - Bulk sync from offline (customers/products/transactions)
- `GET /api/export/all` - Export full database as JSON
- `GET /api/export/customer/:id` - Export customer ledger

---

## Offline-First Sync Explained

### How It Works

```
Local Storage (Always Primary)
         ↓
[Add Product/Customer/Payment]
         ↓
   Saved Immediately ✅ (Even if offline)
         ↓
   If Online → Auto-sync to Backend (silent)
   If Offline → Waits, syncs when connection returns
```

### User Perspective
- **All data writes happen instantly** (no waiting)
- **Offline mode**: Works 100% on device (localStorage)
- **Online mode**: Automatically backs up to backend
- **Switching devices**: Backend data loads on startup
- **No internet**: App still fully functional

---

## Configuration

### Changing Backend Address (Advanced)
Frontend auto-detects `http://localhost:3000` for local networks.

To use remote server:
```javascript
// Open .html in browser, then in Developer Console (F12)
localStorage.setItem('kb_api_base', 'https://your-server.com');
location.reload();
```

### Database Location
- Runs in: Same folder as `server.js`
- File name: `kathabook.db` (auto-created)
- Backup: Copy `kathabook.db` file to another location

---

## Deployment (Cloud Hosting)

### Option 1: Free Hosting - Railway.app

1. Sign up at [railway.app](https://railway.app/)
2. Create new project → Deploy from GitHub
3. Connect `server.js` repository
4. Set environment: `NODE_ENV=production`
5. Get URL: `yourdomain.railway.app`
6. Update frontend: `localStorage.setItem('kb_api_base', 'https://yourdomain.railway.app')`

### Option 2: Free Hosting - Render

1. Sign up at [render.com](https://render.com/)
2. Create new Web Service
3. Connect GitHub repo with `server.js`
4. Deploy - get URL automatically
5. Update frontend with new backend URL

### Option 3: Self-Host (Your Computer)

```bash
# Keep terminal open
npm start

# Access from mobile: http://[YOUR-IP]:3000
# (Find IP: Windows cmd → `ipconfig`, look for IPv4)
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
npm start

# If error "EADDRINUSE", try:
npm start -- --port 3001
```

### Can't Connect from Mobile
- Check both devices are on same WiFi
- Find computer IP: `ipconfig` (search "IPv4 Address")
- On mobile: `http://192.168.1.100:3000` (replace with your IP)

### Missing Data on Backend
- Check browser localStorage still has data (DevTools → Application → Storage)
- Manually sync: Open app → goes online → auto-syncs
- Check backend logs for errors

### Database Corrupt
```bash
# Backup old one
mv kathabook.db kathabook.db.backup

# Delete and restart (creates fresh)
npm start
```

---

## Data Structure

### Customer
```json
{
  "id": "KB-10001",
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "addr": "MG Road, Hyderabad",
  "cycle": "Monthly",
  "limit": 2000,
  "balance": 1240,
  "initials": "RK",
  "color": "#3B4DB8",
  "bg": "#EEF0FD"
}
```

### Product
```json
{
  "id": "P001",
  "name": "Basmati Rice 1kg",
  "emoji": "🍚",
  "price": 65,
  "unit": "kg",
  "barcode": "8901234001001",
  "stock": 120
}
```

### Transaction
```json
{
  "id": "TX001",
  "custId": "KB-10001",
  "type": "credit",
  "items": [
    {"pid": "P001", "name": "Basmati Rice", "qty": 2, "price": 65}
  ],
  "total": 318,
  "date": "2024-03-12",
  "notes": "Weekly ration"
}
```

---

## Performance Optimization

### On Slow Internet
- Compression enabled: All responses are gzipped (~70% smaller)
- Lazy load: Backend data only fetches on demand
- Batch operations: Use `/api/sync` for bulk updates

### On Low-End Devices
- No frameworks: Vanilla JS runs on any browser
- SQLite: Lightweight DB engine
- Service Worker: Offline pages cached locally
- Progressive enhancement: Works with JavaScript off

---

## Backup & Migration

### Export All Data
```bash
# Via API
curl http://localhost:3000/api/export/all > backup.json

# Or in app: Analytics → Export All (via browser)
```

### Import Data
```bash
# To new backend
POST /api/sync with customers/products/transactions arrays
```

### Migrate to New Device
1. Export from old: `curl http://localhost:3000/api/export/all`
2. Install new backend
3. Manually import via `/api/sync` endpoint

---

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "localhost refused" | Make sure `npm start` is running in another terminal |
| Mobile can't reach backend | Use computer IP instead of localhost |
| Data not syncing | Check DevTools Console for errors (F12) |
| Barcode scanner not working | Camera permission needed - allow in browser settings |

### Enable Debug Logs
```javascript
// In browser console (F12 → Console)
localStorage.setItem('kb_debug', 'true');
location.reload();
```

### Report Issues
Check browser console (F12 → Console) for error messages, include in report.

---

## File Structure

```
kathabook/
├── kathabook.html         # Frontend app (open in browser)
├── customer.html          # Customer view page
├── manifest.json          # PWA configuration
├── sw.js                  # Service worker (offline mode)
├── server.js              # Backend API (run with npm start)
├── package.json           # Dependencies config
├── kathabook.db           # Database (auto-created)
└── README.md              # This file
```

---

## License & Credits

Built with modern web standards for offline-first shopkeepers.
Technologies: HTML5, CSS3, Vanilla JavaScript, Node.js, SQLite, ZXing.js

---

## Getting Started Checklist

- [ ] Download `kathabook.html`
- [ ] Open in browser
- [ ] Add first customer
- [ ] Add some products
- [ ] Record a transaction
- [ ] (Optional) Install backend for multi-device sync
- [ ] (Optional) Deploy to cloud for remote access

---

**Last Updated**: March 2024  
**Version**: 2.0 (with Backend)  
**Status**: Production Ready ✅
