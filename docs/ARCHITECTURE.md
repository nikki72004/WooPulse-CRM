# WooPulse CRM — System Architecture

## 1. Overview
WooPulse CRM is designed as a single-tenant e-commerce CRM decoupled from, but synchronized with, WooCommerce. It maintains strict demarcation between transactional data originating from WooCommerce (authoritative, read-only in CRM) and relational/operational data managed by store operators (read-write in CRM).

```
+------------------------+           +-------------------------+
|   WooCommerce Store    |           |       WooPulse CRM      |
|   (REST API v3)        |<--------->|  - Ingestion Engine     |
|   (Webhooks)           |--events-->|  - Webhook Receiver     |
+------------------------+           |  - Deduplication Queue  |
                                     |  - Rules & Segment Svc  |
                                     |  - Action Agent Console |
                                     +-------------------------+
                                                  |
                                                  v
                                     +-------------------------+
                                     |  Modern 3D React UI     |
                                     |  - ⌘K Command Palette   |
                                     |  - Interactive Drawers  |
                                     |  - Evidence Cards       |
                                     +-------------------------+
```

## 2. Ingestion & Dual-Source Data Model
- **WooCommerce Fields:** `wooCustomerId`, `wooOrderId`, total, lineItems, order dates, original customer addresses.
- **CRM Fields:** Notes, tasks, consent logs (`emailConsent`, `unsubscribedAt`), communication records, review queue for duplicates.
- **Idempotency Strategy:**
  1. Header check: `x-wc-webhook-delivery-id` logged to `WebhookEvent`. Duplicate deliveries are acknowledged with 200 OK without re-processing.
  2. Timestamp check: If incoming `date_modified <= stored.date_modified`, payload processing is skipped.

## 3. Webhook Security
- Every webhook payload received on `/api/webhooks/woocommerce` is validated via HMAC-SHA256:
  `crypto.createHmac('sha256', secret).update(rawBody).digest('base64')`
- Raw body is preserved using Express raw buffer middleware before JSON parsing.

## 4. Deduplication Logic
1. First-order match: `wooCustomerId`
2. Second-order match: Normalized email (`user.name+tag@domain.com` -> `user.name@domain.com` lowercase trimmed).
3. If emails or names conflict across distinct guest orders, the entry is pushed to the `DuplicateCandidate` queue for manual operator review (Merge or Dismiss).

## 5. Agent Console: Rules over Hallucination
Rather than an unstructured chatbot prone to hallucinating order statuses, the CRM Action Agent evaluates structured customer metrics against discrete rules:
- **Rule 1 (Inactive Customer):** Qualifying orders exist, but days since last order > 90. Suggests re-engagement discount email.
- **Rule 2 (Loyal High-Value / No Contact):** Qualifying order count >= 3 or total spend >= $500, but no interaction in 60 days. Suggests VIP care task.
- **Rule 3 (Overdue Follow-up):** Pending tasks past their due date. Generates urgency alert.
- **Rule 4 (First-time Buyer Onboarding):** Exact 1 qualifying order completed within past 7 days. Suggests onboarding welcome template.

Each recommendation produces an **Evidence Card** detailing exact facts and inferences.
