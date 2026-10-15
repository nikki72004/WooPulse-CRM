# WooPulse CRM — Demo Readiness Checklist

This manual verification checklist ensures the system is operating at 100% fidelity before presenting to stakeholders or clients.

---

### Step 1: Authentication & App Shell
- [ ] Login screen loads with clean 3D ambient glow and branded typography.
- [ ] Admin login accepts credentials (`admin@woopulse.local` / `admin`).
- [ ] "Quick Demo Login" button authenticates seamlessly.
- [ ] Topbar displays current connected store status badge ("Connected Store: Demo Boutique").
- [ ] Global ⌘K (or Ctrl+K) Command Search opens, searches across customers and orders, and navigates with arrow keys.
- [ ] Sidebar collapses smoothly between expanded and compact icon-only mode.

### Step 2: Dashboard & Real-Time Metrics
- [ ] 4 Hero Stat Cards display:
  - Total Customers
  - Active Orders
  - Qualifying Order Value (Formatted in store currency, e.g. `$14,892.40`)
  - Attention Required (Inactive accounts + Overdue tasks)
- [ ] Orders Over Time trend chart renders smoothly with hover tooltips.
- [ ] Needs Attention panel flags overdue tasks and at-risk/inactive customers with direct action buttons.
- [ ] "Sync Now" button triggers an incremental sync and updates the sync indicator pill.

### Step 3: Customers & Dual-Source Profile
- [ ] Customer directory displays segment badges (VIP, Active, New, At Risk, Inactive).
- [ ] Clicking a customer opens `/customers/:id` with:
  - Read-only locked indicators on WooCommerce source fields (ID, date registered, total lifetime orders).
  - Editable CRM fields (Private Notes, Assigned Tasks, Email Consent toggle).
  - Detailed Order History tab.
  - Interactive Activity & Interaction Timeline.
- [ ] Adding a note updates the timeline immediately.
- [ ] Creating a task assigns a due date and reflects on the task management view.

### Step 4: Duplicate Customer Review Queue
- [ ] Navigate to `/customers/duplicates`.
- [ ] Inspect detected duplicate candidates (e.g. matching normalized email across guest and registered account).
- [ ] Review differences, test "Merge" and "Dismiss" actions.

### Step 5: Orders Directory & Inspector
- [ ] Orders table displays status badges (`completed`, `processing`, `cancelled`, `refunded`).
- [ ] Click an order row to open the slide-over inspection drawer.
- [ ] Drawer shows itemized product list, customer contact, delivery address, and whether the order is classified as "Qualifying".

### Step 6: Communications & Consent Guard
- [ ] Go to `/communications` -> Compose tab.
- [ ] Select customer with Email Consent = Active: template auto-populates placeholders (`{{firstName}}`, `{{totalSpend}}`).
- [ ] Select customer with Email Consent = Blocked / Unsubscribed: red warning banner disables dispatch and explains legal compliance block.
- [ ] Send email preview: records communication in History tab with status `DELIVERED`.

### Step 7: Action Console (CRM Agent)
- [ ] Go to `/agent`.
- [ ] Select an inactive customer or click a recommended alert.
- [ ] Inspect the **Evidence Card**: verifies facts (order counts, days inactive) vs inferences.
- [ ] Click "Prepare Draft" or "Create Task" -> observe automated creation of corresponding task/draft without hallucination.

### Step 8: Settings & Webhook Simulation
- [ ] Inspect WooCommerce REST connection settings & API test status.
- [ ] Review Webhooks log tab.
- [ ] Click "Simulate Incoming Webhook" to test real-time HMAC validation and idempotent processing.
