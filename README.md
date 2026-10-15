# WooPulse CRM — Intelligent WooCommerce Customer Relationship Management

WooPulse CRM is a next-generation, high-performance CRM built specifically for WooCommerce stores. It bridges the gap between raw e-commerce transaction data and actionable customer intelligence with an interactive **Action Console**, real-time webhook ingestion, automated customer segmentation, and direct email workflows.

![WooPulse CRM Brand](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80)

---

## 🌟 Key Features

1. **True Dual-Source Domain Model**:
   - **WooCommerce Fields (Read-Only):** Lifetime orders, WooCommerce customer ID, original billing/shipping addresses, purchase dates.
   - **CRM-Managed Fields (Editable):** Private notes, operational tasks, communication logs, email consent status (`opted_in` / `unsubscribed_at`), duplicate handling.

2. **Action Console (Rule-Driven CRM Agent)**:
   - Evaluates customer profiles against business logic (e.g. *Loyal No Contact > 60d*, *Inactive > 90d*, *Overdue Follow-Up*, *High Value First Purchase*).
   - Separates **Hard Facts** from **Inferences** via transparent **Evidence Cards**.
   - No black-box hallucinated chat: One-click actions to generate tasks or draft contextual email campaigns.

3. **Dynamic Customer Segmentation**:
   - Centralized rules engine in `server/src/config/segmentRules.js`.
   - Computed on-the-fly across the platform: **VIP / Loyal** (≥3 qualifying orders or spend threshold), **Active**, **New**, **At Risk**, **Inactive** (>90 days without purchase).
   - "Qualifying Purchase" strictly defined as `processing` or `completed` orders.

4. **Robust WooCommerce Sync & Webhooks**:
   - Incremental and full sync via WooCommerce REST API v3.
   - Webhook endpoint with HMAC-SHA256 signature verification (`x-wc-webhook-signature`).
   - Delivery idempotency tracking via `WebhookEvent` and timestamp comparison (`date_modified`).
   - Built-in Mock Store / Pre-populated Test Store mode for instant demo readiness without manual setup.

5. **Consent-Guarded Communications**:
   - Template engine with live variable previews (`{{firstName}}`, `{{totalSpend}}`, `{{lastOrderDate}}`).
   - Consent protection: Blocks email dispatch if customer has not opted in or has unsubscribed.
   - Full delivery status tracking (`DRAFT`, `ATTEMPTED`, `ACCEPTED`, `DELIVERED`, `FAILED`).

6. **Ultra-Modern, Immersive 3D UI**:
   - Built with React, Tailwind CSS, Lucide icons, glassmorphic surfaces, subtle 3D tilt & depth layers, and custom typography.
   - Global ⌘K Command Palette for lightning-fast customer, order, and page navigation.
   - Interactive slide-over drawers for order inspection and duplicate customer review queue.

---

## 🏗 Architecture & Tech Stack

```
WooPulse CRM/
├── client/                     # Vite + React 18, Tailwind CSS, Lucide, 3D Canvas/CSS
│   ├── src/
│   │   ├── components/         # Modern 3D & glassmorphic UI components
│   │   │   ├── layout/         # AppShell, Sidebar, Topbar, CommandSearch
│   │   │   ├── shared/         # EvidenceCard, SegmentBadge, StatCard, etc.
│   │   │   └── ui/             # Core primitives (buttons, modals, tabs, tables)
│   │   ├── pages/              # Dashboard, Customers, Orders, Comms, Insights, Agent, Settings
│   │   └── lib/                # API client, formatters, state hooks
├── server/                     # Node.js + Express API
│   ├── src/
│   │   ├── modules/            # Domain modules (auth, customers, orders, sync, agent, etc.)
│   │   ├── config/             # Environment & Segment Rules config
│   │   └── lib/                # Database layer, Woo client, Resend client
│   └── data/                   # File-backed persistence store
└── docs/                       # Architecture, Segment Rules, Demo Checklist
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "C:\Users\gauth\Desktop\WooPulse CRM"
npm run install:all
```

### 2. Configure Environment
Copy `.env.example` to `.env` in the `server` directory (or use default development settings):
```bash
cp .env.example server/.env
```

### 3. Run the App
Start both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

**Demo Admin Credentials:**
- Email: `admin@woopulse.local`
- Password: `admin` (or click "Quick Demo Login" on the login screen)

---

## 📋 Documentation
- [Architecture & Design Details](file:///docs/ARCHITECTURE.md)
- [Customer Segment Calculation Rules](file:///docs/SEGMENT_RULES.md)
- [Demo Readiness Checklist](file:///docs/DEMO_CHECKLIST.md)

---
© 2026 WooPulse CRM. Built with high precision for WooCommerce power merchants.
