# WooPulse CRM — Customer Segment Rules

Segment calculation is dynamically evaluated in `server/src/config/segmentRules.js` and `server/src/modules/segments/segmentService.js`.

Segments are strictly computed and never manually overridden in the database, ensuring zero state desynchronization.

## 1. Qualifying Purchases
To avoid skewing customer lifetime value and activity thresholds, only the following WooCommerce order statuses qualify:
- `completed`
- `processing`

The following statuses are explicitly excluded from qualifying metrics:
- `cancelled`
- `failed`
- `refunded`
- `pending`
- `on-hold`
- `trash`

## 2. Default Segment Thresholds

| Segment | Criteria / Threshold | Strategic Intent |
|---|---|---|
| **VIP / Loyal** | `>= 3` qualifying orders **OR** lifetime qualifying spend `>= $500.00` | Retention, VIP perks, bespoke concierge outreach |
| **Active** | Last qualifying order `< 45 days` ago and `>= 1` qualifying order | Cross-sell, product recommendations |
| **New** | First qualifying order within past `30 days` and total orders `= 1` | Onboarding, satisfaction check, education |
| **At Risk** | Last qualifying order between `45` and `90 days` ago | Light check-in, review request, early win-back |
| **Inactive / Churned** | Last qualifying order `> 90 days` ago (or 0 qualifying orders with account created `> 90 days` ago) | Aggressive win-back promotions, re-engagement campaigns |

## 3. Financial Terminology Rules
- The CRM strictly labels monetary aggregates as **"Lifetime Order Value"** or **"Order Value"**, never "Revenue" or "Profit", because WooCommerce order totals include taxes, shipping fees, discounts, and do not account for cost of goods sold (COGS).
