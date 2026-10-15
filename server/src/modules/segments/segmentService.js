import { db } from '../../lib/db.js';
import { SEGMENT_RULES } from '../../config/segmentRules.js';
import { daysBetween } from '../../utils/helpers.js';

export const segmentService = {
  /**
   * Enriches a single customer with computed metrics & segment tag
   */
  enrichCustomer: (customer) => {
    if (!customer) return null;

    // Get all orders associated with this customer
    const allCustomerOrders = db.find('orders', o => 
      o.customerId === customer.id || 
      (o.billingEmail && o.billingEmail.toLowerCase() === customer.email?.toLowerCase())
    );

    // Filter qualifying orders
    const qualifyingOrders = allCustomerOrders.filter(o => 
      SEGMENT_RULES.QUALIFYING_STATUSES.includes(o.status?.toLowerCase())
    );

    // Sort descending by date
    qualifyingOrders.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

    const qualifyingOrderCount = qualifyingOrders.length;
    const lifetimeOrderValue = qualifyingOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const mostRecentOrder = qualifyingOrders[0] || null;
    const lastOrderDate = mostRecentOrder ? mostRecentOrder.dateCreated : null;
    const daysSinceLastOrder = lastOrderDate ? daysBetween(lastOrderDate) : null;
    const accountAgeDays = customer.createdAt ? daysBetween(customer.createdAt) : 0;

    // Compute segment
    let segment = 'Active';

    if (
      qualifyingOrderCount >= SEGMENT_RULES.THRESHOLDS.LOYAL_MIN_ORDERS || 
      lifetimeOrderValue >= SEGMENT_RULES.THRESHOLDS.LOYAL_MIN_SPEND
    ) {
      segment = 'Loyal';
    } else if (qualifyingOrderCount === 1 && accountAgeDays <= SEGMENT_RULES.THRESHOLDS.NEW_CUSTOMER_DAYS) {
      segment = 'New';
    } else if (daysSinceLastOrder !== null && daysSinceLastOrder > SEGMENT_RULES.THRESHOLDS.INACTIVE_DAYS) {
      segment = 'Inactive';
    } else if (
      daysSinceLastOrder !== null && 
      daysSinceLastOrder >= SEGMENT_RULES.THRESHOLDS.AT_RISK_MIN_DAYS && 
      daysSinceLastOrder <= SEGMENT_RULES.THRESHOLDS.AT_RISK_MAX_DAYS
    ) {
      segment = 'At Risk';
    } else if (qualifyingOrderCount === 0 && accountAgeDays > SEGMENT_RULES.THRESHOLDS.INACTIVE_DAYS) {
      segment = 'Inactive';
    } else if (qualifyingOrderCount === 0) {
      segment = 'New';
    } else {
      segment = 'Active';
    }

    return {
      ...customer,
      segment,
      qualifyingOrderCount,
      totalOrdersCount: allCustomerOrders.length,
      lifetimeOrderValue: parseFloat(lifetimeOrderValue.toFixed(2)),
      lastOrderDate,
      daysSinceLastOrder,
      recentOrders: allCustomerOrders.slice(0, 5),
    };
  },

  enrichAll: () => {
    const customers = db.get('customers');
    return customers.map(c => segmentService.enrichCustomer(c));
  },

  getSegmentCounts: () => {
    const enriched = segmentService.enrichAll();
    const counts = {
      Total: enriched.length,
      Loyal: 0,
      Active: 0,
      New: 0,
      'At Risk': 0,
      Inactive: 0,
    };
    enriched.forEach(c => {
      if (counts[c.segment] !== undefined) {
        counts[c.segment]++;
      }
    });
    return counts;
  }
};
