/**
 * Nikki CRM Segment Configuration & Financial Terminology Rules
 * Centralized Single Source of Truth
 */

export const SEGMENT_RULES = {
  // Qualifying order statuses for lifetime metrics and segment evaluation
  QUALIFYING_STATUSES: ['processing', 'completed'],
  
  // Non-qualifying order statuses (strictly excluded from totals and frequency)
  EXCLUDED_STATUSES: ['cancelled', 'failed', 'refunded', 'pending', 'on-hold', 'trash'],

  // Segment Thresholds
  THRESHOLDS: {
    // Loyal / VIP: >= 3 qualifying orders OR lifetime spend >= $500.00
    LOYAL_MIN_ORDERS: 3,
    LOYAL_MIN_SPEND: 500.00,

    // Inactivity threshold: Days since last qualifying purchase
    INACTIVE_DAYS: 90,

    // At-Risk threshold window
    AT_RISK_MIN_DAYS: 45,
    AT_RISK_MAX_DAYS: 90,

    // Active threshold
    ACTIVE_MAX_DAYS: 45,

    // New customer window
    NEW_CUSTOMER_DAYS: 30,
  },

  // UI labels for financial amounts (never Revenue or Profit)
  TERMINOLOGY: {
    METRIC_LABEL: 'Lifetime Order Value',
    SINGLE_ORDER_LABEL: 'Order Value',
    DISCLAIMER: 'Amounts represent gross order values including taxes & discounts, excluding non-qualifying statuses.',
  }
};
