# KaathaBook - Digital Udhaar Store for Inventory-Based Credit

The only item-level credit tracking app for kirana shops. Not just "Ramesh owes ₹500" — but "Ramesh took 2kg rice, 1L oil, 1 packet atta on March 12th." Modern retail analytics for traditional credit sales.

**This product does something no other katha app does:**
- **Item-by-item katha** - Every credit entry records exact products, quantities, prices (not just amounts).
- **Customer accountability** - Your customers get a persistent QR-linked account showing exactly what they owe and why.
- **Barcode-driven workflow** - Scan products to add to credit (the only app that works this way in India).
- **Inventory-driven analytics** - Know which products are your top kathaed items and when you'll run out.
- **Credit limit enforcement** - Set per-customer limits and prevent over-extension.
- **Live Sync** - Real-time updates across multiple devices using WebSockets.
- **Role-Based Security** - Secure login for Retailers and Customers.

---

## Features

✅ **Role-Based Login** - Secure authentication for Retailers (admin) and Customers (view-only ledger).  
✅ **Dashboard Quick Search** - Instantly find customers by name, phone, or ID from the home screen.  
✅ **Live Tracking (WebSockets)** - Real-time credit/payment updates across all connected devices.  
✅ **Barcode & QR Code Scanning** - Real-time product barcode scanning (ZXing.js) with instant credit entry.  
✅ **Item-Level Credit History** - Every transaction records product, quantity, price, date (not just amount).  
✅ **Customer Portal with QR** - Customer scans QR to see their running tab with full transaction history.  
✅ **Product Analytics** - Discover top kathaed items, predict stockouts, and spot demand patterns.  
✅ **Telugu & Regional Language** - Complete localization (200+ translations).  
✅ **Offline-First Architecture** - Works completely offline, auto-syncs when online.  
✅ **SMS Reminders** - Send itemized payment reminders with customer-specific balances.  
✅ **PWA Support** - Install as a native app on Android/iOS/Desktop.

---

## Quick Start (Frontend Only - No Backend)

1. **Open the App**: Simply open `kaathabook.html` in any modern browser.
2. **Install as PWA**: 
   - **Android**: Tap menu (⋮) → "Install app".
   - **iOS/Safari**: Tap Share → "Add to Home Screen".
   - **Desktop**: Click the install icon in the address bar.
3. **Usage**: Manage customers and products locally using your browser's storage.

---

## Setup with Backend (Multi-Device Sync)

### 1. Requirements
- **Node.js**: [Download and Install LTS](https://nodejs.org/)
- **SQLite3**: Automatically handled by the backend.

### 2. Installation
```bash
# Create project folder
mkdir kaathabook
cd kaathabook

# Ensure you have these files:
# kaathabook.html, customer.html, server.js, package.json, sw.js, manifest.json

# Install dependencies
npm install
```

### 3. Start the Server
```bash
npm start
```
*Expected Output:*
*`✅ Database initialized successfully`*
*`🟢 Server running at http://localhost:3000`*

### 4. Default Login Credentials
- **Role**: Retailer (Admin)
- **Username**: `retailer`
- **Password**: `admin123`

---

## Technical Details

- **Database**: SQLite (`kaathabook.db`)
- **Backend**: Node.js + Express + Socket.io
- **Frontend**: Vanilla JS (No heavy frameworks), HTML5, CSS3
- **Scanning**: ZXing.js for Barcodes / QRCode.js for Portals
- **PWA**: Service Worker (`sw.js`) for offline-first resilience

## File Structure

```
KaathaBook/
├── kaathabook.html       # Main Retailer Dashboard
├── customer.html         # Customer Ledger Portal
├── server.js             # Node.js Backend & API
├── sw.js                 # Service Worker for Offline/PWA
├── manifest.json         # PWA Launcher Config
├── kaathabook.db         # SQLite Database (Auto-created)
├── package.json          # Node.js Dependencies
└── README.md             # This Guide
```

---

## Deployment (Cloud)

You can easily deploy the backend to:
- **Railway.app** (Recommended for Node.js + SQLite)
- **Render.com**
- **DigitalOcean** or any VPS.

---

**Version**: 2.5 (Professional Edition)  
**Last Updated**: March 2026  
**Status**: Production Ready ✅
